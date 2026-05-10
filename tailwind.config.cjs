const path = require('path')
const tokens = require('./generated/tailwind.tokens.cjs')

/* ============================================================
 * Helpers
 * ============================================================ */

function colorGroup(prefix) {
  // From flat keys like "ColorSlate500", build { 50: ..., 500: ..., 950: ... }
  const group = {}
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith(prefix)) {
      const shade = key.slice(prefix.length).toLowerCase()
      group[shade] = value
    }
  }
  return group
}

function paletteGroup(name) {
  // Build { subtle, soft, muted, base, strong, bold, contrast } for a palette.
  // Source format: ColorPalette<Name><Slot>, e.g., ColorPalettePrimaryBase
  const group = {}
  const prefix = `ColorPalette${name}`
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith(prefix)) {
      const slot = key.slice(prefix.length).toLowerCase()
      group[slot] = `var(--color-palette-${name.toLowerCase()}-${slot})`
    }
  }
  return group
}

function commonGroup(category) {
  // Returns CSS-var-references for common tokens so dark mode swap works.
  // Source format: ColorCommon<Category><Slot>, e.g., ColorCommonFgBase
  const group = {}
  const prefix = `ColorCommon${category}`
  for (const [key, _value] of Object.entries(tokens)) {
    if (key.startsWith(prefix)) {
      const slot = key.slice(prefix.length).toLowerCase()
      group[slot] = `var(--color-common-${category.toLowerCase()}-${slot})`
    }
  }
  return group
}

/* ============================================================
 * Critical: common + palette colors must reference CSS vars
 * (not resolved hexes) so [data-theme="dark"] override works.
 * Core scales can use raw hexes since they don't change per mode.
 * ============================================================ */

module.exports = {
  content: [
    path.resolve(__dirname, 'components/**/*.{ts,tsx}'),
    path.resolve(__dirname, 'playground/src/**/*.{ts,tsx,html}'),
    path.resolve(__dirname, 'playground/index.html'),
  ],

  // Dark mode handled by CSS variable swap on [data-theme="dark"].
  // No need for Tailwind's class-based dark variant since vars do the work.
  darkMode: ['selector', '[data-theme="dark"]'],

  theme: {
    colors: {
      transparent: 'transparent',
      current:     'currentColor',
      white:       '#ffffff',
      black:       '#000000',

      // Core scales — direct hex, mode-invariant
      slate: colorGroup('ColorSlate'),
      blue:  colorGroup('ColorBlue'),
      red:   colorGroup('ColorRed'),
      green: colorGroup('ColorGreen'),
      amber: colorGroup('ColorAmber'),

      // Common (renamed in class layer):
      //   bg     → canvas-*    (non-elevated fills)
      //   fg     → fg-*        (text/icon)
      //   border → border-*    (only used as border-* utility, see below)
      //   surface → surface-*  (elevated containers)
      canvas:  commonGroup('Bg'),
      fg:      commonGroup('Fg'),
      surface: commonGroup('Surface'),

      // Palette — each as a nested group
      neutral: paletteGroup('Neutral'),
      primary: paletteGroup('Primary'),
      success: paletteGroup('Success'),
      warning: paletteGroup('Warning'),
      danger:  paletteGroup('Danger'),
    },

    borderColor: ({ theme }) => ({
      ...theme('colors'),
      // Common borders exposed only on borderColor (not bg/text)
      DEFAULT: 'var(--color-common-border-base)',
      subtle:  'var(--color-common-border-subtle)',
      muted:   'var(--color-common-border-muted)',
      base:    'var(--color-common-border-base)',
      strong:  'var(--color-common-border-strong)',
      active:  'var(--color-common-border-active)',
      focus:   'var(--color-common-border-focus)',
    }),

    borderRadius: {
      none: '0',
      sm:   tokens.RadiusSm,
      md:   tokens.RadiusMd,
      lg:   tokens.RadiusLg,
      full: tokens.RadiusFull,
    },

    extend: {
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
}