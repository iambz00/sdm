-- [Organizations]

-- Calculate path on UPDATE - self
CREATE OR REPLACE FUNCTION fn_maintain_org_path()
RETURNS TRIGGER AS $$
DECLARE
    v_parent_path LTREE;
BEGIN
    IF NEW.parent_code IS NULL THEN
        NEW.path := NEW.code::LTREE;
    ELSE
        SELECT path FROM organizations WHERE code = NEW.parent_code INTO v_parent_path;
        IF v_parent_path IS NULL THEN
            RAISE EXCEPTION 'Parent organization % does not exist', NEW.parent_code;
        END IF;
        NEW.path := v_parent_path || NEW.code::LTREE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER trg_organizations_path_before
    BEFORE INSERT OR UPDATE OF code, parent_code ON organizations
    FOR EACH ROW EXECUTE FUNCTION fn_maintain_org_path();

-- Calculate path on UPDATE - children
CREATE OR REPLACE FUNCTION fn_propagate_org_path()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.path IS DISTINCT FROM NEW.path THEN
        UPDATE organizations
        SET path = NEW.path || SUBPATH(path, NLEVEL(OLD.path))
        WHERE path <@ OLD.path AND code <> OLD.code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER trg_organizations_path_after
    AFTER UPDATE OF path ON organizations
    FOR EACH ROW EXECUTE FUNCTION fn_propagate_org_path();



-- =================================================================================
-- RLS 및 보안 함수
-- =================================================================================

-- CREATE OR REPLACE FUNCTION get_organization_path(organization_code TEXT)
-- RETURNS LTREE AS $$
--   SELECT path FROM organizations WHERE code = organization_code;
-- $$ LANGUAGE SQL;

-- Get org code of current user
CREATE OR REPLACE FUNCTION get_my_organization_code()
RETURNS LTREE AS $$
  SELECT organization_code FROM profiles WHERE id = AUTH.UID();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get org path of current user
CREATE OR REPLACE FUNCTION get_my_organization_path()
RETURNS LTREE AS $$
  SELECT path FROM organizations 
  WHERE code = get_my_organization_code();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get role of current user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = AUTH.UID();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 승인 여부 확인 함수
CREATE OR REPLACE FUNCTION is_approved()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = AUTH.UID() AND approval_status = 'APPROVED'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;


-- Device 업데이트 시 이력 생성
CREATE OR REPLACE FUNCTION trg_process_device_log()
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
            OLD.id, OLD.revision, 'UPDATE', current_user_id,
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
            OLD.id, OLD.revision, 'DELETE', current_user_id,
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
CREATE TRIGGER trg_devices_log
BEFORE UPDATE OR DELETE ON devices
FOR EACH ROW EXECUTE FUNCTION trg_process_device_log();


-- 트리거를 위한 함수 생성 (security definer를 사용해 권한 부여)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, name, organization_code, task, approval_status)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'organization_code',
    NEW.raw_user_meta_data->>'task',
    'PENDING'
  );
  RETURN NEW;
END;
$$;

-- auth.users 테이블에 insert 발생 시 위 함수를 실행하는 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
