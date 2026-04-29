'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWeeklyGoal, setWeeklyGoal } from '@/lib/storage';
import MuscleMouseMascot from '../components/MuscleMouseMascot';
import BottomNav from '../components/BottomNav';

const SETTING_MESSAGES = [
  '目標設定が成功の鍵だ！',
  'ルーティンを守れ！',
  'コツコツが最強だよ！',
];

export default function SettingsPage() {
  const router = useRouter();
  const [goal, setGoal] = useState(3);
  const [saved, setSaved] = useState(false);
  const [message] = useState(
    () => SETTING_MESSAGES[Math.floor(Math.random() * SETTING_MESSAGES.length)]
  );

  useEffect(() => {
    setGoal(getWeeklyGoal());
  }, []);

  const save = () => {
    setWeeklyGoal(goal);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-[430px] mx-auto px-6 pb-24">
      <div className="pt-14 pb-6 animate-fadeInUp">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#555] mb-8 active:text-white transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          戻る
        </button>
        <h2 className="text-3xl font-black tracking-tight text-white">設定</h2>
      </div>

      {/* Mascot + speech bubble */}
      <div className="flex items-center gap-4 mb-6 animate-fadeInUp" style={{ animationDelay: '0.04s' }}>
        <MuscleMouseMascot size={80} variant="small" />
        <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl rounded-bl-none px-4 py-3 flex-1"
          style={{ boxShadow: '0 0 12px rgba(0,255,136,0.06)' }}>
          <p className="text-sm font-bold text-[#00FF88]">{message}</p>
          <p className="text-[10px] text-[#444] mt-1">週の目標を設定しよう</p>
        </div>
      </div>

      {/* Weekly goal card */}
      <div
        className="bg-[#141414] border border-[#222] rounded-2xl p-5 mb-4 animate-fadeInUp"
        style={{ animationDelay: '0.08s' }}
      >
        <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">週のトレーニング目標</p>
        <p className="text-[#444] text-xs mb-5">週に何回トレーニングするか設定します</p>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setGoal((g) => Math.max(1, g - 1))}
            className="w-14 h-14 rounded-xl bg-[#00FF88] text-black text-2xl font-black flex items-center justify-center active:opacity-80 transition-opacity"
          >
            −
          </button>
          <div className="text-center">
            <span className="text-6xl font-black text-[#00FF88]"
              style={{ textShadow: '0 0 20px rgba(0,255,136,0.4)' }}>
              {goal}
            </span>
            <p className="text-[#555] text-sm mt-1">回 / 週</p>
          </div>
          <button
            onClick={() => setGoal((g) => Math.min(7, g + 1))}
            className="w-14 h-14 rounded-xl bg-[#00FF88] text-black text-2xl font-black flex items-center justify-center active:opacity-80 transition-opacity"
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
            : 'bg-[#00FF88] text-black glow-btn'
        }`}
      >
        {saved ? '保存しました ✓' : '保存する'}
      </button>

      {/* App info */}
      <div className="mt-8 animate-fadeInUp" style={{ animationDelay: '0.14s' }}>
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5">
          <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3">アプリについて</p>
          <div className="flex items-center justify-between py-2 border-b border-[#1F1F1F]">
            <span className="text-sm text-[#888]">バージョン</span>
            <span className="text-sm text-[#555]">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#888]">データ保存</span>
            <span className="text-sm text-[#555]">端末ローカル</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
