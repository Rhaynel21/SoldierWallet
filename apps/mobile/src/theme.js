// Shared design tokens. Palette is BLUE / RED / YELLOW only (+ neutrals).
// Solid colors only — no gradients.

export const colors = {
  blue: '#1a1a8c',
  blue2: '#2d2dd4',
  blueRoyal: '#2323c9',
  red: '#c1121f',
  red2: '#e23744',
  gold: '#f5a300',
  sun: '#ffcb2e',
  // "positive" (money-in, success) uses blue — no green in the palette.
  green: '#2323c9',

  bg: '#eef1f8',
  card: '#ffffff',
  ink: '#101126',
  inkSoft: '#6b7086',
  inkFaint: '#9aa0b4',
  line: '#ebedf4',

  // soft tints
  blueTint: '#e9e9fb',
  blueTint2: '#e9edff',
  redTint: '#fdeaec',
  greenTint: '#e9e9fb',
  goldTint: '#fff2d2',
  field: '#fafbfe',
}

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
}

export const shadow = {
  sm: {
    shadowColor: '#101126',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#101126',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  blue: {
    shadowColor: '#2222b4',
    shadowOpacity: 0.32,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  red: {
    shadowColor: '#c1121f',
    shadowOpacity: 0.28,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
}

export const font = {
  // React Native uses the platform system font by default.
  bold: '800',
  semibold: '600',
  heavy: '900',
}
