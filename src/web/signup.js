export function renderSignup(err) {
  return `<!DOCTYPE html>
<html lang="en" class="dark"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Sign up — BorneoAI</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:"class"}</script>
<style>
body {
    background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://raw.githubusercontent.com/vmojuga-pixel/Argon/main/dolphin.png') !important;
    background-size: cover !important;
    background-position: center !important;
    background-attachment: fixed !important;
    background-repeat: no-repeat !important;
}
</style>
</head>
<body class="min-h-screen text-slate-100 font-sans antialiased flex items-center justify-center p-6">
<div class="w-full max-w-md">
<div class="text-center mb-6">
<a href="/" class="inline-flex items-center gap-2">

<span class="text-2xl font-bold tracking-tight">BorneoAI</span></a>
<p class="text-sm text-slate-400 mt-2">Create your free account. No credit card needed.</p></div>
<div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
<div class="space-y-2">
<button onclick="oauthSignIn(&#39;google&#39;)" class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm">Sign up with Google</button>
<button onclick="oauthSignIn(&#39;github&#39;)" class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-sm">Sign up with GitHub</button>
<button onclick="oauthSignIn(&#39;apple&#39;)" class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-900 border border-slate-800 font-medium text-sm">Sign up with Apple</button>
</div>
<div class="flex items-center gap-3 my-5"><div class="flex-1 h-px bg-slate-800"></div><span class="text-xs text-slate-500">or</span><div class="flex-1 h-px bg-slate-800"></div></div>
<form id="f" class="space-y-3">
<div><label class="block text-xs font-medium text-slate-300 mb-1.5">Work email</label>
<input id="e1" type="email" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="you@company.com" autocomplete="email" /></div>
<div><label class="block text-xs font-medium text-slate-300 mb-1.5">Company (optional)</label>
<input id="co" type="text" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="Borneo Sdn Bhd" /></div>
<div><label class="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
<input id="p" type="password" required minlength="8" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="Min 8 chars" autocomplete="new-password" /></div>
<label class="flex items-start gap-2 text-xs text-slate-400 pt-1"><input id="t" type="checkbox" required class="mt-0.5 accent-cyan-500" /><span>I agree to the <a href="/legal/terms" class="text-cyan-400 hover:text-emerald-300">Terms</a> and <a href="/legal/privacy" class="text-cyan-400 hover:text-emerald-300">Privacy Policy</a></span></label>
<button type="submit" class="w-full px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm mt-2">Create account</button>
<div id="er" class="text-sm text-rose-400 text-center hidden"></div>
</form></div>
<p class="text-center text-sm text-slate-400 mt-6">Already have an account? <a href="/login" class="text-cyan-400 hover:text-emerald-300 font-medium">Log in</a></p>
<p class="text-center text-xs text-slate-500 mt-4"><a href="/" class="hover:text-slate-400">Back to home</a></p></div>
<script>
function oauthSignIn(p){if(p==="google"){window.location.href="/api/auth/oauth/google";}else{alert("OAuth " + p + " belum dikonfigurasi. Sila daftar Client ID di Google/GitHub dan masukkan ke dalam sistem.");}}
document.getElementById("f").addEventListener("submit", async (ev) => {
ev.preventDefault();
const er=document.getElementById("er"); er.classList.add("hidden");
const body={email:document.getElementById("e1").value,company:document.getElementById("co").value,password:document.getElementById("p").value};
const r=await fetch("/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
const d=await r.json();
if(d.ok&&d.apiKey){localStorage.setItem("argon_key",d.apiKey);window.location.href="/dashboard?welcome=1";}
else{er.textContent=d.error||"Signup failed";er.classList.remove("hidden");}
});
</script></body></html>`;
}
