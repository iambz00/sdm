
-- =================================================================================
-- 뷰 / 함수
-- =================================================================================

-- 기기 통계용
DROP VIEW IF EXISTS device_stats;
CREATE VIEW device_stats AS
SELECT organization_code, status_code, model_id, distribution_id, COUNT(*) AS count
FROM devices
GROUP BY organization_code, status_code, model_id, distribution_id
ORDER BY organization_code, status_code, model_id, distribution_id;


DROP FUNCTION IF EXISTS  get_device_subtotals;
CREATE OR REPLACE FUNCTION get_device_subtotals(
    p_group_org BOOLEAN DEFAULT FALSE,
    p_group_status BOOLEAN DEFAULT FALSE,
    p_group_model BOOLEAN DEFAULT FALSE,
    p_group_dist BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    organization_code TEXT,
    status_code TEXT,
    model_id BIGINT,
    distribution_id BIGINT,
    count BIGINT
) 
LANGUAGE PLPGSQL
AS $$
DECLARE
    v_select_cols TEXT[];
    v_group_cols TEXT[];
    v_sql TEXT;
BEGIN
    -- 1. 파라미터에 따라 SELECT 절과 GROUP BY 절에 들어갈 문자열 배열을 구성합니다.
    
    -- organization_code
    IF p_group_org THEN
        v_select_cols := ARRAY_APPEND(v_select_cols, 'organization_code');
        v_group_cols := ARRAY_APPEND(v_group_cols, 'organization_code');
    ELSE
        -- 그룹화하지 않는 경우 뷰의 데이터를 합산하기 위해 NULL로 고정
        v_select_cols := ARRAY_APPEND(v_select_cols, 'NULL::TEXT AS organization_code');
    END IF;

    -- status_code
    IF p_group_status THEN
        v_select_cols := ARRAY_APPEND(v_select_cols, 'status_code');
        v_group_cols := ARRAY_APPEND(v_group_cols, 'status_code');
    ELSE
        v_select_cols := ARRAY_APPEND(v_select_cols, 'NULL::TEXT AS status_code');
    END IF;

    -- model_id
    IF p_group_model THEN
        v_select_cols := ARRAY_APPEND(v_select_cols, 'model_id');
        v_group_cols := ARRAY_APPEND(v_group_cols, 'model_id');
    ELSE
        v_select_cols := ARRAY_APPEND(v_select_cols, 'NULL::BIGINT AS model_id');
    END IF;

    -- distribution_id
    IF p_group_dist THEN
        v_select_cols := ARRAY_APPEND(v_select_cols, 'distribution_id');
        v_group_cols := ARRAY_APPEND(v_group_cols, 'distribution_id');
    ELSE
        v_select_cols := ARRAY_APPEND(v_select_cols, 'NULL::BIGINT AS distribution_id');
    END IF;

    -- 2. 기본 SQL 뼈대 조립 (뷰 이름 'device_summary_view', 카운트 컬럼 'count' 사용)
    v_sql := 'SELECT ' || ARRAY_TO_STRING(v_select_cols, ', ') || ', SUM(count)::BIGINT AS count ' ||
             'FROM device_stats ';

    -- 3. 그룹화할 대상이 하나라도 있다면 ROLLUP 구문을 추가
    IF COALESCE(ARRAY_LENGTH(v_group_cols, 1), 0) > 0 THEN
        v_sql := v_sql || 'GROUP BY ROLLUP (' || ARRAY_TO_STRING(v_group_cols, ', ') || ') ';
    END IF;

    -- 4. 완성된 쿼리 실행 및 반환
    RETURN QUERY EXECUTE v_sql;
END;
$$;
