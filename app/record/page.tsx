'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getLastExerciseRecord,
  getPersonalBest,
  calculateEstimated1RM,
  updatePersonalBest,
  getCurrentSession,
  setCurrentSession,
  addXP,
} from '@/lib/storage';
import { BodyPart, WorkoutSet } from '@/lib/types';

function Adjuster({
  label,
  value,
  unit,
  step,
  min,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  onChange: (v: number) => void;
}) {
  const fmt = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

  return (
    <div>
      <p className="text-xs text-[#9CA3AF] mb-2 uppercase tracking-wider">{label}</p>
      <div className="flex items-center justify-between bg-[#2A2A2E] rounded-2xl p-2">
        <button
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 10) / 10))}
          className="w-16 h-16 rounded-xl bg-[#1A1A1E] text-white text-3xl font-black active:scale-90 transition-transform flex items-center justify-center"
        >
          −
        </button>
        <div className="text-center flex-1">
          <span className="text-5xl font-black text-white">{fmt(value)}</span>
          <span className="text-[#9CA3AF] text-lg ml-1">{unit}</span>
        </div>
        <button
          onClick={() => onChange(Math.round((value + step) * 10) / 10)}
          className="w-16 h-16 rounded-xl bg-[#1A1A1E] text-white text-3xl font-black active:scale-90 transition-transform flex items-center justify-center"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

function RecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const exerciseId = searchParams.get('exerciseId') || '';
  const exerciseName = searchParams.get('exerciseName') || '';
  const bodyPart = (searchParams.get('bodyPart') as BodyPart) || 'chest';

  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [pb, setPB] = useState<{ weight: number; reps: number; estimated1RM: number } | null>(null);
  const [lastRecord, setLastRecord] = useState<{ sets: WorkoutSet[]; date: string } | null>(null);
  const [sessionPBExercises, setSessionPBExercises] = useState<string[]>([]);

  // リアルタイムPBメッセージ
  const [pbNotice, setPBNotice] = useState<{ text: string; type: 'warn' | 'success' } | null>(null);

  useEffect(() => {
    const last = getLastExerciseRecord(exerciseId);
    setLastRecord(last);
    if (last?.sets.length) {
      const bestSet = last.sets.reduce((best, s) =>
        calculateEstimated1RM(s.weight, s.reps) > calculateEstimated1RM(best.weight, best.reps)
          ? s
          : best
      );
      setWeight(bestSet.weight);
      setReps(bestSet.reps);
    }
    const existingPB = getPersonalBest(exerciseId);
    if (existingPB) {
      setPB({ weight: existingPB.weight, reps: existingPB.reps, estimated1RM: existingPB.estimated1RM });
    }
  }, [exerciseId]);

  // PB状態をリアルタイムチェック
  useEffect(() => {
    if (!pb) return;
    const current1RM = calculateEstimated1RM(weight, reps);
    if (current1RM > pb.estimated1RM) {
      if (weight > pb.weight) {
        setPBNotice({ text: '🏆 重量更新！', type: 'success' });
      } else {
        setPBNotice({ text: '🏆 自己ベスト更新！', type: 'success' });
      }
    } else if (calculateEstimated1RM(weight, reps + 1) > pb.estimated1RM) {
      setPBNotice({ text: '⚡ あと1回で自己ベスト！', type: 'warn' });
    } else {
      setPBNotice(null);
    }
  }, [weight, reps, pb]);

  const addSet = () => {
    const newSet: WorkoutSet = { weight, reps };
    setSets((prev) => [...prev, newSet]);

    const result = updatePersonalBest(exerciseId, exerciseName, weight, reps);
    if (result.isNewPB) {
      const updated = getPersonalBest(exerciseId);
      if (updated) setPB({ weight: updated.weight, reps: updated.reps, estimated1RM: updated.estimated1RM });
      setSessionPBExercises((prev) =>
        prev.includes(exerciseName) ? prev : [...prev, exerciseName]
      );
    }
  };

  const complete = () => {
    const finalSets = sets.length > 0 ? sets : [{ weight, reps }];
    let finalPBs = [...sessionPBExercises];

    if (sets.length === 0) {
      const result = updatePersonalBest(exerciseId, exerciseName, weight, reps);
      if (result.isNewPB && !finalPBs.includes(exerciseName)) {
        finalPBs = [...finalPBs, exerciseName];
      }
    }

    const totalXP = finalSets.length * 10 + finalPBs.length * 50;

    const session = getCurrentSession() ?? {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      bodyPart,
      exercises: [],
      totalXP: 0,
    };
    session.exercises.push({
      exerciseId,
      exerciseName,
      bodyPart,
      sets: finalSets,
      isNewPB: finalPBs.includes(exerciseName),
    });
    session.totalXP = (session.totalXP ?? 0) + totalXP;

    setCurrentSession(session);
    addXP(totalXP);
    router.push(`/complete?xp=${totalXP}&pbs=${finalPBs.length}`);
  };

  const lastMax = lastRecord?.sets.length
    ? lastRecord.sets.reduce((best, s) =>
        calculateEstimated1RM(s.weight, s.reps) > calculateEstimated1RM(best.weight, best.reps)
          ? s
          : best
      )
    : null;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white pb-36 max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => router.back()} className="text-[#9CA3AF] mb-6 text-sm active:opacity-60">
          ← 戻る
        </button>
        <h2 className="text-2xl font-black">{exerciseName}</h2>
      </div>

      {/* 前回MAX */}
      {lastMax && (
        <div className="px-6 mb-5">
          <div className="bg-[#2A2A2E] rounded-2xl p-5">
            <p className="text-xs text-[#9CA3AF] mb-2">
              前回MAX（{new Date(lastRecord!.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}）
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-[#3B82F6]">{lastMax.weight}</span>
              <span className="text-[#9CA3AF] text-lg">kg</span>
              <span className="text-white text-2xl font-bold mx-2">×</span>
              <span className="text-5xl font-black text-[#3B82F6]">{lastMax.reps}</span>
              <span className="text-[#9CA3AF] text-lg">回</span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-2">
              推定1RM: {calculateEstimated1RM(lastMax.weight, lastMax.reps)}kg
            </p>
          </div>
        </div>
      )}

      {/* PB通知 */}
      {pbNotice && (
        <div
          className={`mx-6 mb-5 rounded-2xl p-4 text-center font-black text-lg ${
            pbNotice.type === 'success'
              ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30'
              : 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30'
          }`}
        >
          {pbNotice.text}
        </div>
      )}

      {/* 入力 */}
      <div className="px-6 flex flex-col gap-4 mb-6">
        <Adjuster label="重量" value={weight} unit="kg" step={2.5} min={0} onChange={setWeight} />
        <Adjuster label="回数" value={reps} unit="回" step={1} min={1} onChange={setReps} />
      </div>

      {/* 記録済みセット */}
      {sets.length > 0 && (
        <div className="px-6 mb-4">
          <p className="text-xs text-[#9CA3AF] mb-3 uppercase tracking-wider">記録済みセット</p>
          <div className="flex flex-col gap-2">
            {sets.map((s, i) => (
              <div key={i} className="bg-[#2A2A2E] rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-[#9CA3AF] text-sm">Set {i + 1}</span>
                <span className="font-bold">
                  {s.weight % 1 === 0 ? s.weight : s.weight.toFixed(1)}kg × {s.reps}回
                </span>
                {sessionPBExercises.includes(exerciseName) && i === sets.length - 1 && (
                  <span className="text-[#00FF88] text-xs font-bold">PB</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 下部ボタン */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/95 to-transparent max-w-md mx-auto">
        <div className="flex gap-3">
          <button
            onClick={addSet}
            className="flex-1 py-5 rounded-2xl bg-[#2A2A2E] text-white font-black text-lg active:scale-[0.97] transition-transform"
          >
            セット追加
          </button>
          <button
            onClick={complete}
            className="flex-1 py-5 rounded-2xl bg-[#00FF88] text-[#0B0B0D] font-black text-lg active:scale-[0.97] transition-transform"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
          <div className="text-[#9CA3AF]">読み込み中…</div>
        </div>
      }
    >
      <RecordContent />
    </Suspense>
  );
}
