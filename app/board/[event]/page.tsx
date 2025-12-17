'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Toast from '@/components/ui/Toast';
import QuestionCard from '@/components/board/QuestionCard';
import QuestionModal from '@/components/board/QuestionModal';
import CategoryFilter from '@/components/board/CategoryFilter';
import { ArrowLeft, Search, MessageCircle, ExternalLink, Plus, SearchX } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { VALID_TOPIC_TAGS } from '@/lib/types/question-tags';

// 9개 Topic 태그 (none 제외)
const topicCategories = VALID_TOPIC_TAGS.filter(tag => tag !== 'none');

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const eventSlug = params.event as string;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'answered'>('hot');
  const [questions, setQuestions] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set());
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get session ID
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem('session_key');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_key', sessionId);
    }
    return sessionId;
  }, []);

  // Load event and questions
  useEffect(() => {
    async function loadData() {
      try {
        // Load event
        const { data: eventData, error: eventError } = await supabase
          .from('modu_events')
          .select('*')
          .eq('slug', eventSlug)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Load questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('modu_questions')
          .select('*, gemini_like_count, gpt_like_count, primary_topic, secondary_topics, intent')
          .eq('event_id', eventData.id)
          .eq('is_hidden', false)
          .order('like_count', { ascending: false });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

        // Load user likes
        const sessionId = getSessionId();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user || sessionId) {
          let likesQuery = supabase.from('modu_likes').select('question_id');
          
          if (user?.id) {
            likesQuery = likesQuery.eq('user_id', user.id);
          } else if (sessionId) {
            likesQuery = likesQuery.eq('session_id', sessionId);
          }
          
          const { data: likesData } = await likesQuery;

          if (likesData) {
            setLikedQuestions(new Set(likesData.map((l: any) => l.question_id)));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setToast({ show: true, message: '데이터를 불러오는 중 오류가 발생했습니다.' });
      } finally {
        setLoading(false);
      }
    }

    if (eventSlug) {
      loadData();
    }
  }, [eventSlug, getSessionId]);

  // Filter and sort questions
  const filteredQuestions = questions
    .filter((q) => {
      const matchSearch = (q.title + q.content).toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'All' || 
        q.primary_topic === selectedCategory || 
        (q.secondary_topics && q.secondary_topics.includes(selectedCategory)) ||
        (!q.primary_topic && q.category === selectedCategory); // 호환성
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'hot') {
        return (b.like_count || 0) - (a.like_count || 0);
      } else if (sortBy === 'new') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'answered') {
        return Number(b.is_answered) - Number(a.is_answered);
      }
      return 0;
    });

  // 최신등록순 기준으로 번호 매기기 (created_at 기준 내림차순)
  const questionsByNewest = [...questions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const questionNumberMap = new Map<string, number>();
  questionsByNewest.forEach((q, index) => {
    questionNumberMap.set(q.id, index + 1);
  });

  // Handle like
  const handleLike = useCallback(
    async (questionId: string) => {
      if (likedQuestions.has(questionId)) {
        setToast({ show: true, message: '이미 좋아요를 누르신 질문입니다.' });
        return;
      }

      try {
        const sessionId = getSessionId();
        const { data: { user } } = await supabase.auth.getUser();

        const response = await fetch('/api/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_id: questionId,
            session_id: sessionId,
            user_id: user?.id || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '좋아요 실패');
        }

        const { like_count } = await response.json();

        // Update local state
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, like_count } : q))
        );
        setLikedQuestions((prev) => new Set([...prev, questionId]));
        setToast({ show: true, message: '👍 좋아요가 반영되었습니다!' });
      } catch (error: any) {
        console.error('Like error:', error);
        setToast({ show: true, message: error.message || '좋아요 중 오류가 발생했습니다.' });
      }
    },
    [likedQuestions, getSessionId]
  );

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center w-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-slate-500">질문을 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center w-full">
            <p className="text-slate-500">이벤트를 찾을 수 없습니다.</p>
            <Link href="/" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
      />

      {/* Header */}
      <header className="relative overflow-hidden border-b border-slate-800 bg-slate-950 pt-24">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 z-0"></div>
        <div className="pt-12 pb-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* Breadcrumb / Back Link */}
            <div className="absolute top-20 left-4 md:left-0">
              <Link
                href="/"
                className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> 메인으로
              </Link>
            </div>

            <div className="text-center relative z-10">
              <div className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs text-purple-400 font-mono mb-4 border border-purple-500/30">
                {event.starts_at ? formatEventDate(event.starts_at) : 'Live'}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-4 tracking-tight">
                {event.title}
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
                사전 설문으로 모인 <strong>200개의 진짜 고민</strong>을 확인하세요.<br className="hidden md:block" />
                투표하고, 토론하고, <strong>복사해서 AI에게 물어보세요.</strong>
              </p>

              {event.notebooklm_url && (
                <div className="flex flex-col items-center gap-2">
                  <a
                    href={event.notebooklm_url.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      // 링크가 유효한지 확인
                      const url = event.notebooklm_url?.trim();
                      if (!url || !url.startsWith('http')) {
                        e.preventDefault();
                        alert('유효하지 않은 링크입니다.');
                        return;
                      }
                    }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-900/30 group"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>전체 질문 AI 챗봇 (NotebookLM)</span>
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <p className="text-xs text-slate-400 mt-1">
                    노트북LM을 사용하기 위해서는 구글ID 로그인이 필요합니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Controls (Sticky) */}
          <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md py-4 z-40 space-y-4 mb-6 border-b border-slate-800">
            <div className="flex flex-col md:flex-row gap-3 justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="관심 키워드 검색 (예: RAG, 윤리, 취업...)"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'hot' | 'new' | 'answered')}
                  className="bg-slate-900 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer w-full md:w-auto"
                >
                  <option value="hot">🔥 인기 질문순</option>
                  <option value="new">🆕 최신 등록순</option>
                  <option value="answered">✅ 답변 완료순</option>
                </select>
              </div>
            </div>

            {/* Categories - 9개 Topic 태그 */}
            <CategoryFilter
              categories={['All', ...topicCategories]}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Question Grid */}
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
              <SearchX className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">
                검색 결과가 없습니다.<br />다른 키워드로 검색해보세요!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onLike={handleLike}
                  liked={likedQuestions.has(question.id)}
                  onClick={() => {
                    setSelectedQuestion(question);
                    setIsModalOpen(true);
                  }}
                  index={questionNumberMap.get(question.id) ? questionNumberMap.get(question.id)! - 1 : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden z-30">
        <button
          onClick={() => setToast({ show: true, message: '질문 등록 기능은 준비 중입니다!' })}
          className="bg-purple-600 text-white p-4 rounded-full shadow-lg shadow-purple-900/50 hover:bg-purple-500 transition-transform active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Question Modal */}
      <QuestionModal
        question={selectedQuestion}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuestion(null);
        }}
        questions={filteredQuestions}
        onNavigateQuestion={(direction) => {
          if (!selectedQuestion) return;
          const currentIndex = filteredQuestions.findIndex(q => q.id === selectedQuestion.id);
          if (direction === 'prev' && currentIndex > 0) {
            setSelectedQuestion(filteredQuestions[currentIndex - 1]);
          } else if (direction === 'next' && currentIndex < filteredQuestions.length - 1) {
            setSelectedQuestion(filteredQuestions[currentIndex + 1]);
          }
        }}
      />
    </div>
  );
}

