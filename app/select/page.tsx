'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BODY_PART_LABELS, BODY_PART_EN, BodyPart } from '@/lib/types';
import BodyPartIcon from '../components/BodyPartIcon';
import { startNewSession } from '@/lib/storage';

const PARTS: BodyPart[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];

function SelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recommend = searchParams.get('recommend') as BodyPart | null;

  const select = (bodyPart: BodyPart) => {
    startNewSession(bodyPart);
    router.push(`/session?bodyPart=${bodyPart}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-[430px] mx-auto">
      <div className="px-6 pt-14 pb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#555] mb-8 active:text-white transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          戻る
        </button>
        <h2 className="text-3xl font-black tracking-tight">部位を選ぶ</h2>
        <p className="text-[#555] text-sm mt-1">トレーニングする部位を選択</p>
      </div>

      <div className="px-6 grid grid-cols-2 gap-3">
        {PARTS.map((key) => {
          const isRecommended = key === recommend;
          return (
            <button
              key={key}
              onClick={() => select(key)}
              className={`relative rounded-2xl p-5 text-left active:scale-[0.96] transition-all ${
                isRecommended
                  ? 'bg-[#00FF88]/10 border border-[#00FF88]/40'
                  : 'bg-[#111] border border-[#1F1F1F] active:border-[#333]'
              }`}
            >
              {isRecommended && (
                <span className="absolute top-3 right-3 text-[10px] text-[#00FF88] font-bold uppercase tracking-widest">REC</span>
              )}
              <BodyPartIcon
                bodyPart={key}
                size={36}
                className={`mb-4 ${isRecommended ? 'text-[#00FF88]' : 'text-[#444]'}`}
              />
              <div className={`text-xl font-black ${isRecommended ? 'text-white' : 'text-white'}`}>
                {BODY_PART_LABELS[key]}
              </div>
              <div className="text-[10px] text-[#444] mt-0.5 tracking-widest">{BODY_PART_EN[key]}</div>
            </button>
          );
        })}
      </div>

      <div className="h-12" />
    </div>
  );
}

export default function SelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <SelectContent />
    </Suspense>
  );
}
