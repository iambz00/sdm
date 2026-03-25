'use client';

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DeviceTabletIcon } from "@phosphor-icons/react";

const menuStructure = [
  {
    title: "기기 관리",
    items: [
      { path: "/devices", title: "기기 조회" },
      { path: "/devices/stats", title: "기기 통계" },
    ]
  },
  {
    title: "코드 관리",
    items: [
      { path: "/codes", title: "코드 조회" },
    ]
  },
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
          <DeviceTabletIcon weight="duotone" className="text-primary inline text-2xl mr-1" />
          {title}
        </h1>
      </div>

      <Menubar className="p-4">
        {menuStructure.map((menu) => (
          <MenubarMenu key={menu.title}>
            <MenubarTrigger className="cursor-pointer mr-4">{menu.title}</MenubarTrigger>
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
    </>
  );
}
