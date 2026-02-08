
import '@/app/globals.css'
// import { Inter } from 'next/font/google'
import SiteHeader from '@/components/sections/header'
import Footer from '../sections/footer'

// const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 container mx-auto">
                {children}
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}
