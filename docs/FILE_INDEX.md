# FILE INDEX — Argon

> Semua fail penting + purpose. Update bila tambah fail baru.

---

## Root
| File | Purpose |
|:---|:---|
| `wrangler.toml` | Cloudflare bindings (AI, D1, KV, R2, DO, cron) |
| `package.json` | npm scripts + wrangler devDependency |
| `BLUEPRINT.md` | Master technical doc (gabungan 8 parts) |
| `BLUEPRINT.md.bak` | Backup lama |
| `.gitignore` | Ignore node_modules, .wrangler, .dev.vars |

## `src/` — Worker source
| File | Purpose |
|:---|:---|
| `src/index.js` | Entry + routing + auth + CORS |
| `src/swarm.js` | SwarmBrain DO (7-agent loop) |
| `src/overlord.js` | OverlordSeniorDev DO (Tier-1 auto-dev) |
| `src/api/chat.js` | POST /api/chat handler |
| `src/api/agent.js` | POST /api/agent (tool-calling) |
| `src/auth/apikey.js` | validateApiKey + validateBasicAuth |
| `src/saas/tenant.js` | Tenant CRUD, quota, usage |
| `src/saas/signup.js` | Signup, /api/me, rotate/revoke |
| `src/saas/ratelimit.js` | KV sliding window |
| `src/saas/webhooks.js` | Register, dispatch, HMAC |
| `src/admin/stats.js` | Admin observability |
| `src/admin/recover.js` | Admin rotate tenant key |
| `src/tools/recon.js` | Recon engine (JS port) |
| `src/web/landing.js` | Landing + chat UI |
| `src/web/swarm-ui.js` | Swarm dashboard SSE |
| `src/web/dashboard.js` | Customer self-service |
| `src/web/docs.js` | Public API docs |
| `src/web/overlord-ui.js` | Overlord command center |

## `migrations/`
| File | Purpose |
|:---|:---|
| `0001_init.sql` | api_keys, sessions, messages, audit_log |
| `0002_saas.sql` | tenants, tenant_api_keys, usage, plans |
| `0003_top_tier.sql` | webhooks, idempotency, tenant_audit |

## `docs/`
| File | Purpose |
|:---|:---|
| `BLUEPRINT_01_overview.md` | Platform, URLs, file structure |
| `BLUEPRINT_02_endpoints.md` | Public + Basic Auth endpoints |
| `BLUEPRINT_02b_overlord_endpoints.md` | Overlord endpoints + guardrails |
| `BLUEPRINT_03_billing.md` | Tier matrix, economics |
| `BLUEPRINT_04_bugs.md` | Bug log (#001-#010) |
| `BLUEPRINT_05_lessons.md` | Lessons learned + credential matrix |
| `BLUEPRINT_06_roadmap.md` | 4 fasa roadmap |
| `BLUEPRINT_07_tools.md` | C++ engine, Python recon |
| `BLUEPRINT_08_overlord.md` | Overlord full doc |
| `JOURNEY.md` | Status + roadmap + decisions + quick ref |
| `CHANGELOG.md` | Kronologi semua perubahan |
| `SESSION_LOG.md` | Log setiap sesi |
| `DECISIONS.md` | Decision log (tech + business + ops) |
| `ENVIRONMENT.md` | Inventory resource CF |
| `RECOVERY.md` | Rebuild dari zero |
| `FILE_INDEX.md` | Fail ini |

## `scripts/`
| File | Purpose |
|:---|:---|
| `creds.sh` | Central credential loader + argon_* helpers |

## `tools/native/`
| File | Purpose |
|:---|:---|
| `nexus_core.cpp` | C++ native expert engine source |
| `nexus_core` | Compiled binary (27KB) |

## `tools/recon/`
| File | Purpose |
|:---|:---|
| `recon_engine.py` | Python reverse engineering (FastAPI) |

## `/root/.argon-secrets/`
| File | Isi |
|:---|:---|
| `admin.key` | Legacy admin API key |
| `tenant.key` | Tenant API key |
| `tenant.id` | Tenant ID |
| `tenant.email` | Tenant email |
| `basic.full` | argon:password |
| `basic.user` | Username |
| `basic.pass` | Password |
| `README.txt` | Panduan |

## External files
| Path | Purpose |
|:---|:---|
| `/root/.cf-key` | Cloudflare API token |
| `/root/.argon-api-key` | Legacy (deprecated, guna .argon-secrets/) |
| `/root/.argon-basic-auth` | Legacy (deprecated) |

## Deprecated (simpan untuk history)
| File | Guna |
|:---|:---|
| `src/index.js.bak_ov` | Backup sebelum Overlord wire |
| `src/overlord.js.bak` | Backup sebelum watchdog patch |
| `src/overlord.js.bak2` | Backup sebelum repo routing fix |
| `wrangler.toml.bak*` | Backup wrangler config |

## `corpus/`
| File | Purpose |
|:---|:---|
| `corpus/index.json` | Agent query interface |
| `corpus/README.md` | Explanation |
| `corpus/anthropic/_metadata/manifest.json` | 5 modules metadata |
| `corpus/anthropic/001-signature/*` | Stripe signature verify |
| `corpus/anthropic/002-idempotency/*` | Idempotent webhook |
| `corpus/anthropic/003-entitlement/*` | Subscription state machine |
| `corpus/anthropic/004-ordering/*` | CAS ordering |
| `corpus/anthropic/005-pricing/*` | Tiered pricing |
| `corpus/qwen/_metadata/manifest.json` | 3 files metadata |
| `corpus/qwen/stack/backend/src/schema.ts` | Drizzle schema |
| `corpus/qwen/stack/backend/src/index.ts` | Hono server |
| `corpus/qwen/stack/frontend/app/page.tsx` | Next.js dashboard |
