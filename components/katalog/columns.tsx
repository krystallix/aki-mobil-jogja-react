// components/katalog/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Battery } from "@/types/battery"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ProductActions } from "./product-actions"

export const columns: ColumnDef<Battery>[] = [
    {
        accessorKey: "gambar",
        header: "Gambar",
        cell: ({ row }) => {
            const gambar = row.getValue("gambar") as string | null
            return (
                <div className="w-12 h-12 relative">
                    {gambar ? (
                        <Image
                            src={gambar}
                            alt={row.getValue("nama")}
                            fill
                            className="object-cover rounded-md"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "nama",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nama Produk
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("nama")}</div>
        },
    },
    {
        accessorKey: "merek",
        header: "Merek",
        cell: ({ row }) => {
            const merek = row.getValue("merek") as string | null
            return merek ? (
                <Badge variant="outline">{merek}</Badge>
            ) : (
                <span className="text-muted-foreground text-sm">-</span>
            )
        },
    },
    {
        accessorKey: "kategori",
        header: "Kategori",
        cell: ({ row }) => {
            const kategori = row.getValue("kategori") as string | null

            let bgColor = ""
            if (kategori) {
                const kategoriLower = kategori.toLowerCase()
                if (kategoriLower.includes("basah")) {
                    bgColor = "bg-blue-200"
                } else if (kategoriLower.includes("mf") || kategoriLower.includes("kering")) {
                    bgColor = "bg-lime-200"
                }
            }

            return kategori ? (
                <Badge className={bgColor} variant="secondary">
                    {kategori}
                </Badge>
            ) : (
                <span className="text-muted-foreground text-sm">-</span>
            )
        },
    },
    {
        accessorKey: "specifications",
        header: "Ampere",
        cell: ({ row }) => {
            const specs = row.getValue("specifications") as Battery["specifications"]
            const spec = specs && specs.length > 0 ? specs[0] : null

            if (!spec) return <span className="text-muted-foreground text-sm">-</span>

            return (
                <div className="flex flex-col gap-1 text-sm">
                    {spec.kapasitas && <span>{spec.kapasitas}</span>}
                </div>
            )
        },
    },
    {
        accessorKey: "harga_jual",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Harga Jual
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("harga_jual"))
            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "harga_tukar",
        header: "Harga Tukar",
        cell: ({ row }) => {
            const amount = row.getValue("harga_tukar") as number | null
            if (!amount) return <span className="text-muted-foreground text-sm">-</span>

            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(amount)
            return <div>{formatted}</div>
        },
    },
    {
        accessorKey: "harga_modal",
        header: "Harga Modal",
        cell: ({ row }) => {
            const amount = row.getValue("harga_modal") as number | null
            if (!amount) return <span className="text-muted-foreground text-sm">-</span>

            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(amount)
            return <div>{formatted}</div>
        },
    },
    {
        accessorKey: "stok",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Stok
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const stok = row.getValue("stok") as number
            const variant = stok > 10 ? "default" : stok > 0 ? "secondary" : "destructive"
            return <Badge variant={variant}>{stok} unit</Badge>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ProductActions battery={row.original} />,
    },
]
