'use client';

import { useEffect, useMemo } from 'react';
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
  // content가 문자열인 경우 JSONContent로 변환
  const jsonContent = useMemo(() => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      try {
        // JSON 문자열인 경우 파싱
        if (content.trim().startsWith('{')) {
          return JSON.parse(content);
        } else {
          // 일반 텍스트인 경우 JSONContent로 변환
          return {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: content }],
              },
            ],
          };
        }
      } catch (error) {
        // 파싱 실패 시 일반 텍스트로 처리
        return {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: content }],
            },
          ],
        };
      }
    } else {
      return content;
    }
  }, [content]);

  // content를 key로 사용하여 content가 변경될 때마다 EditorContent를 재마운트
  const contentKey = useMemo(() => {
    if (!content) return 'empty';
    if (typeof content === 'string') {
      return content.substring(0, 100); // 문자열의 일부를 key로 사용
    }
    return JSON.stringify(content).substring(0, 100); // JSON의 일부를 key로 사용
  }, [content]);

  return (
    <div className={className ? `w-full ${className}` : "w-full"}>
      <EditorRoot>
        <EditorContent
          key={contentKey}
          extensions={extensions as any}
          initialContent={jsonContent ?? undefined}
          editable={false}
          editorProps={{
            attributes: {
              class: cn(
                'prose prose-invert max-w-none focus:outline-none px-4 py-2 text-slate-200',
                className
              ),
            },
          }}
        />
      </EditorRoot>
    </div>
  );
}

