export interface BatterySpecification {
    id?: number
    product_id?: string
    kapasitas: string
    voltase: string
    polaritas: string | null
    panjang: number | null
    lebar: number | null
    tinggi: number | null
    berat: number | null
}

export interface BatteryApplication {
    nama_mobil: string
}

export interface Battery {
    id: string
    nama: string
    merek: string
    tipe: string  // Tambahkan ini
    kategori: string
    harga_modal: number
    harga_jual: number
    harga_tukar: number | null
    stok: number
    garansi: string | null
    gambar: string | null
    kondisi: string
    created_at?: string
    updated_at?: string
    specifications?: BatterySpecification[]
    applications?: BatteryApplication[]
}
