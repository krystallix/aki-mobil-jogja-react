'use client'

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const whatsappNumber = '6281354007400'
const whatsappMessage = 'Halo, saya ingin konsultasi tentang aki mobil'
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

interface Slide {
    id: string
    eyebrow: string
    title: string
    subtitle: string
    bg: string
    image: string
    imageAlt: string
    ctaLabel: string
    ctaHref: string
}

const slides: Slide[] = [
    {
        id: "intro",
        eyebrow: "Layanan 24 Jam · Antar Pasang",
        title: "Aki Mobil\nJogja",
        subtitle: "Teknisi berpengalaman. Harga transparan. Garansi resmi.",
        bg: "from-indigo-800 via-indigo-850 to-indigo-700",
        image: "https://supabase.arkane.my.id/storage/v1/object/public/aki-mobil-jogja/hero/kering.webp",
        imageAlt: "Aki Mobil Jogja",
        ctaLabel: "Konsultasi Gratis",
        ctaHref: whatsappUrl,
    },
    {
        id: "kering",
        eyebrow: "Aki Kering · Maintenance Free",
        title: "Bebas\nPerawatan",
        subtitle: "Tanpa isi ulang air aki. Tahan lama 2–3× lebih panjang dari aki konvensional.",
        bg: "from-zinc-950 via-zinc-900 to-zinc-700",
        image: "https://supabase.arkane.my.id/storage/v1/object/public/aki-mobil-jogja/hero/kering.webp",
        imageAlt: "Aki Kering MF",
        ctaLabel: "Lihat Produk",
        ctaHref: "/katalog?q=kering",
    },
    {
        id: "basah",
        eyebrow: "Aki Basah · Paling Ekonomis",
        title: "Harga\nTerjangkau",
        subtitle: "Pilihan paling hemat untuk kendaraan harian. Tersedia di semua tipe.",
        bg: "from-blue-950 via-blue-900 to-blue-700",
        image: "https://supabase.arkane.my.id/storage/v1/object/public/aki-mobil-jogja/hero/basah.webp",
        imageAlt: "Aki Basah",
        ctaLabel: "Lihat Produk",
        ctaHref: "/katalog?q=basah",
    },
    {
        id: "hybrid",
        eyebrow: "Aki Hybrid · Teknologi Terkini",
        title: "Terbaik\nDua Dunia",
        subtitle: "Kombinasi teknologi kering & basah. Performa stabil, perawatan minimal.",
        bg: "from-green-950 via-green-900 to-green-700",
        image: "https://supabase.arkane.my.id/storage/v1/object/public/aki-mobil-jogja/hero/hybrid.webp",
        imageAlt: "Aki Hybrid",
        ctaLabel: "Lihat Produk",
        ctaHref: "/katalog?q=hybrid",
    },
]

const AUTOPLAY_MS = 5000

export default function HeroSection() {
    const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState(1)
    const [paused, setPaused] = useState(false)

    const goTo = useCallback((idx: number, dir?: number) => {
        setDirection(dir ?? (idx > current ? 1 : -1))
        setCurrent(idx)
    }, [current])

    const next = useCallback(() => goTo((current + 1) % slides.length, 1), [current, goTo])
    const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length, -1), [current, goTo])

    useEffect(() => {
        if (paused) return
        const t = setInterval(next, AUTOPLAY_MS)
        return () => clearInterval(t)
    }, [paused, next])

    const slide = slides[current]

    return (
        <section className="pt-24 pb-6 lg:pt-28 lg:pb-10">
            <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
                {/* Banner Card */}
                <div
                    className="relative rounded-2xl lg:rounded-3xl overflow-hidden cursor-pointer select-none"
                    style={{ minHeight: "220px" }}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    onTouchStart={() => setPaused(true)}
                    onTouchEnd={() => setPaused(false)}
                >
                    {/* Animated Background */}
                    <AnimatePresence custom={direction} mode="sync">
                        <motion.div
                            key={`bg-${slide.id}`}
                            custom={direction}
                            initial={{ x: direction > 0 ? "100%" : "-100%" }}
                            animate={{ x: "0%" }}
                            exit={{ x: direction > 0 ? "-100%" : "100%" }}
                            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                            className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`}
                        >
                            {/* Radial glow highlight */}
                            <div className="absolute inset-0" style={{
                                background: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 65%)"
                            }} />
                        </motion.div>
                    </AnimatePresence>

                    {/* Content Row */}
                    <div className="relative z-10 flex items-stretch h-full min-h-[180px] lg:min-h-[340px]">
                        {/* Left — Text */}
                        <div className="flex flex-col justify-center px-5 py-6 lg:px-12 lg:py-10 flex-1 min-w-0 max-w-[58%] lg:max-w-[50%] z-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`text-${slide.id}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    {/* Eyebrow */}
                                    <p className="text-[8px] lg:text-[11px] font-bold tracking-[0.12em] uppercase text-white/55 mb-1.5 lg:mb-3 leading-none">
                                        {slide.eyebrow}
                                    </p>

                                    {/* Title */}
                                    <h2 className="text-xl sm:text-2xl lg:text-5xl xl:text-6xl font-extrabold tracking-tighter text-white leading-[1.05] mb-3 lg:mb-5 whitespace-pre-line">
                                        {slide.title}
                                    </h2>

                                    {/* Subtitle — hidden on mobile */}
                                    <p className="hidden lg:block text-sm text-white/60 leading-relaxed mb-7 max-w-xs">
                                        {slide.subtitle}
                                    </p>

                                    {/* CTA */}
                                    {slide.id === "intro" ? (
                                        <a
                                            href={slide.ctaHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 lg:gap-2 px-4 py-2 lg:px-6 lg:py-3 rounded-lg lg:rounded-2xl font-bold text-[11px] lg:text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.98] w-fit text-white border border-indigo-400/30"
                                            style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(165,180,252,0.25) 0%, transparent 65%), rgb(55,48,163)" }}
                                        >
                                            {slide.ctaLabel}
                                            <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                        </a>
                                    ) : (
                                        <Link href={slide.ctaHref}>
                                            <span
                                                className="inline-flex items-center gap-1.5 lg:gap-2 px-4 py-2 lg:px-6 lg:py-3 rounded-lg lg:rounded-2xl font-bold text-[11px] lg:text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.98] w-fit text-white border border-indigo-400/30"
                                                style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(165,180,252,0.25) 0%, transparent 65%), rgb(55,48,163)" }}
                                            >
                                                {slide.ctaLabel}
                                                <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                            </span>
                                        </Link>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right — Product Image (centered vertically) */}
                        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                            <AnimatePresence custom={direction} mode="wait">
                                <motion.div
                                    key={`img-${slide.id}`}
                                    custom={direction}
                                    initial={{ opacity: 0, x: direction > 0 ? 30 : -30, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: direction > 0 ? -20 : 20, scale: 0.95 }}
                                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={slide.image}
                                        alt={slide.imageAlt}
                                        fill
                                        className="object-contain object-center drop-shadow-2xl p-3 lg:p-6"
                                        priority={current === 0}
                                        sizes="(max-width: 768px) 42vw, 38vw"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Dot Navigation */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                        {slides.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => goTo(i)}
                                aria-label={`Slide ${i + 1}`}
                                className={`rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${i === current
                                    ? "w-6 h-2 bg-white"
                                    : "w-2 h-2 bg-white/40 hover:bg-white/60"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Progress bar */}
                    {!paused && (
                        <motion.div
                            key={`prog-${current}`}
                            className="absolute bottom-0 left-0 h-0.5 bg-white/30 z-20"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                        />
                    )}

                    {/* Prev/Next swipe areas (invisible, mobile-friendly) */}
                    <button
                        onClick={prev}
                        className="absolute left-0 top-0 bottom-8 w-12 z-10 opacity-0"
                        aria-label="Previous"
                    />
                    <button
                        onClick={next}
                        className="absolute right-0 top-0 bottom-8 w-12 z-10 opacity-0"
                        aria-label="Next"
                    />
                </div>
            </div>
        </section>
    )
}