import { getProductBySlug, getRelatedProducts } from '@/lib/supabase/data';
import ClientPage from './client-page';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JsonLd from '@/components/json-ld';

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: 'Produk Tidak Ditemukan - Aki Mobil Jogja',
        };
    }

    return {
        title: `${product.nama} - Jual Aki Mobil Jogja`,
        description: `Beli ${product.nama} harga terbaik di Jogja. ${product.deskripsi ? product.deskripsi.substring(0, 150) : 'Layanan ganti aki 24 jam.'}`,
        openGraph: {
            title: product.nama,
            description: product.deskripsi?.substring(0, 150) || product.nama,
            images: product.gambar ? [product.gambar] : [],
            type: 'website',
        },
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;

    // Fetch product
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    // Fetch related products
    let relatedProducts: any[] = [];
    if (product.specifications && product.specifications.length > 0 && product.specifications[0].kapasitas) {
        relatedProducts = await getRelatedProducts(product.specifications[0].kapasitas, product.id);
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.nama,
        image: product.gambar ? [product.gambar] : [],
        description: product.deskripsi || product.nama,
        brand: {
            '@type': 'Brand',
            name: product.merek || 'Unknown'
        },
        offers: {
            '@type': 'Offer',
            url: `https://akimobiljogja.com/katalog/product/${product.id}`,
            priceCurrency: 'IDR',
            price: product.harga_jual,
            priceValidUntil: '2025-12-31',
            itemCondition: product.kondisi === 'Baru' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
            availability: product.stok > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Aki Mobil Jogja'
            }
        }
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <ClientPage initialProduct={product as any} relatedProducts={relatedProducts as any} />
        </>
    );
}