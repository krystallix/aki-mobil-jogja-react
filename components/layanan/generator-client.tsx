"use client"

import React, { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import html2canvas from "html2canvas-pro"
import { DownloadIcon, RefreshCwIcon, PaletteIcon, Search, Package, Zap, ShieldCheck, Globe, Check, ClipboardList, Facebook, Sparkles, ChevronDown } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GeneratorClientProps {
  products: any[]
}

export default function GeneratorClient({ products }: GeneratorClientProps) {
  const printRef1 = useRef<HTMLDivElement>(null)
  const printRef2 = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [scale, setScale] = useState(0.4)
  const [search, setSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [activeSlide, setActiveSlide] = useState<1 | 2>(1)
  const [isCopied, setIsCopied] = useState(false)
  const [aiTitles, setAiTitles] = useState<string[]>([])
  const [selectedAiTitle, setSelectedAiTitle] = useState<string>("")
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [showTitlePanel, setShowTitlePanel] = useState(false)

  // Handle responsive scale for the preview
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        // We want the 1080px canvas to fit exactly inside the container
        setScale(width / 1080)
      }
    }

    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [])

  // Set initial selected product
  useEffect(() => {
    if (products?.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0])
    }
  }, [products, selectedProduct])

  const filteredProducts = products?.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.merek?.toLowerCase().includes(search.toLowerCase())
  ) || []

  // Shared description text — used in both the panel and the API payload
  const getDescText = () => {
    if (!selectedProduct) return ""
    const apps = selectedProduct.applications?.slice(0, 15).map((app: any) => `- ${app.nama_mobil}`).join('\n') || '-'
    const moreApps = selectedProduct.applications?.length > 15 ? '\n- ... dan lainnya' : ''
    return [
      `🌟 ${cleanName} 🌟`,
      ``,
      `📊 SPESIFIKASI:`,
      `- Merek: ${selectedProduct.merek}`,
      `- Tipe: ${cleanName}`,
      `- Kategori: ${selectedProduct.kategori}`,
      `- Kapasitas: ${capacityValue}`,
      `- Garansi: ${selectedProduct.garansi || '-'}`,
      ``,
      `🚗 APLIKASI KENDARAAN:`,
      apps + moreApps,
      ``,
      `💰 HARGA:`,
      `- Harga Baru: ${formatRupiah(selectedProduct.harga_jual)}`,
      `- Harga Tukar Tambah: ${formatRupiah(selectedProduct.harga_tukar)}`,
      ``,
      `🛠️ LAYANAN:`,
      `- ✅ Gratis Antar Pasang (Jogja & Sekitarnya)`,
      `- ✅ Garansi Resmi`,
      `- ✅ Cek Aki & Dinamo Gratis`,
      ``,
      `📞 INFO & PEMESANAN:`,
      `WhatsApp: 0813 5400 7400`,
      `Website: akimobiljogja.com`,
    ].join('\n')
  }

  const generateAiTitle = async () => {
    if (!selectedProduct || isGeneratingTitle) return
    setIsGeneratingTitle(true)
    setShowTitlePanel(true)
    setAiTitles([])
    setSelectedAiTitle("")
    try {
      const apps = selectedProduct.applications?.slice(0, 8).map((a: any) => a.nama_mobil) || []
      const rawSpec = selectedProduct.specifications
      const spec = (Array.isArray(rawSpec) ? rawSpec[0] : rawSpec) || {}
      const res = await fetch("/api/ai-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merek: selectedProduct.merek,
          nama: cleanName,
          kapasitas: spec.kapasitas || "",
          kategori: selectedProduct.kategori,
          aplikasi: apps,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal generate judul")
      const titles: string[] = data.titles || []
      setAiTitles(titles)
      if (titles.length > 0) setSelectedAiTitle(titles[0])
    } catch (err: any) {
      toast.error(`Gagal generate judul AI: ${err.message}`)
    } finally {
      setIsGeneratingTitle(false)
    }
  }

  const postToFacebook = () => {
    if (!selectedProduct || isPosting || !printRef1.current) return
    setIsPosting(true)

    const node = printRef1.current

    const doPost = async () => {
      const tags = [
        selectedProduct.merek?.toLowerCase(),
        selectedProduct.nama?.toLowerCase().replace(/\s+/g, "-"),
        "aki",
        "aki mobil",
        "aki motor",
        "aki sepeda listrik",
        "servis aki",
        "siswantoaki",
        "akimobiljogja",
      ].filter(Boolean) as string[]

      // Render slide 1 → base64
      const originalTransform = node.style.transform
      node.style.transform = "none"
      const canvas = await html2canvas(node, { scale: 1, useCORS: true, backgroundColor: "#ffffff" })
      node.style.transform = originalTransform
      const rawBase64 = canvas.toDataURL("image/png").split(",")[1]
      const images: string[] = rawBase64 ? [rawBase64] : []

      const payload = {
        title: selectedAiTitle || `AKI ${cleanName} BARU BERGARANSI`,
        price: String(Math.floor((selectedProduct.harga_tukar || 0) / 1000)),
        category: "Auto Parts",
        condition: selectedProduct.kondisi?.toLowerCase() === "baru" ? "new" : "used",
        description: getDescText(),
        tags,
        images,
      }

      const res = await fetch("https://fbm.arkane.my.id/api/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error")
        throw new Error(`Server error ${res.status}: ${errText}`)
      }
    }

    toast.promise(doPost().finally(() => setIsPosting(false)), {
      loading: "Sedang memposting ke Facebook Marketplace...",
      success: "Berhasil diposting ke Facebook Marketplace!",
      error: (err: any) => `Gagal posting: ${err?.message ?? "Coba lagi nanti"}`,
    })
  }

  const handleDownload = async () => {
    if (!printRef1.current || !printRef2.current || !selectedProduct) return
    setIsGenerating(true)

    try {
      const downloadNode = async (node: HTMLDivElement, filename: string) => {
        const originalTransform = node.style.transform;
        node.style.transform = 'none';
        const canvas = await html2canvas(node, {
          scale: 1,
          useCORS: true,
          backgroundColor: "#ffffff",
        })
        node.style.transform = originalTransform;

        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = filename
        link.href = dataUrl
        link.click()
        await new Promise(r => setTimeout(r, 400))
      }

      const slug = selectedProduct.nama.replace(/\s+/g, '-').toLowerCase()
      await downloadNode(printRef1.current, `post-${slug}-slide1.png`)
      await downloadNode(printRef2.current, `post-${slug}-slide2.png`)

    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)

  const rawSpec = selectedProduct?.specifications
  const spec = (Array.isArray(rawSpec) ? rawSpec[0] : rawSpec) || {}
  const cleanName = selectedProduct?.nama ? selectedProduct.nama.replace(/\s*\(.*?\)\s*/g, '').trim() : ""
  const capacityValue = spec.kapasitas ? spec.kapasitas.replace(/ah/gi, 'AH').trim() : ""

  const isBaru = selectedProduct?.kondisi?.toLowerCase() === 'baru'

  const copyToClipboard = () => {
    if (!selectedProduct) return

    navigator.clipboard.writeText(getDescText())
    toast.success("Teks spesifikasi berhasil disalin!")
    setIsCopied(true)
  }

  const getTheme = (merek: string, kategori: string) => {
    const m = merek?.toLowerCase() || ""
    const k = kategori?.toLowerCase() || ""

    // Helper to generate consistent light theme structure
    const createTheme = (primary: string, secondary: string) => ({
      slideBg: `linear-gradient(to top right, #ffffff, #f1f5f9)`,
      accent: primary, accentBright: secondary,
      titleColor: secondary, subtitleColor: primary,
      badgeBg: primary, badgeText: "#ffffff",
      zapColor: primary, shieldColor: primary,
      divider: `${secondary}20`,
      footerColor: primary,
      urlColor: primary, dotColor: primary,
      watermarkColor: `${secondary}08`,
      accentBar: primary, labelColor: primary,
      newBadgeBg: secondary, newBadgeText: "#ffffff",
      slide2Accent: primary,
    })

    if (m.includes("incoe")) return createTheme("#1d4ed8", "#1e3a8a")
    if (m.includes("msb")) return createTheme("#b91c1c", "#7f1d1d")
    if (m.includes("gs") && (m.includes("hybrid") || k.includes("hybrid"))) return createTheme("#16a34a", "#166534")
    if (m.includes("gs")) return createTheme("#166534", "#052e16")
    if (m.includes("aspira") && (m.includes("hybrid") || k.includes("hybrid"))) return createTheme("#d97706", "#7c2d12")
    if (m.includes("aspira")) return createTheme("#334155", "#0f172a")
    if (m.includes("chilwee")) return createTheme("#15803d", "#064e3b")
    if (k.includes("jasa")) return createTheme("#7e22ce", "#4c1d95") // Purple theme

    return createTheme("#334155", "#0f172a")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 mx-auto w-full">
      {/* Left Sidebar - Product List */}
      <div className="lg:col-span-3 space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-border flex flex-col h-[700px]">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-1">Pilih Produk</h2>
          <p className="text-xs text-muted-foreground">Pilih produk untuk membuat konten promosi.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau merek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-border/60"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2 custom-scrollbar">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedProduct(p)
                setActiveSlide(1)
              }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${selectedProduct?.id === p.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:border-primary/30 hover:bg-slate-50'}`}
            >
              <div className="w-12 h-12 relative rounded-lg bg-white border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                {p.gambar ? (
                  <Image src={p.gambar} alt={p.nama} fill className="object-contain p-1" />
                ) : (
                  <Package className="w-5 h-5 text-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{p.nama}</p>
                <p className="text-xs font-semibold text-primary">{formatRupiah(p.harga_jual)}</p>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="w-8 h-8 text-muted-foreground/20 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Tidak ada produk</p>
            </div>
          )}
        </div>

      </div>

      {/* Middle Area - Copy Text Card */}
      <div className="lg:col-span-4 flex flex-col gap-4 h-[700px]">
        <Card className="rounded-3xl border-border shadow-sm h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 bg-slate-50/50 border-b">
            <CardTitle className="text-lg flex justify-between items-center gap-2">
              <span>Deskripsi</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateAiTitle}
                  disabled={!selectedProduct || isGeneratingTitle}
                  className="h-8 px-3 gap-1.5 text-xs font-semibold border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-400 transition-all"
                  title="Generate judul AI yang menarik untuk posting"
                >
                  {isGeneratingTitle
                    ? <RefreshCwIcon className="w-3 h-3 animate-spin" />
                    : <Sparkles className="w-3 h-3" />}
                  AI Title
                </Button>
                <Button size="icon" variant="outline" onClick={copyToClipboard} className="bg-background h-8 w-8">
                  {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <ClipboardList className="w-4 h-4" />}
                </Button>
              </div>
            </CardTitle>

            {/* AI Title Panel */}
            {showTitlePanel && (
              <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/70 p-3 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-bold text-violet-600 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Judul AI — Pilih yang terbaik
                  </p>
                  <button
                    onClick={() => setShowTitlePanel(false)}
                    className="text-[10px] text-violet-400 hover:text-violet-700 transition-colors"
                  >
                    tutup
                  </button>
                </div>

                {isGeneratingTitle && (
                  <div className="flex items-center gap-2 text-violet-500 text-xs py-2">
                    <RefreshCwIcon className="w-3 h-3 animate-spin" />
                    <span>Generating dengan NVIDIA AI...</span>
                  </div>
                )}

                {aiTitles.map((title, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAiTitle(title)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all leading-snug ${selectedAiTitle === title
                      ? "border-violet-500 bg-white text-violet-800 font-semibold shadow-sm"
                      : "border-violet-100 bg-white/60 text-slate-700 hover:border-violet-300 hover:bg-white"
                      }`}
                  >
                    {selectedAiTitle === title && <span className="text-violet-500 mr-1">✓</span>}
                    {title}
                  </button>
                ))}

                {!isGeneratingTitle && aiTitles.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">Belum ada judul. Klik AI Title untuk generate.</p>
                )}

                {selectedAiTitle && (
                  <div className="pt-1 border-t border-violet-200 mt-1">
                    <p className="text-[10px] text-violet-500 font-medium">✅ Judul ini akan dipakai saat post ke Facebook Marketplace</p>
                  </div>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col">
            {selectedProduct ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 overflow-y-auto max-h-[600px] custom-scrollbar bg-white">
                  <pre className="text-xs font-mono leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {getDescText()}
                  </pre>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground opacity-50 px-6 text-center">
                <ClipboardList className="w-12 h-12 mb-4" />
                <p className="text-sm">Pilih produk untuk melihat deskripsi copy-paste</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Area - Canvas Preview */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-200/30 p-4 lg:p-6 rounded-3xl border border-border/50 h-[700px] overflow-hidden relative">
        <div className="flex items-center justify-between w-full max-w-[600px] mb-4">
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <PaletteIcon className="w-4 h-4" />
            Live Preview (Slide {activeSlide}/2)
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-border p-1 rounded-lg shadow-xs">
              <Button variant="ghost" size="sm" onClick={() => setActiveSlide(1)} className={`h-8 px-3 text-xs rounded-md ${activeSlide === 1 ? 'text-primary bg-primary/5 font-bold' : ''}`}>Slide 1</Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveSlide(2)} className={`h-8 px-3 text-xs rounded-md ${activeSlide === 2 ? 'text-primary bg-primary/5 font-bold' : ''}`}>Slide 2</Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              onClick={handleDownload}
              disabled={isGenerating || !selectedProduct}
              size="icon"
              className="h-10 w-10 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isGenerating ? <RefreshCwIcon className="h-5 w-5 animate-spin" /> : <DownloadIcon className="h-5 w-5" />}
            </Button>

            <Button
              onClick={postToFacebook}
              disabled={!selectedProduct || isPosting}
              size="icon"
              variant="outline"
              title="Post ke Facebook Marketplace"
              className="h-10 w-10 rounded-xl shadow-md hover:shadow-lg transition-all border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {isPosting
                ? <RefreshCwIcon className="h-5 w-5 animate-spin" />
                : <Facebook className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* The Container defining the maximum display size */}
        <div
          ref={containerRef}
          className="relative w-full aspect-square max-w-[600px] shadow-2xl rounded-sm overflow-hidden bg-white shrink-0"
        >
          {selectedProduct ? (
            <div className="w-full h-full relative">

              {/* SLIDE 1 - Themed by battery type */}
              {(() => {
                const t = getTheme(selectedProduct.merek, selectedProduct.kategori)
                const whatsappPath = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.894-5.335 11.897-11.893a11.821 11.821 0 00-3.48-8.413Z"
                return (
                  <div
                    ref={printRef1}
                    className="w-[1080px] h-[1080px] absolute top-0 origin-top-left flex flex-col overflow-hidden px-16 py-14 transition-opacity duration-300"
                    style={{ transform: `scale(${scale})`, background: t.slideBg }}
                  >
                    {/* Background grid + watermark */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${t.watermarkColor} 1px, transparent 1px), linear-gradient(90deg, ${t.watermarkColor} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden">
                        <div className="flex flex-wrap gap-x-8 gap-y-12 w-[200%] h-[200%] -rotate-45 justify-center items-center">
                          {Array.from({ length: 500 }).map((_, i) => (
                            <span key={i} className="text-4xl font-black uppercase whitespace-nowrap" style={{ color: t.watermarkColor }}>Siswanto Aki</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-col h-full w-full">
                      {/* Header */}
                      <div className="flex justify-between items-start w-full mb-2">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4 mb-2">
                            {isBaru && (
                              <div className="px-8 py-1 rounded-full font-black text-3xl" style={{ background: t.newBadgeBg, color: t.newBadgeText }}>NEW!!!</div>
                            )}
                            <div className="px-8 py-1 rounded-full font-black text-3xl" style={{ background: t.newBadgeBg, color: t.newBadgeText }}>
                              GRATIS ANTAR PASANG
                            </div>
                          </div>
                          <h1 className="text-[72px] leading-none font-black tracking-tighter uppercase max-w-[800px]" style={{ color: t.titleColor }}>
                            {cleanName}
                          </h1>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-full mt-4 mb-4" style={{ borderTop: `3px dotted ${t.divider}` }} />

                      {/* Product image */}
                      <div className="flex-1 flex items-center justify-center relative w-full my-4">
                        {selectedProduct.gambar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={selectedProduct.gambar} alt={selectedProduct.nama}
                            className="w-full max-w-[850px] max-h-[600px] object-contain relative z-10"
                            style={{ filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.5))" }}
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <Package className="w-48 h-48" style={{ color: t.accent }} />
                        )}
                      </div>

                      {/* Footer badges */}
                      <div className="mt-auto pt-4">
                        <div className="flex justify-start gap-10 items-center mb-10 px-2">
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold uppercase tracking-widest ml-1" style={{ color: t.labelColor }}>Kategori</span>
                            <div className="px-6 py-1 rounded-full text-2xl font-black uppercase tracking-tighter" style={{ background: t.badgeBg, color: t.badgeText }}>
                              {selectedProduct.kategori}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold uppercase tracking-widest ml-1" style={{ color: t.labelColor }}>Kapasitas</span>
                            <div className="text-4xl font-black uppercase tracking-tighter flex items-center gap-2" style={{ color: t.titleColor }}>
                              <Zap className="w-7 h-7" style={{ color: t.zapColor }} />
                              {capacityValue}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold uppercase tracking-widest ml-1" style={{ color: t.labelColor }}>Garansi</span>
                            <div className="text-4xl font-black uppercase tracking-tighter flex items-center gap-2" style={{ color: t.titleColor }}>
                              <ShieldCheck className="w-7 h-7" style={{ color: t.shieldColor }} />
                              {selectedProduct.garansi || "Garansi"}
                            </div>
                          </div>
                        </div>
                        <div className="w-full mb-4" style={{ borderTop: `1px solid ${t.divider}` }} />
                        <div className="flex justify-between items-center px-2">
                          <div className="flex items-center gap-2 text-2xl font-bold" style={{ color: t.footerColor }}>
                            <svg className="w-7 h-7" style={{ fill: t.footerColor }} viewBox="0 0 24 24"><path d={whatsappPath} /></svg>
                            <span>0813 5400 7400</span>
                          </div>
                          <div className="text-2xl font-bold flex gap-2 items-center lowercase" style={{ color: t.urlColor }}>
                            <Globe className="w-8 h-8" style={{ color: t.urlColor }} />
                            <span>akimobiljogja.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* SLIDE 2 - Themed by battery type */}
              {(() => {
                const t = getTheme(selectedProduct.merek, selectedProduct.kategori)
                const whatsappPath = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.894-5.335 11.897-11.893a11.821 11.821 0 00-3.48-8.413Z"
                return (
                  <div
                    ref={printRef2}
                    className={`w-[1080px] h-[1080px] absolute top-0 origin-top-left flex flex-col overflow-hidden px-16 py-14 transition-opacity duration-300 ${activeSlide === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                    style={{ transform: `scale(${scale})`, background: t.slideBg }}
                  >
                    {/* Background grid + watermark */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${t.watermarkColor} 1px, transparent 1px), linear-gradient(90deg, ${t.watermarkColor} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden">
                        <div className="flex flex-wrap gap-x-8 gap-y-12 w-[200%] h-[200%] -rotate-45 justify-center items-center">
                          {Array.from({ length: 300 }).map((_, i) => (
                            <span key={i} className="text-lg font-black uppercase whitespace-nowrap" style={{ color: t.watermarkColor }}>Siswanto Aki</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-col h-full w-full">
                      {/* Header */}
                      <div className="flex flex-col items-center text-center w-full pt-4 mb-12">
                        <h2 className="text-[64px] leading-none font-black tracking-tighter uppercase mb-2" style={{ color: t.titleColor }}>
                          APLIKASI KENDARAAN
                        </h2>
                        <div className="w-[400px] h-1.5 rounded-full mt-4" style={{ background: t.slide2Accent }} />
                      </div>

                      {/* Vehicle list */}
                      <div className="flex-1 w-full flex flex-col items-center">
                        {selectedProduct.applications && selectedProduct.applications.length > 0 ? (
                          <div className="grid grid-cols-2 gap-x-16 gap-y-4 max-w-[950px] w-full mt-4">
                            {selectedProduct.applications.slice(0, 23).map((app: any, i: number) => (
                              <div key={i} className="flex items-center gap-4 font-bold text-[24px] tracking-tight" style={{ color: t.accentBright }}>
                                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: t.dotColor }} />
                                <span className="truncate">{app.nama_mobil}</span>
                              </div>
                            ))}
                            {selectedProduct.applications.length > 23 && (
                              <div className="flex items-center gap-4 font-bold text-[24px] tracking-tight italic" style={{ color: t.subtitleColor }}>
                                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: t.dotColor, opacity: 0.4 }} />
                                <span>Dan lainnya...</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full opacity-30" style={{ color: t.titleColor }}>
                            <Package className="w-32 h-32 mb-4" />
                            <p className="text-3xl font-bold">Daftar mobil tidak tersedia</p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                        <div className="flex justify-between items-center px-2 pb-2">
                          <div className="flex items-center gap-2 text-2xl font-bold" style={{ color: t.footerColor }}>
                            <svg className="w-7 h-7" style={{ fill: t.footerColor }} viewBox="0 0 24 24"><path d={whatsappPath} /></svg>
                            <span>0813 5400 7400</span>
                          </div>
                          <div className="text-2xl font-bold flex gap-2 items-center lowercase" style={{ color: t.urlColor }}>
                            <Globe className="w-8 h-8" style={{ color: t.urlColor }} />
                            <span>akimobiljogja.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
              <Package className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">Pilih produk untuk melihat preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
