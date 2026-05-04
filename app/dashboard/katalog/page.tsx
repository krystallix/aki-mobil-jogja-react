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

                    <h1 className="text-4xl text-indigo-800 font-extrabold tracking-tight">Katalog Produk</h1>
                    <p className="text-md text-muted-foreground font-light mt-0.5">
                        Kelola produk
                    </p>
                </div>

                <ProductCardGrid data={batteries} />
            </div>
        </DashboardLayout>
    )
}