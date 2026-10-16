-- OMNI E2E SCHEMA for: argon-app-llm-urlshort
-- Directive: Build a URL shortener API with POST shorten accepting url returni
CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'GENERAL',
  amount NUMERIC DEFAULT 0.00,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_records_status ON records(status);
