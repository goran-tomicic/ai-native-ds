import { readFile, writeFile, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'

/**
 * Generates per-component AI-optimized markdown docs from spec.json files.
 * Output: components/{name}/{name}.llm.md
 *
 * Format is intentionally terse — meant for LLM consumption, not human reading.
 * Different from human docs (which we'll generate separately when we add them).
 */

type Spec = {
  name: string
  description: string
  props: Record<string, any>
  states?: string[]
  tokens?: any
  rules?: { do?: string[]; dont?: string[] }
  examples?: Array<{ name: string; code: string; context?: string }>
  antiPatterns?: Array<{ bad: string; good: string; why: string }>
  related?: { use_instead_when?: Array<{ component: string; when: string }> }
}

function formatPropLine(name: string, def: any): string {
  const parts: string[] = [`${name}:`]

  if (def.type === 'enum' && def.values) {
    parts.push(def.values.join(' | '))
  } else if (def.type === 'boolean') {
    parts.push('boolean')
  } else if (def.type) {
    parts.push(def.type)
  }

  if (def.default !== undefined) {
    parts.push(`(default: ${JSON.stringify(def.default)})`)
  } else if (def.optional) {
    parts.push('(optional)')
  }

  return parts.join(' ')
}

function formatPropGuidance(def: any): string[] {
  if (!def.guidance) return []
  return Object.entries(def.guidance).map(
    ([value, desc]) => `  ${value} — ${desc}`
  )
}

function formatStyleSlots(tokens: any): string {
  if (!tokens?.style_slots) return ''

  const lines = ['## Style → palette slot mapping', '']
  for (const [styleName, slots] of Object.entries(tokens.style_slots) as Array<[string, any]>) {
    const parts = Object.entries(slots).map(([slot, value]) => `${slot}=${value}`)
    lines.push(`${styleName}: ${parts.join(', ')}`)
  }
  return lines.join('\n')
}

function formatSlots(tokens: any): string {
  if (!tokens?.slots) return ''
  const lines = ['## Slot mapping', '']
  for (const [slot, value] of Object.entries(tokens.slots)) {
    lines.push(`${slot}: ${value}`)
  }
  return lines.join('\n')
}

function generateLlmMd(spec: Spec): string {
  const lines: string[] = []

  // Title and description
  lines.push(`# ${spec.name}`)
  lines.push('')
  lines.push(spec.description)
  lines.push('')

  // Usage — lead with JSX example so model anchors on consumption pattern
  const firstExample = spec.examples?.[0]
  if (firstExample) {
    lines.push('## Usage')
    lines.push('')
    lines.push('```jsx')
    lines.push(firstExample.code)
    lines.push('```')
    lines.push('')
  } else {
    // Fallback: build a minimal usage from defaults
    const defaultProps = Object.entries(spec.props)
      .filter(([_, def]: [string, any]) => def.default !== undefined)
      .map(([name, def]: [string, any]) => `${name}="${def.default}"`)
      .join(' ')
    lines.push('## Usage')
    lines.push('')
    lines.push('```jsx')
    lines.push(`<${spec.name}${defaultProps ? ' ' + defaultProps : ''} />`)
    lines.push('```')
    lines.push('')
  }

  // Props
  lines.push('## Props')
  lines.push('')
  for (const [propName, def] of Object.entries(spec.props)) {
    lines.push(formatPropLine(propName, def))
    const guidance = formatPropGuidance(def)
    if (guidance.length) lines.push(...guidance)
  }
  lines.push('')

  // States (if any beyond default)
  if (spec.states && spec.states.length > 1) {
    lines.push('## States')
    lines.push('')
    lines.push(spec.states.join(', '))
    lines.push('')
  }

  // Token model — style→slot mapping is the highest-signal section
  const styleSlots = formatStyleSlots(spec.tokens)
  if (styleSlots) {
    lines.push(styleSlots)
    lines.push('')
  }

  const slots = formatSlots(spec.tokens)
  if (slots) {
    lines.push(slots)
    lines.push('')
  }

  // Effects (e.g. Button's disabled_opacity)
  if (spec.tokens?.effects) {
    lines.push('## Effects')
    lines.push('')
    for (const [name, value] of Object.entries(spec.tokens.effects)) {
      lines.push(`${name}: ${value}`)
    }
    lines.push('')
  }

  // Rules
  if (spec.rules) {
    lines.push('## Rules')
    lines.push('')
    if (spec.rules.do) {
      for (const rule of spec.rules.do) lines.push(`- ${rule}`)
    }
    if (spec.rules.dont) {
      for (const rule of spec.rules.dont) lines.push(`- DON'T: ${rule}`)
    }
    lines.push('')
  }

  // Anti-patterns
  if (spec.antiPatterns?.length) {
    lines.push('## Anti-patterns')
    lines.push('')
    for (const ap of spec.antiPatterns) {
      lines.push(`${ap.bad}`)
      lines.push(`  → ${ap.good}`)
      lines.push(`  ${ap.why}`)
      lines.push('')
    }
  }

  // Examples
  if (spec.examples?.length) {
    lines.push('## Examples')
    lines.push('')
    for (const ex of spec.examples) {
      const ctx = ex.context ? `  // ${ex.context}` : ''
      lines.push(`${ex.name}: ${ex.code}${ctx}`)
    }
    lines.push('')
  }

  // Related (when to use something else)
  if (spec.related?.use_instead_when?.length) {
    lines.push('## Use instead when')
    lines.push('')
    for (const r of spec.related.use_instead_when) {
      lines.push(`${r.component} — ${r.when}`)
    }
    lines.push('')
  }

  return lines.join('\n').trim() + '\n'
}

async function main() {
  const componentsDir = resolve('components')
  const dirs = await readdir(componentsDir, { withFileTypes: true })

  let count = 0
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue
    const componentName = dir.name
    const specPath = join(componentsDir, componentName, `${componentName}.spec.json`)

    try {
      const specRaw = await readFile(specPath, 'utf-8')
      const spec: Spec = JSON.parse(specRaw)

      const llmDoc = generateLlmMd(spec)
      const outPath = join(componentsDir, componentName, `${componentName}.llm.md`)
      await writeFile(outPath, llmDoc)
      console.log(`✔  ${componentName}/${componentName}.llm.md (${llmDoc.split('\n').length} lines)`)
      count++
    } catch (err) {
      console.error(`✖  ${componentName}: ${(err as Error).message}`)
    }
  }

  console.log(`\nGenerated ${count} LLM docs.`)
}

function buildUsageExample(spec: Spec): string {
  // Prefer the first explicit example
  if (spec.examples?.length && spec.examples[0]?.code) {
    return spec.examples[0].code
  }

  // Fallback: construct from props with defaults
  const propsList: string[] = []
  for (const [propName, def] of Object.entries(spec.props)) {
    if (def.default !== undefined && propName !== 'children') {
      const v = typeof def.default === 'string' ? `"${def.default}"` : `{${def.default}}`
      propsList.push(`${propName}=${v}`)
    }
  }
  const propsStr = propsList.length ? ' ' + propsList.join(' ') : ''
  const hasChildren = 'children' in spec.props
  return hasChildren
    ? `<${spec.name}${propsStr}>...</${spec.name}>`
    : `<${spec.name}${propsStr} />`
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})