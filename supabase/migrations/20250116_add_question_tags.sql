-- 마이그레이션: 질문 태그 시스템 추가
-- 생성일: 2025-01-16
-- 목적: 질문태그.md 명세에 따른 태그 시스템 구현

-- modu_questions 테이블에 태그 관련 컬럼 추가
ALTER TABLE modu_questions
  ADD COLUMN IF NOT EXISTS primary_topic TEXT,
  ADD COLUMN IF NOT EXISTS secondary_topics TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS intent TEXT,
  ADD COLUMN IF NOT EXISTS confidence REAL,
  ADD COLUMN IF NOT EXISTS classified_by TEXT CHECK (classified_by IN ('gemini', 'human', 'rule')),
  ADD COLUMN IF NOT EXISTS category_version INTEGER DEFAULT 1;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS modu_idx_questions_primary_topic ON modu_questions(primary_topic);
CREATE INDEX IF NOT EXISTS modu_idx_questions_intent ON modu_questions(intent);
CREATE INDEX IF NOT EXISTS modu_idx_questions_secondary_topics ON modu_questions USING GIN(secondary_topics);
CREATE INDEX IF NOT EXISTS modu_idx_questions_confidence ON modu_questions(confidence DESC);

-- 기존 category 컬럼이 있으면 primary_topic으로 마이그레이션 (선택적)
-- 주의: 기존 데이터가 있으면 수동으로 매핑 필요
-- DO $$
-- BEGIN
--   UPDATE modu_questions
--   SET primary_topic = CASE
--     WHEN category = 'Tech/Dev' THEN 'tools_models'
--     WHEN category = 'Business' THEN 'workflow_automation'
--     WHEN category = 'Career' THEN 'trends_learning_career'
--     WHEN category = 'Ethics' THEN 'copyright_ethics'
--     WHEN category = 'Prompt' THEN 'prompting'
--     ELSE 'other'
--   END
--   WHERE category IS NOT NULL AND primary_topic IS NULL;
-- END $$;

