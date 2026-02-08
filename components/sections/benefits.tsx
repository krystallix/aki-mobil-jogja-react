import { BatteryFull, Check, Phone, Recycle, ShieldCheck, Truck, Wrench, Zap } from "lucide-react";

export default function BenefitsSection() {
    return (
        <section className="container mx-auto max-w-5xl py-6 md:py-8 mb-10 px-4">
            <div className="flex w-full justify-center py-8 md:py-10">
                <h1 className="font-extralight leading-tight text-3xl md:text-5xl text-center">
                    Kenapa Harus Memilih Kami?
                </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 lg:gap-20">
                <div className="flex flex-col gap-3 lg:gap-4 items-center justify-center text-center">
                    <ShieldCheck className="size-8 lg:size-10 text-primary" />
                    <span className="text-sm lg:text-lg font-semibold">Garansi Resmi</span>
                </div>
                <div className="flex flex-col gap-3 lg:gap-4 items-center justify-center text-center">
                    <Check className="size-8 lg:size-10 text-primary" />
                    <span className="text-sm lg:text-lg font-semibold">Pengecekan Kualitas</span>
                </div>
                <div className="flex flex-col gap-3 lg:gap-4 items-center justify-center text-center">
                    <Phone className="size-8 lg:size-10 text-primary" />
                    <span className="text-sm lg:text-lg font-semibold">Konsultasi Gratis</span>
                </div>
                <div className="flex flex-col gap-3 lg:gap-4 items-center justify-center text-center">
                    <Truck className="size-8 lg:size-10 text-primary" />
                    <span className="text-sm lg:text-lg font-semibold">Gratis Pengiriman</span>
                </div>
                <div className="flex flex-col gap-3 lg:gap-4 items-center justify-center text-center">
                    <Wrench className="size-8 lg:size-10 text-primary" />
                    <span className="text-sm lg:text-lg font-semibold">Gratis Pasang</span>
                </div>
                <div className="flex flex-col gap-3 lg:gap-4 items-center justify-center text-center">
                    <Zap className="size-8 lg:size-10 text-primary" />
                    <span className="text-sm lg:text-lg font-semibold">Tahan Lama</span>
                </div>
                <div className="flex flex-col gap-3 lg:gap-4 items-center justify-center text-center">
                    <BatteryFull className="size-8 lg:size-10 text-primary" />
                    <span className="text-sm lg:text-lg font-semibold">Daya Penuh</span>
                </div>
                <div className="flex flex-col gap-3 lg:gap-4 items-center justify-center text-center">
                    <Recycle className="size-8 lg:size-10 text-primary" />
                    <span className="text-sm lg:text-lg font-semibold">Tukar Tambah</span>
                </div>
            </div>
        </section>
    )
}