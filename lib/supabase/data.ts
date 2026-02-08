import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

// Cache the product fetch for the request life-cycle
export const getProductBySlug = cache(async (slug: string) => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      specifications (
        kapasitas,
        voltase,
        polaritas,
        panjang,
        lebar,
        tinggi,
        berat
      ),
      applications (
        nama_mobil
      )
    `)
        .eq("id", slug)
        .single();

    if (error || !data) {
        console.error("Error fetching product server-side:", error);
        return null;
    }

    // Format consistent with client-side expectation
    const specs = Array.isArray(data.specifications)
        ? data.specifications
        : data.specifications
            ? [data.specifications]
            : [];

    return {
        ...data,
        specifications: specs,
        applications: data.applications || [],
    };
});

export const getAllProducts = cache(async () => {
    const supabase = await createClient();
    const { data } = await supabase
        .from("products")
        .select("id, created_at")
        .order("created_at", { ascending: false });
    return data || [];
});

export const getRelatedProducts = cache(async (capacity: string, excludeId: string) => {
    const supabase = await createClient();

    const { data } = await supabase
        .from("products")
        .select(`
            id, nama, gambar, harga_jual, harga_tukar, merek, tipe,
            specifications!inner (kapasitas)
        `)
        .eq("specifications.kapasitas", capacity)
        .neq("id", excludeId)
        .limit(4);

    return data || [];
});

export const getAllArticles = cache(async () => {
    const supabase = await createClient();
    const { data } = await supabase
        .from("artikel")
        .select("slug, updated_at")
        .eq("status", "published")
        .order("created_at", { ascending: false });
    return data || [];
});

export const getArticleBySlug = cache(async (slug: string) => {
    const supabase = await createClient();
    const { data } = await supabase
        .from("artikel")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
    return data;
});

export const getArticles = cache(async (limit = 10) => {
    const supabase = await createClient();
    const { data } = await supabase
        .from("artikel")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(limit);
    return data || [];
});
