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
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-[430px] mx-auto px-6">
      <div className="pt-14 pb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#555] mb-8 active:text-white transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          戻る
        </button>
        <h2 className="text-3xl font-black tracking-tight">設定</h2>
      </div>

      {/* Weekly goal */}
      <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-5 mb-4">
        <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">週のトレーニング目標</p>
        <p className="text-[#444] text-xs mb-5">週に何回トレーニングするか設定します</p>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setGoal((g) => Math.max(1, g - 1))}
            className="w-14 h-14 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-white text-2xl font-black flex items-center justify-center active:bg-[#252525] transition-colors"
          >
            −
          </button>
          <div className="text-center">
            <span className="text-6xl font-black text-white">{goal}</span>
            <p className="text-[#555] text-sm mt-1">回 / 週</p>
          </div>
          <button
            onClick={() => setGoal((g) => Math.min(7, g + 1))}
            className="w-14 h-14 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-white text-2xl font-black flex items-center justify-center active:bg-[#252525] transition-colors"
          >
            ＋
          </button>
        </div>
      </div>

      <button
        onClick={save}
        className={`w-full py-4 rounded-xl font-black text-base transition-all active:scale-[0.97] ${
          saved
            ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30'
            : 'bg-[#00FF88] text-[#0A0A0A]'
        }`}
      >
        {saved ? '保存しました' : '保存する'}
      </button>
    </div>
  );
}
