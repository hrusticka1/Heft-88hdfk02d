import { supabase } from '../lib/supabase'
import type { Exercise, LogEntry, WorkoutSet } from '../types'

// ─── Exercises ────────────────────────────────────────────────────────────────

export async function saveExercise(exercise: Exercise): Promise<void> {
  const { error } = await supabase.from('exercises').upsert({
    id: exercise.id,
    name: exercise.name,
    body_part: exercise.bodyPart,
    target: exercise.target,
    secondary_muscles: exercise.secondaryMuscles,
    equipment: exercise.equipment,
    gif_url: exercise.gifUrl,
  }, { ignoreDuplicates: true })
  if (error) throw error
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return rowToExercise(data)
}

export async function getMyExercises(userId: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('log_entries')
    .select('exercise_id, logged_at, exercises(*)')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
  if (error) throw error

  // Deduplicate — keep most-recent occurrence of each exercise
  const seen = new Set<string>()
  const exercises: Exercise[] = []
  for (const row of data ?? []) {
    if (!seen.has(row.exercise_id)) {
      seen.add(row.exercise_id)
      if (row.exercises) {
        exercises.push(rowToExercise(row.exercises as unknown as ExerciseRow))
      }
    }
  }
  return exercises
}

// ─── Log entries ──────────────────────────────────────────────────────────────

export async function saveLogEntry(
  entry: Omit<LogEntry, 'id'>
): Promise<LogEntry> {
  const { data, error } = await supabase
    .from('log_entries')
    .insert({
      user_id: entry.userId,
      exercise_id: entry.exerciseId,
      weight: entry.weight,
      is_pr: entry.isPR,
      logged_at: entry.loggedAt,
    })
    .select()
    .single()
  if (error) throw error
  return rowToLogEntry(data)
}

export async function getLogEntries(
  exerciseId: string,
  userId: string
): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from('log_entries')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToLogEntry)
}

export async function deleteLogEntry(id: string): Promise<void> {
  const { error } = await supabase.from('log_entries').delete().eq('id', id)
  if (error) throw error
}

export async function deleteAllLogEntries(exerciseId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('log_entries')
    .delete()
    .eq('exercise_id', exerciseId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function getMaxWeight(
  exerciseId: string,
  userId: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from('log_entries')
    .select('weight')
    .eq('exercise_id', exerciseId)
    .eq('user_id', userId)
    .order('weight', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data.weight as number
}

// ─── Workout sets ─────────────────────────────────────────────────────────────

export async function getWorkoutSets(userId: string): Promise<WorkoutSet[]> {
  let result = await supabase
    .from('workout_sets')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  // Fall back if position column doesn't exist yet
  if (result.error) {
    result = await supabase
      .from('workout_sets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  }

  const { data, error } = result
  if (error) throw error

  const sets: WorkoutSet[] = await Promise.all(
    (data ?? []).map(async (row) => {
      const { count } = await supabase
        .from('set_exercises')
        .select('id', { count: 'exact', head: true })
        .eq('set_id', row.id)
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        createdAt: row.created_at,
        exerciseCount: count ?? 0,
      }
    })
  )
  return sets
}

export async function createWorkoutSet(userId: string, name: string): Promise<WorkoutSet> {
  const { data, error } = await supabase
    .from('workout_sets')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    createdAt: data.created_at,
    exerciseCount: 0,
  }
}

export async function deleteWorkoutSet(id: string): Promise<void> {
  const { error } = await supabase.from('workout_sets').delete().eq('id', id)
  if (error) throw error
}

export async function getSetExercises(setId: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('set_exercises')
    .select('position, exercises(*)')
    .eq('set_id', setId)
    .order('position', { ascending: true })
  if (error) throw error
  return (data ?? [])
    .filter((row) => row.exercises)
    .map((row) => rowToExercise(row.exercises as unknown as ExerciseRow))
}

export async function addExerciseToSet(setId: string, exerciseId: string): Promise<void> {
  const { count } = await supabase
    .from('set_exercises')
    .select('id', { count: 'exact', head: true })
    .eq('set_id', setId)
  const { error } = await supabase
    .from('set_exercises')
    .insert({ set_id: setId, exercise_id: exerciseId, position: count ?? 0 }, { ignoreDuplicates: true } as never)
  if (error) throw error
}

export async function updateSetPositions(setIds: string[]): Promise<void> {
  await Promise.all(
    setIds.map((id, position) =>
      supabase.from('workout_sets').update({ position }).eq('id', id)
    )
  )
}

export async function updateSetExercisePositions(setId: string, exerciseIds: string[]): Promise<void> {
  await Promise.all(
    exerciseIds.map((exerciseId, position) =>
      supabase.from('set_exercises').update({ position }).eq('set_id', setId).eq('exercise_id', exerciseId)
    )
  )
}

export async function removeExerciseFromSet(setId: string, exerciseId: string): Promise<void> {
  const { error } = await supabase
    .from('set_exercises')
    .delete()
    .eq('set_id', setId)
    .eq('exercise_id', exerciseId)
  if (error) throw error
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

type ExerciseRow = {
  id: string
  name: string
  body_part: string
  target: string
  secondary_muscles: string[]
  equipment: string
  gif_url: string
}

type LogEntryRow = {
  id: string
  user_id: string
  exercise_id: string
  weight: number
  is_pr: boolean
  logged_at: string
}

function rowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    bodyPart: row.body_part,
    target: row.target,
    secondaryMuscles: row.secondary_muscles ?? [],
    equipment: row.equipment,
    gifUrl: row.gif_url,
  }
}

function rowToLogEntry(row: LogEntryRow): LogEntry {
  return {
    id: row.id,
    userId: row.user_id,
    exerciseId: row.exercise_id,
    weight: row.weight,
    isPR: row.is_pr,
    loggedAt: row.logged_at,
  }
}
