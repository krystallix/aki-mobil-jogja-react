"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import {
    Search, Plus, Save, Loader2, ChevronLeft,
    X, Share2, AlertCircle, ShoppingBag, Calendar as CalendarIcon,
    Trash2, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import { QRCodeSVG } from "qrcode.react";
import { formatDateWIB } from "@/lib/utils";

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
    created_at?: string;
    updated_at?: string;
    paid_at?: string | null;
    transaction_items?: TransactionItem[];
};

type TransactionItem = {
    id?: number;
    transaction_id?: string;
    product_id: string;
    nama_produk: string;
    merek: string;
    tipe_produk: string;
    qty: number;
    harga_modal: number;
    harga_jual: number;
    harga_tukar: number | null;
    nilai_aki_lama?: number | null;
    subtotal: number;
    garansi: string | null;
    kondisi?: 'baru' | 'bekas';
};

type Customer = {
    id: string;
    nama: string;
    no_hp: string | null;
    alamat: string | null;
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

const DEFAULT_TX: Partial<Transaction> = {
    customer_nama: '',
    customer_no_hp: '',
    customer_alamat: '',
    tipe: 'jual',
    status: 'paid',
    diskon: 0,
    catatan: ''
};

export default function TransaksiPage() {
    const supabase = createClient();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [formData, setFormData] = useState<Partial<Transaction>>(DEFAULT_TX);
    const [formItems, setFormItems] = useState<TransactionItem[]>([]);
    const [ongkir, setOngkir] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Search Combobox states
    const [custSearch, setCustSearch] = useState("");
    const [isCustOpen, setIsCustOpen] = useState(false);
    const [prodSearch, setProdSearch] = useState("");
    const [isProdOpen, setIsProdOpen] = useState(false);

    const invoiceRef = useRef<HTMLDivElement>(null);
    const invoicePrintRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTransactions();
        fetchCustomersAndProducts();
    }, []);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('*, transaction_items(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Gagal memuat data transaksi");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomersAndProducts = async () => {
        const [custRes, prodRes] = await Promise.all([
            supabase.from('customers').select('id, nama, no_hp, alamat').order('nama'),
            supabase.from('products').select('id, nama, merek, tipe, harga_jual, harga_tukar, harga_modal, stok, garansi').order('nama')
        ]);
        if (custRes.data) setCustomers(custRes.data);
        if (prodRes.data) setProducts(prodRes.data);
    };

    const handleSelectTx = async (tx: Transaction) => {
        let extractedOngkir = 0;
        let newCatatan = tx.catatan || '';

        if (newCatatan.includes('Ongkir: Rp ')) {
            const match = newCatatan.match(/Ongkir: Rp (\d+)/);
            if (match) {
                extractedOngkir = parseInt(match[1], 10);
                newCatatan = newCatatan.replace(/Ongkir: Rp \d+/, '').trim();
            }
        }

        setOngkir(extractedOngkir);
        setFormData({ ...tx, catatan: newCatatan });
        setCustSearch(tx.customer_nama);
        setIsMobileListOpen(false);
        setIsLoadingItems(true);

        try {
            const { data, error } = await supabase
                .from('transaction_items')
                .select('*')
                .eq('transaction_id', tx.id);
            if (error) throw error;
            setFormItems(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingItems(false);
        }
    };

    const handleCreateNew = () => {
        setFormData(DEFAULT_TX);
        setFormItems([]);
        setOngkir(0);
        setCustSearch("");
        setProdSearch("");
        setIsMobileListOpen(false);
    };

    // ----- ITEM MANAGEMENT -----
    const handleAddProduct = (productId: string) => {
        const prod = products.find(p => p.id === productId);
        if (!prod) return;

        const priceToUse = formData.tipe === 'tukar_tambah' ? (prod.harga_tukar || prod.harga_jual) : prod.harga_jual;

        setFormItems([...formItems, {
            product_id: prod.id,
            nama_produk: prod.nama,
            merek: prod.merek,
            tipe_produk: prod.tipe,
            qty: 1,
            harga_modal: prod.harga_modal,
            harga_jual: prod.harga_jual,
            harga_tukar: prod.harga_tukar,
            nilai_aki_lama: formData.tipe === 'tukar_tambah' ? 0 : null,
            subtotal: priceToUse,
            garansi: prod.garansi,
            kondisi: (prod as any).kondisi || 'baru'
        }]);
    };

    const handleUpdateItemQty = (index: number, newQty: number) => {
        const updated = [...formItems];
        const item = updated[index];
        if (newQty < 1) newQty = 1;

        item.qty = newQty;
        const priceToUse = formData.tipe === 'tukar_tambah' ? (item.harga_tukar || item.harga_jual || 0) : (item.harga_jual || 0);
        item.subtotal = priceToUse * newQty;

        setFormItems(updated);
    };

    const handleUpdateItemPrice = (index: number, newPrice: number) => {
        const updated = [...formItems];
        const item = updated[index];

        if (formData.tipe === 'tukar_tambah') {
            item.harga_tukar = newPrice;
        } else {
            item.harga_jual = newPrice;
        }

        item.subtotal = newPrice * (item.qty || 1);
        setFormItems(updated);
    };

    const handleUpdateItemGaransi = (index: number, newGaransi: string) => {
        const updated = [...formItems];
        updated[index].garansi = newGaransi;
        setFormItems(updated);
    };

    const handleUpdateItemModal = (index: number, newModal: number) => {
        const updated = [...formItems];
        updated[index].harga_modal = newModal;
        setFormItems(updated);
    };

    const handleUpdateItemNilaiAkiLama = (index: number, newNilai: number) => {
        const updated = [...formItems];
        updated[index].nilai_aki_lama = newNilai;
        setFormItems(updated);
    };

    const handleUpdateItemKondisi = (index: number, newKondisi: 'baru' | 'bekas') => {
        const updated = [...formItems];
        updated[index].kondisi = newKondisi;
        setFormItems(updated);
    };

    const handleRemoveItem = (index: number) => {
        setFormItems(formItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const subtotal = formItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);
        const diskon = formData.diskon || 0;
        const total = subtotal + ongkir - diskon;
        return { subtotal, total };
    };

    // ----- SAVE TRANSACTION -----
    const handleSave = async () => {
        if (!formData.customer_nama && !formData.customer_id) {
            toast.error("Nama pelanggan wajib diisi!");
            return;
        }
        if (formItems.length === 0) {
            toast.error("Tambahkan minimal 1 produk!");
            return;
        }

        try {
            setIsSaving(true);
            const isNew = !formData.id;
            const { subtotal, total } = calculateTotals();

            let customerId = formData.customer_id;
            let customerNama = formData.customer_nama;

            if (!customerId && customerNama) {
                const existingCust = customers.find(c => c.nama.toLowerCase() === customerNama?.toLowerCase());
                if (existingCust) {
                    customerId = existingCust.id;
                    customerNama = existingCust.nama;
                } else {
                    const { data: newCust, error: errCust } = await supabase
                        .from('customers')
                        .insert([{
                            nama: customerNama,
                            no_hp: formData.customer_no_hp,
                            alamat: formData.customer_alamat
                        }])
                        .select('id').single();
                    if (!errCust && newCust) {
                        customerId = newCust.id;
                    }
                }
            }

            const catatanText = (formData.catatan || '').trim();
            const finalCatatan = ongkir > 0 ? (catatanText ? `${catatanText}\nOngkir: Rp ${ongkir}` : `Ongkir: Rp ${ongkir}`) : catatanText;

            const txPayload = {
                customer_id: customerId || null,
                customer_nama: customerNama || 'Umum',
                customer_no_hp: formData.customer_no_hp || null,
                customer_alamat: formData.customer_alamat || null,
                tipe: formData.tipe,
                status: formData.status,
                subtotal,
                diskon: formData.diskon || 0,
                total,
                catatan: finalCatatan || null,
                updated_at: new Date().toISOString(),
                ...(formData.status === 'paid' && !formData.paid_at ? { paid_at: new Date().toISOString() } : {}),
                ...(formData.created_at ? { created_at: formData.created_at } : {})
            };

            let savedTxId = formData.id;

            if (isNew) {
                const { data: insertedTx, error: txError } = await supabase
                    .from('transactions')
                    .insert([txPayload])
                    .select().single();

                if (txError) throw txError;
                savedTxId = insertedTx.id;
            } else {
                const { data: updatedTx, error: updateError } = await supabase
                    .from('transactions')
                    .update(txPayload)
                    .eq('id', formData.id)
                    .select().single();

                if (updateError) throw updateError;

                await supabase.from('transaction_items').delete().eq('transaction_id', formData.id);
            }

            // Prepare items and insert custom products on the fly
            const finalItemsPayload = [];
            for (const item of formItems) {
                let finalProductId = item.product_id;

                // If it's a new custom product created in the UI
                if (finalProductId.startsWith('NEW_CUSTOM_')) {
                    const { data: newProd, error: newProdErr } = await supabase
                        .from('products')
                        .insert([{
                            nama: item.nama_produk,
                            kategori: 'Lainnya',
                            merek: 'Kustom',
                            tipe: 'Kustom',
                            harga_modal: item.harga_modal || 0,
                            harga_jual: formData.tipe !== 'tukar_tambah' ? item.harga_jual : 0,
                            harga_tukar: formData.tipe === 'tukar_tambah' ? item.harga_tukar : 0,
                            stok: 0
                        }])
                        .select('id').single();

                    if (newProdErr) {
                        console.error("Error creating custom product:", newProdErr);
                        throw new Error(`Gagal menyimpan produk kustom "${item.nama_produk}": ${newProdErr.message}`);
                    }

                    if (newProd) {
                        finalProductId = newProd.id;
                    }
                }

                finalItemsPayload.push({
                    transaction_id: savedTxId,
                    product_id: finalProductId,
                    nama_produk: item.nama_produk,
                    merek: item.merek,
                    tipe_produk: item.tipe_produk,
                    qty: item.qty,
                    harga_modal: item.harga_modal,
                    harga_jual: item.harga_jual,
                    harga_tukar: item.harga_tukar,
                    nilai_aki_lama: item.nilai_aki_lama || 0,
                    subtotal: item.subtotal,
                    garansi: item.garansi,
                    kondisi: item.kondisi || 'baru'
                });
            }

            const { error: itemsError } = await supabase
                .from('transaction_items')
                .insert(finalItemsPayload);

            if (itemsError) throw itemsError;

            // Update product stock if paid
            if (txPayload.status === 'paid' && isNew) {
                for (const item of formItems) {
                    if (!item.product_id.startsWith('NEW_CUSTOM_')) {
                        const prod = products.find(p => p.id === item.product_id);
                        if (prod) {
                            await supabase.from('products').update({ stok: prod.stok - (item.qty || 1) }).eq('id', prod.id);
                        }
                    }
                }
            }

            // Record Aki Lama if it's paid and has trade-in value
            if (txPayload.status === 'paid') {
                for (const item of finalItemsPayload) {
                    if (item.nilai_aki_lama && item.nilai_aki_lama > 0) {
                        // To avoid duplicates when updating an existing paid transaction
                        const { data: existingAki } = await supabase
                            .from('aki_lama')
                            .select('id')
                            .eq('transaction_id', savedTxId)
                            .limit(1);

                        if (!existingAki || existingAki.length === 0) {
                            await supabase.from('aki_lama').insert({
                                transaction_id: savedTxId,
                                keterangan: `Tukar Tambah - ${item.nama_produk}`,
                                nilai: item.nilai_aki_lama,
                                status: 'belum_dijual'
                            });
                        }
                    }
                }
            }

            // Update customer purchase stats
            if (txPayload.status === 'paid' && customerId) {
                const { data: customerTxs } = await supabase
                    .from('transactions')
                    .select('total, created_at')
                    .eq('customer_id', customerId)
                    .eq('status', 'paid');

                if (customerTxs && customerTxs.length > 0) {
                    const totalCount = customerTxs.length;
                    const totalValue = customerTxs.reduce((acc, tx) => acc + (tx.total || 0), 0);
                    const dates = customerTxs.filter(tx => tx.created_at).map(tx => new Date(tx.created_at!).getTime());

                    const updatePayload: any = {
                        total_pembelian: totalCount,
                        total_nilai_pembelian: totalValue,
                    };

                    if (dates.length > 0) {
                        updatePayload.pertama_beli = new Date(Math.min(...dates)).toISOString();
                        updatePayload.terakhir_beli = new Date(Math.max(...dates)).toISOString();
                    }

                    await supabase
                        .from('customers')
                        .update(updatePayload)
                        .eq('id', customerId);
                }
            }

            // Refresh List
            fetchTransactions();

            if (window.innerWidth < 1280) {
                setIsMobileListOpen(true);
            }

            toast.success(isNew ? 'Transaksi berhasil ditambahkan' : 'Data transaksi diperbarui');
        } catch (error: any) {
            console.error("Error saving tx:", error);
            toast.error(error.message || 'Gagal menyimpan transaksi');
        } finally {
            setIsSaving(false);
        }
    };

    const getWarrantyInfo = (tx: Transaction) => {
        if (!tx.transaction_items || tx.transaction_items.length === 0) return null;
        if (tx.status !== 'paid') return null;

        const purchaseDate = new Date(tx.created_at || '');
        let maxExpiry = purchaseDate;
        let hasWarranty = false;

        tx.transaction_items.forEach(item => {
            if (item.garansi) {
                const match = item.garansi.match(/(\d+)/);
                if (match) {
                    hasWarranty = true;
                    const months = parseInt(match[1]);
                    const expiry = new Date(purchaseDate);
                    expiry.setMonth(expiry.getMonth() + months);
                    if (expiry > maxExpiry) maxExpiry = expiry;
                }
            }
        });

        if (!hasWarranty) return null;

        const now = new Date();
        const diffTime = maxExpiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            active: diffDays > 0,
            days: diffDays
        };
    };

    const handleDeleteClick = (tx: Transaction, e: React.MouseEvent) => {
        e.stopPropagation();
        setTxToDelete(tx);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!txToDelete) return;
        try {
            setIsDeleting(true);
            await supabase.from('transaction_items').delete().eq('transaction_id', txToDelete.id);
            const { error } = await supabase.from('transactions').delete().eq('id', txToDelete.id);
            if (error) throw error;

            setTransactions(transactions.filter(t => t.id !== txToDelete.id));
            if (formData.id === txToDelete.id) {
                handleCreateNew();
                setIsMobileListOpen(true);
            }
            toast.success('Transaksi berhasil dihapus');
        } catch (error: any) {
            console.error("Error deleting tx:", error);
            toast.error(error.message || 'Gagal menghapus transaksi');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setTxToDelete(null);
        }
    };

    const handleShareWA = async () => {
        if (!invoicePrintRef.current || !formData.id) return;
        try {
            toast.loading("Menyiapkan invoice...", { id: "invoice" });

            // Make the hidden element temporarily visible for html2canvas to render correctly
            const el = invoicePrintRef.current;
            const prevVisibility = el.style.visibility;
            el.style.visibility = 'visible';

            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                width: 800,
                windowWidth: 800,
            });

            el.style.visibility = prevVisibility;

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    toast.error("Gagal membuat gambar", { id: "invoice" });
                    return;
                }
                const file = new File([blob], `Invoice-${formData.id}.png`, { type: "image/png" });

                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const link = origin && formData.id && formData.customer_id 
                    ? `${origin}/invoice/${formData.id.split('-').pop()}-${formData.customer_id.split('-')[0]}` 
                    : '';

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: `Invoice ${formData.id}`,
                            text: `Berikut lampiran invoice pesanan Anda. Terima kasih!\n\nUntuk melihat sisa garansi silahkan scan QR di invoice atau kunjungi laman berikut:\n${link}`
                        });
                        toast.success("Berhasil membuka menu share", { id: "invoice" });
                    } catch (e) {
                        toast.dismiss("invoice");
                    }
                } else {
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ "image/png": blob })
                        ]);
                        toast.success("Gambar disalin ke Clipboard! Silakan paste di WhatsApp.", { id: "invoice", duration: 5000 });
                    } catch (e) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `Invoice-${formData.id}.png`;
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

    const filteredTransactions = transactions.filter(t =>
        t.customer_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCustomers = customers.filter(c => c.nama.toLowerCase().includes(custSearch.toLowerCase()));
    const filteredProducts = products.filter(p => p.nama.toLowerCase().includes(prodSearch.toLowerCase()));

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    const currentSubtotal = formItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);
    const currentTotal = currentSubtotal + ongkir - (formData.diskon || 0);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const invoiceLink = origin && formData.id && formData.customer_id 
        ? `${origin}/invoice/${formData.id.split('-').pop()}-${formData.customer_id.split('-')[0]}` 
        : '';

    return (
        <DashboardLayout>
            <div className="h-full bg-background">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 h-full overflow-hidden">

                    {/* ── LEFT PANE: LIST ── */}
                    <div className={`${isMobileListOpen ? 'flex' : 'hidden'} xl:flex xl:col-span-3 flex-col h-full min-h-0 border-r border-border/40 bg-muted/10 relative z-20`}>
                        <div className="flex-none p-5 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-extrabold tracking-tight">Transaksi</h2>
                                <Button
                                    size="sm"
                                    onClick={handleCreateNew}
                                    className="h-9 rounded-full pl-3 pr-1 gap-1.5 bg-primary hover:bg-primary/90"
                                >
                                    <span>Baru</span>
                                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></span>
                                </Button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari transaksi..."
                                    className="pl-9 pr-9 h-10 rounded-full border-border/60 bg-card text-xs font-bold"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-muted p-1 rounded-full"><X className="w-3.5 h-3.5" /></button>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-3 flex flex-col gap-2">
                                {isLoading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary/50" /></div>
                                ) : filteredTransactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        onClick={() => handleSelectTx(tx)}
                                        className={`p-2.5 rounded-xl cursor-pointer transition-all border group relative ${formData.id === tx.id ? 'bg-primary/5 border-primary/50 shadow-sm' : 'bg-card border-border/40 hover:bg-muted/50'}`}
                                    >
                                        <div className="flex justify-between items-center mb-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 tracking-tight uppercase">
                                                {tx.id.split('-').pop()} • {new Date(tx.created_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </p>
                                            {getWarrantyInfo(tx) && (
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${getWarrantyInfo(tx)?.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {getWarrantyInfo(tx)?.active ? `${getWarrantyInfo(tx)?.days} Hari` : 'Habis'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-end gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-black truncate leading-tight">{tx.customer_nama}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                                                    {tx.customer_no_hp ? `${tx.customer_no_hp.slice(0, 4)}...${tx.customer_no_hp.slice(-4)}` : '-'}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[13px] font-black text-foreground">{formatRupiah(tx.total).replace(',00', '')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* ── RIGHT PANE: FORM & PREVIEW ── */}
                    <div className={`${!isMobileListOpen ? 'flex' : 'hidden'} xl:flex xl:col-span-9 flex-col h-full min-h-0 bg-muted/5 relative z-10 overflow-hidden`}>
                        <div className="flex-none p-4 lg:px-6 border-b border-border/40 bg-background/80 backdrop-blur-2xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="xl:hidden h-8 w-8 rounded-full bg-muted" onClick={() => setIsMobileListOpen(true)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <h1 className="text-xl font-black">{formData.id ? `ID: ${formData.id.split('-').pop()}` : 'Transaksi Baru'}</h1>
                            </div>
                            <div className="flex gap-2">
                                {formData.id && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={(e) => handleDeleteClick(formData as Transaction, e)}
                                            className="h-10 w-10 rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40 shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleShareWA}
                                            className="h-10 rounded-full font-bold px-3 sm:px-4 shrink-0"
                                        >
                                            <Share2 className="w-4 h-4 sm:mr-2" />
                                            <span className="hidden sm:inline">Share</span>
                                        </Button>
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="xl:hidden h-10 w-10 rounded-full font-bold border-primary/20 text-primary shrink-0"
                                    onClick={() => document.getElementById('invoice-preview')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    <FileText className="w-4 h-4" />
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="h-10 rounded-full bg-primary font-bold px-4 sm:px-6 text-primary-foreground shrink-0"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin sm:mr-2" /> : <Save className="w-4 h-4 sm:mr-2" />}
                                    <span className="hidden sm:inline">Simpan</span>
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-4 lg:p-6 w-full max-w-[1600px] mx-auto">
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">

                                    {/* FORM AREA (5 Cols) */}
                                    <div className="xl:col-span-5 space-y-6">
                                        {/* CUSTOMER CARD */}
                                        <div className="p-5 rounded-[1.5rem] bg-card border border-border/40 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-1 h-5 rounded-full bg-primary text-primary" />
                                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                                                    Detail Pelanggan
                                                </h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nama Pelanggan / Cari</Label>
                                                    <Input
                                                        value={custSearch}
                                                        onChange={(e) => {
                                                            setCustSearch(e.target.value);
                                                            setFormData({ ...formData, customer_nama: e.target.value });
                                                            setIsCustOpen(true);
                                                        }}
                                                        onFocus={() => setIsCustOpen(true)}
                                                        onBlur={() => setTimeout(() => setIsCustOpen(false), 200)}
                                                        className="h-10 mt-1 rounded-lg bg-muted/30 font-bold"
                                                        placeholder="Ketik atau cari nama pelanggan..."
                                                    />
                                                    {isCustOpen && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border shadow-xl rounded-xl z-50 max-h-60 overflow-y-auto">
                                                            <div
                                                                className="px-4 py-3 border-b border-border hover:bg-muted cursor-pointer flex items-center gap-2 group transition-colors"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, customer_nama: custSearch, customer_id: null });
                                                                    setIsCustOpen(false);
                                                                }}
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20"><Plus className="w-3 h-3 text-primary" /></div>
                                                                <p className="text-xs font-extrabold text-primary">Tambah Kustom "{custSearch || 'Pelanggan Baru'}"</p>
                                                            </div>
                                                            {filteredCustomers.map(c => (
                                                                <div
                                                                    key={c.id}
                                                                    className="px-4 py-3 border-b border-border/40 hover:bg-muted cursor-pointer transition-colors"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, customer_id: c.id, customer_nama: c.nama, customer_no_hp: c.no_hp, customer_alamat: c.alamat });
                                                                        setCustSearch(c.nama);
                                                                        setIsCustOpen(false);
                                                                    }}
                                                                >
                                                                    <p className="text-sm font-bold text-foreground">{c.nama}</p>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">{c.no_hp || 'Tanpa no. WA'}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">No. WA</Label>
                                                        <Input value={formData.customer_no_hp || ''} onChange={(e) => setFormData({ ...formData, customer_no_hp: e.target.value })} className="h-10 mt-1 rounded-lg bg-muted/30 font-bold" placeholder="081..." />
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Alamat</Label>
                                                        <Input value={formData.customer_alamat || ''} onChange={(e) => setFormData({ ...formData, customer_alamat: e.target.value })} className="h-10 mt-1 rounded-lg bg-muted/30 font-bold" placeholder="Kota/Jalan..." />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SETTINGS CARD */}
                                        <div className="p-5 rounded-[1.5rem] bg-card border border-border/40 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-1 h-5 rounded-full bg-primary text-primary" />
                                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                                                    Informasi Tambahan
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tanggal Invoice</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant={"outline"}
                                                                className={`w-full h-10 mt-1 justify-start text-left font-bold rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 ${!formData.created_at && "text-muted-foreground"}`}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                                                {formData.created_at ? new Date(formData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Pilih Tanggal Custom (Opsional)"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={formData.created_at ? new Date(formData.created_at) : undefined}
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        // preserve time info if updating today
                                                                        const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
                                                                        setFormData({ ...formData, created_at: iso });
                                                                    } else {
                                                                        setFormData({ ...formData, created_at: undefined });
                                                                    }
                                                                }}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tipe Transaksi</Label>
                                                    <select
                                                        className="w-full h-10 mt-1 rounded-lg border border-border/40 bg-muted/30 px-3 text-sm font-bold"
                                                        value={formData.tipe} onChange={(e) => setFormData({ ...formData, tipe: e.target.value as any })}
                                                    >
                                                        <option value="jual">Jual</option>
                                                        <option value="tukar_tambah">Tukar Tambah</option>
                                                        <option value="beli">Beli</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Status</Label>
                                                    <select
                                                        className="w-full h-10 mt-1 rounded-lg border border-border/40 bg-muted/30 px-3 text-sm font-bold"
                                                        value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                                    >
                                                        <option value="draft">Draft</option>
                                                        <option value="paid">Lunas</option>
                                                        <option value="cancelled">Batal</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ongkir (Rp)</Label>
                                                    <Input type="number" value={ongkir || ''} onChange={(e) => setOngkir(parseInt(e.target.value) || 0)} className="h-10 mt-1 rounded-lg bg-muted/30 font-bold" placeholder="0" />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Diskon (Rp)</Label>
                                                    <Input type="number" value={formData.diskon || ''} onChange={(e) => setFormData({ ...formData, diskon: parseInt(e.target.value) || 0 })} className="h-10 mt-1 rounded-lg bg-muted/30 font-bold text-destructive" placeholder="0" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* PRODUCTS CART */}
                                        <div className="p-5 rounded-[1.5rem] bg-card border border-border/40 shadow-sm flex flex-col min-h-[300px]">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-1 h-5 rounded-full bg-primary text-primary" />
                                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                                                    Produk Aki
                                                </h3>
                                            </div>

                                            <div className="relative mb-4 z-40">
                                                <Input
                                                    value={prodSearch}
                                                    onChange={(e) => {
                                                        setProdSearch(e.target.value);
                                                        setIsProdOpen(true);
                                                    }}
                                                    onFocus={() => setIsProdOpen(true)}
                                                    onBlur={() => setTimeout(() => setIsProdOpen(false), 200)}
                                                    className="h-10 rounded-lg bg-muted/30 font-bold"
                                                    placeholder="Cari atau ketik nama produk..."
                                                />
                                                {isProdOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border shadow-xl rounded-xl z-50 max-h-60 overflow-y-auto">
                                                        <div
                                                            className="px-4 py-3 border-b border-border hover:bg-muted cursor-pointer flex items-center gap-2 group transition-colors"
                                                            onClick={() => {
                                                                if (prodSearch.trim()) {
                                                                    setFormItems([...formItems, {
                                                                        product_id: `NEW_CUSTOM_${Date.now()}`,
                                                                        nama_produk: prodSearch,
                                                                        merek: '-',
                                                                        tipe_produk: 'Kustom',
                                                                        qty: 1,
                                                                        harga_modal: 0,
                                                                        harga_jual: 0,
                                                                        harga_tukar: null,
                                                                        subtotal: 0,
                                                                        garansi: null
                                                                    }]);
                                                                }
                                                                setProdSearch("");
                                                                setIsProdOpen(false);
                                                            }}
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20"><Plus className="w-3 h-3 text-emerald-600" /></div>
                                                            <p className="text-xs font-extrabold text-emerald-600">Tambah Kustom "{prodSearch || 'Produk Baru'}"</p>
                                                        </div>
                                                        {filteredProducts.map(p => (
                                                            <div
                                                                key={p.id}
                                                                className="px-4 py-3 border-b border-border/40 hover:bg-muted cursor-pointer transition-colors"
                                                                onClick={() => {
                                                                    handleAddProduct(p.id);
                                                                    setProdSearch("");
                                                                    setIsProdOpen(false);
                                                                }}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <p className="text-sm font-bold text-foreground">{p.nama}</p>
                                                                    <p className="text-xs font-black">{formatRupiah(formData.tipe === 'tukar_tambah' ? (p.harga_tukar || p.harga_jual) : p.harga_jual)}</p>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">{p.merek} - {p.tipe}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col gap-3 relative z-30">
                                                {formItems.length === 0 ? (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50 py-8">
                                                        <ShoppingBag className="w-8 h-8 mb-2" />
                                                        <p className="text-xs font-bold">Keranjang Kosong</p>
                                                    </div>
                                                ) : (
                                                    formItems.map((item, idx) => (
                                                        <div key={idx} className="bg-muted/10 border border-border/40 rounded-xl p-3 flex flex-col gap-2 relative">
                                                            <div className="flex justify-between items-start pr-6">
                                                                <p className="text-sm font-bold leading-tight">{item.nama_produk}</p>
                                                                <button onClick={() => handleRemoveItem(idx)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                                                            </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 mt-3 bg-muted/20 p-3 rounded-lg">
                                                                    <div className="col-span-1">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Qty</Label>
                                                                        <Input type="number" value={item.qty} onChange={(e) => handleUpdateItemQty(idx, parseInt(e.target.value) || 1)} className="h-10 text-center text-sm font-black px-1 bg-background" />
                                                                    </div>
                                                                    <div className="col-span-1">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Garansi</Label>
                                                                        <Input value={item.garansi || ''} onChange={(e) => handleUpdateItemGaransi(idx, e.target.value)} className="h-10 text-sm font-bold bg-background" placeholder="Mis. 6 Bln" />
                                                                    </div>
                                                                    <div className="col-span-2 md:col-span-2">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Kondisi</Label>
                                                                        <div className="flex bg-muted rounded-md p-0.5 h-10">
                                                                            <button
                                                                                onClick={() => handleUpdateItemKondisi(idx, 'baru')}
                                                                                className={`flex-1 text-[10px] font-black rounded uppercase transition-all ${item.kondisi === 'baru' || !item.kondisi ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                                                            >
                                                                                Baru
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleUpdateItemKondisi(idx, 'bekas')}
                                                                                className={`flex-1 text-[10px] font-black rounded uppercase transition-all ${item.kondisi === 'bekas' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                                                            >
                                                                                Bekas
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-span-2 md:col-span-1 flex flex-col">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Harga Modal Satuan (Rp)</Label>
                                                                        <Input type="number" value={item.harga_modal} onChange={(e) => handleUpdateItemModal(idx, parseInt(e.target.value) || 0)} className="h-10 font-mono text-sm font-bold bg-background text-orange-600" />
                                                                    </div>
                                                                    {formData.tipe === 'tukar_tambah' && (
                                                                        <div className="col-span-2 md:col-span-1 flex flex-col">
                                                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Nilai Aki Lama (Rp)</Label>
                                                                            <Input type="number" value={item.nilai_aki_lama || 0} onChange={(e) => handleUpdateItemNilaiAkiLama(idx, parseInt(e.target.value) || 0)} className="h-10 font-mono text-sm font-bold bg-background text-emerald-600" />
                                                                        </div>
                                                                    )}
                                                                    <div className={`col-span-2 ${formData.tipe === 'tukar_tambah' ? 'md:col-span-1' : 'md:col-span-2'}`}>
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Harga Jual/Tukar (Rp)</Label>
                                                                        <Input type="number" value={(item.subtotal / (item.qty || 1))} onChange={(e) => handleUpdateItemPrice(idx, parseInt(e.target.value) || 0)} className="h-10 font-mono text-sm font-bold bg-background" />
                                                                    </div>
                                                                    <div className="col-span-2 md:col-span-1 flex flex-col justify-end items-end pb-1">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Subtotal</Label>
                                                                        <p className="text-lg font-black text-primary">{formatRupiah(item.subtotal)}</p>
                                                                    </div>
                                                                </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* PREVIEW AREA (7 Cols) */}
                                    <div id="invoice-preview" className="xl:col-span-7 flex justify-center sticky top-6 z-0 scroll-mt-20">
                                        <div
                                            ref={invoiceRef}
                                            className="w-full bg-white text-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-200 rounded-lg p-8 md:p-12 relative overflow-hidden"
                                            style={{ minHeight: '600px' }}
                                        >
                                            {/* Watermark Pattern */}
                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] select-none z-0 overflow-hidden">
                                                <div className="flex flex-wrap gap-x-8 gap-y-12 w-[200%] h-[200%] -rotate-45 justify-center items-center">
                                                    {Array.from({ length: 400 }).map((_, i) => (
                                                        <span key={i} className="text-lg font-black uppercase whitespace-nowrap text-[#0f3460]">Siswanto Aki</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-12">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="w-8 h-8 bg-[#0f3460] rounded-lg flex items-center justify-center shrink-0">
                                                                <img src="/logo-light.svg" alt="Siswanto Aki" className="w-7 h-7 object-contain" />
                                                            </div>
                                                            <h2 className="text-2xl font-black text-[#0f3460]">Siswanto Aki</h2>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">Kanggotan 21, Pleret, Bantul<br />Yogyakarta, 55791<br />0813-5400-7400 / 0882-2796-8449</p>
                                                    </div>
                                                    <div className="w-64">
                                                        <div className="bg-[#0f3460] text-white rounded-t-sm p-3">
                                                            <h3 className="text-lg font-bold">Invoice #{formData.id?.split('-').pop() || 'NEW'}</h3>
                                                        </div>
                                                        <div className="bg-gray-50 p-3 grid grid-cols-2 gap-y-2 text-xs text-gray-600 font-medium">
                                                            <span>Dibuat</span>
                                                            <span className="text-right text-gray-900">{formatDateWIB(formData.created_at || new Date())}</span>
                                                            <span>Tipe</span>
                                                            <span className="text-right text-gray-900 uppercase font-bold text-[10px]">{formData.tipe?.replace('_', ' ')}</span>
                                                            <span>Status</span>
                                                            <span className="text-right text-gray-900 uppercase">{formData.status}</span>
                                                        </div>
                                                        <div className="bg-[#0f3460] text-white p-3 rounded-b-sm flex justify-between items-center font-bold">
                                                            <span>Total</span>
                                                            <span className="text-lg">{formatRupiah(currentTotal)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Recipient */}
                                                <div className="mb-10">
                                                    <p className="text-[10px] font-bold text-[#0f3460] uppercase tracking-widest mb-1.5">Pelanggan:</p>
                                                    <h4 className="text-xl font-bold text-gray-900 mb-1">{formData.customer_nama || 'Nama Pelanggan'}</h4>
                                                    <p className="text-sm text-gray-500">{formData.customer_no_hp || '-'}</p>
                                                    <p className="text-sm text-gray-500 max-w-[250px]">{formData.customer_alamat || '-'}</p>
                                                </div>

                                                {/* Table */}
                                                <div className="mb-10 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                                        <thead className="bg-[#0f3460] text-white text-[10px] font-bold uppercase tracking-wider">
                                                            <tr>
                                                                <th className="py-2.5 px-4 rounded-tl-sm">Produk / Layanan</th>
                                                                <th className="py-2.5 px-4 text-center">Qty.</th>
                                                                <th className="py-2.5 px-4 text-right">Harga Unit</th>
                                                                <th className="py-2.5 px-4 text-right rounded-tr-sm">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="border-b border-gray-200">
                                                            {formItems.map((item, idx) => (
                                                                <tr key={idx} className="border-t border-gray-100">
                                                                    <td className="py-4 px-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-bold text-gray-900">{item.nama_produk}</p>
                                                                            <span className={`text-[8px] px-1 py-0.5 rounded font-black uppercase border ${item.kondisi === 'bekas' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                                                                {item.kondisi || 'baru'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 mt-0.5">{item.garansi ? `Garansi: ${item.garansi}` : 'Tanpa garansi'}</p>
                                                                    </td>
                                                                    <td className="py-4 px-4 text-sm text-center font-medium">{item.qty}</td>
                                                                    <td className="py-4 px-4 text-sm text-right font-medium">{formatRupiah(item.subtotal / (item.qty || 1))}</td>
                                                                    <td className="py-4 px-4 text-sm text-right font-bold text-gray-900">{formatRupiah(item.subtotal)}</td>
                                                                </tr>
                                                            ))}
                                                            {ongkir > 0 && (
                                                                <tr className="border-t border-gray-100">
                                                                    <td className="py-4 px-4">
                                                                        <p className="text-sm font-bold text-gray-900">Ongkos Kirim</p>
                                                                        <p className="text-xs text-gray-500 mt-0.5">Biaya pengiriman/pemasangan</p>
                                                                    </td>
                                                                    <td className="py-4 px-4 text-sm text-center font-medium">1</td>
                                                                    <td className="py-4 px-4 text-sm text-right font-medium">{formatRupiah(ongkir)}</td>
                                                                    <td className="py-4 px-4 text-sm text-right font-bold text-gray-900">{formatRupiah(ongkir)}</td>
                                                                </tr>
                                                            )}
                                                            {formItems.length === 0 && ongkir === 0 && (
                                                                <tr>
                                                                    <td colSpan={4} className="py-8 text-center text-xs text-gray-400">Belum ada item</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Totals */}
                                                <div className="flex justify-between items-end">
                                                    <div className="flex flex-col gap-4">
                                                        {invoiceLink && (
                                                            <div>
                                                                <QRCodeSVG value={invoiceLink} size={56} />
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-gray-400 max-w-[200px]">Terima kasih atas kepercayaannya.</p>
                                                    </div>
                                                    <div className="w-64">
                                                        <div className="flex justify-between py-2 text-sm">
                                                            <span className="text-gray-600">Subtotal</span>
                                                            <span className="font-bold text-gray-900">{formatRupiah(currentSubtotal)}</span>
                                                        </div>
                                                        {formData.diskon ? (
                                                            <div className="flex justify-between py-2 text-sm text-red-600">
                                                                <span>Diskon</span>
                                                                <span className="font-bold">-{formatRupiah(formData.diskon)}</span>
                                                            </div>
                                                        ) : null}
                                                        <div className="flex justify-between py-3 mt-1 border-t border-gray-200 text-lg font-bold text-[#0f3460]">
                                                            <span>Total</span>
                                                            <span>{formatRupiah(currentTotal)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            {/* ── HIDDEN PRINT INVOICE (fixed 800px, off-screen) ── */}
            <div
                ref={invoicePrintRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: '-9999px',
                    width: '800px',
                    visibility: 'hidden',
                    zIndex: -1,
                    pointerEvents: 'none',
                }}
            >
                <div className="bg-white text-slate-900 p-12 relative overflow-hidden" style={{ fontFamily: 'sans-serif', width: '800px' }}>
                    {/* Watermark */}
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.02, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', width: '200%', height: '200%', transform: 'rotate(-45deg)', justifyContent: 'center', alignItems: 'center' }}>
                            {Array.from({ length: 200 }).map((_, i) => (
                                <span key={i} style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap', color: '#0f3460' }}>Siswanto Aki</span>
                            ))}
                        </div>
                    </div>

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '32px', height: '32px', background: '#0f3460', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src="/logo-light.svg" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                    </div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f3460', margin: 0 }}>Siswanto Aki</h2>
                                </div>
                                <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>Kanggotan 21, Pleret, Bantul<br />Yogyakarta, 55791<br />0813-5400-7400 / 0882-2796-8449</p>
                            </div>
                            <div style={{ width: '256px' }}>
                                <div style={{ background: '#0f3460', color: 'white', padding: '12px', borderRadius: '4px 4px 0 0' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Invoice #{formData.id?.split('-').pop() || 'NEW'}</h3>
                                </div>
                                <div style={{ background: '#f9fafb', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#4b5563' }}>
                                    <span>Dibuat</span>
                                    <span style={{ textAlign: 'right', color: '#111827', fontWeight: 600 }}>{formatDateWIB(formData.created_at || new Date())}</span>
                                    <span>Tipe</span>
                                    <span style={{ textAlign: 'right', color: '#111827', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>{formData.tipe?.replace('_', ' ')}</span>
                                    <span>Status</span>
                                    <span style={{ textAlign: 'right', color: '#111827', textTransform: 'uppercase' }}>{formData.status}</span>
                                </div>
                                <div style={{ background: '#0f3460', color: 'white', padding: '12px', borderRadius: '0 0 4px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                                    <span>Total</span>
                                    <span style={{ fontSize: '18px' }}>{formatRupiah(currentTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recipient */}
                        <div style={{ marginBottom: '40px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: '#0f3460', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Pelanggan:</p>
                            <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{formData.customer_nama || 'Nama Pelanggan'}</h4>
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 2px' }}>{formData.customer_no_hp || '-'}</p>
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{formData.customer_alamat || '-'}</p>
                        </div>

                        {/* Table */}
                        <div style={{ marginBottom: '40px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#0f3460', color: 'white' }}>
                                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produk / Layanan</th>
                                        <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty.</th>
                                        <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Harga Unit</th>
                                        <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formItems.map((item, idx) => (
                                        <tr key={idx} style={{ borderTop: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: 700, color: '#111827' }}>{item.nama_produk}</span>
                                                    <span style={{ fontSize: '8px', padding: '2px 4px', borderRadius: '3px', fontWeight: 900, textTransform: 'uppercase', border: '1px solid', background: item.kondisi === 'bekas' ? '#fffbeb' : '#f0fdf4', borderColor: item.kondisi === 'bekas' ? '#fcd34d' : '#86efac', color: item.kondisi === 'bekas' ? '#92400e' : '#166534' }}>{item.kondisi || 'baru'}</span>
                                                </div>
                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.garansi ? `Garansi: ${item.garansi}` : 'Tanpa garansi'}</span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center', fontWeight: 500 }}>{item.qty}</td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500 }}>{formatRupiah(item.subtotal / (item.qty || 1))}</td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{formatRupiah(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                    {ongkir > 0 && (
                                        <tr style={{ borderTop: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ fontWeight: 700, color: '#111827' }}>Ongkos Kirim</span>
                                                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>Biaya pengiriman/pemasangan</p>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>1</td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>{formatRupiah(ongkir)}</td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{formatRupiah(ongkir)}</td>
                                        </tr>
                                    )}
                                    {formItems.length === 0 && ongkir === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '32px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>Belum ada item</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div style={{ height: '1px', background: '#e5e7eb', marginTop: 0 }} />
                        </div>

                        {/* Totals */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {invoiceLink && (
                                    <div>
                                        <QRCodeSVG value={invoiceLink} size={56} />
                                    </div>
                                )}
                                <p style={{ fontSize: '12px', color: '#9ca3af', maxWidth: '200px', margin: 0 }}>Terima kasih atas kepercayaannya.</p>
                            </div>
                            <div style={{ width: '256px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                                    <span style={{ color: '#4b5563' }}>Subtotal</span>
                                    <span style={{ fontWeight: 700, color: '#111827' }}>{formatRupiah(currentSubtotal)}</span>
                                </div>
                                {formData.diskon ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#dc2626' }}>
                                        <span>Diskon</span>
                                        <span style={{ fontWeight: 700 }}>-{formatRupiah(formData.diskon)}</span>
                                    </div>
                                ) : null}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e5e7eb', marginTop: '4px', fontSize: '18px', fontWeight: 700, color: '#0f3460' }}>
                                    <span>Total</span>
                                    <span>{formatRupiah(currentTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DELETE DIALOG */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Transaksi</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Perhatian!</AlertTitle>
                            <AlertDescription>
                                Yakin ingin menghapus transaksi "{txToDelete?.id}"? Tindakan ini permanen.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Batal</Button>
                        <Button onClick={handleDeleteConfirm} disabled={isDeleting} variant="destructive">
                            {isDeleting ? "Menghapus..." : "Hapus Data"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
