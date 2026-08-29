// ─── Weight display ───────────────────────────────────────────────────────────

export function formatWeight(weight: number, equipment: string): string {
  if (isDumbbell(equipment)) {
    return `2 × ${weight} kg`
  }
  return `${weight} kg`
}

export function formatWeightCard(weight: number): string {
  // On the detail screen card, dumbbell weight shows without the "2 ×" prefix
  // because the EQUIPMENT row already provides that context
  return `${weight} kg`
}

// ─── Equipment display ────────────────────────────────────────────────────────

export function isDumbbell(equipment: string): boolean {
  return equipment.toLowerCase() === 'dumbbell'
}

export function formatEquipmentLabel(equipment: string): string {
  // Small caps label on Log Weight screen: "BARBELL", "2 × DUMBBELL", "MACHINE"
  if (isDumbbell(equipment)) return '2 × DUMBBELL'
  return equipment.toUpperCase()
}

export function formatEquipmentDetail(equipment: string): string {
  // Title case for the detail screen EQUIPMENT row: "2 × Dumbbell", "Leverage Machine"
  if (isDumbbell(equipment)) return '2 × Dumbbell'
  return toTitleCase(equipment)
}

// ─── Muscle display ───────────────────────────────────────────────────────────

export function formatMuscle(muscle: string): string {
  return muscle.charAt(0).toUpperCase() + muscle.slice(1)
}

export function formatSecondaryMuscles(muscles: string[]): string {
  const capped = muscles.slice(0, 3).map(formatMuscle)
  if (muscles.length > 3) return capped.join(', ') + ' and more'
  return capped.join(', ')
}

// ─── Date display ─────────────────────────────────────────────────────────────

export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    .replace(/(\d+)$/, (_, d) => withOrdinal(parseInt(d)))
}

function withOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}
