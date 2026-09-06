import { SupabaseClient } from "@supabase/supabase-js"
import { normalizeFileName, getCategoryFolder, base64ToFile, extractImageUrls } from "./utils"

// ============================================
// PRODUCT STORAGE FUNCTIONS
// ============================================

/**
 * Upload product image to Supabase Storage
 * Structure: merek/kategori/tipe.ext
 * Example: incoe/hybrid/ns40.png
 */
export async function uploadProductImage(
    supabase: SupabaseClient,
    file: File,
    merek: string,
    kategori: string,
    tipe: string
): Promise<string | null> {
    try {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const merekFolder = normalizeFileName(merek)
        const kategoriFolder = getCategoryFolder(kategori)
        const fileName = normalizeFileName(tipe)

        const filePath = `${merekFolder}/${kategoriFolder}/${fileName}.${fileExt}`

        const { data: existingFiles } = await supabase.storage
            .from("aki-mobil-jogja")
            .list(`${merekFolder}/${kategoriFolder}`, {
                search: fileName,
            })

        if (existingFiles && existingFiles.length > 0) {
            const existingFile = existingFiles.find((f) => f.name.startsWith(fileName))
            if (existingFile) {
                await supabase.storage
                    .from("aki-mobil-jogja")
                    .remove([`${merekFolder}/${kategoriFolder}/${existingFile.name}`])
            }
        }

        const { error: uploadError } = await supabase.storage
            .from("aki-mobil-jogja")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return null
        }

        const { data: { publicUrl } } = supabase.storage
            .from("aki-mobil-jogja")
            .getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        console.error("Error uploading image:", error)
        return null
    }
}

/**
 * Delete product image from Supabase Storage
 */
export async function deleteProductImage(
    supabase: SupabaseClient,
    imageUrl: string
): Promise<boolean> {
    try {
        const url = new URL(imageUrl)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/aki-mobil-jogja\/(.+)$/)

        if (!pathMatch || !pathMatch[1]) return false

        const path = pathMatch[1]
        const { error } = await supabase.storage.from("aki-mobil-jogja").remove([path])

        if (error) {
            console.error("Delete error:", error)
            return false
        }

        return true
    } catch (error) {
        console.error("Error deleting image:", error)
        return false
    }
}

// ============================================
// ARTICLE STORAGE FUNCTIONS
// ============================================

/**
 * Upload featured image for article
 * Structure: articles/slug/images/featured-timestamp-random.ext
 * CONSISTENT with content images path
 */
export async function uploadFeaturedImage(
    supabase: SupabaseClient,
    file: File,
    articleSlug: string
): Promise<string | null> {
    try {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(7)
        const fileName = `featured-${timestamp}-${randomStr}.${fileExt}`

        const filePath = `articles/${normalizeFileName(articleSlug)}/images/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from("aki-mobil-jogja")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            })

        if (uploadError) {
            console.error("Upload featured image error:", uploadError)
            return null
        }

        const { data: { publicUrl } } = supabase.storage
            .from("aki-mobil-jogja")
            .getPublicUrl(filePath)

        console.log("Featured image uploaded:", publicUrl)
        return publicUrl

    } catch (error) {
        console.error("Error uploading featured image:", error)
        return null
    }
}

/**
 * Upload single base64 image to Supabase Storage
 * Structure: articles/slug/images/timestamp-random.png
 */
export async function uploadArticleContentImage(
    supabase: SupabaseClient,
    file: File,
    articleSlug: string
): Promise<string> {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const fileName = `content-${timestamp}-${randomStr}.${fileExt}`
    const filePath = `articles/${normalizeFileName(articleSlug)}/images/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from("aki-mobil-jogja")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
        })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
        .from("aki-mobil-jogja")
        .getPublicUrl(filePath)

    return publicUrl
}

export async function uploadBase64ImageToSupabase(
    supabase: SupabaseClient,
    base64: string,
    articleSlug: string
): Promise<string> {
    try {
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(7)
        const fileName = `${timestamp}-${randomStr}.png`

        const filePath = `articles/${normalizeFileName(articleSlug)}/images/${fileName}`

        const file = base64ToFile(base64, fileName)

        const { error: uploadError } = await supabase.storage
            .from("aki-mobil-jogja")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from("aki-mobil-jogja")
            .getPublicUrl(filePath)

        return publicUrl

    } catch (error) {
        console.error('Error uploading base64 image:', error)
        throw error
    }
}

/**
 * Delete single image by URL
 */
export async function deleteImageByUrl(
    supabase: SupabaseClient,
    imageUrl: string
): Promise<boolean> {
    try {
        const url = new URL(imageUrl)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/aki-mobil-jogja\/(.+)$/)

        if (!pathMatch || !pathMatch[1]) return false

        const path = pathMatch[1]
        const { error } = await supabase.storage
            .from("aki-mobil-jogja")
            .remove([path])

        if (error) {
            console.error("Delete image error:", error)
            return false
        }

        console.log("Deleted image:", path)
        return true

    } catch (error) {
        console.error("Error deleting image:", error)
        return false
    }
}

/**
 * Delete all images in an article folder
 * Deletes ALL images: featured + content images
 */
export async function deleteArticleImages(
    supabase: SupabaseClient,
    articleSlug: string
): Promise<boolean> {
    try {
        const folderPath = `articles/${normalizeFileName(articleSlug)}/images`

        const { data: files, error: listError } = await supabase.storage
            .from("aki-mobil-jogja")
            .list(folderPath)

        if (listError) throw listError

        if (!files || files.length === 0) {
            console.log('No images to delete in folder:', folderPath)
            return true
        }

        const filePaths = files.map(file => `${folderPath}/${file.name}`)
        const { error: deleteError } = await supabase.storage
            .from("aki-mobil-jogja")
            .remove(filePaths)

        if (deleteError) throw deleteError

        console.log(`Deleted ${files.length} images from ${folderPath}`)
        return true

    } catch (error) {
        console.error('Error deleting article images:', error)
        return false
    }
}

/**
 * Clean up orphaned images
 * Now handles both content images and featured image changes
 */
export async function cleanupOrphanedImagesWithFeatured(
    supabase: SupabaseClient,
    oldContent: string,
    newContent: string,
    oldFeaturedImage: string | null,
    newFeaturedImage: string | null,
    articleSlug: string
): Promise<void> {
    try {
        const oldContentImages = extractImageUrls(oldContent)
        const newContentImages = extractImageUrls(newContent)

        const imagesToKeep = new Set([
            ...newContentImages,
            ...(newFeaturedImage ? [newFeaturedImage] : [])
        ])

        const orphanedContentImages = oldContentImages.filter(url => !imagesToKeep.has(url))

        const orphanedImages = [...orphanedContentImages]

        if (oldFeaturedImage &&
            oldFeaturedImage !== newFeaturedImage &&
            !newContentImages.includes(oldFeaturedImage) &&
            oldFeaturedImage.includes('/storage/v1/object/public/aki-mobil-jogja/articles/')) {
            orphanedImages.push(oldFeaturedImage)
        }

        if (orphanedImages.length === 0) {
            console.log('No orphaned images to clean up')
            return
        }

        console.log(`Cleaning up ${orphanedImages.length} orphaned images...`)

        let successCount = 0
        for (const imageUrl of orphanedImages) {
            const deleted = await deleteImageByUrl(supabase, imageUrl)
            if (deleted) successCount++
        }

        console.log(`Cleanup complete: ${successCount}/${orphanedImages.length} images deleted`)

    } catch (error) {
        console.error('Error in cleanupOrphanedImagesWithFeatured:', error)
    }
}
