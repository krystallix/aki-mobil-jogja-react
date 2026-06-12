import type { Metadata } from "next";
import TentangKamiClient from "./tentang-kami-client";

export const metadata: Metadata = {
    title: "Tentang Kami | Siswanto Aki",
    description:
        "Siswanto Aki — bengkel dan toko aki mobil terpercaya di Bantul, Jogja sejak 2000. Melayani servis aki, tukar tambah, dan antar pasang 24 jam dengan teknisi berpengalaman.",
    keywords: [
        'tentang siswanto aki', 'sejarah siswanto aki', 'bengkel aki jogja',
        'tukar tambah aki jogja', 'servis aki bantul', 'toko aki jogja',
        'siswanto aki', 'siswanto aki jogja', 'aki mobil jogja',
    ],
    alternates: {
        canonical: 'https://akimobiljogja.com/tentang-kami',
    },
    openGraph: {
        title: 'Tentang Kami | Siswanto Aki',
        description:
            'Siswanto Aki — bengkel dan toko aki mobil terpercaya di Bantul, Jogja sejak 2000. Melayani servis aki, tukar tambah, dan antar pasang 24 jam.',
        url: 'https://akimobiljogja.com/tentang-kami',
        siteName: 'Siswanto Aki',
        images: [{
            url: 'https://akimobiljogja.com/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'Tentang Siswanto Aki',
        }],
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tentang Kami | Siswanto Aki',
        description:
            'Siswanto Aki — bengkel dan toko aki mobil terpercaya di Bantul, Jogja sejak 2000. Melayani servis aki, tukar tambah, dan antar pasang 24 jam.',
        images: ['https://akimobiljogja.com/og-image.jpg'],
    },
};

export default function TentangKamiPage() {
    return <TentangKamiClient />;
}
