# SEO Analysis — Siswanto Aki (akimobiljogja.com)

## 1. Business Overview

| Aspect | Details |
|---|---|
| **Business** | Siswanto Aki — Toko & servis aki mobil |
| **Location** | Kanggotan No. 21, Pleret, Bantul, DIY, 55791 |
| **Phone** | 0813-5400-7400 / 0882-2796-8449 |
| **Hours** | Mon-Sun 00:00-23:59 (24/7) |
| **Founded** | 2000 (26+ tahun) |
| **Domain** | https://akimobiljogja.com |
| **Social** | Instagram (@siswantoaki.jogja), TikTok (@akimobiljogja), Facebook |

**Products:** Aki Basah, Aki Kering/MF, Aki Hybrid — brands: GS Astra, Yuasa, Incoe, Panasonic, Chilwee

**Services:** Servis/reparasi, tukar tambah, antar pasang 24 jam, cek aki gratis, konsultasi

---

## 2. Site Architecture

| Route | Page | SEO Status |
|---|---|---|
| `/` | Homepage | ✅ Good |
| `/tentang-kami` | About | ❌ No metadata export |
| `/katalog` | Catalog | ✅ Good |
| `/katalog/product/[slug]` | Product Detail | ✅ Good |
| `/artikel` | Article Listing | ✅ Good |
| `/artikel/[slug]` | Article Detail | ✅ Good |
| `/rekomendasi-aki` | Battery Recommendation | ✅ Fixed |
| `/kebijakan-pengembalian` | Return Policy | ⚠️ Missing JSON-LD |
| `/invoice/[id]` | Invoice | noindex |

**Redirects:** `/aki` → `/katalog` (301), `/aki/:slug*` → `/katalog/product/:slug*` (301)

---

## 3. Current SEO Implementation

### Metadata

| Page | Title | Description |
|---|---|---|
| **Home** | `Siswanto Aki Jogja - Servis Aki & Tukar Tambah Aki Mobil Bantul 24 Jam` | ✅ Optimal |
| **Catalog** | `Katalog Aki Mobil - Harga Terbaru | Siswanto Aki` | ✅ Optimal |
| **Articles** | `Artikel & Tips Aki Mobil - Panduan Lengkap | Siswanto Aki` | ✅ Optimal |
| **Battery Rec** | `Rekomendasi Aki Kendaraan | Siswanto Aki` | ✅ Fixed |
| **About** | Layout fallback | ❌ Missing |
| **Return** | `Kebijakan Pengembalian | Siswanto Aki` | ✅ Good |

### JSON-LD Structured Data

| Schema Type | Pages | Status |
|---|---|---|
| `AutoPartsStore` | Homepage | ✅ |
| `Product` + `Offer` | Product Detail | ✅ (with price, availability, return policy, shipping) |
| `BlogPosting` | Article Detail | ✅ |
| `BreadcrumbList` | Catalog, Articles, About, Battery Rec | ✅ |
| `CollectionPage` | Catalog, Articles | ✅ |
| `AboutPage` | About | ✅ |
| `FAQPage` | Homepage FAQ | ✅ Added |
| `WebApplication` | Battery Rec | ✅ Added |

### Robots & Sitemap

- `robots.txt` — Allows `/`, disallows `/dashboard/`, `/login/`, `/_next/`
- `Sitemap` — Dynamic, covers: `/`, `/tentang-kami`, `/katalog`, `/artikel`, all articles, all products
- Missing from sitemap: `/rekomendasi-aki`, `/kebijakan-pengembalian`

---

## 4. Keyword Strategy

### Priority 1 — Local Dominance (Jogja/Bantul)

| Query | Intent |
|---|---|
| `toko aki jogja` | Commercial |
| `servis aki bantul` | Commercial |
| `ganti aki mobil jogja` | Transactional |
| `tukar tambah aki jogja` | Transactional |
| `antar pasang aki bantul` | Transactional |
| `toko aki 24 jam jogja` | Commercial |
| `bengkel aki jogja` | Commercial |
| `toko aki terdekat jogja` | Commercial |

### Priority 2 — Brand Keywords

| Query |
|---|
| `siswanto aki` |
| `siswanto aki jogja` |
| `siswantoaki.jogja` |

### Priority 3 — Product & Pricing

| Query | Intent |
|---|---|
| `harga aki mobil gs astra` | Transactional |
| `harga aki yuasa jogja` | Transactional |
| `harga aki mobil kering` | Commercial |
| `aki mobil murah jogja` | Transactional |
| `aki mobil untuk avanza` | Transactional |

### Priority 4 — Informational (Article Topics)

| Query | Article Idea |
|---|---|
| `cara merawat aki mobil` | Perawatan aki |
| `penyebab aki mobil tekor` | Troubleshooting |
| `aki mobil soak penyebab` | Troubleshooting |
| `perbedaan aki basah dan aki kering` | Comparison |
| `cara memilih aki mobil yang tepat` | Buying guide |
| `umur aki mobil berapa tahun` | Informational |
| `rekomendasi aki mobil terbaik` | Recommendation |

### Priority 5 — Long-tail & Voice Search

| Query |
|---|
| `tukar tambah aki mobil bekas jogja harga murah` |
| `toko aki mobil yang buka 24 jam di jogja` |
| `service aki mobil panggilan di bantul` |
| `tempat beli aki mobil original di jogja` |
| `layanan antar pasang aki mobil jogja` |

---

## 5. Technical Gaps & Fixes

| Issue | Page | Priority |
|---|---|---|
| ❌ No metadata export | `/tentang-kami` | **High** |
| ❌ Missing from sitemap | `/rekomendasi-aki`, `/kebijakan-pengembalian` | **Medium** |
| ⚠️ No JSON-LD | `/kebijakan-pengembalian` | **Medium** |
| ⚠️ Product URLs use DB ID | `/katalog/product/BAT001` | Low |
| ⚠️ No FAQPage schema on FAQ | Homepage | ✅ Fixed |
| ⚠️ No OG image on rec page | `/rekomendasi-aki` | ✅ Fixed |

---

## 6. Recommendations Summary

1. **Add metadata** to `/tentang-kami`
2. **Add JSON-LD** to `/kebijakan-pengembalian`
3. **Add missing routes** to sitemap
4. **Expand article topics** — target problem-based queries (aki soak, tekor, mesin susah starter)
5. **Build Google Business Profile** — ensure NAP matches JSON-LD exactly
6. **Switch product URLs** to SEO-friendly slugs (e.g., `/katalog/product/aki-gs-astra-ns40`)
7. **Add FAQPage schema** — ✅ Done
8. **Fix recommendation page SEO** — ✅ Done
