'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import ImageResize from 'tiptap-extension-resize-image'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { common, createLowlight } from 'lowlight'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadArticleContentImage } from '@/lib/supabase/storage'

// Import komponen Tiptap UI
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button'
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node'
import '@/components/tiptap-node/image-upload-node/image-upload-node.scss'

import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useCallback, useState } from 'react'

import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    CodeSquare,
    Minus,
} from 'lucide-react'

const lowlight = createLowlight(common)

// Konstanta
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Handle image upload - Convert ke base64 untuk preview
 */
const validateImageFile = (file: File) => {
    if (!file) throw new Error("No file provided")
    if (!file.type.startsWith('image/')) throw new Error("File harus berupa gambar")
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Ukuran file melebihi maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
    }
}

const fileToBase64 = async (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal
): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        let progress = 0
        const interval = setInterval(() => {
            progress += 20
            onProgress?.({ progress: Math.min(progress, 95) })
            if (progress >= 95) clearInterval(interval)
        }, 50)

        reader.onload = () => {
            clearInterval(interval)
            onProgress?.({ progress: 100 })
            resolve(reader.result as string)
        }
        reader.onerror = () => {
            clearInterval(interval)
            reject(new Error('Failed to read file'))
        }
        abortSignal?.addEventListener('abort', () => {
            clearInterval(interval)
            reader.abort()
            reject(new Error('Upload cancelled'))
        })
        reader.readAsDataURL(file)
    })
}

interface TipTapEditorProps {
    content?: string
    articleSlug?: string
    onChange?: (content: string) => void
}

const TipTapEditor = ({ content, articleSlug, onChange }: TipTapEditorProps) => {
    const [linkUrl, setLinkUrl] = useState('')
    const [showLinkInput, setShowLinkInput] = useState(false)

    const handleEditorImageUpload = useCallback(async (
        file: File,
        onProgress?: (event: { progress: number }) => void,
        abortSignal?: AbortSignal
    ): Promise<string> => {
        validateImageFile(file)
        if (!articleSlug?.trim()) return fileToBase64(file, onProgress, abortSignal)
        onProgress?.({ progress: 20 })
        const supabase = createClient()
        const publicUrl = await uploadArticleContentImage(supabase, file, articleSlug)
        onProgress?.({ progress: 100 })
        return publicUrl
    }, [articleSlug])

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            ImageResize.configure({
                inline: true,
                // @ts-expect-error ImageResize supports allowBase64 at runtime
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg',
                },
            }),
            // ImageUploadNode dengan base64 handler
            ImageUploadNode.configure({
                type: 'imageResize', // Use the correct node type name
                accept: 'image/*',
                maxSize: MAX_FILE_SIZE,
                limit: 5,
                upload: handleEditorImageUpload,
                onError: (error) => {
                    console.error('Upload failed:', error)
                    alert(error.message || 'Upload gagal')
                },
            }),
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
            TextStyle,
            Color,
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'bg-gray-900 text-gray-100 rounded p-4 my-4',
                },
            }),
            Placeholder.configure({
                placeholder: 'Mulai menulis artikel blog Anda...',
            }),
        ],
        content: content || '',
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'tiptap-content focus:outline-none min-h-[500px] p-6',
            },
        },
    })

    // Fix: Update editor content saat prop content berubah
    useEffect(() => {
        if (editor && content !== undefined && content !== editor.getHTML()) {
            editor.commands.setContent(content, {
                emitUpdate: false, // Jangan trigger onChange saat load
            })
        }
    }, [content, editor])

    const setLink = useCallback(() => {
        if (linkUrl === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run()
            setShowLinkInput(false)
            return
        }

        editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
        setLinkUrl('')
        setShowLinkInput(false)
    }, [editor, linkUrl])

    if (!editor) {
        return null
    }

    return (
        <div className="rounded-[1.25rem] overflow-hidden border border-border/60 bg-background shadow-sm">
            {/* Toolbar */}
            <div className="border-b border-border/60 bg-muted/30 px-2 py-1.5 flex flex-wrap gap-0.5 items-center sticky top-0 z-10 backdrop-blur-sm">
                {/* Undo/Redo */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                    className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                >
                    <Undo className="h-3.5 w-3.5" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                    className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                >
                    <Redo className="h-3.5 w-3.5" />
                </Button>

                <Separator orientation="vertical" className="h-8" />

                {/* Heading Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs font-bold rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                            {editor.isActive('heading', { level: 1 }) ? 'H1'
                                : editor.isActive('heading', { level: 2 }) ? 'H2'
                                : editor.isActive('heading', { level: 3 }) ? 'H3'
                                : 'T'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-xl border-border/60 shadow-xl">
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`text-sm font-bold rounded-lg cursor-pointer ${editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : ''}`}
                        >
                            <Heading1 className="h-4 w-4 mr-2" />
                            Heading 1
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`text-sm font-bold rounded-lg cursor-pointer ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : ''}`}
                        >
                            <Heading2 className="h-4 w-4 mr-2" />
                            Heading 2
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={`text-sm font-bold rounded-lg cursor-pointer ${editor.isActive('heading', { level: 3 }) ? 'bg-primary/10 text-primary' : ''}`}
                        >
                            <Heading3 className="h-4 w-4 mr-2" />
                            Heading 3
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().setParagraph().run()}
                            className={`text-sm font-medium rounded-lg cursor-pointer ${editor.isActive('paragraph') ? 'bg-primary/10 text-primary' : ''}`}
                        >
                            Normal
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-8" />

                {/* Text Formatting */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    title="Bold (Ctrl+B)"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <Bold className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic (Ctrl+I)"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <Italic className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('underline')}
                    onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline (Ctrl+U)"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <UnderlineIcon className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('strike')}
                    onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                    title="Strikethrough"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <Strikethrough className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('highlight')}
                    onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
                    title="Highlight"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <Highlighter className="h-3.5 w-3.5" />
                </Toggle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" title="Text Color" className="h-7 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                            Color
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-xl border-border/60 shadow-xl">
                        {[
                            { label: 'Default', color: '' },
                            { label: 'Black', color: '#111827' },
                            { label: 'Blue', color: '#2563eb' },
                            { label: 'Green', color: '#16a34a' },
                            { label: 'Red', color: '#dc2626' },
                            { label: 'Amber', color: '#d97706' },
                        ].map((item) => (
                            <DropdownMenuItem key={item.label} onClick={() => item.color ? editor.chain().focus().setColor(item.color).run() : editor.chain().focus().unsetColor().run()} className="text-sm font-medium rounded-lg cursor-pointer">
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-8" />

                {/* Text Alignment */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'left' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                    title="Align Left"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <AlignLeft className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'center' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                    title="Align Center"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <AlignCenter className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'right' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                    title="Align Right"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <AlignRight className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'justify' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
                    title="Justify"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <AlignJustify className="h-3.5 w-3.5" />
                </Toggle>

                <Separator orientation="vertical" className="h-8" />

                {/* Lists */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    title="Bullet List"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <List className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    title="Numbered List"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <ListOrdered className="h-3.5 w-3.5" />
                </Toggle>

                <Separator orientation="vertical" className="h-8" />

                {/* Quote & Code */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive('blockquote')}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    title="Blockquote"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <Quote className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('code')}
                    onPressedChange={() => editor.chain().focus().toggleCode().run()}
                    title="Inline Code"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <Code className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('codeBlock')}
                    onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                    title="Code Block"
                    className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                    <CodeSquare className="h-3.5 w-3.5" />
                </Toggle>

                <Separator orientation="vertical" className="h-8" />

                {/* Link */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    title="Add Link"
                    className={`h-7 w-7 p-0 rounded-md hover:bg-muted ${showLinkInput ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <LinkIcon className="h-3.5 w-3.5" />
                </Button>

                {/* Image Upload Button */}
                <ImageUploadButton
                    editor={editor}
                    hideWhenUnavailable={true}
                    showShortcut={false}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" title="Image Layout" className="h-7 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                            Image
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-xl border-border/60 shadow-xl">
                        {[
                            { label: 'Small', width: '35%' },
                            { label: 'Medium', width: '60%' },
                            { label: 'Full', width: '100%' },
                        ].map((item) => (
                            <DropdownMenuItem key={item.width} onClick={() => editor.chain().focus().updateAttributes('imageResize', { width: item.width }).run()} className="text-sm font-medium rounded-lg cursor-pointer">
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('imageResize', { 'data-align': 'left' }).run()} className="text-sm font-medium rounded-lg cursor-pointer">
                            Align left
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('imageResize', { 'data-align': 'center' }).run()} className="text-sm font-medium rounded-lg cursor-pointer">
                            Align center
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('imageResize', { 'data-align': 'right' }).run()} className="text-sm font-medium rounded-lg cursor-pointer">
                            Align right
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Horizontal Rule */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Line"
                    className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <Minus className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Link Input */}
            {showLinkInput && (
                <div className="border-b border-border/60 bg-primary/5 p-2 flex gap-2 items-center">
                    <LinkIcon className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                    <Input
                        type="url"
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                setLink()
                            }
                        }}
                        className="flex-1 h-8 text-sm rounded-lg border-border/60"
                    />
                    <Button size="sm" onClick={setLink} className="h-8 rounded-lg font-bold text-xs">
                        Tambah
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            editor.chain().focus().unsetLink().run()
                            setShowLinkInput(false)
                        }}
                        className="h-8 rounded-lg text-xs font-bold"
                    >
                        Hapus
                    </Button>
                </div>
            )}

            {/* Editor Area */}
            <div className="bg-background">
                <EditorContent editor={editor} />
            </div>

            {/* Info Helper */}
            <div className="border-t border-border/60 bg-muted/20 px-4 py-1.5 text-[11px] text-muted-foreground font-medium">
                💡 Klik gambar untuk resize dengan drag handles.
            </div>
        </div>
    )
}

export default TipTapEditor
