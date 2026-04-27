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
| 2    | Second component (Button) — prove pattern generalizes          | 🟡 Next |
| 3    | Components 3–5 (Input, Card, Dialog) + spec draft automation   | ⚪      |
| 4    | LLM docs generation, `llms.txt`, static API endpoint           | ⚪      |
| 5    | MCP server + Claude Desktop demo + record video                | ⚪      |
| 6–7  | 5 more components, harden pipeline, case study draft           | ⚪      |
| 8    | Polish, case study final, portfolio page                       | ⚪      |
| 9    | Buffer / publish / share                                       | ⚪      |
| 10   | Buffer                                                         | ⚪      |

---

## Locked-in decisions

- **Stack:** React + TypeScript + Tailwind v3.4 + cva + Radix primitives, pnpm, Vite
- **First component:** Badge (low interaction complexity, proves E2E pipeline fast)
- **Source of truth:** component `.spec.json` files, validated against JSON Schema
- **Token format:** DTCG (Design Tokens Community Group)
- **Token extraction:** plugin-based (`variables2json` Figma plugin) → custom normalizer
- **Token transform:** Style Dictionary v4, mode-aware output (light :root, dark [data-theme="dark"])
- **Token architecture:** three layers — core (primitives, single mode) + semantic/common (UI infrastructure, two modes) + semantic/palette (variant-driving, two modes). Documented in `docs/token-architecture.md`.
- **Repo:** public on GitHub from day one, commit history is part of the artifact

---

## Daily log

### Day 1 ✅ Done

**Goal:** Foundations exist.

**Completed:**

- GitHub repo created (public, MIT)
- pnpm + TypeScript + dependencies installed
- Directory structure scaffolded
- `schemas/component.schema.json` committed — the contract every component spec validates against
- README written
- Figma file created with three Variable collections

---

### Day 2 ✅ Done

**Goal:** Tokens flow from Figma to repo in DTCG format.

**Completed:**

- 36 core Variables in Figma (color scales, radii, spacing)
- `variables2json` plugin export → `tokens/_raw/figma-export.json`
- `scripts/normalize-tokens.ts` transforms plugin format → DTCG nested JSON
- Generated `tokens/core.tokens.json`

**Friction:** Figma's Variables REST API gated to Enterprise plans. Pivoted to plugin-based workflow.

---

### Day 3 ✅ Done

**Goal:** Tokens become consumable by code. First component renders.

**Completed:**

- Style Dictionary v4 generates CSS vars + TS constants + Tailwind theme from DTCG
- Vite + React playground at `playground/`
- Tailwind v3.4 config sourced from generated tokens (no hardcoded values)
- Badge spec written and validated against schema
- Badge component implemented with cva
- Five tones rendered in playground

**Friction:** Tailwind v4 → v3 downgrade (v4's CSS-first config not yet mature ecosystem-wide). Content glob path resolution (relative → absolute). Silent missing-token failure surfaced the need for token-reference validation (deferred to Week 2).

---

### Day 4 ✅ Done

**Goal:** Add semantic token layer (common + palette). Light + dark modes. Migrate Badge to palette tokens.

**Architecture work (most of the day):**

Settled on a three-layer token model with the common/palette split:

- `core` — primitives, single mode, 11-step Tailwind color scales (slate, blue, red, green, amber)
- `semantic/common` — UI infrastructure with category-specific shapes (fg: 5 slots, bg: 4 slots, border: 6 slots including active/focus that alias to palette, surface: 4 mode-asymmetric elevation slots)
- `semantic/palette` — five palettes (neutral, primary, success, warning, danger) × seven intensity slots (subtle, soft, muted, base, strong, bold, contrast)

Light + dark modes from day one. `core` stays single-mode; `semantic` carries both modes with mode-asymmetric values where appropriate (e.g., `surface/raised` is white in light, slate/800 in dark).

Committed the architecture as `docs/token-architecture.md` — first-class case study artifact.

**Pipeline work:**

- Updated normalizer to handle multi-mode collections and DTCG aliases
- Style Dictionary config emits two builds (light + dark) merged into single `tokens.css` with `:root` (core + light semantic) and `[data-theme="dark"]` (semantic dark overrides only)
- Tailwind config exposes common + palette as utility classes; common `bg/*` renamed to `canvas-*` in class layer to avoid `bg-bg-*` ergonomic collision
- Component schema updated to allow richer `tokens` block (palette consumers declare style + palette mapping + slots)

**Component migration:**

- Badge spec v0.2.0: declares `"style": "subtle"`, `"palette_mapping": {...}`, `"slots": { "bg": "{palette}.soft", "fg": "{palette}.bold" }`. Component is a structural palette consumer, no longer references primitives directly.
- Badge implementation: cva variants now use `bg-{palette}-soft text-{palette}-bold` Tailwind classes.
- Playground: dark mode toggle in header (button toggling `data-theme` on `<html>`).
- Both modes render correctly.

**Token counts:**

- Core: 68 primitives (55 colors + 11 spacing/radius + 2 absolutes)
- Semantic common: 19 tokens × 2 modes = 38 mode-aware values
- Semantic palette: 35 tokens × 2 modes = 70 mode-aware values
- Total semantic: 54 × 2 = 108 mode-aware values
- Generated CSS: 165 `--color-*` declarations across `:root` and `[data-theme="dark"]`

**Friction / notes:**

- Multiple architectural revisions through the morning before settling. The key insight that unlocked progress: common and palette serve different roles (common = neutral UI infrastructure used by everything; palette = variant-driving treatments consumed by components via prop). The defining test for placing a new token: "does a component variant prop pick between this and a sibling?"
- Schema needed updating to allow nested objects in component `tokens` block. The Day 3 schema assumed flat key→value; Day 4 components have richer structure (style declaration + palette mapping + slot templates).
- App body styling needed to use common CSS variables (not core variables) for dark mode swap to take effect.

**Artifacts:**

- `docs/token-architecture.md` — the binding architecture reference. Probably the strongest case-study asset produced so far.
- `tokens/core.tokens.json`, `tokens/semantic.light.tokens.json`, `tokens/semantic.dark.tokens.json` — DTCG sources of truth
- `generated/tokens.css` — mode-aware CSS variables, both modes in one file
- `generated/tailwind.tokens.cjs` + `generated/tokens.ts` + `generated/tokens.d.ts` — derived outputs
- Updated `tailwind.config.cjs` with `canvas`/`fg`/`surface`/`palette` utility families
- Updated `style-dictionary.config.ts` with two-build merge strategy
- Badge spec v0.2.0 + migrated implementation
- Playground with dark mode toggle
- Light + dark mode screenshots

---

### Day 5 🟡 Planned

**Tentative goal:** Start Button component. Define the `palette` + `style` API on a component that has multiple styles (solid, outline, subtle, ghost) — proving the architecture's consumption model on something more complex than Badge.

Plan written at Day 5 kickoff.

---

## Open questions / parking lot

- **Tokens Studio later?** Plugin workflow works but loses "Figma change → auto PR" magic. Consider Tokens Studio + Git sync later for the case study demo video.
- **Token reference validation (Week 2 task):** script to walk every spec's `tokens` block, verify each reference resolves to a real DTCG token, fail build on mismatch.
- **Tightening the schema:** current allowed shape for `tokens` is permissive (`oneOf: [string, object]`). Could define a stricter palette-consumer pattern with required `style` + `palette_mapping` + `slots`.
- **Case study format:** long-form post, personal site page, or video walkthrough?
- **MCP server hosting:** local-only demo, or deploy to Cloudflare Workers / Vercel for a live URL?
- **Info palette:** deferred. Add when a component needs to differ from primary.

---

## Glossary

- **DTCG** — Design Tokens Community Group format; emerging W3C standard for design tokens as JSON
- **Spec** — `component.spec.json` file; machine-readable contract defining a component's props, states, tokens, a11y, rules, examples
- **MCP** — Model Context Protocol; Anthropic's standard for exposing tools and data to LLMs
- **Code Connect** — Figma feature that links Figma components to their real code implementations
- **cva** — class-variance-authority; library for expressing Tailwind variants as typed config
- **Style Dictionary** — Amazon-authored build tool that transforms token JSON into platform-specific output
- **Palette** — a named color treatment (neutral, primary, success, warning, danger) consumed by components via variant prop
- **Common** — UI infrastructure tokens used regardless of variant (page bg, body fg, dividers, surfaces)
- **Mode** — light or dark theme; encoded in semantic tokens, swapped at runtime via CSS variable scope

---

_Last updated: end of Day 4._
