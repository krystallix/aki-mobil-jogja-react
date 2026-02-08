
import MainNav from './main-nav'
import MobileNav from './mobile-nav'

export default function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full bg-gray-50 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center px-4">
                <MainNav />
                <MobileNav />
            </div>
        </header>
    )
}
