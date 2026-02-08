"use client"
import {
    Users,
    Target,
    ShieldCheck,
    Wrench,
    Leaf,
    Heart
} from "lucide-react";
import HomeLayout from "@/components/layouts/home-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";


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
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    const containerStagger = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <HomeLayout>
            <div className="min-h-screen bg-background overflow-hidden">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
                    <motion.div
                        className="container mx-auto px-4 py-16 md:py-24"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="max-w-3xl mx-auto text-center space-y-4">
                            <motion.h1
                                className="text-4xl md:text-5xl font-bold"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                Tentang Kami
                            </motion.h1>
                            <motion.p
                                className="text-lg text-white/90"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                Dari servis aki hingga menjadi solusi terpercaya Anda
                            </motion.p>
                        </div>
                    </motion.div>
                </div>


                {/* Story Section */}
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
                            <motion.div
                                className="space-y-6"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl font-bold">Cerita Kami</h2>

                                <div className="space-y-4 text-muted-foreground leading-relaxed">
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

                            <motion.div
                                className="relative aspect-square rounded-lg overflow-hidden"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <img
                                    src="/about.webp"
                                    alt="Bengkel Servis Aki Kami"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        </div>

                        {/* Mission & Vision */}
                        <motion.div
                            className="grid md:grid-cols-2 gap-6 mb-16"
                            variants={containerStagger}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                        >
                            <motion.div variants={fadeInUp}>
                                <Card>
                                    <CardContent className="p-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <Target className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-bold">Visi Kami</h3>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Menjadi solusi aki terbaik yang mengedepankan keberlanjutan,
                                            kualitas, dan kepercayaan pelanggan di setiap layanan kami.
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <Card>
                                    <CardContent className="p-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <Wrench className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-bold">Misi Kami</h3>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Menyediakan aki bekas berkualitas dan aki baru dengan servis terbaik,
                                            harga kompetitif, serta komitmen menyelamatkan aki yang masih layak pakai.
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-muted/50 py-12">
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
                            variants={containerStagger}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                        >
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="text-center space-y-2"
                                    variants={fadeInUp}
                                >
                                    <div className="text-3xl md:text-4xl font-bold text-primary">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm md:text-base text-muted-foreground">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Values Section */}
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-bold mb-4">Nilai-Nilai Kami</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Prinsip yang kami pegang teguh sejak awal berdiri hingga sekarang
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
                            variants={containerStagger}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                        >
                            {values.map((value, index) => (
                                <motion.div key={index} variants={fadeInUp}>
                                    <Card className="hover:shadow-lg transition-shadow h-full">
                                        <CardContent className="p-6 space-y-3 text-center">
                                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <value.icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-bold">{value.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {value.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-muted/50 py-12 md:py-16 rounded-lg">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                className="text-center mb-12"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-bold mb-4">Perjalanan Kami</h2>
                                <p className="text-muted-foreground">
                                    Dari servis sederhana hingga solusi lengkap kebutuhan aki Anda
                                </p>
                            </motion.div>

                            <div className="space-y-6">
                                {milestones.map((milestone, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex gap-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                                                {milestone.year}
                                            </div>
                                            {index < milestones.length - 1 && (
                                                <div className="w-0.5 h-full bg-primary/20 mt-2"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <Card>
                                                <CardContent className="p-4">
                                                    <p className="text-muted-foreground">{milestone.event}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-none">
                                <CardContent className="p-8 md:p-12 text-center space-y-6">
                                    <Heart className="h-12 w-12 mx-auto animate-pulse" />
                                    <h2 className="text-2xl md:text-3xl font-bold">
                                        Butuh Aki Berkualitas atau Servis Aki?
                                    </h2>
                                    <p className="text-white/90 text-lg">
                                        Kami siap membantu dengan pengalaman lebih dari 2 dekade dalam servis dan penjualan aki
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button
                                            size="lg"
                                            variant="secondary"
                                            onClick={() => window.location.href = '/katalog'}
                                            className="hover:scale-105 transition-transform"
                                        >
                                            Lihat Katalog
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="bg-transparent border-white text-white hover:bg-white hover:text-primary hover:scale-105 transition-transform"
                                            onClick={() => window.location.href = '/kontak'}
                                        >
                                            Hubungi Kami
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}
