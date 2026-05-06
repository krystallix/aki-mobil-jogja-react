// components/sections/footer.tsx
'use client'

import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { FiFacebook } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { PiTiktokLogo } from 'react-icons/pi';
import { LiaMapSolid } from 'react-icons/lia';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchArticles, type ArticleData } from '@/lib/supabase/queries';

export default function Footer() {
    const [featuredPosts, setFeaturedPosts] = useState<ArticleData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadArticles() {
            try {
                const articles = await fetchArticles({
                    status: 'published',
                    limit: 3
                });

                if (isMounted) {
                    setFeaturedPosts(articles);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load articles:', error);
                if (isMounted) {
                    setFeaturedPosts([]);
                    setIsLoading(false);
                }
            }
        }

        loadArticles();

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency - hanya fetch sekali saat mount

    return (
        <footer className="relative overflow-hidden bg-zinc-50 text-zinc-500 py-8 lg:py-20 border-t border-zinc-200">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(79,70,229,0.04) 0%, transparent 70%)" }} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            <div className="container relative z-10 mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 mb-12 lg:mb-20">

                    {/* LEFT COLUMN - Company Info */}
                    <div className="flex flex-col space-y-8 lg:space-y-12">
                        {/* Logo/Brand */}
                        <div className="flex items-center gap-3 text-zinc-900">
                            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                                <Image src="/logo-light.svg" alt="Logo" width={24} height={24} className="block" />
                            </div>
                            <span className="text-2xl lg:text-3xl font-bold tracking-tighter">Siswanto Aki</span>
                        </div>

                        {/* Alamat */}
                        <div>
                            <h3 className="text-zinc-900 font-bold mb-3 lg:mb-5 text-sm lg:text-base uppercase tracking-widest">Alamat</h3>
                            <div className="flex items-start gap-3 text-zinc-600">
                                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                                <p className="leading-relaxed text-sm lg:text-base">
                                    Kanggotan No. 21, Pleret, Bantul<br />
                                    Yogyakarta 55791
                                </p>
                            </div>
                        </div>

                        {/* Informasi */}
                        <div>
                            <h3 className="text-zinc-900 font-bold mb-3 lg:mb-5 text-sm lg:text-base uppercase tracking-widest">Informasi</h3>
                            <div className="space-y-4 text-zinc-600">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 shrink-0 text-primary" />
                                    <span className="text-sm lg:text-base">081354007400 / 088227968449</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 shrink-0 text-primary" />
                                    <span className="text-sm lg:text-base">info@akimobiljogja.com</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                                    <div className="text-sm lg:text-base">
                                        <p>Senin - Sabtu: 00.00 - 00.00 WIB</p>
                                        <p>Minggu: 00.00 - 00.00 WIB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div>
                            <h3 className="text-zinc-900 font-bold mb-3 lg:mb-5 text-sm lg:text-base uppercase tracking-widest">Sosial Media</h3>
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://www.facebook.com/people/Reparasi-Dan-Tukar-Tambah-Aki-Bp-Siswanto/61551816056838/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook Siswanto Aki"
                                    className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-zinc-600 shadow-sm"
                                >
                                    <FiFacebook size={20} />
                                </a>
                                <a
                                    href="https://www.instagram.com/siswantoaki.jogja"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram Siswanto Aki"
                                    className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-zinc-600 shadow-sm"
                                >
                                    <FaInstagram size={20} />
                                </a>
                                <a
                                    href="https://tiktok.com/@akimobiljogja"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="TikTok Siswanto Aki"
                                    className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-zinc-600 shadow-sm"
                                >
                                    <PiTiktokLogo size={20} />
                                </a>
                                <a
                                    href="https://maps.app.goo.gl/D9CgHvefsKVA3dD1A"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Google Maps Lokasi Siswanto Aki"
                                    className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-zinc-600 shadow-sm"
                                >
                                    <LiaMapSolid size={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Featured Articles */}
                    <div>
                        <h3 className="text-zinc-900 font-bold tracking-widest text-sm mb-6 lg:mb-10 uppercase">Artikel Pilihan</h3>
                        <div className="flex flex-col gap-6 lg:gap-8">
                            {isLoading ? (
                                <p className="text-zinc-400 text-sm">Memuat artikel...</p>
                            ) : featuredPosts.length > 0 ? (
                                featuredPosts.map((post) => {
                                    const category = post.tags?.[0] || 'ARTIKEL';

                                    return (
                                        <Link
                                            key={post.id}
                                            href={`/artikel/${post.slug}`}
                                            className="group flex gap-5 items-center"
                                        >
                                            <div className="relative w-20 h-20 lg:w-28 lg:h-28 shrink-0 rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-sm">
                                                {post.featured_image ? (
                                                    <Image
                                                        src={post.featured_image}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-100" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-2 block">
                                                    {category}
                                                </span>
                                                <h4 className="text-zinc-900 font-bold text-base lg:text-lg leading-tight mb-2 group-hover:text-primary transition-colors tracking-tight">
                                                    {post.title}
                                                </h4>
                                                <p className="text-xs lg:text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                                                    {post.excerpt || 'Baca selengkapnya...'}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="text-zinc-400 text-sm">Belum ada artikel tersedia.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW */}
                <div className="pt-8 lg:pt-12 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] lg:text-xs text-zinc-400 font-medium uppercase tracking-[0.1em]">
                    <p>© {new Date().getFullYear()} Siswanto Aki. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/kebijakan-pengembalian" className="hover:text-zinc-900 transition-colors">Kebijakan Pengembalian</Link>
                        <span className="opacity-20 hidden md:block">|</span>
                        <span>Dibuat oleh{' '}
                            <a
                                href="https://instagram.com/risewise.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-600 hover:text-primary transition-colors underline underline-offset-4 decoration-zinc-200"
                            >
                                risewise.dev
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
