'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Play, Calendar, Users, Sparkles, TrendingUp, ChevronRight, User } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        {/* 1. Hero Section (Featured Event) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900 to-blue-900 border border-slate-700 shadow-2xl shadow-purple-900/20 group transition-transform hover:scale-[1.01]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 blob-anim"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 blob-anim animation-delay-2000"></div>
            </div>

            <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
              <div className="max-w-2xl">
                {/* Tags */}
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20">
                    Live
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20">
                    AI Trend
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20">
                    Talk Show
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                  2025 AI 결산:<br />인간지능 x 인공지능 토크쇼
                </h1>
                <p className="text-slate-200 text-lg md:text-xl mb-8 font-light leading-relaxed">
                  ChatGPT 5.1 & Gemini 3.0과 함께하는<br className="md:hidden" /> 국내 최초 실험적 토크쇼
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://must.ai.kr/webinar/7d4ad9e9-2f69-49db-87a9-8d25cb82edee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white text-purple-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-transform active:scale-95 shadow-lg"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>라이브 입장하기</span>
                  </a>
                  <Link
                    href="/board/ai-2025"
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-purple-900/30"
                  >
                    <span>질문보기</span>
                  </Link>
                  <button className="flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium border border-white/10 hover:bg-black/50 transition-colors">
                    <Calendar className="w-5 h-5" />
                    <span>12월 17일 (수) 19:00</span>
                  </button>
                </div>
              </div>

              {/* D-Day Counter */}
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center min-w-[140px] shadow-xl">
                  <p className="text-slate-300 text-sm mb-1 uppercase tracking-wider">Live까지</p>
                  <p className="text-4xl font-bold text-white">D-2</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Platform Value Proposition */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Users className="text-purple-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">커뮤니티 중심 학습</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                혼자 듣는 강의가 아닙니다.<br />
                사전 질문과 투표로 함께 만들어갑니다.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Sparkles className="text-blue-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">AI 기반 지식 관리</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                모든 강의 내용은 AI가 요약하고,<br />
                나만의 챗봇 데이터로 제공됩니다.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-green-500/30 transition-colors group">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="text-green-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">실무 중심 인사이트</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                현업 전문가들의 생생한 경험과<br />
                최신 트렌드를 가장 빠르게 만납니다.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Recommended Lectures */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">이번 달 인기 특강 🔥</h2>
            <button className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
              전체보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Lecture 1 */}
            <div className="group cursor-pointer">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-emerald-900 to-slate-800 relative overflow-hidden mb-3 border border-slate-800 group-hover:border-slate-600 transition-all">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" /> 12:40
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-400">Development</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> 1.2k
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors leading-snug mb-1">
                  노코드 툴로 만드는 나만의 SaaS
                </h3>
                <p className="text-sm text-slate-500">박지성 대표</p>
              </div>
            </div>

            {/* Lecture 2 */}
            <div className="group cursor-pointer">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-orange-900 to-slate-800 relative overflow-hidden mb-3 border border-slate-800 group-hover:border-slate-600 transition-all">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" /> 45:10
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-orange-400">Business</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> 890
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 group-hover:text-orange-300 transition-colors leading-snug mb-1">
                  스타트업, 첫 100명의 고객 찾기
                </h3>
                <p className="text-sm text-slate-500">최마케터</p>
              </div>
            </div>

            {/* Lecture 3 */}
            <div className="group cursor-pointer">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-pink-900 to-slate-800 relative overflow-hidden mb-3 border border-slate-800 group-hover:border-slate-600 transition-all">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" /> 28:05
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-pink-400">Design</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> 2.1k
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 group-hover:text-pink-300 transition-colors leading-snug mb-1">
                  UX라이팅: 사용자를 이끄는 한마디
                </h3>
                <p className="text-sm text-slate-500">김에디터</p>
              </div>
            </div>

            {/* Lecture 4 */}
            <div className="group cursor-pointer">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-cyan-900 to-slate-800 relative overflow-hidden mb-3 border border-slate-800 group-hover:border-slate-600 transition-all">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" /> 15:30
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-cyan-400">Data</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> 1.5k
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors leading-snug mb-1">
                  데이터 리터러시: 숫자로 일하는 법
                </h3>
                <p className="text-sm text-slate-500">이데이터</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Newsletter CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center border border-slate-800 relative overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"></div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              매주 월요일, 세상을 바꾸는 아이디어를 받으세요
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              모두의특강 뉴스레터를 구독하고 최신 IT 트렌드와 무료 강의 소식을 놓치지 마세요.
              (스팸은 절대 보내지 않습니다)
            </p>

            <form
              action="/api/newsletter"
              method="POST"
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="이메일 주소를 입력해주세요"
                className="flex-1 bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-600"
              />
              <button
                type="submit"
                className="bg-white text-slate-900 font-bold px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors"
              >
                구독하기
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}



