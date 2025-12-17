'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, signOut, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link
                href="/admin/events"
                className="text-lg font-semibold text-white hover:text-slate-300"
              >
                모두의특강 관리자
              </Link>
              <div className="flex gap-4">
                <Link
                  href="/admin/events"
                  className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  이벤트 관리
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-slate-400 hover:text-white px-3 py-2 rounded-md font-medium transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="text-slate-200">{children}</main>
    </div>
  );
}


