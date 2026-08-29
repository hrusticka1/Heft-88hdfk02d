// Heft Design System — Theme Tokens
// Light mode only. Always use semantic tokens in components, never raw scale values.

// ─── Color Scales ────────────────────────────────────────────────────────────

export const colors = {
  white: '#FFFFFF',
  black: '#000000',

  neutral: {
    25: '#F9FAFB',
    50: '#E8EAED',
    100: '#DDE0E4',
    200: '#C6CCD2',
    300: '#AFB7C0',
    400: '#98A2AE',
    500: '#818E9C',
    600: '#6C7989',
    700: '#5A6572',
    800: '#48515B',
    900: '#363D45',
    1000: '#24282E',
  },

  purple: {
    50: '#EDEDFC',
    100: '#CACAF6',
    200: '#A7A7F1',
    300: '#8484EB',
    400: '#6161E5',
    500: '#3E3EE0',
    600: '#2222D3',
    700: '#1D1DAF',
    800: '#17178C',
    900: '#111169',
  },

  red: {
    50: '#FFEBEA',
    100: '#FFC6C2',
    200: '#FFA099',
    300: '#FF7B71',
    400: '#FF5547',
    500: '#FF2E1F',
    600: '#F51100',
    700: '#CC0F00',
    800: '#A40B00',
    900: '#7A0800',
  },

  yellow: {
    50: '#FFF5EA',
    100: '#FFE3C2',
    200: '#FFD09A',
    300: '#FFBC70',
    400: '#FFAA47',
    500: '#FF961F',
    600: '#F58200',
    700: '#CE6E00',
    800: '#A35700',
    900: '#7A4100',
  },

  green: {
    50: '#EFFAEF',
    100: '#D1F0D1',
    200: '#B2E6B2',
    300: '#94DB94',
    400: '#75D175',
    500: '#57C757',
    600: '#3DB83D',
    700: '#339933',
    800: '#297B29',
    900: '#1F5D1F',
  },
} as const

// ─── Semantic Tokens ─────────────────────────────────────────────────────────

export const theme = {
  // Text
  text: {
    primary: colors.neutral[900],       // #363D45
    secondary: colors.neutral[500],     // #818E9C
    tertiary: colors.neutral[300],      // #AFB7C0
    disabled: colors.neutral[200],      // #C6CCD2
    whiteStatic: colors.white,          // #FFFFFF
    brand: colors.purple[500],          // #3E3EE0
    danger: colors.red[700],            // #CC0F00
    dangerPressed: colors.red[800],     // #A40B00
    dangerDisabled: colors.red[200],    // #FFA099
    brandPressed: colors.purple[700],   // #1D1DAF
    brandDisabled: colors.purple[200],  // #A7A7F1
  },

  // Foreground (icons, borders)
  fg: {
    primary: colors.neutral[900],       // #363D45
    secondary: colors.neutral[500],     // #818E9C
    tertiary: colors.neutral[300],      // #AFB7C0
    disabled: colors.neutral[200],      // #C6CCD2
    whiteStatic: colors.white,          // #FFFFFF
    brand: colors.purple[500],          // #3E3EE0
    danger: colors.red[700],            // #CC0F00
  },

  // Background
  bg: {
    primary: colors.white,              // #FFFFFF
    primaryPressed: colors.neutral[25], // #F9FAFB
    secondary: colors.neutral[25],      // #F9FAFB
    secondaryPressed: colors.neutral[50], // #E8EAED
    tertiary: colors.neutral[50],       // #E8EAED
    tertiaryPressed: colors.neutral[100], // #DDE0E4
    quaternary: colors.neutral[100],    // #DDE0E4
    disabled: colors.neutral[50],       // #E8EAED
    brandPrimary: colors.purple[500],   // #3E3EE0
    brandPrimaryPressed: colors.purple[700], // #1D1DAF
    brandPrimaryDisabled: colors.purple[50], // #EDEDFC
    brandSecondary: colors.purple[50],  // #EDEDFC
    brandSecondaryPressed: colors.purple[100], // #CACAF6
    danger: colors.red[700],            // #CC0F00
    dangerPressed: colors.red[800],     // #A40B00
    dangerSecondary: colors.red[50],    // #FFEBEA
    dangerSecondaryPressed: colors.red[100], // #FFC6C2
    dangerDisabled: colors.red[50],     // #FFEBEA
  },

  // Typography
  // Font family: Inter (all weights)
  typography: {
    // Text styles — use these named styles in components
    styles: {
      H1: {
        fontSize: '28px',
        fontWeight: 900,       // Black
        lineHeight: '1.2',
        letterSpacing: '0px',
        textTransform: 'none' as const,
      },
      H2: {
        fontSize: '22px',
        fontWeight: 900,       // Black
        lineHeight: '1.2',
        letterSpacing: '0px',
        textTransform: 'none' as const,
      },
      h3: {
        fontSize: '16px',
        fontWeight: 900,       // Black
        lineHeight: '1.3',
        letterSpacing: '0px',
        textTransform: 'none' as const,
      },
      Body: {
        fontSize: '16px',
        fontWeight: 500,       // Medium
        lineHeight: '1.4',
        letterSpacing: '0px',
        textTransform: 'none' as const,
      },
      Description: {
        fontSize: '14px',
        fontWeight: 500,       // Medium
        lineHeight: '1.4',
        letterSpacing: '0px',
        textTransform: 'none' as const,
      },
      Label: {
        fontSize: '14px',
        fontWeight: 800,       // Extra Bold
        lineHeight: '1.3',
        letterSpacing: '1px',
        textTransform: 'uppercase' as const,
      },
      Badge: {
        fontSize: '12px',
        fontWeight: 900,       // Black
        lineHeight: '1.2',
        letterSpacing: '0px',
        textTransform: 'none' as const,
      },
      ButtonLabel: {
        fontSize: '16px',
        fontWeight: 800,       // Extra Bold
        lineHeight: '1.2',
        letterSpacing: '1px',
        textTransform: 'uppercase' as const,
      },
      InputPR: {
        fontSize: '56px',
        fontWeight: 900,       // Black
        lineHeight: '1.0',
        letterSpacing: '0px',
        textTransform: 'none' as const,
      },
      InputUnit: {
        fontSize: '36px',
        fontWeight: 500,       // Medium
        lineHeight: '1.0',
        letterSpacing: '0px',
        textTransform: 'none' as const,
      },
    },
  },

  // Spacing
  spacing: {
    4: '4px',
    8: '8px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    48: '48px',
    64: '64px',
  },

  // Border radius
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  // Shadows — minimal, use sparingly
  shadow: {
    none: 'none',
    card: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  },
} as const

// ─── CSS Variables (for global stylesheet) ───────────────────────────────────
// Paste into :root {} in your global CSS file

export const cssVariables = `
  /* Text */
  --tx-primary: #363D45;
  --tx-secondary: #818E9C;
  --tx-tertiary: #AFB7C0;
  --tx-disabled: #C6CCD2;
  --tx-white-static: #FFFFFF;
  --tx-brand: #3E3EE0;
  --tx-danger: #CC0F00;

  /* Foreground */
  --fg-primary: #363D45;
  --fg-secondary: #818E9C;
  --fg-tertiary: #AFB7C0;
  --fg-disabled: #C6CCD2;
  --fg-brand: #3E3EE0;
  --fg-danger: #CC0F00;

  /* Background */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #E8EAED;
  --bg-quaternary: #DDE0E4;
  --bg-brand-primary: #3E3EE0;
  --bg-brand-secondary: #EDEDFC;
  --bg-danger: #CC0F00;
  --bg-danger-secondary: #FFEBEA;

  /* Typography — Font: Inter */
  --font-family: 'Inter', sans-serif;

  /* Text styles */
  --text-h1-size: 28px;
  --text-h1-weight: 900;
  --text-h1-spacing: 0px;

  --text-h2-size: 22px;
  --text-h2-weight: 900;
  --text-h2-spacing: 0px;

  --text-h3-size: 16px;
  --text-h3-weight: 900;
  --text-h3-spacing: 0px;

  --text-body-size: 16px;
  --text-body-weight: 500;
  --text-body-spacing: 0px;

  --text-description-size: 14px;
  --text-description-weight: 500;
  --text-description-spacing: 0px;

  --text-label-size: 14px;
  --text-label-weight: 800;
  --text-label-spacing: 1px;
  --text-label-transform: uppercase;

  --text-badge-size: 12px;
  --text-badge-weight: 900;
  --text-badge-spacing: 0px;

  --text-button-size: 16px;
  --text-button-weight: 800;
  --text-button-spacing: 1px;
  --text-button-transform: uppercase;

  --text-input-pr-size: 56px;
  --text-input-pr-weight: 900;

  --text-input-unit-size: 36px;
  --text-input-unit-weight: 500;

  /* Spacing */
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
  --space-32: 32px;
  --space-40: 40px;
  --space-48: 48px;
  --space-64: 64px;

  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
`
