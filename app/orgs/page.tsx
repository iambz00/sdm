import { Suspense } from "react";
import { fetchCodes } from "@/common/fetch/codes";
import { fetchOrganizations } from "@/common/fetch/organizations"

import OrgTable from "./table";

async function OrgManageContent() {
  const [codes, organizations ] = await Promise.all([
    fetchCodes(),
    fetchOrganizations()
  ]);

  return <OrgTable codeList={codes} orgList={organizations} />;
}

export default function OrgManageBody() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen pb-96 text-xl">Loading...</div>}>
      <OrgManageContent />
    </Suspense>
  );
}
