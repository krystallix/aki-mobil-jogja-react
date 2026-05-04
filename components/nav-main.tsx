"use client"

import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
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
    <SidebarGroup>
      {label && <SidebarGroupLabel className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/70 mb-1.5 px-3">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5 px-2">
          {items.map((item) => {
            // Ambil segment terakhir dari pathname dan item.url
            const currentSegment = pathname.split('/').filter(Boolean).pop() || ''
            const itemSegment = item.url.split('/').filter(Boolean).pop() || ''

            const isActive = currentSegment === itemSegment

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className={`h-11 px-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)] font-bold rounded-xl hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground font-semibold hover:bg-muted/50 hover:text-foreground rounded-xl"
                  }`}
                >
                  <a href={item.url} className="flex items-center gap-3">
                    <div className="[&>svg]:w-5 [&>svg]:h-5 shrink-0">
                        {item.icon}
                    </div>
                    <span className="text-[15px] tracking-wide">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
