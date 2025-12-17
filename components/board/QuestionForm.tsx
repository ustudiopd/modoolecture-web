'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface QuestionFormProps {
  eventId: string;
  onClose: () => void;
  onSubmit?: () => void;
}

export default function QuestionForm({ eventId, onClose, onSubmit }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    title: '',
    content: '',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 필수 필드 검증
    if (!formData.content.trim()) {
      setError('질문 내용을 입력해주세요.');
      return;
    }

    // 이메일 형식 검증 (입력된 경우)
    if (formData.author_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.author_email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          author_name: formData.author_name.trim() || null,
          author_email: formData.author_email.trim() || null,
          title: formData.title.trim() || null,
          content: formData.content.trim(),
          category: formData.category || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '질문 등록에 실패했습니다.');
      }

      // 성공 시 폼 초기화
      setFormData({
        author_name: '',
        author_email: '',
        title: '',
        content: '',
        category: '',
      });

      if (onSubmit) {
        onSubmit();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Form Modal */}
      <div
        className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">질문 등록</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 작성자 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="author_name" className="block text-sm font-medium text-slate-300 mb-2">
                작성자 이름 <span className="text-slate-500 text-xs">(선택사항)</span>
              </label>
              <input
                type="text"
                id="author_name"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="author_email" className="block text-sm font-medium text-slate-300 mb-2">
                이메일 <span className="text-slate-500 text-xs">(선택사항)</span>
              </label>
              <input
                type="email"
                id="author_email"
                value={formData.author_email}
                onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
              카테고리 <span className="text-slate-500 text-xs">(선택사항)</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="">선택하세요</option>
              <option value="Tech/Dev">Tech/Dev</option>
              <option value="Business">Business</option>
              <option value="Career">Career</option>
              <option value="Ethics">Ethics</option>
              <option value="Prompt">Prompt</option>
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              제목 <span className="text-slate-500 text-xs">(선택사항)</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600"
              placeholder="질문 제목 (입력하지 않으면 내용의 첫 부분이 제목으로 사용됩니다)"
            />
          </div>

          {/* 질문 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
              질문 내용 <span className="text-red-400">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600 resize-none"
              placeholder="질문을 자세히 작성해주세요..."
              required
            />
            <p className="mt-2 text-xs text-slate-500">
              {formData.content.length}자 / 최소 10자 이상 권장
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.content.trim()}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2',
                isSubmitting || !formData.content.trim()
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  등록 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  질문 등록
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
