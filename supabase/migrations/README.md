# Supabase 마이그레이션 가이드

## 마이그레이션 파일 목록

1. **20250116_add_question_groups_and_likes.sql**
   - `modu_likes` 테이블 생성 (투표 → 좋아요 시스템 변경)
   - `modu_raw_responses` 테이블 생성 (엑셀 원본 보관)
   - `modu_question_groups` 테이블 생성 (유사 질문 그룹핑)
   - `modu_question_group_items` 테이블 생성 (그룹-질문 연결)
   - `modu_broadcast_state` 테이블 생성 (방송 진행 상태)
   - `modu_questions` 테이블 확장 (컬럼 추가)
   - `vote_count` → `like_count` 컬럼명 변경

2. **20250116_add_rls_policies.sql**
   - Row Level Security (RLS) 정책 설정
   - 공개 테이블: `modu_events`, `modu_questions`, `modu_question_groups`
   - 제한 테이블: `modu_likes` (INSERT 공개, SELECT 제한)
   - 관리자 전용: `modu_raw_responses` (email 포함 민감 정보)

3. **20250116_add_like_count_function.sql**
   - `modu_increment_like_count()` 함수
   - `modu_decrement_like_count()` 함수
   - 좋아요 추가/삭제 시 자동 카운트 업데이트 트리거

## 적용 방법

### 방법 1: MCP Supabase 사용 (권장)

1. **MCP 인증 설정**
   - Supabase 프로젝트의 Access Token을 환경 변수로 설정:
     ```bash
     export SUPABASE_ACCESS_TOKEN=your_access_token_here
     ```
   - 또는 Cursor의 MCP 설정에서 `--access-token` 플래그로 전달

2. **마이그레이션 적용**
   - 순서대로 적용:
     ```bash
     # 1. 테이블 및 컬럼 생성
     # MCP 도구를 통해 20250116_add_question_groups_and_likes.sql 적용
     
     # 2. RLS 정책 추가
     # MCP 도구를 통해 20250116_add_rls_policies.sql 적용
     
     # 3. 함수 및 트리거 추가
     # MCP 도구를 통해 20250116_add_like_count_function.sql 적용
     ```

### 방법 2: Supabase 대시보드 사용

1. Supabase 대시보드 → SQL Editor로 이동
2. 각 마이그레이션 파일의 내용을 복사하여 순서대로 실행
3. 실행 순서:
   - `20250116_add_question_groups_and_likes.sql`
   - `20250116_add_rls_policies.sql`
   - `20250116_add_like_count_function.sql`

### 방법 3: Supabase CLI 사용

```bash
# Supabase CLI 설치 (필요시)
npm install -g supabase

# 로그인
supabase login

# 마이그레이션 적용
supabase db push
```

## 주의사항

- **순서 중요**: 마이그레이션 파일은 순서대로 적용해야 합니다.
- **기존 데이터**: `vote_count` 컬럼이 있는 경우 자동으로 `like_count`로 변경됩니다.
- **RLS 정책**: 모든 테이블에 RLS가 활성화되므로, 필요시 추가 정책을 설정하세요.
- **트리거**: 좋아요 추가/삭제 시 `like_count`가 자동으로 업데이트됩니다.

## 롤백 (필요시)

마이그레이션을 롤백하려면:

```sql
-- 테이블 삭제 (주의: 데이터 손실)
DROP TABLE IF EXISTS modu_broadcast_state CASCADE;
DROP TABLE IF EXISTS modu_question_group_items CASCADE;
DROP TABLE IF EXISTS modu_question_groups CASCADE;
DROP TABLE IF EXISTS modu_raw_responses CASCADE;
DROP TABLE IF EXISTS modu_likes CASCADE;

-- modu_questions 컬럼 제거
ALTER TABLE modu_questions
  DROP COLUMN IF EXISTS group_id,
  DROP COLUMN IF EXISTS answer_gpt,
  DROP COLUMN IF EXISTS answer_gemini,
  DROP COLUMN IF EXISTS sort_order,
  DROP COLUMN IF EXISTS seq,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS display_name_masked,
  DROP COLUMN IF EXISTS display_name_raw,
  DROP COLUMN IF EXISTS raw_response_id;

-- like_count를 vote_count로 되돌리기 (필요시)
ALTER TABLE modu_questions RENAME COLUMN like_count TO vote_count;
```





