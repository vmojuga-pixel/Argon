---
source: Complete Engineering Session 2026-10-16/17
category: ultimate-agentic-saas-blueprint
stack: [Cloudflare Workers, D1, KV, R2, DO, Stripe, Google OAuth, TailwindCSS, Termux]
---

# BORNEOAI: THE ULTIMATE GOLD MINE (Full Session Lessons)

## 1. TERMINAL & MOBILE SSH RULES (From SOP)
- **Zero Heredoc**: Jangan guna `cat << 'EOF'`. Guna `printf`, `python3 -c`, atau `base64 -d`. Mobile clipboard memotong newline dan menyangkut terminal di prompt `>`.
- **No Interactive Editors**: Jangan guna `nano`, `vim`.
- **Patch Trap**: Bila guna `python3 -c` untuk replace kod, ia mudah tertinggal simbol `);` atau `}`. WAJIB jalankan `node --check` selepas setiap patch.

## 2. VPS & INFRASTRUCTURE CONSTRAINTS
- VPS SIR hanya 2GB RAM. 
- **Ollama & Qwen**: Awalnya berjalan di VPS (Ollama + Qwen 1.5B), mengambil 1.7GB RAM. Kita matikan untuk legakan 1GB RAM.
- **Masa Depan LLM**: Idea untuk pindahkan LLM ke Termux (phone) dan sambung ke VPS guna Cloudflare Tunnel. Ini elak OOM (Out of Memory) di VPS.
- **VPS vs GitHub**: VPS cuma untuk deploy (`wrangler deploy`). Live site Cloudflare baca terus fail corpus dari GitHub API. Tak perlu `git pull` corpus ke VPS.

## 3. SWARM ARCHITECTURE & LOGIC
- **Swarm (7 Ejen)**: Visionary -> Architect -> Synthesizer (v1) -> Breaker (kritik) -> Optimizer (v2) -> Judge -> Scribe (Commit).
- **Quality Gates**: 
  - *Gate 1*: Skip commit jika `v2UsedAI=false` (fallback), atau `v1==v2`, atau sandbox ada critical risk.
  - *Gate 2*: Skip cycle jika topik tak padan dengan mana-mana sektor corpus (cth: keyword `rag` padan dengan `ai-ml`).
- **Output**: Fail disimpan di `corpus/sectors/<sector>/epoch-*.md`.
- **Corpus Ingest Strategy**: Fetch repo luar (minima 100 stars, ada test, ada folder src), filter sampah, simpan sebagai `ref-*.md`.

## 4. CLOUDFLARE WORKERS & DEBUGGING (The 1101 Traps)
- **Error 1101**: Berlaku bila Worker crash. Punca utama: `SyntaxError` (kurungan tak tutup, regex pecah) atau `TypeError` (panggil variable tak wujud).
- **Invalid JSON Trap**: Jangan panggil `await request.json()` dua kali (cth: sekali untuk kuota, sekali di `handleChat`). Baca sekali, simpan dalam variable, atau bypass fungsi perantara dan panggil `env.AI.run` terus.
- **Template Literal Trap**: JANGAN letak regex `\n` dalam template string HTML (backtick). Ia akan pecah jadi baris baru. Guna `String.fromCharCode(10)`.
- **Variable Shadowing**: Elak letak `let ghStatus;` di luar dan `const ghStatus = ...` di dalam blok `else`. Ia akan buat sistem crash bila panggil `.synced`.

## 5. AUTH, ROUTING & SECURITY
- **Landing Page (`/`)**: Mesti 100% awam (tiada Basic Auth). Bot Stripe perlu akses untuk verify bisnes. Basic Auth buat Stripe reject (Error: "Not password protected").
- **Dashboard (`/app`)**: Kunci guna Session Cookie.
- **Google OAuth**: Buang parameter `prompt=consent` dari URL auth. Kalau tak, pengguna akan keluar popup kebenaran Google setiap kali login (menyusahkan).

## 6. STRIPE INTEGRATION (Malaysia SaaS)
- **DBA (Doing Business As)**: Letak nama jenama (BorneoAI), bukan kategori. Ia muncul di penyata bank pelanggan.
- **Radar Lite**: Guna yang percuma. Jangan pilih Stripe Climate.
- **API Keys**: Cipta Secret Key khas (`sk_live_...` / `sk_test_...`) dengan permission `Full access—except sensitive operations`.
- **Webhook Security**: Wajib guna HMAC Signature Verification (`crypto.subtle.verify`) di backend untuk halang request palsu upgrade plan percuma.
- **Static Link vs Checkout**: Guna Stripe Checkout API untuk auto-update plan dalam DB via webhook `checkout.session.completed`.

## 7. UI/UX DESIGN (Enterprise SaaS - Vercel Style)
- **Design Vibe**: Pengguna Enterprise tak suka design "budak-budak" (glow neon, border bulat sangat). Guna tema gelap profesional (Slate/Cyan), border rounded-md (6px).
- **Mobile Viewport**: Guna `h-[100dvh]` (Dynamic Viewport Height), BUKAN `h-screen`. Ini supaya input chat tak tenggelam di bawah navigation bar telefon.
- **Chat Interface**: Input box mesti di dalam form `sticky`/`absolute` di bawah. Butang "Hantar" kecil di dalam kotak input (macam Cloudflare AI/Claude).
- **Branding**: Nama "BorneoAI", Tema Dolphin (Cyan/Biru), Background gambar Dolphin gelap.

## 8. DEVOPS & GITHUB ACTIONS
- **Auto-Deploy**: Fail `.github/workflows/deploy.yml` guna `npx wrangler deploy`. Simpan `CLOUDFLARE_API_TOKEN` & `CLOUDFLARE_ACCOUNT_ID` di GitHub Secrets.
- **Auto-Commit**: Swarm/Worker akan commit terus ke GitHub. GitHub Actions akan trigger deploy tanpa perlu sentuh VPS.

## 9. LEGAL & TRUST (SaaS Protection)
- **Terms of Service Mutlak**: Untuk SaaS AI, letak klausa *Absolute Waiver of Court Proceedings*, *Indemnification*, dan *Limitation of Liability*. Pengguna guna atas risiko sendiri (*"Use this platform wisely"*).
