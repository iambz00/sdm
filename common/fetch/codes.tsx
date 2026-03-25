// import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Code } from "@/common/type/code";

// export async function fetchCodesRaw() {
export async function fetchCodes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("codes")
    .select("*")
    .order("group_code", { ascending: true })
    .order("name", { ascending: true });

  return (data as Code[]) || [];
}

// export const fetchCodes = cache(fetchCodesRaw);

export async function fetchCodesFromGroup(group_code: string = "") {
  const supabase = await createClient();
  const { data } = await supabase
    .from("codes")
    .select("*")
    .eq("group_code", group_code)
    .order("name", { ascending: true });
  return (data as Code[]) || [];
}
