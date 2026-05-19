import { NextRequest, NextResponse } from "next/server"
import {
  generateTitleSuggestions,
  generateFullArticle,
  type AiProvider,
} from "@/lib/ai/article-generator"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, provider, keyword, title } = body

    if (!provider || !["nvidia", "vercel"].includes(provider)) {
      return NextResponse.json(
        { error: "Provider tidak valid. Gunakan 'nvidia' atau 'vercel'." },
        { status: 400 }
      )
    }

    // ── Action: suggest titles ────────────────────────────────────────────────
    if (action === "suggest-titles") {
      if (!keyword || typeof keyword !== "string") {
        return NextResponse.json(
          { error: "Keyword diperlukan untuk generate judul." },
          { status: 400 }
        )
      }

      const titles = await generateTitleSuggestions({
        keyword: keyword.trim(),
        provider: provider as AiProvider,
      })

      return NextResponse.json({ titles })
    }

    // ── Action: generate full article ─────────────────────────────────────────
    if (action === "generate-article") {
      if (!title || typeof title !== "string") {
        return NextResponse.json(
          { error: "Judul diperlukan untuk generate artikel." },
          { status: 400 }
        )
      }

      const result = await generateFullArticle({
        title: title.trim(),
        provider: provider as AiProvider,
      })

      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Action tidak dikenal." }, { status: 400 })
  } catch (err: any) {
    console.error("[ai-artikel]", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
