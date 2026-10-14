-- Tenants (pelanggan SaaS)
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  trial_ends_at INTEGER,
  notes TEXT
);

-- API Keys (multi-key per tenant)
CREATE TABLE IF NOT EXISTS tenant_api_keys (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT NOT NULL,
  label TEXT,
  scopes TEXT DEFAULT 'chat',
  created_at INTEGER DEFAULT (unixepoch()),
  last_used INTEGER,
  revoked INTEGER DEFAULT 0,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Usage metering per bulan
CREATE TABLE IF NOT EXISTS usage_counters (
  tenant_id TEXT NOT NULL,
  period TEXT NOT NULL,
  chat_count INTEGER DEFAULT 0,
  agent_count INTEGER DEFAULT 0,
  swarm_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0.0,
  PRIMARY KEY (tenant_id, period)
);

-- Billing events
CREATE TABLE IF NOT EXISTS billing_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  amount_usd REAL,
  metadata TEXT,
  ts INTEGER DEFAULT (unixepoch())
);

-- Plan definitions
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_usd REAL NOT NULL,
  monthly_chat_quota INTEGER,
  monthly_agent_quota INTEGER,
  monthly_swarm_quota INTEGER,
  rate_per_min INTEGER DEFAULT 60,
  features TEXT
);

INSERT OR IGNORE INTO plans VALUES
  ('free','Free',0,100,0,0,10,'chat'),
  ('starter','Starter',29,10000,1000,100,60,'chat,agent'),
  ('pro','Pro',149,100000,20000,5000,300,'chat,agent,swarm,webhooks'),
  ('enterprise','Enterprise',0,-1,-1,-1,1000,'all');
