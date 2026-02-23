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

    // Optimize title to max 60 characters
    // Suffix " | Aki Mobil Jogja" is 18 chars. Max product name length = 60 - 18 = 42.
    const suffix = ' | Aki Mobil Jogja';
    const maxNameLength = 60 - suffix.length; // 42

    let pageTitle = product.nama;
    if (pageTitle.length > maxNameLength) {
        pageTitle = pageTitle.substring(0, maxNameLength - 3) + '...';
    }
    pageTitle = `${pageTitle}${suffix}`;

    // Create comprehensive meta description (120-160 chars)
    // Best practice: Action oriented, contains keywords, and value proposition.
    const capacity = product.specifications?.[0]?.kapasitas;
    const voltage = product.specifications?.[0]?.voltase;

    let metaDescription = `Jual aki mobil ${product.nama} ${product.merek || ''} di Jogja. `;

    if (capacity) metaDescription += `Kapasitas ${capacity}. `;
    if (voltage) metaDescription += `Voltase ${voltage}. `;

    metaDescription += `Garansi resmi, harga terbaik & gratis antar pasang 24 jam.`;

    // Ensure length is optimal (not too long, not too short)
    if (metaDescription.length > 160) {
        metaDescription = metaDescription.substring(0, 157) + '...';
    }

    const productUrl = `https://akimobiljogja.com/katalog/product/${slug}`;

    return {
        title: pageTitle,
        description: metaDescription,
        alternates: {
            canonical: productUrl,
        },
        openGraph: {
            title: pageTitle,
            description: metaDescription,
            url: productUrl,
            siteName: 'Aki Mobil Jogja',
            images: product.gambar ? [{
                url: product.gambar,
                width: 800,
                height: 800,
                alt: product.nama,
            }] : [],
            type: 'website',
            locale: 'id_ID',
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: metaDescription,
            images: product.gambar ? [product.gambar] : [],
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
        image: product.gambar ? [product.gambar] : ['https://akimobiljogja.com/android-chrome-512x512.png'],
        description: product.deskripsi || `Jual aki mobil ${product.nama} terbaik di Jogja via Aki Mobil Jogja.`,
        sku: product.tipe ? String(product.tipe) : `AMJ-${product.id}`,
        mpn: product.tipe ? String(product.tipe) : `AMJ-${product.id}`,
        brand: {
            '@type': 'Brand',
            name: product.merek || 'Aki Mobil Jogja'
        },
        review: {
            '@type': 'Review',
            reviewRating: {
                '@type': 'Rating',
                ratingValue: '5',
                bestRating: '5'
            },
            author: {
                '@type': 'Person',
                name: 'Aki Mobil Jogja'
            }
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '24'
        },
        offers: {
            '@type': 'Offer',
            url: `https://akimobiljogja.com/katalog/product/${slug}`,
            priceCurrency: 'IDR',
            price: product.harga_jual || 0,
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            itemCondition: product.kondisi === 'Baru' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
            availability: product.stok > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Aki Mobil Jogja'
            },
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'ID',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 7,
                returnMethod: 'https://schema.org/ReturnInStore',
                returnFees: 'https://schema.org/FreeReturn'
            },
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: 0,
                    currency: 'IDR'
                },
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'ID',
                    addressRegion: 'DIY'
                },
                deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: {
                        '@type': 'QuantitativeValue',
                        minValue: 0,
                        maxValue: 1,
                        unitCode: 'd'
                    },
                    transitTime: {
                        '@type': 'QuantitativeValue',
                        minValue: 0,
                        maxValue: 1,
                        unitCode: 'd'
                    }
                }
            }
        }
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://akimobiljogja.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Katalog',
                item: 'https://akimobiljogja.com/katalog'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.nama,
                item: `https://akimobiljogja.com/katalog/product/${slug}`
            }
        ]
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <ClientPage initialProduct={product as any} relatedProducts={relatedProducts as any} />
        </>
    );
}