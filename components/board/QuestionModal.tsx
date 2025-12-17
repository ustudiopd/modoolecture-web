'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, ThumbsUp, MessageCircle, Sparkles, Bot, ChevronLeft, ChevronRight, Maximize2, Minimize2, Type } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import ReadOnlyEditor from '@/components/editor/ReadOnlyEditor';
import type { JSONContent } from 'novel';
import { supabase } from '@/lib/supabase/client';
import { getTagLabel } from '@/lib/types/question-tags';

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string | null;
  answer_gemini?: string | null;
  answer_gpt?: string | null;
  category?: string;
  primary_topic?: string | null;
  secondary_topics?: string[] | null;
  intent?: string | null;
  like_count: number;
  gemini_like_count?: number;
  gpt_like_count?: number;
  created_at: string;
  is_answered: boolean;
}

interface QuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  questions?: Question[];
  onNavigateQuestion?: (direction: 'prev' | 'next') => void;
}

export default function QuestionModal({ question, isOpen, onClose, questions = [], onNavigateQuestion }: QuestionModalProps) {
  // content를 JSONContent로 파싱
  const [questionContent, setQuestionContent] = useState<JSONContent | string | null>(null);
  const [answerContent, setAnswerContent] = useState<JSONContent | string | null>(null);
  const [geminiContent, setGeminiContent] = useState<JSONContent | string | null>(null);
  const [gptContent, setGptContent] = useState<JSONContent | string | null>(null);
  
  // 답변 표시 상태
  const [showAnswers, setShowAnswers] = useState(false);
  const [fullscreenAnswer, setFullscreenAnswer] = useState<'gemini' | 'gpt' | 'expert' | null>(null);
  
  // 답변별 좋아요 상태
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set());
  const [geminiLikeCount, setGeminiLikeCount] = useState(0);
  const [gptLikeCount, setGptLikeCount] = useState(0);
  const [isLikingGemini, setIsLikingGemini] = useState(false);
  const [isLikingGpt, setIsLikingGpt] = useState(false);
  
  // 텍스트 크기 조절
  const [isLargeFont, setIsLargeFont] = useState(false);
  
  // 현재 질문 인덱스
  const currentIndex = question ? questions.findIndex(q => q.id === question.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < questions.length - 1;

  // 최신등록순 기준으로 번호 매기기
  const questionsByNewest = [...questions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const questionNumberMap = new Map<string, number>();
  questionsByNewest.forEach((q, index) => {
    questionNumberMap.set(q.id, index + 1);
  });
  const questionNumber = question ? questionNumberMap.get(question.id) : undefined;

  // 콘텐츠 파싱 함수
  const parseContent = (content: string | null | undefined): JSONContent | string | null => {
    if (!content) return null;
    try {
      if (typeof content === 'string' && content.trim().startsWith('{')) {
        return JSON.parse(content);
      } else {
        return content;
      }
    } catch {
      return content;
    }
  };

  // 모달이 열릴 때 답변 표시 상태 초기화 및 콘텐츠 파싱
  useEffect(() => {
    if (isOpen && question) {
      setShowAnswers(false);
      setFullscreenAnswer(null);
      // 모달이 열릴 때 콘텐츠 강제 업데이트
      setQuestionContent(parseContent(question.content));
      setAnswerContent(parseContent(question.answer));
      setGeminiContent(parseContent(question.answer_gemini));
      setGptContent(parseContent(question.answer_gpt));
      setGeminiLikeCount(question.gemini_like_count || 0);
      setGptLikeCount(question.gpt_like_count || 0);
    }
  }, [isOpen, question?.id]);

  // 세션 ID 가져오기
  const getSessionId = () => {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem('session_key');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_key', sessionId);
    }
    return sessionId;
  };

  // 답변별 좋아요 처리
  const handleAnswerLike = async (answerType: 'gemini' | 'gpt') => {
    if (!question) return;
    
    const likeKey = `${question.id}-${answerType}`;
    if (likedAnswers.has(likeKey) || (answerType === 'gemini' && isLikingGemini) || (answerType === 'gpt' && isLikingGpt)) {
      return;
    }

    if (answerType === 'gemini') {
      setIsLikingGemini(true);
    } else {
      setIsLikingGpt(true);
    }

    try {
      const sessionId = getSessionId();
      const { data: { user } } = await supabase.auth.getUser();

      const response = await fetch('/api/answer-like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          answer_type: answerType,
          session_id: sessionId,
          user_id: user?.id || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '좋아요 실패');
      }

      const { gemini_like_count, gpt_like_count } = await response.json();
      
      setGeminiLikeCount(gemini_like_count || 0);
      setGptLikeCount(gpt_like_count || 0);
      setLikedAnswers(prev => new Set([...prev, likeKey]));
    } catch (error: any) {
      console.error('Answer like error:', error);
    } finally {
      if (answerType === 'gemini') {
        setIsLikingGemini(false);
      } else {
        setIsLikingGpt(false);
      }
    }
  };

  // 질문이 변경될 때 답변 표시 상태 및 콘텐츠 초기화
  useEffect(() => {
    if (!question) {
      setQuestionContent(null);
      setAnswerContent(null);
      setGeminiContent(null);
      setGptContent(null);
      setShowAnswers(false);
      setFullscreenAnswer(null);
      setGeminiLikeCount(0);
      setGptLikeCount(0);
      setLikedAnswers(new Set());
      return;
    }

    // 상태 초기화
    setShowAnswers(false);
    setFullscreenAnswer(null);
    setGeminiLikeCount(question.gemini_like_count || 0);
    setGptLikeCount(question.gpt_like_count || 0);
    
    // 콘텐츠 파싱
    setQuestionContent(parseContent(question.content));
    setAnswerContent(parseContent(question.answer));
    setGeminiContent(parseContent(question.answer_gemini));
    setGptContent(parseContent(question.answer_gpt));
    
    // 기존 좋아요 상태 확인
    const sessionId = getSessionId();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const checkLikes = async () => {
        const likedSet = new Set<string>();
        
        if (question.answer_gemini) {
          let geminiLikeQuery = supabase
            .from('modu_answer_likes')
            .select('id')
            .eq('question_id', question.id)
            .eq('answer_type', 'gemini');
          
          if (user?.id) {
            geminiLikeQuery = geminiLikeQuery.eq('user_id', user.id);
          } else if (sessionId) {
            geminiLikeQuery = geminiLikeQuery.eq('session_id', sessionId);
          }
          
          const { data: geminiLikes } = await geminiLikeQuery;
          if (geminiLikes && geminiLikes.length > 0) {
            likedSet.add(`${question.id}-gemini`);
          }
        }
        
        if (question.answer_gpt) {
          let gptLikeQuery = supabase
            .from('modu_answer_likes')
            .select('id')
            .eq('question_id', question.id)
            .eq('answer_type', 'gpt');
          
          if (user?.id) {
            gptLikeQuery = gptLikeQuery.eq('user_id', user.id);
          } else if (sessionId) {
            gptLikeQuery = gptLikeQuery.eq('session_id', sessionId);
          }
          
          const { data: gptLikes } = await gptLikeQuery;
          if (gptLikes && gptLikes.length > 0) {
            likedSet.add(`${question.id}-gpt`);
          }
        }
        
        setLikedAnswers(likedSet);
      };
      
      checkLikes();
    });
  }, [question?.id]);

  // ESC 키로 닫기 및 전체 화면 모드 종료
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenAnswer) {
          setFullscreenAnswer(null);
        } else {
          onClose();
        }
      }
      // 화살표 키로 이전/다음 질문 이동
      if (e.key === 'ArrowLeft' && hasPrev && onNavigateQuestion) {
        onNavigateQuestion('prev');
      }
      if (e.key === 'ArrowRight' && hasNext && onNavigateQuestion) {
        onNavigateQuestion('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // 스크롤 방지
    document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose, fullscreenAnswer, hasPrev, hasNext, onNavigateQuestion]);

  if (!isOpen || !question) return null;

  const hasAnswers = question.answer || question.answer_gemini || question.answer_gpt;
  const answerCount = [question.answer, question.answer_gemini, question.answer_gpt].filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      {/* 모바일: 전체 화면, 데스크톱: 16:9 Slide Container */}
      <div
        className="relative w-full h-full md:w-full md:max-w-[90vw] md:aspect-video md:h-auto bg-slate-950 border-0 md:border border-slate-800 rounded-none md:rounded-2xl shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '100vh', height: '100vh' }}
      >
        {/* Header Bar - 모바일: 고정 헤더 */}
        <div className="flex-none px-4 md:px-8 py-3 md:py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex flex-col gap-2 md:gap-3">
            {/* 첫 번째 줄: 이전/다음, 좋아요, 태그들 */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 flex-wrap flex-1 min-w-0">
                {/* 이전/다음 질문 네비게이션 */}
                {onNavigateQuestion && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasPrev) onNavigateQuestion('prev');
                      }}
                      disabled={!hasPrev}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="이전 질문 (←)"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-slate-500 text-xs font-mono">
                      {currentIndex + 1} / {questions.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasNext) onNavigateQuestion('next');
                      }}
                      disabled={!hasNext}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="다음 질문 (→)"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-slate-700" />
                  </>
                )}
                {/* 좋아요 */}
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{question.like_count}</span>
                </div>
                {/* 태그들 - 모바일에서 줄바꿈 */}
                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                  {/* Primary Topic */}
                  {question.primary_topic && question.primary_topic !== 'none' && (
                    <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-500/30 font-medium">
                      {getTagLabel(question.primary_topic)}
                    </span>
                  )}
                  {/* Secondary Topics */}
                  {question.secondary_topics && question.secondary_topics.length > 0 && 
                    question.secondary_topics
                      .filter(topic => topic !== 'none' && topic !== question.primary_topic)
                      .map((topic, idx) => (
                        <span key={`secondary-${topic}-${idx}`} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                          {getTagLabel(topic)}
                        </span>
                      ))
                  }
                  {/* Intent */}
                  {question.intent && question.intent !== 'other' && (
                    <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded border border-purple-500/30 font-medium">
                      {getTagLabel(question.intent)}
                    </span>
                  )}
                  {/* Legacy category (호환성) */}
                  {!question.primary_topic && question.category && (
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700 font-mono">
                      #{question.category}
                    </span>
                  )}
                  {question.is_answered && (
                    <span className="flex items-center gap-1 text-green-400 text-xs font-bold px-2 py-0.5 bg-green-900/20 rounded">
                      <CheckCircle2 className="w-3 h-3" /> 답변완료
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* 텍스트 크기 조절 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLargeFont(!isLargeFont);
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  title={isLargeFont ? '작게보기' : '크게보기'}
                >
                  <Type className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Slide Content - 모바일: 세로 스크롤, 데스크톱: 16:9 Layout */}
        <div className="flex-1 flex flex-col min-h-0 p-4 md:p-8 overflow-y-auto">
          {/* Question Section */}
          <div className="flex-none mb-4 md:mb-6">
            <h2 className={cn(
              "font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-3 md:mb-4",
              isLargeFont ? "text-2xl md:text-4xl lg:text-5xl lg:text-6xl" : "text-xl md:text-3xl lg:text-4xl lg:text-5xl"
            )}>
              {questionNumber && (
                <span className="text-purple-400 font-mono mr-2 md:mr-3">#{questionNumber}</span>
              )}
              {question.title}
            </h2>
            <div className={cn(
              "bg-slate-900/60 rounded-xl p-4 md:p-6 border border-slate-800/50 backdrop-blur-sm",
              isLargeFont && "text-base md:text-lg"
            )}>
              <ReadOnlyEditor content={questionContent} className={isLargeFont ? "text-base md:text-lg" : ""} />
            </div>
          </div>

          {/* Answers Section - 모바일: 세로 배치, 데스크톱: Split View for 16:9 */}
          {hasAnswers && !showAnswers && (
            <div className="flex-1 relative flex items-center justify-center min-h-[200px] md:min-h-0">
              {/* 블러 처리된 답변 배경 - 모바일에서 숨김 */}
              <div className="hidden md:grid absolute inset-0 grid-cols-2 gap-4 min-h-0 opacity-30 blur-sm pointer-events-none">
                {/* Expert Answer */}
                {question.answer && (
                  <div className="bg-slate-900/60 rounded-xl p-6 border border-green-500/30 flex flex-col backdrop-blur-sm overflow-hidden">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3 flex-none">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="text-green-400 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-green-200 truncate">Expert Answer</h3>
                        <p className="text-xs text-slate-400">전문가 답변</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                      <ReadOnlyEditor content={answerContent} className={isLargeFont ? "text-lg" : ""} />
                    </div>
                  </div>
                )}

                {/* Gemini Answer */}
                {question.answer_gemini && (
                  <div className="bg-slate-900/60 rounded-xl p-6 border border-blue-500/30 flex flex-col backdrop-blur-sm overflow-hidden">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3 flex-none">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="text-blue-400 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-blue-200 truncate">Gemini</h3>
                        <p className="text-xs text-slate-500 mt-0.5">gemini 3.0 pro</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                      <ReadOnlyEditor content={geminiContent} className={isLargeFont ? "text-lg" : ""} />
                    </div>
                  </div>
                )}

                {/* GPT Answer */}
                {question.answer_gpt && (
                  <div className={cn(
                    "bg-slate-900/60 rounded-xl p-6 border flex flex-col backdrop-blur-sm overflow-hidden",
                    question.answer ? "border-emerald-500/30" : question.answer_gemini ? "border-emerald-500/30" : "border-emerald-500/30"
                  )}>
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3 flex-none">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="text-emerald-400 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-emerald-200 truncate">ChatGPT</h3>
                        <p className="text-xs text-slate-500 mt-0.5">gpt-5.2-thinking</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                      <ReadOnlyEditor content={gptContent} className={isLargeFont ? "text-lg" : ""} />
                    </div>
                  </div>
                )}

                {/* Single Answer Layout */}
                {answerCount === 1 && !question.answer && (
                  <div className="col-span-2">
                    {question.answer_gemini && (
                      <div 
                        className="bg-slate-900/60 rounded-xl p-6 border border-blue-500/30 flex flex-col backdrop-blur-sm h-full cursor-pointer hover:border-blue-400/50 transition-colors relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenAnswer('gemini');
                        }}
                      >
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Sparkles className="text-blue-400 w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-blue-200">Gemini</h3>
                              <p className="text-xs text-slate-500 mt-0.5">gemini 3.0 pro</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnswerLike('gemini');
                              }}
                              disabled={likedAnswers.has(`${question.id}-gemini`) || isLikingGemini}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                                likedAnswers.has(`${question.id}-gemini`)
                                  ? 'bg-blue-600 text-white border-blue-500'
                                  : 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border-slate-700 hover:border-blue-500'
                              )}
                            >
                              <ThumbsUp className={cn('w-3 h-3', likedAnswers.has(`${question.id}-gemini`) && 'fill-current')} />
                              <span>{geminiLikeCount}</span>
                            </button>
                            <Maximize2 className="w-4 h-4 text-slate-500" />
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2">
                          <ReadOnlyEditor content={geminiContent} />
                        </div>
                      </div>
                    )}
                    {question.answer_gpt && !question.answer_gemini && (
                      <div 
                        className="bg-slate-900/60 rounded-xl p-6 border border-emerald-500/30 flex flex-col backdrop-blur-sm h-full cursor-pointer hover:border-emerald-400/50 transition-colors relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenAnswer('gpt');
                        }}
                      >
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Bot className="text-emerald-400 w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-emerald-200">ChatGPT</h3>
                              <p className="text-xs text-slate-500 mt-0.5">gpt-5.2-thinking</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnswerLike('gpt');
                              }}
                              disabled={likedAnswers.has(`${question.id}-gpt`) || isLikingGpt}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                                likedAnswers.has(`${question.id}-gpt`)
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : 'bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white border-slate-700 hover:border-emerald-500'
                              )}
                            >
                              <ThumbsUp className={cn('w-3 h-3', likedAnswers.has(`${question.id}-gpt`) && 'fill-current')} />
                              <span>{gptLikeCount}</span>
                            </button>
                            <Maximize2 className="w-4 h-4 text-slate-500" />
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2">
                          <ReadOnlyEditor content={gptContent} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 답변보기 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAnswers(true);
                }}
                className="relative z-10 px-6 md:px-8 py-3 md:py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-base md:text-lg transition-colors shadow-lg shadow-purple-900/50"
              >
                답변보기
              </button>
            </div>
          )}

          {hasAnswers && showAnswers && !fullscreenAnswer && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-y-auto">
              {/* Expert Answer */}
              {question.answer && (
                <div 
                  className="bg-slate-900/60 rounded-xl p-6 border border-green-500/30 flex flex-col backdrop-blur-sm overflow-hidden cursor-pointer hover:border-green-400/50 transition-colors relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenAnswer('expert');
                  }}
                >
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 flex-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="text-green-400 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-green-200 truncate">Expert Answer</h3>
                        <p className="text-xs text-slate-400">전문가 답변</p>
                      </div>
                    </div>
                    <Maximize2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                    <ReadOnlyEditor content={answerContent} className={isLargeFont ? "text-lg" : ""} />
                  </div>
                </div>
              )}

              {/* Gemini Answer */}
              {question.answer_gemini && (
                <div 
                  className="bg-slate-900/60 rounded-xl p-6 border border-blue-500/30 flex flex-col backdrop-blur-sm overflow-hidden cursor-pointer hover:border-blue-400/50 transition-colors relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenAnswer('gemini');
                  }}
                >
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 flex-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="text-blue-400 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-blue-200 truncate">Gemini</h3>
                        <p className="text-xs text-slate-500 mt-0.5">gemini 3.0 pro</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswerLike('gemini');
                        }}
                        disabled={likedAnswers.has(`${question.id}-gemini`) || isLikingGemini}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                          likedAnswers.has(`${question.id}-gemini`)
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border-slate-700 hover:border-blue-500'
                        )}
                      >
                        <ThumbsUp className={cn('w-3 h-3', likedAnswers.has(`${question.id}-gemini`) && 'fill-current')} />
                        <span>{geminiLikeCount}</span>
                      </button>
                      <Maximize2 className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                    <ReadOnlyEditor content={geminiContent} className={isLargeFont ? "text-lg" : ""} />
                  </div>
                </div>
              )}

              {/* GPT Answer */}
              {question.answer_gpt && (
                <div 
                  className={cn(
                    "bg-slate-900/60 rounded-xl p-6 border flex flex-col backdrop-blur-sm overflow-hidden cursor-pointer hover:border-emerald-400/50 transition-colors relative",
                    question.answer ? "border-emerald-500/30" : question.answer_gemini ? "border-emerald-500/30" : "border-emerald-500/30"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenAnswer('gpt');
                  }}
                >
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 flex-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="text-emerald-400 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-emerald-200 truncate">ChatGPT</h3>
                        <p className="text-xs text-slate-500 mt-0.5">gpt-5.2-thinking</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswerLike('gpt');
                        }}
                        disabled={likedAnswers.has(`${question.id}-gpt`) || isLikingGpt}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                          likedAnswers.has(`${question.id}-gpt`)
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white border-slate-700 hover:border-emerald-500'
                        )}
                      >
                        <ThumbsUp className={cn('w-3 h-3', likedAnswers.has(`${question.id}-gpt`) && 'fill-current')} />
                        <span>{gptLikeCount}</span>
                      </button>
                      <Maximize2 className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                    <ReadOnlyEditor content={gptContent} className={isLargeFont ? "text-lg" : ""} />
                  </div>
                </div>
              )}

              {/* Single Answer Layout */}
              {answerCount === 1 && !question.answer && (
                <div className="col-span-2">
                  {question.answer_gemini && (
                    <div 
                      className="bg-slate-900/60 rounded-xl p-6 border border-blue-500/30 flex flex-col backdrop-blur-sm h-full cursor-pointer hover:border-blue-400/50 transition-colors relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenAnswer('gemini');
                      }}
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Sparkles className="text-blue-400 w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-blue-200">Gemini</h3>
                            <p className="text-xs text-slate-500 mt-0.5">gemini 3.0 pro</p>
                          </div>
                        </div>
                        <Maximize2 className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2">
                        <ReadOnlyEditor content={geminiContent} className={isLargeFont ? "text-lg" : ""} />
                      </div>
                    </div>
                  )}
                  {question.answer_gpt && !question.answer_gemini && (
                    <div 
                      className="bg-slate-900/60 rounded-xl p-6 border border-emerald-500/30 flex flex-col backdrop-blur-sm h-full cursor-pointer hover:border-emerald-400/50 transition-colors relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenAnswer('gpt');
                      }}
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Bot className="text-emerald-400 w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-emerald-200">ChatGPT</h3>
                            <p className="text-xs text-slate-500 mt-0.5">gpt-5.2-thinking</p>
                          </div>
                        </div>
                        <Maximize2 className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2">
                        <ReadOnlyEditor content={gptContent} className={isLargeFont ? "text-lg" : ""} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fullscreen Answer View */}
          {fullscreenAnswer && (
            <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {fullscreenAnswer === 'expert' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <MessageCircle className="text-green-400 w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl text-green-200">Expert Answer</h3>
                        <p className="text-sm text-slate-400">전문가 답변</p>
                      </div>
                    </>
                  )}
                  {fullscreenAnswer === 'gemini' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Sparkles className="text-blue-400 w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl text-blue-200">Gemini</h3>
                        <p className="text-xs text-slate-500 mt-0.5">gemini 3.0 pro</p>
                      </div>
                    </>
                  )}
                  {fullscreenAnswer === 'gpt' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Bot className="text-emerald-400 w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl text-emerald-200">ChatGPT</h3>
                        <p className="text-xs text-slate-500 mt-0.5">gpt-5.2-thinking</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {fullscreenAnswer === 'gemini' && question.answer_gemini && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswerLike('gemini');
                      }}
                      disabled={likedAnswers.has(`${question.id}-gemini`) || isLikingGemini}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                        likedAnswers.has(`${question.id}-gemini`)
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border-slate-700 hover:border-blue-500'
                      )}
                    >
                      <ThumbsUp className={cn('w-4 h-4', likedAnswers.has(`${question.id}-gemini`) && 'fill-current')} />
                      <span>{geminiLikeCount}</span>
                    </button>
                  )}
                  {fullscreenAnswer === 'gpt' && question.answer_gpt && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswerLike('gpt');
                      }}
                      disabled={likedAnswers.has(`${question.id}-gpt`) || isLikingGpt}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                        likedAnswers.has(`${question.id}-gpt`)
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white border-slate-700 hover:border-emerald-500'
                      )}
                    >
                      <ThumbsUp className={cn('w-4 h-4', likedAnswers.has(`${question.id}-gpt`) && 'fill-current')} />
                      <span>{gptLikeCount}</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenAnswer(null);
                    }}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    title="작게보기 (ESC)"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                {fullscreenAnswer === 'expert' && <ReadOnlyEditor content={answerContent} className={isLargeFont ? "text-lg" : ""} />}
                {fullscreenAnswer === 'gemini' && <ReadOnlyEditor content={geminiContent} className={isLargeFont ? "text-lg" : ""} />}
                {fullscreenAnswer === 'gpt' && <ReadOnlyEditor content={gptContent} className={isLargeFont ? "text-lg" : ""} />}
              </div>
            </div>
          )}

          {/* No Answer Message */}
          {!hasAnswers && (
            <div className="flex-1 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800/50 backdrop-blur-sm">
              <p className="text-slate-400 text-lg">아직 답변이 등록되지 않았습니다.</p>
            </div>
          )}
        </div>

        {/* Footer Bar - 모바일: 고정 푸터 */}
        {!fullscreenAnswer && (
          <div className="flex-none px-4 md:px-8 py-3 border-t border-slate-800 bg-slate-900/30 backdrop-blur-sm sticky bottom-0 z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-mono text-xs">
                {new Date(question.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
                <span className="hidden md:inline">ESC로 닫기 {onNavigateQuestion && '| ← → 로 이동'}</span>
                {/* 모바일: 이전/다음 버튼 추가 */}
                {onNavigateQuestion && (
                  <div className="flex items-center gap-2 md:hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasPrev) onNavigateQuestion('prev');
                      }}
                      disabled={!hasPrev}
                      className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800 rounded-lg"
                      title="이전 질문"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-slate-500 text-xs font-mono px-2">
                      {currentIndex + 1} / {questions.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasNext) onNavigateQuestion('next');
                      }}
                      disabled={!hasNext}
                      className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800 rounded-lg"
                      title="다음 질문"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

