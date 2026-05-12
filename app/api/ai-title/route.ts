import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { merek, nama, kapasitas, kategori, aplikasi } = await req.json()

  const apiKey = process.env.NVIDIA_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "NVIDIA_KEY not configured" }, { status: 500 })
  }

  // Build context about the product
  const appsSnippet = (aplikasi as string[] | undefined)?.slice(0, 5).join(", ") || ""

  const prompt = `Kamu adalah copywriter marketplace Indonesia yang ahli SEO untuk Facebook Marketplace dan Tokopedia.

Buat 5 judul produk yang menarik dan SEO-friendly untuk posting produk aki (baterai kendaraan) berikut:
- Merek: ${merek}
- Tipe/Model: ${nama}
- Kapasitas: ${kapasitas}
- Kategori: ${kategori}
- Cocok untuk kendaraan: ${appsSnippet}

Aturan judul:
1. Panjang 40–80 karakter
2. Gunakan kata kunci yang orang cari: merk, kapasitas, tipe mobil, harga murah, bergaransi, dll
3. Boleh pakai huruf kapital parsial untuk penekanan
4. JANGAN pakai emoji
5. Formatnya natural seperti orang mengetik di search bar
6. Contoh bagus: "Aki Mobil Incoe NS60 40AH Baru Bergaransi Murah Jogja"

Balas HANYA dengan 5 judul, satu per baris, tanpa nomor atau bullet point.`

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: `NVIDIA API error: ${errText}` }, { status: response.status })
    }

    const data = await response.json()
    const rawText: string = data.choices?.[0]?.message?.content ?? ""

    // Parse lines, filter empty
    const titles = rawText
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)

    return NextResponse.json({ titles })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
