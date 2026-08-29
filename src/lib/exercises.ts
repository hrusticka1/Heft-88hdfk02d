import type { Exercise } from '../types'
import exerciseData from '../data/exercises.json'

const ALL_EXERCISES = exerciseData as Exercise[]

export function getGifUrl(exerciseId: string): string {
  return `https://api.workoutxapp.com/v1/gifs/${encodeURIComponent(exerciseId)}.gif`
}

export const PAGE_SIZE = 10

export function searchExercises(query: string, offset = 0): Exercise[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()
  const matches = ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(q))
  return matches.slice(offset, offset + PAGE_SIZE)
}

export function getExerciseById(id: string): Exercise | null {
  return ALL_EXERCISES.find(e => e.id === id) ?? null
}
