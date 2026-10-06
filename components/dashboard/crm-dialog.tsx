"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MessageSquare,
    Search,
    Send,
    Copy,
    Check,
    Car,
    Bike,
    BatteryCharging,
    Clock,
    CheckCircle2,
    Phone,
    ExternalLink,
    AlertCircle,
    UserCheck,
    FileText,
    Calendar
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CrmCustomerTransaction } from "@/lib/supabase/types";

interface CrmArticleOption {
    id: string;
    title: string;
    slug: string;
}

interface CrmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactions: CrmCustomerTransaction[];
    articles: CrmArticleOption[];
    onFollowUpSuccess?: (transactionId: string) => void;
}

function cleanWhatsAppNumber(phone: string | null): string {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
        cleaned = "62" + cleaned.slice(1);
    } else if (cleaned.startsWith("8")) {
        cleaned = "62" + cleaned;
    }
    return cleaned;
}

function formatDuration(dateString: string): string {
    const past = new Date(dateString);
    const now = new Date();
    const diffMonths = Math.max(
        1,
        (now.getFullYear() - past.getFullYear()) * 12 + (now.getMonth() - past.getMonth())
    );
    return `${diffMonths} bulan lalu`;
}

function detectIsCarBattery(productName: string): boolean {
    const lower = productName.toLowerCase();
    if (lower.includes("motor") || lower.includes("gtz") || lower.includes("ytx") || lower.includes("gm5z")) {
        return false;
    }
    return true;
}

export function CrmDialog({
    open,
    onOpenChange,
    transactions: initialTransactions,
    articles,
    onFollowUpSuccess,
}: CrmDialogProps) {
    const supabase = createClient();

    const [txList, setTxList] = useState<CrmCustomerTransaction[]>(initialTransactions);
    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "contacted">("all");

    // Message Editor state
    const [templateType, setTemplateType] = useState<"mobil" | "standar">("mobil");
    const [selectedArticleSlug, setSelectedArticleSlug] = useState<string>("");
    const [messageText, setMessageText] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Sync prop changes
    useEffect(() => {
        setTxList(initialTransactions);
        if (initialTransactions.length > 0 && !selectedTxId) {
            setSelectedTxId(initialTransactions[0].id);
        }
    }, [initialTransactions, selectedTxId]);

    // Set default article
    useEffect(() => {
        if (articles.length > 0 && !selectedArticleSlug) {
            const maintenanceArticle = articles.find((a) =>
                a.title.toLowerCase().includes("rawat") ||
                a.title.toLowerCase().includes("tips") ||
                a.title.toLowerCase().includes("perawatan")
            );
            setSelectedArticleSlug(maintenanceArticle ? maintenanceArticle.slug : articles[0].slug);
        }
    }, [articles, selectedArticleSlug]);

    // Active transaction
    const activeTx = useMemo(() => {
        return txList.find((tx) => tx.id === selectedTxId) || txList[0] || null;
    }, [txList, selectedTxId]);

    // When activeTx changes, auto detect template type
    useEffect(() => {
        if (!activeTx) return;
        const mainProduct = activeTx.transaction_items?.[0]?.nama_produk || "";
        const isCar = detectIsCarBattery(mainProduct);
        setTemplateType(isCar ? "mobil" : "standar");
    }, [activeTx?.id]);

    // Generate message content
    const generateMessage = (type: "mobil" | "standar", articleSlug: string, tx: CrmCustomerTransaction | null) => {
        if (!tx) return "";
        const customerName = tx.customer_nama?.trim() || "Kak";
        const productName = tx.transaction_items?.[0]?.nama_produk || "Aki";
        const duration = formatDuration(tx.created_at);
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://akimobiljogja.com";
        const articleUrl = articleSlug ? `${baseUrl}/artikel/${articleSlug}` : `${baseUrl}/artikel`;

        if (type === "mobil") {
            return `Halo Kak ${customerName}, salam dari Siswanto Aki Mobil Jogja! 🙏

Tidak terasa sudah sekitar ${duration} sejak Kakak memasang aki *${productName}* di tempat kami. Semoga aki dan mobil Kakak selalu dalam kondisi prima.

Agar aki tetap awet dan tahan bertahun-tahun, Kakak bisa membaca panduan tips perawatannya di sini:
👉 ${articleUrl}

🎁 *Layanan Spesial Pelanggan Siswanto Aki:*
Bagi Kakak pengguna mobil, kami sediakan *Layanan Pengecekan Voltase Aki & Sistem Alternator/Pengisian GRATIS* langsung di bengkel kami.

Jika Kakak ingin sekalian kami cek kelistrikannya, silakan balas pesan ini untuk atur jadwal ya Kak. Terima kasih banyak dan salam sehat selalu! 🚗⚡`;
        }

        return `Halo Kak ${customerName}, salam hangat dari Siswanto Aki Jogja! 🙏

Tidak terasa sudah sekitar ${duration} sejak pembelian aki *${productName}* di tempat kami. Kami ingin memastikan kondisi akinya tetap berfungsi maksimal.

Berikut tips panduan praktis merawat aki agar performanya terjaga dan tidak cepat ngedrop:
👉 ${articleUrl}

Jika ada kendala seputar kelistrikan atau butuh konsultasi aki, jangan ragu untuk hubungi kami kembali ya Kak. Terima kasih banyak atas kepercayaannya! ⚡`;
    };

    // Recalculate message when dependencies change
    useEffect(() => {
        if (activeTx) {
            setMessageText(generateMessage(templateType, selectedArticleSlug, activeTx));
        }
    }, [activeTx?.id, templateType, selectedArticleSlug]);

    // Filter transactions list
    const filteredTransactions = useMemo(() => {
        return txList.filter((tx) => {
            const matchesSearch =
                tx.customer_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tx.customer_no_hp && tx.customer_no_hp.includes(searchQuery)) ||
                tx.transaction_items?.some((item) =>
                    item.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
                );

            if (!matchesSearch) return false;

            if (filterStatus === "pending") return !tx.crm_follow_up_at;
            if (filterStatus === "contacted") return !!tx.crm_follow_up_at;
            return true;
        });
    }, [txList, searchQuery, filterStatus]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(messageText);
            setIsCopied(true);
            toast.success("Pesan berhasil disalin");
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin teks");
        }
    };

    const markAsContacted = async (txId: string) => {
        const nowIso = new Date().toISOString();
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from("transactions")
                .update({ crm_follow_up_at: nowIso })
                .eq("id", txId);

            if (error) throw error;

            setTxList((prev) =>
                prev.map((t) => (t.id === txId ? { ...t, crm_follow_up_at: nowIso } : t))
            );
            if (onFollowUpSuccess) {
                onFollowUpSuccess(txId);
            }
        } catch (err: unknown) {
            console.error("Gagal update crm_follow_up_at:", err);
            toast.info("WhatsApp terbuka. (Info: Jalankan SQL ALTER TABLE jika kolom status belum ada di DB)");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendWhatsApp = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!activeTx) return;
        const cleanPhone = cleanWhatsAppNumber(activeTx.customer_no_hp);
        if (!cleanPhone) {
            e.preventDefault();
            toast.error("Nomor WhatsApp pelanggan belum valid atau kosong");
            return;
        }

        await markAsContacted(activeTx.id);
        toast.success(`Membuka WhatsApp untuk ${activeTx.customer_nama}`);
    };

    const cleanPhone = activeTx ? cleanWhatsAppNumber(activeTx.customer_no_hp) : "";
    const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
        : "#";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[95vw] lg:max-w-7xl h-[92vh] max-h-[940px] p-0 flex flex-col gap-0 overflow-hidden bg-white text-neutral-900 rounded-2xl border border-neutral-200/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]">
                {/* Apple-style Window Header */}
                <DialogHeader className="px-5 py-4 border-b border-neutral-200/70 bg-white shrink-0 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold tracking-tight text-neutral-900">
                                CRM Follow-Up
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-500 font-normal">
                                Customer orders older than 3 months for retention and battery care checkup.
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200/60 tabular-nums">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            {txList.length} Orders &gt; 3 Months
                        </span>
                    </div>
                </DialogHeader>

                {/* macOS-style Master-Detail 2-Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-neutral-200/70">
                    {/* Master Column: Customer List */}
                    <div className="md:col-span-5 lg:col-span-4 flex flex-col h-[280px] md:h-full min-h-0 bg-neutral-50/60 overflow-hidden">
                        {/* Search and Apple Segmented Filter */}
                        <div className="p-3.5 border-b border-neutral-200/70 bg-white shrink-0 space-y-2.5">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search name, phone, or battery..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-9 text-xs bg-neutral-50 border-neutral-200 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                                />
                            </div>

                            {/* Apple Segmented Control */}
                            <div className="flex p-0.5 rounded-lg bg-neutral-200/60 border border-neutral-200/40 text-xs">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilterStatus("all")}
                                    className={`flex-1 h-7 py-1 px-2 rounded-md font-medium text-xs transition-all cursor-pointer ${
                                        filterStatus === "all"
                                            ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-semibold hover:bg-white"
                                            : "text-neutral-500 hover:text-neutral-800 hover:bg-transparent"
                                    }`}
                                >
                                    All ({txList.length})
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilterStatus("pending")}
                                    className={`flex-1 h-7 py-1 px-2 rounded-md font-medium text-xs transition-all cursor-pointer ${
                                        filterStatus === "pending"
                                            ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-semibold hover:bg-white"
                                            : "text-neutral-500 hover:text-neutral-800 hover:bg-transparent"
                                    }`}
                                >
                                    Pending ({txList.filter((t) => !t.crm_follow_up_at).length})
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilterStatus("contacted")}
                                    className={`flex-1 h-7 py-1 px-2 rounded-md font-medium text-xs transition-all cursor-pointer ${
                                        filterStatus === "contacted"
                                            ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-semibold hover:bg-white"
                                            : "text-neutral-500 hover:text-neutral-800 hover:bg-transparent"
                                    }`}
                                >
                                    Contacted ({txList.filter((t) => !!t.crm_follow_up_at).length})
                                </Button>
                            </div>
                        </div>

                        {/* Customer List Items */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 overscroll-contain">
                            {filteredTransactions.length === 0 ? (
                                <div className="p-8 text-center text-xs text-neutral-400 flex flex-col items-center gap-2">
                                    <AlertCircle className="w-8 h-8 text-neutral-300" />
                                    <span>No matching customers found</span>
                                </div>
                            ) : (
                                filteredTransactions.map((tx) => {
                                    const isSelected = activeTx?.id === tx.id;
                                    const isContacted = !!tx.crm_follow_up_at;
                                    const mainItem = tx.transaction_items?.[0];
                                    const isCar = detectIsCarBattery(mainItem?.nama_produk || "");

                                    return (
                                        <div
                                            key={tx.id}
                                            onClick={() => setSelectedTxId(tx.id)}
                                            className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                                isSelected
                                                    ? "bg-indigo-50/40 border-indigo-500 ring-1 ring-indigo-500/20 shadow-xs"
                                                    : "bg-white hover:border-neutral-300 border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1 pl-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-xs text-neutral-900 truncate">
                                                            {tx.customer_nama}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center text-[10px] px-1.5 py-0.2 rounded-md font-medium border ${
                                                                isCar
                                                                    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                                                    : "bg-neutral-100 text-neutral-600 border-neutral-200"
                                                            }`}
                                                        >
                                                            {isCar ? "Car" : "Standard"}
                                                        </span>
                                                    </div>

                                                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-1 truncate">
                                                        <BatteryCharging className="w-3 h-3 text-neutral-400 shrink-0" />
                                                        <span className="truncate">
                                                            {mainItem ? mainItem.nama_produk : "Battery"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isContacted ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium shrink-0">
                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                        Contacted
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium shrink-0">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2.5 pt-2 border-t border-neutral-100 pl-1 font-mono tabular-nums">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-neutral-300" />
                                                    {formatDuration(tx.created_at)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-neutral-300" />
                                                    {tx.customer_no_hp || "-"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Detail Pane: Message Config & WhatsApp Action */}
                    <div className="md:col-span-7 lg:col-span-8 flex flex-col h-full min-h-0 bg-white overflow-hidden">
                        {activeTx ? (
                            <>
                                {/* Recipient Identity Bar */}
                                <div className="p-4 sm:px-6 border-b border-neutral-200/70 bg-white flex items-center justify-between gap-4 shrink-0">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-sm text-neutral-900">
                                                {activeTx.customer_nama}
                                            </h3>
                                            <span className="text-xs text-neutral-500 font-mono">
                                                {activeTx.customer_no_hp || "Tanpa No HP"}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mt-0.5">
                                            <span>Produk: <strong className="font-medium text-neutral-700">{activeTx.transaction_items?.[0]?.nama_produk || "Aki"}</strong></span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-neutral-400" />
                                                {new Date(activeTx.created_at).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {activeTx.crm_follow_up_at && (
                                        <div className="text-right text-xs shrink-0">
                                            <span className="text-neutral-400 text-[11px] block">Follow-up Terakhir</span>
                                            <span className="font-semibold text-emerald-700 font-mono text-xs">
                                                {new Date(activeTx.crm_follow_up_at).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Segmented Controls: Model Template & Article */}
                                <div className="p-4 sm:px-6 border-b border-neutral-200/70 bg-neutral-50/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs shrink-0">
                                    {/* Template Selector */}
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-neutral-600 text-xs">
                                            Message Template
                                        </label>
                                        <div className="flex p-0.5 rounded-lg bg-neutral-200/60 border border-neutral-200/50">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setTemplateType("mobil")}
                                                className={`flex-1 h-8 py-1.5 px-3 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    templateType === "mobil"
                                                        ? "bg-indigo-600 text-white font-semibold shadow-xs hover:bg-indigo-700 hover:text-white"
                                                        : "text-neutral-600 hover:text-neutral-900 hover:bg-transparent"
                                                }`}
                                            >
                                                <Car className="w-3.5 h-3.5" />
                                                <span>Car Battery (+Free Check)</span>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setTemplateType("standar")}
                                                className={`flex-1 h-8 py-1.5 px-3 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    templateType === "standar"
                                                        ? "bg-indigo-600 text-white font-semibold shadow-xs hover:bg-indigo-700 hover:text-white"
                                                        : "text-neutral-600 hover:text-neutral-900 hover:bg-transparent"
                                                }`}
                                            >
                                                <Bike className="w-3.5 h-3.5" />
                                                <span>Standard / Bike</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Article Selector */}
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-neutral-600 text-xs flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5 text-neutral-400" />
                                            Attach Article Guide Link
                                        </label>
                                        <Select
                                            value={selectedArticleSlug}
                                            onValueChange={(val) => setSelectedArticleSlug(val)}
                                        >
                                            <SelectTrigger className="h-9 text-xs w-full bg-white border-neutral-200 rounded-lg text-neutral-800">
                                                <SelectValue placeholder="Pilih artikel panduan..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-56 bg-white border-neutral-200 shadow-lg">
                                                {articles.map((art) => (
                                                    <SelectItem key={art.id} value={art.slug} className="text-xs">
                                                        {art.title}
                                                    </SelectItem>
                                                ))}
                                                {articles.length === 0 && (
                                                    <SelectItem value="panduan-aki" className="text-xs">
                                                        Halaman Artikel Siswanto Aki
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Textarea Editor View */}
                                <div className="flex-1 p-4 sm:px-6 flex flex-col min-h-0 gap-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-neutral-700">
                                            Preview &amp; Edit Message:
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopy}
                                            className="h-7 text-xs px-2.5 rounded-lg border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 gap-1.5 shadow-2xs"
                                        >
                                            {isCopied ? (
                                                <Check className="w-3 h-3 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-3 h-3 text-neutral-500" />
                                            )}
                                            <span>{isCopied ? "Copied" : "Copy Message"}</span>
                                        </Button>
                                    </div>

                                    <Textarea
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        className="flex-1 resize-none text-xs sm:text-sm font-sans leading-relaxed p-3.5 bg-neutral-50/50 border-neutral-200/90 rounded-xl text-neutral-900 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                                        placeholder="Type follow-up message..."
                                    />
                                </div>

                                {/* Bottom Action Toolbar */}
                                <div className="p-4 sm:px-6 border-t border-neutral-200/70 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                                    <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>WhatsApp Number:</span>
                                        <span className="font-mono font-semibold text-neutral-800 tabular-nums">
                                            {cleanPhone ? `+${cleanPhone}` : "Unavailable"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        {activeTx.crm_follow_up_at && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => markAsContacted(activeTx.id)}
                                                disabled={isUpdating}
                                                className="h-10 text-xs px-3.5 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                            >
                                                <UserCheck className="w-3.5 h-3.5 mr-1 text-neutral-500" />
                                                Mark Again
                                            </Button>
                                        )}

                                        <a
                                            href={cleanPhone ? waUrl : undefined}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={handleSendWhatsApp}
                                            className={`inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold h-10 px-5 shadow-xs transition-all active:scale-[0.98] flex-1 sm:flex-none ${
                                                !cleanPhone
                                                    ? "pointer-events-none opacity-40 bg-neutral-200 text-neutral-500"
                                                    : "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                                            }`}
                                        >
                                            <Send className="w-4 h-4" />
                                            <span>Open WhatsApp</span>
                                            <ExternalLink className="w-3 h-3 opacity-70" />
                                        </a>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 gap-2">
                                <MessageSquare className="w-10 h-10 text-neutral-300" />
                                <p className="text-xs">Pilih salah satu pelanggan di daftar sebelah kiri.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
