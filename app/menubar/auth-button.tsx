import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

const resolveRole: { [key: string]: string } = {
  'SYSTEM_ADMIN': '전체 관리',
  'SYSTEM_VIEWER': '전체 조회',
  'REGION_ADMIN': '지역 관리',
  'REGION_VIEWER': '지역 조회',
  'ORG_ADMIN': '관리',
  'ORG_VIEWER': '조회'
}


export async function AuthButton() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">로그인</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/sign-up">등록</Link>
        </Button>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">{profile?.name || user.email}</span>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 border">
          {resolveRole[profile?.role] || ''}
        </span>
      </div>
      <LogoutButton />
    </div>
  );
}
