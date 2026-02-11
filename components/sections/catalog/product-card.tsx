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
        <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white relative">
            <Link href={`/katalog/product/${product.id}`} className="absolute inset-0 z-0">
                <span className="sr-only">Lihat detail {product.nama}</span>
            </Link>

            <div className="relative overflow-hidden bg-muted-foreground/5 h-40">
                <img
                    src={product.gambar}
                    alt={product.nama}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 relative z-0"
                />
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFavorite();
                    }}
                    variant="ghost"
                    className="absolute top-2 right-2 p-1.5 transition-all z-10"
                >
                    <Heart
                        className={`size-4 transition-colors ${isFavorite
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400 hover:text-red-400'
                            }`}
                    />
                </Button>
            </div>


            <div className="p-3 space-y-2 relative z-10 pointer-events-none">
                {/* Pointer events none triggers clicks to pass through to the Link behind, 
                    but we need interactive buttons to work. 
                    Actually, stacking context is tricky. 
                    Better approach: Wrap the whole card content in a div that is NOT a link, 
                    but put Link around specific click areas or make the Link absolute covering everything,
                    and give buttons a higher z-index.
                */}

                <h3 className="text-base font-semibold line-clamp-2 leading-tight pointer-events-auto" title={product.nama}>
                    {/* Make title a link too just to be safe for SEO/accessibility if the overlay link is missed */}
                    <Link href={`/katalog/product/${product.id}`} className="hover:underline">
                        {product.nama}
                    </Link>
                </h3>


                <div className="flex gap-3 text-xs text-muted-foreground pointer-events-auto">
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
                    <p className="text-xs text-muted-foreground line-clamp-1 pointer-events-auto">
                        {product.applications.map(app => app.nama_mobil).join(", ")}
                    </p>
                )}


                <div className="pt-2 border-t space-y-2 pointer-events-auto">
                    <div className="flex items-baseline justify-between">
                        <div>
                            {product.harga_tukar && product.harga_tukar < product.harga_jual && (
                                <p className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.harga_jual)}
                                </p>
                            )}
                            <p className="text-lg font-bold">
                                {formatPrice(product.harga_tukar || product.harga_jual)}
                            </p>
                        </div>
                        <span className="text-xs text-muted-foreground italic">
                            *Harga Tukar Tambah
                        </span>

                    </div>


                    <div className="flex gap-2">
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 cursor-pointer"
                        >
                            <Link href={`/katalog/product/${product.id}`}>
                                <ArrowRight className="w-3.5 h-3.5 mr-1" />
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
                            className="flex-1 h-8 cursor-pointer"
                        >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                            <span className="hidden md:block">Chat Via Whatsapp</span>
                            <span className="block md:hidden">Chat WA</span>
                        </Button>

                    </div>
                </div>
            </div>
        </div>
    );
}