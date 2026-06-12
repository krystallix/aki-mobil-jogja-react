import type { Metadata } from "next";
import HomeLayout from "@/components/layouts/home-layout";
import JsonLd from "@/components/json-ld";
import { ShieldCheck, RotateCcw, Clock, Phone, AlertCircle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Kebijakan Pengembalian | Siswanto Aki",
    description:
        "Baca kebijakan pengembalian dan penukaran produk Siswanto Aki. Kami menjamin kepuasan pelanggan dengan proses klaim garansi yang mudah dan transparan.",
    alternates: {
        canonical: "https://akimobiljogja.com/kebijakan-pengembalian",
    },
    openGraph: {
        title: "Kebijakan Pengembalian | Siswanto Aki",
        description:
            "Kebijakan pengembalian dan penukaran produk Siswanto Aki. Garansi resmi dengan proses klaim mudah.",
        url: "https://akimobiljogja.com/kebijakan-pengembalian",
        siteName: "Siswanto Aki",
        locale: "id_ID",
        type: "website",
    },
};

const sections = [
    {
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        title: "Syarat Pengembalian",
        items: [
            "Produk dikembalikan dalam kondisi asli (tidak terpasang / tidak digunakan).",
            "Pengembalian dilakukan maksimal 3 × 24 jam setelah produk diterima.",
            "Produk disertai nota/bukti pembelian resmi dari Siswanto Aki.",
            "Kemasan produk dalam keadaan utuh dan tidak rusak.",
            "Pengembalian tidak berlaku untuk produk yang rusak akibat kesalahan pemasangan pelanggan.",
        ],
    },
    {
        icon: RotateCcw,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        title: "Prosedur Klaim & Penukaran",
        items: [
            "Hubungi kami via WhatsApp atau telepon untuk melaporkan kendala produk.",
            "Sertakan foto/video kondisi produk yang bermasalah.",
            "Tim kami akan memverifikasi klaim dalam 1 × 24 jam kerja.",
            "Jika klaim disetujui, produk dapat ditukar dengan unit baru tanpa biaya tambahan.",
            "Pengembalian dana (refund) diproses maksimal 3 hari kerja setelah klaim disetujui.",
        ],
    },
    {
        icon: ShieldCheck,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        title: "Garansi Produk",
        items: [
            "Semua produk aki baru dilengkapi garansi resmi dari distributor / pabrikan.",
            "Masa garansi bervariasi sesuai merek: GS Astra, Yuasa, Incoe, Panasonic — masing-masing memiliki ketentuan sendiri.",
            "Garansi mencakup kerusakan akibat cacat produksi, bukan karena pemakaian tidak wajar.",
            "Klaim garansi wajib disertai kartu garansi dan nota pembelian yang masih berlaku.",
        ],
    },
    {
        icon: AlertCircle,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-900/20",
        title: "Pengecualian",
        items: [
            "Kerusakan akibat pemasangan yang tidak sesuai spesifikasi kendaraan.",
            "Produk yang sudah dimodifikasi atau dibongkar oleh pihak lain.",
            "Kerusakan akibat bencana alam, korsleting listrik eksternal, atau kebakaran.",
            "Produk aki bekas / second tidak termasuk dalam kebijakan pengembalian ini.",
        ],
    },
];

export default function KebijakanPengembalianPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Kebijakan Pengembalian | Siswanto Aki',
        description: 'Kebijakan pengembalian dan penukaran produk Siswanto Aki. Garansi resmi dengan proses klaim mudah dan transparan.',
        url: 'https://akimobiljogja.com/kebijakan-pengembalian',
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://akimobiljogja.com' },
            { '@type': 'ListItem', position: 2, name: 'Kebijakan Pengembalian', item: 'https://akimobiljogja.com/kebijakan-pengembalian' },
        ],
    };

    return (
        <HomeLayout>
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <div className="max-w-5xl mx-auto px-6 py-10 lg:py-16">
                {/* Header - Styled like Homepage Panel */}
                <div className="mb-10 lg:mb-12 rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-indigo-800 p-6 lg:p-10 text-white relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(165,180,252,0.15) 0%, transparent 55%)" }} />
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold tracking-widest uppercase rounded-full bg-white/10 border border-white/15 text-white/80">
                            <span>Informasi Layanan</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter text-white mb-4 leading-tight">
                            Kebijakan Pengembalian
                        </h1>
                        <p className="text-base lg:text-lg text-white/70 font-light leading-relaxed">
                            Kepuasan pelanggan adalah prioritas kami. Berikut adalah ketentuan lengkap terkait pengembalian, penukaran, dan klaim garansi produk Siswanto Aki.
                        </p>
                        <div className="flex items-center gap-2 mt-6 text-xs font-medium text-white/50">
                            <Clock className="h-3.5 w-3.5 text-indigo-300" />
                            <span>Terakhir diperbarui: Maret 2025</span>
                        </div>
                    </div>
                </div>

                {/* Sections - Grid style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {sections.map(({ icon: Icon, color, bg, title, items }) => (
                        <div key={title} className="relative rounded-2xl border border-border/50 bg-card p-6 lg:p-8 hover:border-primary/20 transition-all shadow-sm overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(100,100,100,1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,1) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                            <div className="relative z-10 flex items-center gap-3 mb-5">
                                <div className={`p-2.5 rounded-xl ${bg}`}>
                                    <Icon className={`h-5 w-5 ${color}`} />
                                </div>
                                <h2 className="text-lg font-extrabold tracking-tight text-foreground">{title}</h2>
                            </div>
                            <ul className="relative z-10 space-y-2.5">
                                {items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                                        <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* CTA - Gradient style */}
                <div className="mt-10 lg:mt-12 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden" style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(165,180,252,0.25) 0%, transparent 65%), rgb(55,48,163)" }}>
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-xl shrink-0">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl lg:text-2xl font-extrabold mb-1">Ada pertanyaan?</h3>
                                <p className="text-white/80 font-light text-sm max-w-sm leading-relaxed">
                                    Tim kami siap membantu setiap hari. Hubungi via WhatsApp untuk proses klaim lebih cepat.
                                </p>
                            </div>
                        </div>
                        <a
                            href="https://wa.me/6281354007400?text=Halo%2C+saya+ingin+menanyakan+tentang+kebijakan+pengembalian+produk."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full text-sm font-bold hover:scale-105 transition-transform shrink-0"
                        >
                            Hubungi WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}
