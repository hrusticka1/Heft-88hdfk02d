/**
 * Exercise - Read-only, sourced from ExerciseDB API
 * Cached locally at first log
 */
export type Exercise = {
  id: string;
  name: string;
  bodyPart: string; // raw API value — used for category mapping
  target: string; // primary muscle — displayed as PRIMARY on detail screen
  secondaryMuscles: string[]; // displayed as SECONDARY on detail screen
  equipment: string; // used for display logic and dumbbell detection
  gifUrl: string;
};

/**
 * LogEntry - User-generated
 * Deletable, not editable
 */
export type LogEntry = {
  id: string; // uuid, generated at creation
  exerciseId: string; // references Exercise.id
  date: string; // ISO 8601 datetime
  weight: number; // in kg, per dumbbell for dumbbell exercises
  isPR: boolean; // true if weight strictly exceeds all prior entries for this exercise
};
