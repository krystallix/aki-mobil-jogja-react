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
import Link from "next/link"
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
      title: "Transaksi",
      url: "/dashboard/transaksi",
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
      <SidebarHeader className="pt-4 pb-2 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-12 bg-muted/20 border border-border/40 rounded-[1.25rem] px-3 transition-colors hover:bg-muted/40"
            >
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background border border-border/60 flex items-center justify-center shadow-sm shrink-0">
                  <Image src="/logo.svg" alt="logo" width={20} height={20} className="object-contain" />
                </div>
                <span className="text-lg md:text-base font-bold tracking-tight text-foreground">Siswanto Aki</span>
              </Link>
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
