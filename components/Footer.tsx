import Link from 'next/link';
import { MonitorPlay } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <MonitorPlay className="text-purple-500 w-6 h-6" />
              <span className="text-xl font-bold text-white">모두의특강</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs mx-auto sm:mx-0">
              지식을 나누고 함께 성장하는<br />
              온라인 라이브 강연 플랫폼
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Menu</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="#" className="hover:text-purple-400">
                  강의 전체보기
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-purple-400">
                  커뮤니티
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-purple-400">
                  이벤트
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>support@modoolecture.com</li>
              <li>제휴 및 출강 문의</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-xs text-slate-600">
          &copy; 2025 Modoo Lecture. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

