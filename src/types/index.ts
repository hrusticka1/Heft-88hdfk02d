export type Exercise = {
  id: string
  name: string
  bodyPart: string
  target: string
  secondaryMuscles: string[]
  equipment: string
  gifUrl: string
}

export type LogEntry = {
  id: string
  exerciseId: string
  loggedAt: string
  weight: number
  isPR: boolean
  userId: string
}
