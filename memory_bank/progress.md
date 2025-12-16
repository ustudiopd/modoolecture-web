# 완료된 작업 내역 (Progress)

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
