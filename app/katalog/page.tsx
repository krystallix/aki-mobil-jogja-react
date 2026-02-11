import type { Metadata } from 'next';
import CatalogSections from "@/components/sections/catalog/catalog-sections";
import HomeLayout from "@/components/layouts/home-layout"
import JsonLd from '@/components/json-ld';

import { fetchCategories, fetchBrands, fetchCapacities, fetchAllProducts } from "@/lib/supabase/queries";

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

export default async function KatalogPage() {
    const [categories, brands, amperes, products] = await Promise.all([
        fetchCategories(),
        fetchBrands(),
        fetchCapacities(),
        fetchAllProducts()
    ]);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Katalog Aki Mobil',
        description: 'Daftar lengkap produk aki mobil yang tersedia.',
        url: 'https://akimobiljogja.com/katalog',
        mainEntity: {
            '@type': 'OfferCatalog',
            name: 'Katalog Aki Mobil',
            itemListElement: products.slice(0, 20).map((product: any) => ({
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Product',
                    name: product.nama
                }
            }))
        }
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
                name: 'Katalog',
                item: 'https://akimobiljogja.com/katalog'
            }
        ]
    };

    return (
        <HomeLayout>
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <CatalogSections
                initialCategories={categories}
                initialBrands={brands}
                initialAmperes={amperes}
                initialProducts={products}
            />
        </HomeLayout>
    );
}