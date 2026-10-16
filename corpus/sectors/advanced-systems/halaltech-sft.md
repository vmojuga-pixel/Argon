# Advanced Systems — HalalTech SFT Training Data

## Problem
LLM umum tidak faham format sijil JAKIM/MUI/GSO. SFT diperlukan supaya model boleh ekstrak maklumat sijil dan nilai risiko kepalsuan dengan output JSON ketat.

## Solution
Supervised Fine-Tuning (SFT) format OpenAI Chat. Tiga domain: Halal verification, maritime telemetry, RAS aquaculture. Model target: Llama-3 / Qwen / gpt-4o-mini.

## Dataset — OpenAI JSONL Format
Struktur: {"messages":[{"role":"system","content":"..."},{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}. Satu record = satu baris dalam fail sebenar.

### Sample 1 — Halal Cert Verifier
{"messages":[{"role":"system","content":"Anda adalah Pakar Verifikasi Halal AI. Tugas anda adalah mengekstrak maklumat sijil dan menilai risiko kepalsuan berdasarkan teks OCR. Output MESTI dalam format JSON yang ketat."},{"role":"user","content":"Teks OCR dari label: Diluluskan oleh JAKIM. No Sijil: 01-202345. Sah sehingga 12/2025. Mengandungi perisa sintetik yang dibenarkan."},{"role":"assistant","content":"{\"cert_number\":\"01-202345\",\"expiry_date\":\"12/2025\",\"issuing_body\":\"JAKIM\",\"ingredients_flag\":\"perisa sintetik (dibenarkan)\",\"risk_assessment\":\"LOW\",\"reasoning\":\"Nombor sijil mengikut format standard JAKIM (XX-XXXXXX). Tiada bahan syubhah dikesan.\"}"}]}
