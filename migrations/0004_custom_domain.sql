ALTER TABLE tenants ADD COLUMN custom_domain TEXT;
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(custom_domain);
