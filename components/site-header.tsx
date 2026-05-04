import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)]">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1 hover:bg-muted/50 rounded-lg transition-colors" />
        <Separator
          orientation="vertical"
          className="mx-1 h-5 bg-border/60"
        />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
    </header>
  )
}
