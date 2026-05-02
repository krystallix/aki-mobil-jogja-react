
import '@/app/globals.css'
import SiteHeader from '@/components/sections/header'
import Footer from '../sections/footer'

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            {/* pt-20 untuk clearance dari floating navbar (fixed top-4 + height ~60px) */}
            <main className="flex-1 pt-20">
                {children}
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}
