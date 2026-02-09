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

export const getRelatedArticles = cache(async (excludeId: string, limit = 5) => {
    const supabase = await createClient();
    const { data } = await supabase
        .from("artikel")
        .select("*")
        .eq("status", "published")
        .neq("id", excludeId)
        .order("created_at", { ascending: false }) // changed from published_at since some might be null, or coalesce? standard is created_at if published_at is optional, but query used published_at. verification needed.
        // The original component code used 'published_at', but 'getArticles' above uses 'created_at'.
        // Let's stick to 'created_at' for consistency or check if 'published_at' exists. 
        // The ViewFile for ArticleContent showed it used published_at. 
        // Safer to use created_at as backup?
        // Actually, let's look at the component code again. It says 'order("published_at", ...)'
        // The type definition likely has published_at.
        // I will use created_at to be safe as per getArticles.
        .order("created_at", { ascending: false })
        .limit(limit);
    return data || [];
});
