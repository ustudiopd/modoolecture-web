'use client';

import { useState } from 'react';
import BlogEditor from '@/components/editor/BlogEditor';
import type { JSONContent } from 'novel';
import { Code, Eye, Image, MousePointer2, Maximize2 } from 'lucide-react';

export default function EditorTestPage() {
  const [content, setContent] = useState<JSONContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Novel.sh 에디터 테스트</h1>
          <p className="text-slate-400">
            블로그 에디터의 모든 기능을 테스트해보세요.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MousePointer2 className="w-5 h-5 text-cyan-400" />
            사용 방법
          </h2>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>에디터에서 텍스트를 입력하고 포맷팅을 적용해보세요.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>이미지를 업로드한 후 클릭하여 선택하면 우측 하단에 리사이즈 핸들이 나타납니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>
                <Image className="w-4 h-4 inline mr-1" />
                이미지 리사이즈: 핸들을 드래그하여 크기 조절, <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Shift</kbd> + 드래그로 비율 유지
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>YouTube 링크를 붙여넣으면 자동으로 임베드됩니다.</span>
            </li>
          </ul>
        </div>

        {/* Editor Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-cyan-400" />
              에디터
            </h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm"
            >
              {showPreview ? (
                <>
                  <Eye className="w-4 h-4" />
                  미리보기 닫기
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  JSON 보기
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
            <BlogEditor
              content={content}
              onChange={setContent}
              placeholder="여기에 내용을 입력하세요..."
            />
          </div>
        </div>

        {/* JSON Preview */}
        {showPreview && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-400" />
              JSON 콘텐츠
            </h2>
            <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-auto text-sm text-slate-300">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        )}

        {/* Content Stats */}
        <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">콘텐츠 통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">문자 수</div>
              <div className="text-2xl font-bold text-white">
                {content
                  ? JSON.stringify(content).length
                  : 0}
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">이미지</div>
              <div className="text-2xl font-bold text-white">
                {content
                  ? JSON.stringify(content).match(/"type":"image"/g)?.length || 0
                  : 0}
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">링크</div>
              <div className="text-2xl font-bold text-white">
                {content
                  ? JSON.stringify(content).match(/"type":"link"/g)?.length || 0
                  : 0}
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">제목</div>
              <div className="text-2xl font-bold text-white">
                {content
                  ? JSON.stringify(content).match(/"type":"heading"/g)?.length || 0
                  : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

