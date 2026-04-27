import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

/**
 * Normalizes Figma plugin export (variables2json format) to DTCG.
 *
 * Handles:
 *  - Single-mode collections (core) → flat DTCG
 *  - Multi-mode collections (semantic) → DTCG with $extensions.modes
 *  - Aliases → DTCG reference strings: "{path.to.token}"
 *  - Cross-collection aliases (semantic → core) preserved
 *  - Same-collection aliases (semantic → semantic) preserved
 *  - Number tokens with space/radius prefix → "Npx" dimension type
 */

type RawVariableValue =
  | string
  | number
  | boolean
  | { collection: string; name: string }

type RawVariable = {
  name: string
  type: 'color' | 'number' | 'string' | 'boolean'
  isAlias: boolean
  value: RawVariableValue
}

type RawMode = { name: string; variables: RawVariable[] }
type RawCollection = { name: string; modes: RawMode[] }
type RawExport = { version: string; collections: RawCollection[] }

const TYPE_MAP: Record<RawVariable['type'], string> = {
  color:   'color',
  number:  'number',
  string:  'string',
  boolean: 'boolean',
}

function normalizeKey(name: string): string[] {
  // "color/slate/500" → ["color", "slate", "500"]
  return name.split('/')
}

function aliasToDTCGRef(alias: { collection: string; name: string }): string {
  // The plugin gives us { collection: "core", name: "color/slate/500" }.
  // DTCG references the token by its dot-path inside its own JSON file.
  // Since we emit one file per collection and SD merges them, we just need
  // the path to the token: "{color.slate.500}".
  // Cross-collection refs work because SD loads all source files into one tree.
  const path = alias.name.replace(/\//g, '.')
  return `{${path}}`
}

function formatValue(
  variable: RawVariable
): { $value: any; $type: string } {
  const dtcgType = TYPE_MAP[variable.type]

  // Aliases → reference string
  if (variable.isAlias && typeof variable.value === 'object' && variable.value !== null) {
    return {
      $value: aliasToDTCGRef(variable.value as { collection: string; name: string }),
      $type:  dtcgType,
    }
  }

  // Number tokens that represent CSS dimensions
  if (variable.type === 'number' && typeof variable.value === 'number') {
    if (variable.name.startsWith('space/') || variable.name.startsWith('radius/')) {
      return { $value: `${variable.value}px`, $type: 'dimension' }
    }
    return { $value: variable.value, $type: 'number' }
  }

  // Color hex literals
  if (variable.type === 'color' && typeof variable.value === 'string') {
    return { $value: variable.value.toLowerCase(), $type: 'color' }
  }

  // Fallback
  return { $value: variable.value, $type: dtcgType }
}

function setNested(obj: any, path: string[], value: any) {
  let curr = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!curr[key]) curr[key] = {}
    curr = curr[key]
  }
  curr[path[path.length - 1]] = value
}

async function main() {
  const rawPath = resolve('tokens/_raw/figma-export.json')
  console.log(`Reading ${rawPath}…`)
  const raw: RawExport = JSON.parse(await readFile(rawPath, 'utf-8'))

  for (const collection of raw.collections) {
    const collectionName = collection.name.toLowerCase()
    const isMultiMode = collection.modes.length > 1

    if (!isMultiMode) {
      // Single-mode → flat DTCG file (e.g., core.tokens.json)
      const tree: any = {}
      const mode = collection.modes[0]
      let count = 0

      for (const variable of mode.variables) {
        setNested(tree, normalizeKey(variable.name), formatValue(variable))
        count++
      }

      const target = resolve(`tokens/${collectionName}.tokens.json`)
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, JSON.stringify(tree, null, 2) + '\n')
      console.log(`✔  tokens/${collectionName}.tokens.json (${count} tokens)`)
    } else {
      // Multi-mode → emit one file per mode (e.g., semantic.light.tokens.json, semantic.dark.tokens.json)
      // Style Dictionary will load each into its own platform/scope.
      for (const mode of collection.modes) {
        const tree: any = {}
        let count = 0

        for (const variable of mode.variables) {
          setNested(tree, normalizeKey(variable.name), formatValue(variable))
          count++
        }

        const modeName = mode.name.toLowerCase()
        const target = resolve(`tokens/${collectionName}.${modeName}.tokens.json`)
        await writeFile(target, JSON.stringify(tree, null, 2) + '\n')
        console.log(`✔  tokens/${collectionName}.${modeName}.tokens.json (${count} tokens)`)
      }
    }
  }

  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})