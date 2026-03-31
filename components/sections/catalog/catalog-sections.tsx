"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/sections/catalog/product-grid";
import FilterSection from "@/components/sections/catalog/filter-section";
import { fetchCategories, fetchBrands, fetchCapacities, fetchAllProducts } from "@/lib/supabase/queries";
import { Search, Funnel } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
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
        return allProducts.filter(item => {
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

    const handleAddToCart = (productId: string) => {
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

            <div className="container mx-auto px-4 mb-10">
                {/* Search Bar */}
                <motion.div
                    className="my-3 flex flex-row w-full gap-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex-1 w-full">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="search"
                                type="text"
                                placeholder="Cari nama, tipe baterai, atau kendaraan..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />

                        </div>
                    </div>

                    <div className="md:hidden">
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="relative">
                                    <Funnel className="size-4" />
                                    {activeFiltersCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                                <SheetHeader className="pb-0">
                                    <SheetTitle>Filter Produk</SheetTitle>
                                    <SheetDescription>
                                        Pilih filter untuk menyaring produk sesuai kebutuhan Anda
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="py-0">
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

                                <SheetFooter className="sticky bottom-0 bg-background pt-4 pb-2 border-t">
                                    <SheetClose asChild>
                                        <Button
                                            className="w-full"
                                            onClick={() => setSheetOpen(false)}
                                        >
                                            Terapkan Filter ({filteredProducts.length} Produk)
                                        </Button>
                                    </SheetClose>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
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
        </>
    );
}