import { Suspense } from 'react';
import type { Metadata } from "next";
import HeroSection from "@/components/sections/hero";
import SiteHeader from "@/components/sections/header";
import BenefitsSection from "@/components/sections/benefits";
import CatalogSection from "@/components/sections/catalog/catalog-sections";
import FaqSections from "@/components/sections/faq";
import Footer from "@/components/sections/footer";
import JsonLd from "@/components/json-ld";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { fetchCategories, fetchBrands, fetchCapacities, fetchAllProducts } from "@/lib/supabase/queries";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
    title: "Toko Aki Terdekat Jogja - Siswanto Aki | Servis & Tukar Tambah Aki Mobil Bantul 24 Jam",
    description: "Siswanto Aki Jogja (@siswantoaki.jogja) — toko aki terdekat di Bantul, Yogyakarta untuk servis aki, reparasi & tukar tambah aki mobil. Layanan antar pasang 24 jam, teknisi berpengalaman, harga transparan, garansi resmi.",
    keywords: [
        'toko aki terdekat', 'toko aki terdekat jogja', 'toko aki terdekat bantul',
        'servis aki jogja', 'servis aki bantul', 'servis aki mobil jogja',
        'siswanto aki', 'siswantoaki jogja', 'siswantoaki.jogja',
        'aki mobil jogja', 'aki mobil bantul', 'ganti aki 24 jam bantul',
        'reparasi aki mobil jogja', 'tukar tambah aki jogja',
        'aki mobil murah bantul', 'aki mobil yogyakarta',
        'toko aki bantul', 'toko aki jogja',
        'aki mobil pleret bantul', 'aki mobil delivery jogja',
        'antar pasang aki jogja', 'toko aki 24 jam jogja',
    ],
    alternates: {
        canonical: 'https://akimobiljogja.com',
    },
    openGraph: {
        title: 'Siswanto Aki Jogja - Toko Aki Terdekat & Tukar Tambah Aki Mobil Bantul',
        description: 'Siswanto Aki Jogja (@siswantoaki.jogja) — toko aki terdekat di Bantul, Yogyakarta untuk servis aki, reparasi & tukar tambah aki mobil. Layanan antar pasang 24 jam, teknisi berpengalaman.',
        url: 'https://akimobiljogja.com',
        siteName: 'Siswanto Aki',
        images: [{
            url: 'https://akimobiljogja.com/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'Toko Aki Terdekat Jogja - Siswanto Aki Bantul',
        }],
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Siswanto Aki Jogja - Toko Aki Terdekat & Tukar Tambah Aki Mobil Bantul',
        description: 'Siswanto Aki Jogja (@siswantoaki.jogja) — toko aki terdekat di Bantul, Yogyakarta untuk servis aki, reparasi & tukar tambah aki mobil. Layanan antar pasang 24 jam.',
        images: ['https://akimobiljogja.com/og-image.jpg'],
        creator: '@siswantoaki.jogja',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default async function Page() {
    const [categories, brands, amperes, products] = await Promise.all([
        fetchCategories(),
        fetchBrands(),
        fetchCapacities(),
        fetchAllProducts()
    ]);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AutoPartsStore',
        name: 'Siswanto Aki Jogja',
        alternateName: ['Siswanto Aki', 'siswantoaki.jogja', 'Siswanto Aki Bantul', 'Toko Aki Terdekat Jogja'],
        image: 'https://akimobiljogja.com/og-image.jpg',
        description: 'Siswanto Aki Jogja — toko aki terdekat di Bantul, Yogyakarta untuk reparasi & tukar tambah aki mobil. Layanan antar pasang 24 jam.',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Kanggotan No. 21, Pleret',
            addressLocality: 'Bantul',
            addressRegion: 'Daerah Istimewa Yogyakarta',
            postalCode: '55791',
            addressCountry: 'ID'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: -7.8703,
            longitude: 110.3925
        },
        url: 'https://akimobiljogja.com',
        telephone: '+6281354007400',
        sameAs: [
            'https://www.instagram.com/siswantoaki.jogja',
            'https://tiktok.com/@akimobiljogja',
            'https://www.facebook.com/people/Reparasi-Dan-Tukar-Tambah-Aki-Bp-Siswanto/61551816056838/',
            'https://maps.app.goo.gl/D9CgHvefsKVA3dD1A',
        ],
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                    'Monday', 'Tuesday', 'Wednesday',
                    'Thursday', 'Friday', 'Saturday', 'Sunday'
                ],
                opens: '00:00',
                closes: '23:59'
            }
        ],
        priceRange: '$$'
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <Analytics />
            <SiteHeader />
            <SpeedInsights />
            <HeroSection />
            <BenefitsSection />
            <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
                <CatalogSection
                    initialCategories={categories}
                    initialBrands={brands}
                    initialAmperes={amperes}
                    initialProducts={products}
                />
            </Suspense>
            <FaqSections />
            <Footer />
        </>
    );
}