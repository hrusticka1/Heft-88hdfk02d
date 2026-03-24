/**
 * Heft Muscle Group Categories
 * Order is significant - matches the UI pill order
 */
export const MUSCLE_GROUPS = [
  'Glutes',
  'Legs',
  'Core',
  'Back',
  'Chest & Shoulders',
  'Arms',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/**
 * ExerciseDB bodyPart values mapped to Heft categories
 * Values from: GET https://exercisedb.p.rapidapi.com/exercises/bodyPartList
 *
 * ExerciseDB bodyPart values:
 * - back
 * - cardio
 * - chest
 * - lower arms
 * - lower legs
 * - neck
 * - shoulders
 * - upper arms
 * - upper legs
 * - waist
 */
const BODY_PART_TO_CATEGORY: Record<string, MuscleGroup | 'Other'> = {
  'back': 'Back',
  'cardio': 'Other',
  'chest': 'Chest & Shoulders',
  'lower arms': 'Arms',
  'lower legs': 'Legs',
  'neck': 'Other',
  'shoulders': 'Chest & Shoulders',
  'upper arms': 'Arms',
  'upper legs': 'Legs', // Default for upper legs; Glutes determined by target
  'waist': 'Core',
};

/**
 * Target muscles that indicate an exercise belongs to Glutes category
 * When bodyPart is "upper legs" and target is one of these, categorize as Glutes
 */
const GLUTES_TARGETS = ['glutes', 'adductors', 'abductors'];

/**
 * Individual muscle names mapped to Heft categories
 * Used for mapping secondaryMuscles to categories
 */
const MUSCLE_TO_CATEGORY: Record<string, MuscleGroup> = {
  // Glutes
  'glutes': 'Glutes',
  'adductors': 'Glutes',
  'abductors': 'Glutes',

  // Legs
  'quadriceps': 'Legs',
  'quads': 'Legs',
  'hamstrings': 'Legs',
  'calves': 'Legs',
  'hip flexors': 'Legs',

  // Core
  'abs': 'Core',
  'core': 'Core',
  'obliques': 'Core',
  'serratus anterior': 'Core',
  'spine': 'Core',
  'levator scapulae': 'Core',

  // Back
  'lats': 'Back',
  'traps': 'Back',
  'trapezius': 'Back',
  'rhomboids': 'Back',
  'upper back': 'Back',
  'lower back': 'Back',
  'erector spinae': 'Back',

  // Chest & Shoulders
  'pectorals': 'Chest & Shoulders',
  'chest': 'Chest & Shoulders',
  'delts': 'Chest & Shoulders',
  'deltoids': 'Chest & Shoulders',
  'shoulders': 'Chest & Shoulders',
  'anterior deltoids': 'Chest & Shoulders',
  'lateral deltoids': 'Chest & Shoulders',
  'posterior deltoids': 'Chest & Shoulders',
  'front deltoids': 'Chest & Shoulders',
  'rear deltoids': 'Chest & Shoulders',

  // Arms
  'biceps': 'Arms',
  'triceps': 'Arms',
  'forearms': 'Arms',
  'brachialis': 'Arms',
  'wrist flexors': 'Arms',
  'wrist extensors': 'Arms',
};

/**
 * Get the Heft muscle group category for an exercise
 *
 * @param bodyPart - The bodyPart field from ExerciseDB
 * @param target - The target muscle field from ExerciseDB (optional, used for Glutes detection)
 * @returns The Heft muscle group category
 */
export function getMuscleGroup(bodyPart: string, target?: string): MuscleGroup | 'Other' {
  const normalizedBodyPart = bodyPart.toLowerCase();
  const normalizedTarget = target?.toLowerCase();

  // Special handling for Glutes: upper legs exercises targeting glutes
  if (normalizedBodyPart === 'upper legs' && normalizedTarget && GLUTES_TARGETS.includes(normalizedTarget)) {
    return 'Glutes';
  }

  return BODY_PART_TO_CATEGORY[normalizedBodyPart] ?? 'Other';
}

/**
 * Get the Heft category for a single muscle name
 * Returns undefined if the muscle doesn't map to a known category
 */
export function getMuscleCategory(muscle: string): MuscleGroup | undefined {
  const normalized = muscle.toLowerCase();
  return MUSCLE_TO_CATEGORY[normalized];
}

/**
 * Get all Heft categories an exercise belongs to
 * Based on primary bodyPart/target AND secondary muscles
 *
 * @param bodyPart - The bodyPart field from ExerciseDB
 * @param target - The target muscle field from ExerciseDB
 * @param secondaryMuscles - Array of secondary muscle names
 * @returns Array of unique Heft categories (excluding 'Other')
 */
export function getExerciseCategories(
  bodyPart: string,
  target: string,
  secondaryMuscles: string[]
): MuscleGroup[] {
  const categories = new Set<MuscleGroup>();

  // Add primary category
  const primary = getMuscleGroup(bodyPart, target);
  if (primary !== 'Other') {
    categories.add(primary);
  }

  // Add categories from secondary muscles
  for (const muscle of secondaryMuscles) {
    const category = getMuscleCategory(muscle);
    if (category) {
      categories.add(category);
    }
  }

  return Array.from(categories);
}

/**
 * Check if an exercise belongs to a specific category
 * Matches if primary category OR any secondary muscle maps to the category
 */
export function exerciseBelongsToCategory(
  bodyPart: string,
  target: string,
  secondaryMuscles: string[],
  category: MuscleGroup
): boolean {
  const categories = getExerciseCategories(bodyPart, target, secondaryMuscles);
  return categories.includes(category);
}

/**
 * Check if a category should be shown (has exercises or is a main category)
 * "Other" is a hidden fallback - only shown if exercises exist in it
 */
export function isCategoryVisible(category: string, hasExercises: boolean): boolean {
  if (category === 'Other') {
    return hasExercises;
  }
  return MUSCLE_GROUPS.includes(category as MuscleGroup);
}
