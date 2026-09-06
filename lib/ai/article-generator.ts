export interface GenerateTitleSuggestionsInput {
  keyword: string
}

export interface GenerateFullArticleInput {
  title: string
}

export interface GenerateFullArticleOutput {
  slug: string
  tags: string[]
  content: string
  excerpt: string
}

const SYSTEM_PROMPT = `
Kamu menulis artikel untuk Siswanto Aki / Aki Mobil Jogja.
Peranmu: SEO specialist lokal dan teknisi aki kendaraan.
Gaya bahasa wajib natural seperti manusia, tidak generik, tidak berulang, tidak terdengar seperti template AI.
Pakai Bahasa Indonesia sehari-hari yang rapi, hangat, jelas, dan meyakinkan.
Jangan berlebihan memakai kata "penting", "solusi terbaik", "di era modern", atau frasa promosi kosong.
Utamakan pengalaman praktis: gejala aki rusak, penyebab, langkah cek, kapan harus ganti, dan tips nyata.
Bisnis: toko dan layanan aki di Yogyakarta/Bantul, antar pasang, cek aki, tukar tambah, garansi resmi.
Website: akimobiljogja.com. WhatsApp: 0813 5400 7400.
`.trim()

type ChatMessage = {
  role: "system" | "user"
  content: string
}

function extractJsonObject(text: string): unknown {
  const start = text.indexOf("{")
  if (start === -1) throw new Error("Tidak ditemukan JSON di respons AI")

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < text.length; i++) {
    const char = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (char === "\\") escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === "{") depth++
    else if (char === "}") {
      depth--
      if (depth === 0) return JSON.parse(text.slice(start, i + 1))
    }
  }

  throw new Error("Respons AI JSON tidak lengkap")
}

async function callArkane(messages: ChatMessage[], maxTokens = 2048): Promise<string> {
  const apiKey = process.env.ARKANE_GATEWAY_API_KEY
  if (!apiKey) throw new Error("ARKANE_GATEWAY_API_KEY tidak dikonfigurasi di .env.local")

  const res = await fetch("https://gateway.arkane.my.id/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "combo-1",
      messages,
      temperature: 0.78,
      reasoning_effort: "none",
      max_tokens: maxTokens,
    }),
  })

  const raw = await res.text()

  if (!res.ok) {
    throw new Error(`Arkane Gateway error (${res.status}): ${raw.slice(0, 500)}`)
  }

  const data = extractJsonObject(raw) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content ?? ""
  if (!content.trim()) {
    throw new Error("AI tidak mengembalikan konten. Coba generate ulang.")
  }
  return content
}

function cleanJson(raw: string) {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim()
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

export async function generateTitleSuggestions(input: GenerateTitleSuggestionsInput): Promise<string[]> {
  const userPrompt = `
Buat 5 judul artikel menarik dan natural tentang: "${input.keyword}".

Satu judul per baris, tanpa nomor, tanpa bullet, tanpa tanda petik.
`.trim()

  const raw = await callArkane([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ], 4096)

  return raw
    .split("\n")
    .map((line) => line.replace(/^[\d.\-*\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 5)
}

export async function generateFullArticle(input: GenerateFullArticleInput): Promise<GenerateFullArticleOutput> {
  const userPrompt = `
Tulis artikel lengkap berdasarkan judul ini:
"${input.title}"

Balas JSON valid saja:
{
  "slug": "slug-artikel",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "excerpt": "meta description 140-160 karakter",
  "content": "HTML artikel"
}

Aturan artikel:
- Bahasa manusia, natural, tidak kaku, tidak AI slop.
- Panjang 900-1300 kata.
- Jangan pakai <h1>.
- Pakai <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>.
- Paragraf pendek, tiap paragraf punya informasi nyata.
- Sertakan contoh gejala/penyebab/langkah cek yang masuk akal.
- Hindari pengulangan frasa promosi.
- CTA akhir halus ke Siswanto Aki untuk cek aki, ganti aki, tukar tambah, atau antar pasang area Jogja/Bantul.
- Konten HTML harus kompatibel dengan Tiptap.
- Jangan tambahkan markdown fence atau teks di luar JSON.
`.trim()

  const raw = await callArkane([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ], 8192)

  try {
    const parsed = JSON.parse(cleanJson(raw))
    return {
      slug: normalizeSlug(String(parsed.slug || input.title)),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 7) : [],
      excerpt: String(parsed.excerpt || "").slice(0, 170),
      content: String(parsed.content || ""),
    }
  } catch {
    throw new Error("AI mengembalikan JSON tidak valid. Coba generate ulang.")
  }
}
