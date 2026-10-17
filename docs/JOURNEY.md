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

## Mission-Critical Patterns (2026-10-15)
Extracted from private MDSI repo (sanitized). Generic reusable patterns:
1. Multi-echelon scaling (Tier-1/2/3)
2. SHA-256 hash-chain audit ledger
3. Two-person cryptographic HITL gate
4. DDIL mesh autonomy
5. RK4 + proportional navigation physics
6. Radar burn-through (J/S ratio)
7. Entity-link ontology graph
8. Sensor-to-shooter pairing
9. Multi-modal command router

Location: corpus/sectors/defense-patterns/


---

## 2026-10-16 — Corpus-Driven Refactor + 2 Quality Gates

**Fasa:** Swarm-only. Overlord + Omni cron disabled.

### Perubahan Utama
- Swarm output: CODING_GRIMOIRE.md → corpus/sectors/<sector>/epoch-<N>-*.md
- Tambah pickSectorForTopic: keyword → sector auto-routing
- Tambah GATE 1 (commit gate): skip jika fallback / v1==v2 / sandbox-critical
- Tambah GATE 2 (cycle gate): skip jika topik tak match sektor
- Tambah flag v2UsedAI pada invokeAgentBrain (4 return paths)
- Overlord + Omni cron disabled (src/index.js line 412-413, // [DISABLED-BY-SIR])
- Corpus: 16 sectors, 55+ fail, index.json v1.0.0

### Ujian Live (2026-10-16)
- Epoch 67: topic test-quality-gate → unified-core, commit OK (GATE 1 lulus)
- Epoch 68: topic xyz-random-abc → skipped, reason no_sector_match (GATE 2 lulus)
- Epoch 69: topic RAG vector → ai-ml, commit OK (routing lulus)

### Deploy Terkini
- Version ID: bb27705b-0d69-4c0d-8adb-08965892e603
- Cron: */15 * * * *
- Live: https://argon.vmojuga.workers.dev

---

## 2026-10-16 (Later) — IDEA: BorneoAI-1 (LoRA + Encoder)

**Status:** BACKLOG (bukan buat sekarang)

### Konsep
- Base model kecil (Phi-3 mini / Qwen2-0.5B / TinyLlama) + LoRA adapter khusus domain autocode.
- Guna encoder (quantization 4-bit) untuk kecikkan lagi saiz model.
- 500MB-1GB model, perform macam 7B untuk task autocode spesifik.

### Kenapa Ini Logik
- Corpus Swarm sekarang mengumpul 1 sample SFT / epoch (setiap 15 minit).
- Quality gate lulus = sample berkualiti tinggi (bukan fallback template).
- 3 bulan × 96 epoch/hari × 90% lulus ≈ 7,700 sample.
- Cukup untuk LoRA fine-tune on top of base model.

### Roadmap (Rough)
1. NOW — Guna Workers AI (serverless) + corpus accumulate.
2. FASA 2 — Export corpus ke format OpenAI JSONL (messages role system/user/assistant).
3. FASA 3 — LoRA fine-tune + 4-bit quantize, deploy model sendiri.
4. FASA 4 — Brand 'BorneoAI-1' + monetize (API, on-premise, edge bundle).

### Kenapa Penting
- Kurangkan dependency Workers AI (cost + rate limit).
- Boleh deploy on-premise (enterprise Malaysia mahukan data sovereignty).
- Corpus = asset, bukan sampah.

### Nota
- Base64 ≠ compression (jangan confuse).
- Realiti: quantization 8× kecil, distillation 10-20× kecil, LoRA adapter 100-1000× kecil dari base.
- LoRA training: 1-3 jam GPU (RTX 4090 atau A100 cloud).

### FLYWHEEL (2026-10-16 Update)

SIR punya insight: Swarm bukan cuma generate kod — ia DATA ENGINE.

Loop:
1. Feed production-grade code (repo luar) ke corpus sebagai input mentah.
2. Swarm bakar → kod baru (7-ejen kritik + optimize).
3. Quality gate lulus → corpus bertambah.
4. Corpus = dataset SFT untuk LoRA fine-tune.
5. Fine-tune Qwen kecil + quantize = model autocode sendiri.
6. Deploy model → serve customer → loop semula.

Target: 1 minggu untuk corpus cukup kaya (bukan 3 bulan).

Moat: DATA. Kompetitor boleh clone API, tapi tak boleh clone evolusi corpus.

---
## 2026-10-17 — BorneoAI Rebrand & Core Completion
- **Theme**: Ditukar sepenuhnya kepada Dolphin Cyan (Biru) dari Emerald.
- **Background**: Gambar Dolphin dijadikan background di Landing, Login, Signup, dan App.
- **Chat**: UI direka semula mengikut gaya Cloudflare AI (input sticky di bawah, suggestion cards).
- **Auth**: Google OAuth berjaya di-wire (tiada prompt berulang).
- **Landing**: Butang Baobao terapung ditukar kepada Widget FAQ.
- **Ops**: Sistem auto-deploy GitHub Actions disahkan berfungsi.
- **Fixes**: Isu `invalid json` pada API Chat diselesaikan dengan bypass fungsi `handleChat` dan panggil `env.AI.run` terus.

---
## 2026-10-17 (Malam) — Stripe Billing Integration Complete
- **Stripe Checkout**: User boleh klik Upgrade Plan di dashboard, dan sistem akan auto-generate Stripe Checkout URL.
- **Webhook Security**: Endpoint `/api/stripe/webhook` dilindungi dengan HMAC SHA-256 signature verification. Hanya Stripe yang sah boleh trigger plan upgrade.
- **Database Auto-Update**: Bila payment berjaya, webhook akan auto-update `plan` customer di D1 database.
- **UI Update**: Butang Upgrade di dashboard bertukar ke Stripe Checkout. Selepas berjaya, user dibawa ke `/app/billing?success=true` dengan mesej terima kasih.
- **Secrets Configured**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.

---
## 2026-10-17 (Late Night) — The "Gold Mine" Documentation
- **Comprehensive Lessons Learned**: Kesemua kegagalan (1101, Invalid JSON, Regex Trap, OAuth Consent, Stripe DBA) dan kejayaan (Stripe Webhook Security, UI Vercel-style, Swarm Quality Gates) telah didokumenkan ke dalam `corpus/sectors/production-infra/gold-mine-lessons-2026.md`.
- **Purpose**: Menjadi rujukan utama untuk Swarm semasa generate kod baru supaya tak ulang silap yang sama, dan rujukan untuk AI masa depan.
