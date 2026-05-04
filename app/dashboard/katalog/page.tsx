import DashboardLayout from "@/components/layouts/dashboard-layout"
import { fetchAllProducts } from "@/lib/supabase/queries"
import { ProductCardGrid } from "@/components/katalog/product-card-grid"

export default async function KatalogPage() {
    const batteries = await fetchAllProducts()

    return (
        <DashboardLayout>
            <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6">
                {/* Page Header */}
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 text-[10px] font-bold tracking-widest uppercase border rounded-full border-border/60 bg-card text-muted-foreground">
                        <span>Dashboard</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Katalog Produk</h1>
                    <p className="text-sm text-muted-foreground font-light mt-0.5">
                        Kelola inventaris aki kendaraan — {batteries.length} produk tersedia
                    </p>
                </div>

                <ProductCardGrid data={batteries} />
            </div>
        </DashboardLayout>
    )
}