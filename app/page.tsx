'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  getWeeklyStats, getLastSession, getUserName,
  recordBodyWeight, getLatestBodyWeight,
} from '@/lib/storage';
import BottomNav from './components/BottomNav';

const MESSAGES = [
  '今回も限界を超えろ！',
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
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  // Body weight state
  const [bwInput, setBwInput] = useState('');
  const [prevWeight, setPrevWeight] = useState<number | null>(null);
  const [bwSaved, setBwSaved] = useState(false);

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
    const latest = getLatestBodyWeight();
    if (latest) {
      setPrevWeight(latest.weight);
      const today = new Date().toISOString().split('T')[0];
      if (latest.date === today) setBwInput(String(latest.weight));
    }
  }, []);

  const handleBwSave = () => {
    const w = parseFloat(bwInput);
    if (!isNaN(w) && w > 0) {
      recordBodyWeight(w);
      setPrevWeight(w);
      setBwSaved(true);
      setTimeout(() => setBwSaved(false), 2000);
    }
  };

  const progressPct = Math.min(100, Math.round((weekly.count / weekly.goal) * 100));

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-[430px] mx-auto pb-28 overflow-x-hidden">

      {/* Header */}
      <div className="px-5 pt-12 flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="text-[2.6rem] font-black tracking-tight leading-none text-[#00FF88]"
            style={{ textShadow: '0 0 24px rgba(0,255,136,0.4)' }}>
            トレメモ
          </h1>
          <p className="text-white/40 text-[11px] mt-1">前回より伸びたかが一瞬でわかる</p>
        </div>
        <button onClick={() => router.push('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-[#222] text-[#555] active:text-white bg-[#141414]">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7.5" cy="7.5" r="2" />
            <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.9 2.9l1.1 1.1M11 11l1.1 1.1M2.9 12.1L4 11M11 4l1.1-1.1" />
          </svg>
        </button>
      </div>

      {/* Hero: speech bubble + anatomy figure */}
      <div className="relative flex items-end px-5 pt-2 pb-0 animate-fadeInUp" style={{ animationDelay: '0.04s' }}>
        <div className="flex-1 pb-4 pr-2 z-10">
          {userName && (
            <p className="text-[10px] text-[#555] mb-1.5">{userName}、お疲れ様！</p>
          )}
          <div className="relative bg-[#141414] border border-[#2A2A2A] rounded-2xl rounded-bl-none px-4 py-3 inline-block max-w-[200px]"
            style={{ boxShadow: '0 0 14px rgba(0,255,136,0.06)' }}>
            <p className="text-sm font-black text-white leading-snug">{message}</p>
          </div>
        </div>
        <div className="shrink-0 relative" style={{ marginRight: -12 }}>
          <Image
            src="/anatomy/hero.png"
            alt="figure"
            width={170}
            height={170}
            style={{ objectFit: 'contain', objectPosition: 'bottom' }}
            priority
          />
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3">

        {/* Weekly stats */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5 animate-fadeInUp"
          style={{ animationDelay: '0.08s', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/50 uppercase tracking-widest">今週の達成</span>
            <span className="text-[10px] text-white/40">目標 {weekly.goal}回</span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-5xl font-black text-[#00FF88] leading-none"
              style={{ textShadow: '0 0 20px rgba(0,255,136,0.4)' }}>
              {weekly.count}
            </span>
            <span className="text-white/20 text-3xl font-light mb-1">/ {weekly.goal}</span>
            {weekly.count >= weekly.goal && (
              <span className="text-[#00FF88] text-xs font-bold mb-1 ml-auto px-2 py-0.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20">
                達成！🎉
              </span>
            )}
          </div>
          <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #00BB66, #00FF88)',
                boxShadow: '0 0 10px rgba(0,255,136,0.5)',
              }} />
          </div>
          {lastDate && <p className="text-[10px] text-white/30 mt-2">前回：{lastDate}</p>}
        </div>

        {/* Body weight quick record */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl px-4 py-3.5 flex items-center gap-3 animate-fadeInUp"
          style={{ animationDelay: '0.11s' }}>
          <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round">
              <path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"/>
              <path d="M5 2V1M11 2V1M3 6h10"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-tight">体重</p>
            {prevWeight && (
              <p className="text-[9px] text-white/30 mt-0.5">前回: {prevWeight}kg</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
              <input
                type="number"
                inputMode="decimal"
                value={bwInput}
                onChange={(e) => setBwInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBwSave()}
                placeholder="00.0"
                className="w-16 text-center text-white text-sm font-bold bg-transparent outline-none px-2 py-2 placeholder-[#333]"
              />
              <span className="text-white/40 text-xs pr-2">kg</span>
            </div>
            <button onClick={handleBwSave}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                bwSaved
                  ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/25'
                  : 'bg-[#00FF88] text-black'
              }`}>
              {bwSaved ? '✓' : '記録'}
            </button>
          </div>
        </div>

        {/* CTA buttons */}
        <button onClick={() => router.push('/select')}
          className="w-full py-5 rounded-2xl bg-[#00FF88] text-black font-black text-lg active:scale-[0.97] transition-transform glow-btn flex items-center justify-center gap-2 animate-fadeInUp"
          style={{ animationDelay: '0.14s' }}>
          今日のトレーニング開始
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 9h10M10 4l5 5-5 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button onClick={() => router.push('/history')}
          className="w-full py-4 rounded-2xl bg-[#141414] border border-[#222] text-white/60 font-bold text-base active:scale-[0.97] transition-transform flex items-center justify-center gap-2 animate-fadeInUp"
          style={{ animationDelay: '0.17s' }}>
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
