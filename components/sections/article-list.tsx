'use client';

import { useEffect, useState } from 'react';
import { fetchArticles, type ArticleData } from '@/lib/supabase/queries';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag } from 'lucide-react';

interface ArticleListProps {
    initialArticles?: ArticleData[];
}

export default function ArticleList({ initialArticles = [] }: ArticleListProps) {
    const [articles, setArticles] = useState<ArticleData[]>(initialArticles);
    const [isLoading, setIsLoading] = useState(initialArticles.length === 0);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        // If we have initialArticles and no tag is selected, we don't need to fetch
        if (initialArticles.length > 0 && selectedTag === null) {
            return;
        }

        let isMounted = true;

        async function loadArticles() {
            try {
                const data = await fetchArticles({
                    status: 'published',
                    tag: selectedTag || undefined,
                });

                if (isMounted) {
                    setArticles(data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load articles:', error);
                if (isMounted) {
                    setArticles([]);
                    setIsLoading(false);
                }
            }
        }

        loadArticles();

        return () => {
            isMounted = false;
        };
    }, [selectedTag]);

    // Get all unique tags
    const allTags = Array.from(
        new Set(articles.flatMap(article => article.tags || []))
    );

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

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            {/* Filter Tags */}
            {allTags.length > 0 && (
                <div className="mb-12">
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === null
                                ? 'bg-primary text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Semua
                        </button>
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === tag
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Articles Grid */}
            {articles.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">Belum ada artikel tersedia.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => {
                        const category = article.tags?.[0] || 'ARTIKEL';
                        const bgColor = category.toLowerCase().includes('tips')
                            ? 'bg-blue-500'
                            : category.toLowerCase().includes('promo')
                                ? 'bg-orange-500'
                                : 'bg-green-500';

                        return (
                            <Link
                                key={article.id}
                                href={`/artikel/${article.slug}`}
                                className="group"
                            >
                                <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                    {/* Featured Image */}
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        {article.featured_image ? (
                                            <Image
                                                src={article.featured_image}
                                                alt={article.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-800">
                                                <span className="text-white text-4xl font-bold opacity-20">
                                                    {article.title.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        {/* Category Badge */}
                                        <div className={`absolute top-4 left-4 ${bgColor} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide`}>
                                            {category}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {article.excerpt || 'Baca selengkapnya...'}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{formatDate(article.published_at || article.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                <span>{getReadingTime(article.content)}</span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {article.tags && article.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {article.tags.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                                                    >
                                                        <Tag size={12} />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
