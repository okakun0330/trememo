'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessions, getPersonalBests } from '@/lib/storage';
import { BODY_PART_LABELS, ExerciseType, PersonalBest, WorkoutSession, WorkoutSet } from '@/lib/types';
import WorkoutCalendar from '../components/WorkoutCalendar';
import ExerciseProgressChart from '../components/ExerciseProgressChart';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}分`;
  return `${seconds}秒`;
}

function formatSet(s: WorkoutSet, type: ExerciseType): string {
  if (type === 'CARDIO') {
    const parts: string[] = [];
    if (s.durationSeconds) {
      const m = Math.floor(s.durationSeconds / 60);
      const sec = s.durationSeconds % 60;
      parts.push(sec > 0 ? `${m}分${sec}秒` : `${m}分`);
    }
    if (s.distanceKm) parts.push(`${s.distanceKm}km`);
    return parts.join(' ') || '—';
  }
  if (type === 'BODYWEIGHT') return `${s.reps}回`;
  const w = s.weight % 1 === 0 ? String(s.weight) : s.weight.toFixed(1);
  return `${w}kg×${s.reps}回`;
}

const BODY_COLORS: Record<string, string> = {
  chest: '#f87171', back: '#34d399', legs: '#60a5fa', shoulders: '#a78bfa',
  arms: '#fbbf24', abs: '#f472b6', cardio: '#00CC66',
};

const TYPE_COLOR: Record<ExerciseType, string> = {
  WEIGHT: 'bg-blue-50 text-blue-400 border-blue-100',
  BODYWEIGHT: 'bg-purple-50 text-purple-400 border-purple-100',
  CARDIO: 'bg-orange-50 text-orange-400 border-orange-100',
};
const TYPE_LABEL: Record<ExerciseType, string> = {
  WEIGHT: '重量', BODYWEIGHT: '自重', CARDIO: '有酸素',
};

function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-24">
      <div className="w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center mx-auto mb-4 bg-white shadow-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="6" /><path d="M8 5v3M8 10v.5" />
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

// ── Component ──────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [pbs, setPBs] = useState<PersonalBest[]>([]);
  const [tab, setTab] = useState<Tab>('calendar');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [chartEx, setChartEx] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const all = getSessions();
    setSessions([...all].reverse());
    setPBs(Object.values(getPersonalBests()).sort((a, b) => b.estimated1RM - a.estimated1RM));
  }, []);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short',
    });

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111] pb-16 max-w-[430px] mx-auto">

      <div className="px-6 pt-14 pb-6 animate-fadeInUp">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-[#BBBBBB] mb-8 active:text-[#111] transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          戻る
        </button>
        <h2 className="text-3xl font-black tracking-tight text-[#111]">記録</h2>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6 animate-fadeInUp" style={{ animationDelay: '0.06s' }}>
        <div className="flex bg-white border border-[#E8E8E8] rounded-xl p-1 gap-1 shadow-sm">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${
                tab === key ? 'bg-[#00DD77] text-black shadow-sm' : 'text-[#AAAAAA] active:bg-[#F5F5F5]'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calendar ── */}
      {tab === 'calendar' && (
        <div className="px-6 animate-fadeInUp">
          {sessions.length === 0
            ? <Empty message="まだトレーニング記録がありません" />
            : <WorkoutCalendar sessions={[...sessions].reverse()} />
          }
        </div>
      )}

      {/* ── History (date-based detail view) ── */}
      {tab === 'history' && (
        <div className="px-6 animate-fadeInUp">
          {sessions.length === 0 ? (
            <Empty message="まだトレーニング記録がありません" />
          ) : (
            <div className="flex flex-col gap-4">
              {sessions.map((session) => {
                const isOpen = expanded.has(session.id);
                const totalSets = session.exercises.reduce((t, e) => t + e.sets.length, 0);
                const color = BODY_COLORS[session.bodyPart] || '#888';

                return (
                  <div key={session.id} className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-sm">

                    {/* ── Date header row ── */}
                    <button
                      onClick={() => toggleExpand(session.id)}
                      className="w-full px-5 py-4 flex items-center gap-3 active:bg-[#F9F9F9] transition-colors text-left"
                    >
                      {/* Color stripe */}
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />

                      <div className="flex-1 min-w-0">
                        <div className="font-black text-[#111] text-sm leading-tight">{fmtDate(session.date)}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold" style={{ color }}>{BODY_PART_LABELS[session.bodyPart]}</span>
                          <span className="text-[#CCCCCC] text-xs">·</span>
                          <span className="text-xs text-[#AAAAAA]">{session.exercises.length}種目 / {totalSets}セット</span>
                          {session.durationSeconds > 0 && (
                            <>
                              <span className="text-[#CCCCCC] text-xs">·</span>
                              <span className="text-xs text-[#AAAAAA]">{formatDuration(session.durationSeconds)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expand chevron */}
                      <svg
                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                        stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round"
                        className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M2 5l5 5 5-5" />
                      </svg>
                    </button>

                    {/* ── Exercise detail (collapsible) ── */}
                    {isOpen && (
                      <div className="border-t border-[#F5F5F5] px-5 py-4 space-y-5 animate-fadeInUp">
                        {session.exercises.map((ex, ei) => {
                          const type: ExerciseType = ex.exerciseType || 'WEIGHT';
                          return (
                            <div key={ei}>
                              {/* Exercise header */}
                              <div className="flex items-center gap-2 mb-2.5">
                                <span className="font-black text-[#111] text-sm flex-1">{ex.exerciseName}</span>
                                {ex.isNewPB && (
                                  <span className="text-[9px] text-[#00AA55] font-bold border border-[#00AA55]/25 bg-[#00AA55]/5 px-1.5 py-0.5 rounded">
                                    PB
                                  </span>
                                )}
                                <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${TYPE_COLOR[type]}`}>
                                  {TYPE_LABEL[type]}
                                </span>
                              </div>

                              {/* Set chips */}
                              <div className="flex flex-wrap gap-1.5">
                                {ex.sets.map((s, si) => (
                                  <span
                                    key={si}
                                    className="text-xs bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-1.5 rounded-xl text-[#555] font-medium"
                                  >
                                    <span className="text-[#BBBBBB] mr-1">{si + 1}</span>
                                    {formatSet(s, type)}
                                  </span>
                                ))}
                              </div>

                              {/* Memo */}
                              {ex.memo && (
                                <div className="mt-2 flex items-start gap-1.5">
                                  <span className="text-[#CCCCCC] text-xs mt-px">📝</span>
                                  <p className="text-xs text-[#999] leading-relaxed">{ex.memo}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PBs ── */}
      {tab === 'pbs' && (
        <div className="px-6 animate-fadeInUp">
          {pbs.length === 0 ? (
            <Empty message="まだ自己ベストの記録がありません" />
          ) : (
            <div className="flex flex-col gap-3">
              {pbs.map((pb) => (
                <div key={pb.exerciseId}
                  className="bg-white border border-[#EBEBEB] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-black text-[#111] flex-1 pr-2">{pb.exerciseName}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[#BBBBBB] text-xs mt-0.5">
                        {new Date(pb.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                      </span>
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
                  <div className="mt-2">
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

      {/* Chart modal */}
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
