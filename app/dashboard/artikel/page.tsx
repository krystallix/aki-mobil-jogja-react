"use client"
import DashboardLayout from "@/components/layouts/dashboard-layout";
import TipTapEditor from "@/components/tiptap";
import AiArtikelGenerator from "@/components/artikel/ai-artikel-generator";
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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { FaWhatsapp, FaFacebookF, FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
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
import { useIsNativeShare } from "@/hooks/use-is-native-share";

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
    const isMobileShare = useIsNativeShare();

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
        const shareCaption = (article.excerpt || article.title).trim();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: shareCaption,
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

    const openSocialShare = (article: ArticleData, url: string) => {
        const articleUrl = `${window.location.origin}/artikel/${article.slug}`;
        const encodedUrl = encodeURIComponent(articleUrl);
        const shareCaption = (article.excerpt || article.title).trim();
        const encodedCaption = encodeURIComponent(shareCaption);

        const link =
            url === "whatsapp"
                ? `https://wa.me/?text=${encodeURIComponent(`${shareCaption}\n${articleUrl}`)}`
                : url === "facebook"
                    ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
                    : url === "twitter"
                        ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedCaption}`
                        : `https://t.me/share/url?url=${encodedUrl}&text=${encodedCaption}`;

        window.open(link, "_blank", "noopener,noreferrer,width=700,height=600");
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

    const handleAiGenerated = (data: Partial<ArticleData>) => {
        setFormData(prev => ({
            ...prev,
            ...data,
        }))
        setIsMobileListOpen(false)
    }

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
            <div className="h-full">
                <div className="grid grid-cols-12 gap-0 h-full">

                    {/* LEFT SIDEBAR */}
                    <div className={`${isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-4 xl:col-span-3 flex-col h-full min-h-0 border-r border-neutral-200/70 dark:border-border/40 bg-neutral-50/50 dark:bg-card/30`}>
                        <div className="flex-none p-4 border-b border-neutral-200/70 dark:border-border/40 bg-white dark:bg-card space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold tracking-tight text-foreground">Artikel</h2>
                                    <p className="text-[11px] text-muted-foreground">{articles.length} postingan blog</p>
                                </div>
                                <Button size="sm" onClick={handleCreateNew} className="h-8 px-3 rounded-lg gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs shrink-0 cursor-pointer">
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tulis Baru</span>
                                </Button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Cari artikel..."
                                    className="pl-9 h-9 rounded-lg border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground w-6 h-6 flex items-center justify-center rounded-md"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1 min-h-0 bg-neutral-50/50 dark:bg-card/30">
                            <div className="p-3 space-y-2">
                                {isLoadingList ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                                    </div>
                                ) : filteredArticles.map((article, i) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04, duration: 0.3 }}
                                        className={`group relative cursor-pointer transition-all rounded-xl p-3 border ${formData.id === article.id ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/20 shadow-xs' : 'bg-white dark:bg-card border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'}`}
                                        onClick={() => handleSelectArticle(article)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${article.status === 'published' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-neutral-100 text-neutral-500 border border-neutral-200'}`}>
                                                        {article.status}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru'}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                                                    {article.title || 'Tanpa Judul'}
                                                </p>
                                                {article.excerpt && (
                                                    <p className="text-[11px] text-muted-foreground line-clamp-1">
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

                                                    {article.status === 'published' && isMobileShare && (
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

                                                    {article.status === 'published' && !isMobileShare && (
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger
                                                                className="cursor-pointer text-[13px] font-medium rounded-lg gap-2"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Share2 className="h-4 w-4 text-muted-foreground" />
                                                                Bagikan
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="w-44 rounded-xl border-border/60 shadow-xl p-1.5">
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-[13px] font-medium rounded-lg gap-2"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openSocialShare(article, "whatsapp");
                                                                    }}
                                                                >
                                                                    <FaWhatsapp className="h-4 w-4 text-emerald-500" />
                                                                    WhatsApp
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-[13px] font-medium rounded-lg gap-2"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openSocialShare(article, "facebook");
                                                                    }}
                                                                >
                                                                    <FaFacebookF className="h-4 w-4 text-blue-600" />
                                                                    Facebook
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-[13px] font-medium rounded-lg gap-2"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openSocialShare(article, "twitter");
                                                                    }}
                                                                >
                                                                    <FaXTwitter className="h-4 w-4" />
                                                                    X (Twitter)
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-[13px] font-medium rounded-lg gap-2"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openSocialShare(article, "telegram");
                                                                    }}
                                                                >
                                                                    <FaTelegramPlane className="h-4 w-4 text-sky-500" />
                                                                    Telegram
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                    )}

                                                    <DropdownMenuSeparator className="bg-border/40" />

                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs font-semibold rounded-lg"
                                                        onClick={(e) => handleDeleteClick(article, e)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        <span>Delete Article</span>
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
                                            <p className="text-sm font-bold">No articles found</p>
                                            <p className="text-xs text-muted-foreground mt-1">Try another search keyword.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* RIGHT SIDE: EDITOR */}
                    <div className={`${!isMobileListOpen ? 'flex' : 'hidden'} lg:flex col-span-12 lg:col-span-8 xl:col-span-9 h-full flex-col bg-white dark:bg-background`}>

                        <div className="flex-none p-4 lg:px-6 border-b border-neutral-200/70 dark:border-border/40 bg-white dark:bg-card">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-8 w-8 rounded-lg bg-neutral-100" onClick={() => setIsMobileListOpen(true)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="min-w-0">
                                        <h1 className="text-base sm:text-lg font-bold line-clamp-1 text-foreground">
                                            {formData.title || (formData.id ? 'Edit Article' : 'Write New Article')}
                                        </h1>
                                        <p className="text-muted-foreground text-xs truncate">
                                            {formData.id ? `ID: ${formData.id}` : 'Unsaved draft'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                                    <AiArtikelGenerator onGenerated={handleAiGenerated} />
                                    <Button
                                        variant="outline"
                                        onClick={() => handleSave(false)}
                                        disabled={isSaving || !formData.title.trim()}
                                        className="gap-1.5 h-9 rounded-lg font-semibold text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex-1 md:flex-none cursor-pointer"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Saving
                                            </>
                                        ) : (
                                            'Save Draft'
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => handleSave(true)}
                                        disabled={isSaving || !formData.title.trim()}
                                        className="gap-1.5 h-9 rounded-lg font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex-1 md:flex-none px-4 shadow-xs cursor-pointer"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        {formData.status === 'published' ? 'Update' : 'Publish'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 bg-neutral-50/40 dark:bg-background">
                            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    <div className="xl:col-span-2 space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">
                                                Title <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                value={formData.title}
                                                onChange={handleTitleChange}
                                                placeholder="Enter an engaging article title..."
                                                className="text-lg font-bold h-12 rounded-xl border-border/60"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">
                                                URL Slug <span className="text-rose-500">*</span>
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-muted-foreground bg-muted/50 border border-border/40 px-3 py-0 h-10 rounded-lg whitespace-nowrap flex items-center justify-center">
                                                    /artikel/
                                                </span>
                                                <Input
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                                                    className="font-mono text-sm h-10 rounded-lg border-border/60"
                                                    placeholder="article-slug"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Content</Label>
                                            <div className="border border-border/60 rounded-[1.25rem] overflow-hidden bg-muted/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                                <TipTapEditor
                                                    content={formData.content}
                                                    articleSlug={formData.slug}
                                                    onChange={(c) => setFormData(p => ({ ...p, content: c }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Card className="rounded-[1.25rem] border border-border/60 bg-muted/20 shadow-none">
                                            <CardHeader className="pb-3 border-b border-border/40 bg-background/50 rounded-t-[1.25rem]">
                                                <CardTitle className="text-[13px] font-extrabold uppercase tracking-wide">Settings</CardTitle>
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
                                                        placeholder="Short description for SEO and previews..."
                                                        className="h-24 resize-none rounded-lg border-border/60"
                                                    />
                                                    <p className="text-[11px] text-muted-foreground font-medium">
                                                        {formData.excerpt?.length || 0}/160 characters
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-[1.25rem] border border-border/60 bg-muted/20 shadow-none">
                                            <CardHeader className="pb-3 border-b border-border/40 bg-background/50 rounded-t-[1.25rem]">
                                                <CardTitle className="text-[13px] font-extrabold uppercase tracking-wide">Media &amp; Tags</CardTitle>
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
                                                                        Uploading...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Upload className="w-4 h-4 mr-2" />
                                                                        Choose Image
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <p className="text-xs text-muted-foreground">
                                                                Max size 5MB (JPG, PNG, WebP)
                                                            </p>
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
                                                                        toast.success('Featured image URL attached successfully');
                                                                    }
                                                                }}
                                                                disabled={!imageUrl.trim()}
                                                            >
                                                                <ImageIcon className="w-4 h-4 mr-2" />
                                                                Use URL
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
                                                        placeholder="Type a tag and press Enter..."
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
                <DialogContent className="sm:max-w-[425px] rounded-2xl overflow-hidden border border-neutral-200/80 shadow-2xl bg-white dark:bg-card">
                    <DialogHeader className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                        <DialogTitle className="text-lg font-bold">Delete Article</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-xl">
                            <TriangleAlert className="h-5 w-5" />
                            <AlertTitle className="font-bold">Warning</AlertTitle>
                            <AlertDescription className="text-sm font-medium mt-1">
                                Article <strong className="font-semibold">&quot;{articleToDelete?.title}&quot;</strong> will be permanently deleted along with all its uploaded images. This action cannot be undone.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                            className="h-9 rounded-lg font-medium border-neutral-200 px-4"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            variant="destructive"
                            className="gap-2 h-9 rounded-lg font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Article
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
