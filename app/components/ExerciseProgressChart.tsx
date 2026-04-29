'use client';

import { useEffect, useState } from 'react';
import { getExerciseHistory } from '@/lib/storage';

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
const H = 155;
const PAD = { top: 20, right: 12, bottom: 28, left: 42 };
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
    '1m': 30 * 24 * 60 * 60 * 1000,
    '3m': 90 * 24 * 60 * 60 * 1000,
    '6m': 180 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
  };
  const cutoff = now - ms[range];
  return data.filter((d) => new Date(d.date).getTime() >= cutoff);
}

export default function ExerciseProgressChart({ exerciseId, exerciseName, onClose }: Props) {
  const [allData, setAllData] = useState<DataPoint[]>([]);
  const [range, setRange] = useState<Range>('all');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

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

  /* ── SVG calculations ── */
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
    const padding = (rawMax - rawMin) * 0.15 || 5;
    const minV = rawMin - padding;
    const maxV = rawMax + padding;
    const range2 = maxV - minV;

    toX = (i: number) => PAD.left + (i / (data.length - 1)) * CHART_W;
    toY = (v: number) => PAD.top + CHART_H - ((v - minV) / range2) * CHART_H;

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative bg-[#0D0D0D] border-t border-[#1F1F1F] rounded-t-3xl px-6 pt-5 pb-10 animate-slideUp"
        style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.8)' }}>
        {/* Handle */}
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-white">{exerciseName}</h3>
            <p className="text-xs text-[#555] mt-0.5">推定1RM の成長グラフ</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#666] active:bg-[#222] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        {/* Time range tabs */}
        <div className="flex bg-[#141414] border border-[#1F1F1F] rounded-xl p-0.5 gap-0.5 mb-4">
          {RANGE_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                range === key
                  ? 'bg-[#00FF88] text-black'
                  : 'text-[#555] active:bg-[#1F1F1F]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* No data */}
        {!hasChart ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#222] flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,14 6,9 10,11 14,5 18,7" />
              </svg>
            </div>
            <p className="text-[#555] text-sm">データが不足しています</p>
            <p className="text-[#333] text-xs mt-1">2回以上記録すると表示されます</p>
          </div>
        ) : (
          <>
            {/* Selected point info */}
            {selectedIdx !== null && data[selectedIdx] && (
              <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 mb-4 animate-scaleIn">
                <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">
                  {new Date(data[selectedIdx].date).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                  })}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#00FF88]"
                    style={{ textShadow: '0 0 12px rgba(0,255,136,0.4)' }}>
                    {data[selectedIdx].estimated1RM}
                  </span>
                  <span className="text-[#555] text-sm">kg (推定1RM)</span>
                </div>
                <p className="text-sm text-[#666] mt-1">
                  {data[selectedIdx].weight % 1 === 0
                    ? data[selectedIdx].weight
                    : data[selectedIdx].weight.toFixed(1)}kg × {data[selectedIdx].reps}回
                </p>
              </div>
            )}

            {/* SVG Chart */}
            <div className="w-full overflow-hidden">
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto">
                <defs>
                  <linearGradient id="chartAreaGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#00FF88" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {yTicks.map((t, i) => (
                  <line
                    key={i}
                    x1={PAD.left} y1={t.y}
                    x2={W - PAD.right} y2={t.y}
                    stroke="#1F1F1F" strokeWidth="1"
                  />
                ))}

                {/* Y-axis labels */}
                {yTicks.map((t, i) => (
                  <text
                    key={i}
                    x={PAD.left - 5} y={t.y + 4}
                    textAnchor="end" fontSize="9" fill="#444"
                  >
                    {t.v}
                  </text>
                ))}

                {/* Area fill */}
                <path d={areaPath} fill="url(#chartAreaGradDark)" />

                {/* Line */}
                <polyline
                  points={linePts}
                  fill="none"
                  stroke="#00FF88"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dots */}
                {data.map((d, i) => (
                  <g key={i} onClick={() => setSelectedIdx(i)} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={toX(i)} cy={toY(d.estimated1RM)}
                      r={selectedIdx === i ? 6 : 4}
                      fill={selectedIdx === i ? '#00FF88' : '#0D0D0D'}
                      stroke="#00FF88"
                      strokeWidth="2"
                    />
                    <circle cx={toX(i)} cy={toY(d.estimated1RM)} r={12} fill="transparent" />
                  </g>
                ))}

                {/* X-axis labels */}
                {xDates.map(({ i, label }) => (
                  <text
                    key={i}
                    x={toX(i)} y={H - 4}
                    textAnchor="middle" fontSize="8.5" fill="#444"
                  >
                    {label}
                  </text>
                ))}
              </svg>
            </div>

            {/* Recent history list */}
            {data.length > 0 && (
              <div className="mt-4 border-t border-[#1A1A1A] pt-4">
                <p className="text-[10px] text-[#444] uppercase tracking-widest mb-2">記録一覧</p>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {[...data].reverse().map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A] last:border-0">
                      <span className="text-xs text-[#555]">
                        {new Date(d.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#888]">
                          {d.weight % 1 === 0 ? d.weight : d.weight.toFixed(1)}kg × {d.reps}回
                        </span>
                        <span className="text-xs font-bold text-[#00FF88]">1RM {d.estimated1RM}kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
