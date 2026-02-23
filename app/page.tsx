import type { Metadata } from "next";
import HeroSection from "@/components/sections/hero";
import SiteHeader from "@/components/sections/header";
import BenefitsSection from "@/components/sections/benefits";
import CatalogSection from "@/components/sections/catalog/catalog-sections";
import FaqSections from "@/components/sections/faq";
import Footer from "@/components/sections/footer";
import JsonLd from "@/components/json-ld";
import { Analytics } from "@vercel/analytics/next"
import { fetchCategories, fetchBrands, fetchCapacities, fetchAllProducts } from "@/lib/supabase/queries";

export const metadata: Metadata = {
    title: "Aki Mobil Jogja - Layanan Ganti Aki 24 Jam & Delivery",
    description: "Layanan ganti aki mobil di Jogja 24 jam. Terima panggilan ke rumah/kantor. Teknisi berpengalaman, harga bersaing, garansi resmi. Hubungi kami sekarang!",
    keywords: ['aki mobil jogja', 'ganti aki 24 jam', 'aki mobil murah', 'aki mobil yogyakarta', 'service aki jogja', 'aki mobil delivery'],
    alternates: {
        canonical: 'https://akimobiljogja.com',
    },
    openGraph: {
        title: 'Aki Mobil Jogja - Layanan Ganti Aki 24 Jam & Delivery',
        description: 'Layanan ganti aki mobil di Jogja 24 jam. Terima panggilan ke rumah/kantor. Teknisi berpengalaman, harga bersaing, garansi resmi.',
        url: 'https://akimobiljogja.com',
        siteName: 'Aki Mobil Jogja',
        images: [{
            url: 'https://akimobiljogja.com/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'Aki Mobil Jogja - Layanan Ganti Aki 24 Jam',
        }],
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Aki Mobil Jogja - Layanan Ganti Aki 24 Jam & Delivery',
        description: 'Layanan ganti aki mobil di Jogja 24 jam. Terima panggilan ke rumah/kantor. Teknisi berpengalaman, harga bersaing, garansi resmi.',
        images: ['https://akimobiljogja.com/og-image.jpg'],
        creator: '@akimobiljogja',
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
        name: 'Aki Mobil Jogja',
        image: 'https://akimobiljogja.com/og-image.jpg',
        description: 'Toko aki mobil terpercaya di Jogja melayani pesan antar pasang 24 jam.',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Jl. Magelang No. KM 5.5',
            addressLocality: 'Sleman',
            addressRegion: 'Daerah Istimewa Yogyakarta',
            postalCode: '55284',
            addressCountry: 'ID'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: -7.7699,
            longitude: 110.3688
        },
        url: 'https://akimobiljogja.com',
        telephone: '+6281354007400',
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
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
            <HeroSection />
            <BenefitsSection />
            <CatalogSection
                initialCategories={categories}
                initialBrands={brands}
                initialAmperes={amperes}
                initialProducts={products}
            />
            <FaqSections />
            <Footer />
        </>
    );
}