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
        <footer className="bg-primary text-gray-300">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* LEFT SIDE */}
                    <div>
                        <div className="flex gap-2">
                            <img src="/logo-light.svg" alt="Logo" className="size-8" />
                            <h3 className="text-white text-2xl font-bold mb-8">
                                Aki Mobil Jogja
                            </h3>
                        </div>

                        {/* Alamat */}
                        <div className="mb-8">
                            <h4 className="text-white text-lg font-semibold mb-4">Alamat</h4>
                            <div className="flex items-start gap-3 text-gray-400">
                                <MapPin size={20} className="flex-shrink-0 mt-1" />
                                <span>
                                    Kanggotan No. 21, Pleret, Bantul<br />
                                    Yogyakarta 55791
                                </span>
                            </div>
                        </div>

                        {/* Informasi */}
                        <div className="mb-8">
                            <h4 className="text-white text-lg font-semibold mb-4">Informasi</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Phone size={20} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-400">81354007400 / 088227968449</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={20} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-400">info@akimobiljogja.com</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                                    <div className="text-gray-400">
                                        <p>Senin - Sabtu: 08.00 - 21.00 WIB</p>
                                        <p>Minggu: 10.00 - 21.00 WIB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div>
                            <h4 className="text-white text-lg font-semibold mb-4">Sosial Media</h4>
                            <div className="flex gap-4">
                                <a
                                    href="https://www.facebook.com/people/Reparasi-Dan-Tukar-Tambah-Aki-Bp-Siswanto/61551816056838/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook Aki Mobil Jogja"
                                    className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                                >
                                    <FiFacebook size={20} />
                                </a>
                                <a
                                    href="https://www.instagram.com/akimobiljogja_"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram Aki Mobil Jogja"
                                    className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                                >
                                    <FaInstagram size={20} />
                                </a>
                                <a
                                    href="https://tiktok.com/@akimobiljogja"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="TikTok Aki Mobil Jogja"
                                    className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                                >
                                    <PiTiktokLogo size={20} />
                                </a>
                                <a
                                    href="https://maps.app.goo.gl/D9CgHvefsKVA3dD1A"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Google Maps Lokasi Aki Mobil Jogja"
                                    className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                                >
                                    <LiaMapSolid size={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE - FEATURED POSTS */}
                    <div>
                        <h3 className="text-white text-lg font-semibold mb-8 tracking-wide">
                            ARTIKEL PILIHAN
                        </h3>
                        <div className="space-y-8">
                            {isLoading ? (
                                <p className="text-gray-500 text-sm">Memuat artikel...</p>
                            ) : featuredPosts.length > 0 ? (
                                featuredPosts.map((post) => {
                                    const category = post.tags?.[0] || 'ARTIKEL';
                                    const bgColor = category.toLowerCase().includes('tips')
                                        ? 'bg-blue-100'
                                        : category.toLowerCase().includes('promo')
                                            ? 'bg-orange-100'
                                            : 'bg-green-100';

                                    return (
                                        <Link
                                            key={post.id}
                                            href={`/artikel/${post.slug}`}
                                            className="group cursor-pointer block"
                                        >
                                            <div className="flex gap-4">
                                                <div className={`${bgColor} rounded-lg flex-shrink-0 w-28 h-28 flex items-center justify-center overflow-hidden relative`}>
                                                    {post.featured_image ? (
                                                        <Image
                                                            src={post.featured_image}
                                                            alt={post.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-white/20 rounded-full"></div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                                                        {category}
                                                    </p>
                                                    <h4 className="text-white text-base font-semibold mb-2 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                                        {post.title}
                                                    </h4>
                                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                                                        {post.excerpt || 'Baca selengkapnya...'}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-sm">Belum ada artikel tersedia.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} Aki Mobil Jogja. All rights reserved.
                        </p>
                        <div className="flex gap-1 text-sm">
                            <span className="text-gray-500">dibuat dan didesain oleh</span>
                            <a
                                href="https://instagram.com/risewise.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 underline hover:text-pink-600 transition-colors"
                            >
                                risewise.dev
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
