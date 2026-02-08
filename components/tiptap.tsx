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
const handleImageUpload = async (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal
): Promise<string> => {
    if (!file) {
        throw new Error("No file provided")
    }

    if (!file.type.startsWith('image/')) {
        throw new Error("File harus berupa gambar")
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            `Ukuran file melebihi maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        )
    }

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        let progress = 0
        const interval = setInterval(() => {
            progress += 20
            if (progress <= 100 && onProgress) {
                onProgress({ progress })
            }
            if (progress >= 100) {
                clearInterval(interval)
            }
        }, 50)

        reader.onload = () => {
            clearInterval(interval)
            if (onProgress) onProgress({ progress: 100 })
            resolve(reader.result as string)
        }

        reader.onerror = () => {
            clearInterval(interval)
            reject(new Error('Failed to read file'))
        }

        if (abortSignal) {
            abortSignal.addEventListener('abort', () => {
                clearInterval(interval)
                reader.abort()
                reject(new Error('Upload cancelled'))
            })
        }

        reader.readAsDataURL(file)
    })
}

interface TipTapEditorProps {
    content?: string
    onChange?: (content: string) => void
}

const TipTapEditor = ({ content, onChange }: TipTapEditorProps) => {
    const [linkUrl, setLinkUrl] = useState('')
    const [showLinkInput, setShowLinkInput] = useState(false)

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
                // @ts-ignore
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
                upload: handleImageUpload,
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
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8 prose-img:rounded-lg',
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
        <div className="border rounded-lg shadow-sm bg-white">
            {/* Toolbar */}
            <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
                {/* Undo/Redo */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8" />

                {/* Heading Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                            Heading
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        >
                            <Heading1 className="h-4 w-4 mr-2" />
                            Heading 1
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        >
                            <Heading2 className="h-4 w-4 mr-2" />
                            Heading 2
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        >
                            <Heading3 className="h-4 w-4 mr-2" />
                            Heading 3
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().setParagraph().run()}
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
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('underline')}
                    onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('strike')}
                    onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('highlight')}
                    onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
                    title="Highlight"
                >
                    <Highlighter className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-8" />

                {/* Text Alignment */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'left' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'center' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'right' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'justify' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
                    title="Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-8" />

                {/* Lists */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-8" />

                {/* Quote & Code */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive('blockquote')}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    title="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('code')}
                    onPressedChange={() => editor.chain().focus().toggleCode().run()}
                    title="Inline Code"
                >
                    <Code className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('codeBlock')}
                    onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                    title="Code Block"
                >
                    <CodeSquare className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-8" />

                {/* Link */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    title="Add Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>

                {/* Image Upload Button */}
                <ImageUploadButton
                    editor={editor}
                    hideWhenUnavailable={true}
                    showShortcut={false}
                />

                {/* Horizontal Rule */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Line"
                >
                    <Minus className="h-4 w-4" />
                </Button>
            </div>

            {/* Link Input */}
            {showLinkInput && (
                <div className="border-b bg-blue-50 p-3 flex gap-2 items-center">
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
                        className="flex-1"
                    />
                    <Button size="sm" onClick={setLink}>
                        Tambah Link
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            editor.chain().focus().unsetLink().run()
                            setShowLinkInput(false)
                        }}
                    >
                        Hapus Link
                    </Button>
                </div>
            )}

            {/* Editor Area */}
            <div className="bg-white">
                <EditorContent editor={editor} />
            </div>

            {/* Info Helper */}
            <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500">
                💡 Tips: Klik gambar untuk resize dengan drag handles. Gambar akan diupload ke Supabase saat submit.
            </div>
        </div>
    )
}

export default TipTapEditor
