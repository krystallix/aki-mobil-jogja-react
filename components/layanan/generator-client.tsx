"use client"

import React, { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import html2canvas from "html2canvas-pro"
import { DownloadIcon, RefreshCwIcon, PaletteIcon, Search, Package, Zap, ShieldCheck, Globe, Check, ClipboardList, Facebook } from "lucide-react"
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
      `🌟 ${selectedProduct.merek} ${cleanName} 🌟`,
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

  const postToFacebook = () => {
    if (!selectedProduct || isPosting || !printRef1.current) return
    setIsPosting(true)

    const node = printRef1.current

    const doPost = async () => {
      const tags = [
        selectedProduct.merek?.toLowerCase(),
        selectedProduct.nama?.toLowerCase().replace(/\s+/g, "-"),
        "aki",
        "aki-mobil",
        "aki-motor",
        "auto-parts",
        "sparepart",
        "tukar-tambah",
        "siswanto-aki",
        "jogja",
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
        title: `AKI ${cleanName} BARU BERGARANSI`,
        price: String(selectedProduct.harga_tukar),
        category: "Auto Parts",
        condition: selectedProduct.kondisi?.toLowerCase() === "baru" ? "new" : "used",
        description: getDescText(),
        tags,
        images,
      }

      const res = await fetch("http://192.168.232.115:8080/api/listing", {
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
      loading: "⏳ Sedang memposting ke Facebook Marketplace...",
      success: "✅ Berhasil diposting ke Facebook Marketplace!",
      error: (err: any) => `❌ Gagal posting: ${err?.message ?? "Coba lagi nanti"}`,
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

  const spec = selectedProduct?.specifications?.[0] || {}
  const cleanName = selectedProduct?.nama ? selectedProduct.nama.replace(/\s*\(.*?\)\s*/g, '').trim() : ""
  const capacityValue = spec.kapasitas ? spec.kapasitas.replace(/ah/gi, 'AH').trim() : ""

  const isBaru = selectedProduct?.kondisi?.toLowerCase() === 'baru'

  const copyToClipboard = () => {
    if (!selectedProduct) return

    navigator.clipboard.writeText(getDescText())
    toast.success("Teks spesifikasi berhasil disalin!")
    setIsCopied(true)
  }

  const getCategoryStyles = (kategori: string) => {
    const k = kategori?.toLowerCase() || ""
    if (k.includes("kering")) return "bg-slate-900 text-white"
    if (k.includes("basah")) return "bg-indigo-600 text-white"
    if (k.includes("hybrid")) return "bg-emerald-600 text-white"
    return "bg-slate-200 text-slate-700"
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
              <Button size="icon" variant="outline" onClick={copyToClipboard} className="bg-background">
                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <ClipboardList className="w-4 h-4" />}
              </Button>

            </CardTitle>
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

              {/* SLIDE 1 - New Clean Layout from Image */}
              <div
                ref={printRef1}
                className={`w-[1080px] h-[1080px] absolute top-0 origin-top-left flex flex-col bg-linear-to-tr from-white to-slate-300 text-slate-900 overflow-hidden px-16 py-14 transition-opacity duration-300}`}
                style={{ transform: `scale(${scale})` }}
              >
                {/* Background Patterns (BEHIND CONTENT) */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_100%)]" />
                  {/* Repeated Watermark Pattern */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none z-0 overflow-hidden">
                    <div className="flex flex-wrap gap-x-8 gap-y-12 w-[200%] h-[200%] -rotate-45 justify-center items-center">
                      {Array.from({ length: 400 }).map((_, i) => (
                        <span key={i} className="text-lg font-black uppercase whitespace-nowrap text-indigo-700">Siswanto Aki</span>
                      ))}
                    </div>
                  </div>                </div>

                <div className="relative z-10 flex flex-col h-full w-full">
                  {/* Header Row */}
                  <div className="flex justify-between items-start w-full mb-2">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-indigo-500 font-black text-3xl tracking-tight mb-2">
                        {isBaru && (
                          <div className="bg-indigo-600 text-white px-8 py-1 rounded-full font-black text-3xl">
                            NEW!!!
                          </div>
                        )}
                      </div>
                      <h1 className="text-[72px] leading-none font-black text-slate-900 tracking-tighter uppercase max-w-[800px]">
                        {cleanName}
                      </h1>
                    </div>
                  </div>

                  {/* Dotted Divider Top */}
                  <div className="w-full border-t-[3px] border-dotted border-slate-200 mt-4 mb-4" />

                  {/* Main Content Area */}
                  <div className="flex-1 flex items-center justify-center relative w-full my-4">
                    {selectedProduct.gambar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedProduct.gambar}
                        alt={selectedProduct.nama}
                        className="w-full max-w-[850px] max-h-[600px] object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.15)] relative z-10"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <Package className="w-48 h-48 text-slate-200" />
                    )}
                  </div>

                  {/* Footer Section */}
                  <div className="mt-auto pt-4">
                    <div className="flex justify-start gap-10 items-center mb-10 px-2">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori</span>
                        <div className={`px-6 py-1 rounded-full text-2xl font-black uppercase tracking-tighter ${getCategoryStyles(selectedProduct.kategori)}`}>
                          {selectedProduct.kategori}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Kapasitas</span>
                        <div className="text-4xl font-black uppercase text-slate-900 tracking-tighter flex items-center gap-2">
                          <Zap className="w-7 h-7 text-indigo-600" />
                          {capacityValue}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Garansi</span>
                        <div className="text-4xl font-black uppercase text-slate-900 tracking-tighter flex items-center gap-2">
                          <ShieldCheck className="w-7 h-7 text-indigo-600" />
                          {selectedProduct.garansi || "Garansi"}
                        </div>
                      </div>
                    </div>
                    {/* Dotted Divider Bottom */}
                    <div className="w-full border-t border border-slate-200 mb-4" />
                    <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-2 text-2xl font-bold text-slate-500">
                        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.894-5.335 11.897-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        <span>0813 5400 7400</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-500 flex gap-2 items-center lowercase">
                        <Globe className="w-8 h-8 text-indigo-600" />
                        <span className="text-indigo-600">akimobiljogja.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 2 - Vehicle Applications (Clean Style) */}
              <div
                ref={printRef2}
                className={`w-[1080px] h-[1080px] absolute top-0 origin-top-left flex flex-col bg-linear-to-br from-white to-slate-200 text-slate-900 overflow-hidden px-16 py-14 transition-opacity duration-300 ${activeSlide === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                style={{ transform: `scale(${scale})` }}
              >
                {/* Background Patterns (BEHIND CONTENT) */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_100%)]" />
                  {/* Repeated Watermark Pattern */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none z-0 overflow-hidden">
                    <div className="flex flex-wrap gap-x-8 gap-y-12 w-[200%] h-[200%] -rotate-45 justify-center items-center">
                      {Array.from({ length: 400 }).map((_, i) => (
                        <span key={i} className="text-lg font-black uppercase whitespace-nowrap text-indigo-700">Siswanto Aki</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col h-full w-full">
                  <div className="flex flex-col items-center text-center w-full pt-4 mb-12">

                    <h2 className="text-[64px] leading-none font-black text-slate-900 tracking-tighter uppercase mb-2">
                      APLIKASI KENDARAAN
                    </h2>
                    <div className="w-100 h-1.5 bg-indigo-500 rounded-full mt-4"></div>
                  </div>

                  <div className="flex-1 w-full flex flex-col items-center">
                    {selectedProduct.applications && selectedProduct.applications.length > 0 ? (
                      <div className="grid grid-cols-2 gap-x-16 gap-y-4 max-w-[950px] w-full mt-4">
                        {selectedProduct.applications.slice(0, 23).map((app: any, i: number) => (
                          <div key={i} className="flex items-center gap-4 text-slate-800 font-bold text-[24px] tracking-tight">
                            <div className="w-4 h-4 bg-indigo-500 rounded-full shrink-0"></div>
                            <span className="truncate">{app.nama_mobil}</span>
                          </div>
                        ))}
                        {selectedProduct.applications.length > 23 && (
                          <div className="flex items-center gap-4 text-slate-500 font-bold text-[24px] tracking-tight italic">
                            <div className="w-4 h-4 bg-slate-300 rounded-full shrink-0"></div>
                            <span>Dan lainnya...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-30">
                        <Package className="w-32 h-32 mb-4" />
                        <p className="text-3xl font-bold">Daftar mobil tidak tersedia</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Section */}
                  <div className="mt-auto pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center px-2 pb-2">
                      <div className="flex items-center gap-2 text-2xl font-bold text-slate-500">
                        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.894-5.335 11.897-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        <span>0813 5400 7400</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-500 flex gap-2 items-center lowercase">
                        <Globe className="w-8 h-8 text-indigo-600" />
                        <span className="text-indigo-600">akimobiljogja.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
