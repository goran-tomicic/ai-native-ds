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

| Week | Focus                                                          | Status         |
| ---- | -------------------------------------------------------------- | -------------- |
| 1    | Foundations + first component (Badge) E2E + token architecture | ✅ Done        |
| 2    | Second component (Button) — prove pattern generalizes          | 🟡 In progress |
| 3    | Components 3–5 (Input, Card, Dialog) + spec draft automation   | ⚪             |
| 4    | LLM docs generation, `llms.txt`, static API endpoint           | ⚪             |
| 5    | MCP server + Claude Desktop demo + record video                | ⚪             |
| 6–7  | 5 more components, harden pipeline, case study draft           | ⚪             |
| 8    | Polish, case study final, portfolio page                       | ⚪             |
| 9    | Buffer / publish / share                                       | ⚪             |
| 10   | Buffer                                                         | ⚪             |

---

## Locked-in decisions

- **Stack:** React + TypeScript + Tailwind v3.4 + cva + Radix primitives, pnpm, Vite
- **Source of truth:** component `.spec.json` files, validated against JSON Schema
- **Token format:** DTCG (Design Tokens Community Group)
- **Token extraction:** plugin-based (`variables2json` Figma plugin) → custom normalizer
- **Token transform:** Style Dictionary v4, mode-aware output
- **Token architecture:** three layers — core (primitives, single mode) + semantic/common (UI infrastructure, two modes) + semantic/palette (variant-driving, two modes). See `docs/token-architecture.md`.
- **Disabled state:** opacity + pointer-events, not per-palette tokens
- **Repo:** public on GitHub, commit history is part of the artifact

---

## Daily log

### Day 1 ✅ Done

Foundations. Repo, scaffolded directories, schema, README, Figma file with empty Variable collections.

### Day 2 ✅ Done

Tokens flow Figma → repo as DTCG. 36 core variables. `variables2json` plugin + custom normalizer (pivoted from REST API after hitting Figma's Enterprise paywall). Generated `tokens/core.tokens.json`.

### Day 3 ✅ Done

Token pipeline → code. Style Dictionary generates CSS vars + TS constants + Tailwind theme. Vite + React playground. Badge component E2E with 5 tones rendered. First visual artifact.

### Day 4 ✅ Done

Three-layer token architecture committed: core + semantic/common + semantic/palette. Light + dark modes from day one. Committed `docs/token-architecture.md` as binding reference. Style Dictionary emits both modes into single CSS file. Tailwind exposes common + palette as utility classes (`canvas` rename for common bg). Badge migrated to palette tokens (subtle style consumer). Dark mode toggle in playground. Both modes render correctly.

### Day 5 ✅ Done

**Goal:** Button spec written and validated. State-modifier tokens added to palettes Button uses.

**Completed:**

- Added 12 state-modifier tokens to Figma palette: `base-hover`, `base-active`, `soft-hover`, `soft-active` for `neutral`, `primary`, `danger` palettes — 24 mode-aware values total
- Re-exported with `variables2json` and ran `pnpm tokens:build` — pipeline still clean
- Wrote Button spec (`components/button/button.spec.json`) v0.1.0:
  - 3 styles (solid, subtle, ghost)
  - 3 palettes (neutral, primary, danger)
  - 3 sizes (sm, md, lg)
  - 5 interactive states (default, hover, active, focus, disabled, loading)
  - Full a11y, composition, rules, examples, anti-patterns sections
  - Spec is ~250 lines — first artifact rich enough to demonstrate the AI-native premise
- Updated `docs/token-architecture.md` with disabled-as-opacity decision and rationale
- All specs validate (Badge + Button)
- Committed and pushed

**Architectural decision logged:**

Disabled state is implemented via opacity (0.4) plus `pointer-events: none`, not via dedicated tokens. Reasoning: disabled is a _modifier_, not a _variant_ — same palette, dimmed. This avoids per-palette disabled token sprawl, works for any future palette without new tokens, and matches industry convention (Linear, Vercel, Radix all do this). Components declare `disabled_opacity` in their spec's `effects` block.

**Token system size at end of Day 5:**

- Core: 68 primitives
- Semantic common: 19 × 2 modes = 38 mode-aware values
- Semantic palette: 47 (35 base slots + 12 state modifiers) × 2 modes = 94 mode-aware values
- Total semantic: 132 mode-aware values
- Generated CSS: ~190 `--color-*` declarations across `:root` and `[data-theme="dark"]`

**Artifacts:**

- `components/button/button.spec.json` v0.1.0
- 12 new palette state-modifier tokens in Figma + pipeline
- Updated `docs/token-architecture.md` with disabled rationale

**Case study note:** This is the day Button's spec became the AI-native premise made real. ~250 lines of structured contract — every prop with guidance, every style mapped to palette slots, anti-patterns documented with the _why_. An LLM with this spec can build Button correctly without seeing the implementation. Tomorrow's implementation is just translating an already-decided contract into code.

---

### Day 6 🟡 Planned

**Goal:** Implement Button component. Render full variant matrix in playground. Both modes.

**Three pieces:**

1. **`components/button/button.tsx`** — cva config: 3 styles × 3 palettes × 3 sizes
   - Hover/active via Tailwind state variants (using new `*-hover`, `*-active` palette tokens)
   - Focus via `:focus-visible` + `common/border/focus` ring
   - Disabled via `disabled:opacity-40 disabled:pointer-events-none`
   - Loading state: spinner swap, preserves width via min-width
   - `forwardRef`, full HTML button props passthrough
   - Estimated ~80–120 lines

2. **`components/spinner/spinner.tsx`** — minimal side dependency for Button's loading state
   - Spec + impl
   - CSS-only animated spinner
   - One size prop (matches Button sizes), inherits color via `currentColor`
   - Estimated ~30 lines

3. **Playground updates** — variant matrix:
   - For each style × palette: render default + a "trigger hover" demo (or paragraph showing hover behavior)
   - All three sizes shown
   - Loading state demo (button that toggles loading on click)
   - Disabled examples
   - Both modes still toggleable

**Time estimate:** 2.5–3 hrs.

**End state:** A real working Button rendering in playground in 27+ visual variants, with state interactions, in both light and dark mode.

---

## Open questions / parking lot

- **Token reference validation (Week 2 task):** script to walk every spec's `tokens` block, verify each reference resolves to a real DTCG token, fail build on mismatch.
- **Tightening the schema:** define a stricter palette-consumer pattern (required `style_slots` + `palette_mapping`).
- **Per-palette focus rings:** currently uses common `border/focus` (always blue). Consider upgrading to per-palette focus rings later (destructive buttons get red focus rings).
- **Outline style for Button:** deferred. Add when a use case appears.
- **Tokens Studio later?** Plugin workflow works but loses "Figma change → auto PR" magic.
- **Case study format:** long-form post, personal site page, or video walkthrough?
- **MCP server hosting:** local-only demo, or deploy to Cloudflare Workers / Vercel for a live URL?

---

## Glossary

- **DTCG** — Design Tokens Community Group format
- **Spec** — `component.spec.json` file; machine-readable contract
- **MCP** — Model Context Protocol; Anthropic's standard for exposing tools/data to LLMs
- **Code Connect** — Figma feature linking Figma components to code implementations
- **cva** — class-variance-authority; library for typed Tailwind variant config
- **Style Dictionary** — Amazon's token JSON build tool
- **Palette** — named color treatment consumed by components via variant prop
- **Common** — UI infrastructure tokens used regardless of variant
- **Mode** — light or dark theme; encoded in semantic tokens
- **Style (component-level)** — visual treatment a component supports (solid, subtle, outline, ghost)
- **State modifier** — token suffix encoding interaction state (`-hover`, `-active`)

---

_Last updated: end of Day 5._
