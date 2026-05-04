"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { 
    Search, Plus, MoreVertical, Trash2, Loader2, ChevronLeft, 
    FileText, Download, Share2, Printer, X, Receipt, Building2, Phone, Calendar, ArrowRight, CheckCircle2, CircleDashed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";

// Types
type Transaction = {
    id: string;
    customer_id: string | null;
    customer_nama: string;
    customer_no_hp: string | null;
    customer_alamat: string | null;
    tipe: 'jual' | 'beli' | 'tukar_tambah';
    status: 'draft' | 'paid' | 'cancelled';
    subtotal: number;
    diskon: number;
    total: number;
    catatan: string | null;
    created_at: string;
    paid_at: string | null;
};

type TransactionItem = {
    id?: number;
    transaction_id: string;
    product_id: string;
    nama_produk: string;
    merek: string;
    tipe_produk: string;
    qty: number;
    harga_modal: number;
    harga_jual: number;
    harga_tukar: number | null;
    subtotal: number;
    garansi: string | null;
};

type Customer = {
    id: string;
    nama: string;
    no_hp: string | null;
};

type Product = {
    id: string;
    nama: string;
    merek: string;
    tipe: string;
    harga_jual: number;
    harga_tukar: number | null;
    harga_modal: number;
    stok: number;
    garansi: string | null;
};

export default function TransaksiPage() {
    const supabase = createClient();
    
    // State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [txItems, setTxItems] = useState<TransactionItem[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);
    
    // Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // New TX Form Data
    const [newTx, setNewTx] = useState<Partial<Transaction>>({
        tipe: 'jual',
        status: 'paid',
        diskon: 0,
        catatan: ''
    });
    const [newTxItems, setNewTxItems] = useState<Partial<TransactionItem>[]>([]);

    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTransactions();
        fetchCustomersAndProducts();
    }, []);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
            if (data && data.length > 0 && !selectedTx) {
                // handleSelectTx(data[0]);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Gagal memuat data transaksi");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomersAndProducts = async () => {
        const [custRes, prodRes] = await Promise.all([
            supabase.from('customers').select('id, nama, no_hp').order('nama'),
            supabase.from('products').select('id, nama, merek, tipe, harga_jual, harga_tukar, harga_modal, stok, garansi').order('nama')
        ]);
        if (custRes.data) setCustomers(custRes.data);
        if (prodRes.data) setProducts(prodRes.data);
    };

    const handleSelectTx = async (tx: Transaction) => {
        setSelectedTx(tx);
        setIsMobileListOpen(false);
        setIsLoadingItems(true);
        try {
            const { data, error } = await supabase
                .from('transaction_items')
                .select('*')
                .eq('transaction_id', tx.id);
            if (error) throw error;
            setTxItems(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingItems(false);
        }
    };

    // ----- CREATE TRANSACTION LOGIC -----
    const handleAddProduct = (productId: string) => {
        const prod = products.find(p => p.id === productId);
        if (!prod) return;
        
        const priceToUse = newTx.tipe === 'tukar_tambah' ? (prod.harga_tukar || prod.harga_jual) : prod.harga_jual;

        setNewTxItems([...newTxItems, {
            product_id: prod.id,
            nama_produk: prod.nama,
            merek: prod.merek,
            tipe_produk: prod.tipe,
            qty: 1,
            harga_modal: prod.harga_modal,
            harga_jual: prod.harga_jual,
            harga_tukar: prod.harga_tukar,
            subtotal: priceToUse,
            garansi: prod.garansi
        }]);
    };

    const handleUpdateItemQty = (index: number, delta: number) => {
        const updated = [...newTxItems];
        const item = updated[index];
        const newQty = (item.qty || 1) + delta;
        if (newQty < 1) return;
        
        item.qty = newQty;
        const priceToUse = newTx.tipe === 'tukar_tambah' ? (item.harga_tukar || item.harga_jual || 0) : (item.harga_jual || 0);
        item.subtotal = priceToUse * newQty;
        
        setNewTxItems(updated);
    };

    const handleRemoveItem = (index: number) => {
        setNewTxItems(newTxItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const subtotal = newTxItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);
        const diskon = newTx.diskon || 0;
        const total = subtotal - diskon;
        return { subtotal, total };
    };

    const handleSaveTransaction = async () => {
        if (!newTx.customer_nama && !newTx.customer_id) {
            toast.error("Pilih atau masukkan nama pelanggan");
            return;
        }
        if (newTxItems.length === 0) {
            toast.error("Tambahkan minimal 1 produk");
            return;
        }

        try {
            setIsSaving(true);
            const { subtotal, total } = calculateTotals();
            
            let customerId = newTx.customer_id;
            let customerNama = newTx.customer_nama;
            
            // If new customer typed
            if (!customerId && customerNama) {
                const { data: newCust, error: errCust } = await supabase
                    .from('customers')
                    .insert([{ nama: customerNama, no_hp: newTx.customer_no_hp }])
                    .select('id').single();
                if (!errCust && newCust) {
                    customerId = newCust.id;
                }
            } else if (customerId) {
                const c = customers.find(c => c.id === customerId);
                if (c) customerNama = c.nama;
            }

            // Insert Transaction
            const txPayload = {
                customer_id: customerId || null,
                customer_nama: customerNama || 'Umum',
                customer_no_hp: newTx.customer_no_hp || null,
                tipe: newTx.tipe,
                status: newTx.status,
                subtotal,
                diskon: newTx.diskon || 0,
                total,
                catatan: newTx.catatan || null,
                paid_at: newTx.status === 'paid' ? new Date().toISOString() : null
            };

            const { data: insertedTx, error: txError } = await supabase
                .from('transactions')
                .insert([txPayload])
                .select().single();

            if (txError) throw txError;

            // Insert Items
            const itemsPayload = newTxItems.map(item => ({
                ...item,
                transaction_id: insertedTx.id,
            }));

            const { error: itemsError } = await supabase
                .from('transaction_items')
                .insert(itemsPayload as any);

            if (itemsError) throw itemsError;

            // Update Stok
            for (const item of newTxItems) {
                const prod = products.find(p => p.id === item.product_id);
                if (prod && newTx.status === 'paid') {
                    await supabase.from('products').update({ stok: prod.stok - (item.qty || 1) }).eq('id', prod.id);
                }
            }

            toast.success("Transaksi berhasil dibuat!");
            setIsCreateOpen(false);
            setNewTx({ tipe: 'jual', status: 'paid', diskon: 0, catatan: '' });
            setNewTxItems([]);
            fetchTransactions();
            handleSelectTx(insertedTx);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal menyimpan transaksi");
        } finally {
            setIsSaving(false);
        }
    };

    // ----- INVOICE GENERATION -----
    const handleShareWA = async () => {
        if (!invoiceRef.current || !selectedTx) return;
        try {
            toast.loading("Menyiapkan invoice...", { id: "invoice" });
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff"
            });
            
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    toast.error("Gagal membuat gambar", { id: "invoice" });
                    return;
                }
                const file = new File([blob], `Invoice-${selectedTx.id}.png`, { type: "image/png" });
                
                // Try Web Share API (Works well on Mobile Chrome/Safari for WhatsApp)
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: `Invoice ${selectedTx.id}`,
                            text: `Berikut lampiran invoice pesanan Anda dari Siswanto Aki. Terima kasih!`
                        });
                        toast.success("Berhasil membuka menu share", { id: "invoice" });
                    } catch (e) {
                        console.log("Share cancelled or failed", e);
                        toast.dismiss("invoice");
                    }
                } else {
                    // Fallback for Desktop: Copy to Clipboard
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ "image/png": blob })
                        ]);
                        toast.success("Gambar disalin ke Clipboard! Silakan paste (Ctrl+V) di WhatsApp.", { id: "invoice", duration: 5000 });
                    } catch (e) {
                        // Ultimate fallback: Download
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `Invoice-${selectedTx.id}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Gambar diunduh. Silakan kirim via WhatsApp.", { id: "invoice", duration: 4000 });
                    }
                }
            }, "image/png");

        } catch (error) {
            console.error(error);
            toast.error("Gagal membuat invoice", { id: "invoice" });
        }
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    const filteredTx = transactions.filter(tx => 
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.customer_nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-4rem)]">
                <div className="grid grid-cols-12 gap-0 h-full">

                    {/* ── LEFT SIDEBAR: LIST ── */}
                    <div className={`${isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-4 xl:col-span-3 flex-col h-full border-r border-border/40 bg-background/50`}>
                        <div className="flex-none p-4 md:p-5 border-b border-border/40 bg-background/80 backdrop-blur-xl space-y-4 z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-foreground">Transaksi</h2>
                                <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-9 lg:h-10 pl-3 pr-2 rounded-full gap-1.5 bg-primary text-primary-foreground font-bold text-xs lg:text-sm hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 shrink-0">
                                    <span>Buat Baru</span>
                                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <Plus className="w-3 h-3" />
                                    </span>
                                </Button>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <Input
                                    placeholder="Cari invoice atau nama..."
                                    className="pl-10 pr-9 h-11 rounded-full border-border/60 bg-card shadow-none text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/50 transition-all hover:border-primary/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-3 lg:p-4 flex flex-col gap-2">
                                {isLoading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : filteredTx.map((tx, i) => (
                                    <div
                                        key={tx.id}
                                        className={`group relative cursor-pointer transition-all duration-300 rounded-xl lg:rounded-2xl p-3.5 border ${selectedTx?.id === tx.id ? 'bg-primary/10 border-primary/40 shadow-sm' : 'bg-card border-border/60 hover:border-border hover:shadow-sm'}`}
                                        onClick={() => handleSelectTx(tx)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-[13px] font-extrabold font-mono tracking-tight ${selectedTx?.id === tx.id ? 'text-primary' : 'text-foreground'}`}>
                                                        {tx.id}
                                                    </p>
                                                    {tx.status === 'paid' ? (
                                                        <span className="bg-green-500/10 text-green-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Lunas</span>
                                                    ) : (
                                                        <span className="bg-amber-500/10 text-amber-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Draft</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold truncate text-foreground/80">{tx.customer_nama}</p>
                                                <p className="text-[11px] font-bold text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-foreground">{formatRupiah(tx.total).replace(',00','')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* ── RIGHT SIDE: INVOICE PREVIEW ── */}
                    <div className={`${!isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-8 xl:col-span-9 h-full flex-col bg-muted/20 relative`}>
                        {selectedTx ? (
                            <>
                                <div className="flex-none p-4 md:p-6 border-b border-border/40 bg-background/80 backdrop-blur-xl z-10 sticky top-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-10 w-10 rounded-full bg-muted/50 border border-border/50" onClick={() => setIsMobileListOpen(true)}>
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <div>
                                                <h1 className="text-xl font-extrabold tracking-tight">Detail Invoice</h1>
                                                <p className="text-sm text-muted-foreground font-mono">{selectedTx.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleShareWA} className="h-10 lg:h-11 rounded-full gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 shadow-sm">
                                                <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share WA</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 p-4 md:p-8">
                                    <div className="max-w-3xl mx-auto">
                                        
                                        {/* INVOICE DOM ELEMENT (For HTML2Canvas) */}
                                        <div 
                                            ref={invoiceRef} 
                                            className="bg-white text-black p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 mx-auto"
                                            style={{ width: '800px', maxWidth: '100%' }} // Fixed width for consistent render
                                        >
                                            {/* Header */}
                                            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6 mb-6">
                                                <div>
                                                    <h2 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase">INVOICE</h2>
                                                    <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest">{selectedTx.id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Siswanto Aki</h3>
                                                    <p className="text-sm text-gray-600 mt-1">Jl. Magelang KM 5.5, Sleman<br/>Yogyakarta 55284</p>
                                                    <p className="text-sm text-gray-600 mt-0.5">WA: 0813-5400-7400</p>
                                                </div>
                                            </div>

                                            {/* Customer & Info Info */}
                                            <div className="flex justify-between mb-8">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ditagihkan Kepada:</p>
                                                    <p className="text-base font-extrabold text-gray-900">{selectedTx.customer_nama}</p>
                                                    {selectedTx.customer_no_hp && <p className="text-sm text-gray-600">{selectedTx.customer_no_hp}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                                        <span className="text-gray-500 font-medium text-right">Tanggal:</span>
                                                        <span className="font-bold text-gray-900">{new Date(selectedTx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                                        
                                                        <span className="text-gray-500 font-medium text-right">Tipe:</span>
                                                        <span className="font-bold text-gray-900 capitalize">{selectedTx.tipe.replace('_', ' ')}</span>
                                                        
                                                        <span className="text-gray-500 font-medium text-right">Status:</span>
                                                        <span className={`font-bold uppercase tracking-wider ${selectedTx.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                                            {selectedTx.status === 'paid' ? 'LUNAS' : 'DRAFT'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items Table */}
                                            <div className="mb-8">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b-2 border-gray-800">
                                                            <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider">Item</th>
                                                            <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Qty</th>
                                                            <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Harga</th>
                                                            <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {isLoadingItems ? (
                                                            <tr><td colSpan={4} className="py-4 text-center text-sm text-gray-400">Memuat item...</td></tr>
                                                        ) : txItems.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="py-4 px-2">
                                                                    <p className="font-bold text-gray-900">{item.nama_produk}</p>
                                                                    {item.garansi && <p className="text-xs text-gray-500 mt-0.5">Garansi: {item.garansi}</p>}
                                                                </td>
                                                                <td className="py-4 px-2 text-center font-medium text-gray-900">{item.qty}</td>
                                                                <td className="py-4 px-2 text-right font-medium text-gray-900">
                                                                    {formatRupiah((item.subtotal / item.qty))}
                                                                </td>
                                                                <td className="py-4 px-2 text-right font-bold text-gray-900">{formatRupiah(item.subtotal)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Totals */}
                                            <div className="flex justify-end border-t-2 border-gray-800 pt-4 mb-10">
                                                <div className="w-64 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600 font-medium">Subtotal</span>
                                                        <span className="font-bold text-gray-900">{formatRupiah(selectedTx.subtotal)}</span>
                                                    </div>
                                                    {selectedTx.diskon > 0 && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 font-medium">Diskon</span>
                                                            <span className="font-bold text-red-600">-{formatRupiah(selectedTx.diskon)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
                                                        <span className="text-base font-black text-gray-900 uppercase tracking-wider">TOTAL</span>
                                                        <span className="text-2xl font-black text-indigo-900">{formatRupiah(selectedTx.total)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Note */}
                                            <div className="border-t border-gray-100 pt-4 text-center">
                                                <p className="text-sm font-bold text-gray-800">Terima kasih atas kepercayaan Anda!</p>
                                                <p className="text-xs text-gray-500 mt-1">Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan kecuali ada perjanjian.<br/>Klaim garansi wajib menyertakan invoice ini (atau versi digital).</p>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="h-12" />
                                </ScrollArea>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-card border border-border/60 shadow-sm flex items-center justify-center mb-6">
                                    <Receipt className="w-8 h-8 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-xl font-extrabold text-foreground tracking-tight">Pilih Transaksi</h3>
                                <p className="text-sm font-medium text-muted-foreground mt-2 max-w-sm">
                                    Pilih invoice dari daftar di sebelah kiri untuk melihat detail atau membagikan ke pelanggan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── CREATE TRANSACTION DIALOG ── */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden rounded-2xl lg:rounded-3xl border border-border/60 shadow-2xl bg-background/95 backdrop-blur-2xl">
                    <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/20">
                        <DialogTitle className="text-xl font-extrabold tracking-tight">Buat Transaksi Baru</DialogTitle>
                    </DialogHeader>

                    <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            
                            {/* Left: Info */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        Data Pelanggan
                                    </h4>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-xs font-bold text-foreground">Nama Pelanggan <span className="text-destructive">*</span></Label>
                                            <Input 
                                                placeholder="Ketik nama atau pilih..." 
                                                value={newTx.customer_nama || ''}
                                                onChange={(e) => setNewTx({...newTx, customer_nama: e.target.value})}
                                                className="mt-1.5 h-11 rounded-xl"
                                                list="customers-list"
                                            />
                                            <datalist id="customers-list">
                                                {customers.map(c => <option key={c.id} value={c.nama} />)}
                                            </datalist>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-foreground">No. WhatsApp</Label>
                                            <Input 
                                                placeholder="0812..." 
                                                value={newTx.customer_no_hp || ''}
                                                onChange={(e) => setNewTx({...newTx, customer_no_hp: e.target.value})}
                                                className="mt-1.5 h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        Pengaturan Transaksi
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs font-bold text-foreground">Tipe Transaksi</Label>
                                            <select 
                                                className="w-full mt-1.5 h-11 rounded-xl border border-border/60 bg-background px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                value={newTx.tipe}
                                                onChange={(e) => setNewTx({...newTx, tipe: e.target.value as any})}
                                            >
                                                <option value="jual">Jual Baru</option>
                                                <option value="tukar_tambah">Tukar Tambah</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-foreground">Status</Label>
                                            <select 
                                                className="w-full mt-1.5 h-11 rounded-xl border border-border/60 bg-background px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                value={newTx.status}
                                                onChange={(e) => setNewTx({...newTx, status: e.target.value as any})}
                                            >
                                                <option value="paid">Lunas (Paid)</option>
                                                <option value="draft">Draft (Belum Bayar)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-foreground">Diskon Total (Rp)</Label>
                                        <Input 
                                            type="number"
                                            value={newTx.diskon || ''}
                                            onChange={(e) => setNewTx({...newTx, diskon: parseInt(e.target.value) || 0})}
                                            className="mt-1.5 h-11 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Items */}
                            <div className="space-y-6 flex flex-col h-full">
                                <h4 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Produk & Item
                                </h4>
                                
                                <div className="flex gap-2">
                                    <select 
                                        className="flex-1 h-11 rounded-xl border border-border/60 bg-background px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleAddProduct(e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                    >
                                        <option value="">+ Pilih Produk...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.nama} - {formatRupiah(newTx.tipe === 'tukar_tambah' ? (p.harga_tukar || p.harga_jual) : p.harga_jual)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1 bg-muted/20 border border-border/40 rounded-xl p-3 min-h-[200px]">
                                    {newTxItems.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-sm text-muted-foreground font-medium">
                                            Belum ada item ditambahkan.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {newTxItems.map((item, idx) => (
                                                <div key={idx} className="bg-card border border-border/60 rounded-lg p-3 flex flex-col gap-2 relative group">
                                                    <div className="flex justify-between items-start pr-6">
                                                        <p className="text-sm font-bold leading-tight">{item.nama_produk}</p>
                                                        <button onClick={() => handleRemoveItem(idx)} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center border border-border/60 rounded-md bg-background">
                                                                <button onClick={() => handleUpdateItemQty(idx, -1)} className="px-2 py-1 text-muted-foreground hover:text-foreground">-</button>
                                                                <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                                                                <button onClick={() => handleUpdateItemQty(idx, 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground">+</button>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">@ {formatRupiah((item.subtotal || 0) / (item.qty || 1))}</span>
                                                        </div>
                                                        <span className="text-sm font-black">{formatRupiah(item.subtotal || 0)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm mt-auto">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-muted-foreground font-medium">Subtotal</span>
                                        <span className="font-bold">{formatRupiah(newTxItems.reduce((a, b) => a + (b.subtotal || 0), 0))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-3">
                                        <span className="text-muted-foreground font-medium">Diskon</span>
                                        <span className="font-bold text-destructive">-{formatRupiah(newTx.diskon || 0)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-border/40 pt-3">
                                        <span className="text-base font-extrabold tracking-tight">TOTAL</span>
                                        <span className="text-xl font-black text-primary">{formatRupiah(newTxItems.reduce((a, b) => a + (b.subtotal || 0), 0) - (newTx.diskon || 0))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                            className="h-11 rounded-full font-bold border-border/60 px-6"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSaveTransaction}
                            disabled={isSaving || newTxItems.length === 0}
                            className="gap-2 h-11 rounded-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan & Buat Invoice
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
