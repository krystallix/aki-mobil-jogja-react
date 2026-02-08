import Link from 'next/link';
import { CircleQuestionMark } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                        <CircleQuestionMark size={64} className="text-gray-400" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Artikel Tidak Ditemukan
                </h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Maaf, artikel yang Anda cari tidak ditemukan atau mungkin sudah dihapus.
                </p>
                <Link
                    href="/artikel"
                    className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                    Kembali ke Artikel
                </Link>
            </div>
        </div>
    );
}
