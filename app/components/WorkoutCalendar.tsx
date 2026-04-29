'use client';

import { useState } from 'react';
import { WorkoutSession } from '@/lib/types';
import { BODY_PART_LABELS } from '@/lib/types';

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];

const BODY_COLORS: Record<string, string> = {
  chest:     '#f87171',
  back:      '#34d399',
  legs:      '#60a5fa',
  shoulders: '#a78bfa',
  arms:      '#fbbf24',
  abs:       '#f472b6',
  cardio:    '#00CC66',
};

function fmtDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}分`;
  return `${s}秒`;
}

interface Props {
  sessions: WorkoutSession[];
}

export default function WorkoutCalendar({ sessions }: Props) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const rawFirst = new Date(year, month, 1).getDay();
  const offset = rawFirst === 0 ? 6 : rawFirst - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const sessionMap = new Map<string, WorkoutSession[]>();
  sessions.forEach((s) => {
    const key = new Date(s.date).toDateString();
    if (!sessionMap.has(key)) sessionMap.set(key, []);
    sessionMap.get(key)!.push(s);
  });

  const todayStr = new Date().toDateString();
  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedSessions = selectedDateStr ? (sessionMap.get(selectedDateStr) ?? []) : [];

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedDateStr(null); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E8E8E8] bg-white text-[#AAAAAA] active:text-[#111] active:border-[#CCC] transition-colors shadow-sm"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 2L4 6l4 4" />
          </svg>
        </button>
        <span className="font-black text-base text-[#111]">
          {year}年{month + 1}月
        </span>
        <button
          onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedDateStr(null); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E8E8E8] bg-white text-[#AAAAAA] active:text-[#111] active:border-[#CCC] transition-colors shadow-sm"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[10px] font-bold py-1.5 ${
              i === 5 ? 'text-[#60a5fa]' : i === 6 ? 'text-[#f87171]' : 'text-[#BBBBBB]'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const dateStr = new Date(year, month, day).toDateString();
          const daySessions = sessionMap.get(dateStr) ?? [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDateStr;
          const hasSessions = daySessions.length > 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDateStr(isSelected ? null : dateStr)}
              className={`relative flex flex-col items-center justify-center h-9 mx-px rounded-lg transition-all active:scale-90 ${
                isSelected
                  ? 'bg-[#00DD77] shadow-sm'
                  : isToday
                  ? 'border border-[#00DD77]/40 bg-[#00DD77]/8'
                  : hasSessions
                  ? 'bg-white border border-[#EBEBEB] shadow-sm'
                  : ''
              }`}
            >
              <span
                className={`text-sm font-bold leading-none ${
                  isSelected
                    ? 'text-black'
                    : isToday
                    ? 'text-[#00AA55]'
                    : hasSessions
                    ? 'text-[#111]'
                    : 'text-[#CCCCCC]'
                }`}
              >
                {day}
              </span>
              {hasSessions && !isSelected && (
                <div className="flex gap-px mt-0.5">
                  {daySessions.slice(0, 3).map((s, idx) => (
                    <div
                      key={idx}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: BODY_COLORS[s.bodyPart] }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 mb-1">
        {Object.entries(BODY_COLORS).map(([bp, color]) => {
          const hasBP = sessions.some((s) => s.bodyPart === bp);
          if (!hasBP) return null;
          return (
            <div key={bp} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-[#AAAAAA]">
                {BODY_PART_LABELS[bp as keyof typeof BODY_PART_LABELS]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDateStr && selectedSessions.length > 0 && (
        <div className="mt-4 space-y-3">
          {selectedSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-[#EBEBEB] rounded-2xl p-4 shadow-sm animate-scaleIn"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: BODY_COLORS[session.bodyPart] }}
                  />
                  <span className="font-black text-[#111]">
                    {BODY_PART_LABELS[session.bodyPart]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {session.durationSeconds > 0 && (
                    <span className="text-xs text-[#AAAAAA]">
                      {fmtDuration(session.durationSeconds)}
                    </span>
                  )}
                  <span className="text-xs text-[#BBBBBB]">
                    {session.exercises.reduce((t, e) => t + e.sets.length, 0)}セット
                  </span>
                </div>
              </div>
              {session.exercises.length > 0 && (
                <div className="space-y-1 border-t border-[#F5F5F5] pt-3">
                  {session.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[#555] text-sm">{ex.exerciseName}</span>
                        {ex.isNewPB && (
                          <span className="text-[9px] text-[#00AA55] font-bold border border-[#00AA55]/25 bg-[#00AA55]/5 px-1.5 py-px rounded">
                            PB
                          </span>
                        )}
                      </div>
                      <span className="text-[#CCCCCC] text-xs">{ex.sets.length}セット</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedDateStr && selectedSessions.length === 0 && (
        <p className="text-center text-[#CCCCCC] text-sm mt-5 py-3">この日の記録なし</p>
      )}
    </div>
  );
}
