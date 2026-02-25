'use client';

import TiptapImage from '@tiptap/extension-image';
import TiptapUnderline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Underline,
} from 'lucide-react';
import React, { useRef } from 'react';

interface DiaryContentEditorProps {
  content: string;
  onChange(html: string): void;
}

function ToolbarButton({
  onClick,
  active,
  ariaLabel,
  tooltip,
  children,
}: {
  onClick(): void;
  active?: boolean;
  ariaLabel: string;
  tooltip?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={ariaLabel}
        className={`rounded-lg border p-2 transition ${
          active
            ? 'border-main-800 bg-main-100 text-main-800'
            : 'border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
        onClick={onClick}
      >
        {children}
      </button>
      {tooltip ? (
        <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
          {tooltip}
        </span>
      ) : null}
    </div>
  );
}

export function DiaryContentEditor({
  content,
  onChange,
}: DiaryContentEditorProps): React.ReactElement {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, TiptapUnderline, TiptapImage],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  const handleImageSelect = (): void => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = event.target.files;
    if (!files || !editor) {
      return;
    }
    Array.from(files).forEach((file) => {
      const src = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src }).run();
    });
    event.target.value = '';
  };

  return (
    <div className="overflow-visible rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-3">
        <ToolbarButton
          ariaLabel="굵게"
          tooltip="굵게 (⌘+B)"
          active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="기울임"
          tooltip="기울임 (⌘+I)"
          active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="밑줄"
          tooltip="밑줄 (⌘+U)"
          active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-2 h-7 w-px bg-gray-200" />

        <ToolbarButton
          ariaLabel="불릿 리스트"
          tooltip="불릿 리스트 (⌘+⇧+8)"
          active={editor?.isActive('bulletList')}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="번호 리스트"
          tooltip="번호 리스트 (⌘+⇧+7)"
          active={editor?.isActive('orderedList')}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="이미지 삽입"
          onClick={handleImageSelect}
        >
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="min-h-[420px] p-4">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none text-gray-700 outline-none [&_.tiptap]:min-h-[380px] [&_.tiptap]:outline-none [&_.tiptap_img]:max-h-80 [&_.tiptap_img]:rounded-lg"
        />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
  );
}
