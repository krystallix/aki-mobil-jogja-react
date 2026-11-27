'use client'

import { ShieldCheck, BatteryCharging, Truck, Wrench, Zap, Recycle, ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

const features = [
    { icon: Truck, title: "Aki Panggilan 24 Jam", desc: "Gratis antar pasang ke lokasi Jogja & Bantul" },
    { icon: BatteryCharging, title: "Setrum / Cas & Jumper", desc: "Layanan cas aki & jumper darurat di tempat" },
    { icon: Recycle, title: "Tukar Tambah Aki", desc: "Potongan harga menarik dengan aki lama" },
    { icon: ShieldCheck, title: "Garansi Resmi", desc: "Produk original bergaransi hingga 12 bulan" },
    { icon: Wrench, title: "Cek Aki & Alternator Gratis", desc: "Diagnosis akurat sebelum ganti aki baru" },
    { icon: Zap, title: "Respon Cepat 24/7", desc: "Teknisi berpengalaman siap bantu kapan saja" },
];

const stats = [
    { value: "500+", label: "Pelanggan" },
    { value: "24/7", label: "Layanan" },
    { value: "10+", label: "Merek" },
];

const whatsappUrl = `https://wa.me/6281354007400?text=${encodeURIComponent('Halo, saya ingin konsultasi tentang aki mobil')}`;

export default function BenefitsSection() {
    return (
        <section className="py-6 lg:py-20 bg-background">
            <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-2.5 lg:gap-4">

                    {/* Left Panel — Solid Indigo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:col-span-2 relative overflow-hidden rounded-2xl lg:rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-indigo-800 px-5 py-5 lg:p-8 flex flex-col lg:justify-between"
                    >
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(165,180,252,0.10) 0%, transparent 55%)" }} />
                        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                        {/* Mobile: horizontal layout (heading left, stats right) */}
                        <div className="relative z-10 flex items-center justify-between gap-4 lg:block">
                            <div>
                                {/* <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 mb-5 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full bg-white/10 border border-white/15 text-white/60">
                                    Keunggulan Kami
                                </div> */}
                                <h2 className="text-lg lg:text-4xl font-extrabold tracking-tighter text-white leading-[1.1]">
                                    Kenapa Harus<br className="hidden lg:block" />
                                    <span className="lg:block"> Kami?</span>
                                </h2>
                                {/* Description — desktop only */}
                                <p className="hidden lg:block text-sm text-white/60 leading-relaxed max-w-xs mt-3">
                                    Bengkel &amp; toko aki mobil panggilan di Pleret, Bantul melayani antar pasang, tukar tambah, setrum/cas, dan jumper aki area Yogyakarta &amp; sekitarnya.
                                </p>
                            </div>

                            {/* Stats — inline on mobile, block below on desktop */}
                            <div className="flex gap-4 lg:hidden shrink-0">
                                {stats.map((s) => (
                                    <div key={s.label} className="text-right">
                                        <p className="text-base font-extrabold text-white tracking-tight">{s.value}</p>
                                        <p className="text-[9px] text-white/40 font-medium uppercase tracking-wider">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats — desktop only, below */}
                        <div className="relative z-10 hidden lg:grid grid-cols-3 gap-3 mt-8 pt-5 border-t border-white/10">
                            {stats.map((s) => (
                                <div key={s.label}>
                                    <p className="text-2xl font-extrabold text-white tracking-tight">{s.value}</p>
                                    <p className="text-[9px] text-white/40 font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Panel — Feature Grid */}
                    <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                                // Hide last 2 on mobile — 4 cards is enough
                                className={`group relative rounded-xl lg:rounded-2xl border border-border/60 bg-card hover:border-border transition-all duration-300 p-3 lg:p-5 flex flex-col gap-2 lg:gap-3 ${i >= 4 ? 'hidden sm:flex' : ''}`}
                            >
                                <feature.icon className="w-4 h-4 lg:w-6 lg:h-6 text-foreground/60 group-hover:text-foreground transition-colors duration-300" strokeWidth={1.5} />
                                <div>
                                    <h3 className="text-[11px] lg:text-sm font-bold text-foreground leading-tight">
                                        {feature.title}
                                    </h3>
                                    {/* Description — hidden on mobile */}
                                    <p className="hidden lg:block text-xs text-muted-foreground mt-0.5 leading-snug">
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-2.5 lg:mt-4 flex items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:py-5 rounded-xl lg:rounded-2xl border border-border/60 bg-card"
                >
                    <p className="text-xs lg:text-sm font-semibold text-foreground">
                        Butuh aki panggilan, setrum, atau jumper?
                        <span className="hidden sm:inline text-muted-foreground font-normal ml-1.5">Antar pasang gratis ke lokasi area Jogja &amp; Bantul.</span>
                    </p>
                    <div className="flex gap-2 shrink-0">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] lg:text-sm active:scale-[0.98] transition-all duration-200"
                        >
                            <FaWhatsapp className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            Chat WA 24 Jam
                            <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                        </a>
                        <Link href="/katalog">
                            <span className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground font-bold text-xs lg:text-sm hover:bg-muted transition-colors duration-200">
                                Katalog
                            </span>
                        </Link>
                    </div>
                </motion.div>

            </div>
        </section>
    )
}