import DashboardLayout from "@/components/layouts/dashboard-layout"
import { fetchAllProductsNoStore } from "@/lib/supabase/queries"
import { ProductCardGrid } from "@/components/katalog/product-card-grid"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function KatalogPage() {
    const batteries = await fetchAllProductsNoStore()

    return (
        <DashboardLayout>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 w-full">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-neutral-200/60 dark:border-border/40">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Battery Catalog</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            Manage battery inventory, retail prices, wholesale costs, and specifications.
                        </p>
                    </div>
                </div>

                <ProductCardGrid data={batteries} />
            </div>
        </DashboardLayout>
    )
}