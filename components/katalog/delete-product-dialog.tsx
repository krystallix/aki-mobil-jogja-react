// components/delete-product-dialog.tsx
"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Battery } from "@/types/battery"
import { createClient } from "@/lib/supabase/client"
import { deleteProductWithTransaction } from "@/lib/supabase/queries"
import { toast } from "sonner"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"

interface DeleteProductDialogProps {
    product: Battery | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteProductDialog({
    product,
    open,
    onOpenChange,
    onSuccess,
}: DeleteProductDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const supabase = createClient()

    const handleDelete = async () => {
        if (!product) return

        setIsDeleting(true)
        try {
            await deleteProductWithTransaction(supabase, product.id)
            toast.success("Produk berhasil dihapus")
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            console.error("Error deleting product:", error)
            toast.error(error.message || "Gagal menghapus produk")
        } finally {
            setIsDeleting(false)
        }
    }

    if (!product) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <div className="p-2 bg-destructive/10 rounded-full">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                    </div>
                    {/* Menggunakan asChild atau div agar tidak error p-nesting */}
                    <div className="text-sm text-muted-foreground pt-2">
                        Anda akan menghapus produk berikut secara permanen dari database.
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Produk yang dipilih:
                        </p>
                        <p className="text-sm font-bold mt-1 text-foreground">
                            {product.nama}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            ID: {product.id.substring(0, 8)}...
                        </p>
                    </div>

                    <div className="mt-4 space-y-2">
                        <p className="text-[13px] font-semibold text-destructive flex items-center gap-2">
                            Konsekuensi:
                        </p>
                        <ul className="text-xs space-y-1.5 text-muted-foreground list-none">
                            <li className="flex items-start gap-2">
                                <span className="h-1 w-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                                Data spesifikasi akan dihapus.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1 w-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                                Relasi kompatibilitas mobil akan dihapus.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1 w-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                                File gambar di storage akan dihapus.
                            </li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="gap-2 md:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                        className="flex-1"
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menghapus...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Produk
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}