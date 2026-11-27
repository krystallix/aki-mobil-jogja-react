"use client";

import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "6281354007400";
const DEFAULT_MESSAGE =
    "Halo Siswanto Aki, saya mau konsultasi aki mobil / layanan antar pasang 24 jam.";

export default function FloatingWhatsApp() {
    const pathname = usePathname();

    if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/invoice")
    ) {
        return null;
    }

    const isProductDetail = pathname.startsWith("/katalog/product/");
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Konsultasi WhatsApp 24 Jam Siswanto Aki"
            className={`${isProductDetail ? "hidden lg:inline-flex" : "inline-flex"} fixed bottom-5 right-5 z-50 items-center gap-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 shadow-lg shadow-green-600/30 transition-all duration-300 hover:scale-105 active:scale-95`}
        >
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <FaWhatsapp className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold whitespace-nowrap">
                Tanya WA 24 Jam
            </span>
        </a>
    );
}
