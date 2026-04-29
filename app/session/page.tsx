'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getExercisesByBodyPart,
  addOrUpdateExercise,
  getLastExerciseRecord,
  getPersonalBest,
  calculateEstimated1RM,
  updatePersonalBest,
  getCurrentSession,
  setCurrentSession,
  saveSession,
  getTodaySavedSets,
} from '@/lib/storage';
import { BODY_PART_LABELS, BodyPart, Exercise, ExerciseRecord, WorkoutSet } from '@/lib/types';

// ── Timer display ─────────────────────────────────────────────────────────────

function useTimer(startTime: string | null): string {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const tick = () => {
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── Number input with +/- and direct entry ────────────────────────────────────

function NumInput({
  label,
  value,
  unit,
  step,
  min,
  decimal,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  decimal?: boolean;
  onChange: (v: number) => void;
}) {
  const fmt = (n: number) => (decimal && n % 1 !== 0 ? n.toFixed(1) : String(n));
  const [inputVal, setInputVal] = useState(fmt(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // sync when value changes from outside (adjuster buttons)
  useEffect(() => {
    setInputVal(fmt(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const adjust = (delta: number) => {
    const next = Math.max(min, Math.round((value + delta) * 10) / 10);
    onChange(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputVal(raw);
    const num = decimal ? parseFloat(raw) : parseInt(raw, 10);
    if (!isNaN(num) && num >= min) onChange(num);
  };

  const handleBlur = () => {
    setInputVal(fmt(value));
  };

  return (
    <div>
      <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-center gap-2 bg-[#111] border border-[#1F1F1F] rounded-2xl px-3 py-2">
        <button
          onClick={() => adjust(-step)}
          className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-white text-2xl font-black flex items-center justify-center active:bg-[#252525] transition-colors shrink-0"
        >
          −
        </button>
        <div className="flex-1 flex items-baseline justify-center gap-1">
          <input
            ref={inputRef}
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            value={inputVal}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-20 text-5xl font-black text-white text-center bg-transparent outline-none"
          />
          <span className="text-[#444] text-sm">{unit}</span>
        </div>
        <button
          onClick={() => adjust(step)}
          className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-white text-2xl font-black flex items-center justify-center active:bg-[#252525] transition-colors shrink-0"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

// ── Main session content ──────────────────────────────────────────────────────

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bodyPart = (searchParams.get('bodyPart') as BodyPart) || 'chest';

  const session = getCurrentSession();
  const timer = useTimer(session?.startTime ?? null);

  type Phase = 'selecting' | 'recording';
  const [phase, setPhase] = useState<Phase>('selecting');

  // Exercise selection state
  const [historyExercises, setHistoryExercises] = useState<Exercise[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Recording state
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  const [pbNotice, setPBNotice] = useState<{ text: string; type: 'warn' | 'ok' } | null>(null);
  const [lastRecord, setLastRecord] = useState<{ sets: WorkoutSet[]; date: string } | null>(null);

  // Completed exercises across the whole session
  const [completedExercises, setCompletedExercises] = useState<ExerciseRecord[]>([]);

  // Today's total sets (saved + current session)
  const [todaySetCount, setTodaySetCount] = useState(0);

  useEffect(() => {
    const saved = getTodaySavedSets();
    setTodaySetCount(saved);
    setHistoryExercises(getExercisesByBodyPart(bodyPart));
  }, [bodyPart]);

  // Redirect if no session started
  useEffect(() => {
    if (!getCurrentSession()) router.replace('/');
  }, [router]);

  // Load last record & PB when exercise changes
  useEffect(() => {
    if (!currentExercise) return;
    const last = getLastExerciseRecord(currentExercise.id);
    setLastRecord(last);
    if (last?.sets.length) {
      const bestSet = last.sets.reduce((best, s) =>
        calculateEstimated1RM(s.weight, s.reps) > calculateEstimated1RM(best.weight, best.reps) ? s : best
      );
      setWeight(bestSet.weight);
      setReps(bestSet.reps);
    }
  }, [currentExercise]);

  // Real-time PB detection
  useEffect(() => {
    if (!currentExercise) return;
    const pb = getPersonalBest(currentExercise.id);
    if (!pb) return;
    const current1RM = calculateEstimated1RM(weight, reps);
    if (current1RM > pb.estimated1RM) {
      setPBNotice({ text: weight > pb.weight ? '重量更新' : '自己ベスト更新', type: 'ok' });
    } else if (calculateEstimated1RM(weight, reps + 1) > pb.estimated1RM) {
      setPBNotice({ text: 'あと1回で自己ベスト更新', type: 'warn' });
    } else {
      setPBNotice(null);
    }
  }, [weight, reps, currentExercise]);

  const selectExercise = (ex: Exercise) => {
    setCurrentExercise(ex);
    setCurrentSets([]);
    setPhase('recording');
  };

  const startNewExercise = (name: string) => {
    if (!name.trim()) return;
    const ex = addOrUpdateExercise(name.trim(), bodyPart);
    setHistoryExercises(getExercisesByBodyPart(bodyPart));
    setCurrentExercise(ex);
    setCurrentSets([]);
    setInputValue('');
    setPhase('recording');
  };

  const handleSetComplete = () => {
    const newSet: WorkoutSet = { weight, reps };
    setCurrentSets((prev) => [...prev, newSet]);
    setTodaySetCount((prev) => prev + 1);

    if (currentExercise) {
      updatePersonalBest(currentExercise.id, currentExercise.name, weight, reps);
    }
  };

  const saveCurrentExercise = (): ExerciseRecord | null => {
    if (!currentExercise || currentSets.length === 0) return null;
    const hasPB = currentSets.some(
      (s) => getPersonalBest(currentExercise.id)?.estimated1RM === calculateEstimated1RM(s.weight, s.reps)
    );
    const record: ExerciseRecord = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      bodyPart,
      sets: currentSets,
      isNewPB: hasPB,
    };
    return record;
  };

  const goToNextMenu = () => {
    const record = saveCurrentExercise();
    const updated = record ? [...completedExercises, record] : completedExercises;
    setCompletedExercises(updated);

    // Update current session in localStorage
    const sess = getCurrentSession();
    if (sess && record) {
      sess.exercises = updated;
      setCurrentSession(sess);
    }

    setCurrentExercise(null);
    setCurrentSets([]);
    setPBNotice(null);
    setInputValue('');
    setHistoryExercises(getExercisesByBodyPart(bodyPart));
    setPhase('selecting');
  };

  const finishTraining = () => {
    const record = saveCurrentExercise();
    const allExercises = record ? [...completedExercises, record] : completedExercises;

    const sess = getCurrentSession();
    if (sess) {
      const duration = Math.floor((Date.now() - new Date(sess.startTime).getTime()) / 1000);
      saveSession({
        id: sess.id,
        date: new Date().toISOString(),
        bodyPart,
        exercises: allExercises,
        durationSeconds: duration,
      });
      setCurrentSession(null);
    }

    router.push(`/complete?sets=${todaySetCount}&duration=${sess ? Math.floor((Date.now() - new Date(sess.startTime).getTime()) / 1000) : 0}`);
  };

  const lastMax = lastRecord?.sets.length
    ? lastRecord.sets.reduce((best, s) =>
        calculateEstimated1RM(s.weight, s.reps) > calculateEstimated1RM(best.weight, best.reps) ? s : best
      )
    : null;

  const totalCurrentSets = completedExercises.reduce((t, e) => t + e.sets.length, 0) + currentSets.length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-[430px] mx-auto">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#111] px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.replace('/')}
          className="flex items-center gap-2 text-[#555] active:text-white transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          終了
        </button>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xl font-black text-white tabular-nums">{timer}</div>
            <div className="text-[9px] text-[#444] uppercase tracking-widest">経過時間</div>
          </div>
          <div className="w-px h-8 bg-[#1F1F1F]" />
          <div className="text-center">
            <div className="text-xl font-black text-[#00FF88] tabular-nums">{todaySetCount}</div>
            <div className="text-[9px] text-[#444] uppercase tracking-widest">今日のセット</div>
          </div>
        </div>
      </div>

      {/* Completed exercises summary */}
      {completedExercises.length > 0 && (
        <div className="px-6 pt-4">
          <p className="text-[10px] text-[#444] uppercase tracking-widest mb-2">完了済み</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {completedExercises.map((ex, i) => (
              <span key={i} className="text-xs text-[#555] bg-[#111] border border-[#1F1F1F] px-3 py-1 rounded-full">
                {ex.exerciseName} × {ex.sets.length}セット
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Phase: SELECTING ── */}
      {phase === 'selecting' && (
        <div className="px-6 pt-6 pb-32">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-black">種目を選ぶ</h2>
            <span className="text-xs text-[#00FF88] bg-[#00FF88]/10 px-2 py-1 rounded-full font-bold">
              {BODY_PART_LABELS[bodyPart]}
            </span>
          </div>

          {historyExercises.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3">過去の種目</p>
              <div className="flex flex-col gap-2">
                {historyExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => selectExercise(ex)}
                    className="bg-[#111] border border-[#1F1F1F] rounded-xl px-4 py-4 flex items-center justify-between active:border-[#333] transition-colors"
                  >
                    <span className="font-bold text-white">{ex.name}</span>
                    <span className="text-[#444] text-xs">{ex.usageCount}回使用</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3">
              {historyExercises.length > 0 ? '新しく入力' : '種目名を入力'}
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startNewExercise(inputValue)}
              placeholder="例：ベンチプレス"
              className="w-full bg-[#111] border border-[#1F1F1F] text-white text-lg px-4 py-4 rounded-xl outline-none focus:border-[#333] placeholder-[#333] mb-3"
            />
            <button
              onClick={() => startNewExercise(inputValue)}
              disabled={!inputValue.trim()}
              className="w-full py-4 rounded-xl bg-[#00FF88] text-[#0A0A0A] font-black text-base active:scale-[0.97] transition-transform disabled:opacity-20 disabled:active:scale-100"
            >
              この種目で記録開始
            </button>
          </div>

          {/* Finish training from selecting phase */}
          {completedExercises.length > 0 && (
            <button
              onClick={finishTraining}
              className="w-full mt-4 py-4 rounded-xl border border-[#1F1F1F] text-[#555] font-bold text-base active:text-white active:border-[#333] transition-colors"
            >
              トレーニングを終了する
            </button>
          )}
        </div>
      )}

      {/* ── Phase: RECORDING ── */}
      {phase === 'recording' && currentExercise && (
        <div className="px-6 pt-6 pb-40">
          {/* Exercise name */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-black">{currentExercise.name}</h2>
            <span className="text-xs text-[#555] bg-[#111] border border-[#1F1F1F] px-2 py-1 rounded-full">
              {BODY_PART_LABELS[bodyPart]}
            </span>
          </div>

          {/* Previous MAX */}
          {lastMax && (
            <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-4 mb-4">
              <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">
                前回MAX（{new Date(lastRecord!.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}）
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#3B82F6]">
                  {lastMax.weight % 1 === 0 ? lastMax.weight : lastMax.weight.toFixed(1)}
                </span>
                <span className="text-[#555] text-sm">kg</span>
                <span className="text-[#333] text-xl font-light mx-2">×</span>
                <span className="text-4xl font-black text-[#3B82F6]">{lastMax.reps}</span>
                <span className="text-[#555] text-sm">回</span>
                <span className="text-[#444] text-xs ml-2">1RM≈{calculateEstimated1RM(lastMax.weight, lastMax.reps)}kg</span>
              </div>
            </div>
          )}

          {/* PB notice */}
          {pbNotice && (
            <div className={`rounded-xl px-4 py-3 mb-4 text-center font-bold text-sm ${
              pbNotice.type === 'ok'
                ? 'bg-[#00FF88]/10 border border-[#00FF88]/25 text-[#00FF88]'
                : 'bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#3B82F6]'
            }`}>
              {pbNotice.text}
            </div>
          )}

          {/* Inputs */}
          <div className="flex flex-col gap-3 mb-5">
            <NumInput
              label="重量"
              value={weight}
              unit="kg"
              step={2.5}
              min={0}
              decimal
              onChange={setWeight}
            />
            <NumInput
              label="回数"
              value={reps}
              unit="回"
              step={1}
              min={1}
              onChange={setReps}
            />
          </div>

          {/* セット完了 button */}
          <button
            onClick={handleSetComplete}
            className="w-full py-4 rounded-xl bg-[#00FF88] text-[#0A0A0A] font-black text-base active:scale-[0.97] transition-transform mb-5"
          >
            セット完了
          </button>

          {/* Completed sets list */}
          {currentSets.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">このメニューのセット</p>
              <div className="flex flex-col gap-1.5">
                {currentSets.map((s, i) => (
                  <div key={i} className="bg-[#111] border border-[#1F1F1F] rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-[#444] text-sm">Set {i + 1}</span>
                    <span className="font-bold text-white">
                      {s.weight % 1 === 0 ? s.weight : s.weight.toFixed(1)}kg × {s.reps}回
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom action bar (recording phase only) */}
      {phase === 'recording' && (
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent max-w-[430px] mx-auto">
          <div className="flex gap-3">
            <button
              onClick={goToNextMenu}
              className="flex-1 py-4 rounded-xl bg-[#111] border border-[#222] text-white font-bold text-base active:scale-[0.97] transition-transform"
            >
              次のメニュー
            </button>
            <button
              onClick={finishTraining}
              className="flex-1 py-4 rounded-xl border border-[#1F1F1F] text-[#555] font-bold text-base active:text-white active:border-[#333] transition-colors"
            >
              終了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <SessionContent />
    </Suspense>
  );
}
