export interface ProductData {
    nama: string
    kategori: string
    merek: string
    tipe: string
    harga_modal: number
    harga_tukar: number | null
    harga_jual: number
    stok: number
    garansi: string | null
    gambar: string | null
    kondisi: string
}

export interface SpecificationData {
    product_id: string
    kapasitas: string
    voltase: string
    panjang: number | null
    lebar: number | null
    tinggi: number | null
    berat: number | null
    polaritas: string | null
}

export interface ApplicationData {
    product_id: string
    nama_mobil: string
}

export interface ProductFilters {
    priceRange?: number[]
    selectedCategories?: string[]
    selectedMereks?: string[]
    selectedKondisis?: string[]
    searchQuery?: string
    selectedAmperes?: string[]
}

export interface ArticleData {
    created_at: any
    id?: string
    title: string
    slug: string
    content: string
    excerpt: string | null
    featured_image: string | null
    tags: string[]
    status: 'draft' | 'published' | 'archived'
    published_at?: string | null
    view_count?: number
}

export interface ArticleFilters {
    status?: 'draft' | 'published' | 'archived'
    searchQuery?: string
    tag?: string
    limit?: number
    page?: number
}

export interface AkiLamaData {
    id: string
    transaction_id: string | null
    keterangan: string
    nilai: number
    status: 'belum_dijual' | 'terjual'
    created_at?: string
    updated_at?: string
}
