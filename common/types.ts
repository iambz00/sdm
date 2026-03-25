export interface Code {
  code: string;
  group_code: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Device {
  id: number;
  revision: number;
  organization_code: string;
  usage_group_id: number;
  asset_number: string;
  status_code: string;

  serial_number: string;
  mac_address: string;
  model_id: number;
  distribution_id: number;
  metadata: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
    code: string;
    name: string;
    is_managed: boolean;
    parent_code: string;
    path: string;
}
