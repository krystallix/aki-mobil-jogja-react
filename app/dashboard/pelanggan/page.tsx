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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [formData, setFormData] = useState<Customer>(DEFAULT_CUSTOMER);
    const [isSaving, setIsSaving] = useState(false);
    
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
        setEditDialogOpen(true);
    };

    const handleCreateNew = () => {
        setFormData(DEFAULT_CUSTOMER);
        setEditDialogOpen(true);
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
            setEditDialogOpen(false);
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

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-3 lg:gap-4 p-4 lg:p-6 max-w-[1400px] mx-auto w-full min-h-[calc(100vh-4rem)]">
                
                {/* ── HEADER & TOOLBAR ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-4 bg-background/80 backdrop-blur-xl p-4 lg:p-5 rounded-2xl lg:rounded-3xl border border-border/60 shadow-sm sticky top-4 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <UserCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-3xl font-extrabold tracking-tight text-foreground">Manajemen Pelanggan</h1>
                            <p className="text-xs lg:text-sm font-medium text-muted-foreground">{customers.length} Pelanggan Terdaftar</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 group">
                            <Search className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                            <Input
                                placeholder="Cari pelanggan..."
                                className="pl-11 pr-11 h-11 lg:h-12 rounded-full border-border/60 bg-card shadow-none text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/50 transition-all hover:border-primary/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <Button 
                            onClick={handleCreateNew} 
                            className="h-11 lg:h-12 pl-5 pr-4 rounded-full gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 shrink-0"
                        >
                            <span className="hidden sm:inline">Tambah Data</span>
                            <span className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <Plus className="w-4 h-4" />
                            </span>
                        </Button>
                    </div>
                </div>

                {/* ── GRID CONTENT ── */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] gap-4">
                        <Loader2 className="w-8 h-8 lg:w-10 lg:h-10 animate-spin text-primary" />
                        <p className="text-sm font-bold text-muted-foreground">Memuat data pelanggan...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] gap-4 bg-card rounded-2xl lg:rounded-3xl border border-dashed border-border/60 p-8">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
                            <UserCircle className="w-8 h-8 lg:w-10 lg:h-10 text-muted-foreground/40" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg lg:text-xl font-bold">Tidak ada data pelanggan</p>
                            <p className="text-sm font-medium text-muted-foreground mt-1 max-w-sm mx-auto">Coba gunakan kata kunci pencarian lain atau tambahkan data pelanggan baru.</p>
                        </div>
                        <Button onClick={handleCreateNew} variant="outline" className="mt-2 h-11 lg:h-12 rounded-full font-bold px-6">
                            <Plus className="w-4 h-4 mr-2" /> Tambah Pelanggan
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-3 pb-8">
                        <AnimatePresence>
                            {filteredCustomers.map((customer, i) => (
                                <motion.div
                                    key={customer.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    transition={{ delay: i * 0.03, duration: 0.3 }}
                                >
                                    <Card 
                                        className="h-full rounded-xl lg:rounded-2xl border border-border/60 bg-card hover:border-border hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col"
                                        onClick={() => handleSelectCustomer(customer)}
                                    >
                                        <CardHeader className="p-4 lg:p-5 pb-0 flex flex-row items-start justify-between">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <h3 className="text-base lg:text-lg font-extrabold truncate text-foreground/90 group-hover:text-primary transition-colors">
                                                    {customer.nama}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    {customer.no_hp && (
                                                        <span className="flex items-center text-[11px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                                                            <Phone className="w-3 h-3 mr-1" />
                                                            {customer.no_hp}
                                                        </span>
                                                    )}
                                                    {customer.kota && (
                                                        <span className="flex items-center text-[11px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                                                            <MapPin className="w-3 h-3 mr-1" />
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
                                                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-muted/30 border border-border/50 hover:bg-background hover:shadow-sm"
                                                    >
                                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl border-border/60 shadow-xl">
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-[13px] font-bold rounded-lg"
                                                        onClick={(e) => handleDeleteClick(customer, e)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        <span>Hapus</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardHeader>
                                        
                                        <CardContent className="p-4 lg:p-5 pt-3 lg:pt-4 flex-1">
                                            <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/40">
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Order</p>
                                                    <p className="text-xl font-black">{customer.total_pembelian}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Nilai</p>
                                                    <p className="text-sm font-black truncate" title={formatRupiah(customer.total_nilai_pembelian)}>
                                                        {formatRupiah(customer.total_nilai_pembelian).replace(',00', '')}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                        
                                        <CardFooter className="p-4 lg:p-5 pt-0 mt-auto">
                                            <div className="w-full flex items-center justify-between text-[11px] font-medium text-muted-foreground border-t border-border/40 pt-3">
                                                <span className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {customer.terakhir_beli ? new Date(customer.terakhir_beli).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'Belum order'}
                                                </span>
                                                <span className="font-bold text-primary/70 group-hover:text-primary transition-colors">
                                                    Lihat Detail &rarr;
                                                </span>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* ── DIALOG EDITOR ── */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-2xl lg:rounded-3xl border border-border/60 shadow-2xl bg-background/95 backdrop-blur-2xl">
                    <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/20">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <UserCircle className="w-6 h-6 text-primary" />
                            {formData.id ? 'Detail & Edit Pelanggan' : 'Tambah Pelanggan Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Form Input Section */}
                            <div className="space-y-5">
                                <div>
                                    <h4 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        Informasi Dasar
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-foreground">
                                                Nama Lengkap <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                value={formData.nama}
                                                onChange={(e) => setFormData(p => ({ ...p, nama: e.target.value }))}
                                                placeholder="Contoh: Budi Santoso"
                                                className="text-sm font-bold h-11 rounded-xl border-border/60 bg-background/50 focus-visible:ring-1 focus-visible:ring-primary/50"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-foreground">
                                                Nomor HP (WhatsApp)
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    value={formData.no_hp || ''}
                                                    onChange={(e) => setFormData(p => ({ ...p, no_hp: e.target.value }))}
                                                    placeholder="0812..."
                                                    className="pl-9 h-11 rounded-xl border-border/60 font-medium"
                                                    type="tel"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-foreground">
                                                Kota / Area
                                            </Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    value={formData.kota || ''}
                                                    onChange={(e) => setFormData(p => ({ ...p, kota: e.target.value }))}
                                                    placeholder="Contoh: Sleman"
                                                    className="pl-9 h-11 rounded-xl border-border/60 font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-foreground">
                                                Alamat Lengkap
                                            </Label>
                                            <Textarea
                                                value={formData.alamat || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, alamat: e.target.value }))}
                                                placeholder="Jalan, RT/RW..."
                                                className="h-24 resize-none rounded-xl border-border/60 font-medium p-3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Section */}
                            <div className="bg-muted/10 rounded-xl lg:rounded-2xl p-5 border border-border/40">
                                <h4 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Statistik Transaksi
                                </h4>
                                
                                {formData.id ? (
                                    <div className="space-y-5">
                                        <div className="bg-background rounded-xl p-4 border border-border/40 shadow-sm">
                                            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1.5">
                                                <ShoppingBag className="w-3.5 h-3.5" /> Total Pembelian
                                            </p>
                                            <p className="text-2xl font-black text-foreground">
                                                {formData.total_pembelian} <span className="text-sm font-medium text-muted-foreground">kali</span>
                                            </p>
                                        </div>
                                        
                                        <div className="bg-background rounded-xl p-4 border border-border/40 shadow-sm">
                                            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5" /> Total Nilai
                                            </p>
                                            <p className="text-xl font-extrabold text-primary tracking-tight">
                                                {formatRupiah(formData.total_nilai_pembelian)}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="bg-background rounded-lg p-3 border border-border/40">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pertama</p>
                                                <p className="text-xs font-bold">
                                                    {formData.pertama_beli ? new Date(formData.pertama_beli).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                </p>
                                            </div>
                                            <div className="bg-background rounded-lg p-3 border border-border/40">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Terakhir</p>
                                                <p className="text-xs font-bold">
                                                    {formData.terakhir_beli ? new Date(formData.terakhir_beli).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-12 h-12 rounded-full bg-muted border border-border/40 flex items-center justify-center mb-3">
                                            <TrendingUp className="w-5 h-5 text-muted-foreground/40" />
                                        </div>
                                        <p className="text-sm font-bold text-foreground/80">Belum Ada Transaksi</p>
                                        <p className="text-xs font-medium text-muted-foreground mt-1">
                                            Data statistik akan muncul setelah pelanggan baru ini melakukan pembelian pertama.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            className="h-11 rounded-full font-bold border-border/60 px-6"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !formData.nama.trim()}
                            className="gap-2 h-11 rounded-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-6"
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
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── DELETE DIALOG ── */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl lg:rounded-3xl overflow-hidden border border-border/60 shadow-2xl bg-background/95 backdrop-blur-2xl">
                    <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/20">
                        <DialogTitle className="text-xl font-extrabold tracking-tight">Hapus Pelanggan</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-xl">
                            <TriangleAlert className="h-4 w-4" />
                            <AlertTitle className="font-bold">Perhatian!</AlertTitle>
                            <AlertDescription className="text-sm font-medium mt-1 text-destructive/90">
                                Apakah Anda yakin ingin menghapus data pelanggan <strong className="font-semibold text-destructive">&quot;{customerToDelete?.nama}&quot;</strong>?
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
