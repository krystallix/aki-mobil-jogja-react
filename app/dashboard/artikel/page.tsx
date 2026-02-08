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
import { Plus, X, Search, Loader2, MoreVertical, Trash2, Share2, Send, Save, TriangleAlert, Copy, Check, Upload, Image as ImageIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
    };

    const handleCreateNew = () => {
        setFormData(DEFAULT_FORM);
        setImageUrl('');
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
                    <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col h-full border-r bg-background">
                        <div className="flex-none p-4 border-b space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Daftar Artikel</h2>
                                <Button size="sm" onClick={handleCreateNew} variant="outline">
                                    <Plus className="w-4 h-4 mr-1" /> Baru
                                </Button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari artikel..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {isLoadingList ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="animate-spin" />
                                    </div>
                                ) : filteredArticles.map((article) => (
                                    <div
                                        key={article.id}
                                        className={`group relative cursor-pointer transition-colors hover:bg-accent rounded-md p-3 ${formData.id === article.id ? 'bg-accent border border-primary' : 'border border-transparent'}`}
                                        onClick={() => handleSelectArticle(article)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge
                                                        variant={article.status === 'published' ? 'default' : 'secondary'}
                                                        className="text-[10px] px-1.5 py-0"
                                                    >
                                                        {article.status}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru'}
                                                    </span>
                                                </div>
                                                <h3 className="font-medium line-clamp-2 text-sm mb-1">
                                                    {article.title || 'Tanpa Judul'}
                                                </h3>
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
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                    >
                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyLink(article);
                                                        }}
                                                    >
                                                        {copiedId === article.id ? (
                                                            <>
                                                                <Check className="h-4 w-4 mr-2 text-green-600" />
                                                                <span>Link Tersalin!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-4 w-4 mr-2" />
                                                                <span>Salin Link</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>

                                                    {article.status === 'published' && (
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleShareClick(article);
                                                            }}
                                                        >
                                                            <Share2 className="h-4 w-4 mr-2" />
                                                            <span>Bagikan</span>
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive cursor-pointer"
                                                        onClick={(e) => handleDeleteClick(article, e)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        <span>Hapus Artikel</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                                {filteredArticles.length === 0 && !isLoadingList && (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        Tidak ada artikel ditemukan
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* RIGHT SIDE: EDITOR */}
                    <div className="col-span-12 lg:col-span-8 xl:col-span-9 h-full flex flex-col">

                        <div className="flex-none p-6 border-b bg-background">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        {formData.id ? 'Edit Artikel' : 'Buat Artikel Baru'}
                                    </h1>
                                    <p className="text-muted-foreground text-sm">
                                        {formData.id ? `ID: ${formData.id}` : 'Draft belum disimpan'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleSave(false)}
                                        disabled={isSaving || !formData.title.trim()}
                                        className="gap-2"
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
                                        className="gap-2 bg-blue-600 hover:bg-blue-700"
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
                                            <Label>
                                                Judul <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                value={formData.title}
                                                onChange={handleTitleChange}
                                                placeholder="Judul artikel yang menarik..."
                                                className="text-lg font-medium"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                Slug URL <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md whitespace-nowrap">
                                                    /artikel/
                                                </span>
                                                <Input
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                                                    className="font-mono text-sm"
                                                    placeholder="url-slug-artikel"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Konten</Label>
                                            <div className="border rounded-lg overflow-hidden">
                                                <TipTapEditor
                                                    content={formData.content}
                                                    onChange={(c) => setFormData(p => ({ ...p, content: c }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium">Pengaturan</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Status</Label>
                                                    <Select
                                                        value={formData.status}
                                                        onValueChange={(v: any) => setFormData(p => ({ ...p, status: v }))}
                                                    >
                                                        <SelectTrigger>
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
                                                    <Label>Excerpt</Label>
                                                    <Textarea
                                                        value={formData.excerpt || ''}
                                                        onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                                                        placeholder="Deskripsi singkat untuk SEO..."
                                                        className="h-24 resize-none"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        {formData.excerpt?.length || 0}/160 karakter
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium">Media & Tags</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Featured Image</Label>

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
                                                                className="w-full"
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
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="w-full"
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
                                                    <Label>Tags</Label>
                                                    <Input
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyDown={handleAddTag}
                                                        placeholder="Ketik tag, tekan Enter..."
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                    </DialogHeader>

                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Peringatan!</AlertTitle>
                        <AlertDescription className="text-sm">
                            Artikel <strong className="font-semibold">&quot;{articleToDelete?.title}&quot;</strong> akan dihapus permanen beserta semua gambar di dalamnya. Tindakan ini tidak dapat dibatalkan.
                        </AlertDescription>
                    </Alert>

                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            variant="destructive"
                            className="gap-2"
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
