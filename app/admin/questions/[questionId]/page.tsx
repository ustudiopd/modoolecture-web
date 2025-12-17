'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import BlogEditor from '@/components/editor/BlogEditor';
import { generatePromptMarkdown, copyToClipboard } from '@/lib/utils/markdown';
import type { JSONContent } from 'novel';
import { Copy, Save, ArrowLeft, Sparkles, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  event_id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  display_name_raw: string | null;
  display_name_masked: string | null;
  author_email: string | null;
  answer_gemini: string | null;
  answer_gpt: string | null;
  like_count: number;
  event?: {
    title: string;
    slug: string;
  };
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.questionId as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // 질문 정보 편집 상태
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    display_name_raw: '',
    author_email: '',
  });

  // 질문 본문 편집 상태 (JSONContent)
  const [questionContent, setQuestionContent] = useState<JSONContent | null>(null);

  // 답변 편집 상태 (JSONContent)
  const [geminiContent, setGeminiContent] = useState<JSONContent | null>(null);
  const [gptContent, setGptContent] = useState<JSONContent | null>(null);

  // 질문 로드
  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/questions/${questionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '질문을 불러올 수 없습니다.');
      }

      const q = data.question;
      setQuestion(q);
      setEditData({
        title: q.title || '',
        content: q.content || '',
        category: q.category || '',
        tags: (q.tags || []).join(', '),
        display_name_raw: q.display_name_raw || '',
        author_email: q.author_email || '',
      });

      // 같은 이벤트의 질문 목록 가져오기
      if (q.event_id) {
        const questionsResponse = await fetch(`/api/admin/questions?event_id=${q.event_id}`);
        const questionsData = await questionsResponse.json();
        
        if (questionsResponse.ok && questionsData.questions) {
          const ids = questionsData.questions.map((q: Question) => q.id);
          setQuestionIds(ids);
          const index = ids.indexOf(questionId);
          setCurrentIndex(index);
        }
      }

      // 질문 본문을 JSONContent로 변환
      if (q.content) {
        try {
          // content가 JSON 문자열인 경우 파싱
          const parsed = typeof q.content === 'string' && q.content.trim().startsWith('{')
            ? JSON.parse(q.content)
            : q.content;
          setQuestionContent(parsed);
        } catch (parseError) {
          // 파싱 실패 시 일반 텍스트로 처리
          console.error('질문 본문 파싱 오류:', parseError);
          setQuestionContent({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: q.content }],
              },
            ],
          });
        }
      } else {
        setQuestionContent(null);
      }

      // 답변을 JSONContent로 변환 (이미 JSON인 경우 그대로, 문자열인 경우 파싱)
      if (q.answer_gemini) {
        try {
          const parsed = typeof q.answer_gemini === 'string'
            ? JSON.parse(q.answer_gemini)
            : q.answer_gemini;
          setGeminiContent(parsed);
        } catch (parseError) {
          console.error('Gemini 답변 파싱 오류:', parseError);
          // 파싱 실패 시 빈 상태로 시작 (새로 작성 가능)
          setGeminiContent(null);
        }
      } else {
        // 답변이 없으면 빈 상태로 초기화
        setGeminiContent(null);
      }

      if (q.answer_gpt) {
        try {
          const parsed = typeof q.answer_gpt === 'string'
            ? JSON.parse(q.answer_gpt)
            : q.answer_gpt;
          setGptContent(parsed);
        } catch (parseError) {
          console.error('GPT 답변 파싱 오류:', parseError);
          // 파싱 실패 시 빈 상태로 시작 (새로 작성 가능)
          setGptContent(null);
        }
      } else {
        // 답변이 없으면 빈 상태로 초기화
        setGptContent(null);
      }
    } catch (error) {
      setToast({
        show: true,
        message: error instanceof Error ? error.message : '오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  // JSONContent에서 텍스트 추출
  const extractTextFromContent = (content: JSONContent | null | string): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    
    const extractText = (node: JSONContent): string => {
      if (node.type === 'text') {
        return node.text || '';
      }
      if (node.content) {
        return node.content.map(extractText).join('');
      }
      return '';
    };
    
    return extractText(content);
  };

  // 이전/다음 질문으로 이동
  const navigateToQuestion = (direction: 'prev' | 'next') => {
    if (currentIndex === -1 || questionIds.length === 0) return;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex - 1;
      if (newIndex < 0) return; // 첫 번째 질문이면 이동하지 않음
    } else {
      newIndex = currentIndex + 1;
      if (newIndex >= questionIds.length) return; // 마지막 질문이면 이동하지 않음
    }
    
    const newQuestionId = questionIds[newIndex];
    router.push(`/admin/questions/${newQuestionId}`);
  };

  // 제목 다시 요약하기
  const handleRegenerateTitle = async () => {
    try {
      setGeneratingTitle(true);
      
      // 본문 내용 추출
      const contentText = extractTextFromContent(questionContent || editData.content);
      
      if (!contentText || contentText.trim().length === 0) {
        setToast({ show: true, message: '본문 내용이 없습니다. 먼저 질문 본문을 입력해주세요.' });
        return;
      }

      const response = await fetch('/api/admin/questions/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: contentText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '제목 생성에 실패했습니다.');
      }

      // 생성된 제목으로 업데이트
      setEditData({ ...editData, title: data.title });
      setToast({ show: true, message: '제목이 생성되었습니다.' });
    } catch (error) {
      setToast({
        show: true,
        message: error instanceof Error ? error.message : '제목 생성에 실패했습니다.',
      });
    } finally {
      setGeneratingTitle(false);
    }
  };

  // Copy for LLM
  const handleCopyForLLM = async () => {
    if (!question) return;

    const contentText = extractTextFromContent(questionContent || editData.content);

    const prompt = generatePromptMarkdown({
      ...question,
      title: editData.title,
      content: contentText,
      category: editData.category || undefined,
      tags: editData.tags
        ? editData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined,
    });

    const success = await copyToClipboard(prompt);
    if (success) {
      setToast({ show: true, message: '프롬프트가 클립보드에 복사되었습니다!' });
    } else {
      setToast({ show: true, message: '복사에 실패했습니다.' });
    }
  };

  // 질문 정보 저장
  const handleSaveQuestion = async () => {
    if (!question) return;

    try {
      setSaving(true);
      
      // JSONContent를 문자열로 변환
      const contentToSave = questionContent 
        ? JSON.stringify(questionContent)
        : editData.content;

      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editData.title,
          content: contentToSave,
          category: editData.category || null,
          tags: editData.tags
            ? editData.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
          display_name_raw: editData.display_name_raw.trim() || null,
          author_email: editData.author_email.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '저장에 실패했습니다.');
      }

      setToast({ show: true, message: '질문 정보가 저장되었습니다.' });
      setQuestion(data.question);
    } catch (error) {
      setToast({
        show: true,
        message: error instanceof Error ? error.message : '저장에 실패했습니다.',
      });
    } finally {
      setSaving(false);
    }
  };

  // 질문 삭제
  const handleDeleteQuestion = async () => {
    if (!question) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '삭제에 실패했습니다.');
      }

      setToast({ show: true, message: '질문이 삭제되었습니다.' });
      
      // 질문 목록 페이지로 이동
      setTimeout(() => {
        router.push(`/admin/events/${question.event_id}/questions`);
      }, 1000);
    } catch (error) {
      setToast({
        show: true,
        message: error instanceof Error ? error.message : '삭제에 실패했습니다.',
      });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  // 답변 저장
  const handleSaveAnswers = async () => {
    if (!question) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/questions/${questionId}/answers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer_gemini: geminiContent ? JSON.stringify(geminiContent) : null,
          answer_gpt: gptContent ? JSON.stringify(gptContent) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '저장에 실패했습니다.');
      }

      setToast({ show: true, message: '답변이 저장되었습니다.' });
      setQuestion(data.question);
    } catch (error) {
      setToast({
        show: true,
        message: error instanceof Error ? error.message : '저장에 실패했습니다.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto text-slate-400">로딩 중...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto text-slate-400">질문을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/events/${question.event_id}/questions`}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateToQuestion('prev')}
                disabled={currentIndex <= 0}
                className="p-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="이전 질문"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-white">질문 편집</h1>
              <button
                onClick={() => navigateToQuestion('next')}
                disabled={currentIndex === -1 || currentIndex >= questionIds.length - 1}
                className="p-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="다음 질문"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyForLLM}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              <Copy className="w-4 h-4" />
              Copy for LLM
            </button>
            <button
              onClick={handleSaveQuestion}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-800">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-white">질문 삭제</h2>
                <p className="text-slate-300 mb-6">
                  정말로 이 질문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-4 py-2 border border-slate-700 rounded-md text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDeleteQuestion}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {deleting ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast.show && (
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-800 rounded text-blue-300">
            {toast.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측: 질문 정보 */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">질문 정보</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    제목 *
                  </label>
                  <button
                    onClick={handleRegenerateTitle}
                    disabled={generatingTitle}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingTitle ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        제목 다시 요약하기
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  본문 *
                </label>
                <div className="border border-slate-700 rounded-md overflow-hidden bg-slate-800">
                  <BlogEditor
                    key={`question-${question.id}`}
                    content={questionContent}
                    onChange={setQuestionContent}
                    placeholder="질문 본문을 입력하세요..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  카테고리
                </label>
                <input
                  type="text"
                  value={editData.category}
                  onChange={(e) =>
                    setEditData({ ...editData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={editData.tags}
                  onChange={(e) =>
                    setEditData({ ...editData, tags: e.target.value })
                  }
                  placeholder="태그1, 태그2, 태그3"
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  작성자 이름
                </label>
                <input
                  type="text"
                  value={editData.display_name_raw}
                  onChange={(e) =>
                    setEditData({ ...editData, display_name_raw: e.target.value })
                  }
                  placeholder="작성자 이름"
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  작성자 이메일
                </label>
                <input
                  type="email"
                  value={editData.author_email}
                  onChange={(e) =>
                    setEditData({ ...editData, author_email: e.target.value })
                  }
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="text-sm text-slate-400">
                <p>좋아요: {question.like_count}</p>
              </div>
            </div>
          </div>

          {/* 우측: 답변 편집 */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">답변 편집</h2>
            <div className="space-y-6">
              {/* Gemini 답변 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">Gemini 답변</h3>
                </div>
                <div className="border border-slate-700 rounded-md overflow-hidden bg-slate-800">
                  <BlogEditor
                    key={`gemini-${question.id}`}
                    content={geminiContent}
                    onChange={setGeminiContent}
                    placeholder="Gemini 답변을 입력하세요..."
                  />
                </div>
              </div>

              {/* GPT 답변 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">GPT 답변</h3>
                </div>
                <div className="border border-slate-700 rounded-md overflow-hidden bg-slate-800">
                  <BlogEditor
                    key={`gpt-${question.id}`}
                    content={gptContent}
                    onChange={setGptContent}
                    placeholder="GPT 답변을 입력하세요..."
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAnswers}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}

