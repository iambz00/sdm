-- 1. codes 테이블 샘플 데이터
-- 그룹 코드 먼저 삽입
INSERT INTO codes (code, group_code, name, description, is_active) VALUES
('GROUP',       'GROUP', '코드 그룹', '최상위 그룹', TRUE),
('GRP_STATUS',  'GROUP', '기기 상태 코드', '', TRUE),
('GRP_USAGE',   'GROUP', '용도 코드', '', TRUE),
('GRP_VENDOR',  'GROUP', '제조사 코드', '', TRUE),
('GRP_DIST',    'GROUP', '보급 유형 코드', '보급 사업 유형', TRUE),
('GRP_OS',      'GROUP', 'OS 코드', '운영체제', TRUE),
('GRP_ORG',     'GROUP', '조직 유형', '', TRUE);

-- 세부 코드 삽입 (group_code 참조)
INSERT INTO codes (code, group_code, name, description, is_active) VALUES
('STS_NORMAL',  'GRP_STATUS', '정상', '정상 [기기 있음]', TRUE),
('STS_BROKEN',  'GRP_STATUS', '고장', '고장 등 사용 불가 [기기 있음]', TRUE),
('STS_MISSING', 'GRP_STATUS', '없음', '도난, 분실 등 [기기 없음]', TRUE),
('STS_ETC',     'GRP_STATUS', '수리', '수리 입고 등 [기기 없음]', TRUE),
('STS_DISPOSED','GRP_STATUS', '파기', '파기되어 없음 [세지 않음]', TRUE),

('VND_SAMSUNG', 'GRP_VENDOR', '삼성전자', '', TRUE),
('VND_APPLE',   'GRP_VENDOR', 'Apple', '', TRUE),
('VND_LG',      'GRP_VENDOR', 'LG전자', '', TRUE),
('VND_FORU',    'GRP_VENDOR', '포유디지털', '', TRUE),

('DIST_SCHOOL', 'GRP_DIST', '자체', '학교 자체 구입', TRUE),
('DIST_MOE',    'GRP_DIST', '교육부', '교육부 보급', TRUE),
('DIST_GBE',    'GRP_DIST', '경북', '경북교육청 보급', TRUE),

('OS_ANDROID',  'GRP_OS', 'Android', '', TRUE),
('OS_CHROME',   'GRP_OS', 'ChromeOS', '', TRUE),
('OS_IOS',      'GRP_OS', 'iOS', '', TRUE),
('OS_WINDOWS',  'GRP_OS', 'Windows', '', TRUE),

('ORG_EDU_01',  'GRP_ORG', '교육청', '', TRUE),
('ORG_EDU_02',  'GRP_ORG', '직속기관', '', TRUE),
('ORG_EDU_03',  'GRP_ORG', '교육지원청', '', TRUE),
('ORG_EDU_04',  'GRP_ORG', '소속기관', '', TRUE),
('ORG_SCH_01',  'GRP_ORG', '유치원', '', TRUE),
('ORG_SCH_02',  'GRP_ORG', '초등학교', '', TRUE),
('ORG_SCH_03',  'GRP_ORG', '중학교', '', TRUE),
('ORG_SCH_04',  'GRP_ORG', '고등학교', '', TRUE),
('ORG_SCH_05',  'GRP_ORG', '특수학교', '', TRUE),
('ORG_SCH_09',  'GRP_ORG', '기타학교', '', TRUE);

-- 2. organizations 테이블 샘플 데이터 - 별도파일

-- 3. models 테이블 샘플 데이터
INSERT INTO models (vendor_code, name, model_number, spec, display, price, os_code, metadata) VALUES
('VND_SAMSUNG', 'S6 Lite', 'SM-P610NZAEKOO', 'Exynos 9611', 10.4, 420300, 'OS_ANDROID','{"storage": "64GB", "ram": "4GB"}'),
('VND_SAMSUNG', 'S9 FE+', 'SM-X610', 'Exynos 1380', 12.4, 601287, 'OS_ANDROID', '{"storage": "128GB", "ram": "6GB"}'),
('VND_SAMSUNG', 'S10 FE', 'SM-X520N', 'Exynos 1580', 11.0, 720391, 'OS_ANDROID', '{"storage": "128GB", "ram": "8GB"}'),
('VND_FORU'   , 'L101', 'L101', 'MTK Helio P70', 10.4, 268000, 'OS_ANDROID', '{"storage": "64GB", "ram": "4GB"}'),
('VND_SAMSUNG', '크롬북2', 'XQ520QEA', '', 11.4, 653500, 'OS_CHROME', '{"storage": "64GB", "ram": "4GB"}');

-- 4. distributions 테이블 샘플 데이터
INSERT INTO distributions (year, dist_code, name, description, metadata) VALUES
(2019, 'DIST_MOE', '교육부 특교 3차', '', '')
(2020, 'DIST_MOE', '교육부 특교 4차', '', '')
(2021, 'DIST_GBE', '경북(21년1차)', '', ''),
(2022, 'DIST_GBE', '경북(21년2차)', '', ''),
(2022, 'DIST_GBE', '경북(22년1차)', '', ''),
(2023, 'DIST_GBE', '경북(22년2차)', '', ''),
(2025, 'DIST_GBE', '경북(24년1차)', '', ''),
(2025, 'DIST_GBE', '경북(25년1차)', '', ''),

-- 5. usage_groups 테이블 샘플 데이터
INSERT INTO usage_groups (organization_code, name, description) VALUES
('R100000001', '학급용', '학급에 배치하여 사용'),
('R100000001', '학생배정', '학생에게 배정하여 학교 내 사용'),
('R100000001', '학생배부', '학생에게 배부하여 졸업 시 반납'),
('R100000001', '학생배부', '학생에게 배부하여 졸업 시 반납'),


('SCH_GANGNAM_01', '1학년 1반', '강남초등학교 1학년 1반 기기 사용 그룹'),
('SCH_GANGNAM_01', '컴퓨터실', '강남초등학교 컴퓨터실 기기 사용 그룹'),
('SCH_GANGNAM_02', '3학년 2반', '강남중학교 3학년 2반 기기 사용 그룹'),
('SCH_GANGDONG_01', '도서관 대여', '강동고등학교 도서관 대여 기기 그룹');


-- 6. distribution_info 테이블 샘플 데이터
INSERT INTO distribution_info (distribution_id, organization_code, model_id, quantity) VALUES
((SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGNAM_01', (SELECT id FROM models WHERE name = '갤럭시 탭 S8'), 30),
((SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGNAM_02', (SELECT id FROM models WHERE name = '갤럭시 탭 S7 FE'), 25),
((SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGDONG_01', (SELECT id FROM models WHERE name = 'iPad Air 5세대'), 40),
((SELECT id FROM distributions WHERE name = '2024년 부산 교육청 특별 보급'), 'SCH_HAEUNDAE_01', (SELECT id FROM models WHERE name = 'LG Gram 14'), 20);

-- 7. devices 테이블 샘플 데이터
-- (주의: serial_number, mac_address, asset_number는 UNIQUE 제약 조건이 있으므로 고유하게 생성해야 합니다.)
INSERT INTO devices (serial_number, mac_address, asset_number, model_id, distribution_id, organization_code, status_code, usage_group_id, metadata) VALUES
('SN_S8_GN01_001', '00:1A:2B:3C:4D:01', 'ASSET_GN01_001', (SELECT id FROM models WHERE name = '갤럭시 탭 S8'), (SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGNAM_01', 'STS_NORMAL', (SELECT id FROM usage_groups WHERE name = '1학년 1반' AND organization_code = 'SCH_GANGNAM_01'), '{"class": "1-1", "student_id": "S1001"}'),
('SN_S8_GN01_002', '00:1A:2B:3C:4D:02', 'ASSET_GN01_002', (SELECT id FROM models WHERE name = '갤럭시 탭 S8'), (SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGNAM_01', 'STS_NORMAL', (SELECT id FROM usage_groups WHERE name = '1학년 1반' AND organization_code = 'SCH_GANGNAM_01'), '{"class": "1-1", "student_id": "S1002"}'),
('SN_S8_GN01_003', '00:1A:2B:3C:4D:03', 'ASSET_GN01_003', (SELECT id FROM models WHERE name = '갤럭시 탭 S8'), (SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGNAM_01', 'STS_REPAIR', (SELECT id FROM usage_groups WHERE name = '1학년 1반' AND organization_code = 'SCH_GANGNAM_01'), '{"class": "1-1", "issue": "화면 깨짐"}'),
('SN_S7FE_GN02_001', '00:1A:2B:3C:4D:04', 'ASSET_GN02_001', (SELECT id FROM models WHERE name = '갤럭시 탭 S7 FE'), (SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGNAM_02', 'STS_NORMAL', (SELECT id FROM usage_groups WHERE name = '3학년 2반' AND organization_code = 'SCH_GANGNAM_02'), '{"class": "3-2", "student_id": "M3001"}'),
('SN_S7FE_GN02_002', '00:1A:2B:3C:4D:05', 'ASSET_GN02_002', (SELECT id FROM models WHERE name = '갤럭시 탭 S7 FE'), (SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGNAM_02', 'STS_BROKEN', (SELECT id FROM usage_groups WHERE name = '3학년 2반' AND organization_code = 'SCH_GANGNAM_02'), '{"class": "3-2", "issue": "배터리 불량"}'),
('SN_IPAD_GD01_001', '00:1A:2B:3C:4D:06', 'ASSET_GD01_001', (SELECT id FROM models WHERE name = 'iPad Air 5세대'), (SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGDONG_01', 'STS_NORMAL', (SELECT id FROM usage_groups WHERE name = '도서관 대여' AND organization_code = 'SCH_GANGDONG_01'), '{"loan_status": "대여 가능"}'),
('SN_IPAD_GD01_002', '00:1A:2B:3C:4D:07', 'ASSET_GD01_002', (SELECT id FROM models WHERE name = 'iPad Air 5세대'), (SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGDONG_01', 'STS_NORMAL', (SELECT id FROM usage_groups WHERE name = '도서관 대여' AND organization_code = 'SCH_GANGDONG_01'), '{"loan_status": "대여 중", "borrower": "김철수"}'),
('SN_GRAM_HU01_001', '00:1A:2B:3C:4D:08', 'ASSET_HU01_001', (SELECT id FROM models WHERE name = 'LG Gram 14'), (SELECT id FROM distributions WHERE name = '2024년 부산 교육청 특별 보급'), 'SCH_HAEUNDAE_01', 'STS_NORMAL', NULL, '{"student_id": "H4001", "support_type": "저소득층"}');

-- devices_log 테이블은 트리거에 의해 자동으로 채워지므로 별도의 INSERT 문은 필요 없습니다.
-- 하지만 초기 데이터를 위해 수동으로 삽입할 수도 있습니다. (예시)
-- INSERT INTO devices_log (device_id, revision, action_type, action_by, serial_number, mac_address, asset_number, model_id, distribution_id, organization_code, status_code, usage_group_id, metadata, created_by, updated_by, created_at, updated_at)
-- VALUES (
--     (SELECT id FROM devices WHERE serial_number = 'SN_S8_GN01_001'), 1, 'U', NULL,
--     'SN_S8_GN01_001', '00:1A:2B:3C:4D:01', 'ASSET_GN01_001', (SELECT id FROM models WHERE name = '갤럭시 탭 S8'), (SELECT id FROM distributions WHERE name = '2023년 서울 교육청 일반 보급'), 'SCH_GANGNAM_01', 'STS_NORMAL', (SELECT id FROM usage_groups WHERE name = '1학년 1반' AND organization_code = 'SCH_GANGNAM_01'), '{"class": "1-1", "student_id": "S1001"}',
--     NULL, NULL, NOW(), NOW()
-- );
