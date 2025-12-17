# 완료된 작업 내역 (Progress)

## [2025-01-16]
- **질문 일괄 삽입 기능**: Markdown 파일에서 질문을 파싱하여 데이터베이스에 일괄 삽입하는 스크립트 구현
  - `scripts/bulk-insert-questions.ts`: YAML 프론트매터 형식의 질문 파싱 및 삽입
  - `scripts/delete-event-questions.ts`: 특정 이벤트의 모든 질문 삭제 스크립트
  - 177개 질문 일괄 삽입 완료 (ai-2025 이벤트)
- **질문 관리 화면 개선**: 관리자 화면에 답변 상태 필터 탭 추가
  - Gemini 답변 있음, GPT 답변 있음, 답변 없음 탭 추가
  - `app/admin/events/[eventId]/questions/page.tsx` 수정
- **질문 등록 폼 개선**: 이메일 필드 추가 및 마스킹 이름 필드 제거
  - 작성자 이름 아래에 이메일 입력 필드 추가
- **카테고리 필터 개선**: 검색창 아래 필터를 토픽 태그 10개로 변경
  - `lib/types/question-tags.ts`에 `getTopicFilterOptions()` 함수 추가
  - `app/board/[event]/page.tsx`에서 필터링 로직을 `primary_topic` 기준으로 변경
  - "없음" 태그 제외 및 버튼 크기 축소
- **QuestionCard 태그 표시 개선**: 관리 화면과 동일하게 모든 태그 표시
  - `primary_topic`, `secondary_topics`, `intent` 필드 모두 표시
  - 한글 변환 및 색상 구분 적용
- **답변 좋아요 기능**: Gemini/GPT 답변에 좋아요 기능 추가
  - `modu_answer_likes` 테이블 생성 (마이그레이션)
  - `app/api/answer-like/route.ts` API 엔드포인트 추가
  - `components/board/QuestionModal.tsx`에 좋아요 버튼 및 카운트 표시
- **답변 전체 화면 보기**: 답변 섹션 클릭 시 전체 화면 모드
  - `fullscreenAnswer` 상태로 개별 답변 전체 화면 표시
  - 로고/이름 클릭 또는 ESC 키로 복귀
- **답변 블러 처리**: 모달 열릴 때 답변을 블러 처리하고 "답변보기" 버튼 추가
  - `showAnswers` 상태로 답변 표시 제어
  - Expert Answer는 블러 처리하지 않음
- **Navbar 개선**: 데스크톱 메뉴에서 로그인 버튼 제거

## [2024-12-19]
- **Novel.sh 기반 블로그 에디터 구현**: Novel.sh 라이브러리를 사용한 리치 텍스트 에디터 구현 완료
  - Tiptap 기반 에디터 설정 (StarterKit, Image, Link, YouTube 확장)
  - 이미지 리사이즈 기능 구현 (드래그로 크기 조절, Shift+드래그로 비율 유지)
  - 에디터 테스트 페이지 생성 (`/editor-test`)
- **슬래시 커맨드 메뉴 구현**: Notion 스타일의 슬래시(`/`) 커맨드 메뉴 구현
  - Novel.sh의 `Command` 확장 및 `EditorCommand` 컴포넌트 통합
  - 제목 1/2/3, 글머리 기호, 번호 목록, 인용, 코드 블록, 이미지, 링크, YouTube 옵션 제공
  - `renderItems` 함수를 사용한 커맨드 메뉴 렌더링
- **텍스트 선택 포맷팅 메뉴 구현**: 텍스트 드래그 시 나타나는 포맷팅 서브 메뉴 구현
  - Novel.sh의 `EditorBubble` 컴포넌트 사용
  - 굵게, 기울임, 밑줄, 취소선, 인라인 코드, 링크 포맷팅 옵션 제공
  - `@tiptap/extension-underline` 확장 추가
- **Next.js 16 업그레이드**: Next.js 14에서 16으로 업그레이드 완료
  - React 19로 업그레이드
  - Turbopack 설정 추가
  - ESLint 버전 충돌 해결
- **의존성 설치 및 취약점 수정**: 새 PC 환경에서 모든 의존성 설치 및 취약점 수정 완료
