"use client"
import { SlidersHorizontal, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface FilterSectionProps {
    selectedCategories: string[];
    setSelectedCategories: (value: string[]) => void;
    selectedMereks: string[];
    setSelectedMereks: (value: string[]) => void;
    selectedKondisis: string[];
    setSelectedKondisis: (value: string[]) => void;
    selectedAmperes: string[];
    setSelectedAmperes: (value: string[]) => void;
    priceRange: number[];
    setPriceRange: (value: number[]) => void;
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
    amperes: { id: string; name: string }[];
    onReset: () => void;
}


export default function FilterSection({
    selectedCategories,
    setSelectedCategories,
    selectedMereks,
    setSelectedMereks,
    selectedKondisis,
    setSelectedKondisis,
    selectedAmperes,
    setSelectedAmperes,
    priceRange,
    setPriceRange,
    categories,
    brands,
    amperes,
    onReset
}: FilterSectionProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };


    const kondisiOptions = [
        { id: "baru", name: "Baru" },
        { id: "bekas", name: "Bekas" }
    ];


    const handleCheckboxChange = (
        checked: boolean,
        value: string,
        selectedItems: string[],
        setSelectedItems: (value: string[]) => void
    ) => {
        if (checked) {
            setSelectedItems([...selectedItems, value]);
        } else {
            setSelectedItems(selectedItems.filter(item => item !== value));
        }
    };


    const hasActiveFilters =
        selectedCategories.length > 0 ||
        selectedMereks.length > 0 ||
        selectedKondisis.length > 0 ||
        selectedAmperes.length > 0 ||
        (priceRange[0] > 0 && priceRange[0] < 5000000);

    return (
        <>
            <Card className="border-0 shadow-none md:border md:border-border/50 rounded-2xl md:shadow-sm bg-card h-fit overflow-hidden relative group/filter">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover/filter:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <CardHeader className="border-b border-border/50 bg-muted/30 pb-4">
                    <div className="md:flex justify-between items-center hidden relative z-10">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <SlidersHorizontal className="size-5 text-primary" />
                            Filter Produk
                        </CardTitle>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                onClick={onReset}
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full transition-colors"
                            >
                                Hapus
                                <X className="size-3.5 ml-1" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                    <div className="space-y-6">

                        <Accordion type="multiple" defaultValue={["kategori", "merek", "kondisi", "harga"]}>

                            <AccordionItem value="kategori" className="border-b-0">
                                <AccordionTrigger className="py-3">Kategori</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-2">
                                        {categories.map(category => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${category.id}`}
                                                    checked={selectedCategories.includes(category.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange(
                                                            checked as boolean,
                                                            category.id,
                                                            selectedCategories,
                                                            setSelectedCategories
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`cat-${category.id}`}
                                                    className="font-normal cursor-pointer text-sm"
                                                >
                                                    {category.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>


                            <AccordionItem value="merek" className="border-b-0">
                                <AccordionTrigger className="py-3">Merek</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-2 overflow-y-auto pr-2 max-h-60">
                                        {brands.map(brand => (
                                            <div key={brand.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`brand-${brand.id}`}
                                                    checked={selectedMereks.includes(brand.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange(
                                                            checked as boolean,
                                                            brand.id,
                                                            selectedMereks,
                                                            setSelectedMereks
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`brand-${brand.id}`}
                                                    className="font-normal cursor-pointer text-sm"
                                                >
                                                    {brand.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>


                            <AccordionItem value="ampere" className="border-b-0">
                                <AccordionTrigger className="py-3">Ampere</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-2 overflow-y-auto pr-2 max-h-60">
                                        {amperes.map(ampere => (
                                            <div key={ampere.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`ampere-${ampere.id}`}
                                                    checked={selectedAmperes.includes(ampere.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange(
                                                            checked as boolean,
                                                            ampere.id,
                                                            selectedAmperes,
                                                            setSelectedAmperes
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`ampere-${ampere.id}`}
                                                    className="font-normal cursor-pointer text-sm"
                                                >
                                                    {ampere.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>


                            <AccordionItem value="kondisi" className="border-b-0">
                                <AccordionTrigger className="py-3">Kondisi</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-2">
                                        {kondisiOptions.map(kondisi => (
                                            <div key={kondisi.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`kondisi-${kondisi.id}`}
                                                    checked={selectedKondisis.includes(kondisi.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange(
                                                            checked as boolean,
                                                            kondisi.id,
                                                            selectedKondisis,
                                                            setSelectedKondisis
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`kondisi-${kondisi.id}`}
                                                    className="font-normal cursor-pointer text-sm"
                                                >
                                                    {kondisi.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>


                            <AccordionItem value="harga" className="border-b-0">
                                <AccordionTrigger className="py-3">Rentang Harga</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-5 mt-2">
                                        <Slider
                                            value={priceRange}
                                            onValueChange={setPriceRange}
                                            max={5000000}
                                            step={50000}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Rp 0</span>
                                            <span>{formatPrice(priceRange[0])}</span>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-5">
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 55%)" }} />
                <div className="relative z-10">
                    <h3 className="text-sm font-bold mb-1.5 text-white">
                        Tidak Menemukan Aki?
                    </h3>
                    <p className="mb-4 text-white/50 text-xs leading-relaxed">
                        Hubungi kami untuk rekomendasi yang tepat.
                    </p>
                    <a
                        href="https://wa.me/6281354007400"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 bg-white text-zinc-900 px-4 h-10 rounded-full font-bold text-xs hover:bg-zinc-100 transition-colors"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Konsultasi via WA
                    </a>
                </div>
            </div>
        </>
    );
}
