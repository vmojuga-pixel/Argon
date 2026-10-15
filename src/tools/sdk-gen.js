// Auto-generate SDK snippets from OpenAPI-ish spec (per sector)
const SECTORS = {
  chat: [
    { lang: 'js', code: `const res = await fetch(\`\${BASE}/api/chat\`, { method: 'POST', headers: { 'X-API-Key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'hello' }) });\nconst data = await res.json();\nconsole.log(data.reply);` },
    { lang: 'py', code: `import httpx\nr = httpx.post(f"{BASE}/api/chat", headers={"X-API-Key": KEY}, json={"message": "hello"})\nprint(r.json()["reply"])` },
    { lang: 'curl', code: `curl -X POST "$BASE/api/chat" -H "X-API-Key: $KEY" -H "Content-Type: application/json" -d '{"message":"hello"}'` },
  ],
  agent: [
    { lang: 'js', code: `const res = await fetch(\`\${BASE}/api/agent\`, { method: 'POST', headers: { 'X-API-Key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'run date' }) });\nconst data = await res.json();\nconsole.log(data.reply, data.trace);` },
    { lang: 'py', code: `r = httpx.post(f"{BASE}/api/agent", headers={"X-API-Key": KEY}, json={"message": "run date"})\nprint(r.json()["reply"])` },
  ],
  swarm: [
    { lang: 'js', code: `const state = await (await fetch(\`\${BASE}/swarm/state\`, { headers: { 'X-API-Key': KEY } })).json();\nconsole.log('Epoch:', state.epoch);` },
    { lang: 'curl', code: `curl "$BASE/swarm/state" -H "X-API-Key: $KEY"` },
  ],
  omni: [
    { lang: 'js', code: `const p = await (await fetch(\`\${BASE}/omni/execute\`, { method: 'POST', headers: { 'X-API-Key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ targetRepo: 'your-org/my-app', directive: 'Build CRM' }) })).json();\nconsole.log(p.deployment.liveUrl);` },
    { lang: 'py', code: `r = httpx.post(f"{BASE}/omni/execute", headers={"X-API-Key": KEY}, json={"targetRepo": "your-org/my-app", "directive": "Build CRM"})\nprint(r.json()["deployment"]["liveUrl"])` },
  ],
};

export function generateSDKForSector(sector) {
  return SECTORS[sector] || null;
}

export function listSectors() {
  return Object.keys(SECTORS);
}
