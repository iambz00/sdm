DROP TABLE IF EXISTS codes CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS usage_groups CASCADE;
DROP TABLE IF EXISTS models CASCADE;
DROP TABLE IF EXISTS distributions CASCADE;
DROP TABLE IF EXISTS distribution_info CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS devices_log CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS get_my_organization_path;

-- =================================================================================
-- 0-0. 확장 기능 (Extensions)
-- =================================================================================
CREATE EXTENSION IF NOT EXISTS ltree;

-- =================================================================================
-- 0-1. 사용자 권한 타입 (User Roles)
-- 수정이 불가능하도록 ENUM 타입으로 정의 (전체/지역/조직 x 관리/조회)
-- =================================================================================
CREATE TYPE user_role AS ENUM (
    'SYSTEM_ADMIN',  -- 전체 관리자
    'SYSTEM_VIEWER', -- 전체 조회자
    'REGION_ADMIN',  -- 지역 관리자
    'REGION_VIEWER', -- 지역 조회자
    'ORG_ADMIN',     -- 조직(학교) 관리자
    'ORG_VIEWER'     -- 조직(학교) 조회자
);

-- =================================================================================
-- 0-2. 승인 상태 타입 (Approval Status)
-- =================================================================================
CREATE TYPE approval_status AS ENUM (
    'PENDING',   -- 승인 대기
    'APPROVED',  -- 승인 완료
    'REJECTED',  -- 승인 거절
    'SUSPENDED'  -- 계정 중지
);

-- =================================================================================
-- 0. 공통 함수 (Common Functions)
-- =================================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- =================================================================================
-- 1. 공통 코드 (Common Codes)
-- =================================================================================
CREATE TABLE codes (
    code TEXT PRIMARY KEY,          -- 예: 'STS_NORMAL', 'ACT_REPAIR', 'APV_PENDING'
    group_code TEXT NOT NULL REFERENCES codes(code) ON DELETE RESTRICT ON UPDATE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE, -- 프론트엔드 노출 여부 (삭제 대신 false)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_codes_updated_at
    BEFORE UPDATE ON codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================================
-- 2. 조직도 (Organizations)
-- parent_id(계층)와 path_string(경로 탐색)을 혼합 사용
-- =================================================================================
CREATE TABLE organizations (
    code TEXT PRIMARY KEY,          -- 예: 'SCH001'
    org_type_code TEXT REFERENCES codes(code) ON DELETE RESTRICT ON UPDATE CASCADE, -- 기관 구분
    name TEXT NOT NULL,
    is_managed BOOLEAN DEFAULT TRUE,    -- 기기 관리 여부
    parent_code TEXT REFERENCES organizations(code) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- [성능 최적화] ltree를 이용한 계층 구조 관리
    -- 예: 'ROOT.A123456789.B987654321'
    path LTREE,
    
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE OR REPLACE FUNCTION get_organization_path(organization_code TEXT)
-- RETURNS LTREE AS $$
--   SELECT path FROM organizations WHERE code = organization_code;
-- $$ LANGUAGE SQL;

-- 경로 자동 계산 함수
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

-- 하위 조직 경로 전파 함수 (부모 변경 시)
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

CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_organizations_path_before
    BEFORE INSERT OR UPDATE OF code, parent_code ON organizations
    FOR EACH ROW EXECUTE FUNCTION fn_maintain_org_path();

CREATE TRIGGER trg_organizations_path_after
    AFTER UPDATE OF path ON organizations
    FOR EACH ROW EXECUTE FUNCTION fn_propagate_org_path();

-- =================================================================================
-- 2-2. 기기 사용 그룹 (Usage Groups)
-- 교실, 특별실, 혹은 '1인1기기'와 같은 논리적 할당 그룹
-- =================================================================================
CREATE TABLE usage_groups (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    organization_code TEXT REFERENCES organizations(code) ON DELETE RESTRICT ON UPDATE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_usage_groups_updated_at
    BEFORE UPDATE ON usage_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================================
-- 3. 제품 모델 (Models)
-- =================================================================================
CREATE TABLE models (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    vendor_code TEXT NOT NULL REFERENCES codes(code) ON DELETE RESTRICT ON UPDATE CASCADE,
    name TEXT NOT NULL,         -- 예: '갤럭시 탭 S7 FE'
    model_number TEXT,          -- 예: 'SM-T733'
    spec TEXT,
    display NUMERIC,
    os_code TEXT NOT NULL REFERENCES codes(code) ON DELETE RESTRICT ON UPDATE CASCADE,
    price BIGINT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================================
-- 4. 보급 차수 (Distributions)
-- =================================================================================
CREATE TABLE distributions (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    year INTEGER NOT NULL,
    dist_code TEXT NOT NULL REFERENCES codes(code) ON DELETE RESTRICT ON UPDATE CASCADE, 
    name TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_distributions_updated_at
    BEFORE UPDATE ON distributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================================
-- 5. 보급 세부정보 (Distribution Info)
-- =================================================================================
CREATE TABLE distribution_info (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    distribution_id BIGINT NOT NULL REFERENCES distributions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    organization_code TEXT REFERENCES organizations(code) ON DELETE RESTRICT ON UPDATE CASCADE,

    model_id BIGINT NOT NULL REFERENCES models(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_distribution_info_updated_at
    BEFORE UPDATE ON distribution_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================================
-- 6. 기기 정보 (Devices)
-- =================================================================================
-- 1. 기기 정보 테이블 (메인)
CREATE TABLE devices (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    revision INTEGER NOT NULL DEFAULT 1,
    
    serial_number TEXT UNIQUE CHECK (serial_number <> ''),  
    mac_address TEXT UNIQUE CHECK (mac_address <> ''),      
    asset_number TEXT UNIQUE CHECK (asset_number <> ''),    
    
    model_id BIGINT NOT NULL REFERENCES models(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    distribution_id BIGINT REFERENCES distributions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    organization_code TEXT NOT NULL REFERENCES organizations(code) ON DELETE RESTRICT ON UPDATE CASCADE,
    status_code TEXT NOT NULL REFERENCES codes(code) ON DELETE RESTRICT ON UPDATE CASCADE, 
    usage_group_id BIGINT REFERENCES usage_groups(id) ON DELETE RESTRICT ON UPDATE CASCADE,

    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- [추가] Supabase Auth 유저 추적용 컬럼
    created_by UUID DEFAULT AUTH.UID(), -- 생성 시 자동 기록됨
    updated_by UUID DEFAULT AUTH.UID(), -- 생성 시 자동 기록, 이후 트리거가 갱신
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. 기기 이력 로그 테이블
CREATE TABLE devices_log (
    log_id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    device_id BIGINT NOT NULL,
    revision INTEGER NOT NULL,
    action_type CHAR(1) NOT NULL CHECK (action_type IN ('U', 'D')),
    
    -- [추가] 이 변경(U) 또는 삭제(D) 액션을 실제로 수행한 사람
    action_by UUID, 
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 아래는 devices 원본 스냅샷 데이터
    serial_number TEXT,
    mac_address TEXT,
    asset_number TEXT,
    model_id BIGINT,
    distribution_id BIGINT,
    organization_code TEXT,
    status_code TEXT,
    usage_group_id BIGINT,
    metadata JSONB,
    
    created_by UUID, -- 과거 상태의 생성자
    updated_by UUID, -- 과거 상태의 수정자
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);


-- =================================================================================
-- User profiles
-- =================================================================================

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    organization_code TEXT REFERENCES organizations(code) ON DELETE RESTRICT ON UPDATE CASCADE,
    role user_role NOT NULL DEFAULT 'ORG_VIEWER',
    email TEXT,
    name TEXT,
    task TEXT,                      -- 담당 업무 - 담당 교사, 디지털튜터 등
    rejection_reason TEXT,          -- 거절 사유
    approval_status approval_status DEFAULT 'PENDING',
    approver_id UUID REFERENCES profiles(id) ON UPDATE CASCADE , -- 승인자 ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================================
-- RLS 및 보안 함수
-- =================================================================================

-- 현재 로그인한 사용자의 조직 경로를 가져오는 헬퍼 함수
CREATE OR REPLACE FUNCTION get_my_organization_code()
RETURNS LTREE AS $$
  SELECT organization_code FROM profiles WHERE id = AUTH.UID();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_organization_path()
RETURNS LTREE AS $$
  SELECT path FROM organizations 
  WHERE code = get_my_organization_code();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 현재 로그인한 사용자의 역할 코드를 가져오는 헬퍼 함수
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_groups ENABLE ROW LEVEL SECURITY;

-- [Profiles] 본인 것만 조회/수정
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (AUTH.UID() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (AUTH.UID() = id);

-- [Organizations] 권한별 조회 정책
CREATE POLICY "Edit organizations by ADMIN" ON organizations
FOR CREATE, UPDATE USING (
    is_approved() AND (
        get_my_role() = 'SYSTEM_ADMIN'
    )
);

-- [Profiles] 관리자의 승인 대기 명단 조회 정책
CREATE POLICY "Admins can view pending users in their org" ON profiles
FOR SELECT USING (
    is_approved() AND (
        get_my_role() = 'SYSTEM_ADMIN' OR
        (get_my_role() IN ('REGION_ADMIN', 'ORG_ADMIN') AND organization_code IN (
            SELECT code FROM organizations WHERE path <@ get_my_organization_path()
        ))
    )
);

-- [Usage Groups] 본인 소속 및 하위 조직의 그룹만 조회/관리
CREATE POLICY "Manage sub-usage-groups" ON usage_groups
FOR ALL USING (
    is_approved() AND (
        get_my_role() = 'SYSTEM_ADMIN' OR
        EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.code = usage_groups.organization_code 
            AND o.path <@ get_my_organization_path()
        )
    )
);

-- [Devices] 6단계 계층 권한 정책

-- 1. 조회(SELECT) 권한: 모든 Viewer 및 Admin 포함
CREATE POLICY "Devices select policy" ON devices
FOR SELECT USING (
    CASE 
        WHEN get_my_role() IN ('SYSTEM_ADMIN', 'SYSTEM_VIEWER') THEN TRUE
        WHEN get_my_role() IN ('REGION_ADMIN', 'REGION_VIEWER') THEN 
            EXISTS (SELECT 1 FROM organizations o WHERE o.code = devices.organization_code AND o.path <@ get_my_organization_path())
        WHEN get_my_role() IN ('ORG_ADMIN', 'ORG_VIEWER') THEN 
            organization_code = (SELECT organization_code FROM profiles WHERE id = AUTH.UID())
        ELSE FALSE
    END
);

-- 2. 관리(INSERT, UPDATE, DELETE) 권한: Admin 전용
CREATE POLICY "Devices manage policy" ON devices
FOR ALL -- 또는 구체적으로 INSERT, UPDATE, DELETE 분리 가능
USING (
    CASE 
        WHEN get_my_role() = 'SYSTEM_ADMIN' THEN TRUE
        WHEN get_my_role() = 'REGION_ADMIN' THEN 
            EXISTS (SELECT 1 FROM organizations o WHERE o.code = devices.organization_code AND o.path <@ get_my_organization_path())
        WHEN get_my_role() = 'ORG_ADMIN' THEN 
            organization_code = (SELECT organization_code FROM profiles WHERE id = AUTH.UID())
        ELSE FALSE
    END
)
WITH CHECK ( -- 등록/수정 시 본인이 권한을 가진 조직으로만 데이터를 넣을 수 있게 제한
    CASE 
        WHEN get_my_role() = 'SYSTEM_ADMIN' THEN TRUE
        WHEN get_my_role() = 'REGION_ADMIN' THEN 
            EXISTS (SELECT 1 FROM organizations o WHERE o.code = devices.organization_code AND o.path <@ get_my_organization_path())
        WHEN get_my_role() = 'ORG_ADMIN' THEN 
            devices.organization_code = (SELECT organization_code FROM profiles WHERE id = AUTH.UID())
        ELSE FALSE
    END
);


-- =================================================================================
-- 인덱스
-- =================================================================================
DROP INDEX IF EXISTS idx_organizations_path;
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
CREATE INDEX idx_devices_log_device_id ON devices_log(device_id);
