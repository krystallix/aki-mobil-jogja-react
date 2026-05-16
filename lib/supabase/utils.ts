/**
 * Normalize string for folder/file names
 */
export function normalizeFileName(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-")
}

/**
 * Get category folder name
 */
export function getCategoryFolder(kategori: string): string {
    const categoryMap: { [key: string]: string } = {
        "Aki Basah": "basah",
        "Aki Kering (MF)": "mf",
        "Aki Hybrid": "hybrid",
        "Jasa": "jasa",
    }
    return categoryMap[kategori] || normalizeFileName(kategori)
}

/**
 * Convert base64 to File object
 */
export function base64ToFile(base64String: string, filename: string): File {
    const arr = base64String.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
}

/**
 * Extract first image URL from HTML content
 */
export function extractFirstImageUrl(htmlContent: string): string | null {
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/i
    const match = htmlContent.match(imgRegex)

    if (match && match[1]) {
        const url = match[1]
        if (url.startsWith('http')) {
            return url
        }
    }

    return null
}

/**
 * Extract all image URLs from HTML content
 */
export function extractImageUrls(htmlContent: string): string[] {
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g
    const urls: string[] = []
    let match

    while ((match = imgRegex.exec(htmlContent)) !== null) {
        const url = match[1]
        if (url.includes('/storage/v1/object/public/aki-mobil-jogja/articles/')) {
            urls.push(url)
        }
    }

    return urls
}
