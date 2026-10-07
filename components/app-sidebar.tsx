"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Battery,
  FileText,
  ShoppingCart,
  RotateCcw,
  Users,
  Settings,
  Store,
  Sparkles
} from "lucide-react"
import Link from "next/link"

const data = {
  navCommand: [
    {
      title: "Business Overview",
      url: "/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      title: "Battery Catalog",
      url: "/dashboard/katalog",
      icon: <Battery />,
    },
    {
      title: "Articles & Blog",
      url: "/dashboard/artikel",
      icon: <FileText />,
    },
  ],
  navCommerce: [
    {
      title: "POS Transactions",
      url: "/dashboard/transaksi",
      icon: <ShoppingCart />,
    },
    {
      title: "Customers CRM",
      url: "/dashboard/pelanggan",
      icon: <Users />,
    },
    {
      title: "Old Battery Stock",
      url: "/dashboard/aki-lama",
      icon: <RotateCcw />,
    },
  ],
  navPlatform: [
    {
      title: "Public Catalog",
      url: "/katalog",
      icon: <Store />,
    },
    {
      title: "Battery Finder",
      url: "/rekomendasi-aki",
      icon: <Sparkles />,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" className="border-r border-neutral-200/80 dark:border-neutral-800 bg-[#fbfbfd] dark:bg-card/40" {...props}>
      <SidebarHeader className="p-4 pb-2">
        {/* App Workspace Logo Badge */}
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/"
              className="flex items-center gap-3 p-1.5 rounded-xl transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-[0_2px_8px_rgba(79,70,229,0.25)] shrink-0">
                S
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100 truncate leading-snug">
                  Siswanto Aki
                </span>
                <span className="text-xs text-neutral-400 truncate leading-tight">
                  Business Operations
                </span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 space-y-1">
        <NavMain items={data.navCommand} label="COMMAND" />
        <NavMain items={data.navCommerce} label="COMMERCE" />
        <NavMain items={data.navPlatform} label="PLATFORM" />
      </SidebarContent>
    </Sidebar>
  )
}
