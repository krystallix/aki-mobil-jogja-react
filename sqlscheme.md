-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.aki_lama (
id uuid NOT NULL DEFAULT gen_random_uuid(),
transaction_id text,
keterangan text NOT NULL,
nilai bigint NOT NULL DEFAULT 0,
status text NOT NULL DEFAULT 'belum_dijual'::text CHECK (status = ANY (ARRAY['belum_dijual'::text, 'terjual'::text])),
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT aki_lama_pkey PRIMARY KEY (id),
CONSTRAINT aki_lama_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
CREATE TABLE public.applications (
id bigint NOT NULL DEFAULT nextval('applications_id_seq'::regclass),
product_id text NOT NULL,
nama_mobil text NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
CONSTRAINT applications_pkey PRIMARY KEY (id),
CONSTRAINT applications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.artikel (
id uuid NOT NULL DEFAULT gen_random_uuid(),
title text NOT NULL,
slug text NOT NULL UNIQUE,
content text NOT NULL,
excerpt text,
featured_image text,
tags ARRAY DEFAULT '{}'::text[],
status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
view_count integer DEFAULT 0,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
published_at timestamp with time zone,
CONSTRAINT artikel_pkey PRIMARY KEY (id)
);
CREATE TABLE public.battery_types (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
code text NOT NULL UNIQUE,
category text,
capacity_20hr integer,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT battery_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.brands (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
name text NOT NULL UNIQUE,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT brands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customers (
id uuid NOT NULL DEFAULT gen_random_uuid(),
nama text NOT NULL,
no_hp text,
alamat text,
kota text,
total_pembelian integer NOT NULL DEFAULT 0,
total_nilai_pembelian bigint NOT NULL DEFAULT 0,
pertama_beli timestamp with time zone,
terakhir_beli timestamp with time zone,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
id text NOT NULL DEFAULT ('BAT'::text || lpad((nextval('products_seq'::regclass))::text, 3, '0'::text)),
nama text NOT NULL,
kategori text NOT NULL,
merek text NOT NULL,
tipe text NOT NULL,
harga_modal bigint NOT NULL,
harga_tukar bigint,
harga_jual bigint NOT NULL,
stok integer NOT NULL DEFAULT 10,
garansi text,
gambar text,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
kondisi text DEFAULT 'baru'::text,
CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.specifications (
id bigint NOT NULL DEFAULT nextval('specifications_id_seq'::regclass),
product_id text NOT NULL UNIQUE,
kapasitas text NOT NULL,
voltase text NOT NULL,
panjang integer,
lebar integer,
tinggi integer,
satuan_ukuran text DEFAULT 'mm'::text,
berat numeric,
polaritas text,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
CONSTRAINT specifications_pkey PRIMARY KEY (id),
CONSTRAINT specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.transaction_items (
id bigint NOT NULL DEFAULT nextval('transaction_items_id_seq'::regclass),
transaction_id text NOT NULL,
product_id text NOT NULL,
nama_produk text NOT NULL,
merek text NOT NULL,
tipe_produk text NOT NULL,
qty integer NOT NULL DEFAULT 1,
harga_modal bigint NOT NULL,
harga_jual bigint NOT NULL,
harga_tukar bigint,
subtotal bigint NOT NULL,
garansi text,
created_at timestamp with time zone DEFAULT now(),
kondisi text DEFAULT 'baru'::text,
nilai_aki_lama numeric DEFAULT 0,
CONSTRAINT transaction_items_pkey PRIMARY KEY (id),
CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.transactions (
id text NOT NULL DEFAULT ((('INV-'::text || to_char(now(), 'YYYY'::text)) || '-'::text) || lpad((nextval('transactions_seq'::regclass))::text, 4, '0'::text)),
customer_id uuid,
customer_nama text NOT NULL,
customer_no_hp text,
customer_alamat text,
tipe text NOT NULL DEFAULT 'jual'::text CHECK (tipe = ANY (ARRAY['jual'::text, 'beli'::text, 'tukar_tambah'::text])),
status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'paid'::text, 'cancelled'::text])),
subtotal bigint NOT NULL DEFAULT 0,
diskon bigint NOT NULL DEFAULT 0,
total bigint NOT NULL DEFAULT 0,
catatan text,
dibuat_oleh text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
paid_at timestamp with time zone,
CONSTRAINT transactions_pkey PRIMARY KEY (id),
CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.vehicle_battery_applications (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
vehicle_id uuid NOT NULL,
application_type text NOT NULL CHECK (application_type = ANY (ARRAY['STANDARD'::text, 'UPGRADE'::text, 'CALCIUM_UPGRADE'::text])),
battery_type_id uuid,
notes text,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT vehicle_battery_applications_pkey PRIMARY KEY (id),
CONSTRAINT vehicle_battery_applications_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id),
CONSTRAINT vehicle_battery_applications_battery_type_id_fkey FOREIGN KEY (battery_type_id) REFERENCES public.battery_types(id)
);
CREATE TABLE public.vehicles (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
brand_id uuid NOT NULL,
model text NOT NULL,
year_start integer,
year_end integer,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT vehicles_pkey PRIMARY KEY (id),
CONSTRAINT vehicles_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);
