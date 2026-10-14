/**
 * [CORPUS: qwen/stack] Next.js dashboard (Tailwind dark mode)
 * Tags: next.js, tailwind, dashboard, dark-mode, stats-cards
 */
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          API Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">baki kredit:</span>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/20">
            8,450 Credits
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-zinc-400 text-sm">Total Requests (24h)</p>
          <p className="text-3xl font-bold mt-2">12,405</p>
          <p className="text-emerald-400 text-xs mt-1">↑ 12% dari semalam</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-zinc-400 text-sm">Success Rate</p>
          <p className="text-3xl font-bold mt-2">99.8%</p>
          <p className="text-zinc-500 text-xs mt-1">Avg response: 45ms</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-zinc-400 text-sm">Active API Keys</p>
          <p className="text-3xl font-bold mt-2">3</p>
          <button className="text-blue-400 text-xs mt-2 hover:underline">+ Jana Key Baru</button>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4">Pengurusan API Key</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <div>
              <p className="font-mono text-sm text-zinc-300">sk_live_••••••••••••••••••••a3f9</p>
              <p className="text-xs text-zinc-500 mt-1">Dicipta pada 12 Okt 2026</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 rounded-md transition">Salin</button>
              <button className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition border border-red-500/20">Padam</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
