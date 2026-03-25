import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const resolveRole: { [key: string]: string } = {
  "SYSTEM_ADMIN"  : "전체 관리",
  "SYSTEM_VIEWER" : "전체 조회",
  "REGION_ADMIN"  : "지역 관리",
  "REGION_VIEWER" : "지역 조회",
  "ORG_ADMIN"     : "관리",
  "ORG_VIEWER"    : "조회",
  ""              : "미지정"
}

export function AuthButton({
  name = "",
  role = ""
}:{
  name: string | undefined,
  role: string | undefined
}) {
  if (!name) {
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

  return (
    <div className="flex items-center gap-2 mr-4">
      <span className="font-medium">{name}</span>
      <Badge variant="outline" className="text-primary rounded-sm">
        {resolveRole[role]}
      </Badge>
    </div>
  );
}
