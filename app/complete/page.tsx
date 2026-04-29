'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getWeeklyStats } from '@/lib/storage';
import { useEffect, useState } from 'react';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}時間${String(m).padStart(2, '0')}分`;
  if (m > 0) return `${m}分${String(s).padStart(2, '0')}秒`;
  return `${s}秒`;
}

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sets = parseInt(searchParams.get('sets') || '0', 10);
  const duration = parseInt(searchParams.get('duration') || '0', 10);

  const [weekly, setWeekly] = useState({ count: 0, goal: 3 });

  useEffect(() => {
    setWeekly(getWeeklyStats());
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col max-w-[430px] mx-auto px-6">

      {/* Header area */}
      <div className="pt-20 pb-10 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-[#00FF88] flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#00FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 14l6 6L23 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">トレーニング完了</h1>
        <p className="text-[#555] text-sm">お疲れ様でした</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-5 text-center">
          <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">トレーニング時間</p>
          <div className="text-2xl font-black text-white">{formatDuration(duration)}</div>
        </div>
        <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-5 text-center">
          <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">今日の総セット</p>
          <div className="text-2xl font-black text-[#00FF88]">{sets}</div>
        </div>
      </div>

      {/* Weekly progress */}
      <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-5 mb-10">
        <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3">今週の達成</p>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-black text-white leading-none">{weekly.count}</span>
          <span className="text-[#444] text-xl font-light mb-0.5">/ {weekly.goal}</span>
          {weekly.count >= weekly.goal && (
            <span className="text-[#00FF88] text-sm font-bold mb-0.5 ml-auto">目標達成</span>
          )}
        </div>
        <div className="h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00FF88] rounded-full transition-all"
            style={{ width: `${Math.min(100, (weekly.count / weekly.goal) * 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-auto pb-12">
        <button
          onClick={() => router.push('/')}
          className="w-full py-5 rounded-2xl bg-[#00FF88] text-[#0A0A0A] font-black text-lg active:scale-[0.97] transition-transform"
        >
          ホームへ戻る
        </button>
        <button
          onClick={() => router.push('/history')}
          className="w-full py-4 rounded-2xl text-[#555] font-bold text-base active:text-white transition-colors"
        >
          記録を見る
        </button>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <CompleteContent />
    </Suspense>
  );
}
