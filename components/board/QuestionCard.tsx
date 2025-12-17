'use client';

import { useState } from 'react';
import { Copy, CheckCircle2, ThumbsUp, MessageCircle, Check } from 'lucide-react';
import { generatePromptMarkdown, copyToClipboard } from '@/lib/utils/markdown';
import { cn } from '@/lib/utils/cn';

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string | null;
  category?: string;
  like_count: number;
  comments?: number;
  created_at: string;
  is_answered: boolean;
  event?: {
    title: string;
  };
}

interface QuestionCardProps {
  question: Question;
  onLike: (id: string) => Promise<void>;
  liked?: boolean;
  onClick?: () => void;
}

export default function QuestionCard({ question, onLike, liked = false, onClick }: QuestionCardProps) {
  const [copied, setCopied] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleCopy = async () => {
    const markdown = generatePromptMarkdown(question);
    const success = await copyToClipboard(markdown);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = async () => {
    if (liked || isLiking) return;
    setIsLiking(true);
    try {
      await onLike(question.id);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-900/10 animate-fade-in-down">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {question.category && (
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 font-mono">
              #{question.category}
            </span>
          )}
          {question.is_answered && (
            <span className="flex items-center gap-1 text-green-400 text-xs font-bold px-2 py-0.5 bg-green-900/20 rounded">
              <CheckCircle2 className="w-3 h-3" /> 답변완료
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors border',
            copied
              ? 'bg-green-600 text-white border-green-500'
              : 'bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white border-slate-700 hover:border-purple-500'
          )}
          title="LLM용 프롬프트 복사"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? '복사됨' : 'Copy for LLM'}
        </button>
      </div>

      <div onClick={onClick} className="cursor-pointer">
        <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-purple-300 transition-colors">
          {question.title}
        </h3>
        <p className="text-slate-200 text-sm mb-4 leading-relaxed line-clamp-3">{question.content}</p>
      </div>

      {question.answer && (
        <div className="mb-4 bg-slate-800/50 rounded-lg p-3 border-l-2 border-green-500">
          <div className="flex items-center gap-2 mb-1 text-xs text-green-400 font-bold">
            <MessageCircle className="w-3 h-3" /> EXPERT ANSWER
          </div>
          <p className="text-slate-200 text-sm line-clamp-2">{question.answer}</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-2">
        <div className="flex gap-4 text-sm text-slate-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            disabled={liked || isLiking}
            className={cn(
              'flex items-center gap-1.5 transition-colors',
              liked ? 'text-purple-400' : 'text-slate-300 hover:text-purple-400'
            )}
          >
            <ThumbsUp className={cn('w-4 h-4', liked && 'fill-current')} />
            <span>{question.like_count}</span>
          </button>
          {question.comments !== undefined && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <MessageCircle className="w-4 h-4" />
              <span>{question.comments}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400 font-mono">{formatDate(question.created_at)}</span>
      </div>
    </div>
  );
}



