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
  classifyExercise,
  saveLastSessionSummary,
} from '@/lib/storage';
import {
  BODY_PART_LABELS, BodyPart, Exercise, ExerciseRecord,
  ExerciseType, WorkoutSet,
} from '@/lib/types';
import Image from 'next/image';
import ExerciseProgressChart from '../components/ExerciseProgressChart';

const ALL_BODY_PARTS: BodyPart[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatSetDisplay(s: WorkoutSet, type: ExerciseType): string {
  if (type === 'CARDIO') {
    const parts: string[] = [];
    if (s.durationSeconds) {
      const m = Math.floor(s.durationSeconds / 60);
      const sec = s.durationSeconds % 60;
      parts.push(sec > 0 ? `${m}分${sec}秒` : `${m}分`);
    }
    if (s.distanceKm) parts.push(`${s.distanceKm}km`);
    return parts.join('  ') || '—';
  }
  if (type === 'BODYWEIGHT') return `${s.reps}回`;
  const w = s.weight % 1 === 0 ? String(s.weight) : s.weight.toFixed(1);
  return `${w}kg × ${s.reps}回`;
}

// ── Session elapsed timer ──────────────────────────────────────────────────────
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

// ── Rest Timer overlay ────────────────────────────────────────────────────────
const REST_PRESETS = [30, 60, 90, 120, 180];

function RestTimerOverlay({
  seconds,
  total,
  onSkip,
  onPreset,
}: {
  seconds: number;
  total: number;
  onSkip: () => void;
  onPreset: (s: number) => void;
}) {
  const pct = total > 0 ? seconds / total : 0;
  const size = 96;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}`;
  };

  return (
    <div className="fixed bottom-28 left-0 right-0 max-w-[430px] mx-auto px-5 z-40 animate-fadeInUp">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center gap-4">
          {/* Circular progress */}
          <div className="relative shrink-0">
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1A1A1A" strokeWidth="5" />
              <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={seconds <= 10 ? '#f87171' : '#00FF88'} strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black tabular-nums ${seconds <= 10 ? 'text-red-400' : 'text-white'}`}>
                {fmt(seconds)}
              </span>
              <span className="text-[9px] text-white/30 uppercase tracking-widest">休憩</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 mb-2">プリセット</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {REST_PRESETS.map((s) => (
                <button key={s} onClick={() => onPreset(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    total === s && seconds === s
                      ? 'bg-[#00FF88] text-black'
                      : 'bg-[#222] text-white/60 active:bg-[#333]'
                  }`}>
                  {s < 60 ? `${s}s` : `${s / 60}分`}
                </button>
              ))}
            </div>
            <button onClick={onSkip}
              className="w-full py-2 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/25 text-[#00FF88] text-sm font-bold active:bg-[#00FF88]/20 transition-colors">
              スキップ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NumInput (weight / reps) ────────────────────────────────────────────────
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

  return (
    <div>
      <p className="text-[10px] text-white/50 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-center gap-2 bg-[#141414] border border-[#222] rounded-2xl px-3 py-2">
        <button
          onClick={() => adjust(-step)}
          className="w-12 h-12 rounded-xl bg-[#00FF88] text-black text-2xl font-black flex items-center justify-center active:opacity-80 transition-opacity shrink-0"
        >
          −
        </button>
        <div className="flex-1 flex items-baseline justify-center gap-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            value={inputVal}
            onChange={(e) => {
              const raw = e.target.value;
              setInputVal(raw);
              const num = decimal ? parseFloat(raw) : parseInt(raw, 10);
              if (!isNaN(num) && num >= min) onChange(num);
            }}
            onBlur={() => setInputVal(fmt(value))}
            className="w-28 text-5xl font-black text-[#00FF88] text-center bg-transparent outline-none"
            style={{ textShadow: '0 0 12px rgba(0,255,136,0.4)' }}
          />
          <span className="text-white/50 text-sm shrink-0">{unit}</span>
        </div>
        <button
          onClick={() => adjust(step)}
          className="w-12 h-12 rounded-xl bg-[#00FF88] text-black text-2xl font-black flex items-center justify-center active:opacity-80 transition-opacity shrink-0"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

// ── Cardio Input ───────────────────────────────────────────────────────────────
function CardioInput({
  minutes, seconds, km,
  onMinutes, onSeconds, onKm,
}: {
  minutes: number; seconds: number; km: number;
  onMinutes: (v: number) => void; onSeconds: (v: number) => void; onKm: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[10px] text-white/50 uppercase tracking-widest mb-2">時間</p>
        <div className="flex gap-2">
          <div className="flex items-center bg-[#141414] border border-[#222] rounded-xl overflow-hidden flex-1">
            <button onClick={() => onMinutes(Math.max(0, minutes - 1))}
              className="w-11 h-11 bg-[#00FF88] text-black text-xl font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">−</button>
            <div className="flex-1 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-[#00FF88] tabular-nums">{String(minutes).padStart(2, '0')}</span>
              <span className="text-white/50 text-sm">分</span>
            </div>
            <button onClick={() => onMinutes(minutes + 1)}
              className="w-11 h-11 bg-[#00FF88] text-black text-xl font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">＋</button>
          </div>
          <div className="flex items-center bg-[#141414] border border-[#222] rounded-xl overflow-hidden flex-1">
            <button onClick={() => onSeconds(Math.max(0, seconds - 5))}
              className="w-11 h-11 bg-[#00FF88] text-black text-xl font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">−</button>
            <div className="flex-1 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-[#00FF88] tabular-nums">{String(seconds).padStart(2, '0')}</span>
              <span className="text-white/50 text-sm">秒</span>
            </div>
            <button onClick={() => onSeconds(Math.min(55, seconds + 5))}
              className="w-11 h-11 bg-[#00FF88] text-black text-xl font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">＋</button>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-white/50 uppercase tracking-widest mb-2">距離（任意）</p>
        <div className="flex items-center bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
          <button onClick={() => onKm(Math.max(0, Math.round((km - 0.1) * 10) / 10))}
            className="w-11 h-11 bg-[#00FF88] text-black text-xl font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">−</button>
          <div className="flex-1 flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-[#00FF88] tabular-nums">
              {km === 0 ? '—' : (km % 1 === 0 ? km : km.toFixed(1))}
            </span>
            <span className="text-white/50 text-sm">km</span>
          </div>
          <button onClick={() => onKm(Math.round((km + 0.1) * 10) / 10)}
            className="w-11 h-11 bg-[#00FF88] text-black text-xl font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">＋</button>
        </div>
      </div>
    </div>
  );
}

// ── Exercise type badge ────────────────────────────────────────────────────────
const TYPE_LABEL: Record<ExerciseType, string> = {
  WEIGHT: '重量',
  BODYWEIGHT: '自重',
  CARDIO: '有酸素',
};
const TYPE_COLOR: Record<ExerciseType, string> = {
  WEIGHT: 'bg-blue-900/40 text-blue-400 border-blue-800/50',
  BODYWEIGHT: 'bg-purple-900/40 text-purple-400 border-purple-800/50',
  CARDIO: 'bg-orange-900/40 text-orange-400 border-orange-800/50',
};

// ── Main session content ───────────────────────────────────────────────────────
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
  const [exerciseType, setExerciseType] = useState<ExerciseType>('WEIGHT');
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [cardioMins, setCardioMins] = useState(20);
  const [cardioSecs, setCardioSecs] = useState(0);
  const [cardioKm, setCardioKm] = useState(0);
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

  // ── Rest timer state ──
  const [restSeconds, setRestSeconds] = useState(0);
  const [restTotal, setRestTotal] = useState(90);
  const [restActive, setRestActive] = useState(false);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRest = (secs: number) => {
    if (restRef.current) clearInterval(restRef.current);
    setRestTotal(secs);
    setRestSeconds(secs);
    setRestActive(true);
    restRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(restRef.current!);
          setRestActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRest = () => {
    if (restRef.current) clearInterval(restRef.current);
    setRestActive(false);
    setRestSeconds(0);
  };

  useEffect(() => () => { if (restRef.current) clearInterval(restRef.current); }, []);

  // ── Lifecycle ──
  useEffect(() => { setHistoryExercises(getExercisesByBodyPart(currentBodyPart)); }, [currentBodyPart]);
  useEffect(() => { setTodaySetCount(getTodaySavedSets()); }, []);
  useEffect(() => { if (!getCurrentSession()) router.replace('/'); }, [router]);

  // ── Browser back protection ──
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    const handlePopState = () => {
      const confirmed = window.confirm('セッションを終了してホームに戻りますか？\n記録中のデータは失われます。');
      if (confirmed) {
        setCurrentSession(null);
        router.replace('/');
      } else {
        // Push state back so back button doesn't navigate away
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  useEffect(() => {
    if (!currentExercise) return;
    const last = getLastExerciseRecord(currentExercise.id);
    setLastRecord(last);
    if (last?.sets.length && exerciseType === 'WEIGHT') {
      const best = last.sets.reduce((b, s) =>
        calculateEstimated1RM(s.weight, s.reps) > calculateEstimated1RM(b.weight, b.reps) ? s : b
      );
      setWeight(best.weight);
      setReps(best.reps);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise]);

  useEffect(() => {
    if (!currentExercise || exerciseType !== 'WEIGHT') { setPBNotice(null); return; }
    const pb = getPersonalBest(currentExercise.id);
    if (!pb) { setPBNotice(null); return; }
    const c = calculateEstimated1RM(weight, reps);
    if (c > pb.estimated1RM)
      setPBNotice({ text: weight > pb.weight ? '重量更新！' : '自己ベスト更新！', type: 'ok' });
    else if (calculateEstimated1RM(weight, reps + 1) > pb.estimated1RM)
      setPBNotice({ text: 'あと1回で自己ベスト更新', type: 'warn' });
    else setPBNotice(null);
  }, [weight, reps, currentExercise, exerciseType]);

  /* ── Actions ── */
  const selectExercise = (ex: Exercise) => {
    setCurrentExercise(ex);
    const t = ex.exerciseType || classifyExercise(ex.name);
    setExerciseType(t);
    setCurrentSets([]); setMemo(''); setEditIndex(null);
    stopRest();
    setPhase('recording');
  };

  const startNewExercise = (name: string) => {
    if (!name.trim()) return;
    const t = classifyExercise(name);
    setExerciseType(t);
    const ex = addOrUpdateExercise(name.trim(), currentBodyPart, t);
    setHistoryExercises(getExercisesByBodyPart(currentBodyPart));
    setCurrentExercise(ex);
    setCurrentSets([]); setMemo(''); setEditIndex(null); setInputValue('');
    stopRest();
    setPhase('recording');
  };

  // ← 記録フェーズ → 種目選択に戻る（セット未保存は破棄）
  const backToSelecting = () => {
    if (currentSets.length > 0) {
      const ok = window.confirm(`「${currentExercise?.name}」の記録を破棄して戻りますか？`);
      if (!ok) return;
    }
    stopRest();
    setCurrentExercise(null); setCurrentSets([]); setMemo('');
    setEditIndex(null); setPBNotice(null);
    setPhase('selecting');
  };

  // セッション全体を終了してホームへ
  const exitSession = () => {
    if (completedExercises.length > 0 || currentSets.length > 0) {
      const ok = window.confirm('セッションを終了してホームに戻りますか？\n記録中のデータは失われます。');
      if (!ok) return;
    }
    stopRest();
    setCurrentSession(null);
    router.replace('/');
  };

  const handleSetComplete = () => {
    let newSet: WorkoutSet;
    if (exerciseType === 'CARDIO') {
      newSet = {
        weight: 0, reps: 0,
        durationSeconds: cardioMins * 60 + cardioSecs,
        distanceKm: cardioKm > 0 ? cardioKm : undefined,
      };
    } else if (exerciseType === 'BODYWEIGHT') {
      newSet = { weight: 0, reps };
    } else {
      newSet = { weight, reps };
    }
    setCurrentSets((prev) => [...prev, newSet]);
    setTodaySetCount((prev) => prev + 1);
    if (currentExercise && exerciseType === 'WEIGHT') {
      updatePersonalBest(currentExercise.id, currentExercise.name, weight, reps);
    }
    // Start rest timer after set
    startRest(restTotal);
  };

  const startEditSet = (i: number) => {
    setEditIndex(i);
    setEditWeight(currentSets[i].weight);
    setEditReps(currentSets[i].reps);
  };

  const saveEditSet = (i: number) => {
    setCurrentSets((prev) =>
      prev.map((s, idx) => idx === i ? { ...s, weight: editWeight, reps: editReps } : s)
    );
    setEditIndex(null);
    if (currentExercise && exerciseType === 'WEIGHT') {
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
    const pb = exerciseType === 'WEIGHT' ? getPersonalBest(currentExercise.id) : null;
    const hasPB = pb
      ? currentSets.some((s) => calculateEstimated1RM(s.weight, s.reps) >= pb.estimated1RM)
      : false;
    return {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      bodyPart: currentBodyPart,
      exerciseType,
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
    stopRest();
    setCurrentExercise(null); setCurrentSets([]); setMemo('');
    setEditIndex(null); setPBNotice(null); setInputValue('');
    setHistoryExercises(getExercisesByBodyPart(currentBodyPart));
    setPhase('selecting');
  };

  const finishTraining = () => {
    const record = saveCurrentExercise();
    const all = record ? [...completedExercises, record] : completedExercises;
    const sess = getCurrentSession();
    const duration = sess
      ? Math.floor((Date.now() - new Date(sess.startTime).getTime()) / 1000) : 0;
    if (sess) {
      saveSession({ id: sess.id, date: new Date().toISOString(), bodyPart: initBodyPart, exercises: all, durationSeconds: duration });
      const hasPB = all.some((e) => e.isNewPB);
      const summaryExercises = all.map((e) => {
        const maxSet = e.sets.length > 0 ? e.sets.reduce((b, s) =>
          calculateEstimated1RM(s.weight, s.reps) > calculateEstimated1RM(b.weight, b.reps) ? s : b
        ) : null;
        let setsLabel = '';
        if (e.exerciseType === 'CARDIO') {
          setsLabel = `${e.sets.length}セット`;
        } else if (e.exerciseType === 'BODYWEIGHT') {
          const avgReps = e.sets.length > 0 ? Math.round(e.sets.reduce((t, s) => t + s.reps, 0) / e.sets.length) : 0;
          setsLabel = `${avgReps}回（${e.sets.length}セット）`;
        } else if (maxSet) {
          const w = maxSet.weight % 1 === 0 ? String(maxSet.weight) : maxSet.weight.toFixed(1);
          setsLabel = `${w}kg × ${maxSet.reps}回（${e.sets.length}セット）`;
        }
        return { name: e.exerciseName, bodyPart: e.bodyPart, setsLabel, isNewPB: e.isNewPB };
      });
      saveLastSessionSummary({ bodyPart: initBodyPart, exercises: summaryExercises, hasPB });
      setCurrentSession(null);
    }
    stopRest();
    const total = all.reduce((t, e) => t + e.sets.length, 0);
    router.push(`/complete?sets=${total}&duration=${duration}`);
  };

  const lastMax = lastRecord?.sets.length
    ? lastRecord.sets.reduce((b, s) =>
        calculateEstimated1RM(s.weight, s.reps) > calculateEstimated1RM(b.weight, b.reps) ? s : b)
    : null;

  /* ── RENDER ── */
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white max-w-[430px] mx-auto">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#0D0D0D] border-b border-[#1F1F1F] px-5 py-3">
        <div className="flex items-center gap-3">
          {/* 左ボタン: recordingフェーズなら「← 戻る」、selectingなら「終了」 */}
          {phase === 'recording' ? (
            <button onClick={backToSelecting}
              className="flex items-center gap-1.5 text-white/50 active:text-white transition-colors text-sm shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M9 2L4 7l5 5"/>
              </svg>
              戻る
            </button>
          ) : (
            <button onClick={exitSession}
              className="flex items-center gap-1.5 text-white/50 active:text-white transition-colors text-sm shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M9 2L4 7l5 5"/>
              </svg>
              終了
            </button>
          )}

          <div className="flex-1 flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-white tabular-nums leading-tight">{timer}</div>
              <div className="text-[9px] text-white/30 uppercase tracking-widest">経過時間</div>
            </div>
            <div className="w-px h-8 bg-[#222]"/>
            <div className="text-center">
              <div className="text-2xl font-black text-[#00FF88] tabular-nums leading-tight"
                style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>{todaySetCount}</div>
              <div className="text-[9px] text-white/30 uppercase tracking-widest">今日のセット</div>
            </div>
          </div>

          {/* 右: 終了ボタン（recordingフェーズのみ表示） */}
          {phase === 'recording' && (
            <button onClick={finishTraining}
              className="text-[#00FF88] text-sm font-bold shrink-0 active:opacity-70 transition-opacity">
              完了
            </button>
          )}
        </div>
      </div>

      {/* Completed exercises chips */}
      {completedExercises.length > 0 && (
        <div className="px-6 pt-4 animate-fadeInUp">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">完了済み</p>
          <div className="flex flex-wrap gap-2 mb-1">
            {completedExercises.map((ex, i) => (
              <span key={i} className="text-xs text-[#00FF88] bg-[#00FF88]/10 border border-[#00FF88]/20 px-3 py-1 rounded-full">
                {ex.exerciseName} × {ex.sets.length}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SELECTING ═══ */}
      {phase === 'selecting' && (
        <div className="px-6 pt-5 pb-32 animate-fadeInUp">
          {/* Body part chips */}
          <div className="mb-6">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">部位</p>
            <div className="flex flex-wrap gap-2">
              {ALL_BODY_PARTS.map((bp) => (
                <button key={bp} onClick={() => setCurrentBodyPart(bp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    currentBodyPart === bp
                      ? 'bg-[#00FF88] text-black'
                      : 'bg-[#1A1A1A] border border-[#2A2A2A] text-white/60 active:bg-[#222]'
                  }`}>
                  {BODY_PART_LABELS[bp]}
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-black text-white mb-5">種目を選ぶ</h2>

          {historyExercises.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">過去の種目</p>
              <div className="flex flex-col gap-2">
                {historyExercises.map((ex) => (
                  <button key={ex.id} onClick={() => selectExercise(ex)}
                    className="bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 flex items-center justify-between active:bg-[#1A1A1A] transition-colors">
                    <span className="font-bold text-white">{ex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${TYPE_COLOR[ex.exerciseType || 'WEIGHT']}`}>
                        {TYPE_LABEL[ex.exerciseType || 'WEIGHT']}
                      </span>
                      <span className="text-white/40 text-xs">{ex.usageCount}回</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">
              {historyExercises.length > 0 ? '新しく入力' : '種目名を入力'}
            </p>
            <input
              type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startNewExercise(inputValue)}
              placeholder="例：ベンチプレス / ランニング"
              className="w-full bg-[#141414] border border-[#222] text-white text-lg px-4 py-4 rounded-xl outline-none focus:border-[#00FF88] placeholder-[#333] mb-3 transition-colors"
            />
            <button onClick={() => startNewExercise(inputValue)} disabled={!inputValue.trim()}
              className="w-full py-4 rounded-xl bg-[#00FF88] text-black font-black text-base active:scale-[0.97] transition-transform disabled:opacity-30 disabled:active:scale-100 glow-btn">
              この種目で記録開始
            </button>
          </div>

          {completedExercises.length > 0 && (
            <button onClick={finishTraining}
              className="w-full mt-4 py-4 rounded-xl border border-[#2A2A2A] bg-[#161616] text-white/60 font-bold text-base active:text-white transition-colors">
              トレーニングを終了する
            </button>
          )}
        </div>
      )}

      {/* ═══ RECORDING ═══ */}
      {phase === 'recording' && currentExercise && (
        <div className="px-6 pt-5 pb-44 animate-fadeInUp">

          {/* Exercise name header with anatomy image */}
          <div className="flex items-start gap-3 mb-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${TYPE_COLOR[exerciseType]}`}>
                  {TYPE_LABEL[exerciseType]}
                </span>
                <span className="text-xs text-white/50 bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 rounded-full">
                  {BODY_PART_LABELS[currentBodyPart]}
                </span>
                {exerciseType === 'WEIGHT' && (
                  <button onClick={() => setShowChart(true)} title="成長グラフ"
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1A1A1A] text-white/40 active:bg-[#222] transition-colors">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1,11 4,7 7,9 10,4 13,6" />
                    </svg>
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">{currentExercise.name}</h2>
            </div>
            <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-[#222]">
              <Image
                src={`/anatomy/${currentBodyPart}.png`}
                alt={currentBodyPart}
                width={64}
                height={64}
                style={{ objectFit: 'cover', objectPosition: 'top center' }}
              />
            </div>
          </div>

          {/* Previous MAX */}
          {lastMax && exerciseType === 'WEIGHT' && (
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 mb-4">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">
                前回MAX（{new Date(lastRecord!.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}）
              </p>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-3xl font-black text-[#60a5fa]">
                  {lastMax.weight % 1 === 0 ? lastMax.weight : lastMax.weight.toFixed(1)}
                </span>
                <span className="text-white/50 text-sm">kg</span>
                <span className="text-white/20 text-xl font-light mx-1">×</span>
                <span className="text-3xl font-black text-[#60a5fa]">{lastMax.reps}</span>
                <span className="text-white/50 text-sm">回</span>
                <span className="text-xs font-bold text-[#00FF88] ml-2 bg-[#00FF88]/10 border border-[#00FF88]/20 px-2 py-0.5 rounded-full">
                  1RM {calculateEstimated1RM(lastMax.weight, lastMax.reps)}kg
                </span>
              </div>
            </div>
          )}

          {/* PB notice */}
          {pbNotice && (
            <div className={`rounded-xl px-4 py-3 mb-4 text-center font-bold text-sm ${
              pbNotice.type === 'ok'
                ? 'bg-[#00FF88]/10 border border-[#00FF88]/25 text-[#00FF88]'
                : 'bg-blue-900/30 border border-blue-800/40 text-[#60a5fa]'
            }`}>
              {pbNotice.text}
            </div>
          )}

          {/* ── Input by exercise type ── */}
          <div className="flex flex-col gap-3 mb-5">
            {exerciseType === 'WEIGHT' && (
              <>
                <NumInput label="重量" value={weight} unit="kg" step={2.5} min={0} decimal onChange={setWeight} />
                <NumInput label="回数" value={reps} unit="回" step={1} min={1} onChange={setReps} />
              </>
            )}
            {exerciseType === 'BODYWEIGHT' && (
              <NumInput label="回数" value={reps} unit="回" step={1} min={1} onChange={setReps} />
            )}
            {exerciseType === 'CARDIO' && (
              <CardioInput
                minutes={cardioMins} seconds={cardioSecs} km={cardioKm}
                onMinutes={setCardioMins} onSeconds={setCardioSecs} onKm={setCardioKm}
              />
            )}
          </div>

          {/* Complete button */}
          <button onClick={handleSetComplete}
            className="w-full py-4 rounded-xl bg-[#00FF88] text-black font-black text-base active:scale-[0.97] transition-transform mb-5 glow-btn">
            {exerciseType === 'CARDIO' ? '記録する' : `セット完了 (${currentSets.length + 1}セット目)`}
          </button>

          {/* Sets list */}
          {currentSets.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">
                このメニューの記録
              </p>
              <div className="flex flex-col gap-2">
                {currentSets.map((s, i) =>
                  editIndex === i && exerciseType === 'WEIGHT' ? (
                    <div key={i} className="bg-[#141414] border border-[#00FF88]/25 rounded-xl p-4 animate-scaleIn">
                      <p className="text-[10px] text-white/50 uppercase tracking-widest mb-3">Set {i + 1} を編集</p>
                      <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                          <p className="text-[10px] text-white/40 mb-1.5">重量 (kg)</p>
                          <div className="flex items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
                            <button onClick={() => setEditWeight((w) => Math.max(0, Math.round((w - 2.5) * 10) / 10))}
                              className="w-9 h-9 bg-[#00FF88] text-black font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">−</button>
                            <input type="text" inputMode="decimal"
                              value={editWeight % 1 === 0 ? String(editWeight) : editWeight.toFixed(1)}
                              onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n) && n >= 0) setEditWeight(n); }}
                              className="flex-1 text-center text-base font-black bg-transparent outline-none text-[#00FF88]" />
                            <button onClick={() => setEditWeight((w) => Math.round((w + 2.5) * 10) / 10)}
                              className="w-9 h-9 bg-[#00FF88] text-black font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">＋</button>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-white/40 mb-1.5">回数</p>
                          <div className="flex items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
                            <button onClick={() => setEditReps((r) => Math.max(1, r - 1))}
                              className="w-9 h-9 bg-[#00FF88] text-black font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">−</button>
                            <input type="text" inputMode="numeric"
                              value={String(editReps)}
                              onChange={(e) => { const n = parseInt(e.target.value, 10); if (!isNaN(n) && n > 0) setEditReps(n); }}
                              className="flex-1 text-center text-base font-black bg-transparent outline-none text-[#00FF88]" />
                            <button onClick={() => setEditReps((r) => r + 1)}
                              className="w-9 h-9 bg-[#00FF88] text-black font-black flex items-center justify-center shrink-0 active:opacity-80 transition-opacity">＋</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEditSet(i)}
                          className="flex-1 py-2.5 rounded-lg bg-[#00FF88] text-black font-bold text-sm active:scale-[0.97] transition-transform">保存</button>
                        <button onClick={() => setEditIndex(null)}
                          className="flex-1 py-2.5 rounded-lg border border-[#2A2A2A] text-white/60 font-bold text-sm active:bg-[#1A1A1A] transition-colors">キャンセル</button>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="bg-[#141414] border border-[#222] rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-white/40 text-sm font-medium w-12 shrink-0">
                        {exerciseType === 'CARDIO' ? `#${i + 1}` : `Set ${i + 1}`}
                      </span>
                      <span className="font-bold text-white flex-1 text-sm">
                        {formatSetDisplay(s, exerciseType)}
                      </span>
                      <div className="flex gap-1.5">
                        {exerciseType === 'WEIGHT' && (
                          <button onClick={() => startEditSet(i)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-white/40 active:bg-[#222] transition-colors">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" />
                            </svg>
                          </button>
                        )}
                        <button onClick={() => deleteSet(i)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-900/30 border border-red-800/40 text-red-400 active:bg-red-900/50 transition-colors">
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

          {/* Memo */}
          <div className="mb-5">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">メモ（任意）</p>
            <textarea
              value={memo} onChange={(e) => setMemo(e.target.value)}
              placeholder="気づいたこと・体調・フォームのポイントなど…"
              rows={3}
              className="w-full bg-[#141414] border border-[#222] text-white text-sm px-4 py-3 rounded-xl outline-none focus:border-[#00FF88] placeholder-[#333] resize-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* Rest timer overlay */}
      {restActive && (
        <RestTimerOverlay
          seconds={restSeconds}
          total={restTotal}
          onSkip={stopRest}
          onPreset={(s) => startRest(s)}
        />
      )}

      {/* Bottom bar (recording phase) */}
      {phase === 'recording' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-6 pb-10 pt-5"
          style={{ background: 'linear-gradient(to top, #0A0A0A 80%, transparent)' }}>
          <div className="flex gap-3">
            <button onClick={goToNextMenu}
              className="flex-1 py-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-white font-bold text-base active:scale-[0.97] transition-transform">
              次のメニューへ
            </button>
            <button onClick={finishTraining}
              className="flex-1 py-4 rounded-xl border border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88] font-bold text-base active:scale-[0.97] transition-transform">
              終了
            </button>
          </div>
        </div>
      )}

      {/* Progress chart modal */}
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
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <SessionContent />
    </Suspense>
  );
}
