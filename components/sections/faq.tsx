import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Check, Clock, CreditCard, ShieldCheck, Truck, Wrench } from "lucide-react"

export default function FaqSections() {
    return (
        <section className="py-12 lg:py-20 bg-card/20 border-t border-border/50">
            <div className="container mx-auto max-w-[900px] px-4">
                <div className="flex w-full justify-center py-8 md:py-10">
                    <div className="text-center">
                        <h2 className="font-extrabold tracking-tight leading-tight text-3xl md:text-5xl text-foreground mb-3">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-sm text-muted-foreground font-light">
                            Pertanyaan yang sering ditanyakan pelanggan kami.
                        </p>
                    </div>
                </div>
                <Accordion
                    type="single"
                    collapsible
                    className="w-full bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden"
                >
                    <AccordionItem value="pasang" className="border-b border-border/50 px-6">
                        <AccordionTrigger className="py-4 hover:no-underline text-base lg:text-lg text-left flex items-center gap-4 text-foreground hover:text-primary transition-colors">
                            <div className="p-2 border border-border/50 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
                                <Wrench className="size-4 lg:size-5" />
                            </div>
                            Beli aki di sini dipasangin gratis gak?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base p-4 leading-relaxed">
                            Gratis dong! Kita pasangin langsung di tempat. Bahkan kalau mau, bisa kita anterin sekalian pasang ke lokasi kamu. Jadi tinggal duduk manis aja, teknisi kita yang ngerjain sampai mobilmu siap jalan lagi.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="garansi" className="border-b border-border/50 px-6">
                        <AccordionTrigger className="py-4 hover:no-underline text-base lg:text-lg text-left flex items-center gap-4 text-foreground hover:text-primary transition-colors">
                            <div className="p-2 border border-border/50 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
                                <ShieldCheck className="size-4 lg:size-5" />
                            </div>
                            Ada garansi berapa lama ya?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base pb-4 leading-relaxed">
                            Semua aki di sini bergaransi kok, mulai dari 1 bulan sampai 12 bulan tergantung merek dan tipenya. Garansi berlaku selama aki masih dalam kondisi normal pemakaian.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="buka" className="border-b border-border/50 px-6">
                        <AccordionTrigger className="py-4 hover:no-underline text-base lg:text-lg text-left flex items-center gap-4 text-foreground hover:text-primary transition-colors">
                            <div className="p-2 border border-border/50 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
                                <Clock className="size-4 lg:size-5" />
                            </div>
                            Tokonya buka jam berapa aja?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base p-4 leading-relaxed">
                            Kita buka setiap hari dari jam 7 pagi sampai 9 malam. Kalau ada darurat malam hari, bisa hubungi nomor WhatsApp kita, biasanya masih bisa dilayani asal di area jangkauan. Hari libur tetap buka normal kok!
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="antar" className="border-b border-border/50 px-6">
                        <AccordionTrigger className="py-4 hover:no-underline text-base lg:text-lg text-left flex items-center gap-4 text-foreground hover:text-primary transition-colors">
                            <div className="p-2 border border-border/50 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
                                <Truck className="size-4 lg:size-5" />
                            </div>
                            Kalau motor/mobil saya mogok di jalan, bisa diantar?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base p-4 leading-relaxed">
                            Bisa banget! Langsung aja telepon atau WA ke nomor kita, kasih tau lokasi kamu di mana. Teknisi kita siap berangkat bawa aki yang pas buat kendaraan kamu, langsung pasang di lokasi. Layanan antar pasang ini gratis ya, gak ada charge tambahan.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cek" className="border-b border-border/50 px-6">
                        <AccordionTrigger className="py-4 hover:no-underline text-base lg:text-lg text-left flex items-center gap-4 text-foreground hover:text-primary transition-colors">
                            <div className="p-2 border border-border/50 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
                                <Check className="size-4 lg:size-5" />
                            </div>
                            Bisa minta cek kondisi aki dulu sebelum beli?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base p-4 leading-relaxed">
                            Bisa dong, malah kita saranin dicek dulu. Kita punya alat tester buat ngecek tegangan dan kondisi aki kamu. Gratis kok pemeriksaannya. Jadi kamu bisa tau pasti apakah aki emang harus ganti atau cuma perlu di-charge aja.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="bayar" className="px-6">
                        <AccordionTrigger className="py-4 hover:no-underline text-base lg:text-lg text-left flex items-center gap-4 text-foreground hover:text-primary transition-colors">
                            <div className="p-2 border border-border/50 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
                                <CreditCard className="size-4 lg:size-5" />
                            </div>
                            Pembayarannya gimana? Bisa transfer atau cash?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base p-4 leading-relaxed">
                            Fleksibel! Bisa cash langsung atau transfer bank. Kalau pesan antar pasang, nanti bayarnya pas teknisi datang setelah pemasangan selesai dan mobilmu udah nyala. Tinggal pilih mana yang lebih nyaman buat kamu.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}
