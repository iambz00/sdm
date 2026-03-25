// import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Device } from "../types";

// export async function fetchCodesRaw() {
export async function fetchDevices() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("devices")
    .select("*")
    .order("organization_code", { ascending: true })
    .order("asset_number", { ascending: true })
    .order("status_code", { ascending: true })
    .order("usage_group_id", { ascending: true });

  return (data as Device[]) || [];
}

// export const fetchCodes = cache(fetchCodesRaw);
