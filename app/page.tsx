'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getRecommendedBodyPart,
  getLastSession,
  getWeeklyStats,
  getStreak,
  getXP,
} from '@/lib/storage';
import { BODY_PART_LABELS, BodyPart } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [recommended, setRecommended] = useState<BodyPart>('chest');
  const [lastDate, setLastDate] = useState<string | null>(null);
  const [weekly, setWeekly] = useState({ count: 0, goal: 3 });
  const [streak, setStreak] = useState(0);
  const [xp, setXP] = useState(0);

  useEffect(() => {
    setRecommended(getRecommendedBodyPart());
    const last = getLastSession();
    if (last) {
      setLastDate(
        new Date(last.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
      );
    }
    setWeekly(getWeeklyStats());
    setStreak(getStreak());
    setXP(getXP());
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-4xl font-black tracking-widest text-[#00FF88]">TREMEMO</h1>
        <p className="text-[#9CA3AF] text-sm mt-1">前回より伸びたかが一瞬でわかる</p>
      </div>

      {/* Stats Row */}
      <div className="px-6 grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#2A2A2E] rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-[#00FF88]">
            {weekly.count}
            <span className="text-sm font-normal text-[#9CA3AF]">/{weekly.goal}</span>
          </div>
          <div className="text-xs text-[#9CA3AF] mt-1">今週</div>
        </div>
        <div className="bg-[#2A2A2E] rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-white">{streak}</div>
          <div className="text-xs text-[#9CA3AF] mt-1">🔥 連続日</div>
        </div>
        <div className="bg-[#2A2A2E] rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-[#3B82F6]">{xp.toLocaleString()}</div>
          <div className="text-xs text-[#9CA3AF] mt-1">XP</div>
        </div>
      </div>

      {/* Recommended */}
      <div className="px-6 mb-8">
        <div className="bg-[#2A2A2E] rounded-2xl p-5">
          <div className="text-xs text-[#9CA3AF] mb-1">今日のおすすめ</div>
          <div className="text-4xl font-black text-white mb-1">
            {BODY_PART_LABELS[recommended]}
          </div>
          {lastDate ? (
            <div className="text-xs text-[#9CA3AF]">前回トレーニング: {lastDate}</div>
          ) : (
            <div className="text-xs text-[#00FF88]">さあ始めよう！</div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 flex flex-col gap-4 flex-1">
        <button
          onClick={() => router.push(`/exercise?bodyPart=${recommended}`)}
          className="w-full py-5 rounded-2xl bg-[#00FF88] text-[#0B0B0D] font-black text-lg active:scale-[0.97] transition-transform"
        >
          {BODY_PART_LABELS[recommended]}で開始
        </button>
        <button
          onClick={() => router.push('/select')}
          className="w-full py-5 rounded-2xl bg-[#2A2A2E] text-white font-bold text-lg active:scale-[0.97] transition-transform"
        >
          部位を選ぶ
        </button>
        <button
          onClick={() => router.push('/history')}
          className="w-full py-5 rounded-2xl border border-[#2A2A2E] text-[#9CA3AF] font-bold text-lg active:scale-[0.97] transition-transform"
        >
          過去の記録
        </button>
      </div>

      <div className="h-12" />
    </div>
  );
}
