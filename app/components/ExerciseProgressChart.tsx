'use client';

import { useEffect, useState } from 'react';
import { getExerciseHistory } from '@/lib/storage';
import MuscleMouseMascot from './MuscleMouseMascot';

interface DataPoint {
  date: string;
  estimated1RM: number;
  weight: number;
  reps: number;
}

interface Props {
  exerciseId: string;
  exerciseName: string;
  onClose: () => void;
}

const W = 300;
const H = 140;
const PAD = { top: 16, right: 12, bottom: 24, left: 38 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

type Range = '1m' | '3m' | '6m' | '1y' | 'all';
const RANGE_LABELS: { key: Range; label: string }[] = [
  { key: '1m',  label: '1ヶ月' },
  { key: '3m',  label: '3ヶ月' },
  { key: '6m',  label: '6ヶ月' },
  { key: '1y',  label: '1年' },
  { key: 'all', label: '全期間' },
];

function filterByRange(data: DataPoint[], range: Range): DataPoint[] {
  if (range === 'all') return data;
  const now = Date.now();
  const ms: Record<Exclude<Range, 'all'>, number> = {
    '1m': 30 * 86400000,
    '3m': 90 * 86400000,
    '6m': 180 * 86400000,
    '1y': 365 * 86400000,
  };
  const cutoff = now - ms[range];
  return data.filter((d) => new Date(d.date).getTime() >= cutoff);
}

const MASCOT_TIPS = [
  'いい調子だ！このまま続けよう！',
  '着実に成長してる！素晴らしい！',
  '継続は力なり！今日も頑張ろう！',
  'この調子で自己ベストを更新しろ！',
];

export default function ExerciseProgressChart({ exerciseId, exerciseName, onClose }: Props) {
  const [allData, setAllData] = useState<DataPoint[]>([]);
  const [range, setRange] = useState<Range>('3m');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [tip] = useState(() => MASCOT_TIPS[Math.floor(Math.random() * MASCOT_TIPS.length)]);

  useEffect(() => {
    const history = getExerciseHistory(exerciseId);
    const points = history.map((h) => ({
      date: h.date,
      estimated1RM: h.estimated1RM,
      weight: h.maxSet.weight,
      reps: h.maxSet.reps,
    }));
    setAllData(points);
  }, [exerciseId]);

  const data = filterByRange(allData, range);

  useEffect(() => {
    if (data.length > 0) setSelectedIdx(data.length - 1);
    else setSelectedIdx(null);
  }, [range, data.length]);

  const hasChart = data.length >= 2;

  // Delta from first to last
  const delta = hasChart
    ? Math.round((data[data.length - 1].estimated1RM - data[0].estimated1RM) * 10) / 10
    : null;

  /* ── SVG ── */
  let toX = (_i: number) => 0;
  let toY = (_v: number) => 0;
  let linePts = '';
  let areaPath = '';
  let yTicks: { v: number; y: number }[] = [];
  let xDates: { i: number; label: string }[] = [];

  if (hasChart) {
    const values = data.map((d) => d.estimated1RM);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const padding = (rawMax - rawMin) * 0.18 || 5;
    const minV = rawMin - padding;
    const maxV = rawMax + padding;
    const rng = maxV - minV;

    toX = (i: number) => PAD.left + (i / (data.length - 1)) * CHART_W;
    toY = (v: number) => PAD.top + CHART_H - ((v - minV) / rng) * CHART_H;

    linePts = data.map((d, i) => `${toX(i)},${toY(d.estimated1RM)}`).join(' ');
    areaPath = [
      `M ${toX(0)},${PAD.top + CHART_H}`,
      ...data.map((d, i) => `L ${toX(i)},${toY(d.estimated1RM)}`),
      `L ${toX(data.length - 1)},${PAD.top + CHART_H}`,
      'Z',
    ].join(' ');

    const mid = (rawMin + rawMax) / 2;
    yTicks = [rawMin, mid, rawMax].map((v) => ({
      v: Math.round(v * 10) / 10,
      y: toY(v),
    }));

    const step = Math.ceil(data.length / 4);
    xDates = data.reduce<{ i: number; label: string }[]>((acc, d, i) => {
      if (i === 0 || i === data.length - 1 || i % step === 0) {
        acc.push({
          i,
          label: new Date(d.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        });
      }
      return acc;
    }, []);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      <div className="relative bg-[#0D0D0D] border-t border-[#1F1F1F] rounded-t-3xl px-5 pt-4 pb-8 animate-slideUp"
        style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.8)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Handle */}
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="text-[#555] active:text-white">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M10 3L5 8l5 5"/>
                </svg>
              </button>
              <h3 className="text-lg font-black text-white">{exerciseName}</h3>
            </div>
            <p className="text-xs text-[#444] mt-0.5 ml-6">推定1RM の成長グラフ</p>
          </div>
        </div>

        {/* Time range tabs */}
        <div className="flex bg-[#141414] border border-[#1F1F1F] rounded-xl p-0.5 gap-0.5 mb-4">
          {RANGE_LABELS.map(({ key, label }) => (
            <button key={key} onClick={() => setRange(key)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                range === key ? 'bg-[#00FF88] text-black' : 'text-[#555] active:bg-[#1F1F1F]'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* No data state — still show UI */}
        {!hasChart ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-[#1F1F1F] flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,17 7,11 11,14 15,7 20,9"/>
              </svg>
            </div>
            <p className="text-[#555] text-sm font-bold">
              {allData.length === 0 ? 'まだデータがありません' : 'この期間のデータが不足しています'}
            </p>
            <p className="text-[#333] text-xs mt-1">
              {allData.length === 0 ? '2回以上記録すると表示されます' : '別の期間を選択してください'}
            </p>
            {allData.length === 0 && (
              <div className="mt-6 flex justify-center">
                <MuscleMouseMascot size={80} />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Selected point info + delta */}
            {selectedIdx !== null && data[selectedIdx] && (
              <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-4 mb-3 animate-scaleIn">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-[#444] uppercase tracking-widest mb-1">
                      {new Date(data[selectedIdx].date).toLocaleDateString('ja-JP', {
                        year: 'numeric', month: 'numeric', day: 'numeric',
                      })}
                    </p>
                    <p className="text-[10px] text-[#444] mb-1">推定1RM</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[#00FF88]"
                        style={{ textShadow: '0 0 14px rgba(0,255,136,0.4)' }}>
                        {data[selectedIdx].estimated1RM}
                      </span>
                      <span className="text-[#555] text-sm">kg</span>
                    </div>
                    <p className="text-xs text-[#555] mt-0.5">
                      {data[selectedIdx].weight % 1 === 0 ? data[selectedIdx].weight : data[selectedIdx].weight.toFixed(1)}kg × {data[selectedIdx].reps}回
                    </p>
                  </div>
                  {delta !== null && (
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
                      delta > 0 ? 'bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88]'
                               : delta < 0 ? 'bg-red-900/20 border border-red-800/30 text-red-400'
                               : 'bg-[#1A1A1A] border border-[#222] text-[#555]'
                    }`}>
                      {delta > 0 ? '↑' : delta < 0 ? '↓' : '—'}
                      {Math.abs(delta) > 0 && `+${Math.abs(delta)}kg`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SVG Chart */}
            <div className="w-full overflow-hidden mb-3">
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto">
                <defs>
                  <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity="0.20"/>
                    <stop offset="100%" stopColor="#00FF88" stopOpacity="0.01"/>
                  </linearGradient>
                </defs>
                {yTicks.map((t, i) => (
                  <line key={i} x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="#1A1A1A" strokeWidth="1"/>
                ))}
                {yTicks.map((t, i) => (
                  <text key={i} x={PAD.left - 4} y={t.y + 4} textAnchor="end" fontSize="8" fill="#333">{t.v}</text>
                ))}
                <path d={areaPath} fill="url(#chartAreaGrad)"/>
                <polyline points={linePts} fill="none" stroke="#00FF88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                {data.map((d, i) => (
                  <g key={i} onClick={() => setSelectedIdx(i)} style={{ cursor: 'pointer' }}>
                    <circle cx={toX(i)} cy={toY(d.estimated1RM)} r={selectedIdx === i ? 6 : 4}
                      fill={selectedIdx === i ? '#00FF88' : '#0D0D0D'}
                      stroke="#00FF88" strokeWidth="2"/>
                    <circle cx={toX(i)} cy={toY(d.estimated1RM)} r={12} fill="transparent"/>
                  </g>
                ))}
                {xDates.map(({ i, label }) => (
                  <text key={i} x={toX(i)} y={H - 3} textAnchor="middle" fontSize="8" fill="#333">{label}</text>
                ))}
              </svg>
            </div>

            {/* Record list */}
            <div className="border-t border-[#1A1A1A] pt-3 mb-4">
              <p className="text-[10px] text-[#333] uppercase tracking-widest mb-2">記録一覧</p>
              <div className="flex flex-col gap-0 max-h-40 overflow-y-auto">
                {[...data].reverse().map((d, i, arr) => {
                  const isLatest = i === 0;
                  return (
                    <div key={i} className={`flex items-center justify-between py-2 border-b last:border-0 border-[#141414]`}>
                      <span className="text-xs text-[#444]">
                        {new Date(d.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#666]">
                          {d.weight % 1 === 0 ? d.weight : d.weight.toFixed(1)}kg × {d.reps}回
                        </span>
                        <span className={`text-xs font-bold ${isLatest ? 'text-[#00FF88]' : 'text-[#444]'}`}>
                          {isLatest && '👑 '}
                          {d.estimated1RM}kg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Mascot footer */}
        <div className="flex items-center gap-3 pt-2">
          <MuscleMouseMascot size={56} variant="small" />
          <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl rounded-bl-none px-3 py-2 flex-1">
            <p className="text-xs text-[#00FF88] font-bold">{tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
