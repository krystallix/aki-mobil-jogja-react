"use client";

import React, { useRef, useState, useEffect } from "react";
import { Download, Share2, Loader2, Home, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function InvoiceClientView({ transaction }: { transaction: any }) {
    const invoicePrintRef = useRef<HTMLDivElement>(null);
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
        
        return {
            isActive: diffDays > 0,
            endDate,
            diffDays
        };
    };

    const formItems = transaction.transaction_items || [];
    const currentSubtotal = transaction.subtotal || 0;
    const currentTotal = transaction.total || 0;
    
    const mainWarrantyItem = formItems
        .filter((item: any) => item.garansi && item.garansi.toLowerCase().includes('bulan'))
        .map((item: any) => ({
            ...item,
            warranty: calculateWarranty(item, transaction.created_at)
        }))
        .sort((a: any, b: any) => {
            if (!a.warranty) return 1;
            if (!b.warranty) return -1;
            return b.warranty.endDate.getTime() - a.warranty.endDate.getTime();
        })[0];
    
    // Extract ongkir from catatan if exists
    let ongkir = 0;
    if (transaction.catatan && transaction.catatan.includes('Ongkir: Rp ')) {
        const match = transaction.catatan.match(/Ongkir: Rp (\d+)/);
        if (match) {
            ongkir = parseInt(match[1], 10);
        }
    }

    const handleShareWA = async () => {
        if (!invoicePrintRef.current) return;
        try {
            setIsDownloading(true);
            toast.loading("Menyiapkan gambar...", { id: "invoice" });

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
                const file = new File([blob], `Invoice-${transaction.id}.png`, { type: "image/png" });

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: `Invoice ${transaction.id}`,
                            text: `Berikut lampiran invoice pesanan Anda. Terima kasih!`
                        });
                        toast.success("Berhasil membuka menu share", { id: "invoice" });
                    } catch (e) {
                        toast.dismiss("invoice");
                    }
                } else {
                    try {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `Invoice-${transaction.id}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Gambar berhasil diunduh.", { id: "invoice", duration: 4000 });
                    } catch (e) {
                        toast.error("Gagal mengunduh gambar", { id: "invoice" });
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
        <div className="min-h-screen bg-muted/20 py-8 px-4 flex flex-col items-center">
            
            {/* Top Toolbar */}
            <div className="w-full max-w-[800px] mb-6 flex justify-between items-center">
                <Link href="/">
                    <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
                        <Home className="w-4 h-4" />
                        <span className="font-bold">Beranda</span>
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button 
                        onClick={handleShareWA} 
                        disabled={isDownloading}
                        className="rounded-full bg-primary font-bold shadow-sm"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Download Invoice
                    </Button>
                </div>
            </div>

            {/* Warranty Banner */}
            {mainWarrantyItem && mainWarrantyItem.warranty && (
                <div className={`w-full max-w-[800px] mb-6 p-4 rounded-xl border flex items-center gap-4 shadow-sm ${mainWarrantyItem.warranty.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
                    <div className={`p-3 rounded-full shrink-0 ${mainWarrantyItem.warranty.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {mainWarrantyItem.warranty.isActive ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm md:text-base">
                            {mainWarrantyItem.warranty.isActive ? 'Garansi Aktif' : 'Garansi Berakhir'}
                        </h4>
                        <p className="text-xs md:text-sm mt-0.5 opacity-90">
                            {mainWarrantyItem.warranty.isActive 
                                ? `Sisa garansi untuk ${mainWarrantyItem.nama_produk} adalah ${mainWarrantyItem.warranty.diffDays} hari (s.d. ${mainWarrantyItem.warranty.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})`
                                : `Masa garansi untuk ${mainWarrantyItem.nama_produk} telah berakhir pada ${mainWarrantyItem.warranty.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* PREVIEW UI */}
            <div className="w-full max-w-[800px] flex justify-center overflow-x-auto pb-8">
                <div 
                    className="w-[800px] bg-white text-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-200 rounded-lg p-8 md:p-12 relative overflow-hidden shrink-0"
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
                                    <h3 className="text-lg font-bold">Invoice #{transaction.id?.split('-').pop()}</h3>
                                </div>
                                <div className="bg-gray-50 p-3 grid grid-cols-2 gap-y-2 text-xs text-gray-600 font-medium">
                                    <span>Dibuat</span>
                                    <span className="text-right text-gray-900">{transaction.created_at ? new Date(transaction.created_at).toISOString().split('T')[0] : '-'}</span>
                                    <span>Tipe</span>
                                    <span className="text-right text-gray-900 uppercase font-bold text-[10px]">{transaction.tipe?.replace('_', ' ')}</span>
                                    <span>Status</span>
                                    <span className="text-right text-gray-900 uppercase">{transaction.status}</span>
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
                            <h4 className="text-xl font-bold text-gray-900 mb-1">{transaction.customer_nama || 'Nama Pelanggan'}</h4>
                            <p className="text-sm text-gray-500">{transaction.customer_no_hp || '-'}</p>
                            <p className="text-sm text-gray-500 max-w-[250px]">{transaction.customer_alamat || '-'}</p>
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

            {/* HIDDEN PRINT INVOICE FOR HTML2CANVAS */}
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
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Invoice #{transaction.id?.split('-').pop()}</h3>
                                </div>
                                <div style={{ background: '#f9fafb', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#4b5563' }}>
                                    <span>Dibuat</span>
                                    <span style={{ textAlign: 'right', color: '#111827', fontWeight: 600 }}>{transaction.created_at ? new Date(transaction.created_at).toISOString().split('T')[0] : '-'}</span>
                                    <span>Tipe</span>
                                    <span style={{ textAlign: 'right', color: '#111827', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>{transaction.tipe?.replace('_', ' ')}</span>
                                    <span>Status</span>
                                    <span style={{ textAlign: 'right', color: '#111827', textTransform: 'uppercase' }}>{transaction.status}</span>
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
                            <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{transaction.customer_nama || 'Nama Pelanggan'}</h4>
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 2px' }}>{transaction.customer_no_hp || '-'}</p>
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{transaction.customer_alamat || '-'}</p>
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
                                    {formItems.map((item: any, idx: number) => (
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
                                {transaction.diskon ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#dc2626' }}>
                                        <span>Diskon</span>
                                        <span style={{ fontWeight: 700 }}>-{formatRupiah(transaction.diskon)}</span>
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
        </div>
    );
}
