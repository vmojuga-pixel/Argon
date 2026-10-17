export function renderLogin(err) {
  return `<!DOCTYPE html>
<html lang="en" class="dark"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Log in — BorneoAI</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:"class"}</script></head>
<body class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex items-center justify-center p-6">
<div class="w-full max-w-md">
<div class="text-center mb-6">
<a href="/" class="inline-flex items-center gap-2">

<span class="text-2xl font-bold tracking-tight">BorneoAI</span></a>
<p class="text-sm text-slate-400 mt-2">Welcome back. Log in to continue.</p></div>
<div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
<div class="space-y-2">
<button onclick="oauthSignIn(&#39;google&#39;)" class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm">Continue with Google</button>
<button onclick="oauthSignIn(&#39;github&#39;)" class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-sm">Continue with GitHub</button>
<button onclick="oauthSignIn(&#39;apple&#39;)" class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-900 border border-slate-800 font-medium text-sm">Continue with Apple</button>
</div>
<div class="flex items-center gap-3 my-5"><div class="flex-1 h-px bg-slate-800"></div><span class="text-xs text-slate-500">or</span><div class="flex-1 h-px bg-slate-800"></div></div>
<form id="f" class="space-y-3">
<div><label class="block text-xs font-medium text-slate-300 mb-1.5">Email or username</label>
<input id="u" type="text" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="you@example.com" autocomplete="username" /></div>
<div><div class="flex items-center justify-between mb-1.5"><label class="block text-xs font-medium text-slate-300">Password</label>
<a href="/forgot" class="text-xs text-cyan-400 hover:text-emerald-300">Forgot?</a></div>
<input id="p" type="password" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="********" autocomplete="current-password" /></div>
<button type="submit" class="w-full px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm mt-2">Log in</button>
<div id="e" class="text-sm text-rose-400 text-center hidden"></div>
</form></div>
<p class="text-center text-sm text-slate-400 mt-6">Don&#39;t have an account? <a href="/signup" class="text-cyan-400 hover:text-emerald-300 font-medium">Sign up</a></p>
<p class="text-center text-xs text-slate-500 mt-4"><a href="/" class="hover:text-slate-400">Back to home</a></p></div>
<script>
function oauthSignIn(p){if(p==="google"){window.location.href="/api/auth/oauth/google";}else{alert("OAuth " + p + " belum dikonfigurasi. Sila daftar Client ID di Google/GitHub dan masukkan ke dalam sistem.");}}
document.getElementById("f").addEventListener("submit", async (e) => {
e.preventDefault();
const el=document.getElementById("e"); el.classList.add("hidden");
const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:document.getElementById("u").value,pass:document.getElementById("p").value})});
const d=await r.json();
if(d.ok){window.location.href=d.redirect||"/dashboard";}
else{el.textContent=d.error||"Login failed";el.classList.remove("hidden");}
});
</script></body></html>`;
}
