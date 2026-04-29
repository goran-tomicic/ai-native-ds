# ai-native-ds

A design system built for AI agents as first-class consumers.

## The premise

Most design systems are documented for humans browsing a docs site. But increasingly, the consumer is a program — an LLM generating UI from a Figma file, a code agent picking the right token, a model composing components from a prompt.

When the consumer is a program, prose is ambiguity and ambiguity gets hallucinated. This project explores what changes when you treat the design system itself as machine-readable: specs as source of truth, tokens as DTCG JSON, components as structured contracts, docs as a byproduct.

## The model

Figma (design) → Tokens + Specs (source of truth) → Code + Docs + AI surface

Designers work in Figma. Variables sync to DTCG tokens. Component specs (JSON) define props, states, rules, a11y, and token bindings. Code, AI docs, and a static JSON API all generate from the specs.

## AI consumption

This system exposes itself to AI agents through three surfaces:

- **`llms.txt`** — root entry point for AI crawlers
- **`components/{name}/{name}.llm.md`** — per-component AI-optimized docs (terse, structured, no marketing prose)
- **`public/api/components.json`** — single static JSON with all specs, tokens, and conventions; one fetch returns the full design system surface

Try it: paste `button.spec.json` into an LLM with the prompt _"using only this spec, build a confirmation dialog that asks the user to confirm account deletion"_. The model gets palette choice (`danger`), style (`solid`), composition pattern (paired with cancel), and a11y requirements from the spec alone.

## Token architecture

Three layers, documented in `docs/token-architecture.md`:

- `core/` — primitives, single mode (Tailwind 11-step color scales)
- `semantic/common/` — UI infrastructure, light + dark modes (surface, fg, bg, border)
- `semantic/palette/` — variant-driving treatments, light + dark modes (neutral, primary, success, warning, danger × 7 intensity slots)

## Components shipped

| Component | Status    | Variants                                   |
| --------- | --------- | ------------------------------------------ |
| Badge     | ✅ stable | 5 tones × 2 sizes                          |
| Button    | ✅ stable | 3 palettes × 3 styles × 3 sizes + 5 states |
| Spinner   | ✅ stable | 3 sizes                                    |

## Pipeline

Figma Variables (variables2json plugin)
→ tokens/\_raw/figma-export.json
→ scripts/normalize-tokens.ts
→ tokens/{core,semantic.light,semantic.dark}.tokens.json (DTCG)
→ style-dictionary.config.ts
→ generated/{tokens.css, tokens.ts, tailwind.tokens.cjs}
→ consumed by Tailwind + components

## Repo structure

ai-native-ds/
├── llms.txt # AI entry point
├── PROJECT_LOG.md # Build diary
├── docs/
│ └── token-architecture.md # Architecture reference
├── tokens/ # DTCG sources of truth
├── components/
│ └── {name}/
│ ├── {name}.spec.json # Machine-readable contract
│ ├── {name}.tsx # Implementation
│ └── {name}.llm.md # AI-optimized doc
├── schemas/
│ └── component.schema.json # Validates every spec
├── scripts/ # Pipeline scripts
├── generated/ # Build outputs (committed)
├── public/api/
│ └── components.json # Static API for AI consumers
└── playground/ # Vite + React preview app

## Status

Week 2 of a 10-week experiment. Active development. Case study to follow.

## License

MIT
