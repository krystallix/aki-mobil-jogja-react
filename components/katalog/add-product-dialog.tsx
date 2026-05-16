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

    const selectedKategori = form.watch("kategori")
    const isJasa = selectedKategori === "Jasa"

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

    const addMobil = () => {
        const trimmed = mobilInput.trim()
        if (trimmed && !mobil.includes(trimmed)) {
            setMobil([...mobil, trimmed])
        }
        setMobilInput("")
    }

    const handleMobilKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "," || e.key === "Enter") {
            e.preventDefault()
            addMobil()
        } else if (e.key === "Backspace" && mobilInput === "" && mobil.length > 0) {
            e.preventDefault()
            setMobil(mobil.slice(0, -1))
        }
    }

    const handleMobilBlur = () => {
        addMobil()
    }

    const handleMobilPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData("text")
        if (!pasted.includes(",")) return
        e.preventDefault()
        const parts = pasted
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        
        setMobil((prev) => {
            const merged = [...prev]
            parts.forEach((p) => { if (!merged.includes(p)) merged.push(p) })
            return merged
        })
        setMobilInput("")
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
                kapasitas: isJasa ? "-" : values.kapasitas,
                voltase: isJasa ? "-" : values.voltase,
                panjang: values.panjang === "" || isJasa ? null : Number(values.panjang) || null,
                lebar: values.lebar === "" || isJasa ? null : Number(values.lebar) || null,
                tinggi: values.tinggi === "" || isJasa ? null : Number(values.tinggi) || null,
                berat: values.berat === "" || isJasa ? null : Number(values.berat) || null,
                polaritas: isJasa ? null : values.polaritas || null,
            }

            // 3. Create product dengan transaction (semua atau tidak sama sekali)
            await createProduct(supabase, productData, specData, isJasa ? [] : mobil)

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
                                                        <Input placeholder="Contoh: GS Astra NS60L Maintenance Free" className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30" {...field} />
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
                                                            <Input placeholder="GS Astra" className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30" {...field} />
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
                                                            <Input placeholder="NS60L" className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30" {...field} />
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
                                                                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30">
                                                                    <SelectValue placeholder="Pilih Kategori" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Aki Basah">Aki Basah</SelectItem>
                                                                <SelectItem value="Aki Kering (MF)">Aki Kering (MF)</SelectItem>
                                                                <SelectItem value="Aki Hybrid">Aki Hybrid</SelectItem>
                                                                <SelectItem value="Jasa">Jasa</SelectItem>
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
                                                            <Input placeholder="12 Bulan" className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30" {...field} />
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
                                                                className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30"
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
                                                                className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30"
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
                                            {!isJasa && (
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
                                                                    className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30"
                                                                    value={field.value}
                                                                    onChange={handleNumberChange(field)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                            <FormField
                                                control={form.control}
                                                name="stok"
                                                render={({ field }) => (
                                                    <FormItem className={isJasa ? "sm:col-span-2" : ""}>
                                                        <FormLabel className="text-xs">
                                                            <RequiredLabel>Stok Unit</RequiredLabel>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30"
                                                                value={isJasa && field.value === "" ? 999 : field.value}
                                                                onChange={handleNumberChange(field)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {!isJasa && (
                                        <>
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
                                                                        className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30"
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
                                                                        <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30">
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
                                                                        <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30">
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
                                                                <FormLabel className="text-xs text-muted-foreground">Panjang</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" placeholder="0" className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30" {...field} onChange={handleNumberChange(field)} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="lebar"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs text-muted-foreground">Lebar</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" placeholder="0" className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30" {...field} onChange={handleNumberChange(field)} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="tinggi"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs text-muted-foreground">Tinggi</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" placeholder="0" className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30" {...field} onChange={handleNumberChange(field)} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="berat"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs text-muted-foreground">Berat (kg)</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" placeholder="0" className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30" {...field} onChange={handleNumberChange(field)} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Bagian 4: Aplikasi Kendaraan */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm flex gap-2 font-bold text-primary uppercase tracking-wider border-b pb-2">
                                                    <div className="w-1 h-5 bg-primary" />
                                                    Aplikasi Kendaraan
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Tambah model mobil (contoh: Avanza, Xpander...)"
                                                            value={mobilInput}
                                                            onChange={(e) => setMobilInput(e.target.value)}
                                                            onKeyDown={handleMobilKeyDown}
                                                            onBlur={handleMobilBlur}
                                                            onPaste={handleMobilPaste}
                                                            className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30"
                                                        />
                                                        <Button type="button" onClick={addMobil} variant="secondary" className="h-12 rounded-xl font-bold">Tambah</Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                                                        {mobil.length === 0 && (
                                                            <p className="text-xs text-muted-foreground py-1 px-1">Belum ada data mobil yang ditambahkan.</p>
                                                        )}
                                                        {mobil.map((m) => (
                                                            <Badge key={m} variant="secondary" className="pl-3 pr-1 py-1 h-7 gap-1 bg-white border-primary/20 text-primary hover:bg-white">
                                                                {m}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5 rounded-full hover:bg-destructive hover:text-white"
                                                                    onClick={() => removeMobil(m)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="mt-6 px-6 py-5 border-t border-border/40 bg-muted/10 flex gap-3 sm:rounded-b-[2rem]">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto h-12 rounded-xl font-bold border-border/60 hover:bg-muted/50"
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl font-bold w-full sm:w-auto shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)]">
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
