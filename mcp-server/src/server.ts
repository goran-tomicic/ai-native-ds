import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderComponentHtml } from './render-html.js'

// ─── Paths ──────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const REPO_ROOT  = resolve(__dirname, '..', '..')
const API_PATH   = resolve(REPO_ROOT, 'public', 'api', 'components.json')

// ─── Cached API loader ──────────────────────────────────────────────────────
let cachedApi: any = null

async function loadApi() {
  if (cachedApi) return cachedApi
  const raw = await readFile(API_PATH, 'utf-8')
  cachedApi = JSON.parse(raw)
  return cachedApi
}

// ─── Server ─────────────────────────────────────────────────────────────────
const server = new Server(
  { name: 'ai-native-ds', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

// ─── Tool registry ──────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_components',
      description:
        'Returns all components in the ai-native-ds design system with one-line descriptions. Call this first to see what is available before composing UI.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_component',
      description:
        'Returns the full spec for a single component (props, states, rules, examples, anti-patterns, token mappings). Use after list_components when you need detail on a specific component.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Component name. Case-insensitive (e.g., "Button", "button").',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'render_component_jsx',
      description:
        'Renders a verified-correct JSX invocation of a design system component. Use this when editing files where JSX will be compiled and run by React (e.g., .tsx files in a project). Returns a string like `<Button palette="primary">Save</Button>` ready to be inserted into source code. Validates props against the spec.',
      inputSchema: {
        type: 'object',
        properties: {
          name:     { type: 'string', description: 'Component name. Case-insensitive.' },
          props:    { type: 'object', description: 'Props matching the component spec.' },
          children: { type: 'string', description: 'Children content (text). Optional.' },
        },
        required: ['name'],
      },
    },
    {
      name: 'render_component_html',
      description:
        'Renders a design system component as HTML with inline styles using CSS variables. Use this when producing HTML artifacts (e.g., a self-contained .html file or a sandboxed HTML preview where React is not available). Returns a string like `<button style="background: var(--color-palette-primary-base); ...">Save</button>` ready to be inserted into HTML output. Validates props against the spec. The HTML output respects the design system\'s tokens via CSS variables; the consuming HTML must define those variables (typically via :root and [data-theme="dark"] blocks).',
      inputSchema: {
        type: 'object',
        properties: {
          name:     { type: 'string', description: 'Component name. Case-insensitive.' },
          props:    { type: 'object', description: 'Props matching the component spec.' },
          children: { type: 'string', description: 'Children content (text). Optional.' },
        },
        required: ['name'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === 'list_components') {
    const api = await loadApi()
    const components = Object.entries(api.components).map(
      ([_key, spec]: [string, any]) => ({
        name: spec.name,
        description: spec.description.split('.')[0] + '.',
        category: spec.category,
        version: spec.version,
      })
    )
    return {
      content: [
        { type: 'text', text: JSON.stringify({ components }, null, 2) },
      ],
    }
  }

  if (name === 'get_component') {
    const api = await loadApi()
    const componentName = String(args?.name ?? '').toLowerCase()
    const spec = api.components[componentName]
    if (!spec) {
      return {
        content: [
          {
            type: 'text',
            text: `Component "${args?.name}" not found. Available: ${Object.keys(api.components).join(', ')}`,
          },
        ],
        isError: true,
      }
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(spec, null, 2) }],
    }
  }

  if (name === 'render_component_jsx') {
    const api = await loadApi()
    const componentName = String(args?.name ?? '').toLowerCase()
    const spec = api.components[componentName]
    if (!spec) {
      return {
        content: [
          {
            type: 'text',
            text: `Component "${args?.name}" not found. Available: ${Object.keys(api.components).join(', ')}`,
          },
        ],
        isError: true,
      }
    }

    const props = (args?.props as Record<string, unknown>) ?? {}
    const children = args?.children as string | undefined

    // ─── Validate props against spec ───────────────────────────────────────
    const errors: string[] = []
    for (const [key, value] of Object.entries(props)) {
      const def = spec.props[key]
      if (!def) {
        errors.push(
          `Unknown prop "${key}". Valid props: ${Object.keys(spec.props).join(', ')}`
        )
        continue
      }
      if (def.type === 'enum' && !def.values.includes(value)) {
        errors.push(
          `Prop "${key}" got "${value}". Expected one of: ${def.values.join(', ')}`
        )
      }
    }

    if (errors.length) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation errors (component not rendered):\n\n${errors.join('\n')}`,
          },
        ],
        isError: true,
      }
    }

    // ─── Render JSX ────────────────────────────────────────────────────────
    const propEntries = Object.entries(props).map(([k, v]) => {
      if (typeof v === 'string') return `${k}="${v}"`
      if (typeof v === 'boolean') return v ? k : `${k}={false}`
      return `${k}={${JSON.stringify(v)}}`
    })
    const propsStr = propEntries.length ? ' ' + propEntries.join(' ') : ''

    let jsx: string
    if (children) {
      jsx = `<${spec.name}${propsStr}>${children}</${spec.name}>`
    } else {
      jsx = `<${spec.name}${propsStr} />`
    }

    return {
      content: [
        {
          type: 'text',
          text: jsx,
        },
      ],
    }
  }

  if (name === 'render_component_html') {
    const api = await loadApi()
    const componentName = String(args?.name ?? '').toLowerCase()
    const spec = api.components[componentName]
    if (!spec) {
      return {
        content: [
          {
            type: 'text',
            text: `Component "${args?.name}" not found. Available: ${Object.keys(api.components).join(', ')}`,
          },
        ],
        isError: true,
      }
    }

    const props = (args?.props as Record<string, unknown>) ?? {}
    const children = args?.children as string | undefined

    // Reuse the same prop validation as JSX
    const errors: string[] = []
    for (const [key, value] of Object.entries(props)) {
      const def = spec.props[key]
      if (!def) {
        errors.push(
          `Unknown prop "${key}". Valid props: ${Object.keys(spec.props).join(', ')}`
        )
        continue
      }
      if (def.type === 'enum' && !def.values.includes(value)) {
        errors.push(
          `Prop "${key}" got "${value}". Expected one of: ${def.values.join(', ')}`
        )
      }
    }

    if (errors.length) {
      return {
        content: [
          { type: 'text', text: `Validation errors (component not rendered):\n\n${errors.join('\n')}` },
        ],
        isError: true,
      }
    }

    const html = renderComponentHtml(spec, props as Record<string, any>, children)
    return {
      content: [{ type: 'text', text: html }],
    }
  }

  throw new Error(`Unknown tool: ${name}`)
})

// ─── Start ──────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport()
await server.connect(transport)