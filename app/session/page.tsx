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
import ExerciseProgressChart from '../components/ExerciseProgressChart';

const ALL_BODY_PARTS: BodyPart[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];

// ── Timer ─────────────────────────────────────────────────────────────────────
function useTimer(startTime: string | null): string {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const tick = () =>
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
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

// ── NumInput ─────────────────────────────────────────────────────────────────
function NumInput({
  label, value, unit, step, min, decimal, onChange,
}: {
  label: string; value: number; unit: string; step: number;
  min: number; decimal?: boolean; onChange: (v: number) => void;
}) {
  const fmt = (n: number) => (decimal && n % 1 !== 0 ? n.toFixed(1) : String(n));
  const [inputVal, setInputVal] = useState(fmt(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setInputVal(fmt(value)); }, [value]);

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

  return (
    <div>
      <p className="text-[10px] text-[#AAAAAA] uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-center gap-2 bg-white border border-[#EBEBEB] rounded-2xl px-3 py-2 shadow-sm">
        <button
          onClick={() => adjust(-step)}
          className="w-12 h-12 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] text-2xl font-black flex items-center justify-center active:bg-[#EBEBEB] transition-colors shrink-0"
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
            onBlur={() => setInputVal(fmt(value))}
            className="w-20 text-5xl font-black text-[#111] text-center bg-transparent outline-none"
          />
          <span className="text-[#AAAAAA] text-sm">{unit}</span>
        </div>
        <button
          onClick={() => adjust(step)}
          className="w-12 h-12 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] text-2xl font-black flex items-center justify-center active:bg-[#EBEBEB] transition-colors shrink-0"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

// ── Session content ───────────────────────────────────────────────────────────
function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initBodyPart = (searchParams.get('bodyPart') as BodyPart) || 'chest';

  const session = getCurrentSession();
  const timer = useTimer(session?.startTime ?? null);

  type Phase = 'selecting' | 'recording';
  const [phase, setPhase] = useState<Phase>('selecting');
  const [currentBodyPart, setCurrentBodyPart] = useState<BodyPart>(initBodyPart);

  // Exercise selection
  const [historyExercises, setHistoryExercises] = useState<Exercise[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Recording state
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  const [memo, setMemo] = useState('');
  const [pbNotice, setPBNotice] = useState<{ text: string; type: 'warn' | 'ok' } | null>(null);
  const [lastRecord, setLastRecord] = useState<{ sets: WorkoutSet[]; date: string } | null>(null);

  // Set edit
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState(0);
  const [editReps, setEditReps] = useState(0);

  // Progress chart
  const [showChart, setShowChart] = useState(false);

  // Session-level
  const [completedExercises, setCompletedExercises] = useState<ExerciseRecord[]>([]);
  const [todaySetCount, setTodaySetCount] = useState(0);

  // Load exercises when body part changes
  useEffect(() => {
    setHistoryExercises(getExercisesByBodyPart(currentBodyPart));
  }, [currentBodyPart]);

  // Init today's sets
  useEffect(() => {
    setTodaySetCount(getTodaySavedSets());
  }, []);

  // Redirect if no session
  useEffect(() => {
    if (!getCurrentSession()) router.replace('/');
  }, [router]);

  // Load last record when exercise changes
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
    if (!pb) { setPBNotice(null); return; }
    const c1RM = calculateEstimated1RM(weight, reps);
    if (c1RM > pb.estimated1RM) {
      setPBNotice({ text: weight > pb.weight ? '重量更新！' : '自己ベスト更新！', type: 'ok' });
    } else if (calculateEstimated1RM(weight, reps + 1) > pb.estimated1RM) {
      setPBNotice({ text: 'あと1回で自己ベスト更新', type: 'warn' });
    } else {
      setPBNotice(null);
    }
  }, [weight, reps, currentExercise]);

  /* ── Actions ── */

  const selectExercise = (ex: Exercise) => {
    setCurrentExercise(ex);
    setCurrentSets([]);
    setMemo('');
    setEditIndex(null);
    setPhase('recording');
  };

  const startNewExercise = (name: string) => {
    if (!name.trim()) return;
    const ex = addOrUpdateExercise(name.trim(), currentBodyPart);
    setHistoryExercises(getExercisesByBodyPart(currentBodyPart));
    setCurrentExercise(ex);
    setCurrentSets([]);
    setMemo('');
    setEditIndex(null);
    setInputValue('');
    setPhase('recording');
  };

  const handleSetComplete = () => {
    setCurrentSets((prev) => [...prev, { weight, reps }]);
    setTodaySetCount((prev) => prev + 1);
    if (currentExercise) updatePersonalBest(currentExercise.id, currentExercise.name, weight, reps);
  };

  const startEditSet = (i: number) => {
    setEditIndex(i);
    setEditWeight(currentSets[i].weight);
    setEditReps(currentSets[i].reps);
  };

  const saveEditSet = (i: number) => {
    setCurrentSets((prev) =>
      prev.map((s, idx) => (idx === i ? { weight: editWeight, reps: editReps } : s))
    );
    setEditIndex(null);
    if (currentExercise) {
      updatePersonalBest(currentExercise.id, currentExercise.name, editWeight, editReps);
    }
  };

  const deleteSet = (i: number) => {
    setCurrentSets((prev) => prev.filter((_, idx) => idx !== i));
    setTodaySetCount((prev) => Math.max(0, prev - 1));
    if (editIndex === i) setEditIndex(null);
  };

  const saveCurrentExercise = (): ExerciseRecord | null => {
    if (!currentExercise || currentSets.length === 0) return null;
    const pb = getPersonalBest(currentExercise.id);
    const hasPB = pb
      ? currentSets.some((s) => calculateEstimated1RM(s.weight, s.reps) >= pb.estimated1RM)
      : true;
    return {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      bodyPart: currentBodyPart,
      sets: currentSets,
      isNewPB: hasPB,
      memo: memo.trim() || undefined,
    };
  };

  const goToNextMenu = () => {
    const record = saveCurrentExercise();
    const updated = record ? [...completedExercises, record] : completedExercises;
    setCompletedExercises(updated);
    const sess = getCurrentSession();
    if (sess && record) { sess.exercises = updated; setCurrentSession(sess); }
    setCurrentExercise(null);
    setCurrentSets([]);
    setMemo('');
    setEditIndex(null);
    setPBNotice(null);
    setInputValue('');
    setHistoryExercises(getExercisesByBodyPart(currentBodyPart));
    setPhase('selecting');
  };

  const finishTraining = () => {
    const record = saveCurrentExercise();
    const allExercises = record ? [...completedExercises, record] : completedExercises;
    const sess = getCurrentSession();
    const duration = sess
      ? Math.floor((Date.now() - new Date(sess.startTime).getTime()) / 1000)
      : 0;
    if (sess) {
      saveSession({
        id: sess.id,
        date: new Date().toISOString(),
        bodyPart: initBodyPart,
        exercises: allExercises,
        durationSeconds: duration,
      });
      setCurrentSession(null);
    }
    const totalSets = allExercises.reduce((t, e) => t + e.sets.length, 0);
    router.push(`/complete?sets=${totalSets}&duration=${duration}`);
  };

  const lastMax = lastRecord?.sets.length
    ? lastRecord.sets.reduce((best, s) =>
        calculateEstimated1RM(s.weight, s.reps) > calculateEstimated1RM(best.weight, best.reps) ? s : best
      )
    : null;

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111] max-w-[430px] mx-auto">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#EBEBEB] px-6 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.replace('/')}
          className="flex items-center gap-2 text-[#BBBBBB] active:text-[#111] transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          終了
        </button>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xl font-black text-[#111] tabular-nums">{timer}</div>
            <div className="text-[9px] text-[#BBBBBB] uppercase tracking-widest">経過時間</div>
          </div>
          <div className="w-px h-8 bg-[#EBEBEB]" />
          <div className="text-center">
            <div className="text-xl font-black text-[#00BB66] tabular-nums">{todaySetCount}</div>
            <div className="text-[9px] text-[#BBBBBB] uppercase tracking-widest">今日のセット</div>
          </div>
        </div>
      </div>

      {/* Completed exercises chips */}
      {completedExercises.length > 0 && (
        <div className="px-6 pt-4 animate-fadeInUp">
          <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-2">完了済み</p>
          <div className="flex flex-wrap gap-2 mb-1">
            {completedExercises.map((ex, i) => (
              <span key={i} className="text-xs text-[#777] bg-white border border-[#EBEBEB] px-3 py-1 rounded-full shadow-sm">
                {ex.exerciseName} × {ex.sets.length}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ SELECTING PHASE ═══════════ */}
      {phase === 'selecting' && (
        <div className="px-6 pt-5 pb-32 animate-fadeInUp">

          {/* Body part selector */}
          <div className="mb-6">
            <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-3">部位</p>
            <div className="flex flex-wrap gap-2">
              {ALL_BODY_PARTS.map((bp) => (
                <button
                  key={bp}
                  onClick={() => setCurrentBodyPart(bp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    currentBodyPart === bp
                      ? 'bg-[#00DD77] text-black shadow-sm'
                      : 'bg-white border border-[#E8E8E8] text-[#777] active:bg-[#F0F0F0]'
                  }`}
                >
                  {BODY_PART_LABELS[bp]}
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-black text-[#111] mb-5">種目を選ぶ</h2>

          {/* Past exercises */}
          {historyExercises.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-3">過去の種目</p>
              <div className="flex flex-col gap-2">
                {historyExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => selectExercise(ex)}
                    className="bg-white border border-[#EBEBEB] rounded-xl px-4 py-4 flex items-center justify-between active:bg-[#F5F5F5] transition-colors shadow-sm"
                  >
                    <span className="font-bold text-[#111]">{ex.name}</span>
                    <span className="text-[#CCCCCC] text-xs">{ex.usageCount}回使用</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* New exercise input */}
          <div>
            <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-3">
              {historyExercises.length > 0 ? '新しく入力' : '種目名を入力'}
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startNewExercise(inputValue)}
              placeholder="例：ベンチプレス"
              className="w-full bg-white border border-[#EBEBEB] text-[#111] text-lg px-4 py-4 rounded-xl outline-none focus:border-[#00DD77] placeholder-[#CCCCCC] mb-3 shadow-sm transition-colors"
            />
            <button
              onClick={() => startNewExercise(inputValue)}
              disabled={!inputValue.trim()}
              className="w-full py-4 rounded-xl bg-[#00DD77] text-black font-black text-base active:scale-[0.97] transition-transform disabled:opacity-30 disabled:active:scale-100"
            >
              この種目で記録開始
            </button>
          </div>

          {completedExercises.length > 0 && (
            <button
              onClick={finishTraining}
              className="w-full mt-4 py-4 rounded-xl border border-[#E8E8E8] bg-white text-[#777] font-bold text-base active:text-[#111] transition-colors shadow-sm"
            >
              トレーニングを終了する
            </button>
          )}
        </div>
      )}

      {/* ═══════════ RECORDING PHASE ═══════════ */}
      {phase === 'recording' && currentExercise && (
        <div className="px-6 pt-5 pb-44 animate-fadeInUp">

          {/* Exercise name + tag + chart button */}
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-2xl font-black text-[#111] flex-1 leading-tight">
              {currentExercise.name}
            </h2>
            <span className="text-xs text-[#888] bg-white border border-[#EBEBEB] px-2 py-1 rounded-full shadow-sm shrink-0">
              {BODY_PART_LABELS[currentBodyPart]}
            </span>
            <button
              onClick={() => setShowChart(true)}
              title="成長グラフ"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#EBEBEB] bg-white text-[#888] active:bg-[#F0F0F0] transition-colors shadow-sm shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1,11 4,7 7,9 10,4 13,6" />
              </svg>
            </button>
          </div>

          {/* Previous MAX */}
          {lastMax && (
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-4 mb-4 shadow-sm">
              <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-2">
                前回MAX（{new Date(lastRecord!.date).toLocaleDateString('ja-JP', {
                  month: 'numeric', day: 'numeric',
                })}）
              </p>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-3xl font-black text-[#3B82F6]">
                  {lastMax.weight % 1 === 0 ? lastMax.weight : lastMax.weight.toFixed(1)}
                </span>
                <span className="text-[#AAAAAA] text-sm">kg</span>
                <span className="text-[#DDDDDD] text-xl font-light mx-1">×</span>
                <span className="text-3xl font-black text-[#3B82F6]">{lastMax.reps}</span>
                <span className="text-[#AAAAAA] text-sm">回</span>
                <span className="text-xs font-bold text-[#00AA55] ml-2 bg-[#00AA55]/10 px-2 py-0.5 rounded-full">
                  1RM {calculateEstimated1RM(lastMax.weight, lastMax.reps)}kg
                </span>
              </div>
            </div>
          )}

          {/* PB notice */}
          {pbNotice && (
            <div className={`rounded-xl px-4 py-3 mb-4 text-center font-bold text-sm ${
              pbNotice.type === 'ok'
                ? 'bg-[#00DD77]/15 border border-[#00DD77]/30 text-[#009944]'
                : 'bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]'
            }`}>
              {pbNotice.text}
            </div>
          )}

          {/* Weight & reps inputs */}
          <div className="flex flex-col gap-3 mb-5">
            <NumInput label="重量" value={weight} unit="kg" step={2.5} min={0} decimal onChange={setWeight} />
            <NumInput label="回数" value={reps} unit="回" step={1} min={1} onChange={setReps} />
          </div>

          {/* セット完了 */}
          <button
            onClick={handleSetComplete}
            className="w-full py-4 rounded-xl bg-[#00DD77] text-black font-black text-base active:scale-[0.97] transition-transform mb-5 shadow-sm"
          >
            セット完了
          </button>

          {/* Sets list */}
          {currentSets.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-2">
                このメニューのセット
              </p>
              <div className="flex flex-col gap-2">
                {currentSets.map((s, i) =>
                  editIndex === i ? (
                    /* ── Inline edit ── */
                    <div
                      key={i}
                      className="bg-white border border-[#00DD77]/40 rounded-xl p-4 shadow-sm animate-scaleIn"
                    >
                      <p className="text-[10px] text-[#AAAAAA] uppercase tracking-widest mb-3">
                        Set {i + 1} を編集
                      </p>
                      <div className="flex gap-3 mb-3">
                        {/* Edit weight */}
                        <div className="flex-1">
                          <p className="text-[10px] text-[#BBBBBB] mb-1.5">重量 (kg)</p>
                          <div className="flex items-center bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg overflow-hidden">
                            <button
                              onClick={() => setEditWeight((w) => Math.max(0, Math.round((w - 2.5) * 10) / 10))}
                              className="w-9 h-9 text-[#111] font-black flex items-center justify-center shrink-0 active:bg-[#EBEBEB] transition-colors"
                            >
                              −
                            </button>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editWeight % 1 === 0 ? String(editWeight) : editWeight.toFixed(1)}
                              onChange={(e) => {
                                const n = parseFloat(e.target.value);
                                if (!isNaN(n) && n >= 0) setEditWeight(n);
                              }}
                              className="flex-1 text-center text-base font-black bg-transparent outline-none text-[#111]"
                            />
                            <button
                              onClick={() => setEditWeight((w) => Math.round((w + 2.5) * 10) / 10)}
                              className="w-9 h-9 text-[#111] font-black flex items-center justify-center shrink-0 active:bg-[#EBEBEB] transition-colors"
                            >
                              ＋
                            </button>
                          </div>
                        </div>
                        {/* Edit reps */}
                        <div className="flex-1">
                          <p className="text-[10px] text-[#BBBBBB] mb-1.5">回数</p>
                          <div className="flex items-center bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg overflow-hidden">
                            <button
                              onClick={() => setEditReps((r) => Math.max(1, r - 1))}
                              className="w-9 h-9 text-[#111] font-black flex items-center justify-center shrink-0 active:bg-[#EBEBEB] transition-colors"
                            >
                              −
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={String(editReps)}
                              onChange={(e) => {
                                const n = parseInt(e.target.value, 10);
                                if (!isNaN(n) && n > 0) setEditReps(n);
                              }}
                              className="flex-1 text-center text-base font-black bg-transparent outline-none text-[#111]"
                            />
                            <button
                              onClick={() => setEditReps((r) => r + 1)}
                              className="w-9 h-9 text-[#111] font-black flex items-center justify-center shrink-0 active:bg-[#EBEBEB] transition-colors"
                            >
                              ＋
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditSet(i)}
                          className="flex-1 py-2.5 rounded-lg bg-[#00DD77] text-black font-bold text-sm active:scale-[0.97] transition-transform"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditIndex(null)}
                          className="flex-1 py-2.5 rounded-lg border border-[#EBEBEB] text-[#777] font-bold text-sm active:bg-[#F5F5F5] transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Normal row ── */
                    <div
                      key={i}
                      className="bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
                    >
                      <span className="text-[#BBBBBB] text-sm font-medium w-12 shrink-0">
                        Set {i + 1}
                      </span>
                      <span className="font-bold text-[#111] flex-1">
                        {s.weight % 1 === 0 ? s.weight : s.weight.toFixed(1)}kg × {s.reps}回
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEditSet(i)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F5F5F5] border border-[#E8E8E8] text-[#888] active:bg-[#EBEBEB] transition-colors"
                        >
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteSet(i)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-400 active:bg-red-100 transition-colors"
                        >
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M2 2l8 8M10 2l-8 8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Memo field */}
          <div className="mb-5">
            <p className="text-[10px] text-[#BBBBBB] uppercase tracking-widest mb-2">メモ（任意）</p>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="気づいたこと・体調・フォームのポイントなど…"
              rows={3}
              className="w-full bg-white border border-[#EBEBEB] text-[#111] text-sm px-4 py-3 rounded-xl outline-none focus:border-[#00DD77] placeholder-[#CCCCCC] resize-none shadow-sm transition-colors"
            />
          </div>
        </div>
      )}

      {/* Bottom action bar (recording phase) */}
      {phase === 'recording' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-6 pb-10 pt-5 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="flex gap-3">
            <button
              onClick={goToNextMenu}
              className="flex-1 py-4 rounded-xl bg-[#111] text-white font-bold text-base active:scale-[0.97] transition-transform"
            >
              次のメニュー
            </button>
            <button
              onClick={finishTraining}
              className="flex-1 py-4 rounded-xl border border-[#E8E8E8] bg-white text-[#777] font-bold text-base active:text-[#111] transition-colors shadow-sm"
            >
              終了
            </button>
          </div>
        </div>
      )}

      {/* Progress Chart Modal */}
      {showChart && currentExercise && (
        <ExerciseProgressChart
          exerciseId={currentExercise.id}
          exerciseName={currentExercise.name}
          onClose={() => setShowChart(false)}
        />
      )}
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F7]" />}>
      <SessionContent />
    </Suspense>
  );
}
