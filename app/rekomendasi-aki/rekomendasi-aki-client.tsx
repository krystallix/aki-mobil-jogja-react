"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Battery, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
    if (!code) return <span className="text-muted-foreground text-xs">—</span>;

    const styles: Record<typeof type, string> = {
        standard: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50",
        upgrade: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/50",
        calcium: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/50",
    };

    return (
        <div className="flex flex-col gap-0.5">
            <Link
                href={`/katalog?q=${encodeURIComponent(code)}`}
                title={`Cari ${code} di katalog`}
                className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold w-fit transition-colors cursor-pointer",
                    styles[type]
                )}
            >
                {code}
            </Link>
            {ah && <span className="text-xs text-muted-foreground">{ah} Ah</span>}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function RekomendasiAkiClient() {
    const [data, setData] = useState<BatteryRec[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const brands = useMemo(() => {
        const unique = Array.from(new Set(data.map((r) => r.brand))).sort();
        return ["ALL", ...unique];
    }, [data]);

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
        });
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    placeholder="Cari merek, model, atau kode aki..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Brand Filter */}
            <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                    <Button
                        key={brand}
                        variant={selectedBrand === brand ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleBrand(brand)}
                        className="rounded-full text-xs h-7 px-3"
                    >
                        {brand === "ALL" ? "Semua Merek" : brand}
                    </Button>
                ))}
            </div>

            {/* Legend */}


            {/* Result count */}
            <p className="text-sm text-muted-foreground">
                {loading ? "Memuat data…" : `${filtered.length} kendaraan ditemukan`}
            </p>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-destructive text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            {!error && (
                <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-3 text-left font-bold text-muted-foreground whitespace-nowrap">Merek / Model</th>
                                    <th className="px-4 py-3 text-left font-bold text-muted-foreground whitespace-nowrap">Tahun</th>
                                    <th className="px-4 py-3 text-left font-bold whitespace-nowrap">
                                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><Battery className="h-3.5 w-3.5" /> Standar</span>
                                    </th>
                                    <th className="px-4 py-3 text-left font-bold whitespace-nowrap">
                                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><Zap className="h-3.5 w-3.5" /> Upgrade</span>
                                    </th>
                                    <th className="px-4 py-3 text-left font-bold whitespace-nowrap">
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Shield className="h-3.5 w-3.5" /> Upgrade Lanjutan</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading
                                    ? Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i} className="border-b animate-pulse">
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="h-4 bg-muted rounded w-3/4" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                    : paginated.length === 0
                                        ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                                                    <p>Tidak ada kendaraan yang ditemukan.</p>
                                                    <p className="text-xs mt-1">Coba ubah kata kunci atau filter merek.</p>
                                                </td>
                                            </tr>
                                        )
                                        : paginated.map((row, i) => (
                                            <tr
                                                key={`${row.brand}-${row.model}-${row.year_start}-${i}`}
                                                className="border-b hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/katalog?q=${encodeURIComponent(`${row.brand} ${row.model}`)}`}
                                                        title={`Cari aki untuk ${row.brand} ${row.model} di katalog`}
                                                        className="group inline-flex gap-1 items-baseline hover:underline underline-offset-2"
                                                    >
                                                        <span className="font-medium group-hover:text-primary transition-colors">{row.brand}</span>
                                                        <span className="text-muted-foreground group-hover:text-primary/70 transition-colors">{row.model}</span>
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                                                    {yearRange(row.year_start, row.year_end)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <BatteryBadge code={row.std_battery} ah={row.std_capacity_ah} type="standard" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <BatteryBadge code={row.upgrade_battery} ah={row.upgrade_capacity_ah} type="upgrade" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <BatteryBadge code={row.calcium_battery} ah={row.calcium_capacity_ah} type="calcium" />
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                            <span className="text-xs text-muted-foreground">
                                Halaman {page} dari {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="h-7 px-2 text-xs"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="h-7 px-2 text-xs"
                                >
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
