const path = require('path')
const tokens = require('./generated/tailwind.tokens.cjs')

function colorGroup(name) {
  const group = {}
  for (const [key, value] of Object.entries(tokens)) {
    const prefix = `Color${name}`
    if (key.startsWith(prefix)) {
      const shade = key.slice(prefix.length)
      group[shade] = value
    }
  }
  return group
}

module.exports = {
  content: [
    path.resolve(__dirname, 'components/**/*.{ts,tsx}'),
    path.resolve(__dirname, 'playground/src/**/*.{ts,tsx,html}'),
    path.resolve(__dirname, 'playground/index.html'),
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current:     'currentColor',
      white:       '#ffffff',
      black:       '#000000',
      slate:  colorGroup('Slate'),
      blue:   colorGroup('Blue'),
      red:    colorGroup('Red'),
      green:  colorGroup('Green'),
      amber:  colorGroup('Amber'),
    },
    borderRadius: {
      none: '0',
      sm:   tokens.RadiusSm,
      md:   tokens.RadiusMd,
      lg:   tokens.RadiusLg,
      full: tokens.RadiusFull,
    },
    extend: {},
  },
}