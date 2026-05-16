"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { createClient } from "@/lib/supabase/client";
import { AkiLamaData } from "@/lib/supabase/types";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Loader2, Search, CheckCircle2, BatteryCharging, Repeat2, Trash2, Plus, Clock, Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string | undefined) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

export default function AkiLamaPage() {
    const supabase = createClient();
    const [akiLamaList, setAkiLamaList] = useState<AkiLamaData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<'semua' | 'belum_dijual' | 'terjual'>('semua');

    // Dialog state for manual addition
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [keterangan, setKeterangan] = useState("");
    const [nilai, setNilai] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Dialog state for delete
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchAkiLama();
    }, []);

    const fetchAkiLama = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('aki_lama')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAkiLamaList(data || []);
        } catch (error) {
            console.error("Error fetching aki lama:", error);
            toast.error("Gagal memuat data aki lama");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (item: AkiLamaData) => {
        const newStatus = item.status === 'belum_dijual' ? 'terjual' : 'belum_dijual';
        try {
            const { error } = await supabase
                .from('aki_lama')
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', item.id);

            if (error) throw error;
            
            setAkiLamaList(akiLamaList.map(a => a.id === item.id ? { ...a, status: newStatus } : a));
            toast.success(`Status diubah menjadi ${newStatus === 'terjual' ? 'Terjual' : 'Belum Dijual'}`);
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengubah status");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase.from('aki_lama').delete().eq('id', deleteId);
            if (error) throw error;
            
            setAkiLamaList(akiLamaList.filter(a => a.id !== deleteId));
            toast.success("Data berhasil dihapus");
            setIsDeleteOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus data");
        }
    };

    const handleAddManual = async () => {
        if (!keterangan.trim() || !nilai) {
            toast.error("Keterangan dan nilai wajib diisi");
            return;
        }

        try {
            setIsSaving(true);
            const { data, error } = await supabase.from('aki_lama').insert([{
                keterangan,
                nilai: parseInt(nilai.replace(/\D/g, '') || "0", 10),
                status: 'belum_dijual'
            }]).select();

            if (error) throw error;

            if (data && data.length > 0) {
                setAkiLamaList([data[0], ...akiLamaList]);
            }
            toast.success("Aki lama berhasil ditambahkan");
            setIsAddOpen(false);
            setKeterangan("");
            setNilai("");
        } catch (error) {
            console.error(error);
            toast.error("Gagal menambahkan data");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredList = akiLamaList.filter(item => {
        const matchSearch = item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.transaction_id && item.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchStatus = filterStatus === 'semua' || item.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalUnsold = akiLamaList.filter(a => a.status === 'belum_dijual').reduce((sum, a) => sum + a.nilai, 0);
    const countUnsold = akiLamaList.filter(a => a.status === 'belum_dijual').length;

    return (
        <DashboardLayout>
            <ScrollArea className="h-[calc(100vh-var(--header-height))]">
                <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Stok Aki Lama</h1>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">Kelola aki lama hasil tukar tambah atau input manual.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => setIsAddOpen(true)} className="rounded-full font-bold px-5 bg-primary shadow-sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Manual
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border border-border/60 shadow-sm rounded-2xl bg-gradient-to-br from-amber-500/10 to-background overflow-hidden">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                                    <BatteryCharging className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Nilai (Belum Terjual)</p>
                                    <p className="text-2xl font-black text-foreground">{formatRupiah(totalUnsold)}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border/60 shadow-sm rounded-2xl bg-gradient-to-br from-blue-500/10 to-background overflow-hidden">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Repeat2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Unit (Belum Terjual)</p>
                                    <p className="text-2xl font-black text-foreground">{countUnsold} Unit</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters & List */}
                    <Card className="border border-border/60 shadow-sm rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-border/40 bg-muted/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari keterangan / ID Transaksi..." 
                                    className="pl-9 h-10 rounded-full border-border/60 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-muted/50 p-1 rounded-full w-full sm:w-auto">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={`rounded-full px-4 text-xs font-bold ${filterStatus === 'semua' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setFilterStatus('semua')}
                                >Semua</Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={`rounded-full px-4 text-xs font-bold ${filterStatus === 'belum_dijual' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setFilterStatus('belum_dijual')}
                                >Belum Terjual</Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={`rounded-full px-4 text-xs font-bold ${filterStatus === 'terjual' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setFilterStatus('terjual')}
                                >Terjual</Button>
                            </div>
                        </div>

                        <div className="p-0">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                                </div>
                            ) : filteredList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <BatteryCharging className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-lg font-bold text-foreground">Tidak ada data</p>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">Belum ada stok aki lama yang tersimpan atau sesuai dengan filter pencarian.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {filteredList.map((item) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 hover:bg-muted/10 transition-colors gap-4">
                                            <div className="flex-1 min-w-0 flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.status === 'belum_dijual' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {item.status === 'belum_dijual' ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-bold text-sm sm:text-base leading-tight line-clamp-2">{item.keterangan}</p>
                                                        {item.status === 'terjual' && (
                                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-600 border-emerald-200 uppercase whitespace-nowrap">Terjual</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
                                                        <span>{formatDate(item.created_at)}</span>
                                                        {item.transaction_id && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                                <span className="font-mono text-[11px] uppercase bg-muted px-1.5 rounded-md">{item.transaction_id.split('-').pop()}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-12 sm:pl-0">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Nilai</p>
                                                    <p className={`font-black ${item.status === 'belum_dijual' ? 'text-amber-600' : 'text-muted-foreground line-through decoration-muted-foreground/30'}`}>
                                                        {formatRupiah(item.nilai)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button 
                                                        variant={item.status === 'belum_dijual' ? "outline" : "secondary"}
                                                        className={`h-9 font-bold text-xs ${item.status === 'belum_dijual' ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' : ''}`}
                                                        onClick={() => handleToggleStatus(item)}
                                                    >
                                                        {item.status === 'belum_dijual' ? 'Tandai Terjual' : 'Batal Jual'}
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => {
                                                            setDeleteId(item.id);
                                                            setIsDeleteOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </ScrollArea>

            {/* Modal Tambah Manual */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold tracking-tight">Tambah Aki Lama</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Keterangan / Nama Aki</Label>
                            <Input 
                                placeholder="Contoh: Aki Bekas Innova 2018" 
                                className="h-11 rounded-xl font-bold bg-muted/30"
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Nilai (Rp)</Label>
                            <Input 
                                type="text"
                                placeholder="50.000" 
                                className="h-11 rounded-xl font-bold bg-muted/30"
                                value={nilai}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setNilai(val ? parseInt(val).toLocaleString('id-ID') : "");
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full font-bold" onClick={() => setIsAddOpen(false)}>Batal</Button>
                        <Button onClick={handleAddManual} disabled={isSaving} className="rounded-full font-bold px-6">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Konfirmasi Hapus */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-destructive">Hapus Data?</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-muted-foreground font-medium">Data aki lama ini akan dihapus secara permanen. Anda yakin?</p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" className="rounded-full font-bold" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
                        <Button variant="destructive" className="rounded-full font-bold px-6" onClick={handleDelete}>
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
