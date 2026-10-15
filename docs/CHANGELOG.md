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

### [FEAT] Training corpus (agentic reference)
- corpus/anthropic/billing/ — 5 billing modules + 33 tests
- corpus/qwen/stack/ — Hono + Drizzle + Next.js boilerplate
- corpus/index.json — agent query interface
- BLUEPRINT_09_corpus.md — documentation

### [FEAT] Corpus expansion (auth + qwen extension)
- anthropic/auth/ — 5 auth modules, 49 tests
- qwen/stack/ — drizzle config, db pool, secure key gen, stripe routes, topup UI
- Fixed bug: Qwen stripe.ts invalid Drizzle increment → sql`` pattern

### [FEAT] Omni-Overlord auto-create repo + dynamic allowlist
- repoAllowed() → async: env namespace prefix + env extra + DO storage
- ensureRepoExists() — auto-create repo via GitHub API kalau belum ada
- addRepoToAllowlist() — register repo baru dalam DO storage
- New routes: /omni/repos, /omni/repos/register, /omni/repos/ensure
- Guardrail: repo wajib prefix owner namespace (vmojuga-pixel/*)

### [VERIFIED] Omni-Overlord auto-create repo — 2026-10-15
- Test: vmojuga-pixel/omni-autobuild-7001
- Result: repo created + 5 files committed + LIVE_E2E deploy
- Auto-deploy URL: https://autocreate-7001.vmojuga.workers.dev
- Guardrail verified: reject other-user/* namespace
- API: /omni/repos, /omni/repos/register, /omni/repos/ensure

### [FEAT] Enterprise AI/ML sectors (job market scan)
- tools/sectors/enterprise_ai_sectors_grimoire.py — 3 classes:
  - EnterpriseRAGAndGuardrailEngine (AI Engineer RM10k)
  - ForwardDeployedIVABridge (Forward-Deployed AI Engineer RM8-12k)
  - AutomatedMLPipelineEngine (ML Engineer RM8-11k)
- corpus/sectors/ — mirror + metadata
- 6 ENTERPRISE_SECTOR_TOPICS wired to Overlord focus_topics
- Context: extracted from 10 job ad screenshots Malaysia
