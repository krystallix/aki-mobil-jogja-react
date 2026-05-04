"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { 
    Search, 
    Plus, 
    MoreVertical, 
    Trash2, 
    Save, 
    Loader2, 
    ChevronLeft,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    TrendingUp,
    Building2,
    X,
    TriangleAlert,
    UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// Define the Customer type based on SQL schema
type Customer = {
    id: string;
    nama: string;
    no_hp: string | null;
    alamat: string | null;
    kota: string | null;
    total_pembelian: number;
    total_nilai_pembelian: number;
    pertama_beli: string | null;
    terakhir_beli: string | null;
    created_at?: string;
    updated_at?: string;
};

const DEFAULT_CUSTOMER: Customer = {
    id: "",
    nama: "",
    no_hp: "",
    alamat: "",
    kota: "",
    total_pembelian: 0,
    total_nilai_pembelian: 0,
    pertama_beli: null,
    terakhir_beli: null,
};

export default function PelangganPage() {
    const supabase = createClient();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Editor State
    const [formData, setFormData] = useState<Customer>(DEFAULT_CUSTOMER);
    const [isSaving, setIsSaving] = useState(false);
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);
    
    // Delete Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (error) {
            console.error("Error fetching customers:", error);
            setCustomers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectCustomer = (customer: Customer) => {
        setFormData(customer);
        setIsMobileListOpen(false);
    };

    const handleCreateNew = () => {
        setFormData(DEFAULT_CUSTOMER);
        setIsMobileListOpen(false);
    };

    const handleSave = async () => {
        if (!formData.nama.trim()) {
            toast.error("Nama pelanggan wajib diisi!");
            return;
        }

        try {
            setIsSaving(true);
            const isNew = !formData.id;
            
            const payload = {
                nama: formData.nama,
                no_hp: formData.no_hp || null,
                alamat: formData.alamat || null,
                kota: formData.kota || null,
                updated_at: new Date().toISOString()
            };

            if (isNew) {
                const { data, error } = await supabase
                    .from('customers')
                    .insert([payload])
                    .select()
                    .single();

                if (error) throw error;
                setCustomers([data, ...customers]);
                setFormData(data);
                toast.success('Pelanggan berhasil ditambahkan');
            } else {
                const { data, error } = await supabase
                    .from('customers')
                    .update(payload)
                    .eq('id', formData.id)
                    .select()
                    .single();

                if (error) throw error;
                setCustomers(customers.map(c => c.id === formData.id ? data : c));
                toast.success('Data pelanggan diperbarui');
            }
        } catch (error: any) {
            console.error("Error saving customer:", error);
            toast.error(error.message || 'Gagal menyimpan data pelanggan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (customer: Customer, e: React.MouseEvent) => {
        e.stopPropagation();
        setCustomerToDelete(customer);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return;
        
        try {
            setIsDeleting(true);
            const { error } = await supabase
                .from('customers')
                .delete()
                .eq('id', customerToDelete.id);

            if (error) throw error;
            
            setCustomers(customers.filter(c => c.id !== customerToDelete.id));
            if (formData.id === customerToDelete.id) {
                setFormData(DEFAULT_CUSTOMER);
                setIsMobileListOpen(true);
            }
            toast.success('Pelanggan berhasil dihapus');
        } catch (error: any) {
            console.error("Error deleting customer:", error);
            toast.error(error.message || 'Gagal menghapus pelanggan');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.no_hp && c.no_hp.includes(searchQuery)) ||
        (c.kota && c.kota.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const maskPhoneNumber = (phone: string | null) => {
        if (!phone) return "";
        if (phone.length <= 8) return phone;
        const first4 = phone.substring(0, 4);
        const last4 = phone.substring(phone.length - 4);
        return `${first4}xxx${last4}`;
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-4rem)]">
                <div className="grid grid-cols-12 gap-0 h-full">

                    {/* ── LEFT SIDEBAR: LIST ── */}
                    <div className={`${isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-4 xl:col-span-3 flex-col h-full border-r border-border/40 bg-background/50`}>
                        
                        <div className="flex-none p-4 md:p-5 border-b border-border/40 bg-background/80 backdrop-blur-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-foreground">Pelanggan</h2>
                                <Button size="sm" onClick={handleCreateNew} className="h-9 lg:h-10 pl-3 pr-2 rounded-full gap-1.5 bg-primary text-primary-foreground font-bold text-xs lg:text-sm hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 shrink-0">
                                    <span>Tambah</span>
                                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <Plus className="w-3 h-3" />
                                    </span>
                                </Button>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <Input
                                    placeholder="Cari pelanggan..."
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
                                ) : filteredCustomers.map((customer, i) => (
                                    <motion.div
                                        key={customer.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02, duration: 0.2 }}
                                        className={`group relative cursor-pointer transition-all duration-300 rounded-xl lg:rounded-2xl p-3.5 border ${formData.id === customer.id ? 'bg-primary/10 border-primary/40 shadow-sm' : 'bg-card border-border/60 hover:border-border hover:shadow-sm'}`}
                                        onClick={() => handleSelectCustomer(customer)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                <p className={`text-[15px] font-bold leading-tight truncate ${formData.id === customer.id ? 'text-primary' : 'text-foreground'}`}>
                                                    {customer.nama}
                                                </p>
                                                
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {customer.no_hp && (
                                                        <span className="flex items-center text-[10px] lg:text-[11px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md border border-border/40">
                                                            <Phone className="w-2.5 h-2.5 mr-1" />
                                                            {maskPhoneNumber(customer.no_hp)}
                                                        </span>
                                                    )}
                                                    {customer.kota && (
                                                        <span className="flex items-center text-[10px] lg:text-[11px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md border border-border/40">
                                                            <MapPin className="w-2.5 h-2.5 mr-1" />
                                                            {customer.kota}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-muted/30 border border-border/50 hover:bg-background hover:shadow-sm"
                                                    >
                                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36 rounded-xl border-border/60 shadow-xl">
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-[13px] font-bold rounded-lg"
                                                        onClick={(e) => handleDeleteClick(customer, e)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                        <span>Hapus</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </motion.div>
                                ))}
                                {filteredCustomers.length === 0 && !isLoading && (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                                            <Search className="w-5 h-5 text-muted-foreground/40" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Tidak ada data</p>
                                            <p className="text-xs text-muted-foreground mt-1">Coba kata kunci lain.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* ── RIGHT SIDE: EDITOR ── */}
                    <div className={`${!isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-8 xl:col-span-9 h-full flex-col bg-background/50`}>
                        
                        {/* EDITOR HEADER */}
                        <div className="flex-none p-4 md:p-6 border-b border-border/40 bg-background/80 backdrop-blur-xl z-10 relative">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-10 w-10 rounded-full bg-muted/50 border border-border/50" onClick={() => setIsMobileListOpen(true)}>
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <div className="min-w-0">
                                        <h1 className="text-xl md:text-2xl font-extrabold line-clamp-1 text-foreground">
                                            {formData.nama || (formData.id ? 'Edit Pelanggan' : 'Pelanggan Baru')}
                                        </h1>
                                        <p className="text-muted-foreground text-xs md:text-sm truncate font-medium">
                                            {formData.id ? `ID: ${formData.id.split('-')[0]}...` : 'Belum disimpan ke database'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving || !formData.nama.trim()}
                                        className="gap-2 h-11 lg:h-12 rounded-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex-1 md:flex-none px-6 lg:px-8 shadow-sm transition-all"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Simpan Data
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* EDITOR BODY */}
                        <ScrollArea className="flex-1">
                            <div className="p-4 md:p-6 lg:p-8 w-full">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                                    
                                    {/* MAIN FORM */}
                                    <div className="xl:col-span-2">
                                        <Card className="h-full rounded-xl lg:rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col">
                                            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20 px-5 lg:px-6">
                                                <CardTitle className="text-[11px] lg:text-xs font-extrabold uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                                    Informasi Dasar
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex-1 space-y-5 pt-5 lg:pt-6 px-5 lg:px-6 pb-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                        Nama Lengkap <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        value={formData.nama}
                                                        onChange={(e) => setFormData(p => ({ ...p, nama: e.target.value }))}
                                                        placeholder="Contoh: Budi Santoso"
                                                        className="text-base font-bold h-12 lg:h-14 rounded-xl border-border/60 bg-background focus-visible:ring-1 focus-visible:ring-primary/50"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                            Nomor HP (WhatsApp)
                                                        </Label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                value={formData.no_hp || ''}
                                                                onChange={(e) => setFormData(p => ({ ...p, no_hp: e.target.value }))}
                                                                placeholder="081234567890"
                                                                className="pl-11 h-11 lg:h-12 rounded-xl border-border/60 font-medium bg-background"
                                                                type="tel"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                            Kota / Area
                                                        </Label>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                value={formData.kota || ''}
                                                                onChange={(e) => setFormData(p => ({ ...p, kota: e.target.value }))}
                                                                placeholder="Contoh: Sleman"
                                                                className="pl-11 h-11 lg:h-12 rounded-xl border-border/60 font-medium bg-background"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                        Alamat Lengkap
                                                    </Label>
                                                    <Textarea
                                                        value={formData.alamat || ''}
                                                        onChange={(e) => setFormData(p => ({ ...p, alamat: e.target.value }))}
                                                        placeholder="Jalan, RT/RW, Kelurahan..."
                                                        className="h-28 resize-none rounded-xl border-border/60 font-medium p-4 bg-background"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* ANALYTICS / METADATA SIDEBAR */}
                                    <div className="h-full">
                                        {formData.id ? (
                                            <Card className="h-full rounded-xl lg:rounded-2xl border border-border/60 bg-muted/10 shadow-sm flex flex-col">
                                                <CardHeader className="pb-4 border-b border-border/40 bg-muted/20 px-5 lg:px-6">
                                                    <CardTitle className="text-[11px] lg:text-xs font-extrabold uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                        Riwayat Transaksi
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1 flex flex-col justify-between pt-5 lg:pt-6 px-5 lg:px-6 pb-6 space-y-4 lg:space-y-5">
                                                    <div className="bg-background rounded-xl p-4 lg:p-5 border border-border/40 shadow-sm">
                                                        <p className="text-[10px] lg:text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                            <ShoppingBag className="w-3.5 h-3.5" /> Total Pembelian
                                                        </p>
                                                        <p className="text-3xl font-black text-foreground">
                                                            {formData.total_pembelian} <span className="text-sm font-medium text-muted-foreground">kali</span>
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="bg-background rounded-xl p-4 lg:p-5 border border-border/40 shadow-sm">
                                                        <p className="text-[10px] lg:text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                            <TrendingUp className="w-3.5 h-3.5" /> Nilai Transaksi
                                                        </p>
                                                        <p className="text-2xl font-extrabold text-primary tracking-tight">
                                                            {formatRupiah(formData.total_nilai_pembelian)}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                                        <div className="bg-background rounded-xl p-3.5 border border-border/40">
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> Pertama
                                                            </p>
                                                            <p className="text-xs lg:text-sm font-bold">
                                                                {formData.pertama_beli ? new Date(formData.pertama_beli).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                            </p>
                                                        </div>
                                                        <div className="bg-background rounded-xl p-3.5 border border-border/40">
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> Terakhir
                                                            </p>
                                                            <p className="text-xs lg:text-sm font-bold">
                                                                {formData.terakhir_beli ? new Date(formData.terakhir_beli).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <Card className="h-full min-h-[16rem] rounded-xl lg:rounded-2xl border border-border/60 bg-card shadow-sm border-dashed flex flex-col items-center justify-center p-8 text-center">
                                                <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-4">
                                                    <UserCircle className="w-6 h-6 text-muted-foreground/50" />
                                                </div>
                                                <p className="text-base font-bold text-foreground">Pelanggan Baru</p>
                                                <p className="text-xs font-medium text-muted-foreground mt-1.5 max-w-[200px]">
                                                    Statistik transaksi akan muncul setelah pesanan pertama dibuat.
                                                </p>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            {/* DELETE DIALOG */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl lg:rounded-3xl overflow-hidden border border-border/60 shadow-2xl bg-background/95 backdrop-blur-2xl">
                    <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/20">
                        <DialogTitle className="text-xl font-extrabold tracking-tight">Hapus Pelanggan</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-5">
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-xl">
                            <TriangleAlert className="h-5 w-5" />
                            <AlertTitle className="font-bold">Perhatian!</AlertTitle>
                            <AlertDescription className="text-sm font-medium mt-1 text-destructive/90">
                                Yakin ingin menghapus data pelanggan <strong className="font-semibold text-destructive">&quot;{customerToDelete?.nama}&quot;</strong>? Tindakan ini permanen.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                            className="h-11 rounded-full font-bold border-border/60 px-6"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            variant="destructive"
                            className="gap-2 h-11 rounded-full font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Hapus Data
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
