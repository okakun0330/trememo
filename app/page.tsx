'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getRecommendedBodyPart,
  getLastSession,
  getWeeklyStats,
  getWeeklyGoal,
} from '@/lib/storage';
import { BODY_PART_LABELS, BodyPart } from '@/lib/types';
import BodyPartIcon from './components/BodyPartIcon';

export default function HomePage() {
  const router = useRouter();
  const [recommended, setRecommended] = useState<BodyPart>('chest');
  const [lastDate, setLastDate] = useState<string | null>(null);
  const [weekly, setWeekly] = useState({ count: 0, goal: 3 });

  useEffect(() => {
    setRecommended(getRecommendedBodyPart());
    const last = getLastSession();
    if (last) {
      setLastDate(
        new Date(last.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })
      );
    }
    setWeekly(getWeeklyStats());
  }, []);

  const progressPct = Math.min(100, Math.round((weekly.count / weekly.goal) * 100));

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col max-w-[430px] mx-auto px-6">

      {/* Header */}
      <div className="pt-14 pb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">トレメモ</h1>
          <p className="text-[#555] text-sm mt-1 tracking-wide">前回より伸びたかが一瞬でわかる</p>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-[#222] text-[#555] active:text-white active:border-[#444] transition-colors"
          aria-label="設定"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
          </svg>
        </button>
      </div>

      {/* Weekly progress */}
      <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#555] uppercase tracking-widest">今週の達成</span>
          <span className="text-xs text-[#555]">目標 {weekly.goal}回</span>
        </div>
        <div className="flex items-end gap-3 mb-4">
          <span className="text-5xl font-black text-white leading-none">{weekly.count}</span>
          <span className="text-[#444] text-2xl font-light mb-1">/ {weekly.goal}</span>
          {weekly.count >= weekly.goal && (
            <span className="text-[#00FF88] text-sm font-bold mb-1 ml-auto">達成</span>
          )}
        </div>
        <div className="h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00FF88] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Recommended + Last session */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-4">
          <span className="text-xs text-[#555] uppercase tracking-widest block mb-3">おすすめ</span>
          <BodyPartIcon bodyPart={recommended} size={32} className="text-[#00FF88] mb-3" />
          <span className="text-xl font-black text-white">{BODY_PART_LABELS[recommended]}</span>
        </div>
        <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-4">
          <span className="text-xs text-[#555] uppercase tracking-widest block mb-3">前回</span>
          {lastDate ? (
            <>
              <div className="text-xl font-black text-white mt-3">{lastDate}</div>
              <div className="text-xs text-[#555] mt-1">トレーニング日</div>
            </>
          ) : (
            <div className="text-sm text-[#333] mt-6 leading-snug">まだ記録なし</div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3 flex-1">
        <button
          onClick={() => router.push(`/select?recommend=${recommended}`)}
          className="w-full py-5 rounded-2xl bg-[#00FF88] text-[#0A0A0A] font-black text-lg tracking-tight active:scale-[0.97] transition-transform"
        >
          {BODY_PART_LABELS[recommended]}でトレーニング開始
        </button>
        <button
          onClick={() => router.push('/select')}
          className="w-full py-5 rounded-2xl bg-[#111] border border-[#222] text-white font-bold text-lg active:scale-[0.97] transition-transform"
        >
          部位を選ぶ
        </button>
        <button
          onClick={() => router.push('/history')}
          className="w-full py-4 rounded-2xl text-[#555] font-bold text-base active:text-white transition-colors"
        >
          過去の記録
        </button>
      </div>

      <div className="h-10" />
    </div>
  );
}
