-- 기존 뷰 삭제
DROP MATERIALIZED VIEW IF EXISTS mv_device_statistics;

-- 1. [개선] 기기 통계 + 조직 경로(Path) 포함 MView 생성
CREATE MATERIALIZED VIEW mv_device_statistics AS
SELECT 
    d.organization_code,
    o.path_string,          -- [핵심] 조인 없이 즉시 하위 검색을 위한 경로 문자열 포함
    d.status_code,
    d.distribution_id,
    d.model_id,
    COUNT(d.id) AS device_count
FROM 
    devices d
JOIN 
    organizations o ON d.organization_code = o.code
GROUP BY 
    d.organization_code,
    o.path_string,          -- GROUP BY에 추가
    d.status_code,
    d.distribution_id,
    d.model_id;

-- =========================================================================
-- 2. Materialized View용 인덱스 생성 (중요)
-- =========================================================================


-- [필수] REFRESH CONCURRENTLY를 위한 Unique 인덱스
CREATE UNIQUE INDEX idx_mv_device_stats_unique 
ON mv_device_statistics (
    organization_code, 
    path_string, 
    status_code, 
    distribution_id, 
    model_id
);

-- =========================================================================
-- [핵심 최적화] 하위 조직 통계 초고속 검색을 위한 텍스트 패턴 인덱스
-- 예: 서울/강남 교육청(SEOUL/GANGNAM/%) 하위 통계를 0.0x 초 만에 조회
-- =========================================================================
CREATE INDEX idx_mv_device_stats_path_ops 
ON mv_device_statistics (path_string TEXT_PATTERN_OPS);

-- (선택) 특정 조건(예: 소속 학교만 검색, 특정 상태만 검색)으로 필터링 시 성능 향상을 위한 단일 인덱스
CREATE INDEX idx_mv_device_stats_org ON mv_device_statistics (organization_code);
CREATE INDEX idx_mv_device_stats_status ON mv_device_statistics (status_code);
CREATE INDEX idx_mv_device_stats_dist ON mv_device_statistics (distribution_id);


-- 3. Materialized View 갱신용 Postgres 함수 생성
CREATE OR REPLACE FUNCTION refresh_device_statistics()
RETURNS VOID AS $$
BEGIN
    -- CONCURRENTLY 옵션을 사용하여 갱신 중에도 SELECT 조회가 가능하도록 Lock을 방지합니다.
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_device_statistics;
END;
$$ LANGUAGE PLPGSQL;


-- 4. 매일 자정(00:00)에 통계 뷰를 자동 갱신하는 Cron Job 등록
-- cron.schedule('작업명', '크론식', '실행할 쿼리')
SELECT cron.schedule(
    'daily-device-stats-refresh',   -- 고유한 스케줄 이름
    '0 0 * * *',                    -- 매일 자정 (분 시 일 월 요일)
    'SELECT refresh_device_statistics();' -- 실행할 함수
);

/*
-- (참고) 만약 등록된 스케줄을 삭제하거나 확인하고 싶을 때 사용하는 명령어
-- 등록된 크론 잡 확인
SELECT * FROM cron.job;

-- 특정 크론 잡 삭제
SELECT cron.unschedule('daily-device-stats-refresh');
*/

/*
프론트엔드/관리자 대시보드 활용 방법
이제 프론트엔드나 백엔드에서 30만 대의 원본 devices 테이블을 무겁게 COUNT() 할 필요 없이, 아래처럼 가볍게 뷰를 조회하시면 됩니다.
*/
-- 예: '특정 교육지원청(ORG_EDU_01)' 산하 모든 기기의 상태별 수량 확인
/*
SELECT status_code, SUM(device_count) as total_count
FROM mv_device_statistics
WHERE organization_code = 'ORG_EDU_01'
GROUP BY status_code;
 */

-- =================================================================================
-- devices 업데이트 시 log 자동 생성

-- 트리거 함수 정의
CREATE OR REPLACE FUNCTION trg_process_device_history()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Supabase 환경: 현재 요청을 보낸 유저의 UUID를 가져옴 (Service Role이나 DB 직접 접속 시에는 NULL이 됨)
    current_user_id := AUTH.UID();

    IF (TG_OP = 'UPDATE') THEN
        -- 의미 없는 업데이트(값 변경 없음)는 스킵
        IF OLD IS NOT DISTINCT FROM NEW THEN
            RETURN NEW;
        END IF;

        -- [메인 테이블 갱신] 리비전 증가, 시간 갱신, 수정한 유저 갱신
        NEW.revision := OLD.revision + 1;
        NEW.updated_at := NOW();
        NEW.updated_by := current_user_id; 

        -- [로그 테이블 저장] 이전 상태를 그대로 복사 + 이 행위를 한 유저(action_by) 기록
        INSERT INTO devices_log (
            device_id, revision, action_type, action_by,
            serial_number, mac_address, asset_number, model_id, distribution_id, 
            organization_code, status_code, room_id, metadata, 
            created_by, updated_by, created_at, updated_at
        ) VALUES (
            OLD.id, OLD.revision, 'U', current_user_id,
            OLD.serial_number, OLD.mac_address, OLD.asset_number, OLD.model_id, OLD.distribution_id, 
            OLD.organization_code, OLD.status_code, OLD.room_id, OLD.metadata, 
            OLD.created_by, OLD.updated_by, OLD.created_at, OLD.updated_at
        );
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        -- [로그 테이블 저장] 삭제되기 직전의 상태 복사 + 삭제를 수행한 유저(action_by) 기록
        INSERT INTO devices_log (
            device_id, revision, action_type, action_by,
            serial_number, mac_address, asset_number, model_id, distribution_id, 
            organization_code, status_code, room_id, metadata, 
            created_by, updated_by, created_at, updated_at
        ) VALUES (
            OLD.id, OLD.revision, 'D', current_user_id,
            OLD.serial_number, OLD.mac_address, OLD.asset_number, OLD.model_id, OLD.distribution_id, 
            OLD.organization_code, OLD.status_code, OLD.room_id, OLD.metadata, 
            OLD.created_by, OLD.updated_by, OLD.created_at, OLD.updated_at
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE PLPGSQL;

-- 트리거 부착 (BEFORE 이벤트)
CREATE TRIGGER trg_devices_history
BEFORE UPDATE OR DELETE ON devices
FOR EACH ROW EXECUTE FUNCTION trg_process_device_history();


-- 트리거를 위한 함수 생성 (security definer를 사용해 권한 부여)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, organization_code, task, approval_status)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'organization_code',
    new.raw_user_meta_data->>'task',
    'PENDING'
  );
  return new;
end;
$$;

-- auth.users 테이블에 insert 발생 시 위 함수를 실행하는 트리거 생성
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
