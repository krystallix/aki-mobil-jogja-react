// components/edit-product-dialog.tsx
"use client"

import { useState, useEffect, useRef } from "react"
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
import {
    uploadProductImage,
    deleteProductImage,
} from "@/lib/supabase/queries"
import { revalidateProducts } from "@/app/actions/revalidate"
import { toast } from "sonner"
import { Battery } from "@/types/battery"
import Image from "next/image"

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

interface EditProductDialogProps {
    product: Battery | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <span>
        {children} <span className="text-destructive">*</span>
    </span>
)

export function EditProductDialog({ product, open, onOpenChange, onSuccess }: EditProductDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("")
    const [imageChanged, setImageChanged] = useState(false)
    const [mobil, setMobil] = useState<string[]>([])
    const [mobilInput, setMobilInput] = useState("")

    const originalImageRef = useRef<string | null>(null)
    const supabase = createClient()

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

    useEffect(() => {
        if (product && open) {
            // Supabase bisa return specifications sebagai object atau array
            const rawSpec = product.specifications
            const spec = Array.isArray(rawSpec) ? rawSpec[0] : rawSpec
            const apps = product.applications?.map((app: any) => app.nama_mobil) || []

            console.log("[EDIT DIALOG] spec resolved:", spec)
            console.log("[EDIT DIALOG] kapasitas:", spec?.kapasitas)
            form.reset({
                nama: product.nama || "",
                merek: product.merek || "",
                kategori: product.kategori || "",
                tipe: product.tipe || "",
                harga_modal: product.harga_modal || "",
                harga_jual: product.harga_jual || "",
                harga_tukar: product.harga_tukar || "",
                stok: product.stok || "",
                garansi: product.garansi || "",
                kondisi: product.kondisi || "baru",
                kapasitas: spec?.kapasitas || "",
                voltase: spec?.voltase || "",
                polaritas: spec?.polaritas || "",
                panjang: spec?.panjang || "",
                lebar: spec?.lebar || "",
                tinggi: spec?.tinggi || "",
                berat: spec?.berat || "",
            })

            const imageUrl = product.gambar || null
            originalImageRef.current = imageUrl

            setImagePreview(imageUrl || "")
            setImageChanged(false)
            setImageFile(null)
            setMobil(apps)
        }
    }, [product, open, form])

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
        setImageChanged(true)
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview("")
        setImageChanged(true)
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
        if (!product) return

        setIsSubmitting(true)

        let oldImageUrl: string | null = originalImageRef.current
        let newImageUrl: string | null = null

        let imageWasUploaded = false
        let imageWasRemoved = false
        let imageShouldBeMoved = false

        try {
            if (imageChanged) {
                if (imageFile) {
                    newImageUrl = await uploadProductImage(
                        supabase,
                        imageFile,
                        values.merek,
                        values.kategori,
                        values.tipe
                    )

                    if (!newImageUrl) {
                        toast.error("Gagal upload gambar")
                        return
                    }

                    imageWasUploaded = true
                } else {
                    newImageUrl = null
                    imageWasRemoved = true
                }
            } else {
                const merekChanged = values.merek !== product.merek
                const kategoriChanged = values.kategori !== product.kategori
                const tipeChanged = values.tipe !== product.tipe

                if ((merekChanged || kategoriChanged || tipeChanged) && oldImageUrl) {
                    try {
                        const response = await fetch(oldImageUrl)
                        const blob = await response.blob()
                        const file = new File([blob], "image.jpg", { type: blob.type })

                        newImageUrl = await uploadProductImage(
                            supabase,
                            file,
                            values.merek,
                            values.kategori,
                            values.tipe
                        )

                        if (!newImageUrl) {
                            toast.error("Gagal memindahkan gambar")
                            return
                        }
                        imageShouldBeMoved = true
                    } catch (fetchError) {
                        console.error("Failed to move image:", fetchError)
                        toast.error("Gagal memindahkan gambar")
                        return
                    }
                } else {
                    newImageUrl = oldImageUrl
                }
            }

            const productData = {
                nama: values.nama,
                kategori: values.kategori,
                merek: values.merek,
                tipe: values.tipe,
                harga_modal: values.harga_modal === "" ? 0 : Number(values.harga_modal),
                harga_tukar: values.harga_tukar === "" ? null : Number(values.harga_tukar),
                harga_jual: values.harga_jual === "" ? 0 : Number(values.harga_jual),
                stok: values.stok === "" ? 0 : Number(values.stok),
                garansi: values.garansi || null,
                gambar: newImageUrl,
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

            // 1. Update tabel products langsung
            console.log("[EDIT] Updating product:", product.id, productData)
            const { error: productError } = await supabase
                .from("products")
                .update(productData)
                .eq("id", product.id)

            if (productError) {
                console.error("[EDIT] Product update error:", productError)
                throw productError
            }
            console.log("[EDIT] Product updated ✅")

            // 2. Upsert spesifikasi (insert jika belum ada, update jika sudah ada)
            const specPayload = {
                product_id: product.id,
                kapasitas: specData.kapasitas || "",
                voltase: specData.voltase || "",
                panjang: specData.panjang,
                lebar: specData.lebar,
                tinggi: specData.tinggi,
                berat: specData.berat,
                polaritas: specData.polaritas,
            }
            console.log("[EDIT] Upserting specifications:", specPayload)
            const { data: specResult, error: specError } = await supabase
                .from("specifications")
                .upsert(specPayload, { onConflict: "product_id" })
                .select()

            console.log("[EDIT] Spec upsert result:", specResult)
            console.log("[EDIT] Spec upsert error:", specError)

            if (specError) throw specError
            console.log("[EDIT] Specifications upserted ✅")

            // 3. Hapus dan re-insert daftar kendaraan
            console.log("[EDIT] Deleting old applications for:", product.id)
            const { error: deleteAppError } = await supabase
                .from("applications")
                .delete()
                .eq("product_id", product.id)

            if (deleteAppError) {
                console.error("[EDIT] Delete applications error:", deleteAppError)
                throw deleteAppError
            }
            console.log("[EDIT] Old applications deleted ✅")

            if (!isJasa && mobil.length > 0) {
                const appRows = mobil.map((nama) => ({ product_id: product.id, nama_mobil: nama }))
                console.log("[EDIT] Inserting applications:", appRows.length, "items")
                const { error: insertAppError } = await supabase
                    .from("applications")
                    .insert(appRows)

                if (insertAppError) {
                    console.error("[EDIT] Insert applications error:", insertAppError)
                    throw insertAppError
                }
                console.log("[EDIT] Applications inserted ✅")
            }

            const shouldDeleteOld = imageWasUploaded || imageWasRemoved || imageShouldBeMoved

            if (shouldDeleteOld && oldImageUrl) {
                try {
                    const deleted = await deleteProductImage(supabase, oldImageUrl)

                    if (!deleted) {
                        console.warn("Delete returned false")
                    }
                } catch (deleteError) {
                    console.error("Delete error:", deleteError)
                }
            }

            toast.success("Produk berhasil diperbarui!")
            await revalidateProducts(product.id)
            onOpenChange(false)
            onSuccess?.()

        } catch (error: any) {
            console.error("Update error:", error)

            if (imageWasUploaded && newImageUrl) {
                try {
                    await deleteProductImage(supabase, newImageUrl)
                } catch (rollbackError) {
                    console.error("Rollback failed:", rollbackError)
                }
            }

            toast.error(error?.message || "Gagal memperbarui produk")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!product) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-1rem)] sm:w-full md:max-w-5xl max-h-[95vh] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden p-0 flex flex-col border border-border/60 shadow-2xl bg-background/95 backdrop-blur-2xl">
                <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/20">
                    <DialogTitle className="text-2xl font-extrabold tracking-tight">Edit Produk</DialogTitle>
                    <DialogDescription className="text-[13px] font-medium text-muted-foreground mt-1">
                        Perbarui informasi produk. Field bertanda <span className="text-destructive">*</span>{" "}
                        wajib diisi.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                <div className="md:col-span-4">
                                    <div className="sticky top-0 space-y-4">
                                        <FormLabel className="text-sm font-semibold">Gambar Produk</FormLabel>
                                        {imagePreview ? (
                                            <div className="relative aspect-square w-full border border-border/50 rounded-[1.5rem] overflow-hidden bg-muted/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-contain"
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
                                            <label className="flex flex-col items-center justify-center aspect-square w-full rounded-[1.5rem] border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 hover:border-primary/40 transition-all duration-300 group shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                                    <div className="w-14 h-14 mb-3 rounded-full bg-background border border-border/50 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                        <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <p className="text-[15px] font-bold">Unggah Foto</p>
                                                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
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
                                                <strong>Tips:</strong> Upload gambar baru akan mengganti gambar lama.
                                                Gambar lama akan otomatis dihapus.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-8 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-[12px] flex items-center gap-2.5 font-black uppercase tracking-widest text-muted-foreground pb-2">
                                            <div className="w-1.5 h-4 bg-primary rounded-full" />
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
                                                        <Input
                                                            placeholder="Contoh: GS Astra NS60L Maintenance Free"
                                                            className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30"
                                                            {...field}
                                                        />
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
                                                                <SelectItem value="Aki Kering (MF)">
                                                                    Aki Kering (MF)
                                                                </SelectItem>
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
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[12px] flex items-center gap-2.5 font-black uppercase tracking-widest text-muted-foreground pb-2">
                                            <div className="w-1.5 h-4 bg-primary rounded-full" />
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
                                                            <FormLabel className="text-xs font-semibold">Harga Tukar Tambah (Rp)</FormLabel>
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
                                                        <FormLabel className="text-xs font-semibold">Stok Unit</FormLabel>
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
                                    </div>

                                    {!isJasa && (
                                        <>
                                            <div className="space-y-4">
                                                <h3 className="text-[12px] flex items-center gap-2.5 font-black uppercase tracking-widest text-muted-foreground pb-2">
                                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                                    Spesifikasi
                                                </h3>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="kapasitas"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-semibold">Kapasitas (Ah)</FormLabel>
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
                                                                <FormLabel className="text-xs font-semibold">Voltase</FormLabel>
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
                                                                <FormLabel className="text-xs font-semibold">Polaritas</FormLabel>
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
                                                        name="lebar"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Lebar (mm)</FormLabel>
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
                                                        name="tinggi"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Tinggi (mm)</FormLabel>
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
                                                        name="berat"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Berat (kg)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
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
                                            </div>

                                            <div className="space-y-4 pb-4">
                                                <h3 className="text-[12px] flex items-center gap-2.5 font-black uppercase tracking-widest text-muted-foreground pb-2">
                                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                                    Kompatibilitas
                                                </h3>
                                                <div className="space-y-3">
                                                    <Input
                                                        placeholder="Ketik nama mobil atau paste daftar (pisah koma)"
                                                        value={mobilInput}
                                                        onChange={(e) => setMobilInput(e.target.value)}
                                                        onKeyDown={handleMobilKeyDown}
                                                        onBlur={handleMobilBlur}
                                                        onPaste={handleMobilPaste}
                                                        className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30"
                                                    />
                                                    {mobil.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-muted/30">
                                                            {mobil.map((item) => (
                                                                <Badge
                                                                    key={item}
                                                                    variant="secondary"
                                                                    className="pl-3 pr-1 py-1 text-sm gap-1"
                                                                >
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
                                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
