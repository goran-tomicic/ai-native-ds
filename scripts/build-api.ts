import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'

/**
 * Builds a single JSON file aggregating all component specs and tokens.
 * Output: public/api/components.json
 *
 * Intended for LLM consumption — one HTTP fetch returns the full design system surface.
 */

async function loadJson(path: string): Promise<any> {
  return JSON.parse(await readFile(path, 'utf-8'))
}

async function main() {
  // 1. Load all token files
  const tokens = {
    core:           await loadJson('tokens/core.tokens.json'),
    semantic_light: await loadJson('tokens/semantic.light.tokens.json'),
    semantic_dark:  await loadJson('tokens/semantic.dark.tokens.json'),
  }

  // 2. Load all component specs
  const componentsDir = resolve('components')
  const dirs = await readdir(componentsDir, { withFileTypes: true })
  const components: Record<string, any> = {}

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue
    const name = dir.name
    const specPath = join(componentsDir, name, `${name}.spec.json`)
    try {
      components[name] = await loadJson(specPath)
    } catch (err) {
      console.warn(`Skipping ${name}: ${(err as Error).message}`)
    }
  }

  // 3. Compose the API payload
  const apiPayload = {
    $schema: 'https://github.com/goran-tomicic/ai-native-ds/blob/main/schemas/component.schema.json',
    version: '0.1.0',
    generatedAt: new Date().toISOString(),
    overview: {
      name: 'ai-native-ds',
      description: 'Design system built for AI agents as first-class consumers.',
      conventions: [
        'Use semantic tokens, not primitives',
        'Pick palette by intent: primary for canonical actions, danger for destructive, neutral for secondary',
        'One primary action per view',
        'Disabled state = opacity 40 + pointer-events none, NOT a different palette',
        'Focus rings use --color-common-border-focus',
        'Light/dark via [data-theme="dark"] attribute on <html>',
      ],
    },
    tokens,
    components,
  }

  // 4. Write the output
  const outDir = resolve('public/api')
  await mkdir(outDir, { recursive: true })
  const outPath = join(outDir, 'components.json')
  await writeFile(outPath, JSON.stringify(apiPayload, null, 2) + '\n')

  // Stats
  const componentCount = Object.keys(components).length
  const tokenCount =
    countTokens(tokens.core) +
    countTokens(tokens.semantic_light) +
    countTokens(tokens.semantic_dark)
  const sizeKb = (Buffer.byteLength(JSON.stringify(apiPayload)) / 1024).toFixed(1)

  console.log(`✔  public/api/components.json`)
  console.log(`   ${componentCount} components, ${tokenCount} token values, ${sizeKb} kB`)
}

function countTokens(obj: any): number {
  if (obj?.$value !== undefined) return 1
  if (typeof obj !== 'object' || obj === null) return 0
  return Object.values(obj).reduce<number>((sum, v) => sum + countTokens(v), 0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})