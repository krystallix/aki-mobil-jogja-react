'use client'

import { ArticleData } from '@/lib/supabase/queries';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowLeft, Share2, Phone, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { FaWhatsapp } from 'react-icons/fa';

interface ArticleContentProps {
    article: ArticleData;
    relatedArticles: ArticleData[];
}

export default function ArticleContent({ article, relatedArticles }: ArticleContentProps) {
    const [copied, setCopied] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TiptapImage.configure({
                HTMLAttributes: {
                    class: 'rounded-3xl my-8',
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: article.content,
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg lg:prose-xl max-w-none focus:outline-none',
            },
        },
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return `${Math.ceil(wordCount / wordsPerMinute)} mnt baca`;
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.excerpt || article.title,
                    url: url,
                });
            } catch (err) {}
        } else {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const category = article.tags?.[0] || 'ARTIKEL';

    return (
        <div className="min-h-screen bg-background">
            {/* Immersive Header Section */}
            <div className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <Link
                        href="/artikel"
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all mb-8 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>KEMBALI KE ARTIKEL</span>
                    </Link>

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] lg:text-xs font-bold tracking-widest uppercase border rounded-full border-primary/30 bg-primary/5 text-primary">
                            <span>{category}</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-foreground leading-[1.05]">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-medium text-muted-foreground border-t border-border/50">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-primary" />
                                <span>{formatDate(article.published_at || article.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                <span>{getReadingTime(article.content)}</span>
                            </div>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 hover:text-primary transition-colors"
                            >
                                <Share2 size={16} className="text-primary" />
                                <span>{copied ? 'Link Disalin!' : 'Bagikan'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-6 max-w-7xl pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Left Column - Article Content */}
                    <div className="lg:col-span-8">
                        {/* Featured Image */}
                        {article.featured_image && (
                            <div className="relative w-full aspect-[21/9] rounded-[2rem] lg:rounded-[3rem] overflow-hidden mb-12 border border-border/50">
                                <Image
                                    src={article.featured_image}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-100" />
                            </div>
                        )}

                        <div className="prose prose-lg lg:prose-xl max-w-none 
                            prose-headings:font-extrabold prose-headings:tracking-tighter prose-headings:text-foreground
                            prose-h2:text-3xl lg:prose-h2:text-4xl prose-h2:mt-12
                            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-light
                            prose-strong:text-foreground prose-strong:font-bold
                            prose-img:rounded-3xl prose-img:border prose-img:border-border/50
                            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:font-medium prose-blockquote:text-foreground
                            prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline">
                            <EditorContent editor={editor} />
                        </div>

                        {/* Tags Section */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-16 pt-8 border-t border-border/50">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                    Topik Terkait
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag, idx) => (
                                        <Link
                                            key={idx}
                                            href={`/artikel?tag=${encodeURIComponent(tag)}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border/50 hover:border-primary/50 hover:text-primary rounded-xl text-sm font-bold transition-all"
                                        >
                                            <Tag size={14} />
                                            {tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <aside className="lg:col-span-4 space-y-12">
                        {/* Featured Sidebar CTA */}
                        <div className="relative overflow-hidden bg-card border border-border/50 rounded-[2.5rem] p-8 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <MessageSquare size={24} />
                                </div>
                                <h3 className="text-2xl font-extrabold tracking-tight">
                                    Butuh Konsultasi Aki?
                                </h3>
                                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                                    Tanyakan langsung pada ahlinya mengenai masalah aki kendaraan Anda. Gratis konsultasi via WhatsApp!
                                </p>
                                <a
                                    href="https://wa.me/6281354007400"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-full bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform"
                                >
                                    <FaWhatsapp size={18} />
                                    Chat Sekarang
                                </a>
                            </div>
                        </div>

                        {/* Related Articles */}
                        {relatedArticles.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">
                                    Baca Juga
                                </h3>
                                <div className="space-y-4">
                                    {relatedArticles.slice(0, 3).map((rel) => (
                                        <Link
                                            key={rel.id}
                                            href={`/artikel/${rel.slug}`}
                                            className="flex gap-4 group items-center p-2 rounded-2xl hover:bg-card transition-colors"
                                        >
                                                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
                                                    {rel.featured_image ? (
                                                        <>
                                                            <Image
                                                                src={rel.featured_image}
                                                                alt={rel.title}
                                                                fill
                                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-40" />
                                                        </>
                                                    ) : (
                                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                                        <Tag className="w-6 h-6 text-primary opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                    {rel.title}
                                                </h4>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {rel.tags?.[0] || 'Artikel'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
