import DashboardLayout from "@/components/layouts/dashboard-layout"
import { fetchAllProducts } from "@/lib/supabase/queries"
import { columns } from "@/components/katalog/columns"
import { DataTable } from "@/components/katalog/data-table"

export default async function KatalogPage() {
    const batteries = await fetchAllProducts()

    return (
        <DashboardLayout>
            <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold">Katalog Baterai</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola katalog baterai kendaraan
                        </p>
                    </div>
                </div>
                <DataTable columns={columns} data={batteries} />
            </div>
        </DashboardLayout>
    )
}