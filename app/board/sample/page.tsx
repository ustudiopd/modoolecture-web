'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Toast from '@/components/ui/Toast';
import QuestionCard from '@/components/board/QuestionCard';
import CategoryFilter from '@/components/board/CategoryFilter';
import { ArrowLeft, Search, MessageCircle, ExternalLink, Plus, SearchX } from 'lucide-react';

const categories = ['All', 'Tech/Dev', 'Business', 'Career', 'Ethics', 'Prompt'];

// 샘플 데이터 (qna.html에서 가져옴)
const sampleQuestions = [
  {
    id: '1',
    title: 'RAG 구현 시 할루시네이션 잡는 법',
    content:
      '기업 내부 데이터로 RAG를 구축했는데, 가끔 엉뚱한 문서에서 답을 가져옵니다. 프롬프트 엔지니어링으로 해결할 수 있는 노하우가 있을까요? 아니면 파인튜닝이 필수일까요?',
    answer:
      "System Prompt에 '모르면 모른다고 대답하라'는 제약 조건을 강력하게 걸고, Temperature를 0에 가깝게 설정하세요. 검색된 청크(Chunk)의 신뢰도 점수를 필터링하는 단계가 필요합니다.",
    category: 'Tech/Dev',
    vote_count: 42,
    like_count: 42,
    comments: 5,
    created_at: '2025-12-10T00:00:00Z',
    is_answered: true,
  },
  {
    id: '2',
    title: 'AI 에이전트로 1인 창업 가능한가요?',
    content:
      '개발 지식이 얕은 기획자입니다. Cursor나 v0 같은 툴만 믿고 SaaS를 만들어보려고 하는데, 실제 운영 단계에서 AI 에이전트만으로 유지보수가 가능할지 현실적인 조언 부탁드립니다.',
    answer: null,
    category: 'Business',
    vote_count: 38,
    like_count: 38,
    comments: 12,
    created_at: '2025-12-12T00:00:00Z',
    is_answered: false,
  },
  {
    id: '3',
    title: '2026년 프롬프트 엔지니어의 미래',
    content:
      "AI 모델이 점점 똑똑해져서 '개떡같이 말해도 찰떡같이' 알아듣는데, 프롬프트 엔지니어링이라는 직무가 계속 유효할까요? 커리어를 어떻게 전환해야 할까요?",
    answer:
      "단순한 프롬프트 작성이 아니라, AI 워크플로우를 설계하고 평가(Eval)하는 'AI 오케스트레이터'로 역할이 진화하고 있습니다.",
    category: 'Career',
    vote_count: 31,
    like_count: 31,
    comments: 8,
    created_at: '2025-12-14T00:00:00Z',
    is_answered: true,
  },
  {
    id: '4',
    title: '사내 AI 도입 시 보안 가이드라인',
    content:
      '직원들이 ChatGPT에 기밀 데이터를 넣는 걸 막을 수가 없습니다. 엔터프라이즈 버전을 쓰는 것 외에 정책적으로나 기술적으로 제어할 수 있는 방법이 궁금합니다.',
    answer: null,
    category: 'Ethics',
    vote_count: 25,
    like_count: 25,
    comments: 3,
    created_at: '2025-12-11T00:00:00Z',
    is_answered: false,
  },
  {
    id: '5',
    title: 'AI가 생성한 코드의 저작권 문제',
    content:
      'Copilot으로 짠 코드로 상용 소프트웨어를 출시했을 때, 나중에 법적인 문제가 생길 소지가 있나요? 최근 판례나 동향이 궁금합니다.',
    answer:
      '아직 명확한 국제 표준은 없으나, 인간의 창작적 기여가 인정되는 부분에 한해 저작권을 인정하는 추세입니다.',
    category: 'Ethics',
    vote_count: 19,
    like_count: 19,
    comments: 2,
    created_at: '2025-12-09T00:00:00Z',
    is_answered: true,
  },
];

const sampleEvent = {
  id: 'sample',
  slug: 'sample',
  title: '2025 AI 결산 질문 보드',
  starts_at: '2025-12-17T19:00:00+09:00',
  notebooklm_url: 'https://notebooklm.google.com',
};

export default function SampleBoardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'answered'>('hot');
  const [questions, setQuestions] = useState(sampleQuestions);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [votedQuestions, setVotedQuestions] = useState<Set<string>>(new Set());

  // Filter and sort questions
  const filteredQuestions = questions
    .filter((q) => {
      const matchSearch = (q.title + q.content).toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'All' || q.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'hot') {
        return b.vote_count - a.vote_count;
      } else if (sortBy === 'new') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'answered') {
        return Number(b.is_answered) - Number(a.is_answered);
      }
      return 0;
    });

  // Handle vote (샘플이므로 로컬 상태만 업데이트)
  const handleVote = async (questionId: string) => {
    if (votedQuestions.has(questionId)) {
      setToast({ show: true, message: '이미 투표하신 질문입니다.' });
      return;
    }

    // Optimistic update
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, vote_count: q.vote_count + 1 } : q))
    );
    setVotedQuestions((prev) => new Set([...prev, questionId]));
    setToast({ show: true, message: '👍 소중한 한 표가 반영되었습니다!' });
  };

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

  return (
    <>
      <Navbar />
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
      />

      {/* Header */}
      <header className="relative overflow-hidden border-b border-slate-800 bg-slate-950 pt-24">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 z-0"></div>
        <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 text-center">
          {/* Breadcrumb / Back Link */}
          <div className="absolute top-20 left-4 md:left-0">
            <Link
              href="/"
              className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> 메인으로
            </Link>
          </div>

          <div className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs text-purple-400 font-mono mb-4 border border-purple-500/30">
            {sampleEvent.starts_at ? formatEventDate(sampleEvent.starts_at) : 'Live'}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-4 tracking-tight">
            {sampleEvent.title}
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
            사전 설문으로 모인 <strong>200개의 진짜 고민</strong>을 확인하세요.<br className="hidden md:block" />
            투표하고, 토론하고, <strong>복사해서 AI에게 물어보세요.</strong>
          </p>

          {sampleEvent.notebooklm_url && (
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={sampleEvent.notebooklm_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-900/30 group"
              >
                <MessageCircle className="w-5 h-5" />
                <span>전체 질문 AI 챗봇 (NotebookLM)</span>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
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

          {/* Categories */}
          <CategoryFilter
            categories={categories}
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
                onLike={async (id) => {
                  await handleVote(id);
                }}
                liked={votedQuestions.has(question.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden z-30">
        <button
          onClick={() => setToast({ show: true, message: '질문 등록 기능은 준비 중입니다!' })}
          className="bg-purple-600 text-white p-4 rounded-full shadow-lg shadow-purple-900/50 hover:bg-purple-500 transition-transform active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}

