// components/katalog/product-actions.tsx
"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, Copy, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Battery } from "@/types/battery"
import { toast } from "sonner"
import { DeleteProductDialog } from "@/components/katalog/delete-product-dialog"
import { EditProductDialog } from "@/components/katalog/edit-product-dialog"
import { useRouter } from "next/navigation"
import { revalidateProducts } from "@/app/actions/revalidate"

interface ProductActionsProps {
    battery: Battery
}

export function ProductActions({ battery }: ProductActionsProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const router = useRouter()

    const handleCopyId = () => {
        navigator.clipboard.writeText(battery.id)
        toast.success("ID produk berhasil disalin")
    }

    const handleView = () => {
        window.open(`/katalog/product/${battery.slug}`, "_blank")
    }

    const handleSuccess = async () => {
        await revalidateProducts(battery.slug)
        router.refresh()
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleCopyId}>
                        <Copy className="mr-2 h-4 w-4" />
                        Salin ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleView}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <EditProductDialog
                product={battery}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={handleSuccess}
            />

            {/* Delete Dialog */}
            <DeleteProductDialog
                product={battery}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onSuccess={handleSuccess}
            />
        </>
    )
}
