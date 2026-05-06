"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/sections/catalog/product-grid";
import FilterSection from "@/components/sections/catalog/filter-section";
import { fetchCategories, fetchBrands, fetchCapacities, fetchAllProducts } from "@/lib/supabase/queries";
import { Search, Funnel, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
interface CatalogSectionsProps {
    initialCategories: any[];
    initialBrands: any[];
    initialAmperes: any[];
    initialProducts: any[];
}

export default function CatalogSections({
    initialCategories,
    initialBrands,
    initialAmperes,
    initialProducts
}: CatalogSectionsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedMereks, setSelectedMereks] = useState<string[]>([]);
    const [selectedKondisis, setSelectedKondisis] = useState<string[]>([]);
    const [selectedAmperes, setSelectedAmperes] = useState<string[]>([]);

    const [priceRange, setPriceRange] = useState([5000000]);
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");

    // Initialize with server data
    const [allProducts] = useState<any[]>(initialProducts);
    const [categories] = useState<any[]>(initialCategories);
    const [brands] = useState<any[]>(initialBrands);
    const [amperes] = useState<any[]>(initialAmperes);

    const [sheetOpen, setSheetOpen] = useState(false);

    // Data is loaded from server, so no loading state needed for initial render
    const loading = false;

    const filteredProducts = useMemo(() => {
        let filtered = allProducts.filter(item => {
            // Price Filter
            if (item.harga_jual > priceRange[0]) return false;

            // Categories Filter
            if (selectedCategories.length > 0 && !selectedCategories.includes(item.kategori)) return false;

            // Brand Filter
            if (selectedMereks.length > 0 && !selectedMereks.includes(item.merek)) return false;

            // Condition Filter
            if (selectedKondisis.length > 0 && !selectedKondisis.includes(item.kondisi)) return false;

            // Search Query
            if (searchQuery) {
                const queryLower = searchQuery.toLowerCase();
                const matchesSearch =
                    (item.nama && item.nama.toLowerCase().includes(queryLower)) ||
                    (item.tipe && item.tipe.toLowerCase().includes(queryLower)) ||
                    (item.merek && item.merek.toLowerCase().includes(queryLower)) ||
                    (item.applications && item.applications.some((app: any) => app.nama_mobil && app.nama_mobil.toLowerCase().includes(queryLower)));

                if (!matchesSearch) return false;
            }

            // Ampere Filter
            if (selectedAmperes.length > 0) {
                // Check if specifications is array
                const specs = Array.isArray(item.specifications) ? item.specifications : (item.specifications ? [item.specifications] : []);
                const hasAmp = specs.some((s: any) => selectedAmperes.includes(String(s.kapasitas)));
                if (!hasAmp) return false;
            }

            return true;
        });

        if (searchQuery) {
            const queryLower = searchQuery.toLowerCase();
            filtered = filtered.map(item => {
                if (item.applications && item.applications.length > 0) {
                    const newApps = [...item.applications];
                    newApps.sort((a, b) => {
                        const aMatches = a.nama_mobil?.toLowerCase().includes(queryLower) ? 1 : 0;
                        const bMatches = b.nama_mobil?.toLowerCase().includes(queryLower) ? 1 : 0;
                        // if both match or both don't match, keep original order. Otherwise, matched comes first.
                        return bMatches - aMatches;
                    });
                    return { ...item, applications: newApps };
                }
                return item;
            });
        }

        return filtered;
    }, [allProducts, selectedCategories, selectedMereks, selectedKondisis, selectedAmperes, priceRange, searchQuery]);

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("q", value);
        } else {
            params.delete("q");
        }
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const handleReset = () => {
        setSelectedCategories([]);
        setSelectedMereks([]);
        setSelectedKondisis([]);
        setSelectedAmperes([]);
        setPriceRange([5000000]);
        setSearchQuery("");
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const handleAddToCart = (_productId: string) => {
        // Placeholder for future cart functionality
    };

    const activeFiltersCount =
        selectedCategories.length +
        selectedMereks.length +
        selectedKondisis.length +
        selectedAmperes.length;


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            {/* Section Header */}
            <div className="py-6 lg:py-8 border-y border-border/50 bg-card overflow-hidden flex relative">
                <div
                    className="flex w-max animate-marquee"
                >
                    {[...[1, 2, 3, 4, 5, 6, 7], ...[1, 2, 3, 4, 5, 6, 7]].map((logoNum, i) => (
                        <div key={i} className="flex shrink-0 justify-center items-center px-6 lg:px-12">
                            <img
                                src={`/logo/${logoNum}.png`}
                                alt={`Brand Logo ${logoNum}`}
                                className="h-10 lg:h-16 w-auto object-contain opacity-50 hover:opacity-100 active:opacity-100 transition-opacity duration-300 cursor-pointer"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="py-10 lg:py-20 bg-background border-b border-border/50 relative overflow-hidden">

                <div className="container mx-auto px-6 max-w-7xl mb-8 lg:mb-12 relative z-10">
                    <div className="flex justify-between items-end">
                        <div>

                            <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tighter mb-2 lg:mb-4 text-transparent bg-clip-text bg-linear-to-br from-foreground via-foreground to-foreground/50">
                                Katalog Produk
                            </h2>
                            <p className="text-sm lg:text-lg text-muted-foreground font-light max-w-2xl">
                                Temukan aki yang tepat untuk kendaraan Anda. Kami menyediakan berbagai jenis aki dengan kualitas terjamin.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-6 max-w-7xl mb-10 relative z-10">
                    {/* Search Bar */}
                    <motion.div
                        className="my-4 lg:my-6 flex flex-row w-full gap-3"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex-1 w-full group">
                            <div className="relative">
                                <Search className="absolute left-4 lg:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Cari nama, tipe baterai, atau kendaraan..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-12 lg:pl-14 h-12 lg:h-14 rounded-full border-border/60 bg-card shadow-none hover:border-border focus:border-border focus:ring-0 transition-all text-sm lg:text-base"
                                />
                            </div>
                        </div>

                        <div className="md:hidden">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSheetOpen(true)}
                                className="relative h-12 w-12 rounded-full border-border/60 bg-card shadow-none hover:border-border hover:bg-muted transition-all"
                            >
                                <Funnel className="size-5" />
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-none">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>

                        </div>
                    </motion.div>

                    {/* Mobile Filter Button */}


                    {/* Desktop & Mobile Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Desktop Filter - Hidden on Mobile */}
                        <div className="hidden md:block">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <FilterSection
                                    selectedCategories={selectedCategories}
                                    setSelectedCategories={setSelectedCategories}
                                    selectedMereks={selectedMereks}
                                    setSelectedMereks={setSelectedMereks}
                                    selectedKondisis={selectedKondisis}
                                    setSelectedKondisis={setSelectedKondisis}
                                    selectedAmperes={selectedAmperes}
                                    setSelectedAmperes={setSelectedAmperes}
                                    priceRange={priceRange}
                                    setPriceRange={setPriceRange}
                                    categories={categories}
                                    brands={brands}
                                    amperes={amperes}
                                    onReset={handleReset}
                                />
                            </motion.div>
                        </div>

                        {/* Product Grid */}
                        <motion.div
                            className="md:col-span-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <ProductGrid
                                products={filteredProducts}
                                onAddToCart={handleAddToCart}
                                onReset={handleReset}
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {sheetOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[100] bg-background flex flex-col md:hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/95 backdrop-blur-sm z-10 shrink-0">
                            <div>
                                <h3 className="font-bold text-lg text-foreground">Filter Produk</h3>
                                <p className="text-xs text-muted-foreground">Sesuaikan dengan kebutuhan Anda</p>
                            </div>
                            <button
                                className="text-foreground p-2 rounded-full hover:bg-muted transition-transform hover:rotate-90 duration-300"
                                onClick={() => setSheetOpen(false)}
                                aria-label="Tutup filter"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 pb-8">
                            <FilterSection
                                selectedCategories={selectedCategories}
                                setSelectedCategories={setSelectedCategories}
                                selectedMereks={selectedMereks}
                                setSelectedMereks={setSelectedMereks}
                                selectedKondisis={selectedKondisis}
                                setSelectedKondisis={setSelectedKondisis}
                                selectedAmperes={selectedAmperes}
                                setSelectedAmperes={setSelectedAmperes}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                categories={categories}
                                brands={brands}
                                amperes={amperes}
                                onReset={handleReset}
                            />
                        </div>

                        {/* Fixed Bottom Action */}
                        <div className="p-6 border-t border-border/50 bg-background/95 backdrop-blur-sm mt-auto shrink-0 pb-10">
                            <Button
                                className="w-full h-14 rounded-full text-base font-bold shadow-none hover:scale-[1.02] transition-all"
                                onClick={() => setSheetOpen(false)}
                            >
                                Terapkan Filter ({filteredProducts.length} Produk)
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}