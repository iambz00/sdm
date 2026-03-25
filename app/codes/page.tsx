import { Suspense } from "react";
import { fetchCodes } from "@/common/fetch/codes";

import CodeTable from "./table";

async function CodeManageContent() {
  const codes = await fetchCodes();

  return <CodeTable codeList={codes} />;
}

export default function CodeManageBody() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen pb-96 text-xl">Loading codes...</div>}>
      <CodeManageContent />
    </Suspense>
  );
}
