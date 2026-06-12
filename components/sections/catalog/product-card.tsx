"use client"
import { Zap, ShieldCheck, BatteryCharging, Heart, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";

type Specification = {
    kapasitas: string;
    voltase: string;
    polaritas?: string | null;
};

interface ProductCardProps {
    product: {
        id: string;
        slug: string;
        nama: string;
        kategori: string;
        merek: string;
        tipe: string;
        harga_jual: number;
        harga_tukar?: number;
        stok: number;
        garansi?: string;
        gambar?: string;
        kondisi: string;
        specifications: Specification[]
        applications?: { nama_mobil: string }[];
    };
    onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(product.id));
    }, [product.id]);

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        if (isFavorite) {
            const updatedFavorites = favorites.filter((id: string) => id !== product.id);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            setIsFavorite(false);
        } else {
            const updatedFavorites = [...favorites, product.id];
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            setIsFavorite(true);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleWhatsApp = () => {
        const message = `Halo, saya tertarik dengan produk:\n${product.nama}\nHarga: ${formatPrice(product.harga_tukar || product.harga_jual)}`;
        const whatsappNumber = "6281354007400";
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="group border border-border/60 rounded-xl lg:rounded-2xl overflow-hidden hover:border-border transition-all duration-300 bg-card relative">

            <Link href={`/katalog/product/${product.slug}`} className="absolute inset-0 z-20">
                <span className="sr-only">Lihat detail {product.nama}</span>
            </Link>

            <div className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-muted/5 h-44 border-b border-border/50 p-4 flex items-center justify-center">
                {/* Decorative indigo glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/2 rounded-full blur-2xl pointer-events-none" />

                {/* Mobile Ampere Badge Overlay */}
                {product.specifications[0]?.kapasitas && (
                    <div className="absolute top-3 left-3 z-10 md:hidden flex items-center h-8">
                        <div className="bg-primary/10 backdrop-blur-md text-primary border border-primary/20 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-none flex items-center gap-1">
                            <Zap className="size-2.5" />
                            {product.specifications[0].kapasitas}
                        </div>
                    </div>
                )}

                <img
                    src={product.gambar}
                    alt={product.nama}
                    className="w-full h-full object-contain group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 relative z-10 drop-shadow-xl"
                />
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFavorite();
                    }}
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 transition-all z-30 hover:bg-background/80"
                    aria-label={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
                >
                    <Heart
                        className={`size-4 transition-colors ${isFavorite
                            ? 'fill-red-500 text-red-500'
                            : 'text-muted-foreground hover:text-red-400'
                            }`}
                    />
                </Button>
            </div>

            <div className="p-3 space-y-2 relative z-10">
                {/* Pointer events none triggers clicks to pass through to the Link behind, 
                    but we need interactive buttons to work. 
                    Actually, stacking context is tricky. 
                    Better approach: Wrap the whole card content in a div that is NOT a link, 
                    but put Link around specific click areas or make the Link absolute covering everything,
                    and give buttons a higher z-index.
                */}

                <h3 className="text-base font-bold line-clamp-1 leading-tight" title={product.nama}>
                    <Link href={`/katalog/product/${product.slug}`} className="hover:text-primary transition-colors relative z-30">
                        {product.nama}
                    </Link>
                </h3>


                <div className="hidden md:flex gap-3 text-xs text-muted-foreground pointer-events-auto">
                    <div className="flex items-center gap-1">
                        <Zap className="size-3" />
                        <span>{product.specifications[0]?.kapasitas}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ShieldCheck className="size-3" />
                        <span>{product.garansi}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BatteryCharging className="size-3" />
                        <span className="capitalize">{product.tipe}</span>
                    </div>
                </div>


                {product.applications && product.applications.length > 0 && (
                    <div className="hidden md:block pointer-events-auto">
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {product.applications.map(app => app.nama_mobil).join(", ")}
                        </p>
                    </div>
                )}


                <div className="pt-2 mt-auto space-y-2 pointer-events-auto">
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-0.5 md:gap-0">
                        <div>
                            {product.harga_tukar && product.harga_tukar < product.harga_jual && (
                                <p className="text-[10px] md:text-xs text-muted-foreground line-through">
                                    {formatPrice(product.harga_jual)}
                                </p>
                            )}
                            <p className="text-base md:text-lg font-bold text-foreground leading-tight">
                                {formatPrice(product.harga_tukar || product.harga_jual)}
                            </p>
                        </div>
                        <span className="text-[10px] md:text-xs text-muted-foreground italic">
                            *Harga Tukar Tambah
                        </span>
                    </div>


                    <div className="flex gap-2 relative z-30">
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-9 cursor-pointer rounded-full border-border/50 bg-background/50 backdrop-blur hover:bg-muted shadow-none"
                        >
                            <Link href={`/katalog/product/${product.slug}`}>
                                <ArrowRight className="w-4 h-4 md:mr-1" />
                                <span className="hidden md:block">Detail</span>
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleWhatsApp();
                            }}
                            className="flex-1 h-9 cursor-pointer rounded-full bg-linear-to-r from-indigo-600 to-indigo-700 text-white hover:scale-105 transition-all duration-300 shadow-indigo-500/20 border-none"
                        >
                            <ShoppingCart className="w-4 h-4 mr-1.5" />
                            <span className="hidden md:block font-bold">Pesan WA</span>
                            <span className="block md:hidden font-bold">Pesan</span>
                        </Button>

                    </div>
                </div>
            </div>
        </div>
    );
}