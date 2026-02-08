import type { Metadata } from "next";
import HeroSection from "@/components/sections/hero";
import SiteHeader from "@/components/sections/header";
import BenefitsSection from "@/components/sections/benefits";
import CatalogSection from "@/components/sections/catalog/catalog-sections";
import FaqSections from "@/components/sections/faq";
import Footer from "@/components/sections/footer";
import JsonLd from "@/components/json-ld";

export const metadata: Metadata = {
    title: "Aki Mobil Jogja - Layanan Ganti Aki 24 Jam & Delivery",
    description: "Layanan ganti aki mobil di Jogja 24 jam. Terima panggilan ke rumah/kantor. Teknisi berpengalaman, harga bersaing, garansi resmi. Hubungi kami sekarang!",
    alternates: {
        canonical: 'https://akimobiljogja.com',
    }
};

export default function Page() {
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
        telephone: '+6281234567890',
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
            <SiteHeader />
            <HeroSection />
            <BenefitsSection />
            <CatalogSection />
            <FaqSections />
            <Footer />
        </>
    );
}