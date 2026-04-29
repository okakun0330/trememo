'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessions, getPersonalBests } from '@/lib/storage';
import { BODY_PART_LABELS, PersonalBest, WorkoutSession } from '@/lib/types';
import WorkoutCalendar from '../components/WorkoutCalendar';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}分`;
  return `${seconds}秒`;
}

function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-24">
      <div className="w-10 h-10 rounded-full border border-[#1F1F1F] flex items-center justify-center mx-auto mb-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 5v3M8 10v.5" />
        </svg>
      </div>
      <p className="text-[#333] text-sm">{message}</p>
    </div>
  );
}

const TABS = [
  { key: 'calendar', label: 'カレンダー' },
  { key: 'history',  label: '履歴' },
  { key: 'pbs',      label: '自己ベスト' },
] as const;
type Tab = typeof TABS[number]['key'];

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [pbs, setPBs] = useState<PersonalBest[]>([]);
  const [tab, setTab] = useState<Tab>('calendar');

  useEffect(() => {
    const all = getSessions();
    setSessions([...all].reverse());         // newest first for list
    setPBs(Object.values(getPersonalBests()).sort((a, b) => b.estimated1RM - a.estimated1RM));
  }, []);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-16 max-w-[430px] mx-auto">
      <div className="px-6 pt-14 pb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#555] mb-8 active:text-white transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          戻る
        </button>
        <h2 className="text-3xl font-black tracking-tight">記録</h2>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex bg-[#111] border border-[#1F1F1F] rounded-xl p-1 gap-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-colors ${
                tab === key ? 'bg-[#00FF88] text-[#0A0A0A]' : 'text-[#555]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar tab */}
      {tab === 'calendar' && (
        <div className="px-6">
          {sessions.length === 0 ? (
            <Empty message="まだトレーニング記録がありません" />
          ) : (
            /* Calendar receives sessions in chronological order */
            <WorkoutCalendar sessions={[...sessions].reverse()} />
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="px-6">
          {sessions.length === 0 ? (
            <Empty message="まだトレーニング記録がありません" />
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session) => {
                const totalSets = session.exercises.reduce((t, e) => t + e.sets.length, 0);
                return (
                  <div key={session.id} className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[#00FF88] font-black text-base">{BODY_PART_LABELS[session.bodyPart]}</span>
                        <span className="text-[#444] text-sm ml-3">{fmtDate(session.date)}</span>
                      </div>
                      <div className="text-right">
                        {session.durationSeconds > 0 && (
                          <div className="text-xs text-[#444]">{formatDuration(session.durationSeconds)}</div>
                        )}
                        <div className="text-xs text-[#555] mt-0.5">{totalSets}セット</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {session.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#777] text-sm">{ex.exerciseName}</span>
                            {ex.isNewPB && (
                              <span className="text-[9px] text-[#00FF88] font-bold border border-[#00FF88]/25 px-1.5 py-0.5 rounded">
                                PB
                              </span>
                            )}
                          </div>
                          <span className="text-[#444] text-xs">{ex.sets.length}セット</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PBs tab */}
      {tab === 'pbs' && (
        <div className="px-6">
          {pbs.length === 0 ? (
            <Empty message="まだ自己ベストの記録がありません" />
          ) : (
            <div className="flex flex-col gap-3">
              {pbs.map((pb) => (
                <div key={pb.exerciseId} className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-black text-white">{pb.exerciseName}</span>
                    <span className="text-[#444] text-xs mt-0.5">
                      {new Date(pb.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#3B82F6]">
                      {pb.weight % 1 === 0 ? pb.weight : pb.weight.toFixed(1)}
                    </span>
                    <span className="text-[#555] text-sm">kg</span>
                    <span className="text-[#2a2a2a] text-xl font-light mx-2">×</span>
                    <span className="text-4xl font-black text-[#3B82F6]">{pb.reps}</span>
                    <span className="text-[#555] text-sm">回</span>
                  </div>
                  <p className="text-xs text-[#444] mt-2">推定1RM: {pb.estimated1RM}kg</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
