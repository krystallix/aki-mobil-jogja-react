import DashboardLayout from "@/components/layouts/dashboard-layout"
import GeneratorClient from "@/components/layanan/generator-client"
import { fetchAllProducts } from "@/lib/supabase/queries"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: "Generator Konten - Siswanto Aki",
  description: "Generator gambar konten sosial media",
}

export default async function LayananPage() {
  const products = await fetchAllProducts()

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 mt-3">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl text-indigo-800 font-extrabold tracking-tight">Generator Konten</h1>
          <p className="text-md text-muted-foreground font-light mt-1">
            Pilih produk untuk membuat konten spesifikasi sosial media dengan ukuran 1:1
          </p>
        </div>

        <GeneratorClient products={products} />
      </div>
    </DashboardLayout>
  )
}
