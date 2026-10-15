
# ARGON — BLUEPRINT (Part 8: Overlord Tier-1 Senior Dev)

## Ringkasan
`OverlordSeniorDev` = Durable Object yang menggabungkan code generation + Cloudflare Workers Deployment API + GitHub Contents API + 24/7 watchdog. Di atas Swarm sedia ada.

## Kapabiliti
| # | Feature | Implementasi |
|:---|:---|:---|
| 1 | Auto-code generation | Workers AI (llama-4-scout-17b) |
| 2 | Auto-deploy ke CF Edge | PUT /accounts/{id}/workers/scripts/{name} |
| 3 | Auto-commit GitHub | PUT /repos/{owner}/{repo}/contents/{path} |
| 4 | 24/7 watchdog | Cron `0 */6 * * *` + SKIP_530 guardrail |
| 5 | Executive report | /overlord/report |
| 6 | Command center UI | /overlord-ui (Basic Auth) |
| 7 | Deterministic fallback | Kalau LLM down, guna `deterministicCodeGenerator` |

## Fail
- Backend: `src/overlord.js` (class OverlordSeniorDev)
- UI: `src/web/overlord-ui.js`
- Wiring: `src/index.js` (import + route `/overlord/*` + cron)
- Binding: `wrangler.toml` (OVERLORD_BRAIN DO + migration v2)

## Secrets (Cloudflare)
| Secret | Value | Purpose |
|:---|:---|:---|
| CF_ACCOUNT_ID | 695a620ee3223aa69b69b1e48eb91962 | Deploy target |
| CF_API_TOKEN | (root/.cf-key) | Workers Scripts:Edit |
| CF_SUBDOMAIN | vmojuga | Subdomain suffix |
| GITHUB_TOKEN | (gh auth token) | Commit ke repo |
| GITHUB_REPO | vmojuga-pixel/buku-koding-agentic | Grimoire (Swarm Scribe) |
| GITHUB_REPO_OVERLORD | vmojuga-pixel/Argon | Overlord output |

## Flow (from SIR command to live worker)
    1. SIR taip directive dalam /overlord-ui
    2. POST /overlord/command → Overlord DO
    3. LLM generate full Worker code
    4. Audit (breaker pattern)
    5. PUT CF API → worker live di https://<slug>.vmojuga.workers.dev
    6. Commit ke repo Argon (docs/swarm-output/<slug>/worker.js + README.md)
    7. Register ke watchdog managed_services list
    8. Setiap 6 jam: health check, auto-heal kalau rosak

## Safety Layers
- Slug prefix: `argon-app-*` (wajib)
- Protected: {argon, nexus-swarm, argon-test}
- Concurrent: max ~3 deploys serentak (Workers API rate limit)
- Rollback: `lastStableCode` disimpan dalam DO storage
- Isolasi: worker baru tak boleh access env Argon production

## Known Limitations
- Model deprecated boleh break (guard: fallback deterministic)
- CF API rate limit (1200 req/5min)
- DO storage limit (128 KB per key) — untuk lastStableCode panjang
- Workers AI Neuron budget (monitor kalau cron 15min)
- Webhook signature verification hanya kalau customer register

## Auto-Create Repo — 2026-10-15
- Repo default allowlist: prefix `vmojuga-pixel/*` (SIR's namespace)
- Extra allowlist: env `OMNI_ALLOWED_REPOS` + DO storage `extra_allowlist`
- Auto-create: `ensureRepoExists()` — check via API, create if 404
- Endpoints:
  - GET /omni/repos — list allowlist
  - POST /omni/repos/register — add repo to dynamic allowlist
  - POST /omni/repos/ensure — create repo if missing
- Guardrail: reject repo di luar owner namespace
