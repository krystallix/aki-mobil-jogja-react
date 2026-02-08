import { createClient } from "@/lib/supabase/client"
import { SupabaseClient } from "@supabase/supabase-js"
import { cache } from "react"
import { ArticleFilters, ArticleData } from "./types"
import { uploadBase64ImageToSupabase, cleanupOrphanedImagesWithFeatured, deleteArticleImages } from "./storage"
import { extractFirstImageUrl } from "./utils"

// ============================================
// ARTICLE CRUD OPERATIONS
// ============================================

export const fetchArticles = cache(async (filters: ArticleFilters = {}) => {
    const supabase = createClient()

    try {
        let query = supabase
            .from("artikel")
            .select('*')
            .order("created_at", { ascending: false })

        if (filters.status) {
            query = query.eq("status", filters.status)
        }

        if (filters.searchQuery) {
            query = query.or(`title.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%`)
        }

        if (filters.tag) {
            query = query.contains("tags", [filters.tag])
        }

        if (filters.limit) {
            const from = (filters.page || 0) * filters.limit
            const to = from + filters.limit - 1
            query = query.range(from, to)
        }

        const { data, error } = await query.abortSignal(
            AbortSignal.timeout(10000)
        )

        if (error) {
            if (error.code !== 'ABORT_ERR' && !error.message?.includes('aborted')) {
                console.error("Error fetching articles:", error)
            }
            return []
        }

        return data || []

    } catch (error: any) {
        if (
            error?.name === 'AbortError' ||
            error?.code === 'ABORT_ERR' ||
            error?.message?.includes('aborted')
        ) {
            console.log('Article fetch cancelled (normal behavior)')
            return []
        }

        console.error("Unexpected error fetching articles:", error)
        return []
    }
})

export const fetchArticleBySlug = async (slug: string) => {
    const supabase = createClient()

    const { data, error } = await supabase
        .from("artikel")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle()

    if (error) {
        console.error("Error fetching article:", error)
        return null
    }

    return data
}

export const fetchArticleById = async (id: string) => {
    const supabase = createClient()

    const { data, error } = await supabase
        .from("artikel")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching article by id:", error)
        return null
    }

    return data
}

/**
 * Process Tiptap HTML content:
 * - Extract all base64 images
 * - Upload to Supabase Storage
 * - Replace base64 with public URLs
 */
export async function processTiptapImages(
    htmlContent: string,
    articleSlug: string
): Promise<string> {
    const supabase = createClient()

    try {
        const base64ImageRegex = /<img[^>]+src="(data:image\/[^;]+;base64[^"]+)"[^>]*>/g

        let processedContent = htmlContent
        const matches = [...htmlContent.matchAll(base64ImageRegex)]

        if (matches.length === 0) {
            console.log('No base64 images found, skipping upload')
            return htmlContent
        }

        console.log(`Found ${matches.length} base64 images to upload for article: ${articleSlug}`)

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i]
            const fullImgTag = match[0]
            const base64Data = match[1]

            try {
                console.log(`Uploading image ${i + 1}/${matches.length}...`)

                const publicUrl = await uploadBase64ImageToSupabase(
                    supabase,
                    base64Data,
                    articleSlug
                )

                const newImgTag = fullImgTag.replace(base64Data, publicUrl)
                processedContent = processedContent.replace(fullImgTag, newImgTag)

                console.log(`Image ${i + 1} uploaded: ${publicUrl}`)

            } catch (error) {
                console.error(`Failed to upload image ${i + 1}:`, error)
                throw new Error(`Failed to upload image ${i + 1}: ${error}`)
            }
        }

        console.log('All images uploaded successfully')
        return processedContent

    } catch (error) {
        console.error('Error processing Tiptap images:', error)
        throw error
    }
}

export async function upsertArticle(articleData: ArticleData) {
    const supabase = createClient()

    try {
        let oldContent = ''
        let oldFeaturedImage: string | null = null

        if (articleData.id) {
            const { data: oldArticle } = await supabase
                .from("artikel")
                .select("content, featured_image")
                .eq("id", articleData.id)
                .single()

            oldContent = oldArticle?.content || ''
            oldFeaturedImage = oldArticle?.featured_image || null
        }

        console.log('Processing article images...')

        const processedContent = await processTiptapImages(
            articleData.content,
            articleData.slug
        )

        let finalFeaturedImage = articleData.featured_image

        if (!finalFeaturedImage || finalFeaturedImage.trim() === '') {
            const firstImageUrl = extractFirstImageUrl(processedContent)

            if (firstImageUrl) {
                console.log('Auto-setting featured image from content:', firstImageUrl)
                finalFeaturedImage = firstImageUrl
            } else {
                console.log('No images found in content for featured image')
                finalFeaturedImage = null
            }
        }

        const payload = {
            ...articleData,
            content: processedContent,
            featured_image: finalFeaturedImage,
            updated_at: new Date().toISOString(),
            published_at: articleData.status === 'published' && !articleData.published_at
                ? new Date().toISOString()
                : articleData.published_at
        }

        if (!payload.id) delete payload.id

        const { data, error } = await supabase
            .from("artikel")
            .upsert(payload)
            .select()
            .single()

        if (error) throw error

        if (articleData.id && (oldContent || oldFeaturedImage)) {
            cleanupOrphanedImagesWithFeatured(
                supabase,
                oldContent,
                processedContent,
                oldFeaturedImage,
                finalFeaturedImage,
                articleData.slug
            ).catch(err => console.warn('Failed to cleanup orphaned images:', err))
        }

        console.log('Article saved successfully')
        console.log('   - Content images uploaded and replaced')
        console.log('   - Featured image:', finalFeaturedImage || '(none)')

        return data

    } catch (error) {
        console.error('Error upserting article:', error)
        throw error
    }
}

export async function deleteArticle(supabase: SupabaseClient, id: string) {
    try {
        const { data: article } = await supabase
            .from("artikel")
            .select("slug")
            .eq("id", id)
            .single()

        const { error } = await supabase
            .from("artikel")
            .delete()
            .eq("id", id)

        if (error) throw error

        if (article?.slug) {
            deleteArticleImages(supabase, article.slug).catch(err => {
                console.warn('Failed to delete article images:', err)
            })
        }

        return true
    } catch (error) {
        console.error('Error deleting article:', error)
        throw error
    }
}

export async function incrementArticleView(slug: string) {
    const supabase = createClient()

    const { error } = await supabase.rpc('increment_article_view', {
        row_slug: slug
    })

    if (error) console.error("Error incrementing view:", error)
}
