'use client';

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import TiptapUnderline from '@tiptap/extension-underline';
import { TextSelection } from '@tiptap/pm/state';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import {
  Bold,
  Code2,
  Italic,
  List,
  ListOrdered,
  Underline,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';

interface DiaryContentEditorProps {
  content: string;
  onChange(html: string): void;
}

// 코드 블록이 문서 맨 위에 있고 첫 줄에 커서가 있을 때 ArrowUp을 누르면
// 위에 빈 단락을 추가해 문서 상단에서도 텍스트를 입력할 수 있게 한다.
const CodeBlockWithEscape = CodeBlockLowlight.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      ArrowUp: ({ editor }) => {
        const { state } = editor;
        const { selection, schema } = state;
        if (!selection.empty) {
          return false;
        }

        const { $from } = selection;
        if ($from.parent.type.name !== 'codeBlock') {
          return false;
        }
        if ($from.depth !== 1 || $from.index(0) !== 0) {
          return false;
        }

        const textBefore = $from.parent.textContent.slice(
          0,
          $from.parentOffset,
        );
        if (textBefore.includes('\n')) {
          return false;
        }

        const paragraph = schema.nodes.paragraph?.create();
        if (!paragraph) {
          return false;
        }

        const tr = state.tr.insert(0, paragraph);
        tr.setSelection(TextSelection.create(tr.doc, 1));
        editor.view.dispatch(tr.scrollIntoView());
        return true;
      },
    };
  },
});

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
      className={cn(
        'rounded-lg border p-2',
        active
          ? 'border-main-800 bg-main-100 text-main-800'
          : 'border-gray-200 text-gray-600 hover:bg-gray-100'
      )}
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

// 기본 toggleCodeBlock은 선택된 각 블록을 개별 코드 블록으로 변환한다.
// 여러 줄을 드래그한 경우 하나의 코드 블록으로 합쳐 변환한다.
function toggleCodeBlockMerged(editor: Editor): void {
  if (editor.isActive('codeBlock')) {
    editor.chain().focus().toggleCodeBlock().run();
    return;
  }

  const { from, to, empty } = editor.state.selection;

  if (empty) {
    editor.chain().focus().toggleCodeBlock().run();
    return;
  }

  const text = editor.state.doc.textBetween(from, to, '\n', '\n');
  const content = text
    ? [{ type: 'codeBlock', content: [{ type: 'text', text }] }]
    : [{ type: 'codeBlock' }];

  editor
    .chain()
    .focus()
    .deleteRange({ from, to })
    .insertContent(content)
    .run();
}

export function DiaryContentEditor({
  content,
  onChange,
}: DiaryContentEditorProps): React.ReactElement {
  const lastSyncedHtmlRef = useRef('');
  const lowlight = useMemo(() => createLowlight(common), []);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TiptapUnderline,
      CodeBlockWithEscape.configure({ lowlight, defaultLanguage: 'plaintext' }),
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

          <div className="mx-2 h-7 w-px bg-gray-200" />

          <ToolbarButton
            ariaLabel="코드 블록"
            tooltip="코드 블록 (⌘+⌥+C)"
            active={editor?.isActive('codeBlock')}
            onClick={() => editor && toggleCodeBlockMerged(editor)}
          >
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="min-h-[420px] p-4">
          <EditorContent
            editor={editor}
            className={cn(
              'prose prose-sm max-w-none text-gray-700 outline-none',
              '[&_.tiptap]:min-h-[380px] [&_.tiptap]:outline-none',
              '[&_.tiptap_img]:max-h-80 [&_.tiptap_img]:rounded-lg',
              '[&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5',
              '[&_ul]:list-disc [&_ul]:pl-5',
              '[&_pre]:rounded-lg [&_pre]:border [&_pre]:border-gray-200',
              '[&_pre]:bg-gray-50 [&_pre]:p-4 [&_pre]:text-gray-800',
              '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
              '[&_pre_code]:text-[0.875rem]',
              '[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-gray-100',
              '[&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5',
              '[&_:not(pre)>code]:text-[0.875rem]',
            )}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
