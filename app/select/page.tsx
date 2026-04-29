'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

// Minimalist SVG mascot for each card (compact inline version)
function CardMascot({ color, bodyPart }: { color: string; bodyPart: BodyPart }) {
  // Cardio gets special animated heartbeat version
  if (bodyPart === 'cardio') {
    return (
      <svg viewBox="0 0 80 80" width="80" height="80">
        <defs>
          <radialGradient id={`cg-${bodyPart}`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F5E0C0"/>
            <stop offset="100%" stopColor="#D4A870"/>
          </radialGradient>
        </defs>
        {/* Ears */}
        <ellipse cx="20" cy="16" rx="11" ry="11" fill="#C8A070"/>
        <ellipse cx="20" cy="16" rx="7" ry="7" fill="#F9AABB"/>
        <ellipse cx="60" cy="16" rx="11" ry="11" fill="#C8A070"/>
        <ellipse cx="60" cy="16" rx="7" ry="7" fill="#F9AABB"/>
        {/* Head */}
        <ellipse cx="40" cy="34" rx="21" ry="20" fill={`url(#cg-${bodyPart})`}/>
        {/* Headband */}
        <path d="M20 26 Q40 20 60 26 Q60 30 40 24 Q20 30 20 26Z" fill={color}/>
        {/* Eyes */}
        <circle cx="32" cy="33" r="5" fill="white"/>
        <circle cx="33" cy="33.5" r="3.5" fill="#1A0800"/>
        <circle cx="34" cy="32" r="1.3" fill="white"/>
        <circle cx="48" cy="33" r="5" fill="white"/>
        <circle cx="49" cy="33.5" r="3.5" fill="#1A0800"/>
        <circle cx="50" cy="32" r="1.3" fill="white"/>
        {/* Smile */}
        <path d="M32 42 Q40 49 48 42" stroke="#8B5A2B" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Body */}
        <ellipse cx="40" cy="65" rx="16" ry="14" fill={`url(#cg-${bodyPart})`}/>
        <ellipse cx="40" cy="66" rx="13" ry="12" fill="#111"/>
        {/* Arms running pose */}
        <ellipse cx="20" cy="58" rx="7" ry="11" fill={`url(#cg-${bodyPart})`} transform="rotate(30 20 58)"/>
        <ellipse cx="60" cy="60" rx="7" ry="11" fill={`url(#cg-${bodyPart})`} transform="rotate(-30 60 60)"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <radialGradient id={`sg-${bodyPart}`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E0C0"/>
          <stop offset="100%" stopColor="#D4A870"/>
        </radialGradient>
        <radialGradient id={`mg-${bodyPart}`} cx="30%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#ECC898"/>
          <stop offset="100%" stopColor="#C8965A"/>
        </radialGradient>
      </defs>
      {/* Ears */}
      <ellipse cx="18" cy="15" rx="11" ry="11" fill="#C8A070"/>
      <ellipse cx="18" cy="15" rx="7"  ry="7"  fill="#F9AABB"/>
      <ellipse cx="62" cy="15" rx="11" ry="11" fill="#C8A070"/>
      <ellipse cx="62" cy="15" rx="7"  ry="7"  fill="#F9AABB"/>
      {/* Head */}
      <ellipse cx="40" cy="34" rx="21" ry="20" fill={`url(#sg-${bodyPart})`}/>
      {/* Headband with color */}
      <path d="M20 26 Q40 20 60 26 Q60 30 40 24 Q20 30 20 26Z" fill={color}/>
      {/* Eyes */}
      <circle cx="32" cy="33" r="5.5" fill="white"/>
      <circle cx="33" cy="33.5" r="4" fill="#1A0800"/>
      <circle cx="34.5" cy="32" r="1.5" fill="white"/>
      <circle cx="48" cy="33" r="5.5" fill="white"/>
      <circle cx="49" cy="33.5" r="4" fill="#1A0800"/>
      <circle cx="50.5" cy="32" r="1.5" fill="white"/>
      {/* Smile */}
      <path d="M32 42 Q40 49 48 42" stroke="#8B5A2B" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Neck */}
      <rect x="36" y="51" width="8" height="6" rx="3" fill="#D4A870"/>
      {/* Body */}
      <ellipse cx="40" cy="68" rx="17" ry="14" fill={`url(#sg-${bodyPart})`}/>
      <ellipse cx="40" cy="69" rx="13" ry="11" fill="#111"/>
      {/* Left arm (flex) */}
      <ellipse cx="18" cy="62" rx="7" ry="11" fill={`url(#sg-${bodyPart})`} transform="rotate(-30 18 62)"/>
      <ellipse cx="12" cy="52" rx="8" ry="6" fill={`url(#mg-${bodyPart})`}/>
      {/* Right arm (flex) */}
      <ellipse cx="62" cy="62" rx="7" ry="11" fill={`url(#sg-${bodyPart})`} transform="rotate(30 62 62)"/>
      <ellipse cx="68" cy="52" rx="8" ry="6" fill={`url(#mg-${bodyPart})`}/>
      {/* Color highlight on relevant body part */}
      {bodyPart === 'chest' && <ellipse cx="40" cy="66" rx="9" ry="7" fill={color} opacity="0.35"/>}
      {bodyPart === 'back' && <ellipse cx="40" cy="68" rx="12" ry="8" fill={color} opacity="0.25"/>}
      {bodyPart === 'arms' && <><ellipse cx="12" cy="52" rx="8" ry="6" fill={color} opacity="0.5"/><ellipse cx="68" cy="52" rx="8" ry="6" fill={color} opacity="0.5"/></>}
      {bodyPart === 'shoulders' && <><ellipse cx="22" cy="57" rx="7" ry="5" fill={color} opacity="0.5"/><ellipse cx="58" cy="57" rx="7" ry="5" fill={color} opacity="0.5"/></>}
      {bodyPart === 'legs' && <><ellipse cx="30" cy="79" rx="6" ry="5" fill={color} opacity="0.6"/><ellipse cx="50" cy="79" rx="6" ry="5" fill={color} opacity="0.6"/></>}
      {bodyPart === 'abs' && <><line x1="40" y1="60" x2="40" y2="75" stroke={color} strokeWidth="1.5" opacity="0.5"/><line x1="33" y1="63" x2="47" y2="63" stroke={color} strokeWidth="1" opacity="0.4"/><line x1="33" y1="68" x2="47" y2="68" stroke={color} strokeWidth="1" opacity="0.4"/></>}
    </svg>
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
