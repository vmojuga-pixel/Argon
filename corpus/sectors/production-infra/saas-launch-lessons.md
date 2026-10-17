---
source: Production Session 2026-10-17
category: full-stack-saas-deployment
stack: [Cloudflare Workers, D1, Stripe, Google OAuth, TailwindCSS]
---

# Buku Pelajaran: BorneoAI Production Launch

## 1. Stripe Integration (Malaysia SaaS)
- **Pendaftaran**: Guna Akaun Malaysia. DBA (Doing Business As) mesti letak nama jenama (BorneoAI) supaya pelanggan nampak nama betul di penyata bank.
- **Radar Lite**: Pilih yang percuma. Jangan pilih Stripe Climate kalau tak nak potong untung.
- **Statement Descriptor**: Letak nama syarikat besar (BORNEOAI) untuk elak chargeback.
- **API Keys**: Cipta Secret Key khas (bukan master key) dengan permission `Full access—except sensitive operations`.
- **Webhook**: URL mesti tiada whitespace. Event: `checkout.session.completed`. Wajib guna HMAC Signature Verification di backend untuk elak hacker upgrade plan percuma.

## 2. Google OAuth (Cloud Console)
- **Redirect URI**: `https://legates.northerncoastgroup.com/api/auth/oauth/google/callback`
- **Javascript Origin**: `https://legates.northerncoastgroup.com`
- **Prompt Consent**: JANGAN letak `prompt=consent` dalam URL auth kalau tak nak popup kebenaran keluar setiap kali user login.

## 3. GitHub Actions (Auto-Deploy)
- Fail: `.github/workflows/deploy.yml`
- Guna `npx wrangler deploy` di dalam CI.
- Simpan `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` di GitHub Secrets.

## 4. Cloudflare Workers Debugging (Lessons)
- **Error 1101**: Berlaku bila Worker crash (Syntax Error, missing import, undefined variable). Jangan anggap ia isu rangkaian.
- **Invalid JSON**: Jangan panggil `request.json()` dua kali (cth: sekali untuk semak kuota, sekali di fungsi AI). Baca sekali, simpan dalam variable, atau bypass fungsi perantara (`handleChat`) dan panggil `env.AI.run` terus.
- **Template Literal Trap**: Jangan letak regex `\n` di dalam template string (backtick) untuk render HTML. Ia akan pecah jadi baris baru. Guna `String.fromCharCode(10)`.
- **Syntax Errors (Stray Parenthesis)**: Hati-hati masa guna `python3 -c` untuk replace/potong kod. Selalu `node --check` selepas edit.

## 5. UI/UX & Routing (Tailwind)
- **Mobile Viewport**: Guna `h-[100dvh]` (Dynamic Viewport Height) supaya input chat tak tenggelam bawah navigation bar telefon.
- **Routing**: Pastikan route GET (macam `/signup`) return render HTML, bukan `Response.redirect` ke page lain yang tiada form.
- **Auth Basic vs Session**: Landing page (`/`) mesti 100% awam (tiada Basic Auth) untuk bot Stripe review. Dashboard (`/app`) kunci guna Session Cookie.

## 6. Cloudflare Swarm & Corpus
- Swarm berjalan di DO (Durable Objects) setiap 15 minit.
- Ia tulis ke `corpus/sectors/<sector>/epoch-*.md`.
- VPS tak perlu pull fail corpus untuk live site berfungsi. Live site baca terus dari GitHub API.
