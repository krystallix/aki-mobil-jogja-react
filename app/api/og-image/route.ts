import { NextRequest, NextResponse } from "next/server"

/**
 * Proxy endpoint for Supabase Storage images.
 *
 * Supabase Storage sets `x-robots-tag: none` on all files which prevents
 * Facebook, Twitter, and other social media crawlers from loading og:image.
 *
 * This proxy fetches the image server-side and re-serves it with proper
 * cache headers — without the robots restriction.
 *
 * Usage in og:image:
 *   https://akimobiljogja.com/api/og-image?url=<encoded-supabase-url>
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return new NextResponse("Missing 'url' parameter", { status: 400 })
  }

  // Only allow proxying from our own Supabase instance
  const ALLOWED_HOSTS = [
    "supabase.arkane.my.id",
    "yknjcqihexwskwbuiurh.supabase.co",
  ]

  let parsedUrl: URL
  try {
    parsedUrl = new URL(imageUrl)
  } catch {
    return new NextResponse("Invalid URL", { status: 400 })
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return new NextResponse("Unauthorized image host", { status: 403 })
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        "User-Agent": "AkiMobilJogja-OGProxy/1.0",
      },
      // Next.js fetch caches by default, so this is efficient
      next: { revalidate: 86400 }, // cache 24h
    })

    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, {
        status: upstream.status,
      })
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg"
    const buffer = await upstream.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Allow Facebook/crawlers to cache this image for 24h
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        // Explicitly allow all bots
        "X-Robots-Tag": "all",
      },
    })
  } catch (err: any) {
    console.error("[og-image proxy]", err)
    return new NextResponse("Failed to fetch image", { status: 500 })
  }
}
