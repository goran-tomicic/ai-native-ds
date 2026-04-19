import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

/**
 * Normalizes Figma plugin export (variables2json format) to DTCG format.
 *
 * Input shape (variables2json):
 *   { collections: [{ name, modes: [{ variables: [{ name, type, value }] }] }] }
 *
 * Output shape (DTCG):
 *   { color: { slate: { 50: { $value, $type } } } }
 */

type RawVariable = {
  name: string
  type: 'color' | 'number' | 'string' | 'boolean'
  isAlias: boolean
  value: string | number | boolean
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

function setNested(obj: any, path: string[], value: any) {
  let curr = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!curr[key]) curr[key] = {}
    curr = curr[key]
  }
  curr[path[path.length - 1]] = value
}

function normalizeValue(value: any, type: RawVariable['type']) {
  if (type === 'color' && typeof value === 'string') {
    return value.toLowerCase() // normalize #F8FAFC → #f8fafc
  }
  return value
}

function normalizeSpace(value: any, varName: string) {
  // Space and radius numeric tokens → stringified px for DTCG "dimension"
  // Figma exports them as raw numbers; DTCG `dimension` type expects "4px" etc.
  if (varName.startsWith('space/') || varName.startsWith('radius/')) {
    return { $value: `${value}px`, $type: 'dimension' }
  }
  return null
}

async function main() {
  const rawPath = resolve('tokens/_raw/figma-export.json')
  const outPath = resolve('tokens/core.tokens.json')

  console.log(`Reading ${rawPath}…`)
  const raw: RawExport = JSON.parse(await readFile(rawPath, 'utf-8'))

  const byCollection: Record<string, any> = {}
  let tokenCount = 0

  for (const collection of raw.collections) {
    const collectionName = collection.name.toLowerCase()
    if (!byCollection[collectionName]) byCollection[collectionName] = {}

    // Use the first mode (Mode 1) — multi-mode support comes later
    const mode = collection.modes[0]
    if (!mode) continue

    for (const variable of mode.variables) {
      if (variable.isAlias) continue // handle aliases in semantic layer later

      const path = variable.name.split('/')

      // Check for space/radius dimension handling first
      const dimensionToken = normalizeSpace(variable.value, variable.name)

      const dtcgToken = dimensionToken ?? {
        $value: normalizeValue(variable.value, variable.type),
        $type:  TYPE_MAP[variable.type],
      }

      setNested(byCollection[collectionName], path, dtcgToken)
      tokenCount++
    }
  }

  for (const [name, tokens] of Object.entries(byCollection)) {
    const target = resolve(`tokens/${name}.tokens.json`)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, JSON.stringify(tokens, null, 2) + '\n')
    console.log(`✔  tokens/${name}.tokens.json`)
  }

  console.log(`\nNormalized ${tokenCount} tokens from ${raw.collections.length} collection(s).`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})