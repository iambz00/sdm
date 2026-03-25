import { TopNavTitle, TopNavMenu } from "./top-nav-menu";
import { createClient } from "@/lib/supabase/server";

async function getUserAndRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { name: null, role: null }
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();
  return { name: profile?.name, role: profile?.role }
}

export default async function TopNav() {
  const profile = await getUserAndRole();

  return (
    <nav className="w-full flex justify-center h-14">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
        <TopNavTitle />
        <TopNavMenu name={profile.name} role={profile.role}/>
      </div>
    </nav>

  );
}

