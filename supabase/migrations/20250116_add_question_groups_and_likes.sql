-- 마이그레이션: 질문 그룹핑 및 좋아요 시스템 추가
-- 생성일: 2025-01-16
-- 목적: modu_question_groups, modu_likes, modu_raw_responses, modu_broadcast_state 테이블 생성
--       modu_questions 테이블 확장 (컬럼 추가 및 vote_count → like_count 변경)

-- 1. modu_likes 테이블 생성 (기존 modu_votes 대체)
CREATE TABLE IF NOT EXISTS modu_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES modu_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_id, user_id),
  UNIQUE(question_id, session_id)
);

CREATE INDEX IF NOT EXISTS modu_idx_likes_question ON modu_likes(question_id);
CREATE INDEX IF NOT EXISTS modu_idx_likes_user ON modu_likes(user_id);
CREATE INDEX IF NOT EXISTS modu_idx_likes_session ON modu_likes(session_id);

-- 2. modu_raw_responses 테이블 생성
CREATE TABLE IF NOT EXISTS modu_raw_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES modu_events(id) ON DELETE CASCADE,
  row_no INTEGER,
  submitted_at TIMESTAMPTZ,
  display_name_raw TEXT,
  email TEXT,
  raw_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, row_no)
);

CREATE INDEX IF NOT EXISTS modu_idx_raw_responses_event ON modu_raw_responses(event_id);

-- 3. modu_question_groups 테이블 생성
CREATE TABLE IF NOT EXISTS modu_question_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES modu_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  canonical_question_id UUID REFERENCES modu_questions(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  like_sum INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'merged')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS modu_idx_group_event_sort ON modu_question_groups(event_id, sort_order);
CREATE INDEX IF NOT EXISTS modu_idx_group_canonical ON modu_question_groups(canonical_question_id);

-- 4. modu_question_group_items 테이블 생성
CREATE TABLE IF NOT EXISTS modu_question_group_items (
  group_id UUID NOT NULL REFERENCES modu_question_groups(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES modu_questions(id) ON DELETE CASCADE,
  similarity REAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, question_id)
);

CREATE INDEX IF NOT EXISTS modu_idx_group_items_question ON modu_question_group_items(question_id);

-- 5. modu_broadcast_state 테이블 생성
CREATE TABLE IF NOT EXISTS modu_broadcast_state (
  event_id UUID PRIMARY KEY REFERENCES modu_events(id) ON DELETE CASCADE,
  current_group_id UUID REFERENCES modu_question_groups(id) ON DELETE SET NULL,
  current_index INTEGER DEFAULT 0,
  reveal_mode TEXT DEFAULT 'hidden' CHECK (reveal_mode IN ('hidden', 'gpt', 'gemini', 'both')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. modu_questions 테이블 확장 (컬럼 추가)
ALTER TABLE modu_questions
  ADD COLUMN IF NOT EXISTS raw_response_id UUID REFERENCES modu_raw_responses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS display_name_raw TEXT,
  ADD COLUMN IF NOT EXISTS display_name_masked TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seq INTEGER,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS answer_gemini TEXT,
  ADD COLUMN IF NOT EXISTS answer_gpt TEXT,
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES modu_question_groups(id) ON DELETE SET NULL;

-- 7. vote_count를 like_count로 변경 (기존 컬럼이 있는 경우)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'modu_questions' 
    AND column_name = 'vote_count'
  ) THEN
    ALTER TABLE modu_questions RENAME COLUMN vote_count TO like_count;
  END IF;
END $$;

-- 8. like_count가 없으면 추가
ALTER TABLE modu_questions
  ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- 9. 인덱스 추가
CREATE INDEX IF NOT EXISTS modu_idx_questions_group ON modu_questions(group_id);
CREATE INDEX IF NOT EXISTS modu_idx_questions_like ON modu_questions(like_count DESC);
CREATE INDEX IF NOT EXISTS modu_idx_questions_tags ON modu_questions USING GIN(tags);





