import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, LogEntry } from '../types';

// Storage keys
const EXERCISES_KEY = 'heft_exercises';
const LOG_ENTRIES_KEY = 'heft_log_entries';

/**
 * Generate a UUID for new log entries
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============ EXERCISE STORAGE ============

/**
 * Get all cached exercises from storage
 */
async function getAllExercisesMap(): Promise<Record<string, Exercise>> {
  const data = await AsyncStorage.getItem(EXERCISES_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * Save the exercises map to storage
 */
async function saveExercisesMap(exercises: Record<string, Exercise>): Promise<void> {
  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}

/**
 * Cache exercise metadata locally (called at first log)
 */
export async function saveExercise(exercise: Exercise): Promise<void> {
  const exercises = await getAllExercisesMap();
  exercises[exercise.id] = exercise;
  await saveExercisesMap(exercises);
}

/**
 * Get a single cached exercise by ID
 */
export async function getExercise(id: string): Promise<Exercise | null> {
  const exercises = await getAllExercisesMap();
  return exercises[id] ?? null;
}

/**
 * Get all cached exercises
 */
export async function getAllExercises(): Promise<Exercise[]> {
  const exercises = await getAllExercisesMap();
  return Object.values(exercises);
}

// ============ LOG ENTRY STORAGE ============

/**
 * Get all log entries from storage
 */
async function getAllLogEntriesMap(): Promise<Record<string, LogEntry>> {
  const data = await AsyncStorage.getItem(LOG_ENTRIES_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * Save the log entries map to storage
 */
async function saveLogEntriesMap(entries: Record<string, LogEntry>): Promise<void> {
  await AsyncStorage.setItem(LOG_ENTRIES_KEY, JSON.stringify(entries));
}

/**
 * Save a new log entry
 * Note: isPR should be calculated before calling this function
 */
export async function saveLogEntry(entry: LogEntry): Promise<void> {
  const entries = await getAllLogEntriesMap();
  entries[entry.id] = entry;
  await saveLogEntriesMap(entries);
}

/**
 * Get all log entries for a specific exercise, sorted newest first
 */
export async function getLogEntries(exerciseId: string): Promise<LogEntry[]> {
  const entries = await getAllLogEntriesMap();
  return Object.values(entries)
    .filter((entry) => entry.exerciseId === exerciseId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Delete a log entry by ID
 * Handles PR recalculation if the deleted entry was a PR
 */
export async function deleteLogEntry(id: string): Promise<void> {
  const entries = await getAllLogEntriesMap();
  const entryToDelete = entries[id];

  if (!entryToDelete) return;

  delete entries[id];

  // If deleted entry was a PR, recalculate PR for remaining entries
  if (entryToDelete.isPR) {
    const remainingEntries = Object.values(entries).filter(
      (e) => e.exerciseId === entryToDelete.exerciseId
    );

    if (remainingEntries.length > 0) {
      // Find the new max weight
      const maxWeight = Math.max(...remainingEntries.map((e) => e.weight));

      // Find entries with max weight (could be multiple ties)
      const maxEntries = remainingEntries.filter((e) => e.weight === maxWeight);

      // Set the most recent max weight entry as the new PR
      const newPREntry = maxEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      entries[newPREntry.id] = { ...newPREntry, isPR: true };
    }
  }

  await saveLogEntriesMap(entries);
}

/**
 * Get the maximum weight logged for an exercise
 */
export async function getMaxWeight(exerciseId: string): Promise<number | null> {
  const entries = await getLogEntries(exerciseId);
  if (entries.length === 0) return null;
  return Math.max(...entries.map((e) => e.weight));
}

/**
 * Get all exercises that have at least one log entry
 * Returns exercises ordered by most recently logged
 */
export async function getMyExercises(): Promise<Exercise[]> {
  const [exercises, logEntries] = await Promise.all([
    getAllExercisesMap(),
    getAllLogEntriesMap(),
  ]);

  // Group log entries by exerciseId and find most recent date
  const exerciseLastLogged: Record<string, string> = {};
  Object.values(logEntries).forEach((entry) => {
    const currentDate = exerciseLastLogged[entry.exerciseId];
    if (!currentDate || entry.date > currentDate) {
      exerciseLastLogged[entry.exerciseId] = entry.date;
    }
  });

  // Get exercises with log entries
  const exerciseIds = Object.keys(exerciseLastLogged);
  const myExercises = exerciseIds
    .map((id) => exercises[id])
    .filter((exercise): exercise is Exercise => exercise !== undefined);

  // Sort by most recently logged
  return myExercises.sort((a, b) => {
    const dateA = exerciseLastLogged[a.id];
    const dateB = exerciseLastLogged[b.id];
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

// ============ HELPER FUNCTIONS ============

/**
 * Create a new log entry with calculated isPR
 */
export async function createLogEntry(
  exerciseId: string,
  weight: number
): Promise<LogEntry> {
  const currentMax = await getMaxWeight(exerciseId);
  const isPR = currentMax === null || weight > currentMax;

  const entry: LogEntry = {
    id: generateUUID(),
    exerciseId,
    date: new Date().toISOString(),
    weight,
    isPR,
  };

  return entry;
}

/**
 * Check if an exercise has any log entries
 */
export async function hasLogEntries(exerciseId: string): Promise<boolean> {
  const entries = await getLogEntries(exerciseId);
  return entries.length > 0;
}

/**
 * Get the most recent log entry for an exercise
 */
export async function getLastLogEntry(exerciseId: string): Promise<LogEntry | null> {
  const entries = await getLogEntries(exerciseId);
  return entries[0] ?? null;
}

/**
 * Clear all data (for testing/debug purposes)
 */
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([EXERCISES_KEY, LOG_ENTRIES_KEY]);
}

// ============ NAVIGATION STATE ============

const SELECTED_CATEGORY_KEY = 'heft_selected_category';

/**
 * Store the selected category for navigation purposes
 */
export async function setSelectedCategory(category: string): Promise<void> {
  await AsyncStorage.setItem(SELECTED_CATEGORY_KEY, category);
}

/**
 * Get and clear the stored selected category
 */
export async function getAndClearSelectedCategory(): Promise<string | null> {
  const category = await AsyncStorage.getItem(SELECTED_CATEGORY_KEY);
  if (category) {
    await AsyncStorage.removeItem(SELECTED_CATEGORY_KEY);
  }
  return category;
}
