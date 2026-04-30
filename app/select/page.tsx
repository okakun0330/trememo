'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { BODY_PART_LABELS, BODY_PART_EN, BodyPart } from '@/lib/types';
import { startNewSession } from '@/lib/storage';

const PARTS: BodyPart[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];

// Per-body-part accent color
const PART_COLOR: Record<BodyPart, string> = {
  chest:     '#FF4455',
  back:      '#00CC88',
  legs:      '#4499FF',
  shoulders: '#9944FF',
  arms:      '#FF8800',
  abs:       '#FF44BB',
  cardio:    '#00FF88',
};

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

      {/* Header */}
      <div className="px-5 pt-14 pb-5 flex items-center gap-3 animate-fadeInUp">
        <button onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[#222] text-[#555] active:text-white shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-black text-white">部位を選ぶ</h2>
          <p className="text-[#444] text-xs mt-0.5">トレーニングする部位を選択</p>
        </div>
      </div>

      {/* Card grid */}
      <div className="px-5 grid grid-cols-2 gap-3 pb-12 animate-fadeInUp" style={{ animationDelay: '0.06s' }}>
        {PARTS.map((key) => {
          const isRec   = key === recommend;
          const color   = PART_COLOR[key];
          const isCardio = key === 'cardio';

          if (isCardio) {
            return (
              <button key={key} onClick={() => select(key)}
                className="col-span-2 relative rounded-2xl overflow-hidden active:scale-[0.98] transition-transform flex items-center gap-0"
                style={{
                  height: 120,
                  background: '#0D0D0D',
                  border: `1.5px solid ${color}33`,
                  boxShadow: `0 0 24px ${color}18, 0 4px 16px rgba(0,0,0,0.5)`,
                }}>
                {/* Anatomy image on right */}
                <div className="absolute right-0 top-0 bottom-0 w-44 z-0">
                  <Image
                    src="/anatomy/cardio.png"
                    alt="cardio"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                  {/* Fade overlay toward left */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, #0D0D0D 0%, #0D0D0D 20%, transparent 80%)' }} />
                </div>

                {/* Label */}
                <div className="relative z-10 px-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    {isRec && (
                      <span className="text-[9px] font-black text-black bg-[#00FF88] px-1.5 py-0.5 rounded">REC</span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-white">{BODY_PART_LABELS[key]}</div>
                  <div className="text-[10px] tracking-widest mt-0.5 font-bold" style={{ color: `${color}BB` }}>
                    {BODY_PART_EN[key]}
                  </div>
                </div>

                {/* Arrow */}
                <div className="relative z-10 ml-auto mr-5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={`${color}88`} strokeWidth="1.8" strokeLinecap="round">
                    <path d="M5 3l5 5-5 5"/>
                  </svg>
                </div>
              </button>
            );
          }

          return (
            <button key={key} onClick={() => select(key)}
              className="relative rounded-2xl overflow-hidden active:scale-[0.96] transition-transform flex flex-col"
              style={{
                aspectRatio: '3/4',
                background: '#0D0D0D',
                border: `1.5px solid ${color}33`,
                boxShadow: isRec
                  ? `0 0 0 2px ${color}55, 0 0 24px ${color}22, 0 4px 16px rgba(0,0,0,0.6)`
                  : `0 0 18px ${color}12, 0 4px 16px rgba(0,0,0,0.6)`,
              }}>

              {/* Anatomy image fills card */}
              <div className="absolute inset-0">
                <Image
                  src={`/anatomy/${key}.png`}
                  alt={key}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'top center' }}
                />
                {/* Bottom gradient for text */}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(13,13,13,0.05) 30%, rgba(0,0,0,0.88) 100%)' }} />
                {/* Top gradient for REC badge */}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%)' }} />
              </div>

              {/* REC badge */}
              {isRec && (
                <div className="absolute top-3 right-3 z-10 bg-[#00FF88] rounded px-1.5 py-0.5">
                  <span className="text-[8px] text-black font-black">REC</span>
                </div>
              )}

              {/* Label at bottom */}
              <div className="absolute bottom-0 left-0 right-0 z-10 px-3.5 pb-3.5 pt-2">
                <div className="text-[1.15rem] font-black text-white leading-tight">
                  {BODY_PART_LABELS[key]}
                </div>
                <div className="text-[9px] tracking-widest mt-0.5 font-bold" style={{ color: `${color}CC` }}>
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
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <SelectContent />
    </Suspense>
  );
}
