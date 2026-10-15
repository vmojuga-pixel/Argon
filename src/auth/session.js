// Session cookie auth — HMAC-signed, replaces browser Basic Auth popup
const COOKIE = "argon_session";
const TTL_SEC = 7 * 24 * 3600;

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function b64u(s) { return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function ub64u(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return atob(s); }

export async function createSession(env, user) {
  const secret = env.SESSION_SECRET || env.BASIC_AUTH_PASS;
  if (!secret) throw new Error("SESSION_SECRET atau BASIC_AUTH_PASS required");
  const payload = { u: user, exp: Math.floor(Date.now() / 1000) + TTL_SEC };
  const p = b64u(JSON.stringify(payload));
  const sig = await hmac(secret, p);
  return `${p}.${sig}`;
}

export async function verifySession(env, token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const secret = env.SESSION_SECRET || env.BASIC_AUTH_PASS;
  if (!secret) return null;
  const expected = await hmac(secret, parts[0]);
  if (expected !== parts[1]) return null;
  try {
    const payload = JSON.parse(ub64u(parts[0]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export function getSessionCookie(request) {
  const c = request.headers.get("cookie") || "";
  const m = c.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return m ? m[1] : null;
}

export function sessionCookieHeader(token) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_SEC}`;
}

export function clearCookieHeader() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// Combined auth: session cookie OR Basic Auth
export async function validateSessionOrBasic(request, env) {
  const token = getSessionCookie(request);
  if (token) {
    const sess = await verifySession(env, token);
    if (sess) return { ok: true, mode: "session", user: sess.u };
  }
  // fallback Basic Auth
  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const idx = decoded.indexOf(":");
      if (idx < 0) return { ok: false };
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      const expectedUser = env.BASIC_AUTH_USER || "argon";
      const expectedPass = env.BASIC_AUTH_PASS;
      if (!expectedPass) return { ok: false };
      if (user === expectedUser && pass === expectedPass) return { ok: true, mode: "basic", user };
    } catch { return { ok: false }; }
  }
  return { ok: false };
}

export async function verifyLogin(env, user, pass) {
  const expectedUser = env.BASIC_AUTH_USER || "argon";
  const expectedPass = env.BASIC_AUTH_PASS;
  if (!expectedPass) return false;
  if (user !== expectedUser || pass !== expectedPass) return false;
  return true;
}
