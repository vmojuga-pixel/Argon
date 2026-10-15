# ARGON — JOURNEY & ROADMAP

> Dokumen hidup. Update bila ada milestone baru atau keputusan penting.
> Last update: 2026-10-15

---

## 1. STATUS SEKARANG (2026-10-15)

**Fasa:** MVP+ Live — sedia untuk pelanggan pertama (belum monetize)

**Apa yang live:**
- Chat API (Workers AI llama-4-scout)
- Agent API (tool-calling loop)
- Swarm API (7-agent autonomous, cron 15min)
- Recon API (static analysis + code reconstruction)
- SaaS layer (tenant, quota, rate limit, webhooks)
- Dashboard, Docs, Admin observability
- Auto-commit ke GitHub (CODING_GRIMOIRE.md)
- C++ native engine (nexus_core, 27KB binary)

**URL production:**
- Worker: https://argon.vmojuga.workers.dev
- Repo: https://github.com/vmojuga-pixel/Argon
- Grimoire: https://github.com/vmojuga-pixel/buku-koding-agentic

**Credentials:** /root/.argon-secrets/ (admin.key, tenant.key, basic.full)
**Helper:** source /root/Argon/scripts/creds.sh

---

## 2. FASA ROADMAP

### FASA 1 — FOUNDATION (SELESAI ✅)
| Feature | Status | Nota |
|:---|:---|:---|
| Worker + routing | ✅ | edge, global |
| Chat + Agent + Swarm | ✅ | 3 produk utama |
| Multi-tenant SaaS | ✅ | signup, key, quota |
| Rate limit per-tier | ✅ | KV sliding window |
| Webhooks + HMAC | ✅ | 5 event types |
| Dashboard + Docs | ✅ | /dashboard, /docs |
| Admin observability | ✅ | /admin/stats |
| Audit log | ✅ | tenant_audit table |
| Recon engine | ✅ | /recon, /api/recon |
| C++ native engine | ✅ | tools/native/nexus_core |
| Auto Git commit | ✅ | Grimoire |
| BLUEPRINT.md | ✅ | 7 parts |
| Credentials registry | ✅ | scripts/creds.sh |

### FASA 2 — MONETIZATION (NEXT, prioriti tinggi)
| # | Feature | Effort | Kenapa penting |
|:---|:---|:---|:---|
| 2.1 | Stripe billing | 2 sesi | Tanpa ini tak boleh scale |
| 2.2 | SDK npm (@argon/sdk) | 1 sesi | Dev tak guna API tanpa SDK |
| 2.3 | SDK Python (argon-sdk) | 1 sesi | Python = dev AI utama |
| 2.4 | OpenAPI 3.1 spec | 30 min | Auto-gen SDK, Postman |
| 2.5 | Landing page public | 1 sesi | Marketing page (bukan dashboard) |
| 2.6 | Pricing page + checkout | 1 sesi | Convert visitor → customer |
| 2.7 | Email onboarding | 1 sesi | Welcome + docs + activation |
| 2.8 | Usage chart dashboard | 1 sesi | Retention (customer nampak value) |

**Estimasi Fasa 2:** ~8 sesi (2-3 hari kerja fokus)

**Keputusan dibuat:**
- Stripe > Paddle (lebih mature, more devs tahu)
- npm + PyPI (bukan SDK lain) — 90% market
- Landing page proper (bukan cuma /dashboard)

### FASA 3 — SCALE (Selepas 10+ customer)
| # | Feature | Nota |
|:---|:---|:---|
| 3.1 | Custom domain per tenant | Cloudflare for SaaS |
| 3.2 | SSO (Google/GitHub OAuth) | Enterprise requirement |
| 3.3 | Team management | Multi-user per tenant |
| 3.4 | Billing history + invoice PDF | Untuk accounting customer |
| 3.5 | Slack/Discord alerts (admin) | Monitor bila SIR takde |
| 3.6 | Status page + SLA monitoring | Trust & transparency |
| 3.7 | Overage billing | Auto-charge lepas quota |
| 3.8 | Backup automation (D1 weekly) | Data safety |

**Trigger untuk masuk Fasa 3:** 10 paying customer atau revenue $500/mo

### FASA 4 — ECOSYSTEM (Bila profitable)
| # | Feature | Nota |
|:---|:---|:---|
| 4.1 | Marketplace (prompt templates, agent workflows) | 30% revenue cut |
| 4.2 | White-label (reseller boleh rebrand) | B2B2B channel |
| 4.3 | On-prem deploy (Docker image) | Enterprise sales |
| 4.4 | Marketplace SDK | Publisher boleh jual |
| 4.5 | Advanced swarm (parallel agents, custom roles) | Premium tier |
| 4.6 | Fine-tuning pipeline (custom model per tenant) | Ultra premium |

**Trigger untuk masuk Fasa 4:** $5K MRR atau 50+ paying customer

---

## 3. KEPUTUSAN PENTING (Log)

| Tarikh | Keputusan | Sebab |
|:---|:---|:---|
| 2026-10-14 | Cloudflare Workers (bukan VPS) | Edge global, zero ops, D1/KV/R2 |
| 2026-10-14 | Workers AI (bukan OpenAI) | Murah, edge, no external API |
| 2026-10-15 | Model: llama-4-scout-17b | llama-3.1-8b dah deprecated |
| 2026-10-15 | Durable Objects untuk swarm | Stateful, persistent across cron |
| 2026-10-15 | Cron 15min (bukan 6jam) | Lebih banyak content generation |
| 2026-10-15 | Revoke by key_id (bukan prefix) | Bug #004 prevention |
| 2026-10-15 | Basic Auth + X-API-Key (dual) | UI pakai basic, API pakai key |
| 2026-10-15 | C++ native engine | Deterministik hot path, <50KB |
| 2026-10-15 | Recon engine dual (Python + JS) | Python local dev, JS di CF edge |
| — | Stripe (bukan Paddle) | TBD bila ready |
| — | npm + PyPI SDK | TBD Fasa 2 |
| — | 4 tier: Free/Starter/Pro/Enterprise | Locked |

---

## 4. OPEN QUESTIONS (Perlu Putuskan Kemudian)

- [ ] Harga final: $29/$149 tetap atau adjust?
- [ ] Overage pricing: charge auto atau hard cut?
- [ ] SLA tiers: response time commitment?
- [ ] Data residency: restrict region untuk EU customers?
- [ ] ToS/Privacy: perlu lawyer atau guna template?
- [ ] Entity: SSM atau Enterprise (untuk invoice + tax)?
- [ ] Support channel: email, Discord, atau Intercom?
- [ ] Enterprise pricing: fixed atau custom quote?

---

## 5. QUICK REFERENCE (bila lupa lepas rehat)

### URLs
- Dashboard: https://argon.vmojuga.workers.dev/dashboard
- Docs: https://argon.vmojuga.workers.dev/docs
- Swarm UI: https://argon.vmojuga.workers.dev/swarm
- Recon UI: https://argon.vmojuga.workers.dev/recon
- Admin: https://argon.vmojuga.workers.dev/admin/stats

### Cara guna API (dari terminal)
    source /root/Argon/scripts/creds.sh
    argon_chat "hello"           # chat
    argon_agent "run date"       # agent
    argon_swarm_evolve "topic"   # trigger swarm
    argon_me                     # tenant info
    argon_admin_stats            # admin view

### Credentials
    cat /root/.argon-secrets/basic.full   # argon:password
    cat /root/.argon-secrets/admin.key    # argon_xxx
    cat /root/.argon-secrets/tenant.key   # arg_tn_xxx

### Deploy
    export CLOUDFLARE_API_TOKEN=$(cat /root/.cf-key)
    cd /root/Argon && npx wrangler deploy

### Deploy ulang dari zero (kalau VPS reset)
    1. git clone https://github.com/vmojuga-pixel/Argon
    2. cd Argon && npm install
    3. Set secrets: GITHUB_TOKEN, BASIC_AUTH_USER, BASIC_AUTH_PASS
    4. npx wrangler deploy
    5. npx wrangler d1 execute argon-db --remote --file=./migrations/0001_init.sql
    6. (repeat untuk 0002, 0003)
    7. Recreate tenants + keys via /signup

### File penting
- /root/Argon/src/index.js — entry + routing
- /root/Argon/src/swarm.js — swarm DO
- /root/Argon/BLUEPRINT.md — full technical doc
- /root/Argon/docs/JOURNEY.md — dokumen ini
- /root/Argon/scripts/creds.sh — credential loader
- /root/.argon-secrets/ — semua credentials

### Test cepat (kalau rasa ada yang down)
    source /root/Argon/scripts/creds.sh
    argon_health && echo "OK"
    argon_me | python3 -c "import sys,json; print('tenant OK:', json.load(sys.stdin)['tenant']['email'])"

---

## 6. OVERLORD TIER-1 SENIOR DEV (2026-10-15)

**Apa:** Durable Object baru `OverlordSeniorDev` — integrate sebagai `/overlord/*` di atas Swarm sedia ada.

**Endpoint:**
| Method | Path | Fungsi |
|:---|:---|:---|
| GET | `/overlord/report?q=...` | Laporan eksekutif segera |
| POST | `/overlord/command` | Bina + deploy + commit 1 task |
| POST | `/overlord/maintain` | Force kitaran 24/7 sweep |
| POST | `/overlord/topics` | Update focus topics R&D |

**Safety guardrails (CRITICAL):**
- Slug wajib prefix `argon-app-` (tidak boleh deploy over `argon` production)
- `PROTECTED_SLUGS` = {`argon`, `nexus-swarm`} — tak boleh overwrite
- CF_API_TOKEN disimpan sebagai secret (bukan env var)
- Fallback ke SIMULATED_SANDBOX kalau CF_API_TOKEN belum set (tak crash)

**Secrets baru:**
- CF_ACCOUNT_ID (untuk deploy)
- CF_API_TOKEN (Workers Scripts:Edit) — SIR kena generate sendiri
- CF_SUBDOMAIN (default: vmojuga)

**Cron:** Setiap tick (15 min) → Overlord maintain + Swarm evolve (parallel)

**Known limitation:**
- Overlord tidak boleh deploy kalau CF_API_TOKEN belum set
- Swarm + Overlord concurrent boleh consume Workers AI Neurons cepat (monitor)
- Generated code ada risk (jarang, tapi boleh) — semua deploy di-tag `argon-app-*` untuk isolasi

---

## 7. BUG FIX LOG (2026-10-15)

### Bug #008 — DO env var cache
- Simptom: `GITHUB_REPO_OVERLORD` env baru tak load lepas deploy
- Punca: Durable Object instance cached env lama
- Fix: Tukar `idFromName('GLOBAL_SENIOR_DEV_OVERLORD')` → `_V2`
- Sampingan: Services count 0 dalam V2 (storage baru kosong)

### Bug #009 — Overlord commit ke repo salah
- Simptom: File masuk `buku-koding-agentic` (grimoire) bukan `Argon`
- Punca: Satu env `GITHUB_REPO` untuk 2 tujuan
- Fix: Pisahkan `GITHUB_REPO` (grimoire) + `GITHUB_REPO_OVERLORD` (Argon)

### Bug #010 — Watchdog self-heal salah HTTP 530
- Simptom: Worker sihat kena redeploy (overwrite)
- Punca: Propagasi `*.workers.dev` lambat → 530 temporary
- Fix: `SKIP_530_PROPAGATING` — jangan heal kalau 530

### Deferred — Email onboarding
- Status: code ready, service activation skipped
- Reason: CF Email Sending masih public beta + workers.dev tak eligible
- To enable later:
  1. Dashboard → Compute & AI → Email → Email Sending
  2. Onboard northerncoastgroup.com
  3. Set EMAIL_FROM
  4. OR: set RESEND_API_KEY (5 min)
