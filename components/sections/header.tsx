'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FaWhatsapp } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
    { href: '/', label: 'Home' },
    { href: '/katalog', label: 'Katalog' },
    { href: '/artikel', label: 'Artikel' },
    { href: '/rekomendasi-aki', label: 'Rekomendasi Aki' },
    { href: '/tentang-kami', label: 'Tentang Kami' },
]

export default function SiteHeader() {
    const [isOpen, setIsOpen] = React.useState(false)
    const pathname = usePathname()

    const whatsappNumber = '6281354007400'
    const whatsappMessage = 'Halo, saya ingin konsultasi tentang aki mobil'
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

    // Prevent scroll when mobile menu is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <>
            <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 md:px-8 pointer-events-none">
                <nav className={`relative w-full max-w-5xl rounded-full transition-all duration-500 pointer-events-auto ${isOpen ? 'border-transparent shadow-none bg-transparent backdrop-blur-none' : 'border border-border/40 backdrop-blur-xl shadow-lg bg-background/60'}`}>
                    <div className="flex items-center justify-between px-6 py-3">
                        {/* Logo */}
                        <Link href="/" className={`flex items-center gap-2 group transition-opacity duration-300 ${isOpen ? 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'opacity-100'}`} onClick={() => setIsOpen(false)}>
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-105 transition-transform shadow-none">
                                <Image src="/logo-light.svg" alt="Logo" width={16} height={16} className="block" />
                            </div>
                            <span className="font-bold tracking-tight text-foreground text-lg">
                                Siswanto Aki
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-6">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Desktop CTA */}
                        <div className="hidden md:flex items-center">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-full transition-all hover:scale-105 shadow-none"
                            >
                                <FaWhatsapp className="w-4 h-4" />
                                Konsultasi Gratis
                            </a>
                        </div>

                        {/* Mobile Toggle Animated Hamburger */}
                        <button
                            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors z-50 ml-auto"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                        >
                            <motion.div 
                                className="relative w-5 h-[18px]"
                                animate={isOpen ? "open" : "closed"}
                            >
                                <motion.span
                                    className="absolute left-0 top-0 w-5 h-0.5 bg-foreground rounded-full"
                                    variants={{
                                        closed: { rotate: 0, y: 0 },
                                        open: { rotate: 45, y: 8 },
                                    }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                                <motion.span
                                    className="absolute left-0 top-[8px] w-5 h-0.5 bg-foreground rounded-full"
                                    variants={{
                                        closed: { opacity: 1, x: 0 },
                                        open: { opacity: 0, x: 10 },
                                    }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                                <motion.span
                                    className="absolute left-0 top-[16px] w-5 h-0.5 bg-foreground rounded-full"
                                    variants={{
                                        closed: { rotate: 0, y: 0 },
                                        open: { rotate: -45, y: -8 },
                                    }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                            </motion.div>
                        </button>
                    </div>
                </nav>
            </header>

            {/* Full Screen Mobile Overlay with Framer Motion */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-40 bg-background flex flex-col md:hidden pt-28 pb-8 px-8"
                    >
                        <div className="flex flex-col flex-1 gap-8 overflow-y-auto">
                            {navItems.map((item, index) => {
                                const isActive = pathname === item.href
                                return (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.4, delay: 0.1 + index * 0.1, ease: "easeOut" }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`block text-4xl sm:text-5xl font-bold tracking-tighter transition-colors ${isActive ? 'text-primary' : 'text-foreground hover:text-primary'
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                            className="mt-auto pt-8"
                        >
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-3 w-full py-5 text-center text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-full shadow-none hover:scale-[1.02] transition-all"
                            >
                                <FaWhatsapp className="w-6 h-6" />
                                Konsultasi Gratis
                            </a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
