"use client"
import { SlidersHorizontal, X } from "lucide-react";
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
            <Card className=" border-none shadow-none mt-2 bg-muted-foreground/5 h-fit">
                <CardHeader>
                    <div className="md:flex justify-between items-center hidden">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <SlidersHorizontal className="size-4" />
                            Filter
                        </CardTitle>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                onClick={onReset}
                                className="border-dashed border-muted-foreground/50 text-xs "
                            >
                                Hapus Filter
                                <X className="size-4 ml-2" />
                            </Button>
                        )}
                    </div>

                </CardHeader>
                <CardContent    >
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
            <div className="bg-gradient-to-br from-primary mt-4 mx-5 sm:mx-0 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-3">
                    Tidak Menemukan Aki yang anda cari?
                </h3>
                <p className="mb-6 text-blue-100 text-sm">
                    Hubungi kami untuk mendapatkan rekomendasi aki yang tepat untuk kendaraan Anda
                </p>
                <a
                    href="https://wa.me/6281354007400"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                    Hubungi via WhatsApp
                </a>
            </div>
        </>
    );
}
