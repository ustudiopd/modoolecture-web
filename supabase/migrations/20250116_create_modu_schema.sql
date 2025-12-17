-- 마이그레이션: modu 스키마 생성 및 테이블 이동
-- 생성일: 2025-01-16
-- 목적: 모두의특강 전용 스키마 생성 및 기존 테이블 이동

-- 1. modu 스키마 생성
CREATE SCHEMA IF NOT EXISTS modu;

-- 2. 기존 테이블들을 modu 스키마로 이동 (존재하는 경우에만)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modu_events') THEN
    ALTER TABLE modu_events SET SCHEMA modu;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modu_questions') THEN
    ALTER TABLE modu_questions SET SCHEMA modu;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modu_likes') THEN
    ALTER TABLE modu_likes SET SCHEMA modu;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modu_raw_responses') THEN
    ALTER TABLE modu_raw_responses SET SCHEMA modu;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modu_question_groups') THEN
    ALTER TABLE modu_question_groups SET SCHEMA modu;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modu_question_group_items') THEN
    ALTER TABLE modu_question_group_items SET SCHEMA modu;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modu_broadcast_state') THEN
    ALTER TABLE modu_broadcast_state SET SCHEMA modu;
  END IF;
END $$;

-- 3. 함수들도 modu 스키마로 이동 (존재하는 경우에만)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'modu_increment_like_count') THEN
    ALTER FUNCTION modu_increment_like_count(UUID) SET SCHEMA modu;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'modu_decrement_like_count') THEN
    ALTER FUNCTION modu_decrement_like_count(UUID) SET SCHEMA modu;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'modu_trigger_increment_like_count') THEN
    ALTER FUNCTION modu_trigger_increment_like_count() SET SCHEMA modu;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'modu_trigger_decrement_like_count') THEN
    ALTER FUNCTION modu_trigger_decrement_like_count() SET SCHEMA modu;
  END IF;
END $$;

-- 4. 인덱스 이름은 자동으로 스키마와 함께 관리되므로 별도 작업 불필요
-- 5. 트리거는 함수와 함께 자동으로 스키마에 속함

-- 6. RLS 정책은 테이블과 함께 자동으로 스키마에 속함
-- (정책 이름은 스키마를 명시하지 않으므로 그대로 유지)

