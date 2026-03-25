import SignUpForm from "./sign-up-form";
import { fetchOrganizations } from "@/common/fetch/organizations";
import { Suspense } from "react";

export default async function Page() {
  const organizations = await fetchOrganizations();
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense>
          <SignUpForm orgList={organizations} />
        </Suspense>
      </div>
    </div>
  );
}
