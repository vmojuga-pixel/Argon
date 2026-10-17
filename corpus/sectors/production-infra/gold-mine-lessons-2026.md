---
source: Engineering Session 2026-10-16 to 2026-10-17
category: agentic-saas-engineering
stack: [Cloudflare Workers, D1, Stripe, Google OAuth, TailwindCSS]
status: Production Tested
---

# THE GOLD MINE: Real-World Agentic SaaS Engineering Lessons

## 1. Cloudflare Workers Runtime (The Traps)
- **Error 1101 (Worker Exception)**: Berlaku bila ada `SyntaxError` (kurungan tak tutup, regex rosak) atau `TypeError` (panggil variable tak wujud). JANGAN assume ia isu rangkaian. Sentiasa semak `node --check` dan log `wrangler tail`.
- **Invalid JSON in API**: JANGAN panggil `await request.json()` dua kali dalam satu request. Jika perlu semak kuota, baca body sekali, simpan dalam variable, atau bypass fungsi perantara (`handleChat`) dan panggil `env.AI.run` terus di route.
- **Template Literal Trap**: Dalam fail HTML (yang guna backtick `` ` ``), JANGAN letak regex `\n`. Ia akan pecah jadi baris baru dan rosakkan sintaks. Guna `String.fromCharCode(10)` untuk ganti newline.
- **Python Patching Trap**: Bila guna `python3 -c` untuk replace/potong kod, ia mudah tertinggal simbol `);` atau `}`. WAJIB jalankan `node --check` selepas setiap patch.

## 2. Auth & Routing (Landing vs App)
- **Landing Page (`/`)**: Mesti 100% awam (tiada Basic Auth). Bot Stripe perlukan akses untuk verify bisnes. Basic Auth akan buat bot nampak "Not password protected" dan reject bisnes.
- **Dashboard (`/app`)**: Kunci guna Session Cookie. 
- **Google OAuth**: Buang parameter `prompt=consent` dari URL auth. Kalau tak, pengguna akan keluar popup kebenaran Google (dan email) setiap kali login.

## 3. Stripe Integration (Malaysia)
- **DBA (Doing Business As)**: Letak nama jenama (BorneoAI). Jangan letak kategori ("Software as a Service") sebab ia akan muncul di penyata bank pelanggan.
- **Radar Lite**: Guna yang percuma. Jangan pilih Stripe Climate (ia potong peratus untung).
- **Webhook Security**: Wajib guna HMAC Signature Verification (`crypto.subtle.verify`) untuk halang hacker hantar request palsu upgrade plan.

## 4. UI/UX Design (Enterprise SaaS)
- **Design Vibe**: Pengguna Enterprise tak suka design "budak-budak" (glow neon, border bulat sangat, gradient text). Guna tema gelap profesional (macam Vercel/Linear), border rounded-md (6px), dan warna slate/cyan.
- **Mobile Viewport**: Guna `h-[100dvh]` (Dynamic Viewport Height), BUKAN `h-screen`. Ini supaya input chat tak tenggelam di bawah navigation bar telefon.
- **Chat Interface**: Letak input box di dalam `form` yang `sticky` atau `absolute` di bawah. Jangan letak butang "Hantar" yang besar di luar kotak.

## 5. Swarm & Corpus Logic
- **Quality Gates**: Gate 1 (skip commit kalau v2==v1 atau sandbox critical), Gate 2 (skip cycle kalau topik tak padan sektor).
- **Variable Shadowing**: Elak letak `let ghStatus;` di luar dan `const ghStatus = ...` di dalam blok `else`. Ia akan buat sistem crash bila panggil `.synced`.
- **VPS vs GitHub**: VPS tak perlu pull fail corpus. Live site (Cloudflare) baca terus fail dari GitHub. VPS cuma untuk deploy.

## 6. Legal & Trust
- **Terms of Service Mutlak**: Untuk SaaS AI, letak klausa *Absolute Waiver of Court Proceedings* dan *Indemnification*. Ini melindungi pemilik dari saman sivil jika AI hasilkan kod yang bermasalah.
