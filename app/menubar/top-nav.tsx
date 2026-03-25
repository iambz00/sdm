'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { DeviceTabletIcon, ListIcon, UsersThreeIcon, DoorOpenIcon, TableIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion"
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "./auth-button";
import { LogoutButton } from "./logout-button";

const menuStructure = [
  {
    title: "기기 관리",
    icon: DeviceTabletIcon,
    items: [
      { path: "/devices", title: "기기 조회" },
      { path: "/devices/stats", title: "기기 통계" },
    ]
  },
  {
    title: "코드 관리",
    icon: TableIcon,
    items: [
      { path: "/codes", title: "코드 조회" },
    ]
  },
  {
    title: "사용자 관리",
    icon: UsersThreeIcon,
    items: [
      { path: "/users", title: "사용자 관리" }
    ]
  }
]

const pathnames: { [key: string]: string } = { }
menuStructure.forEach((menu) => {
  menu.items.forEach((item) => {
    pathnames[item.path] = menu.title + " / " +item.title
  })
})


export default function TopNav() {
  const currentPath = usePathname();
  const title = pathnames[currentPath] || "SDM";
 
  return (
    <nav className="w-full flex justify-center h-14">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
        <div className="">
          <h1 className="text-lg font-bold h-fit flex">
            <DeviceTabletIcon weight="duotone" className="text-primary text-2xl mr-1 items-center" />
            {title}
          </h1>
        </div>

        <TopNavDesktop className="hidden md:flex"/>

        <div className="items-center hidden space-x-2 md:flex">
          <AuthButton />
          <LogoutButton />
          <ThemeSwitcher />
        </div>
        <TopNavMobile className="md:hidden" />
      </div>
    </nav>
  );
}

export function TopNavDesktop({ className }:{ className: string }) {
  
  return (
    <Menubar className={cn("border-none", className)}>
      {menuStructure.map((menu) => (
        <MenubarMenu key={menu.title}>
          <MenubarTrigger className="cursor-pointer px-2 text-base">
            <menu.icon />{menu.title}
          </MenubarTrigger>
          <MenubarContent>
            {menu.items.map((item) => (
              <MenubarItem key={item.path} asChild>
                <Link href={item.path}>
                  {item.title}
                </Link>
              </MenubarItem>
            ))}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}

function TopNavMobile({ className }:{ className: string }) {
  return (
    <div className={className}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <ListIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" showCloseButton={false} className="px-4">
          <SheetHeader className="w-full px-0">
            <SheetTitle className="flex items-center">
              <div className="flex"><AuthButton /></div>
              <div className="flex mx-auto"></div>
              <div className="flex">
                <LogoutButton />
                <ThemeSwitcher />
              </div>
            </SheetTitle>
          </SheetHeader>
          <Accordion type="multiple" defaultValue={menuStructure.map(menu => menu.title)} className="border">
            {menuStructure.map((menu) => (
              <AccordionItem value={menu.title} key={menu.title} className="border-b last:border-b-0">
                <AccordionTrigger className="text-base text-primary px-3 py-1 items-center">
                  <menu.icon className="mr-1" />{menu.title}
                </AccordionTrigger>
                {menu.items.map((item) => (
                  <AccordionContent className="text-sm px-6 py-1 no-underline">
                    <Link key={item.title} href={item.path} style={{ textDecoration: 'none' }}>
                      {item.title}
                    </Link>
                  </AccordionContent>
                ))}
              </AccordionItem>
            ))}
          </Accordion>
        </SheetContent>
      </Sheet>
    </div>
  )
}