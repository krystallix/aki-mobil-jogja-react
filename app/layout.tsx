import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-heading',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://akimobiljogja.com'),
  title: {
    default: "Siswanto Aki - Toko Aki Terpercaya & Layanan Antar Pasang",
    template: "%s | Siswanto Aki",
  },
  description: "Siswanto Aki - Solusi terbaik untuk kebutuhan aki mobil Anda. Melayani layanan antar pasang aki 24 jam dengan teknisi profesional.",
  keywords: ["siswanto aki", "toko aki jogja", "ganti aki jogja", "aki mobil", "layanan antar aki", "jumper aki jogja", "toko aki 24 jam jogja"],
  authors: [{ name: "Siswanto Aki" }],
  creator: "Siswanto Aki",
  publisher: "Siswanto Aki",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://akimobiljogja.com",
    siteName: "Siswanto Aki",
    title: "Siswanto Aki - Toko Aki Terpercaya & Layanan Antar Pasang",
    description: "Solusi terbaik untuk kebutuhan aki mobil Anda. Melayani layanan antar pasang aki 24 jam dengan teknisi profesional.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Siswanto Aki",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Siswanto Aki - Toko Aki Terpercaya",
    description: "Solusi terbaik untuk kebutuhan aki mobil Anda. Melayani layanan antar pasang aki 24 jam.",
    images: ["/og-image.jpg"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${robotoSlab.variable} antialiased`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>

      </body>
    </html>
  );
}
