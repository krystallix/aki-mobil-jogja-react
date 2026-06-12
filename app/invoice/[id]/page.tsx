import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import InvoiceClientView from './invoice-client-view';

export const metadata: Metadata = {
    title: 'Invoice | Siswanto Aki',
    robots: 'noindex, nofollow',
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const parts = id.split('-');
    if (parts.length < 2) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f5f6fa] to-white flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-black text-red-500">!</span>
                </div>
                <h1 className="text-2xl font-black text-[#0f3460] mb-2">Format Link Tidak Valid</h1>
                <p className="text-muted-foreground text-sm font-medium">Pastikan Anda mengakses tautan yang benar.</p>
            </div>
        );
    }

    const invoiceSuffix = parts[0];
    const uuidPrefix = parts.slice(1).join('-');

    const supabase = await createClient();

    const { data: txs, error } = await supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .ilike('id', `%-${invoiceSuffix}`);

    if (error || !txs || txs.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f5f6fa] to-white flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-black text-gray-300">?</span>
                </div>
                <h1 className="text-2xl font-black text-[#0f3460] mb-2">Invoice Tidak Ditemukan</h1>
                <p className="text-muted-foreground text-sm font-medium">Link invoice mungkin salah atau telah dihapus.</p>
            </div>
        );
    }

    const tx = txs.find((t: any) => t.customer_id && String(t.customer_id).startsWith(uuidPrefix));

    if (!tx) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f5f6fa] to-white flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-black text-gray-300">?</span>
                </div>
                <h1 className="text-2xl font-black text-[#0f3460] mb-2">Akses Ditolak</h1>
                <p className="text-muted-foreground text-sm font-medium">Link tidak sesuai dengan data pelanggan.</p>
            </div>
        );
    }

    return <InvoiceClientView transaction={tx} />;
}
