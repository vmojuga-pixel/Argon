# CHANGELOG — Argon

> Kronologi semua perubahan penting. Format: [YYYY-MM-DD] [Kategori] Perubahan

---

## 2026-10-14

### [INIT] Argon project created
- Setup Cloudflare Worker + Wrangler
- Bindings: AI, D1 (argon-db), KV (argon-kv), R2 (argon-audit)
- Chat endpoint `/api/chat` (Workers AI llama-3.1-8b)
- Agent endpoint `/api/agent` (tool-calling loop)
- Landing page `/` (Tailwind dark)

### [BUG] Model deprecated
- llama-3.1-8b-instruct retired (5028 error)
- Fix: migrate to llama-4-scout-17b-16e-instruct

### [FEAT] Swarm integration
- SwarmBrain Durable Object (7-agent loop)
- `/swarm/evolve`, `/swarm/state`
- Cron every 15min
- Auto-commit ke GitHub Grimoire

### [FEAT] SaaS layer
- Multi-tenant (tenants, tenant_api_keys tables)
- Signup endpoint, quota tracking, rate limit
- Plans: Free/Starter/Pro/Enterprise

### [FEAT] Recon engine
- Python `recon_engine.py` (FastAPI)
- JS port `src/tools/recon.js`
- `/recon` UI + `/api/recon` endpoint
- C++ native engine `tools/native/nexus_core.cpp`

---

## 2026-10-15

### [FEAT] Overlord Tier-1 Senior Dev
- OverlordSeniorDev Durable Object
- `/overlord/command` — build + deploy + commit
- `/overlord/report` — executive report
- `/overlord/maintain` — watchdog sweep
- `/overlord-ui` — command center UI
- CF Workers Deployment API integration
- GitHub multi-file commit

### [FEAT] Dashboard + Docs
- `/dashboard` — customer self-service
- `/docs` — public API documentation

### [FEAT] Admin + Observability
- `/admin/stats`, `/admin/tenants`, `/admin/usage`
- `/admin/rotate-tenant-key` (recovery)

### [BUG] #004 Revoke by prefix revoke semua key
- Fix: revoke by key_id, exclude current
- validateTenantKey return keyId

### [BUG] #008 DO env var cache
- Fix: force DO V2 reset

### [BUG] #009 Overlord commit ke repo salah
- Fix: separate GITHUB_REPO_OVERLORD env

### [BUG] #010 Watchdog salah heal HTTP 530
- Fix: SKIP_530_PROPAGATING guardrail

### [DOCS] BLUEPRINT + JOURNEY complete
- 8 parts BLUEPRINT
- JOURNEY with roadmap + decisions
- Credentials registry (scripts/creds.sh)
