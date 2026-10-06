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
            <div className="h-full">
                <div className="grid grid-cols-12 gap-0 h-full">

                    {/* ── LEFT SIDEBAR: LIST ── */}
                    <div className={`${isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-4 xl:col-span-3 flex-col h-full min-h-0 border-r border-neutral-200/70 dark:border-border/40 bg-neutral-50/50 dark:bg-card/30`}>

                        <div className="flex-none p-4 border-b border-neutral-200/70 dark:border-border/40 bg-white dark:bg-card space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold tracking-tight text-foreground">Customers</h2>
                                    <p className="text-[11px] text-muted-foreground">{customers.length} contacts listed</p>
                                </div>
                                <Button size="sm" onClick={handleCreateNew} className="h-8 px-3 rounded-lg gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs shrink-0 cursor-pointer">
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>New</span>
                                </Button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search customer..."
                                    className="pl-9 pr-9 h-9 rounded-lg border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground w-6 h-6 flex items-center justify-center rounded-md"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-2.5 flex flex-col gap-1.5">
                                {isLoading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                                    </div>
                                ) : filteredCustomers.map((customer, i) => (
                                    <motion.div
                                        key={customer.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02, duration: 0.2 }}
                                        className={`group relative cursor-pointer transition-all rounded-lg p-2.5 border ${formData.id === customer.id ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/20 shadow-2xs' : 'bg-white dark:bg-card border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'}`}
                                        onClick={() => handleSelectCustomer(customer)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                <p className={`text-xs font-semibold leading-tight truncate ${formData.id === customer.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                    {customer.nama}
                                                </p>

                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {customer.no_hp && (
                                                        <span className="flex items-center text-[10px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200/60 dark:border-neutral-700/60">
                                                            <Phone className="w-2.5 h-2.5 mr-1 text-neutral-400" />
                                                            {maskPhoneNumber(customer.no_hp)}
                                                        </span>
                                                    )}
                                                    {customer.kota && (
                                                        <span className="flex items-center text-[10px] text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200/60 dark:border-neutral-700/60">
                                                            <MapPin className="w-2.5 h-2.5 mr-1 text-neutral-400" />
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
                                                        className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-neutral-100"
                                                    >
                                                        <MoreVertical className="h-3.5 w-3.5 text-neutral-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36 rounded-xl border-border/60 shadow-xl">
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs font-medium rounded-lg"
                                                        onClick={(e) => handleDeleteClick(customer, e)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                        <span>Delete</span>
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
                                            <p className="text-sm font-bold">No customers found</p>
                                            <p className="text-xs text-muted-foreground mt-1">Try another search term.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* ── RIGHT SIDE: EDITOR ── */}
                    <div className={`${!isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-8 xl:col-span-9 h-full flex-col bg-white dark:bg-background`}>

                        {/* EDITOR HEADER */}
                        <div className="flex-none p-4 lg:px-6 border-b border-neutral-200/70 dark:border-border/40 bg-white dark:bg-card z-10 relative">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-8 w-8 rounded-lg bg-neutral-100" onClick={() => setIsMobileListOpen(true)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="min-w-0">
                                        <h1 className="text-base sm:text-lg font-bold line-clamp-1 text-foreground">
                                            {formData.nama || (formData.id ? 'Edit Customer' : 'New Customer')}
                                        </h1>
                                        <p className="text-muted-foreground text-xs truncate">
                                            {formData.id ? `ID: ${formData.id.split('-')[0]}...` : 'Unsaved draft'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving || !formData.nama.trim()}
                                        className="gap-2 h-9 rounded-lg font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex-1 md:flex-none px-5 shadow-xs transition-all cursor-pointer"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-3.5 h-3.5" />
                                                Save Customer
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* EDITOR BODY */}
                        <ScrollArea className="flex-1 bg-neutral-50/40 dark:bg-background">
                            <div className="p-4 md:p-6 lg:p-8 w-full">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                                    {/* MAIN FORM */}
                                    <div className="xl:col-span-2">
                                        <Card className="h-full rounded-2xl border border-neutral-200/80 dark:border-border/60 bg-white dark:bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                                            <CardHeader className="pb-3 border-b border-neutral-200/60 dark:border-border/40 bg-white dark:bg-card px-5">
                                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                                                    <span className="w-1.5 h-4 rounded-full bg-indigo-600" />
                                                    Basic Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex-1 space-y-4 pt-5 px-5 pb-6">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-neutral-600">
                                                        Full Name <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={formData.nama}
                                                        onChange={(e) => setFormData(p => ({ ...p, nama: e.target.value }))}
                                                        placeholder="E.g. Budi Santoso"
                                                        className="text-sm font-semibold h-10 rounded-lg border-neutral-200 bg-neutral-50 dark:bg-neutral-900 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-neutral-600">
                                                            Phone Number (WhatsApp)
                                                        </Label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                            <Input
                                                                value={formData.no_hp || ''}
                                                                onChange={(e) => setFormData(p => ({ ...p, no_hp: e.target.value }))}
                                                                placeholder="081234567890"
                                                                className="pl-9 h-10 rounded-lg border-neutral-200 font-mono text-xs bg-neutral-50 dark:bg-neutral-900"
                                                                type="tel"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-neutral-600">
                                                            City / Area
                                                        </Label>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                            <Input
                                                                value={formData.kota || ''}
                                                                onChange={(e) => setFormData(p => ({ ...p, kota: e.target.value }))}
                                                                placeholder="E.g. Sleman"
                                                                className="pl-9 h-10 rounded-lg border-neutral-200 text-xs bg-neutral-50 dark:bg-neutral-900"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-neutral-600">
                                                        Full Address
                                                    </Label>
                                                    <Textarea
                                                        value={formData.alamat || ''}
                                                        onChange={(e) => setFormData(p => ({ ...p, alamat: e.target.value }))}
                                                        placeholder="Street, District, Postal Code..."
                                                        className="h-24 resize-none rounded-lg border-neutral-200 text-xs p-3 bg-neutral-50 dark:bg-neutral-900"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* ANALYTICS / METADATA SIDEBAR */}
                                    <div className="h-full">
                                        {formData.id ? (
                                            <Card className="h-full rounded-2xl border border-neutral-200/80 dark:border-border/60 bg-white dark:bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
                                                <CardHeader className="pb-3 border-b border-neutral-200/60 dark:border-border/40 px-5">
                                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                                                        <span className="w-1.5 h-4 rounded-full bg-indigo-600" />
                                                        History &amp; Statistics
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1 space-y-4 pt-5 px-5 pb-6">
                                                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Orders</span>
                                                        <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1">{formData.total_pembelian || 0}</p>
                                                    </div>
                                                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Purchase Value</span>
                                                        <p className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">{formatRupiah(formData.total_nilai_pembelian || 0)}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                                                            <span className="text-[10px] text-neutral-500 font-medium block">First Order</span>
                                                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                                                                {formData.pertama_beli ? new Date(formData.pertama_beli).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                            </span>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                                                            <span className="text-[10px] text-neutral-500 font-medium block">Last Order</span>
                                                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                                                                {formData.terakhir_beli ? new Date(formData.terakhir_beli).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <Card className="h-full rounded-2xl border border-neutral-200/80 dark:border-border/60 bg-white dark:bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                                <UserCircle className="w-10 h-10 text-neutral-300 mb-2" />
                                                <p className="text-xs">Customer purchase statistics will show after orders are placed.</p>
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
                <DialogContent className="sm:max-w-[425px] p-0 rounded-2xl overflow-hidden border border-neutral-200/80 shadow-2xl bg-white dark:bg-card">
                    <DialogHeader className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                        <DialogTitle className="text-lg font-bold">Delete Customer</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-xl">
                            <TriangleAlert className="h-5 w-5" />
                            <AlertTitle className="font-bold">Warning</AlertTitle>
                            <AlertDescription className="text-sm font-medium mt-1 text-destructive/90">
                                Are you sure you want to delete <strong className="font-semibold text-destructive">&quot;{customerToDelete?.nama}&quot;</strong>? This action cannot be undone.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                            className="h-9 rounded-lg font-medium border-neutral-200 px-4"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            variant="destructive"
                            className="gap-2 h-9 rounded-lg font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Customer
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
