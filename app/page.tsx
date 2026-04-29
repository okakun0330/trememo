'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWeeklyStats, getLastSession } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();
  const [weekly, setWeekly] = useState({ count: 0, goal: 3 });
  const [lastDate, setLastDate] = useState<string | null>(null);

  useEffect(() => {
    setWeekly(getWeeklyStats());
    const last = getLastSession();
    if (last) {
      setLastDate(
        new Date(last.date).toLocaleDateString('ja-JP', {
          month: 'numeric',
          day: 'numeric',
          weekday: 'short',
        })
      );
    }
  }, []);

  const progressPct = Math.min(100, Math.round((weekly.count / weekly.goal) * 100));

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111] flex flex-col max-w-[430px] mx-auto px-5">

      {/* Header */}
      <div className="pt-16 pb-8 flex items-end justify-between animate-fadeInUp">
        <div>
          <h1 className="text-[3.2rem] font-black tracking-tight leading-none text-[#00DD77]">
            トレメモ
          </h1>
          <p className="text-[#AAAAAA] text-xs mt-2 tracking-wide">前回より伸びたかが一瞬でわかる</p>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E8E8E8] text-[#BBBBBB] active:text-[#111] active:border-[#CCC] transition-colors bg-white shadow-sm"
          aria-label="設定"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7.5" cy="7.5" r="2" />
            <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.9 2.9l1.1 1.1M11 11l1.1 1.1M2.9 12.1L4 11M11 4l1.1-1.1" />
          </svg>
        </button>
      </div>

      {/* Weekly progress */}
      <div
        className="bg-white border border-[#EBEBEB] rounded-2xl p-5 mb-5 shadow-sm animate-fadeInUp"
        style={{ animationDelay: '0.06s' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-[#BBBBBB] uppercase tracking-widest">今週の達成</span>
          <span className="text-[10px] text-[#CCCCCC]">目標 {weekly.goal}回</span>
        </div>
        <div className="flex items-end gap-2 mb-3.5">
          <span className="text-5xl font-black text-[#111] leading-none">{weekly.count}</span>
          <span className="text-[#CCCCCC] text-2xl font-light mb-1">/ {weekly.goal}</span>
          {weekly.count >= weekly.goal && (
            <span className="text-[#00AA55] text-xs font-bold mb-1 ml-auto">達成！</span>
          )}
        </div>
        <div className="h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00DD77] rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {lastDate && (
          <p className="text-[10px] text-[#CCCCCC] mt-3">前回：{lastDate}</p>
        )}
      </div>

      {/* CTA buttons */}
      <div
        className="flex flex-col gap-3 pb-12 animate-fadeInUp"
        style={{ animationDelay: '0.12s' }}
      >
        <button
          onClick={() => router.push('/select')}
          className="w-full py-5 rounded-2xl bg-[#00DD77] text-black font-black text-lg active:scale-[0.97] transition-transform shadow-sm"
        >
          今日のトレーニング開始
        </button>
        <button
          onClick={() => router.push('/history')}
          className="w-full py-5 rounded-2xl bg-white border border-[#E8E8E8] text-[#111] font-bold text-base active:scale-[0.97] transition-transform shadow-sm"
        >
          過去の記録を見る
        </button>
      </div>
    </div>
  );
}
