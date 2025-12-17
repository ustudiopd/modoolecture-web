-- 마이그레이션: RLS 정책 추가
-- 생성일: 2025-01-16
-- 목적: 질문보드 시스템의 Row Level Security 정책 설정

-- 1. modu_events: 공개 SELECT
ALTER TABLE modu_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modu_events_select_public" ON modu_events;
CREATE POLICY "modu_events_select_public"
  ON modu_events
  FOR SELECT
  USING (true);

-- 2. modu_questions: 공개 SELECT
ALTER TABLE modu_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modu_questions_select_public" ON modu_questions;
CREATE POLICY "modu_questions_select_public"
  ON modu_questions
  FOR SELECT
  USING (true);

-- 3. modu_question_groups: 공개 SELECT
ALTER TABLE modu_question_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modu_question_groups_select_public" ON modu_question_groups;
CREATE POLICY "modu_question_groups_select_public"
  ON modu_question_groups
  FOR SELECT
  USING (true);

-- 4. modu_question_group_items: 공개 SELECT
ALTER TABLE modu_question_group_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modu_question_group_items_select_public" ON modu_question_group_items;
CREATE POLICY "modu_question_group_items_select_public"
  ON modu_question_group_items
  FOR SELECT
  USING (true);

-- 5. modu_likes: INSERT 공개, SELECT 제한 (본인이 좋아요한 것만 조회 가능)
ALTER TABLE modu_likes ENABLE ROW LEVEL SECURITY;

-- INSERT: 누구나 가능 (세션 기반)
DROP POLICY IF EXISTS "modu_likes_insert_public" ON modu_likes;
CREATE POLICY "modu_likes_insert_public"
  ON modu_likes
  FOR INSERT
  WITH CHECK (true);

-- SELECT: 본인이 좋아요한 것만 조회 가능
DROP POLICY IF EXISTS "modu_likes_select_own" ON modu_likes;
CREATE POLICY "modu_likes_select_own"
  ON modu_likes
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    session_id = current_setting('app.session_id', true)
  );

-- 6. modu_raw_responses: 관리자만 SELECT (email 포함 민감 정보)
ALTER TABLE modu_raw_responses ENABLE ROW LEVEL SECURITY;

-- 관리자만 SELECT 가능 (service_role key 사용 시 RLS 우회 가능)
DROP POLICY IF EXISTS "modu_raw_responses_select_admin" ON modu_raw_responses;
CREATE POLICY "modu_raw_responses_select_admin"
  ON modu_raw_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 7. modu_broadcast_state: 공개 SELECT (방송 상태는 공개)
ALTER TABLE modu_broadcast_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modu_broadcast_state_select_public" ON modu_broadcast_state;
CREATE POLICY "modu_broadcast_state_select_public"
  ON modu_broadcast_state
  FOR SELECT
  USING (true);


