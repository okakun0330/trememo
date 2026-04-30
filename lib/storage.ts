import {
  BodyPart,
  BodyWeightRecord,
  CurrentSession,
  Exercise,
  ExerciseType,
  PersonalBest,
  WorkoutSession,
  WorkoutSet,
} from './types';

// ── Exercise type classifier ──────────────────────────────────────────────────

export function classifyExercise(name: string): ExerciseType {
  const lower = name.toLowerCase();
  const cardioWords = [
    'ランニング', 'ジョギング', 'ウォーキング', 'バイク', '自転車', 'エアロバイク',
    'ステッパー', 'トレッドミル', '水泳', 'スイミング', 'ロープ', '縄跳び',
    'サイクリング', 'マラソン', 'ウォーク', 'ランナー', '有酸素', 'ローイング',
    'running', 'jogging', 'cycling', 'swimming', 'cardio', 'bike', 'walk',
    'treadmill', 'rowing', 'elliptical', 'jump rope', 'skipping',
  ];
  const bwWords = [
    '懸垂', '腕立て', 'プッシュアップ', 'ディップス', 'プランク', 'クランチ',
    'シットアップ', 'バーピー', 'チンアップ', 'プルアップ', 'レッグレイズ',
    'マウンテンクライマー', '自重',
    'pullup', 'chinup', 'pushup', 'push-up', 'dips', 'plank', 'burpee',
    'crunch', 'situp', 'bodyweight', 'leg raise',
  ];
  if (cardioWords.some((w) => lower.includes(w))) return 'CARDIO';
  if (bwWords.some((w) => lower.includes(w))) return 'BODYWEIGHT';
  return 'WEIGHT';
}

const KEYS = {
  EXERCISES: 'trememo_exercises',
  SESSIONS: 'trememo_sessions',
  PBS: 'trememo_pbs',
  CURRENT_SESSION: 'trememo_current_session',
  WEEKLY_GOAL: 'trememo_weekly_goal',
  USER_NAME: 'trememo_user_name',
  BODY_WEIGHT: 'trememo_body_weight',
};

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Exercises ─────────────────────────────────────────────────────────────────

export function getExercises(): Exercise[] {
  return getItem<Exercise[]>(KEYS.EXERCISES, []);
}

export function getExercisesByBodyPart(bodyPart: BodyPart): Exercise[] {
  return getExercises()
    .filter((e) => e.bodyPart === bodyPart)
    .sort((a, b) => {
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    });
}

export function addOrUpdateExercise(
  name: string,
  bodyPart: BodyPart,
  exerciseType?: ExerciseType
): Exercise {
  const exercises = getExercises();
  const existing = exercises.find(
    (e) => e.name.toLowerCase() === name.toLowerCase() && e.bodyPart === bodyPart
  );
  if (existing) {
    existing.usageCount += 1;
    existing.lastUsed = new Date().toISOString();
    if (exerciseType) existing.exerciseType = exerciseType;
    setItem(KEYS.EXERCISES, exercises);
    return existing;
  }
  const newEx: Exercise = {
    id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    bodyPart,
    exerciseType: exerciseType ?? classifyExercise(name),
    usageCount: 1,
    lastUsed: new Date().toISOString(),
  };
  exercises.push(newEx);
  setItem(KEYS.EXERCISES, exercises);
  return newEx;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export function getSessions(): WorkoutSession[] {
  return getItem<WorkoutSession[]>(KEYS.SESSIONS, []);
}

export function saveSession(session: WorkoutSession): void {
  const sessions = getSessions();
  sessions.push(session);
  setItem(KEYS.SESSIONS, sessions);
}

export function getLastSession(): WorkoutSession | null {
  const sessions = getSessions();
  return sessions.length ? sessions[sessions.length - 1] : null;
}

export function getLastExerciseRecord(
  exerciseId: string
): { sets: WorkoutSet[]; date: string } | null {
  const sessions = getSessions();
  for (let i = sessions.length - 1; i >= 0; i--) {
    const record = sessions[i].exercises.find((e) => e.exerciseId === exerciseId);
    if (record) return { sets: record.sets, date: sessions[i].date };
  }
  return null;
}

export function getTodaySavedSets(): number {
  const today = new Date().toDateString();
  return getSessions()
    .filter((s) => new Date(s.date).toDateString() === today)
    .reduce((total, s) => total + s.exercises.reduce((t, e) => t + e.sets.length, 0), 0);
}

// ── Personal Bests ────────────────────────────────────────────────────────────

export function getPersonalBests(): Record<string, PersonalBest> {
  return getItem<Record<string, PersonalBest>>(KEYS.PBS, {});
}

export function getPersonalBest(exerciseId: string): PersonalBest | null {
  return getPersonalBests()[exerciseId] ?? null;
}

export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function updatePersonalBest(
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number
): { isNewPB: boolean; pbType?: 'weight' | 'reps' } {
  const pbs = getPersonalBests();
  const existing = pbs[exerciseId];
  const newE1RM = calculateEstimated1RM(weight, reps);

  if (!existing) {
    pbs[exerciseId] = { exerciseId, exerciseName, weight, reps, estimated1RM: newE1RM, date: new Date().toISOString() };
    setItem(KEYS.PBS, pbs);
    return { isNewPB: true, pbType: 'weight' };
  }
  if (newE1RM > existing.estimated1RM) {
    const pbType: 'weight' | 'reps' = weight > existing.weight ? 'weight' : 'reps';
    pbs[exerciseId] = { exerciseId, exerciseName, weight, reps, estimated1RM: newE1RM, date: new Date().toISOString() };
    setItem(KEYS.PBS, pbs);
    return { isNewPB: true, pbType };
  }
  return { isNewPB: false };
}

// ── Weekly goal ───────────────────────────────────────────────────────────────

// ── User profile ──────────────────────────────────────────────────────────────

export function getUserName(): string {
  return getItem<string>(KEYS.USER_NAME, '');
}

export function setUserName(name: string): void {
  setItem(KEYS.USER_NAME, name.trim());
}

// ── Weekly goal ───────────────────────────────────────────────────────────────

export function getWeeklyGoal(): number {
  return getItem<number>(KEYS.WEEKLY_GOAL, 3);
}

export function setWeeklyGoal(goal: number): void {
  setItem(KEYS.WEEKLY_GOAL, Math.max(1, Math.min(7, goal)));
}

export function getWeeklyStats(): { count: number; goal: number } {
  const sessions = getSessions();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const days = new Set(
    sessions
      .filter((s) => new Date(s.date) >= weekStart)
      .map((s) => new Date(s.date).toDateString())
  );
  return { count: days.size, goal: getWeeklyGoal() };
}

// ── Recommended body part ─────────────────────────────────────────────────────

export function getRecommendedBodyPart(): BodyPart {
  const PARTS: BodyPart[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];
  const sessions = getSessions();
  if (!sessions.length) return 'chest';
  const lastUsed: Partial<Record<BodyPart, number>> = {};
  for (const s of sessions) {
    lastUsed[s.bodyPart] = Math.max(lastUsed[s.bodyPart] ?? 0, new Date(s.date).getTime());
  }
  let oldest: BodyPart = 'chest';
  let oldestTime = Infinity;
  for (const bp of PARTS) {
    const t = lastUsed[bp] ?? 0;
    if (t < oldestTime) { oldestTime = t; oldest = bp; }
  }
  return oldest;
}

// ── Exercise history (for progress chart) ────────────────────────────────────

export function getExerciseHistory(exerciseId: string): Array<{
  date: string;
  sets: WorkoutSet[];
  maxSet: WorkoutSet;
  estimated1RM: number;
}> {
  const sessions = getSessions();
  const result: Array<{ date: string; sets: WorkoutSet[]; maxSet: WorkoutSet; estimated1RM: number }> = [];
  for (const session of sessions) {
    const record = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (record && record.sets.length > 0) {
      const maxSet = record.sets.reduce((best, s) =>
        calculateEstimated1RM(s.weight, s.reps) > calculateEstimated1RM(best.weight, best.reps) ? s : best
      );
      result.push({
        date: session.date,
        sets: record.sets,
        maxSet,
        estimated1RM: calculateEstimated1RM(maxSet.weight, maxSet.reps),
      });
    }
  }
  return result;
}

// ── Last Session Summary (for complete screen) ────────────────────────────────

export interface ExerciseSummary {
  name: string;
  bodyPart: BodyPart;
  setsLabel: string;   // "60kg × 8回（3セット）"
  isNewPB: boolean;
}

export interface SessionSummary {
  bodyPart: BodyPart;
  exercises: ExerciseSummary[];
  hasPB: boolean;
}

export function saveLastSessionSummary(summary: SessionSummary): void {
  setItem('trememo_last_summary', summary);
}

export function getLastSessionSummary(): SessionSummary | null {
  return getItem<SessionSummary | null>('trememo_last_summary', null);
}

// ── Body Weight ───────────────────────────────────────────────────────────────

export function getBodyWeightHistory(): BodyWeightRecord[] {
  return getItem<BodyWeightRecord[]>(KEYS.BODY_WEIGHT, []);
}

export function recordBodyWeight(weight: number): void {
  const records = getBodyWeightHistory();
  const today = new Date().toISOString().split('T')[0];
  const idx = records.findIndex((r) => r.date === today);
  if (idx >= 0) {
    records[idx].weight = weight;
  } else {
    records.push({ date: today, weight });
    records.sort((a, b) => a.date.localeCompare(b.date));
  }
  setItem(KEYS.BODY_WEIGHT, records);
}

export function getLatestBodyWeight(): BodyWeightRecord | null {
  const records = getBodyWeightHistory();
  return records.length ? records[records.length - 1] : null;
}

// ── Current Session ───────────────────────────────────────────────────────────

export function getCurrentSession(): CurrentSession | null {
  return getItem<CurrentSession | null>(KEYS.CURRENT_SESSION, null);
}

export function setCurrentSession(session: CurrentSession | null): void {
  setItem(KEYS.CURRENT_SESSION, session);
}

export function startNewSession(bodyPart: BodyPart): CurrentSession {
  const session: CurrentSession = {
    id: `session_${Date.now()}`,
    startTime: new Date().toISOString(),
    bodyPart,
    exercises: [],
  };
  setCurrentSession(session);
  return session;
}
