import { Suspense } from "react";
import { fetchCodes } from "@/common/fetch/codes";
import { fetchDevices } from "@/common/fetch/devices";
import { fetchOrganizations } from "@/common/fetch/organizations"

import DeviceTable from "./table";


async function DeviceManageContent() {
  const [codes, devices, organizations ] = await Promise.all([
    fetchCodes(),
    fetchDevices(),
    fetchOrganizations()
  ]);

  return <DeviceTable codeList={codes} deviceList={devices} orgList={organizations} />;
}

export default function DeviceManageBody() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen pb-96 text-xl">Loading devices...</div>}>
      <DeviceManageContent />
    </Suspense>
  );
}
