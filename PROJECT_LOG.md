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

| Week | Focus                                                        | Status  |
| ---- | ------------------------------------------------------------ | ------- |
| 1    | Foundations + first component (Badge) E2E                    | ✅ Done |
| 2    | Second component (Button) — prove pattern generalizes        | ⚪      |
| 3    | Components 3–5 (Input, Card, Dialog) + spec draft automation | ⚪      |
| 4    | LLM docs generation, `llms.txt`, static API endpoint         | ⚪      |
| 5    | MCP server + Claude Desktop demo + record video              | ⚪      |
| 6–7  | 5 more components, harden pipeline, case study draft         | ⚪      |
| 8    | Polish, case study final, portfolio page                     | ⚪      |
| 9    | Buffer / publish / share                                     | ⚪      |
| 10   | Buffer                                                       | ⚪      |

---

## Locked-in decisions

- **Stack:** React + TypeScript + Tailwind v3.4 + cva + Radix primitives, pnpm, Vite
- **First component:** Badge (low interaction complexity, proves E2E pipeline fast)
- **Source of truth:** component `.spec.json` files, validated against JSON Schema
- **Token format:** DTCG (Design Tokens Community Group)
- **Token extraction:** **plugin-based** (`variables2json` Figma plugin) → custom normalizer script. Originally planned REST API, pivoted due to Figma's Enterprise-only gating of `file_variables:read` scope.
- **Token transform:** Style Dictionary v4, DTCG input → CSS variables + TS constants + Tailwind theme object
- **Repo:** public on GitHub from day one, commit history is part of the artifact

---

## Daily log

### Day 1 ✅ Done

**Goal:** Foundations exist.

**Completed:**

- GitHub repo created (public, MIT)
- Cloned locally, pnpm initialized, dependencies installed
- `tsconfig.json` created
- Directory structure scaffolded: `tokens/`, `components/`, `schemas/`, `scripts/`, `docs/`
- `schemas/component.schema.json` committed — the contract every component spec validates against
- README rewritten (portfolio-worthy, not default)
- Figma file created with three empty Variable collections (`core`, `semantic`, `component`)
- Figma file key saved

**Artifacts:**

- Repo live
- Figma file scaffolded

---

### Day 2 ✅ Done

**Goal:** Tokens flow from Figma to repo in DTCG format.

**Completed:**

- Populated 36 Variables in Figma `core` collection (slate 10, blue 7, red 3, green 2, amber 2, radius 4, space 7)
- Installed `variables2json` Figma plugin → exported Variables as JSON
- Saved plugin output to `tokens/_raw/figma-export.json`
- Wrote `scripts/normalize-tokens.ts` — transforms plugin format → DTCG nested JSON with `$value` + `$type`, handles dimension conversion for space/radius (raw numbers → `"4px"`)
- Generated clean `tokens/core.tokens.json` — 36 tokens, properly nested, DTCG-compliant
- Parked original REST API script as `scripts/figma-to-tokens.enterprise.example.ts`
- Wrote `scripts/README.md` documenting the pipeline

**Friction / notes:**

- **Major pivot:** Figma's Variables REST API (`file_variables:read` scope) is gated to **Enterprise plans only**. Professional plan cannot access it. Plugin-based workflow is the working pivot.

**Artifacts:**

- `tokens/core.tokens.json` — DTCG-format tokens
- `scripts/normalize-tokens.ts`, `scripts/figma-to-tokens.enterprise.example.ts`

---

### Day 3 ✅ Done

**Goal:** Tokens become consumable by code. First component (Badge) renders on screen using the full token pipeline.

**Completed:**

- Installed and configured **Style Dictionary v4** (`style-dictionary.config.ts`)
- SD generates three outputs from DTCG tokens:
  - `generated/tokens.css` — CSS custom properties for runtime use
  - `generated/tokens.ts` + `generated/tokens.d.ts` — typed constants
  - `generated/tailwind.tokens.cjs` — flat module consumed by Tailwind theme
- Set up **Vite + React playground** at `playground/` — local dev app for rendering components
- Added Tailwind v3.4 with `tailwind.config.cjs` that pulls colors/radii from generated tokens (no hardcoded values)
- Wrote **Badge component spec** (`components/badge/badge.spec.json`) — 5 tones, 2 sizes, full a11y/composition/rules metadata — validates against schema
- Implemented **Badge component** (`components/badge/badge.tsx`) using `cva` for variants, `forwardRef` for ref forwarding
- Rendered Badge in five tones (neutral, info, success, warning, danger) and two sizes in the playground
- Updated `package.json` scripts: `tokens:normalize`, `tokens:generate`, `tokens:build` (chains both)

**Friction / notes:**

- **Tailwind v4 → v3 downgrade:** initial install pulled Tailwind v4.2 which has a completely different CSS-based config model. v4 ecosystem isn't mature enough yet; downgraded to v3.4 for stability. Noted as a potential future migration chapter.
- **Content glob resolution:** Tailwind's `content` globs had to be switched from relative paths to `path.resolve(__dirname, ...)` absolute paths. When Vite runs PostCSS from the `playground/` directory, relative globs resolved against the wrong CWD and Tailwind found no utility classes to compile.
- **Silent missing-token failure:** initial `success/warning/danger` tones rendered with text color but no background. Root cause: Badge spec referenced `color.green.100`, `color.amber.100`, `color.red.100`, but those shades weren't in Figma yet (only `500/600/700` existed). Tailwind silently drops classes whose colors aren't defined. Added the missing `100` shades to Figma, re-exported, rebuilt — all colors now render.

**Key insight from Day 3:** the missing-100-shades issue surfaces exactly the kind of integrity problem an AI-native DS should catch. A spec referencing nonexistent tokens should **fail the build loudly**, not silently render broken UI. **Added to backlog:** token-reference validation step as a Day 5/6 task — walk every spec's `tokens` block, verify each reference resolves to an actual DTCG token, fail the build on mismatch.

**Artifacts:**

- `generated/tokens.css`, `generated/tokens.ts`, `generated/tailwind.tokens.cjs` — pipeline outputs
- `components/badge/badge.spec.json` — first component spec
- `components/badge/badge.tsx` — first implementation
- `playground/` — Vite + React dev app
- `tailwind.config.cjs`, `postcss.config.cjs` + `playground/postcss.config.cjs`
- First screenshot of Badge rendering in 5 tones — **save locally, case study asset #1**

**Case study note:** Day 3 shipped the first visible artifact of the project and surfaced the "silent token mismatch" problem that validates the AI-native premise — i.e. machine-readable structure catches bugs that prose docs can't. That's a headline moment for the eventual write-up.

---

### Day 4 🟡 Planned

**Goal:** Introduce the semantic token layer. Migrate Badge from raw `bg-slate-100` classes to intent-based references (`bg-badge-neutral-bg`, etc.) so the component contract doesn't leak implementation details. Also: add basic TypeScript types generated from component spec.

**Planned steps:**

1. Add a second DTCG file, `tokens/semantic.tokens.json`, defining intent tokens that reference core tokens via DTCG aliases (`{color.slate.100}`)
2. Extend Style Dictionary config to resolve aliases and include semantic tokens in output
3. Update Badge component to use semantic classes instead of raw color scales
4. Prove aliasing works: change `color.slate.100` in Figma, both `neutral.bg` badge color and any other consumer update together
5. Stretch: write a small script that reads `badge.spec.json` and emits a typed Props interface

---

### Day 5+ — _TBD_

Plans written day-by-day based on prior day's outcome.

---

## Open questions / parking lot

- **Tokens Studio later?** Current plugin workflow works but loses the "Figma change → auto PR" magic. Consider Tokens Studio + Git sync in Week 3 or 4 for the case study demo video.
- **Component #2 after Badge:** Button or Input?
- **Case study format:** long-form post, personal site page, or video walkthrough?
- **MCP server hosting:** local-only demo, or deploy to Cloudflare Workers / Vercel for a live URL?
- **Token reference validation (Day 5/6 task):** script that walks every spec's `tokens` block and validates each reference resolves to a real DTCG token. Fail-loud on mismatch.
- **Tailwind v4 migration chapter:** explore v4's CSS-first config model as a potential case study chapter — might be a cleaner AI-native story (tokens live in CSS, not buried in JS config).

---

## Glossary (for case study readers later)

- **DTCG** — Design Tokens Community Group format; emerging W3C standard for design tokens as JSON
- **Spec** — `component.spec.json` file; machine-readable contract defining a component's props, states, tokens, a11y, rules, examples
- **MCP** — Model Context Protocol; Anthropic's standard for exposing tools and data to LLMs
- **Code Connect** — Figma feature that links Figma components to their real code implementations
- **cva** — class-variance-authority; library for expressing Tailwind variants as typed config
- **Style Dictionary** — Amazon-authored build tool that transforms token JSON into platform-specific output (CSS, JS, iOS, Android, etc.)

---

_Last updated: end of Day 3_
