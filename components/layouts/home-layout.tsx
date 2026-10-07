
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
            {/* pt-16 untuk clearance dari fixed navbar (height 64px) */}
            <main className="flex-1 pt-16">
                {children}
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}
