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
            <div className="min-h-screen bg-background my-10">
                {/* Breadcrumb */}
                <div className="border-b bg-white">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-primary">Home</Link>
                            <span>/</span>
                            <Link href="/katalog" className="hover:text-primary">Katalog</Link>
                            <span>/</span>
                            <span className="text-foreground">{product.nama}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-6">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column - Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center p-4 relative">
                                <img
                                    src={mainImage}
                                    alt={product.nama}
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full"
                                        onClick={toggleFavorite}
                                        aria-label={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
                                    >
                                        <Heart
                                            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''
                                                }`}
                                        />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full"
                                        onClick={handleShare}
                                        aria-label="Bagikan produk"
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                                {product.kondisi === "Baru" && (
                                    <Badge className="absolute top-4 left-4 bg-green-500">
                                        Baru
                                    </Badge>
                                )}
                            </div>


                        </div>

                        {/* Right Column - Product Info */}
                        <div className="space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Badge variant="outline" className="mb-2">
                                            {product.merek}
                                        </Badge>
                                        <h1 className="text-2xl md:text-3xl font-bold">
                                            {product.nama}
                                        </h1>
                                    </div>
                                </div>

                            </div>

                            {/* Price */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                {product.harga_tukar && product.harga_tukar < product.harga_jual && (
                                    <div>
                                        <p className="text-sm text-muted-foreground line-through">
                                            {formatPrice(product.harga_jual)}
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-3xl font-bold text-primary">
                                                {formatPrice(product.harga_tukar)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            *Harga Tukar Tambah
                                        </p>
                                    </div>
                                )}
                                {!product.harga_tukar && (
                                    <p className="text-3xl font-bold">
                                        {formatPrice(product.harga_jual)}
                                    </p>
                                )}
                            </div>

                            {/* Specifications */}
                            <div className="space-y-3">
                                <h3 className="font-semibold">Spesifikasi Teknis</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                        <Zap className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Kapasitas</p>
                                            <p className="font-semibold">{product.specifications[0]?.kapasitas || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                        <BatteryCharging className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Voltase</p>
                                            <p className="font-semibold">{product.specifications[0]?.voltase || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Tipe</p>
                                            <p className="font-semibold capitalize">{product.tipe}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                        <div className="h-5 w-5 flex items-center justify-center text-primary font-bold">
                                            <ShieldCheck />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Garansi</p>
                                            <p className="font-semibold">{product.garansi}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Compatible Vehicles */}
                            {product.applications && product.applications.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold">Cocok Untuk Kendaraan</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.applications.map((app, idx) => (
                                            <Badge key={idx} variant="secondary">
                                                {app.nama_mobil}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex gap-3">
                                    <Button
                                        size="lg"
                                        className="flex-1"
                                        onClick={handleWhatsApp}
                                    >
                                        <FaWhatsapp className="mr-2 h-5 w-5" />
                                        Chat WhatsApp
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={handleCall}
                                        aria-label="Telepon dan jadwalkan ganti aki"
                                    >
                                        <Phone className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded">
                                        <Truck className="h-4 w-4 text-primary" />
                                        <span className="text-muted-foreground">Gratis Ongkir</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded">
                                        <Award className="h-4 w-4 text-primary" />
                                        <span className="text-muted-foreground">Garansi Resmi</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        <span className="text-muted-foreground">100% Original</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Related Products Section - Below main content */}
                <div className="container mx-auto px-4 pb-8">
                    {relatedProducts.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                Baterai Lainnya ({product.specifications[0]?.kapasitas})
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {relatedProducts.map((relProduct) => (
                                    <Link
                                        key={relProduct.id}
                                        href={`/katalog/product/${relProduct.id}`}
                                        className="group relative block rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all bg-white hover:shadow-md"
                                    >
                                        {/* Image Container */}
                                        <div className="aspect-square bg-muted p-3">
                                            <img
                                                src={relProduct.gambar || "/placeholder-battery.jpg"}
                                                alt={relProduct.nama}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-3 space-y-1.5">
                                            <p className="text-sm font-medium line-clamp-2 text-left leading-tight text-foreground">
                                                {relProduct.nama}
                                            </p>
                                            <div className="flex items-center justify-between gap-1.5">
                                                <p className="text-sm font-bold text-primary">
                                                    {relProduct.harga_tukar && relProduct.harga_tukar < relProduct.harga_jual
                                                        ? formatPrice(relProduct.harga_tukar)
                                                        : formatPrice(relProduct.harga_jual)
                                                    }
                                                </p>
                                                {relProduct.harga_tukar && relProduct.harga_tukar < relProduct.harga_jual && (
                                                    <Badge className="text-[10px] px-1.5 py-0.5 h-5" variant="secondary">
                                                        Tukar Tambah
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </HomeLayout>
    );
}
