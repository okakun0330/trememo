'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWeeklyStats, getLastSession } from '@/lib/storage';
import MuscleMouseMascot from './components/MuscleMouseMascot';

const MASCOT_MESSAGES = [
  '今日も限界を超えろ！',
  '前回の自分を越えよう！',
  '筋肉は裏切らない！',
  '一歩一歩が成長だ！',
  '今日のトレが未来を作る！',
];

export default function HomePage() {
  const router = useRouter();
  const [weekly, setWeekly] = useState({ count: 0, goal: 3 });
  const [lastDate, setLastDate] = useState<string | null>(null);
  const [message] = useState(
    () => MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)]
  );

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
      <div className="pt-14 pb-2 flex items-center justify-between animate-fadeInUp">
        <h1 className="text-[2.8rem] font-black tracking-tight leading-none text-[#00DD77]">
          トレメモ
        </h1>
        <button
          onClick={() => router.push('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E8E8E8] text-[#BBBBBB] active:text-[#111] bg-white shadow-sm"
          aria-label="設定"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7.5" cy="7.5" r="2" />
            <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.9 2.9l1.1 1.1M11 11l1.1 1.1M2.9 12.1L4 11M11 4l1.1-1.1" />
          </svg>
        </button>
      </div>

      {/* Mascot + speech bubble */}
      <div
        className="flex flex-col items-center py-4 animate-fadeInUp"
        style={{ animationDelay: '0.05s' }}
      >
        {/* Speech bubble */}
        <div className="relative bg-white border border-[#E8E8E8] rounded-2xl px-4 py-2.5 mb-3 shadow-sm max-w-[220px]">
          <p className="text-sm font-bold text-[#111] text-center leading-snug">{message}</p>
          {/* tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '8px solid white',
              filter: 'drop-shadow(0 1px 0 #E8E8E8)',
            }}
          />
        </div>
        <MuscleMouseMascot size={120} />
      </div>

      {/* Weekly progress */}
      <div
        className="bg-white border border-[#EBEBEB] rounded-2xl p-5 mb-4 shadow-sm animate-fadeInUp"
        style={{ animationDelay: '0.10s' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-[#BBBBBB] uppercase tracking-widest">今週の達成</span>
          <span className="text-[10px] text-[#CCCCCC]">目標 {weekly.goal}回</span>
        </div>
        <div className="flex items-end gap-2 mb-3.5">
          <span className="text-5xl font-black text-[#111] leading-none">{weekly.count}</span>
          <span className="text-[#CCCCCC] text-2xl font-light mb-1">/ {weekly.goal}</span>
          {weekly.count >= weekly.goal && (
            <span className="text-[#00AA55] text-xs font-bold mb-1 ml-auto">達成！🎉</span>
          )}
        </div>
        <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
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
        style={{ animationDelay: '0.15s' }}
      >
        <button
          onClick={() => router.push('/select')}
          className="w-full py-5 rounded-2xl bg-[#00DD77] text-black font-black text-lg active:scale-[0.97] transition-transform shadow-sm"
        >
          今日のトレーニング開始 💪
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
