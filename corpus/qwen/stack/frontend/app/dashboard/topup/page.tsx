/**
 * [CORPUS: qwen/stack] Stripe checkout topup UI
 * Tags: next.js, react, stripe-checkout, topup, dark-mode
 */
'use client';
import { useState } from 'react';

export default function TopUpPage() {
  const [loading, setLoading] = useState(false);
  const apiKeyId = 'uuid-pelanggan-di-sini';

  const handleTopUp = async (credits: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeyId, creditsToBuy: credits }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error('Payment failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Tambah Kredit API</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => handleTopUp(1000)} disabled={loading}
          className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-500/50 hover:bg-zinc-800/50 transition-all text-left group">
          <h3 className="text-lg font-semibold text-blue-400">Starter</h3>
          <p className="text-3xl font-bold mt-2">1,000 Credits</p>
          <p className="text-zinc-400 mt-1">$10.00 USD</p>
          <span className="inline-block mt-4 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium group-hover:bg-blue-500 transition">
            {loading ? 'Processing...' : 'Beli Sekarang'}
          </span>
        </button>

        <button onClick={() => handleTopUp(5000)} disabled={loading}
          className="p-6 bg-zinc-900 border border-purple-500/30 rounded-xl hover:border-purple-500 hover:bg-zinc-800/50 transition-all text-left group relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-purple-600 text-xs px-2 py-1 rounded-bl-lg">Popular</div>
          <h3 className="text-lg font-semibold text-purple-400">Pro</h3>
          <p className="text-3xl font-bold mt-2">5,000 Credits</p>
          <p className="text-zinc-400 mt-1">$45.00 USD (Jimat 10%)</p>
          <span className="inline-block mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium group-hover:bg-purple-500 transition">
            {loading ? 'Processing...' : 'Beli Sekarang'}
          </span>
        </button>
      </div>
    </div>
  );
}
