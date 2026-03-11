// ============================================================
// Recess - Design Tokens & Constants
// ============================================================

export const Colors = {
  primary: '#6C47FF',       // purple — main brand color
  primaryLight: '#EDE9FF',
  primaryDark: '#4A2FD4',

  accent: '#FF6B6B',        // coral — for calls to action

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const CategoryEmoji: Record<string, string> = {
  restaurant: '🍽️',
  event: '🎉',
  activity: '⚡',
  other: '📌',
};

export const CategoryLabel: Record<string, string> = {
  restaurant: 'Restaurant',
  event: 'Event',
  activity: 'Activity',
  other: 'Other',
};
