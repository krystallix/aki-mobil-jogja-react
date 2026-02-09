import type { Metadata } from 'next';
import CatalogSections from "@/components/sections/catalog/catalog-sections";
import HomeLayout from "@/components/layouts/home-layout"
import JsonLd from '@/components/json-ld';

export const metadata: Metadata = {
    title: 'Katalog Aki Mobil - Harga Terbaru | Aki Mobil Jogja',
    description: 'Jual berbagai merek aki mobil: GS Astra, Yuasa, Incoe, Panasonic. Tersedia aki basah, kering (MF), hybrid untuk segala jenis mobil. Harga bersaing, garansi resmi.',
    keywords: ['katalog aki mobil', 'harga aki mobil', 'aki GS Astra', 'aki Yuasa', 'aki mobil murah jogja'],
    alternates: {
        canonical: 'https://akimobiljogja.com/katalog',
    },
    openGraph: {
        title: 'Katalog Aki Mobil - Harga Terbaru',
        description: 'Jual berbagai merek aki mobil: GS Astra, Yuasa, Incoe, Panasonic. Tersedia aki basah, kering (MF), hybrid untuk segala jenis mobil.',
        url: 'https://akimobiljogja.com/katalog',
        siteName: 'Aki Mobil Jogja',
        images: [{
            url: 'https://akimobiljogja.com/og-catalog.jpg',
            width: 1200,
            height: 630,
            alt: 'Katalog Aki Mobil Jogja',
        }],
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Katalog Aki Mobil - Harga Terbaru',
        description: 'Jual berbagai merek aki mobil dengan harga terbaik. Garansi resmi.',
        images: ['https://akimobiljogja.com/og-catalog.jpg'],
    },
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