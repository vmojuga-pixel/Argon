# RECORD KEEPING SOP — Argon

> **Peraturan:** Zero-loss documentation. Setiap perubahan MESTI ada rekod.
> Kalau tak update rekod, kerja dianggap **BELUM SELESAI**.

---

## Bila Buat Apa → Update Mana

| Aktiviti | Update Fail |
|:---|:---|
| Tambah feature baru | `CHANGELOG.md` + `BLUEPRINT_XX` + `FILE_INDEX.md` |
| Fix bug | `BLUEPRINT_04_bugs.md` (+ `CHANGELOG.md`) |
| Tambah endpoint | `BLUEPRINT_02*.md` |
| Tambah binding/resource CF | `ENVIRONMENT.md` + `wrangler.toml` |
| Tambah secret | `ENVIRONMENT.md` |
| Keputusan teknikal/bisnes | `DECISIONS.md` |
| Mula/tamat sesi | `SESSION_LOG.md` |
| Tambah fail baru | `FILE_INDEX.md` |
| Update harga/quota | `BLUEPRINT_03_billing.md` + `DECISIONS.md` |
| Roadmap berubah | `JOURNEY.md` + `BLUEPRINT_06_roadmap.md` |
| Credential rotate | `/root/.argon-secrets/` + `ENVIRONMENT.md` |

---

## Format Standard

### Bug entry (dalam `BLUEPRINT_04_bugs.md`)
    ## Bug #NNN — [Tajuk ringkas]
    - Tarikh: YYYY-MM-DD
    - Simptom: [apa yang user nampak]
    - Punca: [root cause teknikal]
    - Fix: [apa yang dibuat]
    - Pelajaran: [apa yang belajar]

### Decision entry (dalam `DECISIONS.md`)
    | Tarikh | Keputusan | Sebab | Alternatif |
    | 2026-XX-XX | [decision] | [reason] | [alt] |

### Changelog entry (dalam `CHANGELOG.md`)
    ### [KATEGORI] Tajuk
    - [bullet points perubahan]

Kategori: `[INIT]`, `[FEAT]`, `[BUG]`, `[FIX]`, `[DOCS]`, `[REFACTOR]`, `[SECURITY]`, `[OPS]`

### Session entry (dalam `SESSION_LOG.md`)
    ## Session #NNN — YYYY-MM-DD
    **Duration:** X jam
    **Focus:** [topic]
    **Selesai:** [bullets]
    **Belum selesai / next:** [bullets]
    **Notes:** [notes]

---

## Checklist Akhir Sesi (WAJIB)

Sebelum tamat setiap sesi kerja, pastikan:

- [ ] Semua bug fix ada entry dalam `BLUEPRINT_04_bugs.md`
- [ ] Semua feature baru ada dalam `CHANGELOG.md`
- [ ] Session log updated dalam `SESSION_LOG.md`
- [ ] Keputusan baru recorded dalam `DECISIONS.md`
- [ ] Fail baru indexed dalam `FILE_INDEX.md`
- [ ] Binding/secret baru dalam `ENVIRONMENT.md`
- [ ] Credential baru disimpan dalam `/root/.argon-secrets/`
- [ ] `BLUEPRINT.md` regenerated (kalau parts berubah)
- [ ] Git commit + push
- [ ] Verify semua endpoint masih live

---

## Prinsip

1. **Kalau tak rekod, ia tak pernah berlaku** — untuk agent/session seterusnya.
2. **Fail > ingatan** — VPS boleh reset, otak boleh lupa, tapi fail kekal.
3. **Setiap fail ada purpose** — jangan campur (bug ≠ decisions ≠ changelog).
4. **Nombor berturutan** — bugs #001, #002... sessions #001, #002...
5. **Timestamp setiap entry** — supaya boleh trace bila apa jadi.

---

## Rekod Fail di Lokasi Ini

    docs/
    ├── BLUEPRINT_01_overview.md         → Architecture + URLs
    ├── BLUEPRINT_02_endpoints.md        → Public + Basic Auth
    ├── BLUEPRINT_02b_overlord_endpoints.md → Overlord
    ├── BLUEPRINT_03_billing.md          → Tier + economics
    ├── BLUEPRINT_04_bugs.md             → Bug log
    ├── BLUEPRINT_05_lessons.md          → Lessons + credentials
    ├── BLUEPRINT_06_roadmap.md          → 4 fasa
    ├── BLUEPRINT_07_tools.md            → C++ + Recon
    ├── BLUEPRINT_08_overlord.md         → Overlord full
    ├── CHANGELOG.md                     → Kronologi
    ├── SESSION_LOG.md                   → Sesi log
    ├── DECISIONS.md                     → Keputusan
    ├── ENVIRONMENT.md                   → Resource inventory
    ├── RECOVERY.md                      → Rebuild guide
    ├── FILE_INDEX.md                    → Index fail
    ├── RECORD_SOP.md                    → Fail ini (SOP)
    └── JOURNEY.md                       → Status + roadmap
    BLUEPRINT.md                          → Combined (regenerate dari 01-08)
