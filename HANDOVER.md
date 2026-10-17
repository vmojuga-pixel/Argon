# HANDOVER — ARGON

> Entry point untuk AI baru. Baca ni dulu, kemudian rujuk docs/ untuk detail.
> Last update: 2026-10-16

---

## 0. OPERATOR RULES (READ FIRST)
- User: SIR (Solo founder/CEO Argon). Mobile SSH sahaja.
- Panggil user SIR.
- **ZERO HEREDOC**: JANGAN guna cat <<, << 'EOF', << 'ZEND'. Sebab: mobile paste drop newline → bash tersangkut di prompt >.
- **Cara tulis fail**: printf '%s\n', python3 -c, node -e, atau base64 -d.
- **Backup dulu**: cp file file.bak sebelum edit.
- **Verify syntax**: node --check file.js selepas edit.
- Jangan halusinasi. Jangan sentuh luar skop. Rujuk docs/RECORD_SOP.md.

---

## 1. WHAT ARGON IS
Autonomous AI SaaS + Multi-Agent Platform di Cloudflare Workers.
- Live: https://argon.vmojuga.workers.dev
- CF Account: 695a620ee3223aa69b69b1e48eb91962
- CF Token: /root/.cf-key
- Repo: https://github.com/vmojuga-pixel/Argon
- Grimoire: https://github.com/vmojuga-pixel/buku-koding-agentic

---

## 2. TIGA ENGINE

### 2.1 Swarm (AKTIF)
- File: src/swarm.js | Cron: */15 * * * *
- 7 agents: Visionary > Architect > Synthesizer > Breaker > Optimizer > Judge > Scribe
- Output: corpus/sectors/<sector>/epoch-<N>-<timestamp>.md
- Routing: pickSectorForTopic() keyword match
- Quota: DAILY_NEURON_LIMIT=9000 (src/tools/quota-guard.js)
- Fallback: deterministicHeuristicEngine (bila kuota habis)

### 2.2 Overlord (DISABLED dari cron)
- File: src/overlord.js
- Cara hidupkan: uncomment 2 baris // [DISABLED-BY-SIR] di src/index.js line 412-413, deploy
- Manual POST: /overlord/command
- Output: CODING_GRIMOIRE.md (buku-koding-agentic)

### 2.3 Omni (DISABLED dari cron)
- File: src/omni-overlord.js
- Multi-repo auto-coder. LLM-generated workerCode + buildFullStackWorker fallback.
- Manual POST: /omni/execute, /omni/auto-build, /omni/scan-repo
- SSE: GET /omni/execute-stream

---

## 3. QUALITY GATES (Swarm)

### GATE 1 — Commit Gate
Skip commit jika mana-mana:
- v2UsedAI !== true (fallback heuristik)
- v1 === v2 (tiada penambahbaikan)
- sandboxV2 ada critical (eval, while(true), innerHTML, process.env)
Reason dilabel: quality_gate_fallback / quality_gate_v1_eq_v2 / quality_gate_sandbox_critical

### GATE 2 — Cycle Gate
Skip SELURUH cycle jika topik tak match mana-mana sektor.
Reason: no_sector_match

---

## 4. STRUKTUR & RUJUKAN

- **docs/** — BLUEPRINT_01..09, JOURNEY, CHANGELOG, DECISIONS, RECORD_SOP, RECOVERY, ENVIRONMENT, FILE_INDEX, SESSION_LOG
- **corpus/** — 16 sectors, 55+ fail, index.json, sectors/<name>/_manifest.json
- **src/** — index.js (routing), swarm.js, overlord.js, omni-overlord.js, api/, auth/, saas/, admin/, tools/
- **BLUEPRINT.md** (root) — overview utama
- **CODING_GRIMOIRE.md** — format standard logging (## TAJUK // timestamp)

---

## 5. COMMANDS PANTAS
source /root/Argon/scripts/creds.sh
curl -s -H "X-API-Key: $ARGON_TENANT_KEY" "$ARGON_URL/swarm/state" | python3 -m json.tool
export CLOUDFLARE_API_TOKEN=$(cat /root/.cf-key) && cd /root/Argon && npx wrangler deploy

---

## 6. FIRST COMMAND
cat /root/Argon/BLUEPRINT.md && cat /root/Argon/docs/JOURNEY.md

---

## 12. BACKLOG IDEAS (Jangan Lupa)

### BorneoAI-1 (LoRA + Encoder)
- Rujuk: docs/JOURNEY.md (2026-10-16 Later)
- Idea: base model kecil + LoRA adapter autocode + 4-bit quantize.
- Data: corpus Swarm (1 sample/epoch, quality-gated).
- Potensi: 500MB-1GB model, on-premise, no external API dependency.

### Cara Guna Corpus untuk Training
1. Setiap fail corpus/sectors/<sector>/epoch-*.md = 1 training sample.
2. Format: system (prompt sektor) + user (topic) + assistant (kod v2 + kritikan).
3. Export ke JSONL bila cukup 1,000+ sample.
4. Fine-tune LoRA on top Phi-3 / Qwen2-0.5B.

---

## 13. BACKLOG: CORPUS INGEST + TERMUX LLM (Idea 2026-10-16)

### Corpus Ingest
- Tool: scripts/ingest.py (belum cipta)
- Fetch repo berkualiti sahaja (filter: stars 100+, ada test, ada src/, license, recent commit)
- Auto-categorize ke sektor corpus
- Target: 50-100 repo/hari, corpus kaya 1-2 minggu

### Termux LLM + VPS Agent
- LLM (Qwen 1.5B / small) jalan dalam Termux (phone) - RAM 4-8GB lebih lega dari VPS 2GB
- Cloudflare Tunnel: phone LLM expose ke internet tanpa IP public
- VPS: agentic worker fetch repo -> hantar ke phone analyze -> commit corpus
- Fallback: kalau phone offline, guna Workers AI

### Fasa
1. Ingest script + quality filter (sekarang)
2. Test Swarm lokal Qwen 1.5B (2-3 hari)
3. Pindah LLM ke Termux (bila VPS OOM)
4. LoRA fine-tune corpus (2 minggu)

## 12. FINAL ARCHITECTURE (Update 2026-10-17)
- **Brand**: BorneoAI (Dolphin Theme, Cyan/Slate). Logo: `dolphin.png`.
- **Auth**: Email/Password & Google OAuth. Landing page (`/`) awam (tiada Basic Auth). Dashboard (`/app`) kunci guna Session Cookie.
- **Dashboard**: Satu interface untuk semua. Tab: Home, Baobao (Chat+Agent merged), Projects, API Keys, Usage, Billing, Ops, Swarm.
- **Billing**: Stripe Integration. Checkout URL & Webhook (HMAC verified). Auto-update plan di DB.
- **Baobao**: Guna `env.AI.run` (llama-4-scout). Prompt agentic (boleh jawab soalan & buat kerja). Bypass `handleChat` untuk elak isu `invalid json`.
- **Ops**: AI cadang plan, UI approve, GitHub Actions auto-deploy.
- **Swarm**: Berjalan di background (*/15). Tulis ke corpus GitHub.

## 13. TECHNICAL DEBT & WARNINGS
- Jangan guna `handleChat` function lama untuk Baobao, ia crash `invalid json` (double read).
- Guna `String.fromCharCode(10)` untuk newline dalam template literal HTML.
- Stripe Webhook endpoint: `/api/stripe/webhook`.
