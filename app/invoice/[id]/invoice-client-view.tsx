"use client";

import React, { useRef, useState, useEffect } from "react";
import { Download, Loader2, Home, Share2, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { formatDateWIB } from "@/lib/utils";

export default function InvoiceClientView({ transaction }: { transaction: any }) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const invoiceLink = origin && transaction.id && transaction.customer_id
        ? `${origin}/invoice/${transaction.id.split('-').pop()}-${transaction.customer_id.split('-')[0]}`
        : '';

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    const maskPhone = (phone: string | null) => {
        if (!phone || phone.length < 8) return phone || '-';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length < 8) return phone;
        return cleaned.slice(0, 4) + 'xxxx' + cleaned.slice(-4);
    };

    const calculateWarranty = (item: any, createdAt: string) => {
        if (!item.garansi || !createdAt) return null;
        const match = item.garansi.match(/(\d+)\s*Bulan/i);
        if (!match) return null;
        const months = parseInt(match[1]);
        const startDate = new Date(createdAt);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + months);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { isActive: diffDays > 0, endDate, diffDays };
    };

    const formItems = transaction.transaction_items || [];
    const currentSubtotal = transaction.subtotal || 0;
    const currentTotal = transaction.total || 0;

    const mainWarrantyItem = formItems
        .filter((item: any) => item.garansi && item.garansi.toLowerCase().includes('bulan'))
        .map((item: any) => ({ ...item, warranty: calculateWarranty(item, transaction.created_at) }))
        .sort((a: any, b: any) => {
            if (!a.warranty) return 1;
            if (!b.warranty) return -1;
            return b.warranty.endDate.getTime() - a.warranty.endDate.getTime();
        })[0];

    let ongkir = 0;
    if (transaction.catatan && transaction.catatan.includes('Ongkir: Rp ')) {
        const match = transaction.catatan.match(/Ongkir: Rp (\d+)/);
        if (match) ongkir = parseInt(match[1], 10);
    }

    const handleDownload = async () => {
        if (!invoiceRef.current) return;
        try {
            setIsDownloading(true);
            toast.loading("Menyiapkan gambar...", { id: "invoice" });
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 800, windowWidth: 800,
            });
            canvas.toBlob(async (blob) => {
                if (!blob) { toast.error("Gagal membuat gambar", { id: "invoice" }); return; }
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Invoice-${transaction.id}.png`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Gambar berhasil diunduh.", { id: "invoice", duration: 4000 });
            }, "image/png");
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengunduh invoice", { id: "invoice" });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        if (!invoiceRef.current) return;
        try {
            setIsDownloading(true);
            toast.loading("Menyiapkan invoice...", { id: "invoice" });
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 800, windowWidth: 800,
            });
            canvas.toBlob(async (blob) => {
                if (!blob) { toast.error("Gagal membuat gambar", { id: "invoice" }); return; }
                const file = new File([blob], `Invoice-${transaction.id}.png`, { type: "image/png" });
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: `Invoice ${transaction.id}`,
                            text: `Berikut lampiran invoice pesanan Anda. Terima kasih!\n\n${invoiceLink}`
                        });
                        toast.success("Berhasil membuka menu share", { id: "invoice" });
                    } catch { toast.dismiss("invoice"); }
                } else {
                    try {
                        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                        toast.success("Gambar disalin ke Clipboard! Silakan paste.", { id: "invoice", duration: 5000 });
                    } catch {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `Invoice-${transaction.id}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Gambar diunduh.", { id: "invoice", duration: 4000 });
                    }
                }
            }, "image/png");
        } catch (error) {
            console.error(error);
            toast.error("Gagal membuat invoice", { id: "invoice" });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa] flex flex-col">
            {/* Warranty Banner */}
            {mainWarrantyItem && mainWarrantyItem.warranty && (
                <div className={`px-6 sm:px-8 py-4 sm:py-5 flex items-center gap-4 text-base sm:text-lg border-b ${mainWarrantyItem.warranty.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
                    {mainWarrantyItem.warranty.isActive ? <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-emerald-600" /> : <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-red-600" />}
                    <div>
                        <p className="text-sm sm:text-base font-bold">
                            {mainWarrantyItem.warranty.isActive ? 'Garansi Aktif' : 'Garansi Berakhir'}
                        </p>
                        <p className="text-xs sm:text-sm text-current/80 mt-0.5">
                            {mainWarrantyItem.warranty.isActive
                                ? `${mainWarrantyItem.nama_produk}: ${mainWarrantyItem.warranty.diffDays} hari tersisa (s.d. ${mainWarrantyItem.warranty.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})`
                                : `${mainWarrantyItem.nama_produk} — berakhir ${mainWarrantyItem.warranty.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                        </p>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground hover:text-foreground text-sm sm:text-base font-bold h-10 sm:h-11 px-4">
                            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Beranda</span>
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={handleShare}
                            disabled={isDownloading}
                            className="rounded-full text-sm sm:text-base font-bold h-10 sm:h-11 px-4 sm:px-5 gap-2"
                        >
                            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Share</span>
                        </Button>
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="rounded-full text-sm sm:text-base font-bold h-10 sm:h-11 px-4 sm:px-5 gap-2 bg-[#0f3460] hover:bg-[#0a2540]"
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Download className="w-4 h-4 sm:w-5 sm:h-5" />}
                            <span>Download</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Invoice Canvas */}
            <div className="flex-1 flex justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[800px]">
                    <div
                        ref={invoiceRef}
                        className="w-full bg-white text-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-200 rounded-lg p-6 sm:p-8 md:p-12 relative overflow-hidden"
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
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 mb-8 sm:mb-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#0f3460] rounded-lg flex items-center justify-center shrink-0">
                                            <img src="/logo-light.svg" alt="Siswanto Aki" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Siswanto Aki</h2>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Kanggotan 21, Pleret, Bantul<br />Yogyakarta, 55791<br />0813-5400-7400 / 0882-2796-8449</p>
                                </div>
                                <div className="w-full sm:w-64 shrink-0">
                                    <div className="bg-[#0f3460] text-white rounded-t-sm p-2.5 sm:p-3">
                                        <h3 className="text-base sm:text-lg font-bold">Invoice #{transaction.id?.split('-').pop()}</h3>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 sm:p-3 grid grid-cols-2 gap-y-2 text-xs text-gray-600 font-medium">
                                        <span>Dibuat</span>
                                        <span className="text-right text-gray-900">{formatDateWIB(transaction.created_at)}</span>
                                        <span>Tipe</span>
                                        <span className="text-right text-gray-900 uppercase font-bold text-[10px]">{transaction.tipe?.replace('_', ' ')}</span>
                                        <span>Status</span>
                                        <span className="text-right text-gray-900 uppercase">{transaction.status}</span>
                                    </div>
                                    <div className="bg-[#0f3460] text-white p-2.5 sm:p-3 rounded-b-sm flex justify-between items-center font-bold">
                                        <span>Total</span>
                                        <span className="text-base sm:text-lg">{formatRupiah(currentTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recipient */}
                            <div className="mb-8 sm:mb-10">
                                <p className="text-[10px] font-bold text-[#0f3460] uppercase tracking-widest mb-1.5">Pelanggan:</p>
                                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{transaction.customer_nama || 'Nama Pelanggan'}</h4>
                                <p className="text-sm text-gray-500">{maskPhone(transaction.customer_no_hp)}</p>
                                <p className="text-sm text-gray-500 max-w-[250px]">{transaction.customer_alamat || '-'}</p>
                            </div>

                            {/* Table */}
                            <div className="mb-8 sm:mb-10 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
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
                                        {formItems.map((item: any, idx: number) => (
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
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                                <div className="flex flex-col gap-4">
                                    {invoiceLink && <QRCodeSVG value={invoiceLink} size={56} />}
                                    <p className="text-xs text-gray-400 max-w-[200px]">Terima kasih atas kepercayaannya.</p>
                                </div>
                                <div className="w-full sm:w-64">
                                    <div className="flex justify-between py-2 text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-bold text-gray-900">{formatRupiah(currentSubtotal)}</span>
                                    </div>
                                    {transaction.diskon ? (
                                        <div className="flex justify-between py-2 text-sm text-red-600">
                                            <span>Diskon</span>
                                            <span className="font-bold">-{formatRupiah(transaction.diskon)}</span>
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
    );
}
