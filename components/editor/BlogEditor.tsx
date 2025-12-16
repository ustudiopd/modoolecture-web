'use client';

import { useRef } from 'react';
import { 
  EditorRoot, 
  EditorContent, 
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
  EditorBubble,
  EditorBubbleItem,
  Command,
  renderItems,
  type JSONContent 
} from 'novel';
import { extensions } from './extensions';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Youtube,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code2
} from 'lucide-react';

interface BlogEditorProps {
  content: JSONContent | null;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
}

export default function BlogEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
}: BlogEditorProps) {
  const commandRef = useRef<HTMLDivElement>(null);

  const getSuggestionItems = ({ query }: { query: string }) => {
    return [
      {
        title: '제목 1',
        description: '큰 제목',
        icon: Heading1,
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 1 })
            .run();
        },
      },
      {
        title: '제목 2',
        description: '중간 제목',
        icon: Heading2,
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 2 })
            .run();
        },
      },
      {
        title: '제목 3',
        description: '작은 제목',
        icon: Heading3,
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 3 })
            .run();
        },
      },
      {
        title: '글머리 기호',
        description: '글머리 기호 목록',
        icon: List,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        title: '번호 목록',
        description: '번호가 있는 목록',
        icon: ListOrdered,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
      {
        title: '인용',
        description: '인용구 블록',
        icon: Quote,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
      },
      {
        title: '코드 블록',
        description: '코드 블록 삽입',
        icon: Code,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
      },
      {
        title: '이미지',
        description: '이미지 삽입',
        icon: ImageIcon,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).run();
          const url = window.prompt('이미지 URL을 입력하세요:');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        },
      },
      {
        title: '링크',
        description: '링크 삽입',
        icon: LinkIcon,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).run();
          const url = window.prompt('링크 URL을 입력하세요:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        },
      },
      {
        title: 'YouTube',
        description: 'YouTube 동영상 삽입',
        icon: Youtube,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).run();
          const url = window.prompt('YouTube URL을 입력하세요:');
          if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
          }
        },
      },
    ].filter((item) => {
      if (typeof query === 'string' && query.length > 0) {
        const search = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
        );
      }
      return true;
    });
  };

  return (
    <div className="w-full">
      <EditorRoot>
        <EditorContent
          extensions={[
            ...extensions,
            Command.configure({
              suggestion: {
                char: '/',
                command: ({ editor, range, props }: any) => {
                  props.command({ editor, range });
                },
                items: getSuggestionItems,
                render: () => renderItems(commandRef as React.RefObject<Element>),
              },
            }),
          ] as any}
          initialContent={content ?? undefined}
          onUpdate={({ editor }) => {
            onChange(editor.getJSON());
          }}
          editorProps={{
            attributes: {
              class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-2',
            },
          }}
        >
          <EditorBubble
            tippyOptions={{
              placement: 'top',
              duration: 200,
            }}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1 py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <EditorBubbleItem
              onSelect={(editor) => {
                editor.chain().focus().toggleBold().run();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Bold className="h-4 w-4" />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => {
                editor.chain().focus().toggleItalic().run();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Italic className="h-4 w-4" />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => {
                editor.chain().focus().toggleUnderline().run();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Underline className="h-4 w-4" />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => {
                editor.chain().focus().toggleStrike().run();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Strikethrough className="h-4 w-4" />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => {
                editor.chain().focus().toggleCode().run();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Code2 className="h-4 w-4" />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => {
                const url = window.prompt('링크 URL을 입력하세요:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <LinkIcon className="h-4 w-4" />
            </EditorBubbleItem>
          </EditorBubble>
          <div ref={commandRef}>
            <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-slate-200 bg-white px-1 py-2 shadow-md transition-all dark:border-slate-700 dark:bg-slate-800">
              <EditorCommandList>
                <EditorCommandItem
                  value="heading1"
                  onCommand={({ editor, range }) => {
                    editor
                      .chain()
                      .focus()
                      .deleteRange(range)
                      .setHeading({ level: 1 })
                      .run();
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Heading1 className="h-4 w-4" />
                  <div>
                    <p className="font-medium">제목 1</p>
                    <p className="text-xs text-slate-500">큰 제목</p>
                  </div>
                </EditorCommandItem>
                <EditorCommandItem
                  value="heading2"
                  onCommand={({ editor, range }) => {
                    editor
                      .chain()
                      .focus()
                      .deleteRange(range)
                      .setHeading({ level: 2 })
                      .run();
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Heading2 className="h-4 w-4" />
                  <div>
                    <p className="font-medium">제목 2</p>
                    <p className="text-xs text-slate-500">중간 제목</p>
                  </div>
                </EditorCommandItem>
                <EditorCommandItem
                  value="heading3"
                  onCommand={({ editor, range }) => {
                    editor
                      .chain()
                      .focus()
                      .deleteRange(range)
                      .setHeading({ level: 3 })
                      .run();
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Heading3 className="h-4 w-4" />
                  <div>
                    <p className="font-medium">제목 3</p>
                    <p className="text-xs text-slate-500">작은 제목</p>
                  </div>
                </EditorCommandItem>
                <EditorCommandItem
                  value="bulletList"
                  onCommand={({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleBulletList().run();
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <List className="h-4 w-4" />
                  <div>
                    <p className="font-medium">글머리 기호</p>
                    <p className="text-xs text-slate-500">글머리 기호 목록</p>
                  </div>
                </EditorCommandItem>
                <EditorCommandItem
                  value="orderedList"
                  onCommand={({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ListOrdered className="h-4 w-4" />
                  <div>
                    <p className="font-medium">번호 목록</p>
                    <p className="text-xs text-slate-500">번호가 있는 목록</p>
                  </div>
                </EditorCommandItem>
                <EditorCommandItem
                  value="blockquote"
                  onCommand={({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleBlockquote().run();
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Quote className="h-4 w-4" />
                  <div>
                    <p className="font-medium">인용</p>
                    <p className="text-xs text-slate-500">인용구 블록</p>
                  </div>
                </EditorCommandItem>
                <EditorCommandItem
                  value="codeBlock"
                  onCommand={({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Code className="h-4 w-4" />
                  <div>
                    <p className="font-medium">코드 블록</p>
                    <p className="text-xs text-slate-500">코드 블록 삽입</p>
                  </div>
                </EditorCommandItem>
                <EditorCommandItem
                  value="image"
                  onCommand={({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    const url = window.prompt('이미지 URL을 입력하세요:');
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ImageIcon className="h-4 w-4" />
                  <div>
                    <p className="font-medium">이미지</p>
                    <p className="text-xs text-slate-500">이미지 삽입</p>
                  </div>
                </EditorCommandItem>
                <EditorCommandItem
                  value="link"
                  onCommand={({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    const url = window.prompt('링크 URL을 입력하세요:');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <LinkIcon className="h-4 w-4" />
                  <div>
                    <p className="font-medium">링크</p>
                    <p className="text-xs text-slate-500">링크 삽입</p>
                  </div>
                </EditorCommandItem>
                <EditorCommandItem
                  value="youtube"
                  onCommand={({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    const url = window.prompt('YouTube URL을 입력하세요:');
                    if (url) {
                      editor.chain().focus().setYoutubeVideo({ src: url }).run();
                    }
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Youtube className="h-4 w-4" />
                  <div>
                    <p className="font-medium">YouTube</p>
                    <p className="text-xs text-slate-500">YouTube 동영상 삽입</p>
                  </div>
                </EditorCommandItem>
              </EditorCommandList>
            </EditorCommand>
          </div>
        </EditorContent>
      </EditorRoot>
    </div>
  );
}
