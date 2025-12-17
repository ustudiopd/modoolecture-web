'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, ThumbsUp, MessageCircle, Sparkles, Bot } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import ReadOnlyEditor from '@/components/editor/ReadOnlyEditor';
import type { JSONContent } from 'novel';

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string | null;
  answer_gemini?: string | null;
  answer_gpt?: string | null;
  category?: string;
  like_count: number;
  created_at: string;
  is_answered: boolean;
}

interface QuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestionModal({ question, isOpen, onClose }: QuestionModalProps) {
  // content를 JSONContent로 파싱
  const [questionContent, setQuestionContent] = useState<JSONContent | string | null>(null);
  const [answerContent, setAnswerContent] = useState<JSONContent | string | null>(null);
  const [geminiContent, setGeminiContent] = useState<JSONContent | string | null>(null);
  const [gptContent, setGptContent] = useState<JSONContent | string | null>(null);

  useEffect(() => {
    if (!question) return;

    // 질문 본문 파싱
    if (question.content) {
      try {
        if (typeof question.content === 'string' && question.content.trim().startsWith('{')) {
          setQuestionContent(JSON.parse(question.content));
        } else {
          setQuestionContent(question.content);
        }
      } catch {
        setQuestionContent(question.content);
      }
    }

    // 답변 파싱
    if (question.answer) {
      try {
        if (typeof question.answer === 'string' && question.answer.trim().startsWith('{')) {
          setAnswerContent(JSON.parse(question.answer));
        } else {
          setAnswerContent(question.answer);
        }
      } catch {
        setAnswerContent(question.answer);
      }
    }

    if (question.answer_gemini) {
      try {
        if (typeof question.answer_gemini === 'string' && question.answer_gemini.trim().startsWith('{')) {
          setGeminiContent(JSON.parse(question.answer_gemini));
        } else {
          setGeminiContent(question.answer_gemini);
        }
      } catch {
        setGeminiContent(question.answer_gemini);
      }
    }

    if (question.answer_gpt) {
      try {
        if (typeof question.answer_gpt === 'string' && question.answer_gpt.trim().startsWith('{')) {
          setGptContent(JSON.parse(question.answer_gpt));
        } else {
          setGptContent(question.answer_gpt);
        }
      } catch {
        setGptContent(question.answer_gpt);
      }
    }
  }, [question]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !question) return null;

  const hasAnswers = question.answer || question.answer_gemini || question.answer_gpt;
  const answerCount = [question.answer, question.answer_gemini, question.answer_gpt].filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      {/* 16:9 Slide Container */}
      <div
        className="relative w-full max-w-[90vw] aspect-video bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        {/* Header Bar */}
        <div className="flex-none px-8 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {question.category && (
                <span className="px-4 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-bold border border-purple-500/30">
                  {question.category}
                </span>
              )}
              {question.is_answered && (
                <span className="flex items-center gap-1.5 text-green-400 text-sm font-bold px-3 py-1 bg-green-900/20 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> 답변완료
                </span>
              )}
              <span className="text-slate-500 text-sm font-mono">#{question.id.slice(0, 8)}</span>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <ThumbsUp className="w-3 h-3" />
                <span>{question.like_count}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Slide Content - 16:9 Layout */}
        <div className="flex-1 flex flex-col min-h-0 p-8">
          {/* Question Section */}
          <div className="flex-none mb-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-4">
              {question.title}
            </h2>
            <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm">
              <ReadOnlyEditor content={questionContent} />
            </div>
          </div>

          {/* Answers Section - Split View for 16:9 */}
          {hasAnswers && (
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
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
                    <ReadOnlyEditor content={answerContent} />
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
                      <p className="text-xs text-slate-400">Google DeepMind</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                    <ReadOnlyEditor content={geminiContent} />
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
                      <p className="text-xs text-slate-400">OpenAI</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                    <ReadOnlyEditor content={gptContent} />
                  </div>
                </div>
              )}

              {/* Single Answer Layout */}
              {answerCount === 1 && !question.answer && (
                <div className="col-span-2">
                  {question.answer_gemini && (
                    <div className="bg-slate-900/60 rounded-xl p-6 border border-blue-500/30 flex flex-col backdrop-blur-sm h-full">
                      <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Sparkles className="text-blue-400 w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-blue-200">Gemini</h3>
                          <p className="text-xs text-slate-400">Google DeepMind</p>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2">
                        <ReadOnlyEditor content={geminiContent} />
                      </div>
                    </div>
                  )}
                  {question.answer_gpt && !question.answer_gemini && (
                    <div className="bg-slate-900/60 rounded-xl p-6 border border-emerald-500/30 flex flex-col backdrop-blur-sm h-full">
                      <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Bot className="text-emerald-400 w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-emerald-200">ChatGPT</h3>
                          <p className="text-xs text-slate-400">OpenAI</p>
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
          )}

          {/* No Answer Message */}
          {!hasAnswers && (
            <div className="flex-1 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800/50 backdrop-blur-sm">
              <p className="text-slate-400 text-lg">아직 답변이 등록되지 않았습니다.</p>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex-none px-8 py-3 border-t border-slate-800 bg-slate-900/30 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">
              {new Date(question.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <div className="flex items-center gap-4">
              <span>ESC로 닫기</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

