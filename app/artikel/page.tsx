import type { Metadata } from 'next';
import HomeLayout from "@/components/layouts/home-layout";
import ArticleList from "@/components/sections/article-list";
import JsonLd from '@/components/json-ld';
import { getArticles } from '@/lib/supabase/data';

export const metadata: Metadata = {
    title: 'Artikel & Tips Otomotif - Panduan Perawatan Aki Mobil',
    description: 'Kumpulan artikel informatif seputar perawatan aki mobil, tips otomotif, dan panduan memilih aki yang tepat untuk kendaraan Anda.',
    openGraph: {
        title: 'Artikel & Tips Otomotif - Aki Mobil Jogja',
        description: 'Temukan berbagai tips dan panduan menarik seputar dunia otomotif dan perawatan aki mobil.',
        type: 'website',
    }
};

export default async function ArtikelPage() {
    const articles = await getArticles();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Artikel & Tips Otomotif',
        description: 'Kumpulan artikel informatif seputar perawatan aki mobil.',
        url: 'https://akimobiljogja.com/artikel'
    };

    return (
        <HomeLayout>
            <JsonLd data={jsonLd} />
            <div className="py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-800 bg-clip-text text-transparent">
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