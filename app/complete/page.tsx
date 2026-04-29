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

  const progressPct = Math.min(100, Math.round((weekly.count / weekly.goal) * 100));

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111] flex flex-col max-w-[430px] mx-auto px-6">

      {/* Check icon */}
      <div className="pt-20 pb-10 text-center animate-fadeInUp">
        <div className="w-16 h-16 rounded-full border-2 border-[#00DD77] flex items-center justify-center mx-auto mb-6 bg-white shadow-sm">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#00DD77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 14l6 6L23 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-[#111] mb-2">トレーニング完了</h1>
        <p className="text-[#AAAAAA] text-sm">お疲れ様でした！</p>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 gap-3 mb-4 animate-fadeInUp"
        style={{ animationDelay: '0.07s' }}
      >
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 text-center shadow-sm">
          <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-2">トレーニング時間</p>
          <div className="text-xl font-black text-[#111]">{formatDuration(duration)}</div>
        </div>
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 text-center shadow-sm">
          <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-2">総セット数</p>
          <div className="text-3xl font-black text-[#00AA55]">{sets}</div>
        </div>
      </div>

      {/* Weekly progress */}
      <div
        className="bg-white border border-[#EBEBEB] rounded-2xl p-5 mb-8 shadow-sm animate-fadeInUp"
        style={{ animationDelay: '0.12s' }}
      >
        <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-3">今週の達成</p>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-black text-[#111] leading-none">{weekly.count}</span>
          <span className="text-[#CCCCCC] text-xl font-light mb-0.5">/ {weekly.goal}</span>
          {weekly.count >= weekly.goal && (
            <span className="text-[#00AA55] text-sm font-bold mb-0.5 ml-auto">目標達成！</span>
          )}
        </div>
        <div className="h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00DD77] rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex flex-col gap-3 mt-auto pb-12 animate-fadeInUp"
        style={{ animationDelay: '0.18s' }}
      >
        <button
          onClick={() => router.push('/')}
          className="w-full py-5 rounded-2xl bg-[#00DD77] text-black font-black text-lg active:scale-[0.97] transition-transform shadow-sm"
        >
          ホームへ戻る
        </button>
        <button
          onClick={() => router.push('/history')}
          className="w-full py-4 rounded-2xl border border-[#E8E8E8] bg-white text-[#555] font-bold text-base active:scale-[0.97] transition-transform shadow-sm"
        >
          記録を見る
        </button>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F7]" />}>
      <CompleteContent />
    </Suspense>
  );
}
