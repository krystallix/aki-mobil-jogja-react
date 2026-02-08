'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, ArrowRight } from "lucide-react"

type BatteryType = 'mf' | 'hybrid' | 'basah'

interface BatteryInfo {
    name: string
    image: string
    color: string
    advantages: string[]
    disadvantages: string[]
}

const batteryData: Record<BatteryType, BatteryInfo> = {
    mf: {
        name: "Maintenance Free",
        image: "https://supabase.arkane.my.id/storage/v1/object/public/aki-mobil-jogja/hero/kering.webp",
        color: "bg-blue-500",
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
        color: "bg-green-500",
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
        color: "bg-red-500",
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

export default function HeroSection() {
    const [selectedType, setSelectedType] = useState<BatteryType>('mf')
    const currentBattery = batteryData[selectedType]

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="relative overflow-hidden lg:max-h-[70vh]">

                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-8 lg:grid-cols-2 pt-8 pb-12 lg:pt-10 lg:pb-0">
                        {/* Left Content */}
                        <div className="space-y-6 lg:space-y-8 z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <h1 className="text-4xl lg:text-7xl tracking-tight text-gray-900 leading-tight font-bold">
                                    Kenali Kebutuhan
                                    <span className="block text-primary mt-2">
                                        Aki Anda
                                    </span>
                                </h1>
                                <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg">
                                    Temukan aki yang tepat untuk kendaraan Anda. Kami menyediakan berbagai
                                    jenis aki dengan kualitas terjamin dan garansi resmi.
                                </p>
                            </motion.div>



                            {/* Battery Types Selector */}
                            <div className="pt-2 lg:pt-4">
                                <p className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Pilih Tipe Aki</p>
                                <div className="flex flex-wrap gap-2 lg:gap-3">
                                    {(['mf', 'hybrid', 'basah'] as BatteryType[]).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className="relative px-4 lg:px-6 py-2 rounded-full text-xs lg:text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            {selectedType === type && (
                                                <motion.div
                                                    layoutId="activePill"
                                                    className="absolute inset-0 bg-primary rounded-full"
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                            <span className={`relative z-10 ${selectedType === type ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                                {type === 'mf' ? 'Maintenance Free' : type.charAt(0).toUpperCase() + type.slice(1)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Image Area with Floating Cards */}
                        <div className="relative flex items-center justify-center lg:justify-end h-[300px] lg:h-[400px] w-full lg:mt-16">
                            {/* Animated Background Circle */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                                className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] lg:w-[500px] lg:h-[500px] rounded-full blur-3xl opacity-20 -z-10 transition-colors duration-500 ${selectedType === 'mf' ? 'bg-blue-300' : selectedType === 'hybrid' ? 'bg-green-300' : 'bg-red-300'}`}
                            />

                            {/* Battery Image */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentBattery.name}
                                    initial={{ x: 50, opacity: 0, rotate: 5, scale: 0.9 }}
                                    animate={{ x: 0, opacity: 1, rotate: 0, scale: 1 }}
                                    exit={{ x: -50, opacity: 0, rotate: -5, scale: 0.9 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                        mass: 1
                                    }}
                                    className="relative z-10 w-full h-full flex items-center justify-center -mt-4 lg:-mt-12"
                                >
                                    <div className="relative w-[240px] h-[240px] lg:w-[600px] lg:h-[400px]">
                                        <img
                                            src={currentBattery.image}
                                            alt={currentBattery.name}
                                            className="w-full h-full object-contain "
                                        />

                                        {/* Floating Kelebihan Card - Top Left */}
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={selectedType + "adv"}
                                                initial={{ scale: 0, opacity: 0, x: -20, y: -20 }}
                                                animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                                                exit={{ scale: 0, opacity: 0, x: -20, y: -20 }}
                                                transition={{ delay: 0.2, type: "tween", stiffness: 300 }}
                                                className="absolute -top-4 -left-4 lg:top-0 lg:-left-16 w-40 lg:w-56 rounded-2xl bg-white/90 backdrop-blur-sm p-3 lg:p-4 border border-white/50 shadow-xl"
                                            >
                                                <div className="flex items-center gap-2 mb-2 lg:mb-3">
                                                    <div className="h-5 w-5 lg:h-7 lg:w-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-3 w-3 lg:h-4 lg:w-4" />
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900 text-xs lg:text-sm">Kelebihan</h3>
                                                </div>
                                                <ul className="space-y-1">
                                                    {currentBattery.advantages.slice(0, 3).map((adv, i) => (
                                                        <motion.li
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.25 + i * 0.05 }}
                                                            className="flex items-start gap-2 text-[10px] lg:text-xs text-gray-600"
                                                        >
                                                            <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                                                            <span className="leading-tight">{adv}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Floating Kekurangan Card - Bottom Right */}
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={selectedType + "dis"}
                                                initial={{ scale: 0, opacity: 0, x: 20, y: 20 }}
                                                animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                                                exit={{ scale: 0, opacity: 0, x: 20, y: 20 }}
                                                transition={{ delay: 0.25, type: "tween", stiffness: 300 }}
                                                className="absolute -bottom-4 -right-4 lg:bottom-8 lg:-right-16 w-40 lg:w-60 rounded-2xl bg-white/90 backdrop-blur-sm p-3 lg:p-4 border border-white/50 shadow-xl"
                                            >
                                                <div className="flex items-center gap-2 mb-2 lg:mb-3">
                                                    <div className="h-5 w-5 lg:h-7 lg:w-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                                        <X className="h-3 w-3 lg:h-4 lg:w-4" />
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900 text-xs lg:text-sm">Kekurangan</h3>
                                                </div>
                                                <ul className="space-y-1">
                                                    {currentBattery.disadvantages.map((dis, i) => (
                                                        <motion.li
                                                            key={i}
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.3 + i * 0.05 }}
                                                            className="flex items-start gap-2 text-[10px] lg:text-xs text-gray-600"
                                                        >
                                                            <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                                                            <span className="leading-tight">{dis}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}