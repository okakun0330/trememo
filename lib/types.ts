export type BodyPart = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio';

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  chest: '胸',
  back: '背中',
  legs: '脚',
  shoulders: '肩',
  arms: '腕',
  abs: '腹筋',
  cardio: '有酸素',
};

export const BODY_PART_EN: Record<BodyPart, string> = {
  chest: 'CHEST',
  back: 'BACK',
  legs: 'LEGS',
  shoulders: 'SHOULDERS',
  arms: 'ARMS',
  abs: 'ABS',
  cardio: 'CARDIO',
};

export type WorkoutSet = {
  weight: number;
  reps: number;
};

export type Exercise = {
  id: string;
  name: string;
  bodyPart: BodyPart;
  usageCount: number;
  lastUsed: string;
};

export type ExerciseRecord = {
  exerciseId: string;
  exerciseName: string;
  bodyPart: BodyPart;
  sets: WorkoutSet[];
  isNewPB: boolean;
  memo?: string;
};

export type WorkoutSession = {
  id: string;
  date: string;
  bodyPart: BodyPart;
  exercises: ExerciseRecord[];
  durationSeconds: number;
};

export type PersonalBest = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  date: string;
};

export type CurrentSession = {
  id: string;
  startTime: string;
  bodyPart: BodyPart;
  exercises: ExerciseRecord[];
};
