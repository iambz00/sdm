'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { DeviceTabletIcon, ListIcon, UsersThreeIcon, DoorOpenIcon, TableIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion"

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


export default function TopNavMenu() {
  const currentPath = usePathname();
  const title = pathnames[currentPath] || "SDM";
  
  return (
    <>
      <div className="">
        <h1 className="text-lg font-bold h-fit flex">
          <DeviceTabletIcon weight="duotone" className="text-primary text-2xl mr-1 items-center" />
          {title}
        </h1>
      </div>

      {/* <div className="hidden md:hidden"> */}
      <div className="hidden md:flex">
        <Menubar className="border-none">
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
      </div>
      {/* <div className="md:flex"> */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <ListIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" showCloseButton={false} className="px-4">
            <SheetHeader>
              <SheetTitle>SDM</SheetTitle>
            </SheetHeader>
            <Accordion type="multiple" className="border">
              {menuStructure.map((menu) => (
                <AccordionItem value={menu.title} className="border-b last:border-b-0">
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
            <Link href="#" className="text-base">TEST</Link>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
