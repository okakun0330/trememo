'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessions, getPersonalBests, calculateEstimated1RM } from '@/lib/storage';
import { BODY_PART_LABELS, PersonalBest, WorkoutSession } from '@/lib/types';

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [pbs, setPBs] = useState<PersonalBest[]>([]);
  const [tab, setTab] = useState<'history' | 'pbs'>('history');

  useEffect(() => {
    setSessions([...getSessions()].reverse());
    setPBs(Object.values(getPersonalBests()).sort((a, b) => b.estimated1RM - a.estimated1RM));
  }, []);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    });

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white pb-16 max-w-md mx-auto">
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => router.back()} className="text-[#9CA3AF] mb-6 text-sm active:opacity-60">
          ← 戻る
        </button>
        <h2 className="text-2xl font-black">記録</h2>
      </div>

      {/* タブ */}
      <div className="px-6 mb-6">
        <div className="flex bg-[#2A2A2E] rounded-2xl p-1 gap-1">
          {(['history', 'pbs'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                tab === t ? 'bg-[#00FF88] text-[#0B0B0D]' : 'text-[#9CA3AF]'
              }`}
            >
              {t === 'history' ? '履歴' : '自己ベスト'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'history' && (
        <div className="px-6">
          {sessions.length === 0 ? (
            <Empty icon="📝" message="まだ記録がありません" />
          ) : (
            <div className="flex flex-col gap-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-[#2A2A2E] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF88] font-black">
                        {BODY_PART_LABELS[session.bodyPart]}
                      </span>
                      <span className="text-[#9CA3AF] text-sm">{fmtDate(session.date)}</span>
                    </div>
                    <span className="text-[#9CA3AF] text-sm font-bold">+{session.totalXP}XP</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {session.exercises.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{ex.exerciseName}</span>
                          {ex.isNewPB && (
                            <span className="text-[#00FF88] text-xs font-bold bg-[#00FF88]/10 px-2 py-0.5 rounded-full">
                              PB
                            </span>
                          )}
                        </div>
                        <span className="text-[#9CA3AF] text-sm">{ex.sets.length}セット</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'pbs' && (
        <div className="px-6">
          {pbs.length === 0 ? (
            <Empty icon="🏆" message="まだ記録がありません" />
          ) : (
            <div className="flex flex-col gap-4">
              {pbs.map((pb) => (
                <div key={pb.exerciseId} className="bg-[#2A2A2E] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-white text-lg">{pb.exerciseName}</span>
                    <span className="text-[#9CA3AF] text-xs">
                      {new Date(pb.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#3B82F6]">
                      {pb.weight % 1 === 0 ? pb.weight : pb.weight.toFixed(1)}
                    </span>
                    <span className="text-[#9CA3AF]">kg</span>
                    <span className="text-white text-xl font-bold mx-2">×</span>
                    <span className="text-4xl font-black text-[#3B82F6]">{pb.reps}</span>
                    <span className="text-[#9CA3AF]">回</span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    推定1RM: {pb.estimated1RM}kg
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Empty({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-[#9CA3AF]">{message}</p>
    </div>
  );
}
