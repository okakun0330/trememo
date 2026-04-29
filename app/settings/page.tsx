'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWeeklyGoal, setWeeklyGoal, getUserName, setUserName } from '@/lib/storage';
import MuscleMouseMascot from '../components/MuscleMouseMascot';
import BottomNav from '../components/BottomNav';

export default function SettingsPage() {
  const router = useRouter();
  const [goal, setGoal] = useState(3);
  const [name, setName] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGoal(getWeeklyGoal());
    setName(getUserName());
  }, []);

  const saveAll = () => {
    setWeeklyGoal(goal);
    setUserName(name);
    setSavedMsg('保存しました ✓');
    setTimeout(() => setSavedMsg(''), 1800);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-[430px] mx-auto px-5 pb-28">

      {/* Header */}
      <div className="pt-14 pb-4 animate-fadeInUp">
        <h2 className="text-3xl font-black tracking-tight text-white">設定</h2>
      </div>

      {/* Mascot + speech bubble */}
      <div className="flex items-end gap-3 mb-6 animate-fadeInUp" style={{ animationDelay: '0.04s' }}>
        <div className="animate-float shrink-0">
          <MuscleMouseMascot size={90} />
        </div>
        <div className="relative bg-[#161616] border border-[#2A2A2A] rounded-2xl rounded-bl-none px-4 py-3 mb-2 flex-1"
          style={{ boxShadow: '0 0 14px rgba(0,255,136,0.06)' }}>
          <p className="text-sm font-bold text-[#00FF88] leading-snug">目標を設定して<br/>もっと強くなろう！</p>
          <p className="text-[10px] text-[#444] mt-1">プロフィールと目標を入力</p>
        </div>
      </div>

      {/* ── Section 1: User name ── */}
      <div className="mb-4 animate-fadeInUp" style={{ animationDelay: '0.08s' }}>
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5">
          <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">ニックネーム</p>
          <p className="text-[#444] text-xs mb-4">アプリ内で表示される名前を設定します</p>

          <div className="relative">
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：マッスル太郎"
              maxLength={20}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-base px-4 py-3.5 rounded-xl outline-none focus:border-[#00FF88] placeholder-[#333] transition-colors"
            />
            {name && (
              <button onClick={() => setName('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-[#2A2A2A] text-[#555]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 1l8 8M9 1l-8 8"/>
                </svg>
              </button>
            )}
          </div>
          <p className="text-[10px] text-[#333] mt-2 text-right">{name.length}/20</p>
        </div>
      </div>

      {/* ── Section 2: Weekly goal ── */}
      <div className="mb-5 animate-fadeInUp" style={{ animationDelay: '0.12s' }}>
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5">
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
                style={{ textShadow: '0 0 24px rgba(0,255,136,0.4)' }}>
                {goal}
              </span>
              <p className="text-[#444] text-sm mt-1">回 / 週</p>
            </div>
            <button
              onClick={() => setGoal((g) => Math.min(7, g + 1))}
              className="w-14 h-14 rounded-xl bg-[#00FF88] text-black text-2xl font-black flex items-center justify-center active:opacity-80 transition-opacity"
            >
              ＋
            </button>
          </div>

          {/* Day indicator dots */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i < goal ? '#00FF88' : '#222',
                  boxShadow: i < goal ? '0 0 6px rgba(0,255,136,0.5)' : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={saveAll}
        className={`w-full py-4 rounded-xl font-black text-base transition-all active:scale-[0.97] animate-fadeInUp ${
          savedMsg
            ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30'
            : 'bg-[#00FF88] text-black glow-btn'
        }`}
        style={{ animationDelay: '0.16s' }}
      >
        {savedMsg || '保存する'}
      </button>

      {/* App info */}
      <div className="mt-6 animate-fadeInUp" style={{ animationDelay: '0.20s' }}>
        <div className="bg-[#141414] border border-[#222] rounded-2xl divide-y divide-[#1A1A1A]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#666]">バージョン</span>
            <span className="text-sm text-[#333]">1.0.0</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#666]">データ保存先</span>
            <span className="text-sm text-[#333]">端末ローカル</span>
          </div>
          <button
            onClick={() => {
              if (confirm('全てのデータを削除しますか？この操作は取り消せません。')) {
                localStorage.clear();
                router.push('/');
              }
            }}
            className="w-full flex items-center justify-between px-5 py-3.5 active:bg-[#1A1A1A] transition-colors"
          >
            <span className="text-sm text-red-500">データをリセット</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 2L13 7l-4 5M2 7h11"/>
            </svg>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
