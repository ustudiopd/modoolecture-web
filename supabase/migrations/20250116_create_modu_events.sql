-- 마이그레이션: modu_events 테이블 생성
-- 생성일: 2025-01-16
-- 목적: 이벤트(회차) 테이블 생성

CREATE TABLE IF NOT EXISTS modu_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'live', 'closed')),
  notebooklm_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS modu_idx_events_status ON modu_events(status);
CREATE INDEX IF NOT EXISTS modu_idx_events_slug ON modu_events(slug);
CREATE INDEX IF NOT EXISTS modu_idx_events_created ON modu_events(created_at DESC);


