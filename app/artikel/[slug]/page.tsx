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

const BASE_URL = 'https://akimobiljogja.com'

/**
 * Wrap a Supabase Storage URL through our og-image proxy.
 * This strips the `x-robots-tag: none` header that Supabase adds,
 * which prevents Facebook/social crawlers from loading og:image.
 */
function proxyOgImage(url: string | null | undefined): string | null {
    if (!url) return null
    return `${BASE_URL}/api/og-image?url=${encodeURIComponent(url)}`
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        return {
            title: 'Artikel Tidak Ditemukan - Siswanto Aki',
        };
    }

    // Optimize title to max 60 characters
    const suffix = ' | Siswanto Aki';
    const maxNameLength = 60 - suffix.length;

    let pageTitle = article.title;
    if (pageTitle.length > maxNameLength) {
        pageTitle = pageTitle.substring(0, maxNameLength - 3) + '...';
    }
    pageTitle = `${pageTitle}${suffix}`;

    // Create comprehensive meta description (120-160 chars)
    let metaDescription = article.excerpt || '';
    if (!metaDescription || metaDescription.length < 50) {
        metaDescription = `${article.title} - Temukan tips dan panduan lengkap seputar aki mobil, perawatan, and solusi masalah aki dari ahlinya di Siswanto Aki.`;
    }

    // Ensure min length if possible, or max length
    if (metaDescription.length < 120) {
        metaDescription += ' Baca selengkapnya disini.';
    }

    if (metaDescription.length > 160) {
        metaDescription = metaDescription.substring(0, 157) + '...';
    }

    const keywords = article.tags?.length > 0 ? article.tags : ['aki mobil', 'tips otomotif', 'perawatan aki'];
    const articleUrl = `${BASE_URL}/artikel/${slug}`;

    // Use proxy URL so Facebook crawler can access the image
    // (Supabase Storage sets x-robots-tag: none which blocks social crawlers)
    const ogImageUrl = proxyOgImage(article.featured_image)

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
            siteName: 'Siswanto Aki',
            type: 'article',
            publishedTime: article.published_at || article.created_at,
            modifiedTime: article.updated_at || article.created_at,
            authors: ['Siswanto Aki'],
            tags: keywords,
            images: ogImageUrl ? [{
                url: ogImageUrl,
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
            images: ogImageUrl ? [ogImageUrl] : [],
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
            name: 'Siswanto Aki',
            url: 'https://akimobiljogja.com'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Siswanto Aki',
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

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://akimobiljogja.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Artikel',
                item: 'https://akimobiljogja.com/artikel'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: article.title,
                item: `https://akimobiljogja.com/artikel/${article.slug}`
            }
        ]
    };

    return (
        <HomeLayout>
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <ArticleContent article={article} relatedArticles={relatedArticles} />
        </HomeLayout>
    );
}
