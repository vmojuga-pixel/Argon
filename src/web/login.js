export function renderLogin(errorMsg = "") {
  const err = errorMsg ? `<div class="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs rounded-lg p-3 mb-4">${errorMsg}</div>` : "";
  return `<!DOCTYPE html>
<html lang="ms" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Login — Argon</title>
<script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen flex items-center justify-center p-4 font-sans">
<div class="w-full max-w-md">
  <div class="text-center mb-8">
    <div class="inline-flex items-center gap-2 mb-3">
      <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
      <span class="font-mono font-bold text-2xl text-white">ARGON</span>
    </div>
    <p class="text-sm text-slate-400">Sign in to access the console</p>
  </div>
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
    ${err}
    <form id="loginForm" class="space-y-4">
      <div>
        <label class="block text-xs font-mono text-slate-400 mb-2">Username</label>
        <input id="user" type="text" autocomplete="username" required
          class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label class="block text-xs font-mono text-slate-400 mb-2">Password</label>
        <input id="pass" type="password" autocomplete="current-password" required
          class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
      </div>
      <button id="btn" type="submit"
        class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold py-3 rounded-lg text-sm">
        SIGN IN
      </button>
    </form>
  </div>
  <p class="text-center text-xs text-slate-500 mt-6">
    <a href="/" class="hover:text-slate-300">Back to landing</a>
  </p>
</div>
<script>
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = document.getElementById('user').value.trim();
  const pass = document.getElementById('pass').value;
  const btn = document.getElementById('btn');
  btn.disabled = true; btn.innerText = 'SIGNING IN...';
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass }),
    });
    const d = await r.json();
    if (r.ok && d.ok) {
      window.location.href = d.redirect || '/omni-ui';
    } else {
      window.location.href = '/login?error=' + encodeURIComponent(d.error || 'Invalid credentials');
    }
  } catch (err) {
    window.location.href = '/login?error=' + encodeURIComponent('Network error');
  }
});
<\/script>
</body>
</html>`;
}
