import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Check, Clock, CreditCard, ShieldCheck, Truck, Wrench } from "lucide-react"

export default function FaqSections() {
    return (
        <div className="w-full max-w-[900px] mx-auto px-4 mb-10">
            <div className="flex w-full justify-center py-8 md:py-10">
                <h2 className="font-extralight leading-tight text-3xl md:text-5xl text-center">
                    Frequently Asked Questions
                </h2>
            </div>
            <Accordion
                type="single"
                collapsible
                className="w-full bg-white border border-gray-200 rounded-lg  shadow-sm"
            >
                <AccordionItem value="pasang" className="border-b border-gray-100 px-6">
                    <AccordionTrigger className="py-4 hover:no-underline text-lg text-left  flex items-center gap-4">
                        <div className="p-2 border rounded-md">
                            <Wrench className="size-5 text-gray-500" />
                        </div>
                        Beli aki di sini dipasangin gratis gak?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base p-4">
                        Gratis dong! Kita pasangin langsung di tempat. Bahkan kalau mau, bisa kita anterin sekalian pasang ke lokasi kamu. Jadi tinggal duduk manis aja, teknisi kita yang ngerjain sampai mobilmu siap jalan lagi.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="garansi" className="border-b border-gray-100 px-6">
                    <AccordionTrigger className="py-4 hover:no-underline text-lg text-left  flex items-center gap-4">
                        <div className="p-2 border rounded-md">
                            <ShieldCheck className="size-5 text-gray-500" />
                        </div>
                        Ada garansi berapa lama ya?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base pb-4">
                        Semua aki di sini bergaransi kok, mulai dari 1 bulan sampai 12 bulan tergantung merek dan tipenya. Garansi berlaku selama aki masih dalam kondisi normal pemakaian.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="buka" className="border-b border-gray-100 px-6">
                    <AccordionTrigger className="py-4 hover:no-underline text-lg text-left  flex items-center gap-4">
                        <div className="p-2 border rounded-md">
                            <Clock className="size-5 text-gray-500" />
                        </div>
                        Tokonya buka jam berapa aja?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base p-4">
                        Kita buka setiap hari dari jam 7 pagi sampai 9 malam. Kalau ada darurat malam hari, bisa hubungi nomor WhatsApp kita, biasanya masih bisa dilayani asal di area jangkauan. Hari libur tetap buka normal kok!
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="antar" className="border-b border-gray-100 px-6">
                    <AccordionTrigger className="py-4 hover:no-underline text-lg text-left  flex items-center gap-4">
                        <div className="p-2 border rounded-md">
                            <Truck className="size-5 text-gray-500" />
                        </div>
                        Kalau motor/mobil saya mogok di jalan, bisa diantar?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base p-4">
                        Bisa banget! Langsung aja telepon atau WA ke nomor kita, kasih tau lokasi kamu di mana. Teknisi kita siap berangkat bawa aki yang pas buat kendaraan kamu, langsung pasang di lokasi. Layanan antar pasang ini gratis ya, gak ada charge tambahan.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cek" className="border-b border-gray-100 px-6">
                    <AccordionTrigger className="py-4 hover:no-underline text-lg text-left  flex items-center gap-4">
                        <div className="p-2 border rounded-md">
                            <Check className="size-5 text-gray-500" />
                        </div>
                        Bisa minta cek kondisi aki dulu sebelum beli?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base p-4">
                        Bisa dong, malah kita saranin dicek dulu. Kita punya alat tester buat ngecek tegangan dan kondisi aki kamu. Gratis kok pemeriksaannya. Jadi kamu bisa tau pasti apakah aki emang harus ganti atau cuma perlu di-charge aja.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="bayar" className="px-6">
                    <AccordionTrigger className="py-4 hover:no-underline text-lg text-left  flex items-center gap-4">
                        <div className="p-2 border rounded-md">
                            <CreditCard className="size-5 text-gray-500" />
                        </div>
                        Pembayarannya gimana? Bisa transfer atau cash?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base p-4">
                        Fleksibel! Bisa cash langsung atau transfer bank. Kalau pesan antar pasang, nanti bayarnya pas teknisi datang setelah pemasangan selesai dan mobilmu udah nyala. Tinggal pilih mana yang lebih nyaman buat kamu.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
