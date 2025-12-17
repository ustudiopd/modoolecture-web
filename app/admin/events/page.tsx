'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';

interface Event {
  id: string;
  slug: string;
  title: string;
  event_date: string | null;
  status: 'open' | 'live' | 'closed';
  notebooklm_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    event_date: '',
    status: 'open' as 'open' | 'live' | 'closed',
    notebooklm_url: '',
  });

  // 이벤트 목록 로드
  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이벤트 목록을 불러올 수 없습니다.');
      }

      setEvents(data.events || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      event_date: '',
      status: 'open',
      notebooklm_url: '',
    });
    setEditingEvent(null);
    setShowCreateModal(false);
  };

  // 이벤트 생성
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          event_date: formData.event_date || null,
          notebooklm_url: formData.notebooklm_url || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details 
          ? `${data.error}\n상세: ${data.details}`
          : data.error || '이벤트 생성에 실패했습니다.';
        throw new Error(errorMsg);
      }

      resetForm();
      loadEvents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '오류가 발생했습니다.';
      alert(errorMessage);
      console.error('이벤트 생성 오류:', err);
    }
  };

  // 이벤트 수정
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const response = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          event_date: formData.event_date || null,
          notebooklm_url: formData.notebooklm_url || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이벤트 수정에 실패했습니다.');
      }

      resetForm();
      loadEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  };

  // 이벤트 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이벤트 삭제에 실패했습니다.');
      }

      loadEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  };

  // 편집 모드 시작
  const startEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      slug: event.slug,
      title: event.title,
      event_date: event.event_date ? event.event_date.split('T')[0] : '',
      status: event.status,
      notebooklm_url: event.notebooklm_url || '',
    });
    setShowCreateModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-900/30 text-green-400 border border-green-800';
      case 'live':
        return 'bg-red-900/30 text-red-400 border border-red-800';
      case 'closed':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return '오픈';
      case 'live':
        return '라이브';
      case 'closed':
        return '종료';
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">이벤트 관리</h1>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition"
          >
            + 새 이벤트
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400">로딩 중...</div>
        ) : (
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-800">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      등록된 이벤트가 없습니다.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {event.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-400">{event.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-400">
                          {event.event_date
                            ? new Date(event.event_date).toLocaleDateString('ko-KR')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {getStatusLabel(event.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/board/${event.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            페이지 열기
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/questions`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            질문 관리
                          </Link>
                          <button
                            onClick={() => startEdit(event)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            편집
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            삭제
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

        {/* 생성/편집 모달 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {editingEvent ? '이벤트 편집' : '새 이벤트 생성'}
                </h2>
                <form onSubmit={editingEvent ? handleUpdate : handleCreate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="ai-2025"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        제목 *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="2025 AI 결산"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        날짜
                      </label>
                      <input
                        type="date"
                        value={formData.event_date}
                        onChange={(e) =>
                          setFormData({ ...formData, event_date: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        상태
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as 'open' | 'live' | 'closed',
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="open">오픈</option>
                        <option value="live">라이브</option>
                        <option value="closed">종료</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        NotebookLM URL
                      </label>
                      <input
                        type="url"
                        value={formData.notebooklm_url}
                        onChange={(e) =>
                          setFormData({ ...formData, notebooklm_url: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
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
                      {editingEvent ? '수정' : '생성'}
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

