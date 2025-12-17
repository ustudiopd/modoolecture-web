'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { splitCompoundTag } from '@/lib/types/question-tags';

interface Question {
  id: string;
  event_id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  display_name_raw: string | null;
  display_name_masked: string | null;
  like_count: number;
  created_at: string;
  // 새로운 태그 필드
  primary_topic?: string | null;
  secondary_topics?: string[] | null;
  intent?: string | null;
  confidence?: number | null;
  classified_by?: string | null;
}

interface Event {
  id: string;
  title: string;
  slug: string;
}

export default function EventQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    category: '',
    display_name_raw: '',
    display_name_masked: '',
  });

  // 이벤트 정보 로드
  const loadEvent = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('이벤트 로드 실패:', { status: response.status, data });
        throw new Error(data.error || data.details || '이벤트를 불러올 수 없습니다.');
      }

      setEvent(data.event);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '오류가 발생했습니다.';
      console.error('이벤트 로드 오류:', err);
      setError(errorMessage);
    }
  };

  // 질문 목록 로드
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/questions?event_id=${eventId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '질문 목록을 불러올 수 없습니다.');
      }

      setQuestions(data.questions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEvent();
      loadQuestions();
    }
  }, [eventId]);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      question: '',
      category: '',
      display_name_raw: '',
      display_name_masked: '',
    });
    setShowCreateModal(false);
  };

  // 질문 생성
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const questionContent = formData.question.trim();
      
      if (!questionContent) {
        alert('질문 내용을 입력해주세요.');
        return;
      }

      // 제목은 사용하지 않음 (API에서 content의 첫 부분을 title로 자동 설정)
      const title = '';
      const content = questionContent;

      // Gemini API로 태그 자동 분류
      let classification = null;
      if (!formData.category) {
        try {
          const categorizeResponse = await fetch('/api/admin/questions/categorize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: content }),
          });

          if (categorizeResponse.ok) {
            const categorizeData = await categorizeResponse.json();
            classification = categorizeData.classification || null;
          }
        } catch (err) {
          console.error('태그 자동 분류 실패:', err);
          // 태그 분류 실패해도 질문 생성은 계속 진행
        }
      }

      // 기존 category 필드는 호환성을 위해 유지 (primary_topic으로 매핑)
      const category = classification?.primary_topic || formData.category || null;

      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          title,
          content,
          category, // 호환성 유지
          // 새로운 태그 필드
          primary_topic: classification?.primary_topic || null,
          secondary_topics: classification?.secondary_topics || [],
          intent: classification?.intent || null,
          confidence: classification?.confidence || null,
          classified_by: classification ? 'gemini' : null,
          display_name_raw: formData.display_name_raw || null,
          display_name_masked: formData.display_name_masked || null,
          tags: classification?.keywords || [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '질문 생성에 실패했습니다.');
      }

      resetForm();
      loadQuestions();
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  };

  // 질문 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '질문 삭제에 실패했습니다.');
      }

      loadQuestions();
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/admin/events"
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                질문 관리
              </h1>
              {event && (
                <p className="text-sm text-slate-400 mt-1">{event.title}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-slate-400">
              총 {questions.length}개의 질문
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              새 질문
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">로딩 중...</div>
          ) : (
            <div className="bg-slate-900 rounded-lg shadow overflow-hidden border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      태그
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      작성자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      좋아요
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        등록된 질문이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    questions.map((question) => (
                      <tr key={question.id} className="hover:bg-slate-800">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white max-w-md truncate">
                            {question.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 max-w-md truncate">
                            {question.content}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {question.primary_topic && 
                              splitCompoundTag(question.primary_topic).map((tag, idx) => (
                                <span key={`primary-${idx}`} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-400">
                                  {tag}
                                </span>
                              ))
                            }
                            {question.secondary_topics && question.secondary_topics.length > 0 && 
                              question.secondary_topics.flatMap(topic => 
                                splitCompoundTag(topic).map((tag, idx) => (
                                  <span key={`secondary-${topic}-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
                                    {tag}
                                  </span>
                                ))
                              )
                            }
                            {question.intent && 
                              splitCompoundTag(question.intent).map((tag, idx) => (
                                <span key={`intent-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-900/30 text-purple-400">
                                  {tag}
                                </span>
                              ))
                            }
                            {!question.primary_topic && !question.intent && (
                              <span className="text-sm text-slate-500">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">
                            {question.display_name_masked || question.display_name_raw || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">
                            {question.like_count}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">
                            {new Date(question.created_at).toLocaleDateString('ko-KR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/questions/${question.id}`}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(question.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 생성 모달 */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-800">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-white">새 질문 생성</h2>
                  <form onSubmit={handleCreate}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          질문 *
                        </label>
                        <textarea
                          value={formData.question}
                          onChange={(e) =>
                            setFormData({ ...formData, question: e.target.value })
                          }
                          rows={8}
                          className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="질문을 입력하세요..."
                          required
                        />
                        <p className="mt-1 text-xs text-slate-400">
                          질문 내용이 자동으로 카테고리로 분류됩니다.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          카테고리
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tech/Dev, Business, Career 등"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          작성자 이름 (원본)
                        </label>
                        <input
                          type="text"
                          value={formData.display_name_raw}
                          onChange={(e) =>
                            setFormData({ ...formData, display_name_raw: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          작성자 이름 (마스킹)
                        </label>
                        <input
                          type="text"
                          value={formData.display_name_masked}
                          onChange={(e) =>
                            setFormData({ ...formData, display_name_masked: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-slate-700 rounded-md text-slate-300 hover:bg-slate-800 transition"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      >
                        생성
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

