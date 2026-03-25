// import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Organization } from "@/common/type/organization";

// export async function fetchCodesRaw() {
export async function fetchOrganizations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .order("path", { ascending: true });

  return (data as Organization[]) || [];
}

// export const fetchCodes = cache(fetchCodesRaw);

export async function fetchOrganizationsFromGroup(group_code: string = "") {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .order("path", { ascending: true })
    .order("name", { ascending: true });
  return (data as Organization[]) || [];
}
