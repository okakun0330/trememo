'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRecommendedBodyPart, getLastSession, getWeeklyStats } from '@/lib/storage';
import { BODY_PART_LABELS, BODY_PART_EN, BodyPart } from '@/lib/types';
import { BODY_PART_PHOTOS } from '@/lib/photos';
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
        new Date(last.date).toLocaleDateString('ja-JP', {
          month: 'numeric',
          day: 'numeric',
          weekday: 'short',
        })
      );
    }
    setWeekly(getWeeklyStats());
  }, []);

  const progressPct = Math.min(100, Math.round((weekly.count / weekly.goal) * 100));

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col max-w-[430px] mx-auto px-5">
      {/* ── Header ── */}
      <div className="pt-14 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[2.6rem] font-black tracking-tight leading-none text-white">
            トレメモ
          </h1>
          <p className="text-[#444] text-xs mt-1.5 tracking-wide">前回より伸びたかが一瞬でわかる</p>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-[#1F1F1F] text-[#444] active:text-white active:border-[#333] transition-colors"
          aria-label="設定"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7.5" cy="7.5" r="2" />
            <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.9 2.9l1.1 1.1M11 11l1.1 1.1M2.9 12.1L4 11M11 4l1.1-1.1" />
          </svg>
        </button>
      </div>

      {/* ── Weekly progress ── */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-[#444] uppercase tracking-widest">今週の達成</span>
          <span className="text-[10px] text-[#333]">目標 {weekly.goal}回</span>
        </div>
        <div className="flex items-end gap-2 mb-3.5">
          <span className="text-5xl font-black text-white leading-none">{weekly.count}</span>
          <span className="text-[#2a2a2a] text-2xl font-light mb-1">/ {weekly.goal}</span>
          {weekly.count >= weekly.goal && (
            <span className="text-[#00FF88] text-xs font-bold mb-1 ml-auto">達成</span>
          )}
        </div>
        <div className="h-0.5 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00FF88] rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Recommended card (photo bg) + Last session ── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Recommended — photo card */}
        <div
          className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer active:scale-[0.97] transition-transform"
          style={{
            backgroundImage: `url(${BODY_PART_PHOTOS[recommended]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundColor: '#111',
          }}
          onClick={() => router.push(`/select?recommend=${recommended}`)}
        >
          {/* gradient overlay */}
          <div className="absolute inset-0 photo-card-overlay" />
          {/* icon */}
          <div className="absolute top-3 left-3">
            <span className="text-[9px] text-[#00FF88] font-bold uppercase tracking-widest">おすすめ</span>
          </div>
          <div className="absolute top-7 left-3">
            <BodyPartIcon bodyPart={recommended} size={26} className="text-[#00FF88]" />
          </div>
          {/* label */}
          <div className="absolute bottom-3 left-3">
            <div className="text-2xl font-black text-white leading-tight">
              {BODY_PART_LABELS[recommended]}
            </div>
            <div className="text-[9px] text-white/40 tracking-widest mt-0.5">
              {BODY_PART_EN[recommended]}
            </div>
          </div>
        </div>

        {/* Last session */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-4 aspect-[3/4] flex flex-col">
          <span className="text-[9px] text-[#444] uppercase tracking-widest block mb-auto">前回</span>
          {lastDate ? (
            <div>
              <div className="text-lg font-black text-white leading-snug">{lastDate}</div>
              <div className="text-[10px] text-[#333] mt-1">トレーニング日</div>
            </div>
          ) : (
            <div className="text-xs text-[#222] leading-snug">まだ<br />記録なし</div>
          )}
        </div>
      </div>

      {/* ── CTA buttons ── */}
      <div className="flex flex-col gap-3 pb-12">
        <button
          onClick={() => router.push(`/select?recommend=${recommended}`)}
          className="w-full py-[18px] rounded-2xl bg-[#00FF88] text-[#080808] font-black text-lg tracking-tight active:scale-[0.97] transition-transform"
        >
          {BODY_PART_LABELS[recommended]}でトレーニング開始
        </button>
        <button
          onClick={() => router.push('/select')}
          className="w-full py-[18px] rounded-2xl bg-[#111] border border-[#1a1a1a] text-white font-bold text-base active:scale-[0.97] transition-transform"
        >
          部位を選ぶ
        </button>
        <button
          onClick={() => router.push('/history')}
          className="w-full py-3 text-[#444] font-medium text-sm active:text-white transition-colors"
        >
          過去の記録を見る
        </button>
      </div>
    </div>
  );
}
