'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getWeeklyStats } from '@/lib/storage';
import MuscleMouseMascot from '../components/MuscleMouseMascot';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}時間${String(m).padStart(2, '0')}分`;
  if (m > 0) return `${m}分${String(s).padStart(2, '0')}秒`;
  return `${s}秒`;
}

/* ── Confetti piece ── */
const CONFETTI_COLORS = ['#00FF88', '#FFD700', '#FF6B6B', '#60A5FA', '#A78BFA', '#FBBF24'];
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${5 + (i * 3.3) % 90}%`,
    delay: `${(i * 0.12) % 1.8}s`,
    duration: `${2.0 + (i * 0.07) % 1.2}s`,
    size: 6 + (i % 4) * 2,
    rotate: i % 2 === 0 ? 'scaleX(0.5)' : undefined,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? '2px' : '0',
            transform: p.rotate,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sets = parseInt(searchParams.get('sets') || '0', 10);
  const duration = parseInt(searchParams.get('duration') || '0', 10);
  const [weekly, setWeekly] = useState({ count: 0, goal: 3 });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setWeekly(getWeeklyStats());
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const progressPct = Math.min(100, Math.round((weekly.count / weekly.goal) * 100));
  const goalAchieved = weekly.count >= weekly.goal;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col max-w-[430px] mx-auto px-6 relative overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Mascot celebrate */}
      <div className="pt-16 pb-2 flex flex-col items-center animate-fadeInUp">
        <div className="animate-float">
          <MuscleMouseMascot size={130} variant="celebrate" />
        </div>
        <h1 className="text-3xl font-black text-white mt-3 mb-1">トレーニング完了！</h1>
        <p className="text-[#555] text-sm">
          {goalAchieved ? '今週の目標達成！最高だ！🎉' : 'お疲れ様でした！'}
        </p>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 gap-3 mb-4 animate-fadeInUp"
        style={{ animationDelay: '0.07s' }}
      >
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5 text-center">
          <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">トレーニング時間</p>
          <div className="text-xl font-black text-white">{formatDuration(duration)}</div>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5 text-center glow-green-sm">
          <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">総セット数</p>
          <div className="text-3xl font-black text-[#00FF88]">{sets}</div>
        </div>
      </div>

      {/* Weekly progress */}
      <div
        className="bg-[#141414] border border-[#222] rounded-2xl p-5 mb-8 animate-fadeInUp"
        style={{ animationDelay: '0.12s' }}
      >
        <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3">今週の達成</p>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-black text-white leading-none">{weekly.count}</span>
          <span className="text-[#444] text-xl font-light mb-0.5">/ {weekly.goal}</span>
          {goalAchieved && (
            <span className="text-[#00FF88] text-sm font-bold mb-0.5 ml-auto">目標達成！</span>
          )}
        </div>
        <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00FF88] rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, boxShadow: '0 0 8px rgba(0,255,136,0.5)' }}
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
          className="w-full py-5 rounded-2xl bg-[#00FF88] text-black font-black text-lg active:scale-[0.97] transition-transform glow-btn"
        >
          ホームへ戻る
        </button>
        <button
          onClick={() => router.push('/history')}
          className="w-full py-4 rounded-2xl border border-[#2A2A2A] bg-[#161616] text-[#666] font-bold text-base active:scale-[0.97] transition-transform"
        >
          記録を見る
        </button>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <CompleteContent />
    </Suspense>
  );
}
