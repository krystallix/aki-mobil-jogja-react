"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    TrendingUp, TrendingDown, ShoppingCart, Users, Package,
    ArrowUpRight, ArrowDownRight, Repeat2, Loader2,
    Banknote, BarChart3, Clock, CheckCircle2, XCircle,
    AlertCircle, Star
} from "lucide-react";

const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

type Stats = {
    // Revenue
    totalRevenue: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    // Transactions
    totalTx: number;
    txPaid: number;
    txDraft: number;
    txCancelled: number;
    txJual: number;
    txBeli: number;
    txTukar: number;
    // Profit
    totalProfit: number;
    profitThisMonth: number;
    // Customers
    totalCustomers: number;
    newCustomersThisMonth: number;
    // Products
    totalProducts: number;
    lowStockProducts: number;
    totalStockValue: number;
    // Top products
    topProducts: { nama: string; merek: string; total_qty: number; total_nilai: number }[];
    // Recent transactions
    recentTx: { id: string; customer_nama: string; total: number; status: string; tipe: string; created_at: string }[];
    // Monthly revenue (last 6 months)
    monthlyRevenue: { month: string; revenue: number; profit: number }[];
};

export default function DashboardPage() {
    const supabase = createClient();
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setIsLoading(true);

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

            const [txRes, customersRes, productsRes, txItemsRes] = await Promise.all([
                supabase.from("transactions").select("id, customer_nama, tipe, status, subtotal, diskon, total, created_at, paid_at"),
                supabase.from("customers").select("id, created_at"),
                supabase.from("products").select("id, nama, merek, stok, harga_jual, harga_modal"),
                supabase.from("transaction_items").select("product_id, nama_produk, merek, qty, harga_modal, nilai_aki_lama, subtotal, transaction_id"),
            ]);

            const txs = txRes.data || [];
            const customers = customersRes.data || [];
            const products = productsRes.data || [];
            const items = txItemsRes.data || [];

            const paidTxs = txs.filter(t => t.status === "paid");
            const paidIds = new Set(paidTxs.map(t => t.id));

            // Revenue
            const totalRevenue = paidTxs.reduce((s, t) => s + (t.total || 0), 0);
            const revenueThisMonth = paidTxs
                .filter(t => t.paid_at && t.paid_at >= startOfMonth)
                .reduce((s, t) => s + (t.total || 0), 0);
            const revenueLastMonth = paidTxs
                .filter(t => t.paid_at && t.paid_at >= startOfLastMonth && t.paid_at <= endOfLastMonth)
                .reduce((s, t) => s + (t.total || 0), 0);

            // Profit (revenue - (modal - nilai_aki_lama) dari items paid)
            const paidItems = items.filter(i => paidIds.has(i.transaction_id));
            const totalModal = paidItems.reduce((s, i) => s + ((i.harga_modal || 0) * (i.qty || 1)) - (i.nilai_aki_lama || 0), 0);
            const totalProfit = totalRevenue - totalModal;

            const paidItemsThisMonth = paidItems.filter(i => {
                const tx = paidTxs.find(t => t.id === i.transaction_id);
                return tx && tx.paid_at && tx.paid_at >= startOfMonth;
            });
            const modalThisMonth = paidItemsThisMonth.reduce((s, i) => s + ((i.harga_modal || 0) * (i.qty || 1)) - (i.nilai_aki_lama || 0), 0);
            const profitThisMonth = revenueThisMonth - modalThisMonth;

            // Transaction counts
            const txJual = txs.filter(t => t.tipe === "jual").length;
            const txBeli = txs.filter(t => t.tipe === "beli").length;
            const txTukar = txs.filter(t => t.tipe === "tukar_tambah").length;

            // Customers
            const newCustomersThisMonth = customers.filter(c => c.created_at && c.created_at >= startOfMonth).length;

            // Products
            const lowStockProducts = products.filter(p => p.stok !== null && p.stok <= 3).length;
            const totalStockValue = products.reduce((s, p) => s + (p.stok || 0) * (p.harga_jual || 0), 0);

            // Top 5 products by total qty
            const productMap: Record<string, { nama: string; merek: string; total_qty: number; total_nilai: number }> = {};
            paidItems.forEach(i => {
                const key = i.product_id || i.nama_produk;
                if (!productMap[key]) productMap[key] = { nama: i.nama_produk, merek: i.merek || "", total_qty: 0, total_nilai: 0 };
                productMap[key].total_qty += i.qty || 1;
                productMap[key].total_nilai += i.subtotal || 0;
            });
            const topProducts = Object.values(productMap)
                .sort((a, b) => b.total_qty - a.total_qty)
                .slice(0, 5);

            // Recent 6 transactions
            const recentTx = [...txs]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 8)
                .map(t => ({ id: t.id, customer_nama: t.customer_nama, total: t.total, status: t.status, tipe: t.tipe, created_at: t.created_at }));

            // Monthly revenue last 6 months
            const monthlyRevenue: Stats["monthlyRevenue"] = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
                const monthPaidTxs = paidTxs.filter(t => t.paid_at && t.paid_at >= start && t.paid_at <= end);
                const rev = monthPaidTxs.reduce((s, t) => s + (t.total || 0), 0);
                const monthPaidItems = paidItems.filter(it => {
                    const tx = paidTxs.find(t => t.id === it.transaction_id);
                    return tx && tx.paid_at && tx.paid_at >= start && tx.paid_at <= end;
                });
                const modal = monthPaidItems.reduce((s, it) => s + ((it.harga_modal || 0) * (it.qty || 1)) - (it.nilai_aki_lama || 0), 0);
                monthlyRevenue.push({
                    month: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
                    revenue: rev,
                    profit: rev - modal,
                });
            }

            setStats({
                totalRevenue, revenueThisMonth, revenueLastMonth,
                totalTx: txs.length, txPaid: paidTxs.length,
                txDraft: txs.filter(t => t.status === "draft").length,
                txCancelled: txs.filter(t => t.status === "cancelled").length,
                txJual, txBeli, txTukar,
                totalProfit, profitThisMonth,
                totalCustomers: customers.length, newCustomersThisMonth,
                totalProducts: products.length, lowStockProducts, totalStockValue,
                topProducts, recentTx, monthlyRevenue,
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const revGrowth = stats && stats.revenueLastMonth > 0
        ? ((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100
        : null;

    const maxRevenue = stats ? Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1) : 1;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-sm font-semibold text-muted-foreground">Memuat data...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!stats) return null;

    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
        paid: { label: "Lunas", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
        draft: { label: "Draft", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <Clock className="w-3 h-3" /> },
        cancelled: { label: "Batal", color: "text-red-600 bg-red-50 border-red-200", icon: <XCircle className="w-3 h-3" /> },
    };

    const tipeConfig: Record<string, { label: string; color: string }> = {
        jual: { label: "Jual", color: "text-blue-600 bg-blue-50 border-blue-200" },
        beli: { label: "Beli", color: "text-purple-600 bg-purple-50 border-purple-200" },
        tukar_tambah: { label: "Tukar", color: "text-orange-600 bg-orange-50 border-orange-200" },
    };

    return (
        <DashboardLayout>
            <ScrollArea className="h-[calc(100vh-var(--header-height))]">
                <div className="p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">

                    {/* ── PAGE TITLE ── */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ringkasan Bisnis</h1>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Data real-time dari semua transaksi Siswanto Aki.</p>
                    </div>

                    {/* ── KPI CARDS ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                        {/* Revenue Bulan Ini */}
                        <Card className="col-span-2 lg:col-span-2 border border-border/60 shadow-sm rounded-2xl bg-gradient-to-br from-primary/5 to-background overflow-hidden">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Pendapatan Bulan Ini</p>
                                        <p className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{formatRupiah(stats.revenueThisMonth)}</p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            {revGrowth !== null ? (
                                                <>
                                                    {revGrowth >= 0
                                                        ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                                                        : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                                                    }
                                                    <span className={`text-xs font-bold ${revGrowth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                        {Math.abs(revGrowth).toFixed(1)}% vs bulan lalu
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-muted-foreground font-medium">Belum ada data bulan lalu</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Banknote className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profit Bulan Ini */}
                        <Card className="col-span-1 border border-border/60 shadow-sm rounded-2xl bg-gradient-to-br from-emerald-500/5 to-background">
                            <CardContent className="p-4 md:p-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Profit Bulan Ini</p>
                                <p className="text-xl md:text-2xl font-black text-emerald-600">{formatRupiah(stats.profitThisMonth)}</p>
                                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Total: {formatRupiah(stats.totalProfit)}</p>
                            </CardContent>
                        </Card>

                        {/* Total Transaksi */}
                        <Card className="col-span-1 border border-border/60 shadow-sm rounded-2xl">
                            <CardContent className="p-4 md:p-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Transaksi</p>
                                <p className="text-xl md:text-2xl font-black text-foreground">{stats.totalTx}</p>
                                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{stats.txPaid} lunas · {stats.txDraft} draft</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── SECONDARY KPIs ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                        {[
                            { label: "Total Pelanggan", value: stats.totalCustomers, sub: `+${stats.newCustomersThisMonth} bulan ini`, icon: <Users className="w-4 h-4" />, color: "bg-blue-50 text-blue-600" },
                            { label: "Total Produk", value: stats.totalProducts, sub: `${stats.lowStockProducts} stok tipis`, icon: <Package className="w-4 h-4" />, color: "bg-purple-50 text-purple-600", warn: stats.lowStockProducts > 0 },
                            { label: "Nilai Stok", value: formatRupiah(stats.totalStockValue), sub: `${stats.totalProducts} jenis produk`, icon: <BarChart3 className="w-4 h-4" />, color: "bg-orange-50 text-orange-600" },
                            { label: "Transaksi Lunas", value: `${stats.txPaid}`, sub: `${stats.txCancelled} dibatalkan`, icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-600" },
                        ].map((kpi, i) => (
                            <Card key={i} className="border border-border/60 shadow-sm rounded-2xl">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">{kpi.label}</p>
                                        <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center shrink-0 ${kpi.warn ? "ring-2 ring-amber-300" : ""}`}>
                                            {kpi.warn ? <AlertCircle className="w-4 h-4" /> : kpi.icon}
                                        </div>
                                    </div>
                                    <p className="text-xl font-black text-foreground">{kpi.value}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">{kpi.sub}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* ── TIPE TRANSAKSI ── */}
                    <div className="grid grid-cols-3 gap-3 lg:gap-4">
                        {[
                            { label: "Penjualan", value: stats.txJual, icon: <ArrowUpRight className="w-4 h-4" />, color: "bg-blue-50 text-blue-600 border-blue-200" },
                            { label: "Pembelian", value: stats.txBeli, icon: <ArrowDownRight className="w-4 h-4" />, color: "bg-purple-50 text-purple-600 border-purple-200" },
                            { label: "Tukar Tambah", value: stats.txTukar, icon: <Repeat2 className="w-4 h-4" />, color: "bg-orange-50 text-orange-600 border-orange-200" },
                        ].map((t, i) => (
                            <Card key={i} className="border border-border/60 shadow-sm rounded-2xl">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${t.color}`}>
                                        {t.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.label}</p>
                                        <p className="text-2xl font-black text-foreground">{t.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* ── CHART + TOP PRODUCTS ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">

                        {/* Bar Chart 6 Months */}
                        <Card className="lg:col-span-3 border border-border/60 shadow-sm rounded-2xl">
                            <CardHeader className="px-5 pt-5 pb-3 border-b border-border/40">
                                <CardTitle className="text-sm font-extrabold uppercase tracking-widest text-foreground/80">Pendapatan &amp; Profit (6 Bulan)</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="flex flex-col gap-3">
                                    {stats.monthlyRevenue.map((m, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-muted-foreground w-12 shrink-0">{m.month}</span>
                                            <div className="flex-1 flex flex-col gap-1">
                                                <div className="h-4 rounded-full bg-muted/40 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-primary/80 transition-all duration-700"
                                                        style={{ width: `${Math.round((m.revenue / maxRevenue) * 100)}%` }}
                                                    />
                                                </div>
                                                <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500/70 transition-all duration-700"
                                                        style={{ width: `${Math.round((Math.max(m.profit, 0) / maxRevenue) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-right w-20 shrink-0 text-muted-foreground">{formatRupiah(m.revenue)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary/80" /><span className="text-[10px] font-bold text-muted-foreground">Pendapatan</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500/70" /><span className="text-[10px] font-bold text-muted-foreground">Profit</span></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Products */}
                        <Card className="lg:col-span-2 border border-border/60 shadow-sm rounded-2xl">
                            <CardHeader className="px-5 pt-5 pb-3 border-b border-border/40">
                                <CardTitle className="text-sm font-extrabold uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    Produk Terlaris
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                {stats.topProducts.length === 0 ? (
                                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">Belum ada data</div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {stats.topProducts.map((p, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${i === 0 ? "bg-amber-400 text-white" : "bg-muted text-muted-foreground"}`}>
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate">{p.nama}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{p.merek}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-black text-foreground">{p.total_qty}x</p>
                                                    <p className="text-[10px] text-muted-foreground">{formatRupiah(p.total_nilai)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── RECENT TRANSACTIONS ── */}
                    <Card className="border border-border/60 shadow-sm rounded-2xl">
                        <CardHeader className="px-5 pt-5 pb-3 border-b border-border/40">
                            <CardTitle className="text-sm font-extrabold uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                                <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                                Transaksi Terbaru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/40">
                                {stats.recentTx.map((tx) => {
                                    const s = statusConfig[tx.status] || statusConfig.draft;
                                    const tp = tipeConfig[tx.tipe] || tipeConfig.jual;
                                    return (
                                        <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{tx.customer_nama || "Pelanggan"}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">{formatDate(tx.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase hidden sm:inline-flex items-center gap-1 ${tp.color}`}>
                                                    {tp.label}
                                                </span>
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase inline-flex items-center gap-1 ${s.color}`}>
                                                    {s.icon}{s.label}
                                                </span>
                                                <span className="text-sm font-black text-foreground w-28 text-right">{formatRupiah(tx.total)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {stats.recentTx.length === 0 && (
                                    <div className="flex justify-center py-10 text-sm text-muted-foreground">Belum ada transaksi</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </ScrollArea>
        </DashboardLayout>
    );
}
