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
        <footer className="bg-background text-muted-foreground py-8 lg:py-16 border-t border-border">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 mb-8 lg:mb-16">

                    {/* LEFT COLUMN - Company Info */}
                    <div className="flex flex-col space-y-6 lg:space-y-10">
                        {/* Logo/Brand */}
                        <div className="flex items-center gap-3 text-foreground">
                            <div className="bg-primary p-2 rounded-lg">
                                <Image src="/logo-light.svg" alt="Logo" width={24} height={24} className="block" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Aki Mobil Jogja</span>
                        </div>

                        {/* Alamat */}
                        <div>
                            <h3 className="text-foreground font-semibold mb-2 lg:mb-4 text-base lg:text-lg">Alamat</h3>
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                    Kanggotan No. 21, Pleret, Bantul<br />
                                    Yogyakarta 55791
                                </p>
                            </div>
                        </div>

                        {/* Informasi */}
                        <div>
                            <h3 className="text-foreground font-semibold mb-2 lg:mb-4 text-base lg:text-lg">Informasi</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 shrink-0" />
                                    <span>081354007400 / 088227968449</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 shrink-0" />
                                    <span>info@akimobiljogja.com</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <p>Senin - Sabtu: 08.00 - 21.00 WIB</p>
                                        <p>Minggu: 10.00 - 21.00 WIB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div>
                            <h3 className="text-foreground font-semibold mb-2 lg:mb-4 text-base lg:text-lg">Sosial Media</h3>
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://www.facebook.com/people/Reparasi-Dan-Tukar-Tambah-Aki-Bp-Siswanto/61551816056838/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook Aki Mobil Jogja"
                                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-foreground"
                                >
                                    <FiFacebook size={18} />
                                </a>
                                <a
                                    href="https://www.instagram.com/akimobiljogja_"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram Aki Mobil Jogja"
                                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-foreground"
                                >
                                    <FaInstagram size={18} />
                                </a>
                                <a
                                    href="https://tiktok.com/@akimobiljogja"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="TikTok Aki Mobil Jogja"
                                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors font-bold text-sm text-foreground"
                                >
                                    <PiTiktokLogo size={18} />
                                </a>
                                <a
                                    href="https://maps.app.goo.gl/D9CgHvefsKVA3dD1A"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Google Maps Lokasi Aki Mobil Jogja"
                                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-foreground"
                                >
                                    <LiaMapSolid size={18} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Featured Articles */}
                    <div>
                        <h3 className="text-foreground font-bold tracking-widest text-sm mb-4 lg:mb-8 uppercase">Artikel Pilihan</h3>
                        <div className="flex flex-col gap-4 lg:gap-6">
                            {isLoading ? (
                                <p className="text-muted-foreground text-sm">Memuat artikel...</p>
                            ) : featuredPosts.length > 0 ? (
                                featuredPosts.map((post) => {
                                    const category = post.tags?.[0] || 'ARTIKEL';

                                    return (
                                        <Link
                                            key={post.id}
                                            href={`/artikel/${post.slug}`}
                                            className="group flex gap-5 items-start"
                                        >
                                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/50">
                                                {post.featured_image ? (
                                                    <Image
                                                        src={post.featured_image}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-muted/50 rounded-xl" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1 block">
                                                    {category}
                                                </span>
                                                <h4 className="text-foreground font-bold text-sm sm:text-base leading-snug mb-2 group-hover:text-primary transition-colors">
                                                    {post.title}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                                    {post.excerpt || 'Baca selengkapnya...'}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="text-muted-foreground text-sm">Belum ada artikel tersedia.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW */}
                <div className="pt-6 lg:pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Aki Mobil Jogja. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <Link href="/kebijakan-pengembalian" className="hover:text-foreground transition-colors">Kebijakan Pengembalian</Link>
                        <span>·</span>
                        <span>dibuat dan didesain oleh{' '}
                            <a
                                href="https://instagram.com/risewise.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground hover:text-primary transition-colors underline underline-offset-2"
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
