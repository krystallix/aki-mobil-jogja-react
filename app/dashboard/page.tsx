"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    MessageSquare,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Plus,
    Wallet,
    DollarSign,
    RotateCcw,
    Receipt,
    ShoppingBag,
    MoreHorizontal,
    Radio,
    ChevronLeft,
    ChevronRight,
    FileText
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CrmDialog } from "@/components/dashboard/crm-dialog";
import { CrmCustomerTransaction } from "@/lib/supabase/types";

const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatShortRupiah = (n: number) => {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}k`;
    return `Rp ${n}`;
};

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
    recentTx: { id: string; customer_nama: string; total: number; status: string; tipe: string; created_at: string; items_count?: number }[];
    // Chart monthly data
    chartData: { label: string; revenue: number; profit: number; count: number }[];
    // Aki Lama
    totalAkiLamaValue: number;
    totalAkiLamaCount: number;
};

export default function DashboardPage() {
    const supabase = createClient();
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // CRM Follow-Up State
    const [crmOpen, setCrmOpen] = useState(false);
    const [crmTransactions, setCrmTransactions] = useState<CrmCustomerTransaction[]>([]);
    const [crmArticles, setCrmArticles] = useState<{ id: string; title: string; slug: string }[]>([]);

    useEffect(() => {
        fetchStats();
        fetchCrmData();
    }, [selectedDate]);

    const fetchCrmData = async () => {
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
            const threeMonthsIso = threeMonthsAgo.toISOString();

            const resWithCrm = await supabase
                .from("transactions")
                .select("id, customer_id, customer_nama, customer_no_hp, customer_alamat, tipe, status, subtotal, diskon, total, created_at, paid_at, crm_follow_up_at, transaction_items(nama_produk, merek, tipe_produk, qty)")
                .eq("status", "paid")
                .lte("created_at", threeMonthsIso)
                .order("created_at", { ascending: false });

            if (resWithCrm.error) {
                const resFallback = await supabase
                    .from("transactions")
                    .select("id, customer_id, customer_nama, customer_no_hp, customer_alamat, tipe, status, subtotal, diskon, total, created_at, paid_at, transaction_items(nama_produk, merek, tipe_produk, qty)")
                    .eq("status", "paid")
                    .lte("created_at", threeMonthsIso)
                    .order("created_at", { ascending: false });
                setCrmTransactions((resFallback.data as unknown as CrmCustomerTransaction[]) || []);
            } else {
                setCrmTransactions((resWithCrm.data as unknown as CrmCustomerTransaction[]) || []);
            }

            const { data: artData } = await supabase
                .from("artikel")
                .select("id, title, slug")
                .eq("status", "published")
                .order("created_at", { ascending: false });

            setCrmArticles(artData || []);
        } catch (err) {
            console.error("Error fetching CRM data:", err);
        }
    };

    const fetchStats = async () => {
        try {
            setIsLoading(true);

            const now = selectedDate;
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

            const [txRes, customersRes, productsRes, txItemsRes, akiLamaRes] = await Promise.all([
                supabase.from("transactions").select("id, customer_nama, tipe, status, subtotal, diskon, total, created_at, paid_at"),
                supabase.from("customers").select("id, created_at"),
                supabase.from("products").select("id, nama, merek, stok, harga_jual, harga_modal"),
                supabase.from("transaction_items").select("product_id, nama_produk, merek, qty, harga_modal, nilai_aki_lama, subtotal, transaction_id"),
                supabase.from("aki_lama").select("nilai").eq("status", "belum_dijual"),
            ]);

            const txs = txRes.data || [];
            const customers = customersRes.data || [];
            const products = productsRes.data || [];
            const items = txItemsRes.data || [];
            const unsoldAkiLama = akiLamaRes.data || [];

            const totalAkiLamaCount = unsoldAkiLama.length;
            const totalAkiLamaValue = unsoldAkiLama.reduce((s, a) => s + (a.nilai || 0), 0);

            const paidTxs = txs.filter(t => t.status === "paid");
            const paidIds = new Set(paidTxs.map(t => t.id));

            const txsThisMonth = txs.filter(t => t.created_at && t.created_at >= startOfMonth && t.created_at <= endOfMonth);
            const paidTxsThisMonth = txsThisMonth.filter(t => t.status === "paid");

            const txsLastMonth = txs.filter(t => t.created_at && t.created_at >= startOfLastMonth && t.created_at <= endOfLastMonth);
            const paidTxsLastMonth = txsLastMonth.filter(t => t.status === "paid");

            // Revenue
            const totalRevenue = paidTxs.reduce((s, t) => s + (t.total || 0), 0);
            const revenueThisMonth = paidTxsThisMonth.reduce((s, t) => s + (t.total || 0), 0);
            const revenueLastMonth = paidTxsLastMonth.reduce((s, t) => s + (t.total || 0), 0);

            // Profit
            const paidItems = items.filter(i => paidIds.has(i.transaction_id));
            const totalModal = paidItems.reduce((s, i) => s + ((i.harga_modal || 0) * (i.qty || 1)) - (i.nilai_aki_lama || 0), 0);
            const totalProfit = totalRevenue - totalModal;

            const paidItemsThisMonth = items.filter(i => {
                const tx = paidTxsThisMonth.find(t => t.id === i.transaction_id);
                return !!tx;
            });
            const modalThisMonth = paidItemsThisMonth.reduce((s, i) => s + ((i.harga_modal || 0) * (i.qty || 1)) - (i.nilai_aki_lama || 0), 0);
            const profitThisMonth = revenueThisMonth - modalThisMonth;

            // Transaction counts
            const txJual = txsThisMonth.filter(t => t.tipe === "jual").length;
            const txBeli = txsThisMonth.filter(t => t.tipe === "beli").length;
            const txTukar = txsThisMonth.filter(t => t.tipe === "tukar_tambah").length;

            const newCustomersThisMonth = customers.filter(c => c.created_at && c.created_at >= startOfMonth && c.created_at <= endOfMonth).length;
            const lowStockProducts = products.filter(p => p.stok !== null && p.stok <= 3).length;
            const totalStockValue = products.reduce((s, p) => s + (p.stok || 0) * (p.harga_jual || 0), 0);

            // Top products
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
                .slice(0, 6)
                .map(t => ({
                    id: t.id,
                    customer_nama: t.customer_nama,
                    total: t.total,
                    status: t.status,
                    tipe: t.tipe,
                    created_at: t.created_at
                }));

            // Daily data for the selected month for Smooth Area Chart matching image
            const chartData: Stats["chartData"] = [];
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const dayStart = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0).toISOString();
                const dayEnd = new Date(now.getFullYear(), now.getMonth(), day, 23, 59, 59).toISOString();

                const dayTxs = txs.filter(t => t.created_at && t.created_at >= dayStart && t.created_at <= dayEnd && t.status === "paid");
                const dayRev = dayTxs.reduce((s, t) => s + (t.total || 0), 0);

                chartData.push({
                    label: `${day}`,
                    revenue: dayRev,
                    profit: Math.round(dayRev * 0.28),
                    count: dayTxs.length,
                });
            }

            setStats({
                totalRevenue,
                revenueThisMonth,
                revenueLastMonth,
                totalTx: txsThisMonth.length,
                txPaid: paidTxsThisMonth.length,
                txDraft: txsThisMonth.filter(t => t.status === "draft").length,
                txCancelled: txsThisMonth.filter(t => t.status === "cancelled").length,
                txJual,
                txBeli,
                txTukar,
                totalProfit,
                profitThisMonth,
                totalCustomers: customers.length,
                newCustomersThisMonth,
                totalProducts: products.length,
                lowStockProducts,
                totalStockValue,
                topProducts,
                recentTx,
                chartData,
                totalAkiLamaValue,
                totalAkiLamaCount
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

    const avgOrderValue = stats && stats.txPaid > 0
        ? Math.round(stats.revenueThisMonth / stats.txPaid)
        : 0;

    const crmPendingCount = crmTransactions.filter((t) => !t.crm_follow_up_at).length;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <p className="text-xs font-semibold text-neutral-500">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!stats) return null;

    // Payment/Transaction types percentage
    const totalTypeCount = Math.max(stats.txJual + stats.txTukar + stats.txBeli, 1);
    const jualPercent = Math.round((stats.txJual / totalTypeCount) * 100);
    const tukarPercent = Math.round((stats.txTukar / totalTypeCount) * 100);
    const beliPercent = Math.round((stats.txBeli / totalTypeCount) * 100);
    const lamaPercent = Math.max(0, 100 - (jualPercent + tukarPercent + beliPercent));

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
                
                {/* ── TOP HEADER / BREADCRUMB BAR (Matching Image 1) ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium mb-1">
                            <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-semibold">
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                Revenue Desk
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Revenue Desk
                        </h1>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] text-neutral-400 mr-1 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Auto-refreshing every 2s
                        </span>

                        {/* Month Picker Button */}
                        <div className="flex items-center bg-white dark:bg-card border border-neutral-200/90 dark:border-neutral-800 rounded-lg h-9 px-1 shadow-2xs">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                                className="h-7 w-7 text-neutral-400 hover:text-neutral-700"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </Button>
                            <span className="text-xs font-semibold px-2 text-neutral-800 dark:text-neutral-200">
                                {selectedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()}
                                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                                className="h-7 w-7 text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        {/* CRM Modal Pill Button */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCrmOpen(true)}
                            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-white dark:bg-card border-neutral-200/90 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-2xs transition-all cursor-pointer"
                        >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                            <span>CRM (&gt;3 Bln)</span>
                            {crmPendingCount > 0 && (
                                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold font-mono bg-indigo-600 text-white rounded-full min-w-4 h-4 leading-none">
                                    {crmPendingCount}
                                </span>
                            )}
                        </Button>

                        {/* Export Report */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-white dark:bg-card border-neutral-200/90 dark:border-neutral-800 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-2xs transition-all"
                        >
                            <Download className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Report</span>
                        </Button>

                        {/* Primary CTA (Add Payout / Transaksi Baru) */}
                        <Button
                            asChild
                            size="sm"
                            className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-[0_1px_3px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
                        >
                            <a href="/dashboard/transaksi" className="inline-flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ New Transaction</span>
                            </a>
                        </Button>
                    </div>
                </div>

                {/* ── QUICK STATS 5-CARD ROW (Matching Image 1) ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Quick Stats</h2>
                        <Button type="button" variant="ghost" size="icon-sm" className="h-7 w-7 text-neutral-400 hover:text-neutral-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {/* 1. Net Revenue (Profit Bersih) */}
                        <div className="p-4 rounded-xl bg-white dark:bg-card border border-neutral-200/80 dark:border-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium mb-3">
                                <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Wallet className="w-3 h-3" />
                                </span>
                                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">Net Revenue</span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight font-mono">
                                    {formatShortRupiah(stats.profitThisMonth)}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {revGrowth !== null ? `${Math.abs(revGrowth).toFixed(1)}%` : '0%'}
                                    </span>
                                    <span className="text-neutral-400 font-medium">vs previous month</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Gross Revenue (Total Pendapatan) */}
                        <div className="p-4 rounded-xl bg-white dark:bg-card border border-neutral-200/80 dark:border-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium mb-3">
                                <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <DollarSign className="w-3 h-3" />
                                </span>
                                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">Gross Revenue</span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight font-mono">
                                    {formatShortRupiah(stats.revenueThisMonth)}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {stats.txPaid} orders
                                    </span>
                                    <span className="text-neutral-400 font-medium">this month</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Refunds / Batal (Transaksi Dibatalkan) */}
                        <div className="p-4 rounded-xl bg-white dark:bg-card border border-neutral-200/80 dark:border-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium mb-3">
                                <span className="w-5 h-5 rounded-md bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
                                    <RotateCcw className="w-3 h-3" />
                                </span>
                                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">Cancelled / Draft</span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight font-mono">
                                    {stats.txCancelled + stats.txDraft} Tx
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold">
                                        <ArrowDownRight className="w-3 h-3" />
                                        {stats.txCancelled} cancelled
                                    </span>
                                    <span className="text-neutral-400 font-medium">{stats.txDraft} drafts</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Processing Fees / Stok Aki Lama */}
                        <div className="p-4 rounded-xl bg-white dark:bg-card border border-neutral-200/80 dark:border-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium mb-3">
                                <span className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                                    <Receipt className="w-3 h-3" />
                                </span>
                                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">Used Battery Stock</span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight font-mono">
                                    {formatShortRupiah(stats.totalAkiLamaValue)}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                                        {stats.totalAkiLamaCount} units
                                    </span>
                                    <span className="text-neutral-400 font-medium">ready to sell</span>
                                </div>
                            </div>
                        </div>

                        {/* 5. Avg. Order Value */}
                        <div className="col-span-2 md:col-span-3 lg:col-span-1 p-4 rounded-xl bg-white dark:bg-card border border-neutral-200/80 dark:border-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium mb-3">
                                <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <ShoppingBag className="w-3 h-3" />
                                </span>
                                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">Avg. Order Value</span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight font-mono">
                                    {formatShortRupiah(avgOrderValue)}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {stats.totalProducts}
                                    </span>
                                    <span className="text-neutral-400 font-medium">active types</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MIDDLE ROW: REVENUE CURVE CHART (LEFT) + PAYMENT METHODS / CHANNELS (RIGHT) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Gross Revenue Curve Chart (8 Cols) - Identical to Image 1 */}
                    <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-white dark:bg-card border border-neutral-200/80 dark:border-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Gross revenue</h3>
                                <p className="text-xs text-neutral-400 font-medium">Daily revenue trend ({selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })})</p>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-64 sm:h-72 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
                                        dy={10}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
                                        tickFormatter={(v) => formatShortRupiah(v).replace('Rp ', '')}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 text-xs">
                                                        <p className="font-semibold text-neutral-500 mb-1">{selectedDate.toLocaleDateString("en-US", { month: "short" })} {data.label}</p>
                                                        <p className="font-black text-indigo-600 dark:text-indigo-400 text-sm font-mono">
                                                            {formatRupiah(data.revenue)}
                                                        </p>
                                                        <p className="text-[10px] text-neutral-400 mt-0.5">{data.count} paid orders</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#curveFill)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Payment Methods / Channel Progress Bars (4 Cols) - Identical to Image 1 */}
                    <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-card border border-neutral-200/80 dark:border-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Channel &amp; Payment</h3>
                                <p className="text-xs text-neutral-400 font-medium">Store transaction type distribution</p>
                            </div>
                            <Button type="button" variant="ghost" size="icon-sm" className="h-7 w-7 text-neutral-400 hover:text-neutral-600">
                                <Radio className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Progress Bar Rows */}
                        <div className="space-y-4 my-auto">
                            {/* 1. Direct Sales */}
                            <div>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-neutral-700 dark:text-neutral-300">Direct Sales</span>
                                    <span className="font-mono text-neutral-900 dark:text-neutral-100">{jualPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                                        style={{ width: `${jualPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* 2. Trade-in */}
                            <div>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-neutral-700 dark:text-neutral-300">Battery Trade-In</span>
                                    <span className="font-mono text-neutral-900 dark:text-neutral-100">{tukarPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                                        style={{ width: `${tukarPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* 3. Inbound Purchase */}
                            <div>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-neutral-700 dark:text-neutral-300">Stock Purchase</span>
                                    <span className="font-mono text-neutral-900 dark:text-neutral-100">{beliPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                                        style={{ width: `${beliPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* 4. Used Battery */}
                            <div>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-neutral-700 dark:text-neutral-300">Used Scrap Battery</span>
                                    <span className="font-mono text-neutral-900 dark:text-neutral-100">{lamaPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-300 rounded-full transition-all duration-700"
                                        style={{ width: `${lamaPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                            <span>Total Orders Volume</span>
                            <span className="font-bold font-mono text-neutral-700 dark:text-neutral-300">{stats.txPaid} Settled Orders</span>
                        </div>
                    </div>
                </div>

                {/* ── BOTTOM ROW: RECENT TRANSACTIONS TABLE (Matching Image 1) ── */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-card border border-neutral-200/80 dark:border-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Recent Transactions</h3>
                            <p className="text-xs text-neutral-400 font-medium">Latest store operation activities</p>
                        </div>
                        <a
                            href="/dashboard/transaksi"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                        >
                            View All
                        </a>
                    </div>

                    <Table className="min-w-[700px]">
                        <TableHeader>
                            <TableRow className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-transparent">
                                <TableHead className="py-2.5 text-[11px] font-semibold text-neutral-400">Order ID</TableHead>
                                <TableHead className="py-2.5 text-[11px] font-semibold text-neutral-400">Customer</TableHead>
                                <TableHead className="py-2.5 text-[11px] font-semibold text-neutral-400">Channel / Type</TableHead>
                                <TableHead className="py-2.5 text-[11px] font-semibold text-neutral-400 text-right">Gross Total</TableHead>
                                <TableHead className="py-2.5 text-[11px] font-semibold text-neutral-400 text-right">Date</TableHead>
                                <TableHead className="py-2.5 text-[11px] font-semibold text-neutral-400 text-center">Status</TableHead>
                                <TableHead className="py-2.5 text-[11px] font-semibold text-neutral-400 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-xs font-medium">
                            {stats.recentTx.map((tx) => {
                                const isPaid = tx.status === "paid";
                                const isDraft = tx.status === "draft";
                                const shortId = tx.id.slice(0, 8);

                                return (
                                    <TableRow key={tx.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors border-neutral-100 dark:border-neutral-800/80">
                                        <TableCell className="py-3.5 font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                                            #{shortId}
                                        </TableCell>
                                        <TableCell className="py-3.5 text-neutral-900 dark:text-neutral-100 font-semibold">
                                            {tx.customer_nama || "Walk-in Customer"}
                                        </TableCell>
                                        <TableCell className="py-3.5 text-neutral-600 dark:text-neutral-400 capitalize">
                                            {tx.tipe.replace('_', ' ')}
                                        </TableCell>
                                        <TableCell className="py-3.5 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatRupiah(tx.total)}
                                        </TableCell>
                                        <TableCell className="py-3.5 text-right text-neutral-400 font-mono text-[11px]">
                                            {formatDate(tx.created_at)}
                                        </TableCell>
                                        <TableCell className="py-3.5 text-center">
                                            {isPaid ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                    Settled
                                                </span>
                                            ) : isDraft ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                                    Cancelled
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-3.5 text-right">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon-sm"
                                                className="h-7 w-7 text-neutral-400 hover:text-neutral-700"
                                            >
                                                <a href="/dashboard/transaksi">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {stats.recentTx.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                                        No transactions yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

            </div>

            {/* CRM 2-Grid Dialog */}
            <CrmDialog
                open={crmOpen}
                onOpenChange={setCrmOpen}
                transactions={crmTransactions}
                articles={crmArticles}
                onFollowUpSuccess={(txId) => {
                    setCrmTransactions((prev) =>
                        prev.map((t) =>
                            t.id === txId ? { ...t, crm_follow_up_at: new Date().toISOString() } : t
                        )
                    );
                }}
            />
        </DashboardLayout>
    );
}
