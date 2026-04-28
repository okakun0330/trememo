'use client';

import { useRouter } from 'next/navigation';
import { BODY_PART_LABELS, BODY_PART_EMOJIS, BodyPart } from '@/lib/types';

const PARTS: BodyPart[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];

export default function SelectPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white max-w-md mx-auto">
      <div className="px-6 pt-14 pb-8">
        <button
          onClick={() => router.back()}
          className="text-[#9CA3AF] mb-6 text-sm active:opacity-60"
        >
          ← 戻る
        </button>
        <h2 className="text-2xl font-black">部位を選ぶ</h2>
      </div>

      <div className="px-6 grid grid-cols-2 gap-4">
        {PARTS.map((key) => (
          <button
            key={key}
            onClick={() => router.push(`/exercise?bodyPart=${key}`)}
            className="bg-[#2A2A2E] rounded-2xl p-6 text-left active:scale-[0.97] active:bg-[#3A3A3E] transition-all"
          >
            <div className="text-3xl mb-3">{BODY_PART_EMOJIS[key]}</div>
            <div className="text-xl font-black">{BODY_PART_LABELS[key]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
