'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentSession, setCurrentSession, saveSession, getWeeklyStats, getStreak } from '@/lib/storage';
import { BODY_PART_LABELS } from '@/lib/types';

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const xp = parseInt(searchParams.get('xp') || '0', 10);
  const pbCount = parseInt(searchParams.get('pbs') || '0', 10);
  const savedRef = useRef(false);

  const [weekly, setWeekly] = useState({ count: 0, goal: 3 });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const session = getCurrentSession();
    if (session) {
      saveSession({
        id: session.id,
        date: new Date().toISOString(),
        bodyPart: session.bodyPart,
        exercises: session.exercises,
        totalXP: session.totalXP,
      });
      setCurrentSession(null);
    }

    setWeekly(getWeeklyStats());
    setStreak(getStreak());
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      {/* 完了メッセージ */}
      <div className="text-center mb-10">
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-3xl font-black text-white mb-2">トレーニング完了！</h1>
        <p className="text-[#9CA3AF]">お疲れ様でした</p>
      </div>

      {/* 獲得XP */}
      <div className="bg-[#2A2A2E] rounded-3xl p-7 w-full mb-4 text-center">
        <p className="text-[#9CA3AF] text-sm mb-1">獲得XP</p>
        <div className="text-6xl font-black text-[#00FF88]">+{xp}</div>
        <p className="text-[#9CA3AF] text-sm mt-1">XP</p>
      </div>

      {/* 自己ベスト */}
      {pbCount > 0 && (
        <div className="bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-3xl p-6 w-full mb-4 text-center">
          <div className="text-5xl mb-2">🏆</div>
          <p className="text-[#00FF88] font-black text-xl">自己ベスト更新！</p>
          <p className="text-[#9CA3AF] text-sm mt-1">{pbCount}種目で記録を塗り替えました</p>
        </div>
      )}

      {/* 週・ストリーク */}
      <div className="grid grid-cols-2 gap-4 w-full mb-10">
        <div className="bg-[#2A2A2E] rounded-2xl p-5 text-center">
          <div className="text-4xl font-black text-white">
            {weekly.count}
            <span className="text-base font-normal text-[#9CA3AF]">/{weekly.goal}</span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">今週の達成</p>
          {weekly.count >= weekly.goal && (
            <p className="text-[#00FF88] text-xs mt-1 font-bold">目標達成！</p>
          )}
        </div>
        <div className="bg-[#2A2A2E] rounded-2xl p-5 text-center">
          <div className="text-4xl font-black text-white">{streak}</div>
          <p className="text-xs text-[#9CA3AF] mt-1">🔥 連続日</p>
        </div>
      </div>

      <button
        onClick={() => router.push('/')}
        className="w-full py-5 rounded-2xl bg-[#00FF88] text-[#0B0B0D] font-black text-lg active:scale-[0.97] transition-transform"
      >
        ホームに戻る
      </button>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
          <div className="text-[#9CA3AF]">読み込み中…</div>
        </div>
      }
    >
      <CompleteContent />
    </Suspense>
  );
}
