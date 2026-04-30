import { createClient } from "@/lib/supabase/server";
// import { Code, Device, DeviceLog, Organization, Model, UsageGroup, Distribution, DistributionInfo, Profile } from "../types";

export type FetchType = 'code' | 'device' | 'devicelog' | 'org' | 'model' | 'usageGroup' | 'distribution' | 'distributionInfo' | 'profile'
// export type ReturnType = Code | Device | DeviceLog | Organization | Model | UsageGroup | Distribution | DistributionInfo | Profile

export async function fetch(fetchGroup: FetchType[]): Promise<unknown[]>{
  const supabase = await createClient();
  const fetchMap: Record<FetchType, any> = {
    'code'  : supabase.from("codes").select("*")
      .order("group_code", { ascending: true })
      .order("name", { ascending: true }),
    'device': supabase.from("devices").select("*")
      .order("organization_code", { ascending: true })
      .order("asset_number", { ascending: true })
      .order("status_code", { ascending: true })
      .order("usage_group_id", { ascending: true }),
    'devicelog': supabase.from("device_log").select("*")
      .order("device_id", { ascending: true })
      .order("revision", { ascending: false }),
    'org'   : supabase.from("organizations").select("*")
      .order("path", { ascending: true }),
    'model' : supabase.from("models").select("*"),
    'usageGroup'  : supabase.from("usage_groups").select("*")
      .order("name", { ascending: true }),
    'distribution': supabase.from("distributions").select("*"),
    'distributionInfo': supabase.from("distribution_info").select("*"),
    'profile': supabase.from("profiles").select("*")
  }

  return Promise.all(fetchGroup.map(fetchType => fetchMap[fetchType]))
    .then(results => results.map(result => result.data))
}
