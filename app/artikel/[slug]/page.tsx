import { getArticleBySlug, getRelatedArticles } from '@/lib/supabase/data';
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

    // Optimize title to max 60 characters
    const suffix = ' | Aki Mobil Jogja';
    const maxNameLength = 60 - suffix.length;

    let pageTitle = article.title;
    if (pageTitle.length > maxNameLength) {
        pageTitle = pageTitle.substring(0, maxNameLength - 3) + '...';
    }
    pageTitle = `${pageTitle}${suffix}`;

    // Create comprehensive meta description (120-160 chars)
    let metaDescription = article.excerpt || '';
    if (!metaDescription || metaDescription.length < 50) {
        metaDescription = `${article.title} - Temukan tips dan panduan lengkap seputar aki mobil, perawatan, dan solusi masalah aki dari ahlinya di Aki Mobil Jogja.`;
    }

    // Ensure min length if possible, or max length
    if (metaDescription.length < 120) {
        metaDescription += ' Baca selengkapnya disini.';
    }

    if (metaDescription.length > 160) {
        metaDescription = metaDescription.substring(0, 157) + '...';
    }

    const keywords = article.tags?.length > 0 ? article.tags : ['aki mobil', 'tips otomotif', 'perawatan aki'];
    const articleUrl = `https://akimobiljogja.com/artikel/${slug}`;

    return {
        title: pageTitle,
        description: metaDescription,
        keywords: keywords,
        alternates: {
            canonical: articleUrl,
        },
        openGraph: {
            title: pageTitle,
            description: metaDescription,
            url: articleUrl,
            siteName: 'Aki Mobil Jogja',
            type: 'article',
            publishedTime: article.published_at || article.created_at,
            modifiedTime: article.updated_at || article.created_at,
            authors: ['Aki Mobil Jogja'],
            tags: keywords,
            images: article.featured_image ? [{
                url: article.featured_image,
                width: 1200,
                height: 630,
                alt: article.title,
            }] : [],
            locale: 'id_ID',
        },
        twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description: metaDescription,
            images: article.featured_image ? [article.featured_image] : [],
            creator: '@akimobiljogja',
        },
    };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    const relatedArticles = await getRelatedArticles(article.id);

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
            <ArticleContent article={article} relatedArticles={relatedArticles} />
        </HomeLayout>
    );
}
