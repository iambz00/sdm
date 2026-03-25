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
