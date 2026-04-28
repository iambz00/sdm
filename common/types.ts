export interface Code {
  code: string;
  group_code: string;
  name: string;
  description: string;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface Device {
  id: number;
  revision: number;

  serial_number: string;
  mac_address: string;
  asset_number: string;

  model_id: number;
  distribution_id: number;
  organization_code: string;
  status_code: string;
  usage_group_id: number;

  metadata: string;

  created_by: string;
  updated_by: string;

  created_at: string;
  updated_at: string;
}

export interface DeviceLog {
  log_id: number;     // 추가
  device_id: number;
  revision: number;
  action_type: string;  // 추가

  serial_number: string;
  mac_address: string;
  asset_number: string;

  model_id: number;
  distribution_id: number;
  organization_code: string;
  status_code: string;
  usage_group_id: number;

  metadata: string;

  created_by: string;
  updated_by: string;

  created_at: string;
  updated_at: string;
}

export interface Organization {
  code: string;
  org_type_code: string;
  name: string;
  is_managed: boolean;
  parent_code: string;

  path: string;

  metadata: string;
  created_at: string;
  updated_at: string;
}

export interface UsageGroup {
  id: number;
  organization_code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Model {
  id: number;
  vendor_code: string;
  name: string;
  model_number: string;
  spec: string;
  display: number;
  os_code: string;
  price: number;
  metadata: string;

  created_at: string;
  updated_at: string;
}

export interface Distribution {
  id: number;
  year: number;
  dist_code: string;
  name: string;
  description: string;
  metadata: string;
  created_at: string;
  updated_at: string;
}

export interface DistributionInfo {
  id: number;
  distribution_id: number;
  organization_code: string;
  model_id: number;
  quantity: number
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  organization_code: string;
  role: 
    'SYSTEM_ADMIN' | 'SYSTEM_VIEWER' | 
    'REGION_ADMIN' | 'REGION_VIEWER' | 
    'ORG_ADMIN' | 'ORG_VIEWER';

  email: string;
  name: string;
  task: string;
  rejection_reason: string;
  approval_status: string;
  approver_id: string;
  created_at: string;
  updated_at: string;
}
