import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '모두의특강 - 세상을 바꾸는 아이디어',
  description: '지식을 나누고 함께 성장하는 온라인 라이브 강연 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-slate-950 text-slate-200 min-h-screen selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  )
}



