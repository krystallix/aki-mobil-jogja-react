"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  BatteryFullIcon,
  FileTextIcon,
  WrenchIcon,
  ShoppingCartIcon,
  Settings2Icon,
  UsersIcon
} from "lucide-react"
import Image from "next/image"

const data = {
  user: {
    name: "Admin",
    email: "admin@akimobiljogja.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navContent: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Katalog Aki",
      url: "/dashboard/katalog",
      icon: <BatteryFullIcon />,
    },
    {
      title: "Artikel",
      url: "/dashboard/artikel",
      icon: <FileTextIcon />,
    },
    {
      title: "Layanan",
      url: "/dashboard/layanan",
      icon: <WrenchIcon />,
    },
  ],
  navBusiness: [
    {
      title: "Pesanan",
      url: "/dashboard/pesanan",
      icon: <ShoppingCartIcon />,
    },
    {
      title: "Pelanggan",
      url: "/dashboard/pelanggan",
      icon: <UsersIcon />,
    },
    {
      title: "Pengaturan",
      url: "/dashboard/settings",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <Image src="/logo.svg" alt="logo" width={24} height={24} />
                <span className="text-base font-semibold">Aki Mobil Jogja</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navContent} label="Menu Utama" />
        <NavMain items={data.navBusiness} label="Administrasi" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
