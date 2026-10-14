
---

## Overlord Endpoints (Tier-1 Senior Dev)
| Method | Path | Auth | Fungsi |
|:---|:---|:---|:---|
| GET | /overlord-ui | Basic Auth | Command center UI (browser) |
| GET | /overlord/report?q=... | X-API-Key | Executive report instant |
| POST | /overlord/command | X-API-Key | Build + deploy + commit 1 task |
| POST | /overlord/maintain | X-API-Key | Force watchdog sweep |
| POST | /overlord/topics | X-API-Key | Update focus topics R&D |

## Overlord Flow
    POST /overlord/command {"directive":"...","slug":"argon-app-xyz"}
      ↓
    1. LLM (llama-4-scout) generate full Worker ES Module code
    2. Audit (breaker pattern check)
    3. PUT ke Cloudflare Workers API (deploy)
    4. Commit ke GitHub repo Argon (docs/swarm-output/<slug>/)
    5. Register ke watchdog (auto-heal 6 jam)

## Safety Guardrails (CRITICAL)
- Slug wajib prefix `argon-app-` (tak boleh deploy over `argon` production)
- PROTECTED_SLUGS = {`argon`, `nexus-swarm`, `argon-test`}
- CF_API_TOKEN disimpan sebagai secret Cloudflare
- Fallback ke SIMULATED_SANDBOX kalau CF_API_TOKEN belum set

## Watchdog (Cron 0 */6 * * *)
- Health check setiap servis yang diregister
- HTTP 530 = skip (propagasi, bukan gagal)
- Auto-redeploy kalau HTTP 5xx sebenar
- Auto-tulis Grimoire (topic R&D rotation)
