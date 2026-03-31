import HomeLayout from "@/components/layouts/home-layout";
import RekomendasiAkiClient from "./rekomendasi-aki-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rekomendasi Aki Kendaraan | Aki Mobil Jogja",
    description:
        "Cari rekomendasi aki terbaik untuk kendaraan Anda. Temukan pilihan aki standar, upgrade, dan upgrade lanjutan berdasarkan merek dan model mobil Anda.",
};

export default function RekomendasiAkiPage() {
    return (
        <HomeLayout>
            <div className="py-10 px-4 md:px-0">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-800 bg-clip-text text-transparent">
                        Rekomendasi Aki
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Temukan rekomendasi aki terbaik untuk kendaraan Anda berdasarkan merek dan model.
                    </p>
                </div>

                <RekomendasiAkiClient />
            </div>
        </HomeLayout>
    );
}