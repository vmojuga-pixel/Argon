# ARGON — BLUEPRINT (Part 4: Bug Log)

## Bug #001 — Model deprecated
- Tarikh: 2026-10-14
- Simptom: /api/chat return "AiError 5028: deprecated on 2026-05-30"
- Punca: llama-3.1-8b-instruct retired
- Fix: guna @cf/meta/llama-4-scout-17b-16e-instruct
- Pelajaran: selalu cek model catalog sebelum deploy

## Bug #002 — Swarm cycle lambat 67s
- Tarikh: 2026-10-15
- Simptom: /swarm/evolve 65-67s
- Punca: 6 AI calls sequential, max_tokens 1024, prompt panjang
- Fix: max_tokens 250, directive "JAWAPAN WAJIB RINGKAS", temp 0.3
- Hasil: 67s → 32s

## Bug #003 — Tenant key collide dengan admin key
- Tarikh: 2026-10-15
- Simptom: /api/me return "tenant key required"
- Punca: authenticate() cek admin dulu, tenant masuk mode admin
- Fix: route by prefix — arg_* → tenant, argon_* → admin

## Bug #004 — Revoke by prefix revoke SEMUA key
- Tarikh: 2026-10-15
- Simptom: lepas revoke, tenant tak boleh login
- Punca: UPDATE ... WHERE prefix = ? match semua row
- Fix: revoke by key_id (primary), fallback prefix exclude auth.keyId
- validateTenantKey return keyId

## Bug #005 — R2 bucket uppercase
- Tarikh: 2026-10-14
- Simptom: bucket_name="Argon-audit" invalid
- Fix: lowercase → argon-db, argon-kv, argon-audit

## Bug #006 — Heredoc conflict mobile
- Tarikh: 2026-10-14
- Simptom: marker EOF conflict
- Fix: guna unique marker (ZSWARM_Z, ZIDX_FINAL_Z)

## Bug #008 — DO env var cache
- Tarikh: 2026-10-15
- Simptom: `GITHUB_REPO_OVERLORD` env baru tak load lepas deploy
- Punca: Durable Object instance cached env lama
- Fix: Tukar `idFromName('GLOBAL_SENIOR_DEV_OVERLORD')` → `_V2`
- Sampingan: Services count 0 dalam V2 (storage baru kosong)
- Pelajaran: DO storage persistent across deploys. Kalau env berubah, kena force new instance

## Bug #009 — Overlord commit ke repo salah
- Tarikh: 2026-10-15
- Simptom: File masuk `buku-koding-agentic` (grimoire) bukan `Argon` repo
- Punca: Satu env `GITHUB_REPO` dikongsi untuk 2 tujuan (Swarm Scribe + Overlord)
- Fix: Pisahkan `GITHUB_REPO` (grimoire) + `GITHUB_REPO_OVERLORD` (Argon)
- Pelajaran: Setiap subsystem patut ada env var sendiri kalau guna resource berbeza

## Bug #010 — Watchdog self-heal salah HTTP 530
- Tarikh: 2026-10-15
- Simptom: Worker sihat kena auto-redeploy (overwrite lastStableCode lama)
- Punca: Propagasi `*.workers.dev` subdomain lambat (5-30s) → 530 temporary
- Fix: `SKIP_530_PROPAGATING` — kalau status 530, tag je, jangan heal
- Tambahan: 4xx warn (bukan heal), 5xx heal
- Pelajaran: Health check kena distinguish antara transient error vs real failure
