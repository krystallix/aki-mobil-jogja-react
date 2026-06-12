import HomeLayout from "@/components/layouts/home-layout";
import RekomendasiAkiClient from "./rekomendasi-aki-client";
import JsonLd from "@/components/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rekomendasi Aki Kendaraan | Siswanto Aki",
    description:
        "Cari rekomendasi aki terbaik untuk kendaraan Anda. Temukan pilihan aki standar, upgrade, dan upgrade lanjutan berdasarkan merek dan model mobil Anda di Siswanto Aki Jogja.",
    keywords: [
        'rekomendasi aki mobil', 'aki mobil sesuai mobil', 'aki standar mobil',
        'aki upgrade mobil', 'panduan milih aki', 'cara pilih aki mobil',
        'aki mobil rekomendasi', 'aki yang cocok untuk mobil',
        'rekomendasi aki jogja', 'tabel aki mobil',
    ],
    alternates: {
        canonical: 'https://akimobiljogja.com/rekomendasi-aki',
    },
    openGraph: {
        title: 'Rekomendasi Aki Kendaraan | Siswanto Aki',
        description:
            'Cari rekomendasi aki terbaik untuk kendaraan Anda. Temukan pilihan aki standar, upgrade, dan upgrade lanjutan berdasarkan merek dan model mobil Anda.',
        url: 'https://akimobiljogja.com/rekomendasi-aki',
        siteName: 'Siswanto Aki',
        images: [{
            url: 'https://akimobiljogja.com/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'Rekomendasi Aki Mobil - Siswanto Aki',
        }],
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Rekomendasi Aki Kendaraan | Siswanto Aki',
        description:
            'Cari rekomendasi aki terbaik untuk kendaraan Anda. Temukan pilihan aki standar, upgrade, dan upgrade lanjutan.',
        images: ['https://akimobiljogja.com/og-image.jpg'],
    },
};

export default function RekomendasiAkiPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://akimobiljogja.com' },
                    { '@type': 'ListItem', position: 2, name: 'Rekomendasi Aki', item: 'https://akimobiljogja.com/rekomendasi-aki' },
                ],
            },
            {
                '@type': 'WebApplication',
                name: 'Rekomendasi Aki Kendaraan',
                url: 'https://akimobiljogja.com/rekomendasi-aki',
                description: 'Cari rekomendasi aki terbaik untuk kendaraan Anda berdasarkan merek dan model mobil.',
                applicationCategory: 'UtilitiesApplication',
                operatingSystem: 'All',
                author: { '@type': 'Organization', name: 'Siswanto Aki' },
            },
        ],
    };

    return (
        <HomeLayout>
            <JsonLd data={jsonLd} />
            <div className="pt-16 pb-8 lg:pt-32 lg:pb-20 bg-background relative overflow-hidden min-h-[calc(100vh-80px)]">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="mb-6 lg:mb-16 max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] lg:text-xs font-bold tracking-widest uppercase border rounded-full border-primary/30 bg-primary/5 text-primary">
                            <span>Panduan Memilih</span>
                        </div>
                        <h1 className="text-3xl lg:text-7xl font-extrabold tracking-tighter mb-4 lg:mb-6 text-transparent bg-clip-text bg-linear-to-br from-foreground via-foreground to-foreground/50 leading-tight">
                            Rekomendasi <br className="hidden lg:block" />
                            <span className="text-primary">Aki Mobil</span>
                        </h1>
                        <p className="text-sm lg:text-lg text-muted-foreground font-light max-w-2xl leading-relaxed">
                            Temukan rekomendasi aki terbaik untuk kendaraan Anda berdasarkan merek dan model. Panduan kami membantu Anda memilih aki standar atau upgrade.
                        </p>
                    </div>

                    <RekomendasiAkiClient />
                </div>
            </div>
        </HomeLayout>
    );
}