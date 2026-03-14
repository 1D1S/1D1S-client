'use client';

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@1d1s/design-system';
import TiptapUnderline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Underline } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

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
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="small"
      aria-label={ariaLabel}
      className={`rounded-lg border p-2 ${
        active
          ? 'border-main-800 bg-main-100 text-main-800'
          : 'border-gray-200 text-gray-600 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      {children}
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function DiaryContentEditor({
  content,
  onChange,
}: DiaryContentEditorProps): React.ReactElement {
  const lastSyncedHtmlRef = useRef('');
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      // TiptapImage, // 본문 이미지 삽입 기능은 임시 비활성화
    ],
    // Editor content is hydrated via effect to avoid frequent re-initialization.
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => {
      const currentHtml = instance.getHTML();
      lastSyncedHtmlRef.current = currentHtml;
      onChange(currentHtml);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = content || '';

    // Skip re-applying HTML that was just emitted by this editor instance.
    if (lastSyncedHtmlRef.current === nextContent) {
      return;
    }

    const currentHtml = editor.getHTML();

    if (currentHtml !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
      lastSyncedHtmlRef.current = nextContent;
    }
  }, [content, editor]);

  return (
    <TooltipProvider>
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
        </div>

        <div className="min-h-[420px] p-4">
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none text-gray-700 outline-none [&_.tiptap]:min-h-[380px] [&_.tiptap]:outline-none [&_.tiptap_img]:max-h-80 [&_.tiptap_img]:rounded-lg [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
