'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getExercisesByBodyPart, addOrUpdateExercise } from '@/lib/storage';
import { BODY_PART_LABELS, BodyPart, Exercise } from '@/lib/types';

function ExerciseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bodyPart = (searchParams.get('bodyPart') as BodyPart) || 'chest';

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExercises(getExercisesByBodyPart(bodyPart));
  }, [bodyPart]);

  const startExercise = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const ex = addOrUpdateExercise(trimmed, bodyPart);
    router.push(
      `/record?exerciseId=${ex.id}&exerciseName=${encodeURIComponent(ex.name)}&bodyPart=${bodyPart}`
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white max-w-md mx-auto">
      <div className="px-6 pt-14 pb-8">
        <button onClick={() => router.back()} className="text-[#9CA3AF] mb-6 text-sm active:opacity-60">
          ← 戻る
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black">種目を選ぶ</h2>
          <span className="text-[#00FF88] text-sm bg-[#00FF88]/10 px-3 py-1 rounded-full font-bold">
            {BODY_PART_LABELS[bodyPart]}
          </span>
        </div>
      </div>

      {exercises.length > 0 && (
        <div className="px-6 mb-8">
          <p className="text-xs text-[#9CA3AF] mb-3 uppercase tracking-wider">よく使う種目</p>
          <div className="flex flex-col gap-3">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => startExercise(ex.name)}
                className="bg-[#2A2A2E] rounded-2xl px-5 py-4 flex items-center justify-between active:scale-[0.97] transition-transform"
              >
                <span className="font-bold text-lg text-white">{ex.name}</span>
                <span className="text-[#9CA3AF] text-sm">{ex.usageCount}回使用</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-6">
        <p className="text-xs text-[#9CA3AF] mb-3 uppercase tracking-wider">
          {exercises.length > 0 ? 'または新しく入力' : '種目を入力'}
        </p>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && startExercise(input)}
          placeholder="例：ベンチプレス"
          className="w-full bg-[#2A2A2E] text-white text-lg px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#00FF88] placeholder-[#4B5563] mb-4"
        />
        <button
          onClick={() => startExercise(input)}
          disabled={!input.trim()}
          className="w-full py-5 rounded-2xl bg-[#00FF88] text-[#0B0B0D] font-black text-lg active:scale-[0.97] transition-transform disabled:opacity-30 disabled:active:scale-100"
        >
          この種目で開始
        </button>
      </div>
    </div>
  );
}

export default function ExercisePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
          <div className="text-[#9CA3AF]">読み込み中…</div>
        </div>
      }
    >
      <ExerciseContent />
    </Suspense>
  );
}
