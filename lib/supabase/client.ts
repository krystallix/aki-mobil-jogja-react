
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = () =>
    createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
    );

// Client khusus server-side yang tidak di-cache oleh Next.js
export const createNoStoreClient = () =>
    createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
        {
            global: {
                fetch: (url: RequestInfo | URL, options?: RequestInit) =>
                    fetch(url, { ...options, cache: "no-store" }),
            },
        }
    );
