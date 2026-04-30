'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSessions, getPersonalBests, getBodyWeightHistory } from '@/lib/storage';
import { BODY_PART_LABELS, BodyWeightRecord, ExerciseType, PersonalBest, WorkoutSession, WorkoutSet } from '@/lib/types';
import WorkoutCalendar from '../components/WorkoutCalendar';
import ExerciseProgressChart from '../components/ExerciseProgressChart';
import BottomNav from '../components/BottomNav';

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
  WEIGHT: 'bg-blue-900/40 text-blue-400 border-blue-800/50',
  BODYWEIGHT: 'bg-purple-900/40 text-purple-400 border-purple-800/50',
  CARDIO: 'bg-orange-900/40 text-orange-400 border-orange-800/50',
};
const TYPE_LABEL: Record<ExerciseType, string> = {
  WEIGHT: '重量', BODYWEIGHT: '自重', CARDIO: '有酸素',
};

function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-12 h-12 rounded-full border border-[#222] flex items-center justify-center mx-auto mb-4 bg-[#141414]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="9" cy="9" r="7" /><path d="M9 6v3M9 11v.5" />
        </svg>
      </div>
      <p className="text-white/50 text-sm">{message}</p>
      <p className="text-white/30 text-xs mt-1">トレーニングを記録すると表示されます</p>
    </div>
  );
}

const TABS = [
  { key: 'calendar', label: 'カレンダー' },
  { key: 'history',  label: '履歴' },
  { key: 'pbs',      label: '自己ベスト' },
] as const;
type Tab = typeof TABS[number]['key'];

// ── Inner Component (needs searchParams) ──────────────────────────────────────
function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initTab = (searchParams.get('tab') as Tab) || 'calendar';

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [pbs, setPBs] = useState<PersonalBest[]>([]);
  const [tab, setTab] = useState<Tab>(initTab);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [chartEx, setChartEx] = useState<{ id: string; name: string } | null>(null);
  const [bwHistory, setBwHistory] = useState<BodyWeightRecord[]>([]);

  useEffect(() => {
    const all = getSessions();
    setSessions([...all].reverse());
    setPBs(Object.values(getPersonalBests()).sort((a, b) => b.estimated1RM - a.estimated1RM));
    const bw = getBodyWeightHistory();
    setBwHistory([...bw].reverse().slice(0, 30));
  }, []);

  // sync tab when URL changes (e.g. back-nav from BottomNav)
  useEffect(() => {
    const t = (searchParams.get('tab') as Tab) || 'calendar';
    setTab(t);
  }, [searchParams]);

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

  const handleTabChange = (key: Tab) => {
    setTab(key);
    router.replace(key === 'pbs' ? '/history?tab=pbs' : '/history', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-28 max-w-[430px] mx-auto">

      {/* Header */}
      <div className="px-6 pt-14 pb-4 animate-fadeInUp">
        <h2 className="text-3xl font-black tracking-tight text-white">記録</h2>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-5 animate-fadeInUp" style={{ animationDelay: '0.04s' }}>
        <div className="flex gap-0 border-b border-[#1F1F1F]">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => handleTabChange(key)}
              className={`flex-1 py-3 font-bold text-sm transition-all relative ${
                tab === key ? 'text-[#00FF88]' : 'text-white/40'
              }`}>
              {label}
              {tab === key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00FF88] rounded-full"
                  style={{ boxShadow: '0 0 6px rgba(0,255,136,0.6)' }} />
              )}
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

      {/* ── History ── */}
      {tab === 'history' && (
        <div className="px-6 animate-fadeInUp">

          {/* Body weight history */}
          {bwHistory.length > 0 && (
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-white/40 uppercase tracking-widest">体重推移</p>
                <span className="text-xs text-white/40">直近{Math.min(bwHistory.length, 30)}回</span>
              </div>
              {/* Mini sparkline */}
              {bwHistory.length >= 2 && (() => {
                const vals = [...bwHistory].reverse().slice(-14).map(r => r.weight);
                const min = Math.min(...vals);
                const max = Math.max(...vals);
                const range = max - min || 1;
                const W = 260, H = 40, PAD = 4;
                const pts = vals.map((v, i) => {
                  const x = PAD + (i / (vals.length - 1)) * (W - PAD * 2);
                  const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <div className="mb-3 overflow-hidden">
                    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="40">
                      <polyline points={pts} fill="none" stroke="#00FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      {vals.map((v, i) => {
                        const x = PAD + (i / (vals.length - 1)) * (W - PAD * 2);
                        const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
                        return i === vals.length - 1
                          ? <circle key={i} cx={x} cy={y} r="3.5" fill="#00FF88" stroke="#0D0D0D" strokeWidth="1.5"/>
                          : <circle key={i} cx={x} cy={y} r="2" fill="#0D0D0D" stroke="#00FF88" strokeWidth="1.5"/>;
                      })}
                    </svg>
                  </div>
                );
              })()}
              {/* Latest 5 records */}
              <div className="flex flex-col gap-0 max-h-36 overflow-y-auto">
                {bwHistory.slice(0, 8).map((r, i) => {
                  const prev = bwHistory[i + 1];
                  const diff = prev ? Math.round((r.weight - prev.weight) * 10) / 10 : null;
                  return (
                    <div key={r.date} className="flex items-center justify-between py-1.5 border-b last:border-0 border-[#1A1A1A]">
                      <span className="text-xs text-white/40">
                        {new Date(r.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
                      </span>
                      <div className="flex items-center gap-2">
                        {diff !== null && diff !== 0 && (
                          <span className={`text-[9px] font-bold ${diff > 0 ? 'text-red-400' : 'text-[#00FF88]'}`}>
                            {diff > 0 ? `+${diff}` : diff}kg
                          </span>
                        )}
                        <span className={`text-sm font-black ${i === 0 ? 'text-[#00FF88]' : 'text-white/60'}`}>
                          {r.weight}kg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sessions.length === 0 ? (
            <Empty message="まだトレーニング記録がありません" />
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session) => {
                const isOpen = expanded.has(session.id);
                const totalSets = session.exercises.reduce((t, e) => t + e.sets.length, 0);
                const color = BODY_COLORS[session.bodyPart] || '#888';
                return (
                  <div key={session.id} className="bg-[#141414] border border-[#222] rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleExpand(session.id)}
                      className="w-full px-5 py-4 flex items-center gap-3 active:bg-[#1A1A1A] transition-colors text-left"
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-white text-sm">{fmtDate(session.date)}</div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs font-bold" style={{ color }}>{BODY_PART_LABELS[session.bodyPart]}</span>
                          <span className="text-white/20 text-xs">·</span>
                          <span className="text-xs text-white/50">{session.exercises.length}種目 / {totalSets}セット</span>
                          {session.durationSeconds > 0 && (
                            <><span className="text-white/20 text-xs">·</span>
                            <span className="text-xs text-white/50">{formatDuration(session.durationSeconds)}</span></>
                          )}
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                        stroke="#333" strokeWidth="1.5" strokeLinecap="round"
                        className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <path d="M2 5l5 5 5-5" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="border-t border-[#1A1A1A] px-5 py-4 space-y-4 animate-fadeInUp">
                        {session.exercises.map((ex, ei) => {
                          const type: ExerciseType = ex.exerciseType || 'WEIGHT';
                          return (
                            <div key={ei}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-black text-white text-sm flex-1">{ex.exerciseName}</span>
                                {ex.isNewPB && (
                                  <span className="text-[9px] text-[#00FF88] font-bold border border-[#00FF88]/25 bg-[#00FF88]/10 px-1.5 py-0.5 rounded">PB</span>
                                )}
                                <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${TYPE_COLOR[type]}`}>{TYPE_LABEL[type]}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {ex.sets.map((s, si) => (
                                  <span key={si} className="text-xs bg-[#1A1A1A] border border-[#2A2A2A] px-2.5 py-1.5 rounded-xl text-white/60 font-medium">
                                    <span className="text-white/30 mr-1">{si + 1}</span>
                                    {formatSet(s, type)}
                                  </span>
                                ))}
                              </div>
                              {ex.memo && (
                                <p className="text-xs text-white/40 mt-2 pl-1">📝 {ex.memo}</p>
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
              {pbs.map((pb, idx) => (
                <div key={pb.exerciseId}
                  className="bg-[#141414] border border-[#222] rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm font-bold">#{idx + 1}</span>
                      <span className="font-black text-white flex-1 pr-2">{pb.exerciseName}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-white/40 text-xs">
                        {new Date(pb.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setChartEx({ id: pb.exerciseId, name: pb.exerciseName })}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1A1A1A] text-[#555] active:bg-[#222] transition-colors"
                        title="成長グラフ"
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1,11 4,7 7,9 10,4 13,6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#00FF88]"
                      style={{ textShadow: '0 0 12px rgba(0,255,136,0.4)' }}>
                      {pb.weight % 1 === 0 ? pb.weight : pb.weight.toFixed(1)}
                    </span>
                    <span className="text-white/50 text-sm">kg</span>
                    <span className="text-white/20 text-xl font-light mx-1">×</span>
                    <span className="text-4xl font-black text-[#00FF88]"
                      style={{ textShadow: '0 0 12px rgba(0,255,136,0.4)' }}>{pb.reps}</span>
                    <span className="text-white/50 text-sm">回</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-[#00FF88] font-bold bg-[#00FF88]/10 border border-[#00FF88]/20 px-2 py-0.5 rounded-full">
                      1RM {pb.estimated1RM}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {chartEx && (
        <ExerciseProgressChart
          exerciseId={chartEx.id}
          exerciseName={chartEx.name}
          onClose={() => setChartEx(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <HistoryContent />
    </Suspense>
  );
}
