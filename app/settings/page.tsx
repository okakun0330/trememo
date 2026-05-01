'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWeeklyGoal, setWeeklyGoal } from '@/lib/storage';
import BottomNav from '../components/BottomNav';

export default function SettingsPage() {
  const router = useRouter();
  const [goal, setGoal] = useState(3);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    setGoal(getWeeklyGoal());
  }, []);

  const saveAll = () => {
    setWeeklyGoal(goal);
    setSavedMsg('保存しました ✓');
    setTimeout(() => setSavedMsg(''), 1800);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-[430px] mx-auto px-5 pb-28">

      {/* Header */}
      <div className="pt-14 pb-6 animate-fadeInUp">
        <h2 className="text-3xl font-black tracking-tight text-white">設定</h2>
        <p className="text-white text-sm mt-1">プロフィールとトレーニング目標を設定</p>
      </div>

      {/* ── Section: Weekly goal ── */}
      <div className="mb-5 animate-fadeInUp" style={{ animationDelay: '0.10s' }}>
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5">
          <p className="text-xs text-white uppercase tracking-widest mb-1 font-bold">週のトレーニング目標</p>
          <p className="text-white text-xs mb-5 opacity-60">週に何回トレーニングするか設定します</p>
          <div className="flex items-center justify-between">
            <button onClick={() => setGoal((g) => Math.max(1, g - 1))}
              className="w-14 h-14 rounded-xl bg-[#00FF88] text-black text-2xl font-black flex items-center justify-center active:opacity-80 transition-opacity">
              −
            </button>
            <div className="text-center">
              <span className="text-6xl font-black text-[#00FF88]"
                style={{ textShadow: '0 0 24px rgba(0,255,136,0.4)' }}>
                {goal}
              </span>
              <p className="text-white text-sm mt-1 opacity-60">回 / 週</p>
            </div>
            <button onClick={() => setGoal((g) => Math.min(7, g + 1))}
              className="w-14 h-14 rounded-xl bg-[#00FF88] text-black text-2xl font-black flex items-center justify-center active:opacity-80 transition-opacity">
              ＋
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i < goal ? '#00FF88' : '#2A2A2A',
                  boxShadow: i < goal ? '0 0 6px rgba(0,255,136,0.5)' : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <button onClick={saveAll}
        className={`w-full py-4 rounded-xl font-black text-base transition-all active:scale-[0.97] animate-fadeInUp ${
          savedMsg
            ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30'
            : 'bg-[#00FF88] text-black glow-btn'
        }`}
        style={{ animationDelay: '0.14s' }}>
        {savedMsg || '保存する'}
      </button>

      {/* App info */}
      <div className="mt-6 animate-fadeInUp" style={{ animationDelay: '0.18s' }}>
        <div className="bg-[#141414] border border-[#222] rounded-2xl divide-y divide-[#1A1A1A]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-white">バージョン</span>
            <span className="text-sm text-white opacity-40">1.0.0</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-white">データ保存先</span>
            <span className="text-sm text-white opacity-40">端末ローカル</span>
          </div>
          <button
            onClick={() => {
              if (confirm('全てのデータを削除しますか？この操作は取り消せません。')) {
                localStorage.clear();
                router.push('/');
              }
            }}
            className="w-full flex items-center justify-between px-5 py-3.5 active:bg-[#1A1A1A] transition-colors">
            <span className="text-sm text-red-400">データをリセット</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 2L13 7l-4 5M2 7h11"/>
            </svg>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
