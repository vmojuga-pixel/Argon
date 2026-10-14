# RECOVERY GUIDE — Argon

> Kalau VPS reset, hilang server, atau nak redeploy dari zero.

---

## Prerequisites
- Cloudflare account (id: 695a620ee3223aa69b69b1e48eb91962)
- GitHub account: vmojuga-pixel
- gh CLI authenticated
- CF API token (simpan dalam /root/.cf-key)

## 1. Clone repo
    cd /root
    git clone https://github.com/vmojuga-pixel/Argon
    cd Argon
    npm install

## 2. Install wrangler
    npm install --save-dev wrangler@latest
    npx wrangler --version

## 3. Verify D1/KV/R2 (existing resources)
    export CLOUDFLARE_API_TOKEN=$(cat /root/.cf-key)
    npx wrangler d1 list
    npx wrangler kv namespace list
    npx wrangler r2 bucket list

Kalau resources hilang, recreate (pastikan update wrangler.toml dengan ID baru):
    npx wrangler d1 create argon-db
    npx wrangler kv namespace create argon-kv
    npx wrangler r2 bucket create argon-audit

## 4. Apply migrations (kalau DB fresh)
    npx wrangler d1 execute argon-db --remote --file=./migrations/0001_init.sql
    npx wrangler d1 execute argon-db --remote --file=./migrations/0002_saas.sql
    npx wrangler d1 execute argon-db --remote --file=./migrations/0003_top_tier.sql

## 5. Set secrets
    gh auth token > /tmp/ght
    npx wrangler secret put GITHUB_TOKEN < /tmp/ght
    rm /tmp/ght

    echo "argon" | npx wrangler secret put BASIC_AUTH_USER
    echo "NEW_PASSWORD" | npx wrangler secret put BASIC_AUTH_PASS

    echo "695a620ee3223aa69b69b1e48eb91962" | npx wrangler secret put CF_ACCOUNT_ID
    cat /root/.cf-key | npx wrangler secret put CF_API_TOKEN
    echo "vmojuga" | npx wrangler secret put CF_SUBDOMAIN

## 6. Deploy
    npx wrangler deploy

## 7. Recreate admin API key
    ADMIN_KEY="argon_$(openssl rand -hex 32)"
    npx wrangler d1 execute argon-db --remote --command="INSERT INTO api_keys (key,label,active) VALUES ('$ADMIN_KEY','admin-root',1);"

    mkdir -p /root/.argon-secrets && chmod 700 /root/.argon-secrets
    echo "$ADMIN_KEY" > /root/.argon-secrets/admin.key
    chmod 600 /root/.argon-secrets/admin.key

## 8. Recreate tenant (kalau perlu)
    curl -X POST https://argon.vmojuga.workers.dev/signup \
      -H "Content-Type: application/json" \
      -d '{"email":"owner@vmojuga.dev","plan":"enterprise"}'

Simpan key + tenant ID dalam /root/.argon-secrets/:
    echo "TENANT_KEY" > /root/.argon-secrets/tenant.key
    echo "TENANT_ID" > /root/.argon-secrets/tenant.id
    echo "owner@vmojuga.dev" > /root/.argon-secrets/tenant.email

## 9. Recreate basic auth
    echo "argon:PASSWORD" > /root/.argon-secrets/basic.full
    chmod 600 /root/.argon-secrets/basic.full

## 10. Recreate creds.sh helper
    git pull  # ambil dari repo
    chmod +x scripts/creds.sh
    source scripts/creds.sh
    argon_health

## 11. Verify semua endpoint
    source scripts/creds.sh
    curl -s "$ARGON_URL/api/health"
    argon_me
    argon_chat "hello"
    curl -s -u "$ARGON_BASIC" "$ARGON_URL/admin/stats"

---

## Fail yang TIDAK BOLEH di-recover (kena recreate):
- **Durable Object storage** — kalau DO baru, swarm history + managed_services hilang. Boleh recreate dengan panggil `/swarm/evolve` + `/overlord/command`.
- **GitHub repo kalau kena delete** — clone dari backup lain.

## Fail yang BOLEH di-recover:
- Source code: dari GitHub
- D1 data: dari `wrangler d1 export` backup (kalau ada)
- R2 audit logs: dari R2 (kalau ada backup)
- Cloudflare secrets: recreate manual
- Credentials: recreate via signup + rotate

## Backup recommendation
- **Weekly**: `npx wrangler d1 export argon-db --remote --output=backup-$(date +%Y%m%d).sql`
- **Daily**: GitHub auto-commit (Swarm Scribe + Overlord)
- **Monthly**: Manual review of ENVIRONMENT.md
