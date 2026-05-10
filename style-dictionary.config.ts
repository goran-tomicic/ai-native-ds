import StyleDictionary from 'style-dictionary'
import { writeFile, readFile } from 'node:fs/promises'

/**
 * Builds tokens.css with light + dark mode in a single file.
 *
 * Strategy:
 *  - Light build: core + semantic.light → emits :root selector
 *  - Dark build:  semantic.dark only    → emits [data-theme="dark"] selector
 *  - Concatenate into generated/tokens.css
 *
 * Also emits TS constants and a Tailwind theme module from the LIGHT build,
 * since Tailwind reads light values; dark mode is handled at runtime via
 * CSS variable swap, not a config rebuild.
 */

const SHARED_PLATFORMS = (mode: 'light' | 'dark') => ({
  css: {
    transformGroup: 'css',
    transforms: [
      // Default css group transforms
      'attribute/cti',
      'name/kebab',
      'time/seconds',
      'html/icon',
      'size/rem',
      'color/css',
      'asset/url',
      'fontFamily/css',
      'cubicBezier/css',
      'strokeStyle/css/shorthand',
      'border/css/shorthand',
      'typography/css/shorthand',
      'transition/css/shorthand',
      // Add this one explicitly:
      'shadow/css/shorthand',
    ],
    buildPath: `generated/_tmp/${mode}/`,
    files: [{
      destination: 'tokens.css',
      format: 'css/variables',
      options: {
        outputReferences: false,
        selector: mode === 'light' ? ':root' : '[data-theme="dark"]',
      },
    }],
  },
})

async function buildLight() {
  const sd = new StyleDictionary({
    source: ['tokens/core.tokens.json', 'tokens/semantic.light.tokens.json'],
    platforms: {
      ...SHARED_PLATFORMS('light'),
      ts: {
        transformGroup: 'js',
        buildPath: 'generated/',
        files: [
          { destination: 'tokens.ts',   format: 'javascript/es6' },
          { destination: 'tokens.d.ts', format: 'typescript/es6-declarations' },
        ],
      },
      tailwind: {
        transformGroup: 'js',
        buildPath: 'generated/',
        files: [{
          destination: 'tailwind.tokens.cjs',
          format: 'javascript/module-flat',
        }],
      },
    },
  })
  await sd.buildAllPlatforms()
}

async function buildDark() {
  // Dark build sources core (for alias resolution) but only emits semantic dark vars.
  // Filter ensures core tokens don't bloat the [data-theme="dark"] selector.
  const sd = new StyleDictionary({
    source: ['tokens/core.tokens.json', 'tokens/semantic.dark.tokens.json'],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'generated/_tmp/dark/',
        files: [{
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: false,
            selector: '[data-theme="dark"]',
          },
          filter: (token: any) => {
            // Only emit semantic tokens in the dark scope.
            // Core tokens are already in :root from the light build.
            const path = token.path.join('.')
            return path.startsWith('color.common.') || path.startsWith('color.palette.')
          },
        }],
      },
    },
  })
  await sd.buildAllPlatforms()
}

async function mergeCss() {
  const lightCss = await readFile('generated/_tmp/light/tokens.css', 'utf-8')
  const darkCss  = await readFile('generated/_tmp/dark/tokens.css', 'utf-8')

  const merged = [
    '/**',
    ' * Auto-generated. Do not edit directly.',
    ' * Source: tokens/core.tokens.json + tokens/semantic.{light,dark}.tokens.json',
    ' */',
    '',
    lightCss.trim(),
    '',
    darkCss.trim(),
    '',
  ].join('\n')

  await writeFile('generated/tokens.css', merged)
  console.log('✔  generated/tokens.css (merged light + dark)')
}

async function main() {
  console.log('Building LIGHT…')
  await buildLight()
  console.log('Building DARK…')
  await buildDark()
  console.log('Merging…')
  await mergeCss()
  console.log('Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})