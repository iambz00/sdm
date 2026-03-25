export interface Code {
  code: string;
  group_code: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Device {
  organization_code: string;
  room_id: number;
  asset_number: string;
  status_code: string;

  serial_number: string;
  mac_address: string;
  model_id: number;
  distribution_id: number;
  metadata: string;
}
