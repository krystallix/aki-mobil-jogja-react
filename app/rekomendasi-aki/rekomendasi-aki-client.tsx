"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Battery, Zap, Shield, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// ── Types ─────────────────────────────────────────────────────────────────────

type BatteryRec = {
    brand: string;
    model: string;
    year_start: number | null;
    year_end: number | null;
    std_battery: string | null;
    std_capacity_ah: number | null;
    upgrade_battery: string | null;
    upgrade_capacity_ah: number | null;
    calcium_battery: string | null;
    calcium_capacity_ah: number | null;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

// ── Helpers ───────────────────────────────────────────────────────────────────

function yearRange(start: number | null, end: number | null) {
    if (!start && !end) return "—";
    if (start && !end) return `${start}+`;
    if (!start && end) return `s.d. ${end}`;
    return `${start}–${end}`;
}

function BatteryBadge({ code, ah, type }: { code: string | null; ah: number | null; type: "standard" | "upgrade" | "calcium" }) {
    if (!code) return <span className="text-muted-foreground/50 text-xs lg:text-sm font-medium">—</span>;

    const styles: Record<typeof type, string> = {
        standard: "bg-indigo-600 text-white border-transparent hover:bg-indigo-700",
        upgrade: "bg-amber-500 text-white border-transparent hover:bg-amber-600",
        calcium: "bg-emerald-600 text-white border-transparent hover:bg-emerald-700",
    };

    return (
        <div className="flex flex-col gap-1 lg:gap-1.5">
            <Link
                href={`/katalog?q=${encodeURIComponent(code)}`}
                title={`Cari ${code} di katalog`}
                className={cn(
                    "inline-flex items-center rounded-md lg:rounded-lg border px-2 py-0.5 lg:px-2.5 lg:py-1 text-[10px] lg:text-xs font-bold w-fit transition-all duration-300 cursor-pointer",
                    styles[type]
                )}
            >
                {code}
            </Link>
            {ah && <span className="text-[10px] lg:text-xs font-medium text-muted-foreground/80 flex items-center gap-1"><Zap className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> {ah} Ah</span>}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function RekomendasiAkiClient() {
    const [data, setData] = useState<BatteryRec[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchBrand, setSearchBrand] = useState("");
    const [search, setSearch] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("ALL");
    const [page, setPage] = useState(1);
    const [, startTransition] = useTransition();

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            setLoading(true);
            const { data: rows, error: err } = await supabase
                .from("v_battery_recommendations")
                .select("*")
                .order("brand", { ascending: true })
                .order("model", { ascending: true });

            if (err) {
                setError("Gagal memuat data. Pastikan database sudah di-setup.");
                setLoading(false);
                return;
            }
            setData((rows as BatteryRec[]) ?? []);
            setLoading(false);
        })();
    }, []);

    const sortedBrands = useMemo(() => {
        const unique = Array.from(new Set(data.map((r) => r.brand))).sort();
        return unique;
    }, [data]);

    const displayList = useMemo(() => {
        let list = ["ALL", ...sortedBrands];
        if (selectedBrand !== "ALL") {
            list = list.filter(b => b !== selectedBrand);
            list.splice(1, 0, selectedBrand);
        }
        return list;
    }, [sortedBrands, selectedBrand]);

    const filtered = useMemo(() => {
        let rows = data;
        if (selectedBrand !== "ALL") {
            rows = rows.filter((r) => r.brand === selectedBrand);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            rows = rows.filter((r) => {
                const combined = `${r.brand} ${r.model}`.toLowerCase();
                return (
                    combined.includes(q) ||
                    r.brand.toLowerCase().includes(q) ||
                    r.model.toLowerCase().includes(q) ||
                    r.std_battery?.toLowerCase().includes(q) ||
                    r.upgrade_battery?.toLowerCase().includes(q) ||
                    r.calcium_battery?.toLowerCase().includes(q)
                );
            });
        }
        return rows;
    }, [data, selectedBrand, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const mobileVisibleBrands = displayList.slice(0, 9);
    const remainingBrands = displayList.slice(9);

    const handleSearch = (val: string) => {
        startTransition(() => {
            setSearch(val);
            setPage(1);
        });
    };

    const handleBrand = (brand: string) => {
        startTransition(() => {
            setSelectedBrand(brand);
            setPage(1);
            setIsDialogOpen(false);
            setSearchBrand("");
        });
    };

    const filteredBrandList = useMemo(() => {
        return sortedBrands.filter(b => b.toLowerCase().includes(searchBrand.toLowerCase()));
    }, [sortedBrands, searchBrand]);

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Search */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative group mb-4 lg:mb-8"
            >
                <Search className="absolute left-3.5 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                    placeholder="Cari merek, model, atau kode aki..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 lg:pl-14 h-10 lg:h-14 rounded-lg lg:rounded-full border-border/50 bg-card shadow-none hover:border-primary/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-xs lg:text-base w-full"
                />
            </motion.div>

            {/* Brand Filter */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-wrap gap-1.5 lg:gap-2 mb-6 lg:mb-10"
            >
                {mobileVisibleBrands.map((brand) => (
                    <Button
                        key={brand}
                        variant={selectedBrand === brand ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleBrand(brand)}
                        className={cn(
                            "rounded-md lg:rounded-full text-[10px] lg:text-xs h-7 lg:h-9 px-2.5 lg:px-4 transition-all duration-300 font-medium",
                            selectedBrand !== brand && "border-border/50 bg-card hover:border-primary/40 shadow-none text-muted-foreground hover:text-foreground font-normal"
                        )}
                    >
                        {brand === "ALL" ? "Semua Merek" : brand}
                    </Button>
                ))}
                {remainingBrands.length > 0 && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-md lg:rounded-full text-[10px] lg:text-xs h-7 lg:h-9 px-2.5 lg:px-4 transition-all duration-300 font-medium border-border/50 bg-card hover:border-primary/40 shadow-none text-muted-foreground hover:text-foreground font-normal"
                            >
                                <Plus size={14} className="mr-1" />
                                {remainingBrands.length} lainnya
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Pilih Merek Kendaraan</DialogTitle>
                            </DialogHeader>
                            <Input
                                placeholder="Cari merek..."
                                value={searchBrand}
                                onChange={(e) => setSearchBrand(e.target.value)}
                                className="mb-4"
                            />
                            <div className="flex flex-wrap gap-2 max-h-[60vh] overflow-y-auto">
                                <Button
                                    variant={selectedBrand === "ALL" ? "default" : "outline"}
                                    onClick={() => handleBrand("ALL")}
                                    className={cn(
                                        "rounded-full text-xs transition-all duration-300",
                                        selectedBrand !== "ALL" && "border-border/50 bg-card hover:border-primary/40 shadow-none text-muted-foreground hover:text-foreground font-normal"
                                    )}
                                >
                                    Semua Merek
                                </Button>
                                {filteredBrandList.map((brand) => (
                                    <Button
                                        key={brand}
                                        variant={selectedBrand === brand ? "default" : "outline"}
                                        onClick={() => handleBrand(brand)}
                                        className={cn(
                                            "rounded-full text-xs transition-all duration-300",
                                            selectedBrand !== brand && "border-border/50 bg-card hover:border-primary/40 shadow-none text-muted-foreground hover:text-foreground font-normal"
                                        )}
                                    >
                                        {brand}
                                    </Button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </motion.div>

            {/* Result count */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mb-2 lg:mb-4"
            >
                <p className="text-[11px] lg:text-sm font-medium text-muted-foreground">
                    {loading ? "Memuat data…" : (
                        <>Menampilkan <span className="text-foreground font-bold">{filtered.length}</span> kendaraan ditemukan</>
                    )}
                </p>
            </motion.div>

            {/* Error */}
            {error && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 lg:p-6 text-center text-destructive text-xs lg:text-sm font-medium"
                >
                    {error}
                </motion.div>
            )}

            {/* Table */}
            {!error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="rounded-lg lg:rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs lg:text-sm">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/20">
                                    <th className="px-3 py-2 lg:px-6 lg:py-4 text-left font-bold text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[9px] lg:text-[10px]">Kendaraan</th>
                                    <th className="px-3 py-2 lg:px-6 lg:py-4 text-left font-bold text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[9px] lg:text-[10px]">Tahun</th>
                                    <th className="px-3 py-2 lg:px-6 lg:py-4 text-left font-bold whitespace-nowrap">
                                        <span className="flex items-center gap-1 lg:gap-1.5 text-indigo-700 dark:text-indigo-400 uppercase tracking-wider text-[9px] lg:text-[10px]">
                                            <div className="p-0.5 lg:p-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"><Battery className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5 text-indigo-600" /></div>
                                            Standar
                                        </span>
                                    </th>
                                    <th className="px-3 py-2 lg:px-6 lg:py-4 text-left font-bold whitespace-nowrap">
                                        <span className="flex items-center gap-1 lg:gap-1.5 text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[9px] lg:text-[10px]">
                                            <div className="p-0.5 lg:p-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"><Zap className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5 text-amber-600" /></div>
                                            Upgrade
                                        </span>
                                    </th>
                                    <th className="px-3 py-2 lg:px-6 lg:py-4 text-left font-bold whitespace-nowrap">
                                        <span className="flex items-center gap-1 lg:gap-1.5 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[9px] lg:text-[10px]">
                                            <div className="p-0.5 lg:p-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"><Shield className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5 text-emerald-600" /></div>
                                            Upgrade Lanjutan
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading
                                    ? Array.from({ length: 10 }).map((_, i) => (
                                        <tr key={i} className="border-b border-border/50">
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <td key={j} className="px-3 py-2 lg:px-6 lg:py-4">
                                                    <div className="h-2.5 lg:h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                    : paginated.length === 0
                                        ? (
                                            <tr>
                                                <td colSpan={5} className="py-10 lg:py-16 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center space-y-2 lg:space-y-3">
                                                        <Search className="w-5 h-5 lg:w-8 lg:h-8 text-muted-foreground/30" />
                                                        <p className="text-[11px] lg:text-base font-medium">Tidak ada kendaraan ditemukan</p>
                                                        <p className="text-[10px] lg:text-sm">Coba ubah kata kunci pencarian atau filter merek</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                        : paginated.map((row, i) => (
                                            <tr
                                                key={`${row.brand}-${row.model}-${row.year_start}-${i}`}
                                                className="border-b border-border/50 hover:bg-muted/10 transition-colors group/row"
                                            >
                                                <td className="px-3 py-2 lg:px-6 lg:py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground group-hover/row:text-primary transition-colors text-[11px] lg:text-sm">{row.brand}</span>
                                                        <Link
                                                            href={`/katalog?q=${encodeURIComponent(`${row.brand} ${row.model}`)}`}
                                                            title={`Cari aki untuk ${row.brand} ${row.model} di katalog`}
                                                            className="text-muted-foreground hover:text-primary transition-colors text-[10px] lg:text-sm hover:underline underline-offset-2 w-fit mt-0.5"
                                                        >
                                                            {row.model}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 lg:px-6 lg:py-4 text-muted-foreground whitespace-nowrap text-[10px] lg:text-sm font-medium">
                                                    {yearRange(row.year_start, row.year_end)}
                                                </td>
                                                <td className="px-3 py-2 lg:px-6 lg:py-4">
                                                    <BatteryBadge code={row.std_battery} ah={row.std_capacity_ah} type="standard" />
                                                </td>
                                                <td className="px-3 py-2 lg:px-6 lg:py-4">
                                                    <BatteryBadge code={row.upgrade_battery} ah={row.upgrade_capacity_ah} type="upgrade" />
                                                </td>
                                                <td className="px-3 py-2 lg:px-6 lg:py-4">
                                                    <BatteryBadge code={row.calcium_battery} ah={row.calcium_capacity_ah} type="calcium" />
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between px-3 py-2 lg:px-6 lg:py-4 border-t border-border/50 bg-muted/5">
                            <span className="text-[10px] lg:text-sm text-muted-foreground font-medium">
                                Halaman <span className="text-foreground">{page}</span> dari <span className="text-foreground">{totalPages}</span>
                            </span>
                            <div className="flex gap-1 lg:gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="h-7 lg:h-9 px-2 lg:px-3 rounded lg:rounded-full border-border/50 shadow-none hover:bg-muted/50 transition-colors text-[10px] lg:text-xs"
                                >
                                    <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4 mr-0.5 lg:mr-1" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="h-7 lg:h-9 px-2 lg:px-3 rounded lg:rounded-full border-border/50 shadow-none hover:bg-muted/50 transition-colors text-[10px] lg:text-xs"
                                >
                                    Next
                                    <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 ml-0.5 lg:ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
