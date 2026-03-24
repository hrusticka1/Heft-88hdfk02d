/**
 * Heft color palette
 * Light mode only - no dark mode variants
 * Colors from Figma design
 */
export const Colors = {
  // Primary accent color (brand blue)
  primary: '#3E3EE0',
  primaryLight: '#EEF2FF',

  // Background colors
  background: '#F9F9FA',
  surface: '#FFFFFF',

  // Text colors
  textPrimary: '#363D45',
  textSecondary: '#818E9C',
  textMuted: '#818E9C',
  textOnPrimary: '#FFFFFF',

  // UI elements
  border: '#E8EAED',
  cardBackground: '#FFFFFF',

  // Pill colors
  pillActive: '#3E3EE0',
  pillActiveText: '#FFFFFF',
  pillInactive: '#E8EAED',
  pillInactiveText: '#363D45',

  // Destructive
  destructive: '#EF4444',
  destructiveText: '#FFFFFF',

  // PR badge
  prBadge: '#3E3EE0',
  prBadgeText: '#FFFFFF',
} as const;
