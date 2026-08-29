export const CATEGORIES = [
  'Upper Body',
  'Lower Body',
  'Core',
] as const

export type Category = (typeof CATEGORIES)[number]

export const muscleGroupMap: Record<string, Category> = {
  // bodyPart values from ExerciseDB
  'back': 'Upper Body',
  'cardio': 'Core',
  'chest': 'Upper Body',
  'lower arms': 'Upper Body',
  'lower legs': 'Lower Body',
  'neck': 'Upper Body',
  'shoulders': 'Upper Body',
  'upper arms': 'Upper Body',
  'upper legs': 'Lower Body',
  'waist': 'Core',

  // muscle names (target / secondaryMuscles)
  'glutes': 'Lower Body',
  'hamstrings': 'Lower Body',
  'quads': 'Lower Body',
  'calves': 'Lower Body',
  'abs': 'Core',
  'biceps': 'Upper Body',
  'triceps': 'Upper Body',
  'forearms': 'Upper Body',
  'lats': 'Upper Body',
  'traps': 'Upper Body',
  'delts': 'Upper Body',
  'pectorals': 'Upper Body',
  'spine': 'Upper Body',
  'adductors': 'Lower Body',
  'abductors': 'Lower Body',
  'levator scapulae': 'Upper Body',
  'serratus anterior': 'Upper Body',
  'cardiovascular system': 'Core',
}
