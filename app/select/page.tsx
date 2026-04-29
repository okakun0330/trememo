'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { BODY_PART_LABELS, BODY_PART_EN, BodyPart } from '@/lib/types';
import BodyPartIcon from '../components/BodyPartIcon';
import { startNewSession } from '@/lib/storage';

const PARTS: BodyPart[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];

// Per-body-part glow color
const PART_COLOR: Record<BodyPart, string> = {
  chest:     '#FF4455',
  back:      '#00CC88',
  legs:      '#4499FF',
  shoulders: '#9944FF',
  arms:      '#FF8800',
  abs:       '#FF44BB',
  cardio:    '#00FF88',
};

function CardMascot({ bodyPart, size = 90 }: { color: string; bodyPart: BodyPart; size?: number }) {
  return (
    <Image
      src={`/mascot/${bodyPart}.png`}
      alt={bodyPart}
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  );
}

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
        {PARTS.map((key, idx) => {
          const isRec   = key === recommend;
          const color   = PART_COLOR[key];
          const isCardio = key === 'cardio';

          if (isCardio) {
            return (
              <button key={key} onClick={() => select(key)}
                className="col-span-2 relative rounded-2xl overflow-hidden active:scale-[0.98] transition-transform flex items-center gap-4 px-6 py-4"
                style={{
                  background: `linear-gradient(135deg, #0D1810 0%, #071209 100%)`,
                  border: `1.5px solid ${color}33`,
                  boxShadow: `0 0 20px ${color}18, 0 4px 16px rgba(0,0,0,0.5)`,
                  animationDelay: `${idx * 0.04}s`,
                }}>
                {/* Heartbeat bg */}
                <div className="absolute inset-0 opacity-10 flex items-center">
                  <svg viewBox="0 0 260 40" width="100%" preserveAspectRatio="none">
                    <polyline points="0,20 35,20 50,5 60,35 70,8 82,20 130,20 145,5 155,35 165,8 178,20 230,20 245,5 255,35 260,20"
                      fill="none" stroke={color} strokeWidth="2"/>
                  </svg>
                </div>
                {/* Mascot */}
                <div className="relative z-10 shrink-0">
                  <CardMascot color={color} bodyPart={key} />
                </div>
                {/* Label */}
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color }}><BodyPartIcon bodyPart={key} size={18} /></span>
                    {isRec && <span className="text-[9px] font-black text-black bg-[#00FF88] px-1.5 py-0.5 rounded">REC</span>}
                  </div>
                  <div className="text-2xl font-black text-white">{BODY_PART_LABELS[key]}</div>
                  <div className="text-[10px] tracking-widest mt-0.5" style={{ color: `${color}99` }}>
                    {BODY_PART_EN[key]}
                  </div>
                </div>
                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={`${color}88`} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 3l5 5-5 5"/>
                </svg>
              </button>
            );
          }

          return (
            <button key={key} onClick={() => select(key)}
              className="relative rounded-2xl overflow-hidden active:scale-[0.96] transition-transform flex flex-col items-center pt-5 pb-4 px-3"
              style={{
                aspectRatio: '3/4',
                background: '#0D0D0D',
                border: `1.5px solid ${color}30`,
                boxShadow: `0 0 18px ${color}15, 0 4px 16px rgba(0,0,0,0.6)`,
                animationDelay: `${idx * 0.04}s`,
              }}>

              {/* Colored top glow */}
              <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}20 0%, transparent 70%)` }} />

              {/* Icon + REC */}
              <div className="absolute top-3 left-3 z-10">
                <span style={{ color }}><BodyPartIcon bodyPart={key} size={16} /></span>
              </div>
              {isRec && (
                <div className="absolute top-3 right-3 z-10 bg-[#00FF88] rounded-full px-1.5 py-0.5">
                  <span className="text-[8px] text-black font-black">REC</span>
                </div>
              )}

              {/* Mascot */}
              <div className="flex-1 flex items-center justify-center relative z-10 mt-2">
                <div style={{ filter: `drop-shadow(0 0 10px ${color}55)` }}>
                  <CardMascot color={color} bodyPart={key} />
                </div>
              </div>

              {/* Label */}
              <div className="relative z-10 w-full px-1">
                <div className="text-lg font-black text-white leading-tight">{BODY_PART_LABELS[key]}</div>
                <div className="text-[9px] tracking-widest mt-0.5" style={{ color: `${color}88` }}>
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
