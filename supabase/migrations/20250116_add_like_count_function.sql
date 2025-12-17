-- 마이그레이션: 좋아요 카운트 증가 함수
-- 생성일: 2025-01-16
-- 목적: 좋아요 추가/삭제 시 modu_questions.like_count 자동 업데이트

-- 좋아요 카운트 증가 함수
CREATE OR REPLACE FUNCTION modu_increment_like_count(question_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE modu_questions
  SET like_count = COALESCE(like_count, 0) + 1
  WHERE id = question_id_param;
END;
$$;

-- 좋아요 카운트 감소 함수
CREATE OR REPLACE FUNCTION modu_decrement_like_count(question_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE modu_questions
  SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
  WHERE id = question_id_param;
END;
$$;

-- 좋아요 추가 시 자동으로 카운트 증가 (트리거)
CREATE OR REPLACE FUNCTION modu_trigger_increment_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM modu_increment_like_count(NEW.question_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER modu_trigger_like_insert
  AFTER INSERT ON modu_likes
  FOR EACH ROW
  EXECUTE FUNCTION modu_trigger_increment_like_count();

-- 좋아요 삭제 시 자동으로 카운트 감소 (트리거)
CREATE OR REPLACE FUNCTION modu_trigger_decrement_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM modu_decrement_like_count(OLD.question_id);
  RETURN OLD;
END;
$$;

CREATE TRIGGER modu_trigger_like_delete
  AFTER DELETE ON modu_likes
  FOR EACH ROW
  EXECUTE FUNCTION modu_trigger_decrement_like_count();





