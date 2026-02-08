'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaWhatsapp } from 'react-icons/fa'
import { motion } from 'framer-motion'

const navItems = [
    { href: '/', label: 'Home' },
    { href: '/katalog', label: 'Katalog' },
    { href: '/artikel', label: 'Artikel' },
    { href: '/tentang-kami', label: 'Tentang Kami' },
]

export default function MainNav() {
    const whatsappNumber = '6281234567890' // Ganti dengan nomor WhatsApp Anda
    const whatsappMessage = 'Halo, saya ingin konsultasi tentang aki mobil'
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

    return (
        <div className="hidden md:flex md:justify-between md:items-center flex-1">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Logo" width={30} height={30} className="block" />
                <span className="font-bold text-xl leading-none tracking-tight">
                    Aki Mobil Jogja
                </span>
            </Link>

            <nav className="flex gap-6 absolute left-1/2 -translate-x-1/2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm font-medium hover:text-primary transition-colors"
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>


            <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
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
    )
}
