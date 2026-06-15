import { createClient, createNoStoreClient } from "@/lib/supabase/client"
import { SupabaseClient } from "@supabase/supabase-js"
import { ProductData, SpecificationData, ProductFilters } from "./types"
import { deleteProductImage } from "./storage"

// ============================================
// PRODUCT CRUD OPERATIONS
// ============================================

export async function createProduct(
    supabase: SupabaseClient,
    productData: ProductData,
    specData: Omit<SpecificationData, "product_id">,
    applications: string[]
) {
    const { data, error } = await supabase.rpc("create_product_with_transaction", {
        p_nama: productData.nama,
        p_kategori: productData.kategori,
        p_merek: productData.merek,
        p_tipe: productData.tipe,
        p_harga_modal: productData.harga_modal,
        p_harga_tukar: productData.harga_tukar,
        p_harga_jual: productData.harga_jual,
        p_stok: productData.stok,
        p_garansi: productData.garansi,
        p_gambar: productData.gambar,
        p_kondisi: productData.kondisi,
        p_kapasitas: specData.kapasitas,
        p_voltase: specData.voltase,
        p_polaritas: specData.polaritas || null,
        p_panjang: specData.panjang || null,
        p_lebar: specData.lebar || null,
        p_tinggi: specData.tinggi || null,
        p_berat: specData.berat || null,
        p_applications: applications,
    })

    if (error) throw error

    if (data && !data.success) {
        throw new Error(data.error || "Failed to create product")
    }

    return data?.data
}

export const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("products").select("kategori").order("kategori")

    return Array.from(new Set(data?.map((item: any) => item.kategori) || []))
        .filter(Boolean)
        .map((cat) => ({ id: cat as string, name: cat as string }))
}

export const fetchBrands = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("products").select("merek").order("merek")

    return Array.from(new Set(data?.map((item: any) => item.merek) || []))
        .filter(Boolean)
        .map((brand) => ({ id: brand as string, name: brand as string }))
}

export const fetchCapacities = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("specifications").select("kapasitas")

    return Array.from(new Set(data?.map((item: any) => item.kapasitas) || []))
        .filter(Boolean)
        .sort((a: any, b: any) => parseFloat(a) - parseFloat(b))
        .map((amp) => ({ id: String(amp), name: String(amp) }))
}

export const fetchAllProducts = async () => {
    const supabase = createNoStoreClient()
    const { data, error } = await supabase
        .from("products")
        .select(
            `
            *,
            specifications (
                kapasitas,
                voltase,
                polaritas,
                panjang,
                lebar,
                tinggi,
                berat
            ),
            applications (
                nama_mobil
            )
        `
        )
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching all products:", error)
        return []
    }
    return (data || []).map(item => ({
        ...item,
        specifications: Array.isArray(item.specifications)
            ? item.specifications
            : item.specifications
                ? [item.specifications]
                : [],
        applications: item.applications || [],
    }))
}

export const fetchProducts = async (filters: ProductFilters) => {
    const supabase = createClient()

    let query = supabase.from("products").select(
        `
            *,
            specifications (
                kapasitas,
                voltase,
                polaritas
            ),
            applications (
                nama_mobil
            )
        `
    )

    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
        query = query.in("kategori", filters.selectedCategories)
    }

    if (filters.selectedMereks && filters.selectedMereks.length > 0) {
        query = query.in("merek", filters.selectedMereks)
    }

    if (filters.selectedKondisis && filters.selectedKondisis.length > 0) {
        query = query.in("kondisi", filters.selectedKondisis)
    }

    if (filters.searchQuery) {
        query = query.or(
            `nama.ilike.%${filters.searchQuery}%,merek.ilike.%${filters.searchQuery}%,tipe.ilike.%${filters.searchQuery}%`
        )
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching products:", error)
        return []
    }

    let filteredData = data || []

    if (filters.priceRange && filters.priceRange.length === 2) {
        filteredData = filteredData.filter(
            (p: any) =>
                p.harga_jual >= filters.priceRange![0] && p.harga_jual <= filters.priceRange![1]
        )
    }

    if (filters.selectedAmperes && filters.selectedAmperes.length > 0) {
        filteredData = filteredData.filter((p: any) => {
            const specs = Array.isArray(p.specifications) ? p.specifications : [p.specifications]
            return specs.some((s: any) => filters.selectedAmperes!.includes(s?.kapasitas))
        })
    }

    return filteredData
}

export const fetchProductBySlug = async (slug: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("products")
        .select(
            `
            *,
            specifications (
                kapasitas,
                voltase,
                polaritas,
                panjang,
                lebar,
                tinggi,
                berat
            ),
            applications (
                nama_mobil
            )
        `
        )
        .eq("id", slug)
        .single()

    if (error || !data) {
        console.error("Error fetching product:", error)
        return null
    }

    const specs = Array.isArray(data.specifications)
        ? data.specifications
        : data.specifications
            ? [data.specifications]
            : []

    return {
        ...data,
        specifications: specs,
        applications: data.applications || [],
    }
}

export const fetchRelatedProducts = async (capacity: string, excludeId: string) => {
    const supabase = createClient()
    const { data } = await supabase
        .from("products")
        .select(
            `
            id, slug, nama, gambar, harga_jual, harga_tukar, merek, tipe,
            specifications!inner (kapasitas)
        `
        )
        .eq("specifications.kapasitas", capacity)
        .neq("id", excludeId)
        .limit(4)

    return data || []
}

export async function getProductById(supabase: SupabaseClient, id: string) {
    const { data, error } = await supabase
        .from("products")
        .select(
            `
            *,
            specifications (*),
            applications (*)
        `
        )
        .eq("id", id)
        .single()

    if (error) throw error
    return data
}

export async function updateProductWithTransaction(
    supabase: SupabaseClient,
    productId: string,
    productData: Partial<ProductData>,
    specData?: Partial<Omit<SpecificationData, "product_id">>,
    applications?: string[]
) {
    const { data, error } = await supabase.rpc("update_product_with_transaction", {
        p_product_id: productId,
        p_nama: productData.nama ?? null,
        p_kategori: productData.kategori ?? null,
        p_merek: productData.merek ?? null,
        p_tipe: productData.tipe ?? null,
        p_harga_modal: productData.harga_modal ?? null,
        p_harga_tukar: productData.harga_tukar ?? null,
        p_harga_jual: productData.harga_jual ?? null,
        p_stok: productData.stok ?? null,
        p_garansi: productData.garansi ?? null,
        p_gambar: productData.gambar ?? null,
        p_kondisi: productData.kondisi ?? null,
        p_kapasitas: specData?.kapasitas ?? null,
        p_voltase: specData?.voltase ?? null,
        p_polaritas: specData?.polaritas ?? null,
        p_panjang: specData?.panjang ?? null,
        p_lebar: specData?.lebar ?? null,
        p_tinggi: specData?.tinggi ?? null,
        p_berat: specData?.berat ?? null,
        p_applications: applications ?? null,
    })

    if (error) throw error

    if (data && !data.success) {
        throw new Error(data.error || "Failed to update product")
    }

    return data?.data
}

export async function deleteProductWithTransaction(
    supabase: SupabaseClient,
    productId: string
) {
    const { data, error } = await supabase.rpc("delete_product_with_transaction", {
        p_product_id: productId,
    })

    if (error) throw error

    if (data && !data.success) {
        throw new Error(data.error || "Failed to delete product")
    }

    if (data?.image_url) {
        try {
            const deleted = await deleteProductImage(supabase, data.image_url)
            if (!deleted) {
                console.warn("Failed to delete image from storage:", data.image_url)
            }
        } catch (imageError) {
            console.error("Error deleting image:", imageError)
        }
    }

    return {
        success: true,
        deletedImageUrl: data?.image_url,
    }
}

export async function deleteProductOnly(supabase: SupabaseClient, productId: string) {
    const { data, error } = await supabase.rpc("delete_product_with_transaction", {
        p_product_id: productId,
    })

    if (error) throw error

    if (data && !data.success) {
        throw new Error(data.error || "Failed to delete product")
    }

    return data
}

export async function getProductCount(supabase: SupabaseClient) {
    const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })

    if (error) throw error
    return count || 0
}

export async function getLowStockProducts(supabase: SupabaseClient, threshold: number = 5) {
    const { data, error } = await supabase
        .from("products")
        .select("id, nama, stok, merek")
        .lte("stok", threshold)
        .order("stok", { ascending: true })

    if (error) throw error
    return data || []
}
