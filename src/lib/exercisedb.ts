import type { Exercise } from '../types'

const API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY as string
const BASE_URL = 'https://exercisedb.p.rapidapi.com'
const HEADERS = {
  'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
  'x-rapidapi-key': API_KEY,
}

type ExerciseDBItem = {
  id: string
  name: string
  bodyPart: string
  target: string
  secondaryMuscles: string[]
  equipment: string
  gifUrl: string
}

function toExercise(item: ExerciseDBItem): Exercise {
  return {
    id: item.id,
    name: item.name,
    bodyPart: item.bodyPart,
    target: item.target,
    secondaryMuscles: item.secondaryMuscles ?? [],
    equipment: item.equipment,
    gifUrl: item.gifUrl,
  }
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  if (!query.trim()) return []
  const url = `${BASE_URL}/exercises/name/${encodeURIComponent(query.toLowerCase().trim())}?limit=20&offset=0`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`)
  const data = (await res.json()) as ExerciseDBItem[]
  return data.map(toExercise)
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const url = `${BASE_URL}/exercises/exercise/${encodeURIComponent(id)}`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) return null
  const data = (await res.json()) as ExerciseDBItem
  return toExercise(data)
}
