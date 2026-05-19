/**
 * AI Article Generator for AkiMobilJogja
 * Supports NVIDIA (meta/llama) and Vercel AI (v0) providers.
 *
 * System Persona:
 *   - SEO Specialist focused on long-tail keywords & topical authority
 *   - Expert automotive battery technician (aki kendaraan)
 */

export type AiProvider = "nvidia" | "vercel"

export interface GenerateTitleSuggestionsInput {
  keyword: string
  provider: AiProvider
}

export interface GenerateFullArticleInput {
  title: string
  provider: AiProvider
}

export interface GenerateFullArticleOutput {
  slug: string
  tags: string[]
  content: string // HTML from tiptap-compatible structure
  excerpt: string
}

// ─── System prompt ───────────────────────────────────────────────────────────
export const SYSTEM_PROMPT = `
Kamu adalah seorang ahli ganda:

1. SEO SPECIALIST dengan pengalaman 10+ tahun:
   - Mahir dalam riset keyword, on-page SEO, dan topical authority
   - Memahami cara menulis konten yang disukai Google (E-E-A-T)
   - Terbiasa membuat slug, meta description, dan tag yang relevan
   - Selalu optimasi heading hierarchy (H1, H2, H3), internal linking, dan readability

2. EXPERT TEKNISI AKI KENDARAAN:
   - Menguasai semua jenis aki: aki basah, MF (Maintenance Free), kering, GEL, LiFePO4
   - Paham spesifikasi teknis: CCA (Cold Cranking Amps), CA, RC, kapasitas Ah, voltage
   - Memahami masalah aki: sulfasi, overcharging, self-discharge, korosi terminal
   - Hafal aplikasi aki untuk berbagai kendaraan: mobil, motor, sepeda listrik, truk
   - Mengenal brand terkemuka: GS, Incoe, MSB, Aspira, Yuasa, Chilwee, dll.
   - Ahli troubleshooting: aki tidak ngecas, soak, tekor, mesin susah start
   - Paham cara merawat aki agar awet dan efisien

Bisnis yang kontennya kamu buat: SISWANTO AKI / AKI MOBIL JOGJA
- Berlokasi di Yogyakarta
- Spesialisasi: penjualan & pemasangan aki kendaraan (mobil, motor, sepeda listrik)
- Layanan: gratis antar pasang area Jogja, garansi resmi, cek aki gratis
- Website: akimobiljogja.com | WhatsApp: 0813 5400 7400

Instruksi OUTPUT:
- Selalu dalam Bahasa Indonesia yang natural dan berwibawa
- Hindari bahasa yang terlalu formal atau kaku
- Gunakan kata kunci secara natural, tidak keyword stuffing
- Fokus pada nilai edukatif dan kepercayaan pembaca
`.trim()

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildNvidiaMessages(systemPrompt: string, userPrompt: string) {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]
}

async function callNvidia(messages: object[], maxTokens = 2048): Promise<string> {
  const apiKey = process.env.NVIDIA_KEY
  if (!apiKey) throw new Error("NVIDIA_KEY tidak dikonfigurasi di .env.local")

  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta/llama-3.3-70b-instruct",
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`NVIDIA API error (${res.status}): ${errText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

async function callVercel(messages: object[], maxTokens = 2048): Promise<string> {
  const apiKey = process.env.VERCEL_KEY
  if (!apiKey) throw new Error("VERCEL_KEY tidak dikonfigurasi di .env.local")

  const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      messages,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Vercel AI error (${res.status}): ${errText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

async function callAi(
  provider: AiProvider,
  messages: object[],
  maxTokens = 2048
): Promise<string> {
  if (provider === "nvidia") return callNvidia(messages, maxTokens)
  return callVercel(messages, maxTokens)
}

// ─── Step 1: Generate Title Suggestions ──────────────────────────────────────

export async function generateTitleSuggestions(
  input: GenerateTitleSuggestionsInput
): Promise<string[]> {
  const userPrompt = `
Buatkan 5 judul artikel blog SEO-friendly untuk website bengkel aki kendaraan.

Topik/keyword utama: "${input.keyword}"

Aturan judul:
1. Panjang 50-70 karakter (ideal untuk SERP Google)
2. Sertakan keyword utama secara natural
3. Gunakan kata trigger: "Panduan", "Tips", "Cara", "Kenali", "Penyebab", "Rekomendasi", dll.
4. Relevan dengan dunia aki / baterai kendaraan dan konteks Jogja jika perlu
5. JANGAN gunakan angka tahun kecuali relevan
6. JANGAN pakai tanda petik, emoji, atau tanda kurung yang tidak perlu
7. Menarik untuk diklik (click-worthy) namun tidak clickbait

Balas HANYA dengan 5 judul, satu per baris, tanpa nomor, tanpa bullet, tanpa penjelasan tambahan.
`.trim()

  const messages = buildNvidiaMessages(SYSTEM_PROMPT, userPrompt)
  const raw = await callAi(input.provider, messages, 512)

  return raw
    .split("\n")
    .map((l) => l.replace(/^[\d\.\-\*]+\s*/, "").trim())
    .filter((l) => l.length > 0)
    .slice(0, 5)
}

// ─── Step 2: Generate Full Article ───────────────────────────────────────────

export async function generateFullArticle(
  input: GenerateFullArticleInput
): Promise<GenerateFullArticleOutput> {
  const userPrompt = `
Buatkan artikel blog lengkap untuk website AkiMobilJogja berdasarkan judul berikut:

JUDUL: "${input.title}"

Output WAJIB dalam format JSON yang valid dengan struktur ini (tanpa markdown fence, langsung JSON):
{
  "slug": "url-slug-dari-judul",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "excerpt": "Meta description 140-160 karakter yang mengandung keyword utama",
  "content": "KONTEN HTML LENGKAP DISINI"
}

Aturan SLUG:
- Lowercase, gunakan tanda strip (-) sebagai pemisah
- Hilangkan karakter spesial dan tanda baca
- Maksimal 60 karakter
- Sertakan keyword utama

Aturan TAGS (5-7 tag):
- Relevan dengan isi artikel
- Mix: broad tag (aki, aki mobil) + specific tag (aki GS, aki soak, dll.)
- Tidak perlu hashtag #

Aturan EXCERPT:
- 140-160 karakter
- Mengandung keyword utama
- Mendorong user untuk membaca
- Natural dan informatif

Aturan CONTENT (HTML):
- Gunakan heading hierarchy: <h2> untuk section utama, <h3> untuk sub-section
- Panjang minimal 800 kata, idealnya 1200-1500 kata
- Struktur: Intro → 4-6 section utama → Kesimpulan/CTA
- Paragraf pendek (3-5 kalimat), mudah dibaca
- Gunakan <ul><li> atau <ol><li> untuk list
- Sisipkan call-to-action di akhir mengarah ke Siswanto Aki / AkiMobilJogja
- Bold <strong> kata kunci penting secara natural
- Jangan sertakan tag <h1> (sudah ada di halaman)
- Jangan sertakan tag <html>, <head>, <body>
- Konten harus edukatif, berisi fakta teknis tentang aki yang akurat

Balas HANYA dengan JSON yang valid. JANGAN tambahkan markdown code fence, penjelasan, atau teks apapun di luar JSON.
`.trim()

  const messages = buildNvidiaMessages(SYSTEM_PROMPT, userPrompt)
  const raw = await callAi(input.provider, messages, 3000)

  // Strip markdown fences if AI adds them anyway
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    return {
      slug: String(parsed.slug || "").toLowerCase().replace(/\s+/g, "-").slice(0, 80),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
      excerpt: String(parsed.excerpt || "").slice(0, 160),
      content: String(parsed.content || ""),
    }
  } catch {
    // Fallback: try to extract partial JSON
    throw new Error(
      "AI mengembalikan format yang tidak valid. Coba generate ulang.\n\nRaw output:\n" +
      raw.slice(0, 300)
    )
  }
}
