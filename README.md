# 모두의특강 웹 시스템

이벤트 기반 질문 랭킹 및 아카이빙 플랫폼

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
modoolecture-web/
├── app/                    # Next.js App Router
│   ├── board/              # 질문 보드 페이지
│   ├── api/                # API Routes
│   └── page.tsx            # 메인 페이지
├── components/             # React 컴포넌트
│   ├── board/              # 질문 보드 컴포넌트
│   └── ui/                 # UI 컴포넌트
├── lib/                    # 유틸리티 및 헬퍼
│   ├── supabase/           # Supabase 클라이언트
│   └── utils/              # 유틸리티 함수
└── memory_bank/            # 프로젝트 문서
```

## 주요 기능

- 질문/답변 보드 시스템
- 투표 및 랭킹 시스템
- Markdown 프롬프트 복사
- NotebookLM 연동
- 이벤트별 질문 관리

## 라이선스

MIT



