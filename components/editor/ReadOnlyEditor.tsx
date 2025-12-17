'use client';

import { 
  EditorRoot, 
  EditorContent,
  type JSONContent 
} from 'novel';
import { extensions } from './extensions';

interface ReadOnlyEditorProps {
  content: JSONContent | string | null;
}

export default function ReadOnlyEditor({ content }: ReadOnlyEditorProps) {
  // content가 문자열인 경우 JSONContent로 변환
  let jsonContent: JSONContent | null = null;
  
  if (content) {
    if (typeof content === 'string') {
      try {
        // JSON 문자열인 경우 파싱
        if (content.trim().startsWith('{')) {
          jsonContent = JSON.parse(content);
        } else {
          // 일반 텍스트인 경우 JSONContent로 변환
          jsonContent = {
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
        jsonContent = {
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
      jsonContent = content;
    }
  }

  return (
    <div className="w-full">
      <EditorRoot>
        <EditorContent
          extensions={extensions as any}
          initialContent={jsonContent ?? undefined}
          editable={false}
          editorProps={{
            attributes: {
              class: 'prose prose-invert max-w-none focus:outline-none px-4 py-2 text-slate-200',
            },
          }}
        />
      </EditorRoot>
    </div>
  );
}

