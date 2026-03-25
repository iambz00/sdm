import { ThemeSwitcher } from "@/components/theme-switcher";
import TopNavMenu from "./top-nav-menu";
import { AuthButton } from "./auth-button";
import { Suspense } from "react";

export default function TopNav() {
 
  return (
    <nav className="w-full flex justify-center h-14">
      <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5">

        <TopNavMenu />

        <div className="flex items-center">
          <Suspense>
            <AuthButton />
          </Suspense>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
