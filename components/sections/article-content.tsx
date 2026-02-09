'use client'

import { ArticleData } from '@/lib/supabase/queries';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { createClient } from '@/lib/supabase/client';

interface ArticleContentProps {
    article: ArticleData;
    relatedArticles: ArticleData[];
}

export default function ArticleContent({ article, relatedArticles }: ArticleContentProps) {
    const [copied, setCopied] = useState(false);

    // Inisialisasi editor dalam mode read-only
    const editor = useEditor({
        extensions: [
            StarterKit,
            TiptapImage.configure({
                HTMLAttributes: {
                    class: 'rounded-xl shadow-lg my-8',
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
                class: 'prose prose-lg max-w-none focus:outline-none',
            },
        },
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} menit`;
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
            } catch (err) {
                // Ignore share error
            }
        } else {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const category = article.tags?.[0] || 'ARTIKEL';
    const bgColor = category.toLowerCase().includes('tips')
        ? 'bg-blue-500'
        : category.toLowerCase().includes('promo')
            ? 'bg-orange-500'
            : 'bg-green-500';

    return (
        <div className="py-8">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 mb-8">
                <Link
                    href="/artikel"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Kembali ke Artikel</span>
                </Link>
            </div>

            {/* Main Content - 2 Column Grid */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Article Content - 2/3 width */}
                    <article className="lg:col-span-2">
                        {/* Category Badge */}
                        <div className="mb-4">
                            <span className={`${bgColor} text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide inline-block`}>
                                {category}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                            {article.title}
                        </h1>

                        {/* Excerpt */}
                        {article.excerpt && (
                            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                                {article.excerpt}
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={18} />
                                <span>{formatDate(article.published_at || article.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={18} />
                                <span>{getReadingTime(article.content)}</span>
                            </div>
                            <button
                                onClick={handleShare}
                                className="ml-auto flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                            >
                                <Share2 size={18} />
                                <span>{copied ? 'Link Disalin!' : 'Bagikan'}</span>
                            </button>
                        </div>

                        {/* Featured Image */}
                        {article.featured_image && (
                            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                                <Image
                                    src={article.featured_image}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        {/* Article Content */}
                        <EditorContent
                            editor={editor}
                            className="prose prose-lg max-w-none mb-12
                                prose-headings:font-bold prose-headings:text-gray-900
                                prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-6
                                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-gray-900 prose-strong:font-bold
                                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                                prose-li:text-gray-700 prose-li:mb-2
                                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700
                                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-primary
                                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto"
                        />

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="pt-8 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {article.tags.map((tag, idx) => (
                                        <Link
                                            key={idx}
                                            href={`/artikel?tag=${encodeURIComponent(tag)}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-primary hover:text-white rounded-full text-sm font-medium text-gray-700 transition-all"
                                        >
                                            <Tag size={14} />
                                            {tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Sidebar - 1/3 width */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            {/* Artikel Lainnya */}
                            <div className="bg-white rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    Artikel Lainnya
                                </h3>
                                <div className="space-y-6">
                                    {relatedArticles.map((relatedArticle) => (
                                        <Link
                                            key={relatedArticle.id}
                                            href={`/artikel/${relatedArticle.slug}`}
                                            className="block group"
                                        >
                                            {relatedArticle.featured_image && (
                                                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                                                    <Image
                                                        src={relatedArticle.featured_image}
                                                        alt={relatedArticle.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                                {relatedArticle.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                <span>{formatDate(relatedArticle.published_at || relatedArticle.created_at)}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Section */}
                            <div className="bg-gradient-to-br from-primary to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="text-xl font-bold mb-3">
                                    Butuh Konsultasi Aki Mobil?
                                </h3>
                                <p className="mb-6 text-blue-100 text-sm">
                                    Hubungi kami untuk mendapatkan rekomendasi aki yang tepat untuk kendaraan Anda
                                </p>
                                <a
                                    href="https://wa.me/6281354007400"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Hubungi via WhatsApp
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
