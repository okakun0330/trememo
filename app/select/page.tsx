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
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-[430px] mx-auto">

      {/* Header */}
      <div className="px-5 pt-14 pb-6 animate-fadeInUp">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#555] mb-8 active:text-white transition-colors text-sm"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 2.5L4.5 7.5 9 12.5" />
          </svg>
          戻る
        </button>
        <h2 className="text-3xl font-black tracking-tight text-white">部位を選ぶ</h2>
        <p className="text-[#555] text-xs mt-1.5">トレーニングする部位を選択</p>
      </div>

      {/* Photo card grid */}
      <div
        className="px-5 grid grid-cols-2 gap-3 pb-12 animate-fadeInUp"
        style={{ animationDelay: '0.08s' }}
      >
        {PARTS.map((key, idx) => {
          const isRec = key === recommend;
          const isCardio = key === 'cardio';

          if (isCardio) {
            // Full-width cardio card with heartbeat icon
            return (
              <button
                key={key}
                onClick={() => select(key)}
                className="col-span-2 relative rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
                style={{
                  height: 90,
                  background: 'linear-gradient(135deg, #0D1F14 0%, #061A0C 100%)',
                  border: '1px solid rgba(0,255,136,0.2)',
                  boxShadow: '0 0 20px rgba(0,255,136,0.1)',
                  animationDelay: `${idx * 0.04}s`,
                }}
              >
                {/* Heartbeat line decoration */}
                <div className="absolute inset-0 flex items-center opacity-20">
                  <svg viewBox="0 0 200 40" width="100%" preserveAspectRatio="none">
                    <polyline
                      points="0,20 30,20 45,5 55,35 65,8 75,20 120,20 135,5 145,35 155,8 165,20 200,20"
                      fill="none" stroke="#00FF88" strokeWidth="2"
                    />
                  </svg>
                </div>

                {isRec && (
                  <div className="absolute top-3 right-3 bg-[#00FF88] rounded-full px-2 py-0.5">
                    <span className="text-[9px] text-black font-black uppercase tracking-wider">REC</span>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center px-6 gap-4">
                  {/* Heartbeat icon */}
                  <div className="w-10 h-10 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <polyline
                        points="1,10 5,10 7.5,4 10,16 12.5,6 15,10 19,10"
                        stroke="#00FF88" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">{BODY_PART_LABELS[key]}</div>
                    <div className="text-[9px] text-[#00FF88]/60 tracking-widest mt-0.5">{BODY_PART_EN[key]}</div>
                  </div>
                </div>
              </button>
            );
          }

          return (
            <button
              key={key}
              onClick={() => select(key)}
              className="relative rounded-2xl overflow-hidden active:scale-[0.96] transition-transform"
              style={{
                aspectRatio: '3/4',
                animationDelay: `${idx * 0.04}s`,
                boxShadow: isRec ? '0 0 16px rgba(0,255,136,0.3)' : undefined,
              }}
            >
              {/* Photo background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${BODY_PART_PHOTOS[key]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center top',
                  backgroundColor: '#1A1A1A',
                }}
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 photo-card-overlay" />
              {/* Extra dark tint for dark theme */}
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />

              {/* Recommended badge */}
              {isRec && (
                <div className="absolute top-3 right-3 bg-[#00FF88] rounded-full px-2 py-0.5">
                  <span className="text-[9px] text-black font-black uppercase tracking-wider">REC</span>
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
                <div className="text-[9px] text-white/40 tracking-widest mt-0.5">
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
