"use client"
import {
    Users,
    Target,
    ShieldCheck,
    Wrench,
    Heart,
    ArrowRight,
    History,
    Sparkles,
    Leaf
} from "lucide-react";
import HomeLayout from "@/components/layouts/home-layout";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import JsonLd from "@/components/json-ld";
import Link from "next/link";
import Image from "next/image";

export default function TentangKamiPage() {
    const values = [
        {
            icon: Wrench,
            title: "Keahlian Servis",
            description: "Dimulai dari servis aki sejak 2000, keahlian teknis adalah fondasi kami"
        },
        {
            icon: Leaf,
            title: "Berkelanjutan",
            description: "Kami percaya tidak ada yang harus terbuang, setiap aki bisa diselamatkan"
        },
        {
            icon: ShieldCheck,
            title: "Kualitas Terjamin",
            description: "Aki bekas maupun baru telah melalui quality control ketat"
        },
        {
            icon: Users,
            title: "Kepercayaan Pelanggan",
            description: "Lebih dari 2 dekade membangun kepercayaan melalui kualitas dan kejujuran"
        }
    ];

    const milestones = [
        { year: "2000", event: "Memulai usaha dari servis aki yang masih bisa diselamatkan" },
        { year: "2001", event: "Mulai menjual aki bekas berkualitas hasil servis sendiri" },
        { year: "2010", event: "Menambah stok aki baru untuk melengkapi kebutuhan pelanggan" },
        { year: "2015", event: "Memperluas jaringan dan meningkatkan kapasitas servis" },
        { year: "2026", event: "Tetap setia pada prinsip awal dengan pelayanan yang lebih baik" }
    ];

    const stats = [
        { number: "26+", label: "Tahun Pengalaman" },
        { number: "Ribuan", label: "Aki Terselamatkan" },
        { number: "2 Dekade", label: "Berdiri" },
        { number: "100%", label: "Komitmen Kualitas" }
    ];

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    };



    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'Tentang Kami',
        description: 'Kami adalah bengkel dan toko aki mobil terpercaya di Jogja sejak 2000.',
        url: 'https://akimobiljogja.com/tentang-kami'
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://akimobiljogja.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Tentang Kami',
                item: 'https://akimobiljogja.com/tentang-kami'
            }
        ]
    };

    return (
        <HomeLayout>
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <div className="min-h-screen bg-background overflow-hidden pb-12 lg:pb-20">

                {/* Hero Section - Matching Home Style */}
                <section className="pt-6 lg:pt-10">
                    <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                            className="relative rounded-2xl lg:rounded-3xl overflow-hidden min-h-[280px] lg:min-h-[400px] flex items-center bg-linear-to-br from-indigo-950 via-indigo-900 to-indigo-800"
                        >
                            {/* Decorative Background */}
                            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 65%)" }} />
                            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                            <div className="relative z-10 w-full px-6 py-12 lg:px-20 lg:py-20 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <p className="text-[10px] lg:text-[12px] font-bold tracking-[0.2em] uppercase text-white/50 mb-3 lg:mb-5">
                                        Perjalanan & Visi
                                    </p>
                                    <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.05] mb-6">
                                        Tentang Kami
                                    </h1>
                                    <p className="text-base lg:text-xl text-white/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                        Dari servis aki hingga menjadi solusi terpercaya Anda. Membangun kepercayaan melalui kualitas dan kejujuran selama lebih dari dua dekade.
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Story Section - Bento Style */}
                <section className="py-12 lg:py-20">
                    <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">

                            {/* Main Story Panel */}
                            <motion.div
                                {...fadeInUp}
                                className="lg:col-span-3 bg-card border border-border/60 rounded-2xl lg:rounded-3xl p-6 lg:p-10"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <History className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight">Cerita Kami</h2>
                                </div>

                                <div className="space-y-6 text-muted-foreground leading-relaxed text-sm lg:text-base">
                                    <p>
                                        Perjalanan kami dimulai pada tahun 2000 dengan keyakinan sederhana bahwa tidak ada yang harus terbuang percuma. Alih-alih langsung terjun ke dunia perdagangan, kami memulai dari yang paling dasar, yaitu servis aki.
                                    </p>
                                    <p>
                                        Waktu itu, banyak aki dibuang begitu saja padahal masih bisa diselamatkan. Kami melihat peluang di sana. Dengan keahlian teknis dan ketekunan, kami memperbaiki aki-aki tersebut dan menjualnya sebagai aki bekas berkualitas. Respon pasar sangat positif dan dari sinilah fondasi bisnis kami terbangun.
                                    </p>
                                    <p>
                                        Seiring waktu, kami mulai menyediakan stok aki baru untuk melengkapi kebutuhan pelanggan. Lebih dari dua dekade kemudian, kami tetap setia pada prinsip awal, memberikan solusi terbaik dengan kualitas terjamin dan harga kompetitif.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Image Panel */}
                            <motion.div
                                {...fadeInUp}
                                transition={{ delay: 0.1, duration: 0.5 }}
                                className="lg:col-span-2 relative aspect-4/3 lg:aspect-auto rounded-2xl lg:rounded-3xl overflow-hidden group border border-border/60"
                            >
                                <Image
                                    src="/about.webp"
                                    alt="Bengkel Servis Aki Kami"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Workshop</p>
                                    <p className="text-lg font-bold">Bengkel Servis Aki Kami</p>
                                </div>
                            </motion.div>

                            {/* Stats Integrated Bento */}
                            <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                                {stats.map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        className="bg-card border border-border/60 rounded-xl lg:rounded-2xl p-6 text-center lg:text-left hover:border-primary/30 transition-colors group"
                                    >
                                        <p className="text-3xl lg:text-4xl font-extrabold text-primary tracking-tighter mb-1 group-hover:scale-110 transition-transform origin-left">
                                            {stat.number}
                                        </p>
                                        <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            {stat.label}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visi Misi Section */}
                <section className="py-12 lg:py-20 bg-muted/30">
                    <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
                        <div className="grid md:grid-cols-2 gap-6">
                            <motion.div {...fadeInUp}>
                                <Card className="border-none shadow-none bg-card/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl overflow-hidden group">
                                    <CardContent className="p-8 lg:p-12 relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                            <Target className="w-40 h-40" />
                                        </div>
                                        <div className="relative z-10 space-y-4">
                                            <div className="p-3 bg-indigo-500/10 rounded-xl w-fit">
                                                <Target className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Visi Kami</h3>
                                            <p className="text-muted-foreground leading-relaxed lg:text-lg">
                                                Menjadi solusi aki terbaik yang mengedepankan keberlanjutan,
                                                kualitas, dan kepercayaan pelanggan di setiap layanan kami.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                                <Card className="border-none shadow-none bg-card/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl overflow-hidden group">
                                    <CardContent className="p-8 lg:p-12 relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                            <Sparkles className="w-40 h-40" />
                                        </div>
                                        <div className="relative z-10 space-y-4">
                                            <div className="p-3 bg-amber-500/10 rounded-xl w-fit">
                                                <Sparkles className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Misi Kami</h3>
                                            <p className="text-muted-foreground leading-relaxed lg:text-lg">
                                                Menyediakan aki bekas berkualitas dan aki baru dengan servis terbaik,
                                                harga kompetitif, serta komitmen menyelamatkan aki yang masih layak pakai.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-12 lg:py-24">
                    <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
                        <motion.div
                            {...fadeInUp}
                            className="text-center mb-12 lg:mb-16"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Core Values</p>
                            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4">Nilai-Nilai Kami</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto lg:text-lg">
                                Prinsip yang kami pegang teguh sejak awal berdiri hingga sekarang
                            </p>
                        </motion.div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            {values.map((value, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className="group relative rounded-2xl border border-border/60 bg-card hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 p-6 lg:p-8"
                                >
                                    <div className="mb-5 p-3 bg-muted rounded-xl w-fit group-hover:bg-primary/10 transition-colors">
                                        <value.icon className="h-6 w-6 text-foreground/70 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{value.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline Section - Professional Industrial Style */}
                <section className="py-12 lg:py-24 bg-zinc-950 text-white rounded-[2rem] lg:rounded-[3.5rem] mx-4 lg:mx-6">
                    <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
                        <motion.div
                            {...fadeInUp}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4">Perjalanan Kami</h2>
                            <p className="text-white/50 lg:text-lg">
                                Dari servis sederhana hingga solusi lengkap kebutuhan aki Anda
                            </p>
                        </motion.div>

                        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-white/20 before:to-transparent">
                            {milestones.map((milestone, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                                >
                                    {/* Icon/Dot */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-zinc-900 text-white font-bold text-xs shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:border-primary group-hover:bg-primary">
                                        {milestone.year.slice(2)}
                                    </div>
                                    {/* Content */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm group-hover:bg-white/[0.08] transition-colors">
                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                            <div className="font-bold text-primary">{milestone.year}</div>
                                        </div>
                                        <div className="text-white/60 text-sm leading-relaxed">{milestone.event}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section - Integrated style */}
                <section className="pt-20 lg:pt-32">
                    <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-indigo-800 p-8 lg:p-16 text-center"
                        >
                            {/* Decorative background for CTA */}
                            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
                            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, rgba(165,180,252,0.15) 0%, transparent 70%)" }} />

                            <div className="relative z-10 space-y-8">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center"
                                >
                                    <Heart className="h-8 w-8 text-white fill-white/20" />
                                </motion.div>

                                <div className="space-y-4">
                                    <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                                        Butuh Aki Berkualitas<br />atau Servis Aki?
                                    </h2>
                                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                                        Kami siap membantu dengan pengalaman lebih dari 2 dekade dalam servis dan penjualan aki. Konsultasi gratis untuk semua jenis kendaraan.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <Link href="/katalog" className="w-full sm:w-auto">
                                        <span className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-indigo-950 font-bold text-sm lg:text-base hover:bg-white/90 active:scale-95 transition-all w-full shadow-xl shadow-black/10">
                                            Lihat Katalog
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </Link>
                                    <Link href="https://wa.me/6281354007400" target="_blank" className="w-full sm:w-auto">
                                        <span className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-bold text-sm lg:text-base hover:bg-white/10 active:scale-95 transition-all w-full backdrop-blur-sm">
                                            Hubungi Kami
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

            </div>
        </HomeLayout>
    );
}

