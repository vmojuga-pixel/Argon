-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  failure_count INTEGER DEFAULT 0,
  last_fired_at INTEGER,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
CREATE INDEX IF NOT EXISTS idx_webhooks_tenant ON webhooks(tenant_id, active);

-- Webhook delivery log
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status_code INTEGER,
  attempts INTEGER DEFAULT 1,
  last_error TEXT,
  ts INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_deliveries_webhook ON webhook_deliveries(webhook_id, ts);

-- Idempotency keys (untuk retry-safe POST)
CREATE TABLE IF NOT EXISTS idempotency (
  key TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  response TEXT NOT NULL,
  ts INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_idem_ts ON idempotency(ts);

-- Audit log per tenant
CREATE TABLE IF NOT EXISTS tenant_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  actor TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  metadata TEXT,
  ts INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON tenant_audit(tenant_id, ts);
