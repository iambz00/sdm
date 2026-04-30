import { Suspense } from "react";
import { Code, Device, DeviceLog, Organization, Model, UsageGroup, Distribution, DistributionInfo } from "@/common/types";
import {
  FetchType, fetch
 } from "@/common/fetch/server";

import DeviceTable from "./table";

async function DeviceManageContent() {
  const watchList: FetchType[] = ["code", "device", "org", "usageGroup", "distribution", "distributionInfo"]
  const fetched = await fetch(watchList)
  // const watchObject = Object.fromEntries(watchList.map((fetchType, index) => [fetchType, fetched[index]]))
  const watchObject = {
    code:   fetched[0] as Code[],
    device: fetched[1] as Device[],
    org:    fetched[2] as Organization[],
    usageGroup:   fetched[3] as UsageGroup[],
    distribution: fetched[4] as Distribution[],
    distributionInfo: fetched[5] as DistributionInfo[],
  }
  console.log(watchObject)
  return <DeviceTable watchList={watchList} watchObject={watchObject} />;
}

export default async function DeviceManageBody() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen pb-96 text-xl">Loading devices...</div>}>
      <DeviceManageContent />
    </Suspense>
  );
}
