#!/usr/bin/env bash
export ARGON_DIR="/root/.argon-secrets"
export ARGON_URL="https://argon.vmojuga.workers.dev"
export ARGON_ADMIN_KEY="$(cat $ARGON_DIR/admin.key 2>/dev/null)"
export ARGON_TENANT_KEY="$(cat $ARGON_DIR/tenant.key 2>/dev/null)"
export ARGON_TENANT_ID="$(cat $ARGON_DIR/tenant.id 2>/dev/null)"
export ARGON_BASIC="$(cat $ARGON_DIR/basic.full 2>/dev/null)"
export ARGON_CF_TOKEN="$(cat /root/.cf-key 2>/dev/null)"

argon_chat() {
  curl -s -X POST "$ARGON_URL/api/chat" -H "X-API-Key: $ARGON_TENANT_KEY" -H "Content-Type: application/json" -d "{\"session_id\":\"cli\",\"message\":\"$1\"}"
}
argon_agent() {
  curl -s -X POST "$ARGON_URL/api/agent" -H "X-API-Key: $ARGON_TENANT_KEY" -H "Content-Type: application/json" -d "{\"session_id\":\"cli\",\"message\":\"$1\"}"
}
argon_me() { curl -s -H "X-API-Key: $ARGON_TENANT_KEY" "$ARGON_URL/api/me"; }
argon_admin_stats() { curl -s -u "$ARGON_BASIC" "$ARGON_URL/admin/stats"; }
argon_swarm_evolve() {
  curl -s -X POST "$ARGON_URL/swarm/evolve" -H "X-API-Key: $ARGON_TENANT_KEY" -H "Content-Type: application/json" -d "{\"topic\":\"${1:-}\"}"
}
argon_health() { curl -s "$ARGON_URL/api/health"; }
argon_whoami() {
  echo "URL:        $ARGON_URL"
  echo "Admin:      ${ARGON_ADMIN_KEY:0:20}..."
  echo "Tenant:     ${ARGON_TENANT_KEY:0:20}..."
  echo "Tenant ID:  $ARGON_TENANT_ID"
  echo "Basic:      ${ARGON_BASIC:0:15}..."
}
echo "[creds.sh] Loaded"
