import { BatteryFull, Check, MessageCircle, Recycle, ShieldCheck, Truck, Wrench, Zap } from "lucide-react";

const features = [
    { icon: ShieldCheck, title: "Garansi Resmi" },
    { icon: Check, title: "Pengecekan Kualitas" },
    { icon: MessageCircle, title: "Konsultasi Gratis" },
    { icon: Truck, title: "Gratis Pengiriman" },
    { icon: Wrench, title: "Gratis Pasang" },
    { icon: Zap, title: "Tahan Lama" },
    { icon: BatteryFull, title: "Daya Penuh" },
    { icon: Recycle, title: "Tukar Tambah" },
];

export default function BenefitsSection() {
    return (
        <section className="py-12 lg:py-20 bg-background">
            <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
                <div className="mb-8 lg:mb-10 text-center max-w-3xl mx-auto">
                    <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-2 lg:mb-3">
                        Kenapa Harus Memilih Kami?
                    </h2>
                    <p className="text-xs lg:text-base text-muted-foreground font-light">
                        Pelayanan premium dan produk berkualitas tinggi adalah komitmen utama kami.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden flex flex-col items-center text-center p-3 lg:p-5 rounded-xl lg:rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 ease-out group cursor-pointer"
                        >
                            {/* Interactive background glow */}
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 p-2 lg:p-3 rounded-lg bg-primary/10 mb-2 lg:mb-3 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500 ease-out text-primary shadow-sm group-hover:shadow-md group-hover:shadow-primary/30">
                                <feature.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                            </div>
                            <h3 className="relative z-10 text-[10px] lg:text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-500">
                                {feature.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}