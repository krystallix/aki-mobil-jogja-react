# 🔋 Siswanto Aki

Website e-commerce modern untuk toko aki mobil di Yogyakarta dengan fitur manajemen produk dan artikel blog.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

## ✨ Fitur Utama

### 🛍️ E-Commerce
- **Katalog Produk** - Tampilan grid produk dengan filter dan pencarian
- **Detail Produk** - Halaman detail dengan spesifikasi lengkap dan produk terkait
- **Kategori & Filter** - Filter berdasarkan merek, kategori, dan tipe
- **Harga Tukar Tambah** - Dukungan untuk harga tukar tambah aki lama

### 📝 Blog & Artikel
- **Sistem Artikel** - Blog dengan rich text editor (TipTap)
- **Kategori & Tags** - Organisasi artikel dengan tags
- **SEO Optimized** - Meta tags, Open Graph, dan structured data
- **Featured Images** - Upload dan manajemen gambar artikel

### 🎨 Dashboard Admin
- **Manajemen Produk** - CRUD lengkap untuk produk aki
- **Manajemen Artikel** - Editor artikel dengan preview
- **Upload Gambar** - Drag & drop image upload ke Supabase Storage
- **Data Table** - Tabel interaktif dengan sorting dan filtering

### 🚀 Fitur Teknis
- **Server-Side Rendering** - SSR untuk SEO optimal
- **Dynamic Routing** - Routing dinamis untuk produk dan artikel
- **Image Optimization** - Next.js Image component
- **Responsive Design** - Mobile-first design
- **Authentication** - Supabase Auth untuk admin
- **Real-time Database** - Supabase PostgreSQL

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/ui
- **Rich Text Editor**: TipTap
- **State Management**: React Hooks
- **Form Handling**: React Hook Form

### Backend
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes

### UI Components
- **Component Library**: Shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)
- **Tables**: TanStack Table

## 📦 Instalasi

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Akun Supabase

### Setup Project

1. **Clone repository**
```bash
git clone https://github.com/krystallix/aki-mobil-jogja-react.git
cd aki-mobil-jogja-react
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Setup Supabase Database**

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Tabel Produk
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  merek TEXT NOT NULL,
  tipe TEXT NOT NULL,
  harga_modal NUMERIC,
  harga_jual NUMERIC NOT NULL,
  harga_tukar NUMERIC,
  stok INTEGER DEFAULT 0,
  garansi TEXT,
  gambar TEXT,
  kondisi TEXT DEFAULT 'baru',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Spesifikasi
CREATE TABLE specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  kapasitas TEXT,
  voltase TEXT,
  polaritas TEXT,
  panjang NUMERIC,
  lebar NUMERIC,
  tinggi NUMERIC,
  berat NUMERIC
);

-- Tabel Aplikasi Mobil
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  nama_mobil TEXT NOT NULL
);

-- Tabel Artikel
CREATE TABLE artikel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft',
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Function untuk increment view count
CREATE OR REPLACE FUNCTION increment_article_view(row_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE artikel SET view_count = view_count + 1 WHERE slug = row_slug;
END;
$$ LANGUAGE plpgsql;
```

5. **Setup Supabase Storage**

Buat buckets berikut di Supabase Storage:
- `product-images` (public)
- `article-images` (public)

6. **Run development server**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📁 Struktur Folder

```
akimobiljogja-react/
├── app/                      # Next.js App Router
│   ├── artikel/             # Halaman artikel
│   ├── dashboard/           # Admin dashboard
│   ├── katalog/             # Halaman katalog
│   ├── login/               # Halaman login
│   └── tentang-kami/        # Halaman tentang kami
├── components/              # React components
│   ├── katalog/            # Komponen katalog
│   ├── sections/           # Section components
│   ├── tiptap-node/        # TipTap custom nodes
│   ├── tiptap-ui/          # TipTap UI components
│   └── ui/                 # Shadcn/ui components
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities & helpers
│   └── supabase/           # Supabase client & queries
│       ├── articles.ts     # Article CRUD
│       ├── products.ts     # Product CRUD
│       ├── storage.ts      # Storage operations
│       ├── types.ts        # TypeScript types
│       └── utils.ts        # Helper functions
├── public/                  # Static assets
├── styles/                  # Global styles
└── types/                   # TypeScript definitions
```

## 🔑 Fitur Keamanan

- **Protected Routes** - Middleware untuk proteksi halaman admin
- **Row Level Security** - RLS di Supabase untuk keamanan data
- **Environment Variables** - Sensitive data di environment variables
- **Image Validation** - Validasi ukuran dan tipe file upload

## 🎨 Kustomisasi

### Mengubah Tema
Edit file `app/globals.css` untuk mengubah color scheme:

```css
@layer base {
  :root {
    --primary: 210 100% 50%;
    --secondary: 210 40% 96%;
    /* ... */
  }
}
```

### Menambah Kategori Produk
Edit komponen filter di `components/sections/catalog/filter-section.tsx`

## 📱 Responsive Design

Website fully responsive dengan breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Deploy ke Vercel

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy!

### Build untuk Production

```bash
npm run build
npm start
```

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail

## 👨‍💻 Developer

Dikembangkan dengan ❤️ untuk Siswanto Aki

## 🤝 Kontribusi

Kontribusi selalu welcome! Silakan buat issue atau pull request.

## 📞 Kontak

- Website: [akimobiljogja.com](https://akimobiljogja.com)
- WhatsApp: +62 813 5400 7400

---

**Built with Next.js 15 & Supabase** 🚀
