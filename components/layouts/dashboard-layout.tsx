import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "15rem",
                    "--header-height": "3.5rem",
                } as React.CSSProperties
            }
            className="bg-[#f5f5f7] dark:bg-background"
        >
            <AppSidebar />
            <SidebarInset className="bg-[#fbfbfd] dark:bg-background/90 min-h-screen flex flex-col">
                <SiteHeader />
                <div className="flex-1 w-full">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
