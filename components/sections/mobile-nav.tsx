'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const navItems = [
    { href: '/', label: 'Home' },
    { href: '/katalog', label: 'Katalog' },
    { href: '/artikel', label: 'Artikel' },
    { href: '/tentang-kami', label: 'Tentang Kami' },
]

export default function MobileNav() {
    const [open, setOpen] = useState(false)

    const whatsappNumber = '6281354007400'
    const whatsappMessage = 'Halo, saya ingin konsultasi tentang aki mobil'
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

    return (
        <div className="md:hidden flex items-center gap-3">


            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Toggle Navigation Menu">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <div className="flex flex-col gap-6 mt-8 p-4">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image src="/logo.svg" alt="Logo" width={30} height={30} />
                            <span className="font-bold text-xl">Aki Mobil Jogja</span>
                        </Link>

                        <nav className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="text-lg font-medium hover:text-primary transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <motion.a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            <motion.div
                                whileHover={{ rotate: 15 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                                <FaWhatsapp className="w-5 h-5" />
                            </motion.div>
                            Konsultasi Gratis
                        </motion.a>
                    </div>
                </SheetContent>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Logo" width={30} height={30} className="block" />
                    <span className="font-bold text-xl leading-none tracking-tight">
                        Aki Mobil Jogja
                    </span>
                </Link>
            </Sheet>
        </div>
    )
}