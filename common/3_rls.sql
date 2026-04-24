ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_groups ENABLE ROW LEVEL SECURITY;

-- [Profiles] 본인 것만 조회/수정
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (AUTH.UID() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (AUTH.UID() = id);

-- [Organizations] 총괄관리자만 조직 수정
CREATE POLICY "Edit organizations by SYSTEM_ADMIN" ON organizations
FOR CREATE, UPDATE USING (
    is_approved() AND (
        get_my_role() = 'SYSTEM_ADMIN'
    )
);

-- [Organizations] 누구나 조회 가능 (비로그인/anonymous 포함)
CREATE POLICY "Everyone can view organizations" ON organizations
FOR SELECT 
TO anon, authenticated 
USING ( TRUE );

-- 아마 불필요
-- GRANT SELECT ON TABLE organizations TO anon;

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

-- [Usage Groups] 본인 소속 및 상위 조직의 그룹만 조회
CREATE POLICY "Users can view super-usage-groups" ON usage_groups
FOR SELECT USING (
    is_approved() AND (
        get_my_role() = 'SYSTEM_ADMIN' OR
        EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.code = usage_groups.organization_code 
            AND o.path <@ get_my_organization_path()
        )
    )
);

-- [Usage Groups] 본인 소속 조직의 그룹만 관리
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


-- 사용 가능한 사용 그룹 뷰
-- 내가 속한 조직 및 상위 조직에서 등록한 그룹만 조회
CREATE OR REPLACE VIEW v_my_available_usage_groups AS
SELECT 
    ug.*
FROM 
    usage_groups ug
JOIN 
    organizations o ON ug.organization_code = o.code
WHERE 
    o.path @> get_my_organization_path();

-- [Organizations] 컬럼별 노출 제어를 위한 공개용 뷰 예시
-- 비로그인 사용자는 metadata를 NULL로 받고, 로그인 유저는 실제 값을 봅니다.
CREATE OR REPLACE VIEW v_organizations_public AS
SELECT 
    code, 
    name, 
    org_type_code, 
    parent_code,
    path,
    CASE 
        WHEN auth.role() = 'authenticated' THEN metadata 
        ELSE NULL 
    END AS metadata
FROM organizations;
-- *********************************************************************************
-- 선언 뒤로 옮겨야 함 나중에 순서 조정
