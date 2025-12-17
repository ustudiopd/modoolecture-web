'use client';

import { useEffect, useState } from 'react';
import { 
  EditorRoot, 
  EditorContent,
  type JSONContent 
} from 'novel';
import { extensions } from './extensions';
import { cn } from '@/lib/utils/cn';

interface ReadOnlyEditorProps {
  content: JSONContent | string | null;
  className?: string;
}

export default function ReadOnlyEditor({ content, className }: ReadOnlyEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [jsonContent, setJsonContent] = useState<JSONContent | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!content) {
      setJsonContent(null);
      return;
    }

    try {
      if (typeof content === 'string') {
        // JSON 문자열인 경우 파싱
        if (content.trim().startsWith('{')) {
          setJsonContent(JSON.parse(content));
        } else {
          // 일반 텍스트인 경우 JSONContent로 변환
          setJsonContent({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: content }],
              },
            ],
          });
        }
      } else {
        setJsonContent(content);
      }
    } catch (error) {
      // 파싱 실패 시 일반 텍스트로 처리
      console.error('Failed to parse content:', error);
      setJsonContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: typeof content === 'string' ? content : 'Invalid content' }],
          },
        ],
      });
    }
  }, [content]);

  if (!mounted) {
    return (
      <div className={cn("w-full", className)}>
        <div className="prose prose-invert max-w-none px-4 py-2 text-slate-200">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <EditorRoot>
        <EditorContent
          extensions={extensions as any}
          initialContent={jsonContent ?? undefined}
          editable={false}
          editorProps={{
            attributes: {
              class: cn('prose prose-invert max-w-none focus:outline-none px-4 py-2 text-slate-200', className),
            },
          }}
        />
      </EditorRoot>
    </div>
  );
}

