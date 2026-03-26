// Maps ExerciseDB bodyPart values and muscle names → Heft categories
// Used for category pill filtering on the home screen
// An exercise matches a category if its bodyPart OR any secondaryMuscle maps to it

export const CATEGORIES = [
  'Glutes',
  'Legs',
  'Core',
  'Back',
  'Chest & Shoulders',
  'Arms',
] as const

export type Category = (typeof CATEGORIES)[number]

// Covers both bodyPart field values and muscle name values from secondaryMuscles/target
export const muscleGroupMap: Record<string, Category> = {
  // bodyPart values from ExerciseDB
  'back': 'Back',
  'cardio': 'Core',
  'chest': 'Chest & Shoulders',
  'lower arms': 'Arms',
  'lower legs': 'Legs',
  'neck': 'Back',
  'shoulders': 'Chest & Shoulders',
  'upper arms': 'Arms',
  'upper legs': 'Legs',
  'waist': 'Core',

  // muscle names (target / secondaryMuscles)
  'glutes': 'Glutes',
  'hamstrings': 'Legs',
  'quads': 'Legs',
  'calves': 'Legs',
  'abs': 'Core',
  'biceps': 'Arms',
  'triceps': 'Arms',
  'forearms': 'Arms',
  'lats': 'Back',
  'traps': 'Back',
  'delts': 'Chest & Shoulders',
  'pectorals': 'Chest & Shoulders',
  'spine': 'Back',
  'adductors': 'Legs',
  'abductors': 'Glutes',
  'levator scapulae': 'Back',
  'serratus anterior': 'Chest & Shoulders',
  'cardiovascular system': 'Core',
}
