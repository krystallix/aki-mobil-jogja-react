"use client";

import React, { useState } from "react";
import { Search, ArrowRight, FileText, ShieldCheck, Truck, Clock, Smartphone, FileSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SearchMode = "invoice" | "phone";

export default function InvoicePageClient() {
    const router = useRouter();
    const [mode, setMode] = useState<SearchMode>("invoice");
    const [invoiceId, setInvoiceId] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "invoice") {
            const trimmed = invoiceId.trim();
            if (!trimmed) return;
            router.push(`/invoice/${trimmed}`);
        } else {
            const trimmed = phone.trim().replace(/^0/, "62");
            if (!trimmed) return;
            router.push(`/invoice/cari?phone=${encodeURIComponent(trimmed)}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa] flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#0f3460] rounded-lg flex items-center justify-center shrink-0">
                            <img src="/logo-light.svg" alt="Siswanto Aki" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                        </div>
                        <span className="text-base sm:text-lg font-black text-[#0f3460]">Siswanto Aki</span>
                    </Link>
                    <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-500">
                        <Link href="/" className="hover:text-[#0f3460] transition-colors">Beranda</Link>
                        <Link href="/katalog" className="hover:text-[#0f3460] transition-colors">Katalog</Link>
                        <Link href="/artikel" className="hover:text-[#0f3460] transition-colors">Artikel</Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="w-full bg-gradient-to-br from-[#0f3460] to-[#1a5276] text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black mb-3">Cek Invoice</h1>
                        <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                            Masukkan nomor invoice atau nomor HP untuk melihat detail transaksi dan status garansi Anda.
                        </p>

                        {/* Mode Tabs */}
                        <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 mt-6 sm:mt-8 max-w-xs mx-auto">
                            <button
                                onClick={() => setMode("invoice")}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${mode === "invoice" ? "bg-white text-[#0f3460]" : "text-white/70 hover:text-white"}`}
                            >
                                <FileSearch className="w-4 h-4" />
                                No. Invoice
                            </button>
                            <button
                                onClick={() => setMode("phone")}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${mode === "phone" ? "bg-white text-[#0f3460]" : "text-white/70 hover:text-white"}`}
                            >
                                <Smartphone className="w-4 h-4" />
                                No. HP
                            </button>
                        </div>

                        {/* Search Form */}
                        <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 max-w-md mx-auto">
                            <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-lg">
                                <div className="flex-1 flex items-center gap-2 pl-3 sm:pl-4">
                                    {mode === "invoice" ? (
                                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                                    ) : (
                                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                                    )}
                                    {mode === "invoice" ? (
                                        <input
                                            type="text"
                                            value={invoiceId}
                                            onChange={(e) => setInvoiceId(e.target.value)}
                                            placeholder="Contoh: INV-001"
                                            className="w-full py-2 text-gray-900 placeholder:text-gray-400 text-sm font-medium bg-transparent border-0 outline-none focus:ring-0"
                                        />
                                    ) : (
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                            placeholder="Contoh: 08123456789"
                                            className="w-full py-2 text-gray-900 placeholder:text-gray-400 text-sm font-medium bg-transparent border-0 outline-none focus:ring-0"
                                        />
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#0f3460] text-white px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0a2540] transition-colors flex items-center gap-2 shrink-0"
                                >
                                    <span className="hidden sm:inline">Cari</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-white/40 text-xs mt-2 text-left">
                                {mode === "invoice"
                                    ? "Masukkan nomor invoice yang tertera di email atau SMS konfirmasi."
                                    : "Masukkan nomor HP yang didaftarkan saat transaksi."}
                            </p>
                        </form>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="w-full py-8 sm:py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Cek Garansi</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Lihat sisa masa garansi dan status perlindungan produk Anda secara real-time.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Riwayat Transaksi</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Detail pembelian, metode pembayaran, dan informasi pengiriman lengkap.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1">24 Jam Layanan</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Butuh bantuan? Hubungi kami kapan saja untuk informasi lebih lanjut.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
                    <span>&copy; 2026 Siswanto Aki. All rights reserved.</span>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <span>Kanggotan 21, Pleret, Bantul</span>
                        <span className="hidden sm:inline w-px h-3 bg-gray-200" />
                        <span>0813-5400-7400</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
