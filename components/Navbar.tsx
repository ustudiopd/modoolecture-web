'use client';

import { useState, useLayoutEffect } from 'react';
import Link from 'next/link';
import { MonitorPlay, Search, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useLayoutEffect(() => {
    // DOM에 직접 스타일 적용하여 즉시 정렬 보장
    const container = document.querySelector('.critical-container-7xl');
    if (container) {
      (container as HTMLElement).style.width = '100%';
      (container as HTMLElement).style.maxWidth = '80rem';
      (container as HTMLElement).style.marginLeft = 'auto';
      (container as HTMLElement).style.marginRight = 'auto';
    }
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 left-0 right-0">
      <div 
        className="critical-container-7xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ 
          width: '100%', 
          maxWidth: '80rem', 
          marginLeft: 'auto', 
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem'
        }}
      >
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <div 
              className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ width: '24px', height: '24px', minWidth: '24px', maxWidth: '24px' }}
            >
              <MonitorPlay className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap">
              모두의특강
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              강의 목록
            </Link>
            <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              커뮤니티
            </Link>
            <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              이벤트
            </Link>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
              로그인
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              강의 목록
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              커뮤니티
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              이벤트
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}



