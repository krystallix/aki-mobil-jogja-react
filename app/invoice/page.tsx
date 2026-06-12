import type { Metadata } from 'next';
import InvoicePageClient from './invoice-page-client';

export const metadata: Metadata = {
    title: 'Cek Invoice | Siswanto Aki',
    robots: 'noindex, nofollow',
};

export default function InvoicePage() {
    return <InvoicePageClient />;
}
