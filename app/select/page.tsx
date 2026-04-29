'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BODY_PART_LABELS, BODY_PART_EN, BodyPart } from '@/lib/types';
import { BODY_PART_PHOTOS } from '@/lib/photos';
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
    <div className="min-h-screen bg-[#080808] text-white max-w-[430px] mx-auto">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#444] mb-8 active:text-white transition-colors text-sm"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 2.5L4.5 7.5 9 12.5" />
          </svg>
          戻る
        </button>
        <h2 className="text-3xl font-black tracking-tight">部位を選ぶ</h2>
        <p className="text-[#444] text-xs mt-1.5">トレーニングする部位を選択</p>
      </div>

      {/* Photo card grid */}
      <div className="px-5 grid grid-cols-2 gap-3 pb-12">
        {PARTS.map((key) => {
          const isRec = key === recommend;
          return (
            <button
              key={key}
              onClick={() => select(key)}
              className="relative rounded-2xl overflow-hidden active:scale-[0.96] transition-transform"
              style={{ aspectRatio: '3/4' }}
            >
              {/* Photo background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${BODY_PART_PHOTOS[key]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center top',
                  backgroundColor: '#111',
                }}
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 photo-card-overlay" />
              {/* Recommended badge */}
              {isRec && (
                <div className="absolute top-3 right-3 bg-[#00FF88] rounded-full px-2 py-0.5">
                  <span className="text-[9px] text-[#080808] font-black uppercase tracking-wider">REC</span>
                </div>
              )}
              {/* Icon */}
              <div className="absolute top-3 left-3">
                <BodyPartIcon
                  bodyPart={key}
                  size={24}
                  className="text-[#00FF88]"
                />
              </div>
              {/* Label */}
              <div className="absolute bottom-3 left-3">
                <div className="text-2xl font-black text-white leading-tight">
                  {BODY_PART_LABELS[key]}
                </div>
                <div className="text-[9px] text-white/35 tracking-widest mt-0.5">
                  {BODY_PART_EN[key]}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
      <SelectContent />
    </Suspense>
  );
}
