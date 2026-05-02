"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/supabase/queries";
import {
    Zap,
    ShieldCheck,
    BatteryCharging,
    Heart,
    Share2,
    Phone,
    CheckCircle2,
    Truck,
    Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HomeLayout from "@/components/layouts/home-layout";
import { FaWhatsapp } from "react-icons/fa";
import ProductCard from "@/components/sections/catalog/product-card";

type Specification = {
    kapasitas: string;
    voltase: string;
    polaritas?: string | null;
};

type Product = {
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
    specifications: Specification[];
    applications?: { nama_mobil: string }[];
    deskripsi?: string;
    fitur?: string[];
};

export default function ProductDetailPage({ initialProduct, relatedProducts: initialRelated }: { initialProduct: Product, relatedProducts?: Product[] }) {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [product, setProduct] = useState<Product | null>(initialProduct);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelated || []);

    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (product) {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setIsFavorite(favorites.includes(product.id));
        }
    }, [product]);

    const toggleFavorite = () => {
        if (!product) return;

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
        if (!product) return;
        const message = `Halo, saya tertarik dengan produk:\n${product.nama}\nHarga: ${formatPrice(product.harga_tukar || product.harga_jual)}`;
        const whatsappNumber = "6281354007400";
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleCall = () => {
        window.location.href = "tel:+6281354007400";
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.nama,
                    text: `Check out ${product?.nama}`,
                    url: window.location.href,
                });
            } catch (err) {
                // Ignore share errors
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Product not found.</p>
            </div>
        )
    }

    // Use main image
    const mainImage = product.gambar || "/placeholder-battery.jpg";

    return (
        <HomeLayout>
            <div className="min-h-screen pb-20">
                {/* Clean, transparent breadcrumb */}
                <div className="container mx-auto px-6 py-8 max-w-7xl">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/katalog" className="hover:text-primary transition-colors">Katalog</Link>
                        <span>/</span>
                        <span className="text-foreground line-clamp-1">{product.nama}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16 lg:mb-24">
                        {/* Left Column - Image Gallery */}
                        <div className="space-y-6">
                            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-transparent border border-border/50 overflow-hidden flex items-center justify-center p-8 lg:p-12 group">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                                
                                <img
                                    src={mainImage}
                                    alt={product.nama}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 relative z-10"
                                />
                                
                                <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="rounded-full bg-background/80 backdrop-blur-sm border-border/50 shadow-sm hover:text-primary hover:border-primary/50"
                                        onClick={toggleFavorite}
                                        aria-label={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
                                    >
                                        <Heart
                                            className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                                        />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="rounded-full bg-background/80 backdrop-blur-sm border-border/50 shadow-sm hover:text-primary hover:border-primary/50"
                                        onClick={handleShare}
                                        aria-label="Bagikan produk"
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                                {product.kondisi === "Baru" && (
                                    <Badge className="absolute top-6 left-6 bg-green-500 text-white border-0 shadow-sm px-3 py-1 text-xs font-bold z-20">
                                        Baru
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Product Info */}
                        <div className="flex flex-col justify-center space-y-8">
                            {/* Header */}
                            <div className="space-y-4">
                                <Badge variant="outline" className="text-xs font-bold tracking-widest uppercase border-primary/30 bg-primary/5 text-primary px-3 py-1 rounded-full">
                                    {product.merek}
                                </Badge>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-foreground leading-[1.1]">
                                    {product.nama}
                                </h1>
                            </div>

                            {/* Price Box */}
                            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                
                                {product.harga_tukar && product.harga_tukar < product.harga_jual ? (
                                    <div className="space-y-1 relative z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm md:text-base text-muted-foreground line-through font-medium">
                                                {formatPrice(product.harga_jual)}
                                            </p>
                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold text-primary bg-primary/10 border border-primary/20">
                                                Tukar Tambah
                                            </Badge>
                                        </div>
                                        <p className="text-4xl md:text-5xl font-black text-primary tracking-tight">
                                            {formatPrice(product.harga_tukar)}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-4xl md:text-5xl font-black text-foreground tracking-tight relative z-10">
                                        {formatPrice(product.harga_jual)}
                                    </p>
                                )}
                            </div>

                            {/* Bento Grid Specifications */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Spesifikasi Teknis
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors group/spec">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Kapasitas</p>
                                        <p className="font-bold text-lg text-foreground group-hover/spec:text-primary transition-colors">{product.specifications[0]?.kapasitas || '-'}</p>
                                    </div>
                                    <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors group/spec">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Voltase</p>
                                        <p className="font-bold text-lg text-foreground group-hover/spec:text-primary transition-colors">{product.specifications[0]?.voltase || '-'}</p>
                                    </div>
                                    <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors group/spec">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Tipe Baterai</p>
                                        <p className="font-bold text-lg text-foreground capitalize group-hover/spec:text-primary transition-colors">{product.tipe}</p>
                                    </div>
                                    <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors group/spec">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Garansi</p>
                                        <p className="font-bold text-lg text-foreground group-hover/spec:text-primary transition-colors">{product.garansi || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Compatible Vehicles */}
                            {product.applications && product.applications.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Cocok Untuk Kendaraan</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.applications.map((app, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-muted text-muted-foreground hover:text-foreground font-medium rounded-lg px-3 py-1.5 border border-border/50">
                                                {app.nama_mobil}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-6 pt-6 border-t border-border/50">
                                <div className="flex gap-4">
                                    <Button
                                        size="lg"
                                        className="flex-1 h-14 rounded-full text-base font-bold bg-green-600 hover:bg-green-700 shadow-none hover:scale-[1.02] transition-all"
                                        onClick={handleWhatsApp}
                                    >
                                        <FaWhatsapp className="mr-2 h-6 w-6" />
                                        Konsultasi & Pesan via WA
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-14 w-14 rounded-full border-border/50 shadow-none hover:text-primary hover:border-primary/50 transition-all shrink-0 p-0 hover:scale-105"
                                        onClick={handleCall}
                                        aria-label="Telepon dan jadwalkan ganti aki"
                                    >
                                        <Phone className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                                    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl">
                                        <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                                            <Truck className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-foreground">Gratis Antar<br/>Pasang</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl">
                                        <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-foreground">Garansi<br/>Resmi</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl">
                                        <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-foreground">100%<br/>Original</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                <div className="container mx-auto px-6 max-w-7xl pt-10 lg:pt-16 border-t border-border/50">
                    {relatedProducts.length > 0 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tighter text-foreground">
                                    Baterai Serupa ({product.specifications[0]?.kapasitas})
                                </h2>
                                <p className="text-muted-foreground mt-2">Rekomendasi aki lain dengan kapasitas yang sesuai untuk Anda.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                                {relatedProducts.slice(0, 4).map((relProduct) => (
                                    <ProductCard 
                                        key={relProduct.id} 
                                        product={relProduct}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </HomeLayout>
    );
}
