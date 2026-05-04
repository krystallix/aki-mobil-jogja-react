"use client"

import * as React from "react"
import Image from "next/image"
import { Battery } from "@/types/battery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const ITEMS_PER_PAGE = 20

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount)

const getKondisiStyle = (kondisi: string) => {
    if (kondisi === "baru") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    return "bg-amber-500/10 text-amber-600 border-amber-500/20"
}

const getKategoriStyle = (kategori: string) => {
    const k = kategori.toLowerCase()
    if (k.includes("basah")) return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    if (k.includes("mf") || k.includes("kering")) return "bg-lime-500/10 text-lime-700 border-lime-500/20"
    return "bg-primary/10 text-primary border-primary/20"
}

const getStokStyle = (stok: number) => {
    if (stok > 10) return "text-emerald-600"
    if (stok > 0) return "text-amber-600"
    return "text-destructive"
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
        let arr = data.filter(
            (b) =>
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

    const handleSearch = (val: string) => { setSearch(val); setPage(1) }

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        else { setSortKey(key); setSortDir("asc") }
        setPage(1)
    }

    const handleSuccess = async (id?: string) => {
        if (id) await revalidateProducts(id)
        router.refresh()
    }

    const sortLabel = sortKey === "nama" ? "Nama" : sortKey === "harga_jual" ? "Harga" : sortKey === "stok" ? "Stok" : "Merek"

    return (
        <div className="flex flex-col gap-3 w-full">

            {/* ── Toolbar ── */}
            <div className="flex gap-2">
                {/* Search */}
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                        id="product-search"
                        placeholder="Cari nama, merek, tipe..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9 h-9 rounded-lg border-border/60 bg-card shadow-none text-sm"
                    />
                    {search && (
                        <button
                            onClick={() => handleSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Hapus pencarian"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Sort toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-2.5 rounded-lg border-border/60 bg-card gap-1.5 text-xs font-medium hover:border-primary/50 transition-all duration-200 shrink-0"
                    onClick={() => toggleSort(sortKey)}
                    title={`Urutkan: ${sortLabel} (${sortDir})`}
                >
                    <ArrowUpDown className="w-3 h-3" />
                    <span className="hidden sm:inline">{sortLabel}</span>
                    <span className="text-[9px] text-muted-foreground font-black uppercase">{sortDir}</span>
                </Button>

                {/* Filter */}
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-9 px-2.5 rounded-lg border-border/60 bg-card gap-1.5 text-xs font-medium transition-all duration-200 shrink-0 ${filterOpen ? "border-primary/50 text-primary" : "hover:border-primary/50"}`}
                    onClick={() => setFilterOpen((o) => !o)}
                >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span className="hidden sm:inline">Filter</span>
                    {filterKategori !== "all" && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </Button>

                {/* Add CTA */}
                <Button
                    onClick={() => setAddDialogOpen(true)}
                    className="h-9 pl-3 pr-2 rounded-lg gap-1.5 bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 shrink-0"
                >
                    <span className="hidden sm:inline">Tambah</span>
                    <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                        <CirclePlus className="w-3 h-3" />
                    </span>
                </Button>
            </div>

            {/* ── Filter chips ── */}
            <AnimatePresence>
                {filterOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-wrap gap-2 py-1 border-t border-border/40">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest self-center">Kategori:</span>
                            {["all", ...kategoriList].map((k) => (
                                <button
                                    key={k}
                                    onClick={() => { setFilterKategori(k); setPage(1) }}
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all duration-150 border ${filterKategori === k
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                        }`}
                                >
                                    {k === "all" ? "Semua" : k}
                                </button>
                            ))}
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest self-center ml-2">Sort:</span>
                            {(["nama", "harga_jual", "stok", "merek"] as SortKey[]).map((k) => (
                                <button
                                    key={k}
                                    onClick={() => toggleSort(k)}
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all duration-150 border ${sortKey === k
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

            {/* ── Meta row ── */}
            <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                    <span className="text-foreground font-bold">{filtered.length}</span> produk
                    {filterKategori !== "all" && <span className="ml-1 text-primary">· {filterKategori}</span>}
                </p>
                <p className="text-[11px] text-muted-foreground">Hal. {safePage}/{pageCount}</p>
            </div>

            {/* ── Empty state ── */}
            {paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-bold">Tidak ada produk</p>
                    <p className="text-xs text-muted-foreground">Coba ubah kata kunci atau filter.</p>
                </div>
            ) : (
                <>
                    {/* ════ MOBILE: vertical list ════ */}
                    <div className="flex flex-col divide-y divide-border/40 border border-border/40 rounded-xl overflow-hidden md:hidden">
                        {paginated.map((battery, i) => {
                            const spec = battery.specifications?.[0]
                            return (
                                <motion.div
                                    key={battery.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03, duration: 0.3 }}
                                    className="relative"
                                >
                                    <div className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        {/* Main Content (Snap Start) */}
                                        <div
                                            className="w-full shrink-0 snap-start flex items-center gap-4 px-4 py-3.5 bg-card hover:bg-muted/30 transition-colors duration-200 cursor-pointer active:bg-muted/50"
                                            onClick={() => setEditTarget(battery)}
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                                                {battery.gambar ? (
                                                    <Image
                                                        src={battery.gambar}
                                                        alt={battery.nama}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{battery.nama}</p>
                                                    <div className="flex flex-col mt-1.5 space-y-0.5">
                                                        <p className="text-sm font-extrabold text-foreground">{formatRupiah(battery.harga_jual)}</p>
                                                        {battery.harga_tukar && (
                                                            <p className="text-[11px] text-primary font-semibold">TT: {formatRupiah(battery.harga_tukar)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] capitalize font-bold border ${getKondisiStyle(battery.kondisi)}`}>
                                                            {battery.kondisi}
                                                        </span>
                                                        {spec?.kapasitas && (
                                                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold border border-border/60 bg-muted/50 text-muted-foreground">
                                                                {spec.kapasitas}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`text-[11px] font-bold ${getStokStyle(battery.stok)}`}>
                                                        {battery.stok} Unit
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Swipe Actions (Snap End) */}
                                        <button
                                            className="w-20 shrink-0 snap-end bg-destructive flex flex-col items-center justify-center text-primary-foreground hover:bg-destructive/90 transition-colors"
                                            onClick={() => setDeleteTarget(battery)}
                                            aria-label={`Hapus ${battery.nama}`}
                                        >
                                            <Trash2 className="w-6 h-6 mb-1" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Hapus</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* ════ DESKTOP: compact card grid ════ */}
                    <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        {paginated.map((battery, i) => {
                            const spec = battery.specifications?.[0]
                            const margin = battery.harga_modal > 0
                                ? Math.round(((battery.harga_jual - battery.harga_modal) / battery.harga_modal) * 100)
                                : null

                            return (
                                <motion.div
                                    key={battery.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: i * 0.025,
                                        duration: 0.3,
                                        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                                    }}
                                    className="group"
                                >
                                    {/* Outer bezel */}
                                    <div className="p-[3px] rounded-xl border border-border/40 bg-muted/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:border-primary/30 group-hover:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.07)]">
                                        {/* Inner core */}
                                        <div className="bg-card rounded-[calc(0.75rem-3px)] overflow-hidden">
                                            {/* Image */}
                                            <div className="relative h-28 bg-linear-to-br from-primary/4 to-muted/20 overflow-hidden">
                                                {battery.gambar ? (
                                                    <Image
                                                        src={battery.gambar}
                                                        alt={battery.nama}
                                                        fill
                                                        className="object-contain p-2.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-muted-foreground/15" />
                                                    </div>
                                                )}
                                                {/* Kondisi badge */}
                                                <span className={`absolute top-1.5 left-1.5 px-1.5 py-px rounded-full text-[9px] font-bold uppercase tracking-wide border ${getKondisiStyle(battery.kondisi)}`}>
                                                    {battery.kondisi}
                                                </span>
                                                {/* Margin */}
                                                {margin !== null && (
                                                    <span className="absolute top-1.5 right-1.5 px-1.5 py-px rounded-full text-[9px] font-bold bg-background/80 border border-border/50 text-muted-foreground">
                                                        +{margin}%
                                                    </span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-2.5 space-y-2">
                                                {/* Name */}
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                                                        {battery.merek} · {battery.tipe}
                                                    </p>
                                                    <p className="text-xs font-bold text-foreground leading-snug line-clamp-2 mt-px">{battery.nama}</p>
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1">
                                                    <span className={`px-1.5 py-px rounded-full text-[9px] font-bold border ${getKategoriStyle(battery.kategori)}`}>
                                                        {battery.kategori}
                                                    </span>
                                                    {spec?.kapasitas && (
                                                        <span className="px-1.5 py-px rounded-full text-[9px] font-bold border border-border/60 bg-muted/50 text-muted-foreground">
                                                            {spec.kapasitas}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Price + stock */}
                                                <div className="flex items-center justify-between gap-1">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-extrabold text-foreground tracking-tight truncate">
                                                            {formatRupiah(battery.harga_jual)}
                                                        </p>
                                                        {battery.harga_tukar && (
                                                            <p className="text-[9px] text-primary font-semibold truncate">
                                                                TT: {formatRupiah(battery.harga_tukar)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] font-bold shrink-0 ${getStokStyle(battery.stok)}`}>
                                                        {battery.stok} Unit
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-1 pt-0.5 border-t border-border/40">
                                                    <button
                                                        className="flex-1 h-6 rounded-md border border-border/60 flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-150 active:scale-[0.96]"
                                                        onClick={() => setEditTarget(battery)}
                                                    >
                                                        <Pencil className="w-2.5 h-2.5" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="w-6 h-6 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all duration-150 active:scale-[0.96]"
                                                        onClick={() => setDeleteTarget(battery)}
                                                        aria-label={`Hapus ${battery.nama}`}
                                                    >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                    </button>
                                                    <button
                                                        className="w-6 h-6 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all duration-150 active:scale-[0.96]"
                                                        onClick={() => window.open(`/katalog/product/${battery.id}`, "_blank")}
                                                        aria-label={`Lihat ${battery.nama}`}
                                                    >
                                                        <Eye className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </>
            )}

            {/* ── Pagination ── */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <p className="text-[11px] text-muted-foreground">
                    {filtered.length === 0 ? "0" : `${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, filtered.length)}`}
                    {" "}dari {filtered.length}
                </p>
                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-lg border-border/60 text-xs"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </Button>
                    {(() => {
                        const start = Math.max(1, Math.min(safePage - 2, pageCount - 4))
                        return Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i)
                            .filter((p) => p >= 1 && p <= pageCount)
                            .map((p) => (
                                <Button
                                    key={p}
                                    variant={safePage === p ? "default" : "outline"}
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-lg border-border/60 text-[11px]"
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </Button>
                            ))
                    })()}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-lg border-border/60 text-xs"
                        disabled={safePage >= pageCount}
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    >
                        <ChevronRight className="w-3 h-3" />
                    </Button>
                </div>
            </div>

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
