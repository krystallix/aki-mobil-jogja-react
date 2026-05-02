'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { Zap, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type BatteryType = 'mf' | 'hybrid' | 'basah'

interface BatteryInfo {
    name: string
    image: string
    advantages: string[]
    disadvantages: string[]
}

const batteryData: Record<BatteryType, BatteryInfo> = {
    mf: {
        name: "Maintenance Free",
        image: "https://supabase.arkane.my.id/storage/v1/object/public/aki-mobil-jogja/hero/kering.webp",
        advantages: [
            "Tidak perlu perawatan rutin",
            "Bebas perawatan air aki",
            "2-3x Lebih tahan lama",
        ],
        disadvantages: [
            "Harga lebih mahal",
            "Sensitif terhadap overcharging"
        ]
    },
    hybrid: {
        name: "Hybrid",
        image: "https://supabase.arkane.my.id/storage/v1/object/public/aki-mobil-jogja/hero/hybrid.webp",
        advantages: [
            "Kombinasi teknologi basah dan kering",
            "Perawatan minimal",
            "Harga lebih terjangkau dari MF",
            "Performa stabil"
        ],
        disadvantages: [
            "Masih perlu pengecekan air aki",
            "Tidak sepenuhnya maintenance free"
        ]
    },
    basah: {
        name: "Basah",
        image: "https://supabase.arkane.my.id/storage/v1/object/public/aki-mobil-jogja/hero/basah.webp",
        advantages: [
            "Harga paling ekonomis",
            "Mudah ditemukan di pasaran",
            "Cocok untuk penggunaan standar"
        ],
        disadvantages: [
            "Perlu perawatan rutin",
            "Harus rajin cek air aki",
            "Risiko tumpah lebih tinggi",
        ]
    }
}

const whatsappNumber = '6281354007400'
const whatsappMessage = 'Halo, saya ingin konsultasi tentang aki mobil'
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

export default function HeroSection() {
    const [selectedType, setSelectedType] = useState<BatteryType>('mf')
    const currentBattery = batteryData[selectedType]

    return (
        <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/about.webp"
                    alt="Aki Mobil Jogja"
                    fill
                    priority
                    className="object-cover opacity-80 object-center scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
            </div>

            {/* Hero Content */}
            <div className="container relative z-10 mx-auto px-6 max-w-7xl flex flex-col items-center text-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 mb-6 lg:mb-8 text-[10px] lg:text-xs font-bold tracking-widest uppercase border rounded-full border-primary/30 bg-primary/10 text-primary backdrop-blur-md"
                >
                    <Zap className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>#1 Melayani Sepenuh Hati</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 lg:mb-8 text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-foreground/40 leading-[1.1]"
                >
                    Kenali Kebutuhan<br />
                    <span className="text-primary">Aki Anda</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground font-light mb-6 lg:mb-8 leading-relaxed px-4"
                >
                    Temukan aki yang tepat untuk kendaraan Anda. Kami menyediakan berbagai
                    jenis aki dengan kualitas terjamin dan garansi resmi.
                </motion.p>

                {/* Battery Type Selector */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="flex flex-wrap items-center justify-center gap-2 mb-8 lg:mb-10"
                >
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mr-2">Pilih Tipe:</span>
                    {(['mf', 'hybrid', 'basah'] as BatteryType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`relative px-4 py-2 rounded-full text-xs lg:text-sm font-semibold transition-all duration-300 border ${selectedType === type
                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30'
                                : 'bg-background/40 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground backdrop-blur-sm'
                                }`}
                        >
                            {type === 'mf' ? 'Maintenance Free' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </motion.div> */}

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full sm:w-auto px-6 sm:px-0"
                >
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 h-12 lg:h-14 rounded-full font-bold text-sm lg:text-base bg-primary text-primary-foreground shadow-none hover:scale-105 transition-transform duration-300"
                    >
                        Konsultasi Gratis
                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                    </a>
                    <Link href="/katalog" className="w-full sm:w-auto">
                        <button className="w-full inline-flex items-center justify-center px-8 h-12 lg:h-14 rounded-full font-bold text-sm lg:text-base border border-border bg-background/40 backdrop-blur-sm text-foreground hover:bg-muted transition-colors">
                            Lihat Katalog
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}