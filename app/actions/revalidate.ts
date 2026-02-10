'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateProducts(slug?: string) {
    revalidatePath('/katalog')
    revalidatePath('/dashboard/katalog')
    if (slug) {
        revalidatePath(`/katalog/product/${slug}`)
    }
}

export async function revalidateArticles(slug?: string) {
    revalidatePath('/artikel')
    revalidatePath('/dashboard/artikel')
    if (slug) {
        revalidatePath(`/artikel/${slug}`)
    }
}
