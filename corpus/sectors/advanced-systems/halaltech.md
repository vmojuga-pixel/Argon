# Advanced Systems — Part 1: HalalTech AI Verification

## Multi-Modal Pipeline
YOLO (logo detection) + EasyOCR (cert number) + LLM (structured extract) + DB cross-ref.

## Stage 1: Logo Detection (YOLO)
- Model: yolov8n fine-tuned on JAKIM/MUI/GSO logos
- Conf threshold: 0.5
- Return: is_detected, confidence, bbox [x1,y1,x2,y2]

## Stage 2: OCR (EasyOCR)
- Languages: en, ms, ar (Jawi + Arabic + Rumi)
- reader.readtext(img, detail=0) — text only
- Multi-region: JAKIM, MUI Indonesia, GSO Gulf

## Stage 3: Cert Number Extraction (regex)
- Pattern: `\b\d{2}-\d{6}\b` (Malaysia JAKIM standard)
- Fallback: LLM parse for non-standard formats

## Stage 4: DB Cross-Reference
- Mock: JAKIM API / blockchain ledger
- Return: is_authentic (bool), risk_score (0.0-1.0)
- No cert number => risk 0.95 (high)

## Response Schema (Pydantic)
HalalVerificationReport:
  - product_image_analysis: HalalLogoDetection
  - certificate_analysis: CertificateData
  - is_authentic: bool
  - risk_score: float

## Killer App Use Case
User upload photo product + cert => 2s verdict (sahih/palsu).
Target: JAKIM, importers, Muslim consumers global.
