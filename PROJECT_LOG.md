# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens. This project explores what changes when the design system itself is built for that consumer: specs as source of truth, DTCG tokens, structured contracts, docs as byproduct.

**Model:** Figma (design) → Tokens + Specs (source of truth) → Code + Docs + AI endpoint (outputs)

---

## The 10-week arc

| Week | Focus                                                          | Status  |
| ---- | -------------------------------------------------------------- | ------- |
| 1    | Foundations + first component (Badge) E2E + token architecture | ✅ Done |
| 2    | Second component (Button) — prove pattern generalizes          | ✅ Done |
| 3    | AI consumption layer — `llms.txt`, generated docs, static API  | 🟡 Next |
| 4    | MCP server + Claude Desktop demo + record video                | ⚪      |
| 5–7  | Additional components, harden pipeline, case study draft       | ⚪      |
| 8    | Polish, case study final, portfolio page                       | ⚪      |
| 9    | Buffer / publish / share                                       | ⚪      |
| 10   | Buffer                                                         | ⚪      |

Note: original plan had components 3–5 next. Reordering — with two specs proving the pattern, the higher-leverage move is showing AI consumption working before adding more components.

---

## Locked-in decisions

- **Stack:** React + TypeScript + Tailwind v3.4 + cva + Radix primitives, pnpm, Vite
- **Source of truth:** component `.spec.json` files, validated against JSON Schema
- **Token format:** DTCG (Design Tokens Community Group)
- **Token extraction:** `variables2json` Figma plugin → custom normalizer
- **Token transform:** Style Dictionary v4, mode-aware output
- **Token architecture:** core (primitives, single mode) + semantic/common + semantic/palette, both with light + dark
- **Disabled state:** opacity + pointer-events, not per-palette tokens
- **Repo:** public on GitHub, commit history is part of the artifact

---

## Daily log

### Day 1 ✅ Done

Foundations. Repo, scaffolded directories, schema, README, Figma file with empty Variable collections.

### Day 2 ✅ Done

Tokens flow Figma → repo as DTCG. `variables2json` plugin + custom normalizer (pivoted from REST API after Figma's Enterprise paywall).

### Day 3 ✅ Done

Token pipeline → code. Style Dictionary, Vite + React playground, Tailwind sourced from generated tokens. Badge component E2E with 5 tones rendered.

### Day 4 ✅ Done

Three-layer token architecture committed. Light + dark modes from day one. `docs/token-architecture.md` written. Style Dictionary emits both modes into single CSS file. Tailwind exposes common + palette as utility classes. Badge migrated to palette tokens. Dark mode toggle in playground.

### Day 5 ✅ Done

Button spec written. State-modifier tokens added (12 new × 2 modes). Disabled-as-opacity decision committed to architecture doc.

### Day 6 ✅ Done

**Goal:** Implement Button + Spinner. Render full variant matrix. Both modes.

**Completed:**

- **Spinner component** (`components/spinner/`):
  - Spec v0.1.0 — minimal but full structure (props, a11y, composition, rules, examples, anti-patterns)
  - Implementation: CSS-only animated spinner using border tricks, inherits color via `currentColor`
  - 3 sizes (sm/md/lg), accessible label prop

- **Button component** (`components/button/`):
  - Implementation v0.1.0 matching the Day 5 spec
  - cva config with `compoundVariants` for the palette × style matrix (3 × 3 = 9 combinations)
  - State coverage: hover, active, focus-visible, disabled, loading
  - Disabled via `disabled:opacity-40 disabled:pointer-events-none` — palette-agnostic
  - Loading: spinner swap with `opacity-0` children to preserve button width
  - Focus ring: two-pixel ring with two-pixel offset, color from `--color-common-border-focus`
  - Full HTML button props passthrough, `forwardRef`
  - All TypeScript-typed via cva's `VariantProps`

- **Playground matrix** (`playground/src/App.tsx`):
  - All 9 palette × style combinations rendered
  - 3 sizes side-by-side
  - States section: default, disabled, interactive loading demo
  - Realistic compositions: primary+cancel pair, danger+keep pair
  - Dark mode toggle now uses Button itself (eats own dog food)
  - Badge tones preserved from Day 4

**Verified:**

- All combinations render correctly in light mode
- All combinations invert correctly in dark mode (palette inversion working as architected)
- Hover/active state transitions smooth (120ms)
- Focus-visible ring shows on keyboard focus, not click
- Disabled visually de-emphasizes consistently across palettes
- Loading: spinner shows, width preserved, no layout shift
- All a11y requirements met (aria-busy, focus visibility, semantic role)

**Token system size at end of Day 6:**

- Core: 68 primitives
- Semantic common: 19 × 2 modes = 38 mode-aware values
- Semantic palette: 47 × 2 modes = 94 mode-aware values
- Total: ~200 mode-aware values
- Components: 3 (Badge, Button, Spinner) — each with full spec + implementation

**Artifacts:**

- `components/spinner/spinner.spec.json` + `spinner.tsx`
- `components/button/button.tsx`
- Updated `playground/src/App.tsx` with full variant matrix
- 4 screenshots in `docs/screenshots/`: light full, dark full, focus ring, loading state — case study assets

**Case study note:** End of Week 1 (six sessions in). Two real components shipped, one supporting component, full token architecture with light + dark modes, every variant rendering correctly. The Button spec → Button implementation flow is the AI-native premise demonstrated: an LLM with `button.spec.json` could produce this implementation without seeing the existing code.

---

### Day 7 🟡 Planned

**Goal:** Begin AI consumption layer.

**Reordering rationale:** original plan had components 3–5 (Input, Card, Dialog) coming next. With Badge and Button proving the pattern, the higher-leverage move is making the AI consumption story real. More components without the AI layer is just incremental work; AI consumption with two components is the case study punchline.

**Three pieces:**

1. **`llms.txt`** at repo root — terse, structured AI entry point. Lists what's available, where to find structured specs, what conventions to follow.
2. **Per-component `.llm.md` generation** — script that reads each `*.spec.json` and emits a token-efficient AI-optimized doc. Different from human docs (no marketing prose, no images, just structure + rules).
3. **Static API endpoint** — single JSON file at `/api/components.json` that contains all component specs + tokens, served as the LLM-readable surface area.

**Time estimate:** 1.5–2 hours.

---

## Open questions / parking lot

- **Token reference validation:** still pending. Bigger value once we have more components.
- **Per-palette focus rings:** deferred. Works fine as common.
- **Outline button style:** deferred.
- **Tokens Studio:** still on the table for the demo video (Week 4).
- **Case study format:** long-form post, personal site page, or video walkthrough?
- **MCP server hosting:** local-only demo or Cloudflare Workers / Vercel?

---

## Glossary

- **DTCG** — Design Tokens Community Group format
- **Spec** — `component.spec.json` file; machine-readable contract
- **MCP** — Model Context Protocol; Anthropic's standard for exposing tools/data to LLMs
- **cva** — class-variance-authority; library for typed Tailwind variant config
- **Style Dictionary** — Amazon's token JSON build tool
- **Palette** — named color treatment consumed by components via variant prop
- **Common** — UI infrastructure tokens used regardless of variant
- **Mode** — light or dark theme; encoded in semantic tokens
- **Style (component-level)** — visual treatment a component supports (solid, subtle, ghost)
- **State modifier** — token suffix encoding interaction state (`-hover`, `-active`)
- **compoundVariants** (cva) — rules that fire when multiple variants are simultaneously set; how Button expresses palette × style

---

_Last updated: end of Day 6, end of Week 1._
