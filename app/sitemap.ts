import { MetadataRoute } from 'next'
import { getAllArticles, getAllProducts } from '@/lib/supabase/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://akimobiljogja.com'

    // Fetch all articles
    const articles = await getAllArticles()
    const articleUrls = articles.map((article) => ({
        url: `${baseUrl}/artikel/${article.slug}`,
        lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // Fetch all products
    const products = await getAllProducts()
    const productUrls = products.map((product) => ({
        url: `${baseUrl}/katalog/product/${product.slug}`,
        lastModified: product.created_at ? new Date(product.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    // Static routes
    const routes = [
        '',
        '/tentang-kami',
        '/katalog',
        '/artikel',
        '/rekomendasi-aki',
        '/kebijakan-pengembalian',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    return [...routes, ...articleUrls, ...productUrls]
}
