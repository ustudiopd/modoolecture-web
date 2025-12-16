'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none transition-opacity duration-300">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold border border-purple-400/50">
        <Sparkles className="text-yellow-300 w-4 h-4" />
        <span>{message}</span>
      </div>
    </div>
  );
}

