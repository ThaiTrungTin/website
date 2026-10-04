'use client';

import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent, Editor, Mark, mergeAttributes } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle, Color, FontFamily, FontSize } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Smile } from 'lucide-react';
import AdminEmojiPicker from './AdminEmojiPicker';

/* ─── Toolbar button helper ─── */
interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolbarBtn({ onClick, active, title, children, disabled }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center w-7 h-7 rounded text-sm transition select-none ${
        active
          ? 'bg-[#2D5A27] text-white'
          : 'text-slate-700 hover:bg-slate-100'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />;
}

/* ─── Toolbar ─── */
interface ToolbarProps {
  editor: Editor | null;
  onUploadImage?: (file: File) => Promise<string>;
  imgFileInputRef?: React.RefObject<HTMLInputElement | null>;
  stickyTopClass?: string;
}

const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px'];
const FONT_FAMILIES = [
  { label: 'Phông chữ', value: '' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Courier New', value: "'Courier New', monospace" },
];

function Toolbar({ editor, onUploadImage, imgFileInputRef, stickyTopClass = '-top-6' }: ToolbarProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const addImage = useCallback(async (file?: File) => {
    if (!editor) return;
    if (file && onUploadImage) {
      try {
        const url = await onUploadImage(file);
        if (url) editor.chain().focus().setImage({ src: url }).run();
      } catch {}
      return;
    }
    const url = window.prompt('Nhập URL ảnh:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor, onUploadImage]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Nhập URL liên kết:', prev ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const rawFontSize = (editor.getAttributes('textStyle').fontSize as string) ?? '';
  const rawFontFamily = (editor.getAttributes('textStyle').fontFamily as string) ?? '';
  const normalizedFamily = rawFontFamily.replace(/['"]/g, '').toLowerCase().trim();
  const activeFontFamily =
    FONT_FAMILIES.find((f) => f.value && f.value.replace(/['"]/g, '').toLowerCase().trim() === normalizedFamily)?.value ?? '';
  const activeFontSize = FONT_SIZES.find((s) => s === rawFontSize) ?? '';

  const applyFontFamily = (family: string) => {
    if (!editor) return;
    const { empty, $from } = editor.state.selection;
    if (!family) {
      if (empty) {
        const text = $from.parent.textContent;
        const offset = $from.parentOffset;
        let start = offset;
        let end = offset;
        while (start > 0 && /\S/.test(text[start - 1])) start--;
        while (end < text.length && /\S/.test(text[end])) end++;
        if (start < end) {
          editor.chain().setTextSelection({ from: $from.start() + start, to: $from.start() + end }).unsetFontFamily().focus().run();
          return;
        }
      }
      (editor.chain().focus() as any).unsetFontFamily().run();
      return;
    }

    if (empty) {
      const text = $from.parent.textContent;
      const offset = $from.parentOffset;
      let start = offset;
      let end = offset;
      while (start > 0 && /\S/.test(text[start - 1])) start--;
      while (end < text.length && /\S/.test(text[end])) end++;
      if (start < end) {
        editor.chain().setTextSelection({ from: $from.start() + start, to: $from.start() + end }).setFontFamily(family).focus().run();
        return;
      }
    }
    (editor.chain().focus() as any).setFontFamily(family).run();
  };

  const applyFontSize = (size: string) => {
    if (!editor) return;
    const { empty, $from } = editor.state.selection;
    if (!size) {
      if (empty) {
        const text = $from.parent.textContent;
        const offset = $from.parentOffset;
        let start = offset;
        let end = offset;
        while (start > 0 && /\S/.test(text[start - 1])) start--;
        while (end < text.length && /\S/.test(text[end])) end++;
        if (start < end) {
          editor.chain().setTextSelection({ from: $from.start() + start, to: $from.start() + end }).unsetFontSize().focus().run();
          return;
        }
      }
      (editor.chain().focus() as any).unsetFontSize().run();
      return;
    }

    if (empty) {
      const text = $from.parent.textContent;
      const offset = $from.parentOffset;
      let start = offset;
      let end = offset;
      while (start > 0 && /\S/.test(text[start - 1])) start--;
      while (end < text.length && /\S/.test(text[end])) end++;
      if (start < end) {
        editor.chain().setTextSelection({ from: $from.start() + start, to: $from.start() + end }).setFontSize(size).focus().run();
        return;
      }
    }
    (editor.chain().focus() as any).setFontSize(size).run();
  };

  return (
    <div
      className={`sticky ${stickyTopClass} z-30 flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-200 bg-white shadow-xs rounded-t-xl`}
    >
      {/* Heading */}
      <select
        value={
          editor.isActive('heading', { level: 1 })
            ? '1'
            : editor.isActive('heading', { level: 2 })
            ? '2'
            : editor.isActive('heading', { level: 3 })
            ? '3'
            : '0'
        }
        onChange={(e) => {
          const v = e.target.value;
          if (v === '0') editor.chain().focus().setParagraph().run();
          else editor.chain().focus().setHeading({ level: Number(v) as 1 | 2 | 3 }).run();
        }}
        className="h-7 text-xs rounded border border-slate-200 bg-white px-1.5 text-slate-700 focus:outline-none focus:border-[#2D5A27] cursor-pointer"
      >
        <option value="0">Đoạn văn</option>
        <option value="1">Tiêu đề 1</option>
        <option value="2">Tiêu đề 2</option>
        <option value="3">Tiêu đề 3</option>
      </select>

      <Divider />

      {/* Phông chữ */}
      <select
        value={activeFontFamily}
        onChange={(e) => applyFontFamily(e.target.value)}
        title="Phông chữ"
        style={{ fontFamily: activeFontFamily || undefined }}
        className="h-7 text-xs rounded border border-slate-200 bg-white px-1.5 text-slate-700 focus:outline-none focus:border-[#2D5A27] cursor-pointer max-w-[110px]"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value || undefined }}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Cỡ chữ */}
      <select
        value={activeFontSize}
        onChange={(e) => applyFontSize(e.target.value)}
        title="Cỡ chữ"
        className="h-7 text-xs rounded border border-slate-200 bg-white px-1.5 text-slate-700 focus:outline-none focus:border-[#2D5A27] cursor-pointer w-[68px]"
      >
        <option value="">Cỡ chữ</option>
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s.replace('px', '')}
          </option>
        ))}
      </select>

      <Divider />

      {/* Basic format */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In đậm (Ctrl+B)">
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="In nghiêng (Ctrl+I)">
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch chân (Ctrl+U)">
        <span style={{ textDecoration: 'underline' }}>U</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </ToolbarBtn>

      <Divider />

      {/* Color */}
      <label title="Màu chữ" className="relative inline-flex items-center justify-center w-7 h-7 rounded hover:bg-slate-100 cursor-pointer">
        <span className="text-xs font-bold" style={{ color: editor.getAttributes('textStyle').color || '#1e293b' }}>A</span>
        <input
          type="color"
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          value={editor.getAttributes('textStyle').color || '#1e293b'}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
      </label>

      {/* Highlight */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
        active={editor.isActive('highlight')}
        title="Tô sáng"
      >
        <span className="text-xs">🖊</span>
      </ToolbarBtn>

      <Divider />

      {/* Alignment */}
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
      </ToolbarBtn>

      <Divider />

      {/* Lists */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách dấu chấm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">1.</text><text x="2" y="14" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">2.</text><text x="2" y="20" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">3.</text></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trích dẫn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
      </ToolbarBtn>

      <Divider />

      {/* Link & Image */}
      <ToolbarBtn onClick={setLink} active={editor.isActive('link')} title="Chèn liên kết">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </ToolbarBtn>

      {onUploadImage && imgFileInputRef ? (
        <>
          <input
            type="file"
            ref={imgFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await addImage(file);
              if (imgFileInputRef.current) imgFileInputRef.current.value = '';
            }}
          />
          <ToolbarBtn onClick={() => imgFileInputRef.current?.click()} title="Chèn ảnh (chọn tệp từ máy)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </ToolbarBtn>
          <ToolbarBtn
            onClick={async () => {
              if (!editor || !onUploadImage) return;
              try {
                if (typeof navigator !== 'undefined' && navigator.clipboard?.read) {
                  const items = await navigator.clipboard.read();
                  for (const item of items) {
                    const imageType = item.types.find((t) => t.startsWith('image/'));
                    if (imageType) {
                      const blob = await item.getType(imageType);
                      const file = new File([blob], `pasted_${Date.now()}.${imageType.split('/')[1] || 'png'}`, { type: imageType });
                      const url = await onUploadImage(file);
                      if (url) editor.chain().focus().setImage({ src: url }).run();
                      return;
                    }
                  }
                }
              } catch (err) {
                console.warn('Clipboard read error:', err);
              }
              editor?.chain().focus().run();
              window.alert('Vui lòng nhấp vào khung bài viết và nhấn Ctrl+V để dán ảnh!');
            }}
            title="Dán ảnh từ bộ nhớ tạm (Clipboard / Ctrl+V)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          </ToolbarBtn>
        </>
      ) : (
        <ToolbarBtn onClick={() => addImage()} title="Chèn ảnh (URL)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </ToolbarBtn>
      )}

      <Divider />

      {/* Biểu tượng cảm xúc, icon & lá cờ (phong cách FB / Zalo) */}
      <div className="relative">
        <ToolbarBtn
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          active={showEmojiPicker}
          title="Chèn biểu tượng cảm xúc / Lá cờ / Icon"
        >
          <Smile className={`w-4 h-4 ${showEmojiPicker ? 'text-white' : 'text-amber-500'}`} />
        </ToolbarBtn>
        <AdminEmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelectEmoji={(emoji) => {
            editor.chain().focus().insertContent(emoji).run();
          }}
          align="right"
          title="Biểu tượng cảm xúc bài viết"
        />
      </div>

      <Divider />

      {/* Undo / Redo */}
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
      </ToolbarBtn>
    </div>
  );
}

/* ─── Main Editor ─── */
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  onUploadImage?: (file: File) => Promise<string>;
  stickyTopClass?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  minHeight = 400,
  onUploadImage,
  stickyTopClass = '-top-6',
}: RichTextEditorProps) {
  const imgFileInputRef = React.useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      (StarterKit as any).configure({
        history: false,
        link: false,
        underline: false,
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none p-4 focus:outline-none min-h-[inherit]',
        style: `min-height: ${minHeight}px`,
      },
    },
    immediatelyRender: false,
  });

  // Tự động đồng bộ nội dung khi prop `value` thay đổi từ bên ngoài (Dịch AI, nạp dữ liệu, chuyển tab...)
  React.useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const targetHtml = value || '';
    if (targetHtml !== currentHtml) {
      editor.commands.setContent(targetHtml, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div
      className="rounded-xl border border-slate-300 bg-white focus-within:border-[#2D5A27] transition shadow-2xs relative"
      onPaste={async (e) => {
        if (!onUploadImage || !editor) return;
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (!file) continue;
            try {
              const url = await onUploadImage(file);
              if (url) editor.chain().focus().setImage({ src: url }).run();
            } catch {}
            return;
          }
        }
      }}
    >
      <Toolbar
        editor={editor}
        onUploadImage={onUploadImage}
        imgFileInputRef={imgFileInputRef}
        stickyTopClass={stickyTopClass}
      />
      <EditorContent editor={editor} className="rounded-b-xl overflow-hidden" />
    </div>
  );
}
