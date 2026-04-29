'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessions, getPersonalBests } from '@/lib/storage';
import { BODY_PART_LABELS, PersonalBest, WorkoutSession } from '@/lib/types';
import WorkoutCalendar from '../components/WorkoutCalendar';
import ExerciseProgressChart from '../components/ExerciseProgressChart';

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
      <div className="w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center mx-auto mb-4 bg-white shadow-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 5v3M8 10v.5" />
        </svg>
      </div>
      <p className="text-[#BBBBBB] text-sm">{message}</p>
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
  const [chartEx, setChartEx] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const all = getSessions();
    setSessions([...all].reverse());
    setPBs(Object.values(getPersonalBests()).sort((a, b) => b.estimated1RM - a.estimated1RM));
  }, []);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111] pb-16 max-w-[430px] mx-auto">

      <div className="px-6 pt-14 pb-6 animate-fadeInUp">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#BBBBBB] mb-8 active:text-[#111] transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          戻る
        </button>
        <h2 className="text-3xl font-black tracking-tight text-[#111]">記録</h2>
      </div>

      {/* Tabs */}
      <div
        className="px-6 mb-6 animate-fadeInUp"
        style={{ animationDelay: '0.06s' }}
      >
        <div className="flex bg-white border border-[#E8E8E8] rounded-xl p-1 gap-1 shadow-sm">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${
                tab === key
                  ? 'bg-[#00DD77] text-black shadow-sm'
                  : 'text-[#AAAAAA] active:bg-[#F5F5F5]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar tab */}
      {tab === 'calendar' && (
        <div className="px-6 animate-fadeInUp">
          {sessions.length === 0 ? (
            <Empty message="まだトレーニング記録がありません" />
          ) : (
            <WorkoutCalendar sessions={[...sessions].reverse()} />
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="px-6 animate-fadeInUp">
          {sessions.length === 0 ? (
            <Empty message="まだトレーニング記録がありません" />
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session) => {
                const totalSets = session.exercises.reduce((t, e) => t + e.sets.length, 0);
                return (
                  <div
                    key={session.id}
                    className="bg-white border border-[#EBEBEB] rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[#00AA55] font-black text-base">
                          {BODY_PART_LABELS[session.bodyPart]}
                        </span>
                        <span className="text-[#BBBBBB] text-sm ml-3">{fmtDate(session.date)}</span>
                      </div>
                      <div className="text-right">
                        {session.durationSeconds > 0 && (
                          <div className="text-xs text-[#BBBBBB]">
                            {formatDuration(session.durationSeconds)}
                          </div>
                        )}
                        <div className="text-xs text-[#CCCCCC] mt-0.5">{totalSets}セット</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-[#F5F5F5] pt-3">
                      {session.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#555] text-sm">{ex.exerciseName}</span>
                            {ex.isNewPB && (
                              <span className="text-[9px] text-[#00AA55] font-bold border border-[#00AA55]/25 bg-[#00AA55]/5 px-1.5 py-0.5 rounded">
                                PB
                              </span>
                            )}
                          </div>
                          <span className="text-[#CCCCCC] text-xs">{ex.sets.length}セット</span>
                        </div>
                      ))}
                    </div>
                    {/* Show memo if exists */}
                    {session.exercises.some((e) => e.memo) && (
                      <div className="mt-3 border-t border-[#F5F5F5] pt-3">
                        {session.exercises.filter((e) => e.memo).map((ex, i) => (
                          <div key={i} className="text-xs text-[#999] mt-1">
                            <span className="text-[#CCCCCC]">{ex.exerciseName}：</span>
                            {ex.memo}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PBs tab */}
      {tab === 'pbs' && (
        <div className="px-6 animate-fadeInUp">
          {pbs.length === 0 ? (
            <Empty message="まだ自己ベストの記録がありません" />
          ) : (
            <div className="flex flex-col gap-3">
              {pbs.map((pb) => (
                <div
                  key={pb.exerciseId}
                  className="bg-white border border-[#EBEBEB] rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-black text-[#111] flex-1">{pb.exerciseName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#BBBBBB] text-xs mt-0.5">
                        {new Date(pb.date).toLocaleDateString('ja-JP', {
                          month: 'numeric', day: 'numeric',
                        })}
                      </span>
                      {/* Graph button */}
                      <button
                        onClick={() => setChartEx({ id: pb.exerciseId, name: pb.exerciseName })}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E8E8E8] bg-[#F7F7F7] text-[#888] active:bg-[#EBEBEB] transition-colors"
                        title="成長グラフ"
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1,11 4,7 7,9 10,4 13,6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#3B82F6]">
                      {pb.weight % 1 === 0 ? pb.weight : pb.weight.toFixed(1)}
                    </span>
                    <span className="text-[#AAAAAA] text-sm">kg</span>
                    <span className="text-[#DDDDDD] text-xl font-light mx-2">×</span>
                    <span className="text-4xl font-black text-[#3B82F6]">{pb.reps}</span>
                    <span className="text-[#AAAAAA] text-sm">回</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-[#00AA55] font-bold bg-[#00AA55]/10 px-2 py-0.5 rounded-full">
                      1RM {pb.estimated1RM}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Chart Modal */}
      {chartEx && (
        <ExerciseProgressChart
          exerciseId={chartEx.id}
          exerciseName={chartEx.name}
          onClose={() => setChartEx(null)}
        />
      )}
    </div>
  );
}
