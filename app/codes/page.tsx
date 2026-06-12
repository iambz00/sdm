import { Suspense } from "react";
import { Code } from "@/common/types";
import { FetchType, fetch } from "@/common/fetch/server";

import CodeTable from "./table";

async function CodeManageContent() {
  const codes = (await fetch(["code"]))[0] as Code[]

  return <CodeTable codeList={codes} />;
}

export default function CodeManageBody() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen pb-96 text-xl">Loading codes...</div>}>
      <CodeManageContent />
    </Suspense>
  );
}
