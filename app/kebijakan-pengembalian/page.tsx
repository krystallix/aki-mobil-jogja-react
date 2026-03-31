import type { Metadata } from "next";
import HomeLayout from "@/components/layouts/home-layout";
import { ShieldCheck, RotateCcw, Clock, Phone, AlertCircle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Kebijakan Pengembalian | Aki Mobil Jogja",
    description:
        "Baca kebijakan pengembalian dan penukaran produk Aki Mobil Jogja. Kami menjamin kepuasan pelanggan dengan proses klaim garansi yang mudah dan transparan.",
    alternates: {
        canonical: "https://akimobiljogja.com/kebijakan-pengembalian",
    },
    openGraph: {
        title: "Kebijakan Pengembalian | Aki Mobil Jogja",
        description:
            "Kebijakan pengembalian dan penukaran produk Aki Mobil Jogja. Garansi resmi dengan proses klaim mudah.",
        url: "https://akimobiljogja.com/kebijakan-pengembalian",
        siteName: "Aki Mobil Jogja",
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
            "Produk disertai nota/bukti pembelian resmi dari Aki Mobil Jogja.",
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
    return (
        <HomeLayout>
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Kebijakan Pengembalian
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        Kepuasan pelanggan adalah prioritas kami. Berikut adalah ketentuan lengkap
                        terkait pengembalian, penukaran, dan klaim garansi produk Aki Mobil Jogja.
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Terakhir diperbarui: Maret 2025</span>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map(({ icon: Icon, color, bg, title, items }) => (
                        <div key={title} className="rounded-xl border p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${bg}`}>
                                    <Icon className={`h-5 w-5 ${color}`} />
                                </div>
                                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                            </div>
                            <ul className="space-y-2.5">
                                {items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-10 rounded-xl bg-primary p-6 text-white">
                    <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold mb-1">Ada pertanyaan tentang pengembalian?</p>
                            <p className="text-sm text-blue-100 mb-4">
                                Tim kami siap membantu Anda setiap hari. Hubungi langsung via WhatsApp
                                untuk proses klaim yang lebih cepat.
                            </p>
                            <a
                                href="https://wa.me/6281354007400?text=Halo%2C+saya+ingin+menanyakan+tentang+kebijakan+pengembalian+produk."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Hubungi via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}
