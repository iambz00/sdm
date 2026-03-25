"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { DeviceTabletIcon, ListIcon, UsersThreeIcon, DoorOpenIcon, TableIcon, TreeViewIcon, CpuIcon } from "@phosphor-icons/react";

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion"

import { ThemeSwitcher } from "@/components/theme-switcher";

import { AuthButton } from "./auth-button";
import { LogoutButton } from "./logout-button";

export const menuStructure = [
  {
    title: "기기 관리",
    icon: DeviceTabletIcon,
    items: [
      { path: "/devices", title: "기기 조회" },
      { path: "/devices/stats", title: "기기 통계" },
    ]
  },
  {
    title: "조직 관리",
    icon: TreeViewIcon,
    items: [
      { path: "/orgs", title: "조직 조회" },
      { path: "/orgs/groups", title: "그룹 관리" },
    ]
  },
  {
    title: "시스템 관리",
    icon: CpuIcon,
    items: [
      { path: "/users", title: "사용자 관리" },
      { path: "/codes", title: "코드 조회" },
    ]
  },
]

const pathnames: { [key: string]: string } = { }
menuStructure.forEach((menu) => {
  menu.items.forEach((item) => {
    pathnames[item.path] = item.title
  })
})

export function TopNavTitle() {
  const currentPath = usePathname();
  const title = pathnames[currentPath] || "SDM";

  return (
    <div className="">
      <h1 className="text-lg font-bold h-fit flex">
        <DeviceTabletIcon weight="duotone" className="text-primary text-2xl mr-1 items-center" />
        {title}
      </h1>
    </div>
  )
}

export function TopNavMenu({
  name,
  role
}:{
  name?: string,
  role?: string
}) {
  const currentPath = usePathname();
  const title = pathnames[currentPath] || "SDM";
 
  return (
    <>
      {/* Menu for Desktop */}
      <Menubar className="border-none hidden md:flex">
        {menuStructure.map((menu) => (
          <MenubarMenu key={menu.title}>
            <MenubarTrigger className="cursor-pointer px-2 text-base hover:bg-primary hover:text-primary-foreground aria-expanded:bg-primary aria-expanded:text-primary-foreground">
              <menu.icon />{menu.title}
            </MenubarTrigger>
            <MenubarContent>
              {menu.items.map((item) => (
                <MenubarItem key={item.path} asChild className="text-sm focus:bg-primary focus:text-primary-foreground cursor-pointer">
                  <Link href={item.path}>
                    {item.title}
                  </Link>
                </MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
      <div className="items-center hidden space-x-2 md:flex">
        <AuthButton name={name} role={role}/>
        <LogoutButton />
        <ThemeSwitcher />
      </div>

      {/* Menu for Mobile device */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <ListIcon className="h-8 w-8 text-primary"/>
          </SheetTrigger>
          <SheetContent side="right" showCloseButton={false} className="px-4">
            <SheetHeader className="w-full px-0">
              <SheetTitle className="flex items-center">
                <div className="flex">
                  <AuthButton name={name} role={role}/>
                </div>
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
                    <AccordionContent key={item.title} className="text-sm px-6 py-1 no-underline">
                      <Link href={item.path} style={{ textDecoration: 'none' }}>
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
    </>
  );
}

