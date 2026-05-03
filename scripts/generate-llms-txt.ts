import { readFile, writeFile, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'

/**
 * Generates llms.txt from docs/system-meta.json + component list.
 *
 * llms.txt is the AI agent entry point. It must stay in sync with:
 * - docs/system-meta.json (conventions, example)
 * - components/ directory (component list)
 *
 * Generated from these sources, never hand-edited.
 */

async function main() {
  const meta = JSON.parse(await readFile('docs/system-meta.json', 'utf-8'))

  // Discover components
  const componentsDir = resolve('components')
  const dirs = await readdir(componentsDir, { withFileTypes: true })
  const componentNames: string[] = []
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue
    const specPath = join(componentsDir, dir.name, `${dir.name}.spec.json`)
    try {
      const spec = JSON.parse(await readFile(specPath, 'utf-8'))
      componentNames.push(`${spec.name} — ${spec.description.split('.')[0].trim()}`)
    } catch {
      // skip if no spec
    }
  }

  // Build llms.txt content
  const lines: string[] = []

  lines.push(`# ${meta.name}`)
  lines.push('')
  lines.push(meta.description + ' Components, tokens, and patterns optimized for programmatic consumption by LLMs and code-generation agents.')
  lines.push('')

  lines.push('## Core idea')
  lines.push('')
  lines.push('Most design systems are documented for humans browsing a docs site. This one treats the consumer as a program — an LLM generating UI from a Figma file, a code agent picking the right token, a model composing components from a prompt. Specs are structured contracts, not prose. Tokens are DTCG JSON. Documentation is generated from machine-readable sources.')
  lines.push('')

  lines.push('## How to use this')
  lines.push('')
  lines.push('For building UI with this system:')
  lines.push('- Read /components/{name}/{name}.llm.md for each component you need.')
  lines.push('- Each .llm.md is a complete contract: usage, props, rules, anti-patterns, examples.')
  lines.push('- **Always import components as JSX. Never reimplement them or write raw HTML when a component exists.** If a Button is needed, use `<Button palette="..." style="..." />`. Do not write `<button>` and reproduce the styling manually.')
  lines.push('')
  lines.push('For querying tokens or programmatic lookups:')
  lines.push('- /api/components.json — full system as one JSON, queryable')
  lines.push('- /tokens/{core,semantic.light,semantic.dark}.tokens.json — DTCG sources')
  lines.push('')
  lines.push('For architecture reasoning:')
  lines.push('- /docs/token-architecture.md')
  lines.push('')

  lines.push('## Components shipped')
  lines.push('')
  for (const name of componentNames) {
    lines.push(`- ${name}`)
  }
  lines.push('')

  lines.push('## Token model (summary)')
  lines.push('')
  lines.push('Three layers:')
  lines.push('- core/ — primitives, single mode, 11-step Tailwind color scales')
  lines.push('- semantic/common/ — UI infrastructure, light + dark modes (fg, bg, border, surface)')
  lines.push('- semantic/palette/ — variant-driving treatments, light + dark modes (neutral, primary, success, warning, danger × 7 intensity slots)')
  lines.push('')
  lines.push('Components reference semantic tokens. Primitives are escape hatches.')
  lines.push('')

  lines.push('## Conventions for AI-generated UI using this system')
  lines.push('')
  meta.conventions.forEach((conv: string, i: number) => {
    lines.push(`${i + 1}. ${conv}`)
  })
  lines.push('')

  if (meta.exampleOfCorrectUsage) {
    lines.push('## Example of correct usage')
    lines.push('')
    lines.push(meta.exampleOfCorrectUsage.description + ':')
    lines.push('')
    lines.push('```jsx')
    lines.push(meta.exampleOfCorrectUsage.code)
    lines.push('```')
    lines.push('')
    lines.push(meta.exampleOfCorrectUsage.note)
    lines.push('')
  }

  lines.push('## Repo')
  lines.push('')
  lines.push('https://github.com/goran-tomicic/ai-native-ds')
  lines.push('')

  lines.push('## Status')
  lines.push('')
  lines.push('Active development. Generated from machine-readable sources.')
  lines.push('')

  await writeFile('llms.txt', lines.join('\n'))
  console.log(`✔  llms.txt (${lines.length} lines) generated from docs/system-meta.json + ${componentNames.length} components`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})