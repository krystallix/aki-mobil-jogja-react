"use client"

import * as React from "react"
import Image from "next/image"
import { Battery } from "@/types/battery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    CirclePlus,
    Package,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Eye,
    ArrowUpDown,
    SlidersHorizontal,
    X,
} from "lucide-react"
import { AddProductDialog } from "./add-product-dialog"
import { EditProductDialog } from "./edit-product-dialog"
import { DeleteProductDialog } from "./delete-product-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { revalidateProducts } from "@/app/actions/revalidate"

const ITEMS_PER_PAGE = 12

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount)

const getKondisiStyle = (kondisi: string) => {
    if (kondisi === "baru") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    return "bg-amber-500/10 text-amber-600 border-amberald-500/20"
}

const getKategoriStyle = (kategori: string) => {
    const k = kategori.toLowerCase()
    if (k.includes("basah")) return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    if (k.includes("mf") || k.includes("kering")) return "bg-lime-500/10 text-lime-700 border-lime-500/20"
    return "bg-primary/10 text-primary border-primary/20"
}

const getStokStyle = (stok: number) => {
    if (stok > 10) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    if (stok > 0) return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    return "bg-destructive/10 text-destructive border-destructive/20"
}

type SortKey = "nama" | "harga_jual" | "stok" | "merek"
type SortDir = "asc" | "desc"

interface ProductCardGridProps {
    data: Battery[]
}

export function ProductCardGrid({ data }: ProductCardGridProps) {
    const [search, setSearch] = React.useState("")
    const [page, setPage] = React.useState(1)
    const [sortKey, setSortKey] = React.useState<SortKey>("nama")
    const [sortDir, setSortDir] = React.useState<SortDir>("asc")
    const [addDialogOpen, setAddDialogOpen] = React.useState(false)
    const [editTarget, setEditTarget] = React.useState<Battery | null>(null)
    const [deleteTarget, setDeleteTarget] = React.useState<Battery | null>(null)
    const [filterOpen, setFilterOpen] = React.useState(false)
    const [filterKategori, setFilterKategori] = React.useState<string>("all")
    const router = useRouter()

    const kategoriList = React.useMemo(() => {
        const set = new Set(data.map((b) => b.kategori).filter(Boolean))
        return Array.from(set)
    }, [data])

    const filtered = React.useMemo(() => {
        let arr = data.filter((b) =>
            b.nama.toLowerCase().includes(search.toLowerCase()) ||
            b.merek.toLowerCase().includes(search.toLowerCase()) ||
            b.tipe.toLowerCase().includes(search.toLowerCase())
        )
        if (filterKategori !== "all") arr = arr.filter((b) => b.kategori === filterKategori)
        arr = arr.sort((a, b) => {
            const av = a[sortKey] ?? ""
            const bv = b[sortKey] ?? ""
            const res = String(av).localeCompare(String(bv), "id", { numeric: true })
            return sortDir === "asc" ? res : -res
        })
        return arr
    }, [data, search, sortKey, sortDir, filterKategori])

    const pageCount = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    const safePage = Math.min(page, pageCount)
    const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

    const handleSearch = (val: string) => {
        setSearch(val)
        setPage(1)
    }

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        } else {
            setSortKey(key)
            setSortDir("asc")
        }
        setPage(1)
    }

    const handleSuccess = async (id?: string) => {
        if (id) await revalidateProducts(id)
        router.refresh()
    }

    const fadeUp = {
        hidden: { opacity: 0, y: 14 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
        }),
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                        id="product-search"
                        placeholder="Cari nama, merek, tipe..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-border/60 bg-card shadow-none focus:border-primary/50 transition-all duration-300 text-sm"
                    />
                    {search && (
                        <button
                            onClick={() => handleSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Sort + Filter */}
                <div className="flex gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-3 rounded-xl border-border/60 bg-card gap-2 text-sm font-medium hover:border-primary/50 transition-all duration-300"
                        onClick={() => toggleSort(sortKey)}
                    >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline capitalize">
                            {sortKey === "nama" ? "Nama" : sortKey === "harga_jual" ? "Harga" : sortKey === "stok" ? "Stok" : "Merek"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">{sortDir}</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className={`h-10 px-3 rounded-xl border-border/60 bg-card gap-2 text-sm font-medium transition-all duration-300 ${filterOpen ? "border-primary/50 text-primary" : "hover:border-primary/50"}`}
                        onClick={() => setFilterOpen((o) => !o)}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Filter</span>
                        {filterKategori !== "all" && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                    </Button>

                    {/* Add Product CTA — "Button-in-Button" */}
                    <Button
                        onClick={() => setAddDialogOpen(true)}
                        className="h-10 pl-4 pr-2 rounded-xl gap-2 bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    >
                        <span className="hidden sm:inline">Tambah Produk</span>
                        <span className="sm:hidden">Tambah</span>
                        <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-300">
                            <CirclePlus className="w-3.5 h-3.5" />
                        </span>
                    </Button>
                </div>
            </div>

            {/* ── Filter Chips ── */}
            <AnimatePresence>
                {filterOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-wrap gap-2 pb-1">
                            <span className="text-xs text-muted-foreground font-medium self-center mr-1">Kategori:</span>
                            {["all", ...kategoriList].map((k) => (
                                <button
                                    key={k}
                                    onClick={() => { setFilterKategori(k); setPage(1) }}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 border ${filterKategori === k
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                        }`}
                                >
                                    {k === "all" ? "Semua" : k}
                                </button>
                            ))}

                            <span className="text-xs text-muted-foreground font-medium self-center ml-2 mr-1">Urutkan:</span>
                            {(["nama", "harga_jual", "stok", "merek"] as SortKey[]).map((k) => (
                                <button
                                    key={k}
                                    onClick={() => toggleSort(k)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 border ${sortKey === k
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                        }`}
                                >
                                    {k === "nama" ? "Nama" : k === "harga_jual" ? "Harga" : k === "stok" ? "Stok" : "Merek"}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Result count ── */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                    <span className="text-foreground font-bold">{filtered.length}</span> produk ditemukan
                </p>
                <p className="text-xs text-muted-foreground">
                    Hal. {safePage} / {pageCount}
                </p>
            </div>

            {/* ── Card Grid ── */}
            {paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
                        <Package className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                    <div>
                        <p className="font-bold text-foreground">Tidak ada produk</p>
                        <p className="text-sm text-muted-foreground">Coba ubah kata kunci pencarian atau filter.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {paginated.map((battery, i) => {
                        const spec = battery.specifications?.[0]
                        const margin = battery.harga_modal > 0
                            ? Math.round(((battery.harga_jual - battery.harga_modal) / battery.harga_modal) * 100)
                            : null

                        return (
                            <motion.div
                                key={battery.id}
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={fadeUp}
                                className="group"
                            >
                                {/* Double-Bezel outer shell */}
                                <div className="p-1 rounded-[1.25rem] border border-border/40 bg-muted/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:border-primary/30 group-hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
                                    {/* Inner core */}
                                    <div className="bg-card rounded-[calc(1.25rem-4px)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">

                                        {/* Image Block */}
                                        <div className="relative h-40 bg-linear-to-br from-primary/5 via-background to-muted/10 overflow-hidden">
                                            {battery.gambar ? (
                                                <Image
                                                    src={battery.gambar}
                                                    alt={battery.nama}
                                                    fill
                                                    className="object-contain p-4 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Package className="w-10 h-10 text-muted-foreground/20" />
                                                </div>
                                            )}
                                            {/* Top badges */}
                                            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getKondisiStyle(battery.kondisi)}`}>
                                                    {battery.kondisi}
                                                </span>
                                            </div>
                                            {/* Margin badge */}
                                            {margin !== null && (
                                                <div className="absolute top-2.5 right-2.5">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-background/80 border border-border/50 text-muted-foreground">
                                                        +{margin}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-3.5 space-y-3">
                                            {/* Name & brand */}
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{battery.merek} · {battery.tipe}</p>
                                                <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{battery.nama}</h3>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getKategoriStyle(battery.kategori)}`}>
                                                    {battery.kategori}
                                                </span>
                                                {spec?.kapasitas && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-border/60 bg-muted/50 text-muted-foreground">
                                                        {spec.kapasitas} Ah
                                                    </span>
                                                )}
                                                {battery.garansi && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-border/60 bg-muted/50 text-muted-foreground">
                                                        {battery.garansi}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price row */}
                                            <div className="flex items-end justify-between gap-2">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">Harga Jual</p>
                                                    <p className="text-sm font-extrabold text-foreground tracking-tight">{formatRupiah(battery.harga_jual)}</p>
                                                    {battery.harga_tukar && (
                                                        <p className="text-[10px] text-primary font-semibold">TT: {formatRupiah(battery.harga_tukar)}</p>
                                                    )}
                                                </div>
                                                <span className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${getStokStyle(battery.stok)}`}>
                                                    {battery.stok} unit
                                                </span>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-border/50" />

                                            {/* Actions */}
                                            <div className="flex gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 h-8 rounded-lg text-xs font-bold border-border/60 hover:border-primary/50 hover:text-primary transition-all duration-200 gap-1.5 active:scale-[0.97]"
                                                    onClick={() => setEditTarget(battery)}
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 rounded-lg border-border/60 hover:border-destructive/50 hover:text-destructive transition-all duration-200 p-0 active:scale-[0.97]"
                                                    onClick={() => setDeleteTarget(battery)}
                                                    aria-label={`Hapus ${battery.nama}`}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 rounded-lg border-border/60 hover:border-border transition-all duration-200 p-0 active:scale-[0.97]"
                                                    onClick={() => window.open(`/katalog/product/${battery.id}`, "_blank")}
                                                    aria-label={`Lihat ${battery.nama}`}
                                                >
                                                    <Eye className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* ── Pagination ── */}
            {pageCount > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                        {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
                    </p>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg border-border/60"
                            disabled={safePage <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                            // Calculate which pages to show around current
                            let start = Math.max(1, Math.min(safePage - 2, pageCount - 4))
                            return start + i
                        }).filter(p => p >= 1 && p <= pageCount).map((p) => (
                            <Button
                                key={p}
                                variant={safePage === p ? "default" : "outline"}
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg border-border/60 text-xs"
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg border-border/60"
                            disabled={safePage >= pageCount}
                            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Dialogs ── */}
            <AddProductDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

            <EditProductDialog
                product={editTarget}
                open={!!editTarget}
                onOpenChange={(open) => { if (!open) setEditTarget(null) }}
                onSuccess={() => handleSuccess(editTarget?.id)}
            />

            <DeleteProductDialog
                product={deleteTarget}
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                onSuccess={() => handleSuccess(deleteTarget?.id)}
            />
        </div>
    )
}
