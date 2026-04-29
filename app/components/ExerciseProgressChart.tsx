'use client';

import { useEffect, useState } from 'react';
import { getExerciseHistory } from '@/lib/storage';
import { WorkoutSet } from '@/lib/types';

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

export default function ExerciseProgressChart({ exerciseId, exerciseName, onClose }: Props) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    const history = getExerciseHistory(exerciseId);
    const points = history.slice(-10).map((h) => ({
      date: h.date,
      estimated1RM: h.estimated1RM,
      weight: h.maxSet.weight,
      reps: h.maxSet.reps,
    }));
    setData(points);
    if (points.length > 0) setSelectedIdx(points.length - 1);
  }, [exerciseId]);

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
    const range = maxV - minV;

    toX = (i: number) => PAD.left + (i / (data.length - 1)) * CHART_W;
    toY = (v: number) => PAD.top + CHART_H - ((v - minV) / range) * CHART_H;

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

    // show up to 5 x-labels
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative bg-white rounded-t-3xl px-6 pt-5 pb-10 animate-slideUp shadow-2xl">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#E5E5E5] rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-black text-[#111]">{exerciseName}</h3>
            <p className="text-xs text-[#AAAAAA] mt-0.5">推定1RM の成長グラフ</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#999] active:bg-[#EBEBEB] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        {/* No data */}
        {!hasChart ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#CCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,14 6,9 10,11 14,5 18,7" />
              </svg>
            </div>
            <p className="text-[#AAAAAA] text-sm">データが不足しています</p>
            <p className="text-[#CCCCCC] text-xs mt-1">2回以上記録すると表示されます</p>
          </div>
        ) : (
          <>
            {/* Selected point info */}
            {selectedIdx !== null && data[selectedIdx] && (
              <div className="bg-[#F7F7F7] rounded-2xl p-4 mb-5 animate-scaleIn">
                <p className="text-[10px] text-[#AAAAAA] uppercase tracking-widest mb-1">
                  {new Date(data[selectedIdx].date).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                  })}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#00AA55]">
                    {data[selectedIdx].estimated1RM}
                  </span>
                  <span className="text-[#AAAAAA] text-sm">kg (推定1RM)</span>
                </div>
                <p className="text-sm text-[#777777] mt-1">
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
                  <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00DD77" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00DD77" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {yTicks.map((t, i) => (
                  <line
                    key={i}
                    x1={PAD.left} y1={t.y}
                    x2={W - PAD.right} y2={t.y}
                    stroke="#EBEBEB" strokeWidth="1"
                  />
                ))}

                {/* Y-axis labels */}
                {yTicks.map((t, i) => (
                  <text
                    key={i}
                    x={PAD.left - 5} y={t.y + 4}
                    textAnchor="end" fontSize="9" fill="#BBBBBB"
                  >
                    {t.v}
                  </text>
                ))}

                {/* Area fill */}
                <path d={areaPath} fill="url(#chartAreaGrad)" />

                {/* Line */}
                <polyline
                  points={linePts}
                  fill="none"
                  stroke="#00BB66"
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
                      fill={selectedIdx === i ? '#00DD77' : 'white'}
                      stroke="#00BB66"
                      strokeWidth="2"
                    />
                    {/* Tap area */}
                    <circle
                      cx={toX(i)} cy={toY(d.estimated1RM)}
                      r={12}
                      fill="transparent"
                    />
                  </g>
                ))}

                {/* X-axis labels */}
                {xDates.map(({ i, label }) => (
                  <text
                    key={i}
                    x={toX(i)} y={H - 4}
                    textAnchor="middle" fontSize="8.5" fill="#BBBBBB"
                  >
                    {label}
                  </text>
                ))}
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
