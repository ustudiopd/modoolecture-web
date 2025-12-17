-- 마이그레이션: modu_events 테이블에 누락된 컬럼 추가
-- 생성일: 2025-01-16
-- 목적: 기존 modu_events 테이블에 필요한 컬럼 추가

-- event_date 컬럼 추가
ALTER TABLE modu_events
  ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;

-- status 컬럼 추가 (기본값과 체크 제약조건 포함)
DO $$
BEGIN
  -- status 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'modu_events' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE modu_events
      ADD COLUMN status TEXT DEFAULT 'open';
    
    -- 체크 제약조건 추가
    ALTER TABLE modu_events
      ADD CONSTRAINT modu_events_status_check 
      CHECK (status IN ('open', 'live', 'closed'));
  END IF;
END $$;

-- notebooklm_url 컬럼 추가
ALTER TABLE modu_events
  ADD COLUMN IF NOT EXISTS notebooklm_url TEXT;

-- created_at, updated_at 컬럼 추가
ALTER TABLE modu_events
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE modu_events
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS modu_idx_events_status ON modu_events(status);
CREATE INDEX IF NOT EXISTS modu_idx_events_slug ON modu_events(slug);
CREATE INDEX IF NOT EXISTS modu_idx_events_created ON modu_events(created_at DESC);


