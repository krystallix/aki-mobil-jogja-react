"use client"

import { useCallback, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CropImageDialogProps {
  open: boolean
  src: string
  fileName: string
  onCancel: () => void
  onConfirm: (blob: Blob) => void
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.src = src
  })
}

async function getCroppedBlob(src: string, pixelCrop: Area): Promise<Blob> {
  const image = await loadImage(src)
  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas tidak didukung")

  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Gagal memproses gambar"))
      },
      "image/jpeg",
      0.92
    )
  })
}

const ASPECT_OPTIONS: Array<{ label: string; value: number | undefined }> = [
  { label: "Bebas", value: undefined },
  { label: "Persegi", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
]

export function CropImageDialog({
  open,
  src,
  fileName,
  onCancel,
  onConfirm,
}: CropImageDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [completedArea, setCompletedArea] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCropComplete = useCallback(
    (_area: Area, croppedAreaPixels: Area) => {
      setCompletedArea(croppedAreaPixels)
    },
    []
  )

  const handleConfirm = async () => {
    if (!completedArea) return
    setIsProcessing(true)
    try {
      const blob = await getCroppedBlob(src, completedArea)
      onConfirm(blob)
    } catch (error) {
      console.error("Crop error:", error)
      setIsProcessing(false)
    }
  }

  const handleAspectChange = (value: number | undefined) => {
    setAspect(value)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent
        className="sm:max-w-2xl rounded-[1.5rem]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Crop Gambar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-[320px] sm:h-[400px] w-full overflow-hidden rounded-xl border border-border/60 bg-black/90">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              showGrid
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {ASPECT_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleAspectChange(option.value)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    aspect === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">
                Zoom
              </span>
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="w-10 text-right text-xs font-mono text-muted-foreground">
                {zoom.toFixed(2)}x
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {fileName} — geser gambar di area crop untuk memilih bagian yang
              diinginkan.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Lewati (Tanpa Crop)
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing || !completedArea}>
            {isProcessing ? "Memproses..." : "Terapkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
