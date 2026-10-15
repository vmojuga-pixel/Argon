-- OMNI E2E SCHEMA for: sse-quick-2705
-- Directive: Quick SSE test
CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'GENERAL',
  amount NUMERIC DEFAULT 0.00,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_records_status ON records(status);
