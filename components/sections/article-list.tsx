'use client';
import { useEffect, useState } from 'react';
import { fetchArticles, type ArticleData } from '@/lib/supabase/queries';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ArticleListProps {
    initialArticles?: ArticleData[];
}

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

export default function ArticleList({ initialArticles = [] }: ArticleListProps) {
    const [articles, setArticles] = useState<ArticleData[]>(initialArticles);
    const [isLoading, setIsLoading] = useState(initialArticles.length === 0);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        if (initialArticles.length > 0 && selectedTag === null) {
            setArticles(initialArticles);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        async function loadArticles() {
            setIsLoading(true);
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
        return () => { isMounted = false; };
    }, [selectedTag, initialArticles]);

    const allTags = Array.from(new Set(articles.flatMap(article => article.tags || [])));

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1] 
            } 
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse space-y-4">
                            <div className="bg-muted rounded-3xl aspect-[16/10]"></div>
                            <div className="h-4 bg-muted rounded-full w-3/4"></div>
                            <div className="h-4 bg-muted rounded-full w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const featuredArticles = articles.slice(0, 3);
    const regularArticles = articles.slice(3);

    return (
        <div className="container mx-auto px-6 max-w-7xl">
            {/* Filter Tags */}
            <div className="mb-12 overflow-x-auto pb-2 -mx-6 px-6">
                <div className="flex gap-2 min-w-max">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${selectedTag === null
                            ? 'bg-primary text-primary-foreground border-primary shadow-none'
                            : 'bg-card text-muted-foreground border-border/50 hover:border-primary/40'
                            }`}
                    >
                        Semua
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${selectedTag === tag
                                ? 'bg-primary text-primary-foreground border-primary shadow-none'
                                : 'bg-card text-muted-foreground border-border/50 hover:border-primary/40'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedTag || 'all'}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-16 lg:space-y-24"
                >
                    {/* Bento Featured Grid - Only show if no tag selected or on the first page of "All" */}
                    {!selectedTag && featuredArticles.length >= 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
                            {/* Main Featured (Large) */}
                            <motion.div variants={itemVariants} className="md:col-span-8 group">
                                <Link href={`/artikel/${featuredArticles[0].slug}`} className="block h-full">
                                    <div className="relative h-full min-h-[400px] lg:min-h-[500px] rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all duration-500">
                                        {featuredArticles[0].featured_image && (
                                            <Image
                                                src={featuredArticles[0].featured_image}
                                                alt={featuredArticles[0].title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent z-10" />
                                        <div className="absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent z-20" />
                                        <div className="absolute bottom-0 left-0 p-8 lg:p-12 text-white w-full z-30">
                                            <div className="flex items-center gap-4 mb-4 text-xs font-bold uppercase tracking-widest opacity-80">
                                                <span className="bg-primary px-3 py-1 rounded-full">{featuredArticles[0].tags?.[0] || 'Artikel'}</span>
                                                <span>{getReadingTime(featuredArticles[0].content)}</span>
                                            </div>
                                            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tighter mb-6 group-hover:text-primary transition-colors duration-300">
                                                {featuredArticles[0].title}
                                            </h2>
                                            <div className="flex items-center gap-2 font-bold group/link">
                                                <span>Baca Artikel</span>
                                                <ArrowUpRight className="w-5 h-5 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>

                            {/* Secondary Featured (Stacked) */}
                            <div className="md:col-span-4 flex flex-col gap-6 lg:gap-8">
                                {featuredArticles.slice(1, 3).map((article) => (
                                    <motion.div key={article.id} variants={itemVariants} className="flex-1 group">
                                        <Link href={`/artikel/${article.slug}`} className="block h-full">
                                            <div className="relative h-full min-h-[250px] rounded-[2rem] overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all duration-500">
                                                {article.featured_image && (
                                                    <Image
                                                        src={article.featured_image}
                                                        alt={article.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent z-10" />
                                                <div className="absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent z-20" />
                                                <div className="absolute bottom-0 left-0 p-6 text-white w-full z-30">
                                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">
                                                        {article.tags?.[0] || 'Artikel'}
                                                    </div>
                                                    <h3 className="text-xl font-extrabold tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                                        {article.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                        {(selectedTag ? articles : regularArticles).map((article) => (
                            <motion.div key={article.id} variants={itemVariants} className="group">
                                <Link href={`/artikel/${article.slug}`} className="block space-y-6">
                                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-muted border border-border/50 group-hover:border-primary/40 transition-all duration-500">
                                        {article.featured_image ? (
                                            <Image
                                                src={article.featured_image}
                                                alt={article.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-muted">
                                                <Tag className="w-12 h-12 text-muted-foreground/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90" />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border/50">
                                                {article.tags?.[0] || 'Artikel'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 px-2">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formatDate(article.published_at || article.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{getReadingTime(article.content)}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-extrabold tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                            {article.title}
                                        </h3>
                                        <p className="text-muted-foreground line-clamp-3 text-sm font-light leading-relaxed">
                                            {article.excerpt || 'Temukan informasi selengkapnya mengenai topik ini di artikel kami...'}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {articles.length === 0 && (
                        <div className="text-center py-24">
                            <p className="text-muted-foreground text-lg font-light">Belum ada artikel yang tersedia untuk kategori ini.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
