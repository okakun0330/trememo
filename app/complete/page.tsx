'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getWeeklyStats, getLastSessionSummary, SessionSummary } from '@/lib/storage';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}時間${String(m).padStart(2, '0')}分`;
  if (m > 0) return `${m}分${String(s).padStart(2, '0')}秒`;
  return `${s}秒`;
}

// ── Confetti ──────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#00FF88', '#FFD700', '#FF6B6B', '#60A5FA', '#A78BFA', '#FBBF24'];
function Confetti() {
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${3 + (i * 2.9) % 94}%`,
    delay: `${(i * 0.09) % 1.6}s`,
    duration: `${1.8 + (i * 0.06) % 1.4}s`,
    size: 5 + (i % 5) * 2,
    shape: i % 3,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      {pieces.map((p) => (
        <div key={p.id} className="absolute top-0"
          style={{
            left: p.left, width: p.size, height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '2px' : '0',
            transform: p.shape === 2 ? 'scaleX(0.4)' : undefined,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sets = parseInt(searchParams.get('sets') || '0', 10);
  const duration = parseInt(searchParams.get('duration') || '0', 10);
  const [weekly, setWeekly] = useState({ count: 0, goal: 3 });
  const [showConfetti, setShowConfetti] = useState(true);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  useEffect(() => {
    setWeekly(getWeeklyStats());
    setSummary(getLastSessionSummary());
    const t = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const progressPct = Math.min(100, Math.round((weekly.count / weekly.goal) * 100));
  const goalAchieved = weekly.count >= weekly.goal;
  const bodyPart = summary?.bodyPart ?? 'chest';
  const hasPB = summary?.hasPB ?? false;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col max-w-[430px] mx-auto px-5 relative overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Hero: anatomy image + title */}
      <div className="pt-10 pb-1 flex flex-col items-center animate-fadeInUp">
        {/* Body-part anatomy image with glow */}
        <div className="relative animate-float mb-3">
          <div className="absolute inset-0 rounded-full bg-[#00FF88]/10 blur-2xl scale-150" />
          <div className="relative w-[160px] h-[160px] rounded-2xl overflow-hidden border border-[#00FF88]/20"
            style={{ boxShadow: '0 0 40px rgba(0,255,136,0.15)' }}>
            <Image
              src={`/anatomy/${bodyPart}.png`}
              alt={bodyPart}
              width={160}
              height={160}
              style={{ objectFit: 'cover', objectPosition: 'top center' }}
              priority
            />
          </div>
          {hasPB && (
            <div className="absolute -top-2 -right-2 bg-[#FFD700] text-black text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ boxShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
              NEW RECORD
            </div>
          )}
        </div>
        <h1 className="text-3xl font-black text-white mt-1 mb-1 text-center">トレーニング完了！</h1>
        <p className="text-white/40 text-sm">
          {goalAchieved ? '今週の目標達成！最高だ！🎉' : 'お疲れ様でした！'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 animate-fadeInUp" style={{ animationDelay: '0.07s' }}>
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">トレーニング時間</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="6"/>
                <path d="M7 4v3l2 2"/>
              </svg>
            </div>
            <div className="text-lg font-black text-white">{formatDuration(duration)}</div>
          </div>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5 glow-green-sm">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">総セット数</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#00FF88" strokeWidth="1.5">
                <rect x="1" y="1" width="4.5" height="4.5" rx="1"/><rect x="7.5" y="1" width="4.5" height="4.5" rx="1"/>
                <rect x="1" y="7.5" width="4.5" height="4.5" rx="1"/><rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1"/>
              </svg>
            </div>
            <div className="text-3xl font-black text-[#00FF88]"
              style={{ textShadow: '0 0 12px rgba(0,255,136,0.4)' }}>
              {sets}<span className="text-base ml-0.5">セット</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise summary */}
      {summary && summary.exercises.length > 0 && (
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 mb-4 animate-fadeInUp" style={{ animationDelay: '0.10s' }}>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">実施内容</p>
          <div className="flex flex-col gap-2">
            {summary.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#2A2A2A] shrink-0">
                  <Image
                    src={`/anatomy/${ex.bodyPart}.png`}
                    alt={ex.bodyPart}
                    width={36}
                    height={36}
                    style={{ objectFit: 'cover', objectPosition: 'top center' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{ex.name}</span>
                    {ex.isNewPB && (
                      <span className="text-[8px] font-black text-[#FFD700] border border-[#FFD700]/30 bg-[#FFD700]/10 px-1.5 py-0.5 rounded shrink-0">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/40">{ex.setsLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly progress */}
      <div className="bg-[#141414] border border-[#222] rounded-2xl p-5 mb-6 animate-fadeInUp" style={{ animationDelay: '0.14s' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-white/40 uppercase tracking-widest">今週の達成</p>
          {goalAchieved && <span className="text-xs text-[#00FF88] font-bold">目標達成！🎉</span>}
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-black text-[#00FF88] leading-none"
            style={{ textShadow: '0 0 16px rgba(0,255,136,0.4)' }}>{weekly.count}</span>
          <span className="text-white/20 text-2xl font-light mb-0.5">/ {weekly.goal}</span>
        </div>
        <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #00BB66, #00FF88)',
              boxShadow: '0 0 8px rgba(0,255,136,0.5)',
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-auto pb-12 animate-fadeInUp" style={{ animationDelay: '0.18s' }}>
        <button onClick={() => router.push('/')}
          className="w-full py-5 rounded-2xl bg-[#00FF88] text-black font-black text-lg active:scale-[0.97] transition-transform glow-btn">
          ホームへ戻る
        </button>
        <button onClick={() => router.push('/history')}
          className="w-full py-4 rounded-2xl border border-[#2A2A2A] bg-[#141414] text-white/50 font-bold text-base active:scale-[0.97] transition-transform">
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
