import type { Metadata } from 'next';
import CatalogSections from "@/components/sections/catalog/catalog-sections";
import HomeLayout from "@/components/layouts/home-layout"
import JsonLd from '@/components/json-ld';

export const metadata: Metadata = {
    title: 'Katalog Aki Mobil Lengkap - Harga Terbaru & Terlengkap',
    description: 'Jual berbagai merek dan tipe aki mobil dengan harga terbaik. Tersedia aki basah, kering, dan hybrid untuk segala jenis kendaraan.',
    openGraph: {
        title: 'Katalog Aki Mobil - Aki Mobil Jogja',
        description: 'Jual berbagai merek dan tipe aki mobil dengan harga terbaik.',
        type: 'website',
    }
};

export default function KatalogPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Katalog Aki Mobil',
        description: 'Daftar lengkap produk aki mobil yang tersedia.',
        url: 'https://akimobiljogja.com/katalog',
        mainEntity: {
            '@type': 'OfferCatalog',
            name: 'Katalog Aki Mobil',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Product',
                        name: 'Aki Basah'
                    }
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Product',
                        name: 'Aki Kering (MF)'
                    }
                }
            ]
        }
    };

    return (
        <HomeLayout>
            <JsonLd data={jsonLd} />
            <CatalogSections />
        </HomeLayout>
    );
}