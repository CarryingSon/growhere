// Barve, tipografija, razmiki in sence iz design/botanical_living/DESIGN.md.

export const colors = {
  // Core Canvas & Surfaces
  canvas: '#EDF1EA',
  surface: '#FFFFFF',
  surfaceContainerLow: '#E9F7E9',
  surfaceContainer: '#E3F2E3',
  surfaceContainerHigh: '#DEECDE',
  surfaceContainerHighest: '#D8E6D8',
  surfaceVariant: '#D8E6D8',
  surfaceDim: '#D0DED0',

  primary: '#2E5B3B',
  primaryPressed: '#23462D',
  primaryContainer: '#2E5B3B',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#A0D1A9',

  ink: '#1E2A21',
  inkMuted: '#556859',
  stroke: '#D9E2D5',
  outline: '#717971',
  outlineVariant: '#C1C9BF',

  secondaryContainer: '#FEC643',
  onSecondaryContainer: '#715300',

  error: '#BA1A1A',
  onError: '#FFFFFF',

  // Light exposure attributes
  lightDirect: '#E3AE2A',
  lightDirectOn: '#B88514',
  lightDirectBg: 'rgba(227, 174, 42, 0.14)',
  lightBright: '#F5D366',
  lightBrightOn: '#9C7C18',
  lightBrightBg: 'rgba(245, 211, 102, 0.22)',
  lightMedium: '#3E9B4F',
  lightMediumOn: '#2E753B',
  lightMediumBg: 'rgba(62, 155, 79, 0.14)',
  lightLow: '#7C98A6',
  lightLowOn: '#4F6875',
  lightLowBg: 'rgba(124, 152, 166, 0.16)',

  // Care difficulty levels
  difficultyEasy: '#3E9B4F',
  difficultyModerate: '#2F6FC4',
  difficultyDemanding: '#C9372C',

  // Soil
  soilAccent: '#6B4F3A',
  soilTintBase: '#F4EDE7',
} as const;

export const typography = {
  displayHeroMobile: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.4 },
  headlineLg: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.3 },
  headlineMd: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const, letterSpacing: -0.2 },
  headlineSm: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMd: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  bodySm: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  labelLg: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  labelMd: { fontSize: 13, lineHeight: 17, fontWeight: '600' as const, letterSpacing: 0.1 },
  labelSm: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.4 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  italic: 'PlusJakartaSans_400Regular_Italic',
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  gutter: 16,
  margin: 20,
} as const;

export const shadow = {
  level1: {
    shadowColor: '#1E2A21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  level2: {
    shadowColor: '#1E2A21',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  level3: {
    shadowColor: '#1E2A21',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 40,
    elevation: 8,
  },
  nav: {
    shadowColor: '#1E2A21',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export const touchTarget = {
  minHeight: 48,
  primaryHeight: 56,
};
