"use client"

import React, { useEffect, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Search,
  LogOut,
  Settings,
  LayoutDashboard,
  Battery,
  FileText,
  ShoppingCart,
  Users,
  RotateCcw,
  Sparkles,
  Store,
  PlusCircle,
  ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"

interface SiteHeaderProps {
  searchPlaceholder?: string
}

export function SiteHeader({ searchPlaceholder = "Search transactions, catalog, customers..." }: SiteHeaderProps) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string; name?: string; avatar?: string } | null>(null)
  const [openCommand, setOpenCommand] = useState(false)

  // Listen for Command + K / Ctrl + K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpenCommand((prev) => !prev)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const userMeta = authUser.user_metadata || {}
          const email = authUser.email || ""
          const name = userMeta.full_name || userMeta.name || email.split("@")[0] || "User"
          setUser({
            email,
            name,
            avatar: userMeta.avatar_url || "/avatars/shadcn.jpg",
          })
        } else {
          setUser({
            email: "admin@akimobiljogja.com",
            name: "Siswanto Admin",
            avatar: "/avatars/shadcn.jpg",
          })
        }
      } catch {
        setUser({
          email: "admin@akimobiljogja.com",
          name: "Siswanto Admin",
          avatar: "/avatars/shadcn.jpg",
        })
      }
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navigateTo = (path: string) => {
    setOpenCommand(false)
    router.push(path)
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SA"

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 bg-white/95 dark:bg-card/90 backdrop-blur-md px-4 sm:px-6">
        {/* LEFT: Collapse Sidebar Button + Search Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Button Collapse Sidebar */}
          <SidebarTrigger className="h-8.5 w-8.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0" />

          {/* Global Search Button Trigger for Command Menu */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpenCommand(true)}
            className="relative w-full max-w-md h-8.5 pl-9 pr-9 rounded-lg bg-neutral-100/70 dark:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-neutral-100/80 focus:border-indigo-500 justify-start transition-all cursor-pointer flex items-center font-normal"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <span className="text-xs text-neutral-400 truncate select-none">
              {searchPlaceholder}
            </span>
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 shadow-2xs pointer-events-none hidden sm:inline-block">
              ⌘K
            </kbd>
          </Button>
        </div>

        {/* RIGHT: User Profile Dropdown */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 rounded-full p-0 hover:ring-2 hover:ring-indigo-500/20 transition-all outline-none cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs select-none">
                  {initials}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="w-56 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-lg p-1.5"
            >
              <div className="px-2.5 py-2">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/settings")}
                className="text-xs rounded-lg cursor-pointer py-2"
              >
                <Settings className="w-3.5 h-3.5 mr-2 text-neutral-500" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-xs rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer py-2"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Shadcn Command Palette Modal */}
      <CommandDialog
        open={openCommand}
        onOpenChange={setOpenCommand}
        title="Command Palette"
        description="Search actions, navigation, and shortcuts..."
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => navigateTo("/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span className="flex-1">Revenue Desk &amp; Overview</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
            <CommandItem onSelect={() => navigateTo("/dashboard/katalog")}>
              <Battery className="mr-2 h-4 w-4" />
              <span className="flex-1">Battery Catalog</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
            <CommandItem onSelect={() => navigateTo("/dashboard/transaksi")}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span className="flex-1">POS Transactions</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
            <CommandItem onSelect={() => navigateTo("/dashboard/pelanggan")}>
              <Users className="mr-2 h-4 w-4" />
              <span className="flex-1">Customers CRM</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
            <CommandItem onSelect={() => navigateTo("/dashboard/aki-lama")}>
              <RotateCcw className="mr-2 h-4 w-4" />
              <span className="flex-1">Old Battery Stock</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
            <CommandItem onSelect={() => navigateTo("/dashboard/artikel")}>
              <FileText className="mr-2 h-4 w-4" />
              <span className="flex-1">Articles &amp; Education</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => navigateTo("/dashboard/transaksi")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="flex-1">Create New Transaction</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
            <CommandItem onSelect={() => navigateTo("/rekomendasi-aki")}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span className="flex-1">Open Battery Finder</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
            <CommandItem onSelect={() => navigateTo("/katalog")}>
              <Store className="mr-2 h-4 w-4" />
              <span className="flex-1">View Public Catalog</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Account">
            <CommandItem onSelect={() => navigateTo("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span className="flex-1">Account Settings</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
            <CommandItem onSelect={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4 text-rose-500" />
              <span className="flex-1 text-rose-600">Sign Out</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
