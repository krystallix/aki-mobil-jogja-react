"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { X, ImageIcon, Save } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { uploadProductImage, createProduct, ProductData, deleteProductImage } from "@/lib/supabase/queries"
import { revalidateProducts } from "@/app/actions/revalidate"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface FormValues {
    nama: string
    merek: string
    kategori: string
    tipe: string
    harga_modal: number | ""
    harga_jual: number | ""
    harga_tukar: number | ""
    stok: number | ""
    garansi: string
    kondisi: string
    kapasitas: string
    voltase: string
    polaritas: string
    panjang: number | ""
    lebar: number | ""
    tinggi: number | ""
    berat: number | ""
}

interface AddProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

// Component untuk label dengan asterisk merah
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <span>
        {children} <span className="text-destructive">*</span>
    </span>
)

export function AddProductDialog({ open, onOpenChange, onSuccess }: AddProductDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("")
    const [mobil, setMobil] = useState<string[]>([])
    const [mobilInput, setMobilInput] = useState("")
    const supabase = createClient()
    const router = useRouter()

    const form = useForm<FormValues>({
        defaultValues: {
            nama: "",
            merek: "",
            kategori: "",
            tipe: "",
            harga_modal: "",
            harga_jual: "",
            harga_tukar: "",
            stok: "",
            garansi: "",
            kondisi: "baru",
            kapasitas: "",
            voltase: "",
            polaritas: "",
            panjang: "",
            lebar: "",
            tinggi: "",
            berat: "",
        },
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("File harus berupa gambar")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 5MB")
            return
        }

        setImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview("")
    }

    const handleMobilKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "," || e.key === "Enter") {
            e.preventDefault()
            const trimmed = mobilInput.trim()
            if (trimmed && !mobil.includes(trimmed)) {
                setMobil([...mobil, trimmed])
            }
            setMobilInput("")
        } else if (e.key === "Backspace" && mobilInput === "" && mobil.length > 0) {
            e.preventDefault()
            setMobil(mobil.slice(0, -1))
        }
    }

    const handleMobilBlur = () => {
        const trimmed = mobilInput.trim()
        if (trimmed && !mobil.includes(trimmed)) {
            setMobil([...mobil, trimmed])
            setMobilInput("")
        }
    }

    const removeMobil = (item: string) => {
        setMobil(mobil.filter((m) => m !== item))
    }

    // Handler untuk number input yang bisa kosong
    const handleNumberChange = (field: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === "") {
            field.onChange("")
        } else {
            const num = Number(value)
            if (!isNaN(num)) {
                field.onChange(num)
            }
        }
    }

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)

        // Variable untuk tracking image URL
        let gambarUrl: string | null = null
        let isImageUploaded = false

        try {
            // 1. Upload image jika ada
            if (imageFile) {
                gambarUrl = await uploadProductImage(
                    supabase,
                    imageFile,
                    values.merek,
                    values.kategori,
                    values.tipe
                )

                if (!gambarUrl) {
                    toast.error("Gagal upload gambar")
                    return
                }

                isImageUploaded = true
            }

            // 2. Prepare data
            const productData: ProductData = {
                nama: values.nama,
                kategori: values.kategori,
                merek: values.merek,
                tipe: values.tipe,
                harga_modal: values.harga_modal === "" ? 0 : Number(values.harga_modal),
                harga_tukar: values.harga_tukar === "" ? null : Number(values.harga_tukar) || null,
                harga_jual: values.harga_jual === "" ? 0 : Number(values.harga_jual),
                stok: values.stok === "" ? 0 : Number(values.stok),
                garansi: values.garansi || null,
                gambar: gambarUrl,
                kondisi: values.kondisi || "baru",
            }

            const specData = {
                kapasitas: values.kapasitas,
                voltase: values.voltase,
                panjang: values.panjang === "" ? null : Number(values.panjang) || null,
                lebar: values.lebar === "" ? null : Number(values.lebar) || null,
                tinggi: values.tinggi === "" ? null : Number(values.tinggi) || null,
                berat: values.berat === "" ? null : Number(values.berat) || null,
                polaritas: values.polaritas || null,
            }

            // 3. Create product dengan transaction (semua atau tidak sama sekali)
            await createProduct(supabase, productData, specData, mobil)

            // 4. Reset form (hanya jika sukses)
            form.reset()
            setImageFile(null)
            setImagePreview("")
            setMobil([])
            setMobilInput("")
            onOpenChange(false)

            await revalidateProducts()
            router.refresh()
            toast.success("Produk berhasil ditambahkan!")
            onSuccess?.()

        } catch (error: any) {
            console.error("Error creating product:", error)

            // Rollback: Hapus gambar jika sudah diupload tapi insert gagal
            if (isImageUploaded && gambarUrl) {
                try {
                    await deleteProductImage(supabase, gambarUrl)
                } catch (deleteError) {
                    console.error("Failed to rollback image:", deleteError)
                }
            }

            // Show user-friendly error
            const errorMessage = error?.message || "Gagal menambahkan produk"
            toast.error(errorMessage)

        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:max-w-5xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-xl">Tambah Produk Baru</DialogTitle>
                    <DialogDescription>
                        Lengkapi informasi detail produk baterai/aki di bawah ini. Field bertanda <span className="text-destructive">*</span> wajib diisi.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                                {/* SISI KIRI: PREVIEW GAMBAR (1:1) */}
                                <div className="md:col-span-4">
                                    <div className="sticky top-0 space-y-4">
                                        <FormLabel className="text-sm font-semibold">Gambar Produk</FormLabel>
                                        {imagePreview ? (
                                            <div className="relative aspect-square w-full border-2 border-muted rounded-xl overflow-hidden bg-muted/20">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                                                    onClick={removeImage}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center aspect-square w-full border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all group">
                                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                                    <ImageIcon className="w-10 h-10 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    <p className="text-sm font-medium">Unggah Foto</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Format 1:1 disarankan<br />(Max 5MB)
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        )}
                                        <div className="hidden md:block p-3 bg-primary/5 rounded-lg border border-primary/10">
                                            <p className="text-[11px] text-primary/80 leading-relaxed">
                                                <strong>Tips:</strong> Pastikan pencahayaan cukup agar spesifikasi pada label aki terbaca jelas oleh pembeli.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* SISI KANAN: FORM INPUT */}
                                <div className="md:col-span-8 space-y-8">

                                    {/* Bagian 1: Informasi Dasar */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm flex gap-2 font-bold text-primary uppercase tracking-wider border-b pb-2">
                                            <div className="w-1 h-5 bg-primary" />
                                            Informasi Dasar
                                        </h3>
                                        <FormField
                                            control={form.control}
                                            name="nama"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">
                                                        <RequiredLabel>Nama Produk</RequiredLabel>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Contoh: GS Astra NS60L Maintenance Free" className="h-10" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="merek"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">
                                                            <RequiredLabel>Merek</RequiredLabel>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="GS Astra" className="h-10" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="tipe"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">
                                                            <RequiredLabel>Tipe</RequiredLabel>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="NS60L" className="h-10" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="kategori"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">
                                                            <RequiredLabel>Kategori</RequiredLabel>
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-10">
                                                                    <SelectValue placeholder="Pilih Kategori" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Aki Basah">Aki Basah</SelectItem>
                                                                <SelectItem value="Aki Kering (MF)">Aki Kering (MF)</SelectItem>
                                                                <SelectItem value="Aki Hybrid">Aki Hybrid</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="garansi"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Masa Garansi</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="12 Bulan" className="h-10" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Bagian 2: Harga & Stok */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm flex gap-2 font-bold text-primary uppercase tracking-wider border-b pb-2">
                                            <div className="w-1 h-5 bg-primary" />
                                            Harga & Stok
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="harga_modal"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">
                                                            <RequiredLabel>Harga Modal (Rp)</RequiredLabel>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                className="h-10"
                                                                value={field.value}
                                                                onChange={handleNumberChange(field)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="harga_jual"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">
                                                            <RequiredLabel>Harga Jual (Rp)</RequiredLabel>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                className="h-10"
                                                                value={field.value}
                                                                onChange={handleNumberChange(field)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="harga_tukar"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Harga Tukar Tambah (Rp)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                className="h-10"
                                                                value={field.value}
                                                                onChange={handleNumberChange(field)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="stok"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">
                                                            <RequiredLabel>Stok Unit</RequiredLabel>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                className="h-10"
                                                                value={field.value}
                                                                onChange={handleNumberChange(field)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Bagian 3: Spesifikasi Teknis */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm flex gap-2 font-bold text-primary uppercase tracking-wider border-b pb-2">
                                            <div className="w-1 h-5 bg-primary" />
                                            Spesifikasi
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="kapasitas"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">
                                                            <RequiredLabel>Kapasitas (Ah)</RequiredLabel>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="contoh: 45"
                                                                className="h-10"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="voltase"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">
                                                            <RequiredLabel>Voltase</RequiredLabel>
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-10">
                                                                    <SelectValue placeholder="Pilih" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="12V">12V</SelectItem>
                                                                <SelectItem value="24V">24V</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="polaritas"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Polaritas</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-10">
                                                                    <SelectValue placeholder="Pilih" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="L">L (Kiri)</SelectItem>
                                                                <SelectItem value="R">R (Kanan)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Ukuran & Berat */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="panjang"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Panjang (mm)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                className="h-10"
                                                                value={field.value}
                                                                onChange={handleNumberChange(field)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lebar"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Lebar (mm)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                className="h-10"
                                                                value={field.value}
                                                                onChange={handleNumberChange(field)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="tinggi"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Tinggi (mm)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                className="h-10"
                                                                value={field.value}
                                                                onChange={handleNumberChange(field)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="berat"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Berat (kg)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0"
                                                                className="h-10"
                                                                value={field.value}
                                                                onChange={handleNumberChange(field)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Bagian 4: Kompatibilitas */}
                                    <div className="space-y-4 pb-4">
                                        <h3 className="text-sm flex gap-2 font-bold text-primary uppercase tracking-wider border-b pb-2">
                                            <div className="w-1 h-5 bg-primary" />
                                            Kompatibilitas
                                        </h3>
                                        <div className="space-y-3">
                                            <Input
                                                placeholder="Ketik nama mobil (misal: Avanza), lalu tekan Enter"
                                                value={mobilInput}
                                                onChange={(e) => setMobilInput(e.target.value)}
                                                onKeyDown={handleMobilKeyDown}
                                                onBlur={handleMobilBlur}
                                                className="h-10"
                                            />
                                            {mobil.length > 0 && (
                                                <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-muted/30">
                                                    {mobil.map((item) => (
                                                        <Badge key={item} variant="secondary" className="pl-3 pr-1 py-1 text-sm gap-1">
                                                            {item}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeMobil(item)}
                                                                className="hover:text-destructive"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Contoh: Innova, Fortuner, Avanza (tekan Enter atau koma untuk menambah)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="mt-6 pt-6 border-t flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isSubmitting} >
                                    <Save />
                                    {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
