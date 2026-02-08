import { getArticleBySlug } from '@/lib/supabase/data';
import HomeLayout from '@/components/layouts/home-layout';
import ArticleContent from '@/components/sections/article-content';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JsonLd from '@/components/json-ld';

interface ArticlePageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        return {
            title: 'Artikel Tidak Ditemukan - Aki Mobil Jogja',
        };
    }

    const keywords = article.tags?.length > 0 ? article.tags : ['aki mobil', 'tips otomotif'];

    return {
        title: `${article.title} - Aki Mobil Jogja`,
        description: article.excerpt || `Baca artikel lengkap tentang ${article.title}`,
        keywords: keywords,
        openGraph: {
            title: article.title,
            description: article.excerpt || article.title,
            type: 'article',
            publishedTime: article.published_at || article.created_at,
            authors: ['Aki Mobil Jogja'],
            tags: keywords,
            images: article.featured_image ? [article.featured_image] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: article.title,
            description: article.excerpt || article.title,
            images: article.featured_image ? [article.featured_image] : [],
        },
    };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt || article.title,
        image: article.featured_image ? [article.featured_image] : [],
        datePublished: article.published_at || article.created_at,
        dateModified: article.updated_at || article.created_at,
        author: {
            '@type': 'Organization',
            name: 'Aki Mobil Jogja',
            url: 'https://akimobiljogja.com'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Aki Mobil Jogja',
            logo: {
                '@type': 'ImageObject',
                url: 'https://akimobiljogja.com/logo.png'
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://akimobiljogja.com/artikel/${article.slug}`
        }
    };

    return (
        <HomeLayout>
            <JsonLd data={jsonLd} />
            <ArticleContent article={article} />
        </HomeLayout>
    );
}
