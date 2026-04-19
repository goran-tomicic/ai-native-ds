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

| Week | Focus                                                        | Status         |
| ---- | ------------------------------------------------------------ | -------------- |
| 1    | Foundations + first component (Badge) E2E                    | 🟡 In progress |
| 2    | Second component (Button) — prove pattern generalizes        | ⚪             |
| 3    | Components 3–5 (Input, Card, Dialog) + spec draft automation | ⚪             |
| 4    | LLM docs generation, `llms.txt`, static API endpoint         | ⚪             |
| 5    | MCP server + Claude Desktop demo + record video              | ⚪             |
| 6–7  | 5 more components, harden pipeline, case study draft         | ⚪             |
| 8    | Polish, case study final, portfolio page                     | ⚪             |
| 9    | Buffer / publish / share                                     | ⚪             |
| 10   | Buffer                                                       | ⚪             |

---

## Locked-in decisions

- **Stack:** React + TypeScript + Tailwind + cva + Radix primitives, pnpm, Vite
- **First component:** Badge (low interaction complexity, proves E2E pipeline fast)
- **Source of truth:** component `.spec.json` files, validated against JSON Schema
- **Token format:** DTCG (Design Tokens Community Group)
- **Token extraction:** **plugin-based** (`variables2json` Figma plugin) → custom normalizer script. Originally planned REST API, pivoted due to Figma's Enterprise-only gating of `file_variables:read` scope.
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
- Parked original REST API script as `scripts/figma-to-tokens.enterprise.example.ts` (reference implementation for future Enterprise migration)
- Wrote `scripts/README.md` documenting the pipeline
- `pnpm tokens:normalize` runs clean

**Friction / notes:**

- **Major pivot:** Figma's Variables REST API (`file_variables:read` scope) is gated to **Enterprise plans only**. Professional plan cannot access it. Error surfaced as `403: This endpoint requires the file_variables:read scope`, and the scope doesn't appear in the PAT creation UI for non-Enterprise accounts.
- Plugin-based workflow is the working pivot: two manual steps (run plugin in Figma → save JSON → normalize) instead of one command, but achieves the same end state.

**Artifacts:**

- `tokens/core.tokens.json` — 36 tokens in DTCG format (colors + dimensions)
- `scripts/normalize-tokens.ts` — active pipeline
- `scripts/figma-to-tokens.enterprise.example.ts` — parked reference
- `scripts/README.md` — workflow documentation

**Case study note:** The Figma Enterprise wall is a valuable story to tell — shows understanding of real-world constraints and pragmatic adaptation. Not a setback, a realistic portfolio narrative.

---

### Day 3 🟡 Planned

**Goal:** Tokens become consumable by code. First component (Badge) renders on screen using the token pipeline.

**Planned steps:**

1. Install Style Dictionary — transforms DTCG JSON into multiple outputs (CSS variables, Tailwind config, TS constants)
2. Configure SD to generate:
   - `generated/tokens.css` — CSS custom properties (`--color-slate-500`, `--radius-md`, etc.)
   - `generated/tokens.ts` — typed constants for TS consumers
   - `generated/tailwind.tokens.cjs` — theme extension for Tailwind config
3. Wire Tailwind config to import generated token module
4. Set up minimal Vite + React playground app at `playground/` — renders components for local dev
5. Write first Badge component spec (`components/badge/badge.spec.json`) validated against schema
6. Hand-code first Badge component (`badge.tsx`) using generated tokens via Tailwind classes
7. Render Badge variants in playground to verify visual output

**End state:** Change a color in Figma → re-run plugin + normalize + style-dictionary → Badge visually updates in playground. That's the first true end-to-end moment of the pipeline.

**Completed:** _[fill in]_

**Friction / notes:** _[fill in]_

**Artifacts:** _[fill in]_

---

### Day 4+ — _TBD_

Plans written day-by-day based on prior day's outcome.

---

## Open questions / parking lot

- **Tokens Studio later?** Current plugin workflow works but loses the "Figma change → auto PR" magic. Consider Tokens Studio + Git sync in Week 3 or 4 for the case study demo video.
- **Component #2 after Badge:** Button or Input?
- **Case study format:** long-form post, personal site page, or video walkthrough?
- **MCP server hosting:** local-only demo, or deploy to Cloudflare Workers / Vercel for a live URL?
- **Semantic token layer:** when to introduce it? Probably Week 2 once Badge is done and we're about to build Button (which needs `color.action.primary.*` tokens).

---

## Glossary (for case study readers later)

- **DTCG** — Design Tokens Community Group format; emerging W3C standard for design tokens as JSON
- **Spec** — `component.spec.json` file; machine-readable contract defining a component's props, states, tokens, a11y, rules, examples
- **MCP** — Model Context Protocol; Anthropic's standard for exposing tools and data to LLMs
- **Code Connect** — Figma feature that links Figma components to their real code implementations
- **cva** — class-variance-authority; library for expressing Tailwind variants as typed config
- **Style Dictionary** — Amazon-authored build tool that transforms token JSON into platform-specific output (CSS, JS, iOS, Android, etc.)

---

_Last updated: end of Day 2_
