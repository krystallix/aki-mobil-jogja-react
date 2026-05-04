"use client"
import DashboardLayout from "@/components/layouts/dashboard-layout";
import TipTapEditor from "@/components/tiptap";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Search, Loader2, MoreVertical, Trash2, Share2, Send, Save, TriangleAlert, Copy, Check, Upload, Image as ImageIcon, ChevronLeft } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

import {
    fetchArticles,
    upsertArticle,
    deleteArticle,
    uploadFeaturedImage,
    type ArticleData
} from "@/lib/supabase/queries";
import { revalidateArticles } from "@/app/actions/revalidate";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_FORM: ArticleData = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    tags: [],
    status: 'draft',
    created_at: new Date().toISOString()
};

export default function ArtikelPage() {
    const [articles, setArticles] = useState<ArticleData[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState<ArticleData>(DEFAULT_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<ArticleData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [copiedId, setCopiedId] = useState<string | null>(null);

    // State untuk Upload Featured Image
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        get();
    }, []);

    const get = async () => {
        setIsLoadingList(true);
        const data = await fetchArticles();
        if (data) setArticles(data as ArticleData[]);
        setIsLoadingList(false);
    };

    // --- LOGIC: Upload Featured Image ---
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar (JPG, PNG, WebP, dll.)');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('Ukuran file maksimal 5MB');
            return;
        }

        // Validate slug exists
        if (!formData.slug || !formData.slug.trim()) {
            toast.error('Silakan isi judul artikel terlebih dahulu untuk generate slug');
            return;
        }

        setIsUploadingImage(true);

        try {
            const supabase = createClient();

            const publicUrl = await uploadFeaturedImage(supabase, file, formData.slug);

            if (publicUrl) {
                setFormData(prev => ({
                    ...prev,
                    featured_image: publicUrl
                }));
                toast.success('Featured image berhasil diupload!');
            } else {
                throw new Error('Upload returned null');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Gagal mengupload gambar. Silakan coba lagi.');
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveFeaturedImage = () => {
        setFormData(prev => ({
            ...prev,
            featured_image: ''
        }));
        setImageUrl('');
    };

    const handleShareClick = async (article: ArticleData) => {
        const articleUrl = `${window.location.origin}/artikel/${article.slug}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.excerpt || '',
                    url: articleUrl,
                });
                toast.success('Artikel berhasil dibagikan!');
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            handleCopyLink(article);
        }
    };

    const handleCopyLink = async (article: ArticleData) => {
        const articleUrl = `${window.location.origin}/artikel/${article.slug}`;

        try {
            await navigator.clipboard.writeText(articleUrl);
            setCopiedId(article.id || null);
            toast.success('Link artikel berhasil disalin!');

            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            toast.error('Gagal menyalin link');
        }
    };

    const generateSlug = (title: string) => {
        return title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: newTitle,
            slug: !prev.id ? generateSlug(newTitle) : prev.slug
        }));
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...(prev.tags || []), tagInput.trim()]
                }));
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSelectArticle = (article: ArticleData) => {
        setFormData({
            ...article,
            tags: article.tags || []
        });
        setImageUrl('');
        setIsMobileListOpen(false);
    };

    const handleCreateNew = () => {
        setFormData(DEFAULT_FORM);
        setImageUrl('');
        setIsMobileListOpen(false);
    };

    const handleSave = async (publishNow: boolean = false) => {
        if (!formData.title.trim()) {
            toast.error('Judul artikel tidak boleh kosong!');
            return;
        }

        if (!formData.slug.trim()) {
            toast.error('Slug URL tidak boleh kosong!');
            return;
        }

        setIsSaving(true);

        const dataToSave: ArticleData = {
            ...formData,
            status: publishNow ? 'published' : formData.status,
        };

        try {
            const savedData = await upsertArticle(dataToSave);

            if (savedData) {
                setArticles(prev => {
                    const exists = prev.find(a => a.id === savedData.id);
                    if (exists) {
                        return prev.map(a => a.id === savedData.id ? savedData : a);
                    }
                    return [savedData, ...prev] as ArticleData[];
                });

                setFormData(savedData as ArticleData);

                if (publishNow) {
                    toast.success('Artikel berhasil dipublikasikan!');
                } else {
                    toast.success('Draft berhasil disimpan!');
                }
                const slug = savedData.slug || undefined;
                await revalidateArticles(slug);
            }
        } catch (error) {
            console.error("Failed to save article:", error);
            toast.error('Gagal menyimpan artikel. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (article: ArticleData, e: React.MouseEvent) => {
        e.stopPropagation();
        setArticleToDelete(article);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!articleToDelete?.id) return;

        setIsDeleting(true);
        const supabase = createClient();

        try {
            await deleteArticle(supabase, articleToDelete.id);

            setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));

            if (formData.id === articleToDelete.id) {
                setFormData(DEFAULT_FORM);
            }

            setDeleteDialogOpen(false);
            setArticleToDelete(null);
            toast.success('Artikel berhasil dihapus');
            const slug = articleToDelete.slug || undefined;
            await revalidateArticles(slug);
        } catch (error) {
            console.error("Failed to delete article:", error);
            toast.error('Gagal menghapus artikel. Silakan coba lagi.');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-4rem)]">
                <div className="grid grid-cols-12 gap-0 h-full">

                    {/* LEFT SIDEBAR */}
                    <div className={`${isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-4 xl:col-span-3 flex-col h-full border-r border-border/40 bg-background/50`}>
                        <div className="flex-none p-4 border-b border-border/40 bg-background/80 backdrop-blur-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-extrabold tracking-tight">Daftar Artikel</h2>
                                <Button size="sm" onClick={handleCreateNew} className="h-8 pl-2.5 pr-2 rounded-lg gap-1.5 bg-primary text-primary-foreground font-bold text-[11px] hover:bg-primary/90 active:scale-[0.97] transition-all duration-200">
                                    <span>Tambah</span>
                                    <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                                        <Plus className="w-3 h-3" />
                                    </span>
                                </Button>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <Input
                                    placeholder="Cari artikel..."
                                    className="pl-9 h-10 rounded-xl border-border/60 bg-card shadow-none text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-3 space-y-2">
                                {isLoadingList ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
                                    </div>
                                ) : filteredArticles.map((article, i) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04, duration: 0.3 }}
                                        className={`group relative cursor-pointer transition-all duration-300 rounded-[1.25rem] p-4 border ${formData.id === article.id ? 'bg-primary/10 border-primary/40 shadow-sm' : 'bg-background border-border/60 hover:border-primary/40 hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]'}`}
                                        onClick={() => handleSelectArticle(article)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-widest ${article.status === 'published' ? 'bg-primary text-primary-foreground border-transparent' : 'bg-transparent text-muted-foreground border-border/60'}`}>
                                                        {article.status}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground/70">
                                                        {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru'}
                                                    </span>
                                                </div>
                                                <p className="text-[15px] font-bold text-foreground leading-snug line-clamp-2">
                                                    {article.title || 'Tanpa Judul'}
                                                </p>
                                                {article.excerpt && (
                                                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                                                        {article.excerpt}
                                                    </p>
                                                )}
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-muted/30 border border-border/50 hover:bg-background hover:shadow-sm"
                                                    >
                                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/60 shadow-xl">
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-[13px] font-medium rounded-lg"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyLink(article);
                                                        }}
                                                    >
                                                        {copiedId === article.id ? (
                                                            <>
                                                                <Check className="h-4 w-4 mr-2 text-emerald-500" />
                                                                <span className="text-emerald-500 font-bold">Link Tersalin!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
                                                                <span>Salin Link</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>

                                                    {article.status === 'published' && (
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-[13px] font-medium rounded-lg"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleShareClick(article);
                                                            }}
                                                        >
                                                            <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            <span>Bagikan</span>
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator className="bg-border/40" />

                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-[13px] font-bold rounded-lg"
                                                        onClick={(e) => handleDeleteClick(article, e)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        <span>Hapus Artikel</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </motion.div>
                                ))}
                                {filteredArticles.length === 0 && !isLoadingList && (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                                            <Search className="w-5 h-5 text-muted-foreground/40" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Tidak ada artikel</p>
                                            <p className="text-xs text-muted-foreground mt-1">Coba gunakan kata kunci lain.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* RIGHT SIDE: EDITOR */}
                    <div className={`${!isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-8 xl:col-span-9 h-full flex-col`}>

                        <div className="flex-none p-6 border-b bg-background">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setIsMobileListOpen(true)}>
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <div>
                                        <h1 className="text-2xl font-bold">
                                            {formData.id ? 'Edit Artikel' : 'Buat Artikel Baru'}
                                        </h1>
                                        <p className="text-muted-foreground text-sm">
                                            {formData.id ? `ID: ${formData.id}` : 'Draft belum disimpan'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleSave(false)}
                                        disabled={isSaving || !formData.title.trim()}
                                        className="gap-2 h-10 rounded-xl font-bold"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            'Simpan Draft'
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => handleSave(true)}
                                        disabled={isSaving || !formData.title.trim()}
                                        className="gap-2 h-10 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        <Send className="w-4 h-4" />
                                        {formData.status === 'published' ? 'Update' : 'Publikasikan'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    <div className="xl:col-span-2 space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">
                                                Judul <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                value={formData.title}
                                                onChange={handleTitleChange}
                                                placeholder="Judul artikel yang menarik..."
                                                className="text-lg font-bold h-12 rounded-xl border-border/60"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">
                                                Slug URL <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-muted-foreground bg-muted/50 border border-border/40 px-3 py-0 h-10 rounded-lg whitespace-nowrap flex items-center justify-center">
                                                    /artikel/
                                                </span>
                                                <Input
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                                                    className="font-mono text-sm h-10 rounded-lg border-border/60"
                                                    placeholder="url-slug-artikel"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Konten</Label>
                                            <div className="border border-border/60 rounded-[1.25rem] overflow-hidden bg-muted/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                                <TipTapEditor
                                                    content={formData.content}
                                                    onChange={(c) => setFormData(p => ({ ...p, content: c }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Card className="rounded-[1.25rem] border border-border/60 bg-muted/20 shadow-none">
                                            <CardHeader className="pb-3 border-b border-border/40 bg-background/50 rounded-t-[1.25rem]">
                                                <CardTitle className="text-[13px] font-extrabold uppercase tracking-wide">Pengaturan</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold">Status</Label>
                                                    <Select
                                                        value={formData.status}
                                                        onValueChange={(v: any) => setFormData(p => ({ ...p, status: v }))}
                                                    >
                                                        <SelectTrigger className="h-10 rounded-lg border-border/60">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="draft">Draft</SelectItem>
                                                            <SelectItem value="published">Published</SelectItem>
                                                            <SelectItem value="archived">Archived</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold">Excerpt</Label>
                                                    <Textarea
                                                        value={formData.excerpt || ''}
                                                        onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                                                        placeholder="Deskripsi singkat untuk SEO..."
                                                        className="h-24 resize-none rounded-lg border-border/60"
                                                    />
                                                    <p className="text-[11px] text-muted-foreground font-medium">
                                                        {formData.excerpt?.length || 0}/160 karakter
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-[1.25rem] border border-border/60 bg-muted/20 shadow-none">
                                            <CardHeader className="pb-3 border-b border-border/40 bg-background/50 rounded-t-[1.25rem]">
                                                <CardTitle className="text-[13px] font-extrabold uppercase tracking-wide">Media & Tags</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold">Featured Image</Label>

                                                    <Tabs defaultValue="upload" className="w-full">
                                                        <TabsList className="grid w-full grid-cols-2">
                                                            <TabsTrigger value="upload">Upload File</TabsTrigger>
                                                            <TabsTrigger value="url">URL</TabsTrigger>
                                                        </TabsList>

                                                        <TabsContent value="upload" className="space-y-2">
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleFileSelect}
                                                                className="hidden"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="w-full h-10 rounded-lg border-border/60 border-dashed"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                disabled={isUploadingImage || !formData.slug.trim()}
                                                            >
                                                                {isUploadingImage ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                        Mengupload...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Upload className="w-4 h-4 mr-2" />
                                                                        Pilih Gambar
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <p className="text-xs text-muted-foreground">
                                                                Maksimal 5MB (JPG, PNG, WebP)
                                                            </p>
                                                            {!formData.slug.trim() && (
                                                                <p className="text-xs text-orange-600">
                                                                    Isi judul terlebih dahulu untuk upload gambar
                                                                </p>
                                                            )}
                                                        </TabsContent>

                                                        <TabsContent value="url" className="space-y-2">
                                                            <Input
                                                                value={imageUrl}
                                                                onChange={(e) => setImageUrl(e.target.value)}
                                                                placeholder="https://example.com/image.jpg"
                                                                className="h-10 rounded-lg border-border/60"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="w-full h-10 rounded-lg border-border/60"
                                                                onClick={() => {
                                                                    if (imageUrl.trim()) {
                                                                        setFormData(p => ({ ...p, featured_image: imageUrl }));
                                                                        toast.success('Featured image URL berhasil ditambahkan!');
                                                                    }
                                                                }}
                                                                disabled={!imageUrl.trim()}
                                                            >
                                                                <ImageIcon className="w-4 h-4 mr-2" />
                                                                Gunakan URL
                                                            </Button>
                                                        </TabsContent>
                                                    </Tabs>

                                                    {formData.featured_image && (
                                                        <div className="relative mt-2 aspect-video rounded-md overflow-hidden border bg-muted group">
                                                            <img
                                                                src={formData.featured_image}
                                                                alt="Preview"
                                                                className="object-cover w-full h-full"
                                                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Error')}
                                                            />
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="destructive"
                                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={handleRemoveFeaturedImage}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold">Tags</Label>
                                                    <Input
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyDown={handleAddTag}
                                                        placeholder="Ketik tag, tekan Enter..."
                                                        className="h-10 rounded-lg border-border/60"
                                                    />
                                                    {formData.tags && formData.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {formData.tags.map((tag) => (
                                                                <Badge key={tag} variant="secondary" className="pr-1">
                                                                    {tag}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-4 w-4 ml-1 hover:bg-transparent"
                                                                        onClick={() => handleRemoveTag(tag)}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-border/60 shadow-2xl bg-background/95 backdrop-blur-2xl">
                    <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/20">
                        <DialogTitle className="text-xl font-extrabold tracking-tight">Konfirmasi Hapus</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-xl">
                            <TriangleAlert className="h-4 w-4" />
                            <AlertTitle className="font-bold">Peringatan!</AlertTitle>
                            <AlertDescription className="text-sm font-medium mt-1">
                                Artikel <strong className="font-semibold">&quot;{articleToDelete?.title}&quot;</strong> akan dihapus permanen beserta semua gambar di dalamnya. Tindakan ini tidak dapat dibatalkan.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                            className="h-11 rounded-xl font-bold"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            variant="destructive"
                            className="gap-2 h-11 rounded-xl font-bold"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Ya, Hapus Permanen
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
