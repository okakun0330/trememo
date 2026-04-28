import {
  BodyPart,
  CurrentSession,
  Exercise,
  PersonalBest,
  WorkoutSession,
  WorkoutSet,
} from './types';

const KEYS = {
  EXERCISES: 'trememo_exercises',
  SESSIONS: 'trememo_sessions',
  PBS: 'trememo_pbs',
  XP: 'trememo_xp',
  CURRENT_SESSION: 'trememo_current_session',
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

// ── Exercises ────────────────────────────────────────────────────────────────

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

export function addOrUpdateExercise(name: string, bodyPart: BodyPart): Exercise {
  const exercises = getExercises();
  const existing = exercises.find(
    (e) => e.name.toLowerCase() === name.toLowerCase() && e.bodyPart === bodyPart
  );

  if (existing) {
    existing.usageCount += 1;
    existing.lastUsed = new Date().toISOString();
    setItem(KEYS.EXERCISES, exercises);
    return existing;
  }

  const newExercise: Exercise = {
    id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    bodyPart,
    usageCount: 1,
    lastUsed: new Date().toISOString(),
  };
  exercises.push(newExercise);
  setItem(KEYS.EXERCISES, exercises);
  return newExercise;
}

// ── Sessions ─────────────────────────────────────────────────────────────────

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

// ── Personal Bests ────────────────────────────────────────────────────────────

export function getPersonalBests(): Record<string, PersonalBest> {
  return getItem<Record<string, PersonalBest>>(KEYS.PBS, {});
}

export function getPersonalBest(exerciseId: string): PersonalBest | null {
  return getPersonalBests()[exerciseId] ?? null;
}

export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps <= 0) return weight;
  if (reps === 1) return weight;
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

// ── XP ────────────────────────────────────────────────────────────────────────

export function getXP(): number {
  return getItem<number>(KEYS.XP, 0);
}

export function addXP(amount: number): number {
  const next = getXP() + amount;
  setItem(KEYS.XP, next);
  return next;
}

// ── Weekly & Streak ───────────────────────────────────────────────────────────

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

  return { count: days.size, goal: 3 };
}

export function getStreak(): number {
  const sessions = getSessions();
  if (!sessions.length) return 0;

  const dates = [...new Set(sessions.map((s) => new Date(s.date).toDateString()))]
    .map((d) => {
      const dt = new Date(d);
      dt.setHours(0, 0, 0, 0);
      return dt;
    })
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const last = dates[0];
  if (last.getTime() !== today.getTime() && last.getTime() !== yesterday.getTime()) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i - 1].getTime() - dates[i].getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
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

// ── Current Session ───────────────────────────────────────────────────────────

export function getCurrentSession(): CurrentSession | null {
  return getItem<CurrentSession | null>(KEYS.CURRENT_SESSION, null);
}

export function setCurrentSession(session: CurrentSession | null): void {
  setItem(KEYS.CURRENT_SESSION, session);
}
