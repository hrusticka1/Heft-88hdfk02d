/**
 * Display formatting utilities
 * Applied at UI layer only — never affects stored data
 */

/**
 * Format exercise name in title case
 * "barbell back squat" → "Barbell Back Squat"
 */
export function formatExerciseName(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format weight with unit
 * "24" → "24 kg" (space before unit)
 */
export function formatWeight(weight: number): string {
  // Handle decimals nicely (e.g., 7.5 kg, not 7.50 kg)
  const formatted = Number.isInteger(weight) ? weight.toString() : weight.toFixed(1);
  return `${formatted} kg`;
}

/**
 * Format weight for dumbbell exercises in list view
 * "5" → "2 × 5 kg"
 */
export function formatDumbbellWeight(weight: number): string {
  const formatted = Number.isInteger(weight) ? weight.toString() : weight.toFixed(1);
  return `2 × ${formatted} kg`;
}

/**
 * Capitalize first letter of a string
 * "quads" → "Quads"
 */
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format primary muscle
 * "quads" → "Quads"
 */
export function formatPrimaryMuscle(muscle: string): string {
  return capitalizeFirst(muscle);
}

/**
 * Format secondary muscles
 * ["glutes", "hamstrings", "calves"] → "Glutes, Hamstrings, Calves"
 * More than 3: "Glutes, Hamstrings, Calves and more"
 */
export function formatSecondaryMuscles(muscles: string[]): string {
  if (!muscles || muscles.length === 0) return '';

  const formatted = muscles.map(capitalizeFirst);

  if (formatted.length <= 3) {
    return formatted.join(', ');
  }

  return `${formatted.slice(0, 3).join(', ')} and more`;
}

/**
 * Format equipment for Log Weight screen (small caps style)
 * "barbell" → "BARBELL"
 * "dumbbell" → "2 × DUMBBELL"
 * "leverage machine" → "MACHINE"
 */
export function formatEquipmentLabel(equipment: string): string {
  const lower = equipment.toLowerCase();

  if (lower === 'dumbbell') {
    return '2 × DUMBBELL';
  }

  // For machines, simplify to just "MACHINE"
  if (lower.includes('machine')) {
    return 'MACHINE';
  }

  return equipment.toUpperCase();
}

/**
 * Format equipment for Detail screen metadata row (title case)
 * "leverage machine" → "Leverage Machine"
 * "dumbbell" → "2 × Dumbbell"
 * "barbell" → "Barbell"
 */
export function formatEquipmentDetail(equipment: string): string {
  const lower = equipment.toLowerCase();

  if (lower === 'dumbbell') {
    return '2 × Dumbbell';
  }

  // Title case for other equipment
  return equipment
    .split(' ')
    .map(capitalizeFirst)
    .join(' ');
}

/**
 * Check if an exercise uses dumbbells
 */
export function isDumbbellExercise(equipment: string): boolean {
  return equipment.toLowerCase() === 'dumbbell';
}

/**
 * Format date for display
 * ISO date → "March 24th"
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();

  // Add ordinal suffix
  const suffix = getOrdinalSuffix(day);

  return `${month} ${day}${suffix}`;
}

/**
 * Get ordinal suffix for a number
 * 1 → "st", 2 → "nd", 3 → "rd", 4 → "th", etc.
 */
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
