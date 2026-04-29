'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWeeklyGoal, setWeeklyGoal } from '@/lib/storage';

export default function SettingsPage() {
  const router = useRouter();
  const [goal, setGoal] = useState(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setGoal(getWeeklyGoal());
  }, []);

  const save = () => {
    setWeeklyGoal(goal);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111] max-w-[430px] mx-auto px-6">
      <div className="pt-14 pb-8 animate-fadeInUp">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#BBBBBB] mb-8 active:text-[#111] transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          戻る
        </button>
        <h2 className="text-3xl font-black tracking-tight text-[#111]">設定</h2>
      </div>

      {/* Weekly goal card */}
      <div
        className="bg-white border border-[#EBEBEB] rounded-2xl p-5 mb-4 shadow-sm animate-fadeInUp"
        style={{ animationDelay: '0.06s' }}
      >
        <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-1">週のトレーニング目標</p>
        <p className="text-[#AAAAAA] text-xs mb-5">週に何回トレーニングするか設定します</p>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setGoal((g) => Math.max(1, g - 1))}
            className="w-14 h-14 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] text-2xl font-black flex items-center justify-center active:bg-[#EBEBEB] transition-colors"
          >
            −
          </button>
          <div className="text-center">
            <span className="text-6xl font-black text-[#111]">{goal}</span>
            <p className="text-[#AAAAAA] text-sm mt-1">回 / 週</p>
          </div>
          <button
            onClick={() => setGoal((g) => Math.min(7, g + 1))}
            className="w-14 h-14 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] text-2xl font-black flex items-center justify-center active:bg-[#EBEBEB] transition-colors"
          >
            ＋
          </button>
        </div>
      </div>

      <button
        onClick={save}
        className={`w-full py-4 rounded-xl font-black text-base transition-all active:scale-[0.97] shadow-sm ${
          saved
            ? 'bg-[#00DD77]/20 text-[#00AA55] border border-[#00DD77]/30'
            : 'bg-[#00DD77] text-black'
        }`}
      >
        {saved ? '保存しました ✓' : '保存する'}
      </button>
    </div>
  );
}
