import { NextRequest, NextResponse } from "next/server"
import {
  generateTitleSuggestions,
  generateFullArticle,
} from "@/lib/ai/article-generator"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, keyword, title } = body

    if (action === "suggest-titles") {
      if (!keyword || typeof keyword !== "string") {
        return NextResponse.json(
          { error: "Keyword diperlukan untuk generate judul." },
          { status: 400 }
        )
      }

      const titles = await generateTitleSuggestions({ keyword: keyword.trim() })
      return NextResponse.json({ titles })
    }

    if (action === "generate-article") {
      if (!title || typeof title !== "string") {
        return NextResponse.json(
          { error: "Judul diperlukan untuk generate artikel." },
          { status: 400 }
        )
      }

      const result = await generateFullArticle({ title: title.trim() })
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Action tidak dikenal." }, { status: 400 })
  } catch (err: unknown) {
    console.error("[ai-artikel]", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
