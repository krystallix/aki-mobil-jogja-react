"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Sparkles,
  ChevronDown,
  Loader2,
  Check,
  ArrowRight,
  RefreshCw,
  Cpu,
  Zap,
} from "lucide-react"
import type { ArticleData } from "@/lib/supabase/queries"

type AiProvider = "nvidia" | "vercel"

interface AiArtikelGeneratorProps {
  /** Called when AI has fully generated the article fields */
  onGenerated: (data: Partial<ArticleData>) => void
}

const PROVIDER_META: Record<AiProvider, { label: string; icon: React.ReactNode; color: string }> =
{
  nvidia: {
    label: "NVIDIA AI",
    icon: <Cpu className="w-3.5 h-3.5" />,
    color: "text-green-600",
  },
  vercel: {
    label: "Vercel AI",
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "text-slate-800",
  },
}

export default function AiArtikelGenerator({ onGenerated }: AiArtikelGeneratorProps) {
  const [provider, setProvider] = useState<AiProvider>("nvidia")
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"keyword" | "titles" | "generating">("keyword")

  const [keyword, setKeyword] = useState("")
  const [isLoadingTitles, setIsLoadingTitles] = useState(false)
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null)
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false)

  const providerMeta = PROVIDER_META[provider]

  const resetState = () => {
    setStep("keyword")
    setKeyword("")
    setSuggestedTitles([])
    setSelectedTitle(null)
    setIsLoadingTitles(false)
    setIsGeneratingArticle(false)
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) resetState()
    setOpen(val)
  }

  // ── Step 1: Get title suggestions ─────────────────────────────────────────
  const handleSuggestTitles = async () => {
    if (!keyword.trim()) {
      toast.error("Masukkan keyword/topik terlebih dahulu.")
      return
    }
    setIsLoadingTitles(true)
    setSuggestedTitles([])
    setSelectedTitle(null)
    try {
      const res = await fetch("/api/ai-artikel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest-titles", provider, keyword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal generate judul")
      setSuggestedTitles(data.titles || [])
      setStep("titles")
    } catch (err: any) {
      toast.error(`Gagal generate judul: ${err.message}`)
    } finally {
      setIsLoadingTitles(false)
    }
  }

  // ── Step 2: Generate full article from selected title ─────────────────────
  const handleGenerateArticle = async () => {
    if (!selectedTitle) {
      toast.error("Pilih salah satu judul terlebih dahulu.")
      return
    }
    setIsGeneratingArticle(true)
    setStep("generating")
    try {
      const res = await fetch("/api/ai-artikel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-article", provider, title: selectedTitle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal generate artikel")

      onGenerated({
        title: selectedTitle,
        slug: data.slug,
        tags: data.tags,
        excerpt: data.excerpt,
        content: data.content,
      })

      toast.success("Artikel berhasil digenerate oleh AI! Silakan review dan edit sebelum publish.")
      setOpen(false)
      resetState()
    } catch (err: any) {
      toast.error(`Gagal generate artikel: ${err.message}`)
      setStep("titles")
    } finally {
      setIsGeneratingArticle(false)
    }
  }

  return (
    <>
      {/* ── Trigger Button with Provider Dropdown ─────────────────────────── */}
      <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-violet-200 shadow-sm">
        <Button
          onClick={() => setOpen(true)}
          className="gap-1.5 h-10 px-3 rounded-none rounded-l-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Generate
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`h-10 px-2 rounded-none rounded-r-xl border-0 border-l border-violet-300 bg-violet-50 hover:bg-violet-100 ${providerMeta.color} font-bold text-xs transition-all gap-1`}
            >
              {providerMeta.icon}
              <span className="hidden sm:inline">{providerMeta.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/60 shadow-xl">
            <DropdownMenuLabel className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Pilih AI Provider
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={provider}
              onValueChange={(v) => setProvider(v as AiProvider)}
            >
              <DropdownMenuRadioItem
                value="nvidia"
                className="cursor-pointer text-[13px] font-medium rounded-lg gap-2"
              >
                <Cpu className="w-3.5 h-3.5 text-green-600" />
                <span>NVIDIA AI</span>
                <Badge variant="secondary" className="ml-auto text-[9px] px-1.5">
                  Llama 70B
                </Badge>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="vercel"
                className="cursor-pointer text-[13px] font-medium rounded-lg gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-slate-700" />
                <span>Vercel AI</span>
                <Badge variant="secondary" className="ml-auto text-[9px] px-1.5">
                  Openai/gpt-4o
                </Badge>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Main Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[540px] rounded-[1.5rem] border border-border/60 shadow-2xl bg-background/98 backdrop-blur-2xl overflow-hidden p-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold tracking-tight">
                  AI Artikel Generator
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5">
                  {providerMeta.icon}
                  <span className={providerMeta.color + " font-bold"}>{providerMeta.label}</span>
                  &nbsp;·&nbsp; SEO Specialist + Teknisi Aki
                </p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mt-4">
              {[
                { key: "keyword", label: "Keyword" },
                { key: "titles", label: "Pilih Judul" },
                { key: "generating", label: "Generate" },
              ].map((s, i) => {
                const isActive =
                  s.key === step ||
                  (step === "generating" && s.key === "titles") ||
                  (step === "titles" && s.key === "keyword")
                const isDone =
                  (step === "titles" && s.key === "keyword") ||
                  (step === "generating" && s.key !== "generating")
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 ${isDone
                          ? "bg-violet-600 border-violet-600 text-white"
                          : s.key === step
                            ? "bg-violet-100 border-violet-400 text-violet-700"
                            : "bg-muted border-border/50 text-muted-foreground"
                        }`}
                    >
                      {isDone ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${s.key === step ? "text-violet-700" : "text-muted-foreground"
                        }`}
                    >
                      {s.label}
                    </span>
                    {i < 2 && <div className="w-6 h-px bg-border/60" />}
                  </div>
                )
              })}
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="px-6 py-5 space-y-4 min-h-[200px]">
            {/* ── Step: Keyword ─────────────────────────────────────────────── */}
            {step === "keyword" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">
                    Topik / Keyword Artikel
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Masukkan topik atau kata kunci utama. AI akan menyarankan 5 judul artikel SEO-friendly.
                  </p>
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSuggestTitles()}
                    placeholder="Contoh: aki mobil soak, aki GS Jogja, cara rawat aki..."
                    className="h-11 rounded-xl border-border/60 text-sm font-medium"
                    autoFocus
                  />
                </div>

                <div className="rounded-xl bg-violet-50/70 border border-violet-200/60 p-3 space-y-1.5">
                  <p className="text-[11px] font-extrabold text-violet-700 uppercase tracking-wider">
                    💡 Saran Topik
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "aki mobil soak penyebab",
                      "rekomendasi aki GS Jogja",
                      "perbedaan aki basah dan MF",
                      "aki motor listrik terbaik",
                      "cara merawat aki agar awet",
                      "gejala aki lemah",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => setKeyword(s)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-violet-200 text-violet-700 font-semibold hover:bg-violet-100 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step: Choose Title ────────────────────────────────────────── */}
            {(step === "titles" || (step === "generating" && suggestedTitles.length > 0)) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-bold">Pilih Judul Artikel</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Klik judul yang ingin digunakan, lalu klik tombol Generate.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSuggestTitles}
                    disabled={isLoadingTitles}
                    className="h-7 px-2 text-xs gap-1 text-muted-foreground"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingTitles ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>

                <div className="space-y-2">
                  {isLoadingTitles ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI sedang menyusun judul...</span>
                    </div>
                  ) : (
                    suggestedTitles.map((title, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTitle(title)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm leading-snug ${selectedTitle === title
                            ? "border-violet-500 bg-violet-50 text-violet-900 font-bold shadow-sm"
                            : "border-border/60 bg-background hover:border-violet-300 hover:bg-violet-50/30 text-foreground font-medium"
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${selectedTitle === title
                                ? "border-violet-500 bg-violet-500"
                                : "border-border"
                              }`}
                          >
                            {selectedTitle === title && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                          {title}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Step: Generating ─────────────────────────────────────────── */}
            {step === "generating" && isGeneratingArticle && (
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-violet-600 animate-pulse" />
                </div>
                <div>
                  <p className="font-extrabold text-base">AI sedang menulis artikel...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Menggunakan {providerMeta.label} · Mungkin butuh 15-30 detik
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menulis slug, tags, excerpt, dan konten artikel...
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 flex-row gap-2 sm:gap-0 justify-between">
            {step === "keyword" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="h-10 rounded-xl font-bold"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSuggestTitles}
                  disabled={isLoadingTitles || !keyword.trim()}
                  className="h-10 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white gap-2"
                >
                  {isLoadingTitles ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Saran Judul
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </>
            ) : step === "titles" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep("keyword")}
                  className="h-10 rounded-xl font-bold"
                >
                  ← Kembali
                </Button>
                <Button
                  onClick={handleGenerateArticle}
                  disabled={!selectedTitle || isGeneratingArticle}
                  className="h-10 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Artikel
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
