import { readFile, writeFile, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'

/**
 * Generates per-component AI-optimized markdown docs from spec.json files.
 * Output: components/{name}/{name}.llm.md
 *
 * Format is intentionally terse — meant for LLM consumption, not human reading.
 */

type PropDescriptor = {
  type: string
  values?: any[]
  default?: any
  description?: string
  guidance?: Record<string, string>
  optional?: boolean
  shape?: Record<string, PropDescriptor>
}

// A prop value is either a single descriptor (flat-props components) or
// a group of descriptors (imperative components like Toast).
type PropValue = PropDescriptor | Record<string, PropDescriptor>

type Spec = {
  name: string
  description: string
  props: Record<string, PropValue>
  states?: string[]
  tokens?: any
  rules?: { do?: string[]; dont?: string[] }
  examples?: Array<{ name: string; code: string; context?: string }>
  antiPatterns?: Array<{ bad: string; good: string; why: string }>
  related?: { use_instead_when?: Array<{ component: string; when: string }> }
  subcomponents?: Array<{
    name: string
    description: string
    props?: Record<string, PropDescriptor>
    rules?: { do?: string[]; dont?: string[] }
    examples?: Array<{ name: string; code: string; context?: string }>
  }>

  // Imperative-component fields (Day 32, for Toast and similar)
  architecture?: {
    summary?: string
    pieces?: Array<{ name: string; role: string }>
  }
  useToastAPI?: {
    description?: string
    methods?: Array<{ signature: string; description: string }>
  }
  behavior?: Record<string, string>
}

// ─── Prop rendering ─────────────────────────────────────────────────────────

function isPropDescriptor(value: any): value is PropDescriptor {
  // A descriptor has a string `type` field. A group is an object whose values
  // are themselves descriptors, but the group itself has no `type`.
  return value && typeof value === 'object' && typeof value.type === 'string'
}

function formatPropLine(name: string, def: PropDescriptor): string {
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

function formatPropGuidance(def: PropDescriptor): string[] {
  if (!def.guidance) return []
  return Object.entries(def.guidance).map(
    ([value, desc]) => `  ${value} — ${desc}`
  )
}

function renderPropsFlat(props: Record<string, PropDescriptor>): string[] {
  const lines: string[] = []
  for (const [propName, def] of Object.entries(props)) {
    lines.push(formatPropLine(propName, def))
    const guidance = formatPropGuidance(def)
    if (guidance.length) lines.push(...guidance)

    // Render nested .shape (e.g. Toast's options.action)
    if (def.shape) {
      for (const [nestedName, nestedDef] of Object.entries(def.shape)) {
        lines.push(`  ${formatPropLine(nestedName, nestedDef)}`)
      }
    }
  }
  return lines
}

function renderPropsSection(props: Record<string, PropValue>): string[] {
  const lines: string[] = ['## Props', '']

  // Detect: are all values descriptors (flat), or are they groups (imperative)?
  const allDescriptors = Object.values(props).every(isPropDescriptor)

  if (allDescriptors) {
    // Original flat rendering
    lines.push(...renderPropsFlat(props as Record<string, PropDescriptor>))
  } else {
    // Grouped rendering — each group becomes a subheading
    for (const [groupName, groupValue] of Object.entries(props)) {
      if (isPropDescriptor(groupValue)) {
        // Mixed shape — render as flat prop directly
        lines.push(formatPropLine(groupName, groupValue))
        const guidance = formatPropGuidance(groupValue)
        if (guidance.length) lines.push(...guidance)
      } else {
        // True group — subheading + nested props
        lines.push('')
        lines.push(`### ${groupName}`)
        lines.push('')
        lines.push(...renderPropsFlat(groupValue as Record<string, PropDescriptor>))
      }
    }
  }

  lines.push('')
  return lines
}

// ─── Imperative-component section renderers ─────────────────────────────────

function renderArchitecture(architecture: Spec['architecture']): string[] {
  if (!architecture) return []
  const lines: string[] = ['## Architecture', '']
  if (architecture.summary) {
    lines.push(architecture.summary)
    lines.push('')
  }
  if (architecture.pieces?.length) {
    for (const piece of architecture.pieces) {
      lines.push(`**${piece.name}** — ${piece.role}`)
      lines.push('')
    }
  }
  return lines
}

function renderUseToastAPI(api: Spec['useToastAPI']): string[] {
  if (!api) return []
  const lines: string[] = ['## useToast API', '']
  if (api.description) {
    lines.push(api.description)
    lines.push('')
  }
  if (api.methods?.length) {
    for (const m of api.methods) {
      lines.push(`\`${m.signature}\` — ${m.description}`)
    }
    lines.push('')
  }
  return lines
}

function renderBehavior(behavior: Spec['behavior']): string[] {
  if (!behavior) return []
  const lines: string[] = ['## Behavior', '']
  for (const [key, description] of Object.entries(behavior)) {
    lines.push(`**${key}** — ${description}`)
    lines.push('')
  }
  return lines
}

// ─── Token rendering (unchanged) ────────────────────────────────────────────

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

// ─── Main generator ─────────────────────────────────────────────────────────

function generateLlmMd(spec: Spec): string {
  const lines: string[] = []

  // Title and description
  lines.push(`# ${spec.name}`)
  lines.push('')
  lines.push(spec.description)
  lines.push('')

  // Import section (Day 29 intervention)
  lines.push('## Import')
  lines.push('')
  lines.push('```jsx')
  lines.push(`import { ${spec.name} } from '@ai-native-ds/${spec.name.toLowerCase()}'`)
  lines.push('```')
  lines.push('')
  lines.push(`This component is part of the ai-native-ds package and is available as a callable React component.`)
  lines.push('')

  // Architecture (imperative components only — before Usage so the reader
  // knows there are multiple pieces before parsing prop groups)
  lines.push(...renderArchitecture(spec.architecture))

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
    const defaultProps = Object.entries(spec.props)
      .filter(([, def]) => isPropDescriptor(def) && def.default !== undefined)
      .map(([name, def]) => `${name}="${(def as PropDescriptor).default}"`)
      .join(' ')
    lines.push('## Usage')
    lines.push('')
    lines.push('```jsx')
    lines.push(`<${spec.name}${defaultProps ? ' ' + defaultProps : ''} />`)
    lines.push('```')
    lines.push('')
  }

  // Props (flat or grouped)
  lines.push(...renderPropsSection(spec.props))

  // useToast API (Toast-specific for now)
  lines.push(...renderUseToastAPI(spec.useToastAPI))

  // States
  if (spec.states && spec.states.length > 1) {
    lines.push('## States')
    lines.push('')
    lines.push(spec.states.join(', '))
    lines.push('')
  }

  // Behavior (imperative components)
  lines.push(...renderBehavior(spec.behavior))

  // Token sections
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

  // Subcomponents
  if (spec.subcomponents?.length) {
    lines.push('## Subcomponents')
    lines.push('')
    for (const sub of spec.subcomponents) {
      lines.push(`### ${sub.name}`)
      lines.push('')
      lines.push(sub.description)
      lines.push('')
      if (sub.props) {
        for (const [propName, def] of Object.entries(sub.props)) {
          lines.push(formatPropLine(propName, def))
        }
        lines.push('')
      }
      if (sub.rules?.do?.length) {
        for (const rule of sub.rules.do) lines.push(`- ${rule}`)
      }
      if (sub.rules?.dont?.length) {
        for (const rule of sub.rules.dont) lines.push(`- DON'T: ${rule}`)
      }
      if (sub.rules?.do?.length || sub.rules?.dont?.length) lines.push('')
      if (sub.examples?.length) {
        for (const ex of sub.examples) {
          lines.push(`Example (${ex.context ?? sub.name}):`)
          lines.push('```jsx')
          lines.push(ex.code)
          lines.push('```')
        }
        lines.push('')
      }
    }
  }

  // Related
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

main().catch(err => {
  console.error(err)
  process.exit(1)
})