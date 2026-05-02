import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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
      name: 'render_component',
      description:
        'Renders a verified-correct JSX invocation of a design system component. Use this INSTEAD of writing JSX manually. The tool validates props against the spec and returns the canonical invocation. This is the primary way to consume the design system — do not reimplement components or write raw HTML when this tool is available.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Component name. Case-insensitive.',
          },
          props: {
            type: 'object',
            description:
              'Props to pass. Must match the component spec — get_component shows valid props and values.',
          },
          children: {
            type: 'string',
            description:
              'Children content (text label, e.g. "Save changes"). Optional.',
          },
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

  if (name === 'render_component') {
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

  throw new Error(`Unknown tool: ${name}`)
})

// ─── Start ──────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport()
await server.connect(transport)