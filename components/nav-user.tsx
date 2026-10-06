"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { LogOutIcon, Settings } from "lucide-react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-10 px-2 rounded-xl transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Avatar className="h-7 w-7 rounded-full shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full bg-neutral-900 text-white text-[10px] font-bold">SA</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-[13px] leading-tight ml-1">
                <span className="truncate font-semibold text-neutral-800 dark:text-neutral-200">{user.name}</span>
                <span className="text-neutral-400 truncate text-[11px]">
                  {user.email}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-52 rounded-xl border-neutral-200 shadow-md p-1.5"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem className="text-xs rounded-lg cursor-pointer">
              <Settings className="w-3.5 h-3.5 mr-2" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs rounded-lg text-rose-600 focus:text-rose-600 cursor-pointer">
              <LogOutIcon className="w-3.5 h-3.5 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
