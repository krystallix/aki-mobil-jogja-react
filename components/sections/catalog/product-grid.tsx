"use client"
import { Button } from "@/components/ui/button";
import ProductCard from "./product-card";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGridProps {
    products: any[];
    onAddToCart?: (productId: string) => void;
    onReset: () => void;
}

export default function ProductGrid({ products, onAddToCart, onReset }: ProductGridProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const [sortBy, setSortBy] = useState("default");

    // Reset page when products change (e.g. filtering)
    useEffect(() => {
        setCurrentPage(1);
    }, [products]);

    const sortedProducts = useMemo(() => {
        const sorted = [...products];

        switch (sortBy) {
            case "price-low":
                return sorted.sort((a, b) => (a.harga_tukar || a.harga_jual) - (b.harga_tukar || b.harga_jual));
            case "price-high":
                return sorted.sort((a, b) => (b.harga_tukar || b.harga_jual) - (a.harga_tukar || a.harga_jual));
            case "name-asc":
                return sorted.sort((a, b) => a.nama.localeCompare(b.nama));
            case "name-desc":
                return sorted.sort((a, b) => b.nama.localeCompare(a.nama));
            case "capacity-low":
                return sorted.sort((a, b) => {
                    const capA = parseInt(a.specifications[0]?.kapasitas) || 0;
                    const capB = parseInt(b.specifications[0]?.kapasitas) || 0;
                    return capA - capB;
                });
            case "capacity-high":
                return sorted.sort((a, b) => {
                    const capA = parseInt(a.specifications[0]?.kapasitas) || 0;
                    const capB = parseInt(b.specifications[0]?.kapasitas) || 0;
                    return capB - capA;
                });
            default:
                return sorted;
        }
    }, [products, sortBy]);


    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = sortedProducts.slice(startIndex, endIndex);


    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        setCurrentPage(1);
    };


    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPage = (page: number) => setCurrentPage(page);


    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    return (
        <div className="md:col-span-3 md:px-0 px-4">


            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <p className="text-sm pt-2 text-muted-foreground">
                    Menampilkan {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} dari {sortedProducts.length} produk
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <p className="text-sm whitespace-nowrap">Baris:</p>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-full sm:w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="9">9</SelectItem>
                                    <SelectItem value="12">12</SelectItem>
                                    <SelectItem value="24">24</SelectItem>
                                    <SelectItem value="96">96</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <p className="text-sm whitespace-nowrap">Urutkan:</p>
                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Urutan</SelectLabel>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
                                    <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
                                    <SelectItem value="price-low">Harga (Termurah)</SelectItem>
                                    <SelectItem value="price-high">Harga (Termahal)</SelectItem>
                                    <SelectItem value="capacity-low">Ampere (Terendah)</SelectItem>
                                    <SelectItem value="capacity-high">Ampere (Tertinggi)</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>


            {currentProducts.length > 0 ? (
                <>
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        key={currentPage + sortBy}
                    >
                        <AnimatePresence mode="popLayout">
                            {currentProducts.map(product => (
                                <motion.div
                                    key={product.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layout
                                >
                                    <ProductCard
                                        product={product}
                                        onAddToCart={onAddToCart}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>


                    {totalPages > 1 && (
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">

                            <p className="text-sm text-muted-foreground">
                                Halaman {currentPage} dari {totalPages}
                            </p>


                            <div className="flex items-center gap-1">

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={goToFirstPage}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>


                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>


                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                                ...
                                            </span>
                                        ) : (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="icon"
                                                onClick={() => goToPage(page as number)}
                                                className="h-8 w-8"
                                            >
                                                {page}
                                            </Button>
                                        )
                                    ))}
                                </div>


                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>


                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={goToLastPage}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-12 text-center border rounded-lg"
                >
                    <div className="space-y-2">
                        <p className="text-lg font-medium text-muted-foreground">
                            Tidak ada produk yang sesuai dengan filter
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Coba ubah kriteria pencarian Anda
                        </p>
                        <Button variant="outline" onClick={onReset} className="mt-4">
                            Reset Filter
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}