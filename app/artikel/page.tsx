import type { Metadata } from 'next';
import HomeLayout from "@/components/layouts/home-layout";
import ArticleList from "@/components/sections/article-list";
import JsonLd from '@/components/json-ld';
import { getArticles } from '@/lib/supabase/data';

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
            <div className="py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-primary to-blue-800 bg-clip-text text-transparent">
                        Artikel & Tips
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Temukan tips, panduan, dan informasi terkini seputar aki mobil dan perawatannya
                    </p>
                </div>

                {/* Article List Component */}
                <ArticleList initialArticles={articles as any[]} />
            </div>
        </HomeLayout>
    );
}