# Production Infra — Part 1: Multi-Channel Notifier

## Pattern: Proactive Alert Engine (WhatsApp + Telegram)
Agent proactively notify CEO on anomaly. Parallel dispatch via asyncio.gather.

## Channels
- Telegram Bot API: api.telegram.org/bot{token}/sendMessage
  - Markdown parse_mode, disable_web_page_preview
  - Severity emoji: INFO ⓘ, WARNING ⚠, CRITICAL 🚨
  - action_url inline link to Command Center
- WhatsApp Meta Cloud API: graph.facebook.com/v18.0/{phone_id}/messages
  - Wajib guna APPROVED TEMPLATE (compliance Meta)
  - Template name: ceo_alert_template, language en_US
  - Body components parameters: severity, title, message

## Payload Schema (Pydantic)
AlertPayload: severity(INFO/WARNING/CRITICAL), title, message, action_url (optional)

## Config (env)
WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, CEO_WHATSAPP_NUMBER,
TELEGRAM_BOT_TOKEN, TELEGRAM_CEO_CHAT_ID

## Key Principles
- async httpx.AsyncClient (not requests)
- asyncio.gather() both channels parallel — no blocking
- Graceful fail: HTTPError caught, log, return False
- raise_for_status() untuk surface 4xx/5xx
