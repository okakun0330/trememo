'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWeeklyStats, getLastSession, getUserName } from '@/lib/storage';
import MuscleMouseMascot from './components/MuscleMouseMascot';
import BottomNav from './components/BottomNav';

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
  const [userName, setUserName] = useState('');
  const [message] = useState(
    () => MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)]
  );

  useEffect(() => {
    setWeekly(getWeeklyStats());
    const last = getLastSession();
    if (last) {
      setLastDate(
        new Date(last.date).toLocaleDateString('ja-JP', {
          month: 'numeric', day: 'numeric', weekday: 'short',
        })
      );
    }
    setUserName(getUserName());
  }, []);

  const progressPct = Math.min(100, Math.round((weekly.count / weekly.goal) * 100));

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col max-w-[430px] mx-auto px-5 pb-28">

      {/* Header */}
      <div className="pt-14 pb-1 flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="text-[2.8rem] font-black tracking-tight leading-none text-[#00FF88]"
            style={{ textShadow: '0 0 24px rgba(0,255,136,0.4)' }}>
            トレメモ
          </h1>
          <p className="text-[#444] text-xs mt-1">前回より伸びたかが一眼でわかる</p>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-[#222] text-[#555] active:text-white bg-[#141414]"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7.5" cy="7.5" r="2" />
            <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.9 2.9l1.1 1.1M11 11l1.1 1.1M2.9 12.1L4 11M11 4l1.1-1.1" />
          </svg>
        </button>
      </div>

      {/* Mascot + speech bubble */}
      <div className="flex items-end gap-3 py-4 animate-fadeInUp" style={{ animationDelay: '0.05s' }}>
        <div className="animate-float shrink-0">
          <MuscleMouseMascot size={140} />
        </div>
        <div className="flex flex-col gap-1 pb-3">
          {userName && (
            <p className="text-[10px] text-[#444] font-medium">
              {userName}、お疲れ様！
            </p>
          )}
          {/* Speech bubble */}
          <div className="relative bg-[#161616] border border-[#2A2A2A] rounded-2xl rounded-bl-none px-4 py-3"
            style={{ boxShadow: '0 0 14px rgba(0,255,136,0.08)' }}>
            <p className="text-sm font-bold text-[#00FF88] leading-snug">{message}</p>
          </div>
        </div>
      </div>

      {/* Weekly progress */}
      <div
        className="bg-[#141414] border border-[#222] rounded-2xl p-5 mb-4 animate-fadeInUp"
        style={{ animationDelay: '0.10s', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-[#555] uppercase tracking-widest">今週の達成</span>
          <span className="text-[10px] text-[#444]">目標 {weekly.goal}回</span>
        </div>
        <div className="flex items-end gap-2 mb-3.5">
          <span className="text-5xl font-black text-[#00FF88] leading-none"
            style={{ textShadow: '0 0 20px rgba(0,255,136,0.4)' }}>
            {weekly.count}
          </span>
          <span className="text-[#333] text-3xl font-light mb-1">/ {weekly.goal}</span>
          {weekly.count >= weekly.goal && (
            <span className="text-[#00FF88] text-xs font-bold mb-1 ml-auto animate-pulse-green px-2 py-0.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20">
              達成！🎉
            </span>
          )}
        </div>
        <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #00BB66, #00FF88)',
              boxShadow: '0 0 10px rgba(0,255,136,0.5)',
            }}
          />
        </div>
        {lastDate && (
          <p className="text-[10px] text-[#333] mt-3">前回：{lastDate}</p>
        )}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
        <button
          onClick={() => router.push('/select')}
          className="w-full py-5 rounded-2xl bg-[#00FF88] text-black font-black text-lg active:scale-[0.97] transition-transform glow-btn flex items-center justify-center gap-2"
        >
          今日のトレーニング開始
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 9h10M10 4l5 5-5 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={() => router.push('/history')}
          className="w-full py-4 rounded-2xl bg-[#141414] border border-[#222] text-[#888] font-bold text-base active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1,12 5,8 8,10 11,5 15,7"/>
          </svg>
          過去の記録を見る
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
