
-- =================================================================================
-- 인덱스
-- =================================================================================

DROP INDEX IF EXISTS idx_organizations_path_gist;
CREATE INDEX idx_organizations_path_gist ON organizations USING gist (path);
-- CREATE INDEX idx_organizations_parent_code ON organizations (parent_code);

-- 2) 기기 테이블의 주요 통계 조건 인덱싱
DROP INDEX IF EXISTS idx_devices_org_code;
DROP INDEX IF EXISTS idx_devices_status_code;
DROP INDEX IF EXISTS idx_devices_distribution_id;
DROP INDEX IF EXISTS idx_devices_model_id;
CREATE INDEX idx_devices_org_code ON devices (organization_code);
CREATE INDEX idx_devices_status_code ON devices (status_code);
CREATE INDEX idx_devices_distribution_id ON devices (distribution_id);
CREATE INDEX idx_devices_model_id ON devices (model_id);

-- 3) JSONB 메타데이터 내부 검색 속도 최적화 (계정명 검색, 특정 상태 검색 등)
DROP INDEX IF EXISTS idx_devices_metadata_gin;
CREATE INDEX idx_devices_metadata_gin ON devices USING gin (metadata);

-- 인덱스 생성 (조회 성능 최적화)
DROP INDEX IF EXISTS idx_devices_log_device_id;
CREATE INDEX idx_devices_log_device_id ON devices_log(device_id);

