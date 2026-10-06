"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  label,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
  label?: string
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="py-1">
      {label && (
        <SidebarGroupLabel className="text-[11px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-1 px-2.5">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))

            return (
              <SidebarMenuItem key={item.title}>
                <Link
                  href={item.url}
                  className={`flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] transition-colors bg-transparent ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-neutral-500 dark:text-neutral-400 font-medium hover:text-indigo-600/70 dark:hover:text-indigo-400/70"
                  }`}
                >
                  <span className={`[&>svg]:w-4 [&>svg]:h-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-neutral-400 group-hover:text-inherit"
                  }`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
