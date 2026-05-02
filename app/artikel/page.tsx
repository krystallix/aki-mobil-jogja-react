import type { Metadata } from 'next';
import HomeLayout from "@/components/layouts/home-layout";
import ArticleList from "@/components/sections/article-list";
import JsonLd from '@/components/json-ld';
import { getArticles } from '@/lib/supabase/data';
import * as motion from "framer-motion/client";

export const metadata: Metadata = {
    title: 'Artikel & Tips Aki Mobil - Panduan Lengkap | Aki Mobil Jogja',
    description: 'Kumpulan artikel informatif seputar perawatan aki mobil, tips otomotif, cara memilih aki yang tepat, dan solusi masalah aki. Update terbaru dari ahlinya.',
    keywords: ['tips aki mobil', 'perawatan aki', 'cara merawat aki', 'artikel otomotif', 'panduan aki mobil'],
    alternates: {
        canonical: 'https://akimobiljogja.com/artikel',
    },
    openGraph: {
        title: 'Artikel & Tips Aki Mobil - Panduan Lengkap',
        description: 'Kumpulan artikel informatif seputar perawatan aki mobil, tips otomotif, dan panduan memilih aki yang tepat untuk kendaraan Anda.',
        url: 'https://akimobiljogja.com/artikel',
        siteName: 'Aki Mobil Jogja',
        images: [{
            url: 'https://akimobiljogja.com/og-artikel.jpg',
            width: 1200,
            height: 630,
            alt: 'Artikel & Tips Aki Mobil Jogja',
        }],
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Artikel & Tips Aki Mobil - Panduan Lengkap',
        description: 'Kumpulan artikel informatif seputar perawatan aki mobil dan tips otomotif.',
        images: ['https://akimobiljogja.com/og-artikel.jpg'],
    },
};

export default async function ArtikelPage() {
    const articles = await getArticles(100);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Artikel & Tips Otomotif',
        description: 'Kumpulan artikel informatif seputar perawatan aki mobil.',
        url: 'https://akimobiljogja.com/artikel'
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://akimobiljogja.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Artikel',
                item: 'https://akimobiljogja.com/artikel'
            }
        ]
    };

    return (
        <HomeLayout>
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <div className="pt-24 pb-12 lg:pt-32 lg:pb-20 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-[10px] lg:text-xs font-bold tracking-widest uppercase border rounded-full border-primary/30 bg-primary/5 text-primary">
                            <span>Wawasan Otomotif</span>
                        </div>
                        <h1 className="text-5xl lg:text-8xl font-extrabold tracking-tighter mb-6 lg:mb-8 text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-foreground/50 leading-[1.05]">
                            Artikel & <br />
                            <span className="text-primary">Tips Terbaru</span>
                        </h1>
                        <p className="text-lg lg:text-xl text-muted-foreground font-light max-w-2xl leading-relaxed">
                            Temukan panduan ahli, tips perawatan aki, dan wawasan otomotif terkini untuk menjaga kendaraan Anda tetap prima.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="pb-20">
                <ArticleList initialArticles={articles as any[]} />
            </div>
        </HomeLayout>
    );
}