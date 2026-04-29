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

| Week | Focus                                                             | Status  |
| ---- | ----------------------------------------------------------------- | ------- |
| 1    | Foundations + first component (Badge) E2E + token architecture    | ✅ Done |
| 2    | Second component (Button) + AI consumption layer                  | ✅ Done |
| 3    | Demo with Claude + MCP server scaffolding                         | 🟡 Next |
| 4    | More components (Input, Card, Dialog) using the AI-validated spec | ⚪      |
| 5    | MCP server live + record demo video                               | ⚪      |
| 6–7  | Additional components, harden pipeline, case study draft          | ⚪      |
| 8    | Polish, case study final, portfolio page                          | ⚪      |
| 9    | Buffer / publish / share                                          | ⚪      |
| 10   | Buffer                                                            | ⚪      |

Note: original plan had components 3–5 in week 3. Reordered — proving AI consumption end-to-end with two components is more valuable than building more components on an unvalidated thesis.

---

## Locked-in decisions

- **Stack:** React + TypeScript + Tailwind v3.4 + cva + Radix primitives, pnpm, Vite
- **Source of truth:** component `.spec.json` files, validated against JSON Schema
- **Token format:** DTCG (Design Tokens Community Group)
- **Token extraction:** `variables2json` Figma plugin → custom normalizer
- **Token transform:** Style Dictionary v4, mode-aware output
- **Token architecture:** core (primitives, single mode) + semantic/common + semantic/palette, both with light + dark
- **Disabled state:** opacity + pointer-events, not per-palette tokens
- **AI consumption surface:** llms.txt + per-component .llm.md + static API (public/api/components.json)
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

Button spec written. State-modifier tokens added. Disabled-as-opacity decision committed.

### Day 6 ✅ Done

Button + Spinner implemented. Full variant matrix in playground. Both modes verified.

### Day 7 ✅ Done

**Goal:** Ship the AI consumption layer — make the design system programmatically consumable.

**Completed:**

- **`llms.txt` at repo root** — terse AI entry point listing project identity, where structured content lives, and conventions for AI-generated UI.
- **`scripts/generate-llm-docs.ts`** — generator script that reads each `*.spec.json` and emits a token-efficient `.llm.md`. Different from human docs: no marketing prose, structured prop tables, style→slot mappings, anti-patterns inline as `bad → good → why` triples.
- **Per-component AI docs** — `badge.llm.md`, `button.llm.md`, `spinner.llm.md` generated from specs. Roughly 60% size reduction vs. spec source with no information loss for code-gen purposes.
- **`scripts/build-api.ts`** — aggregator that combines all token files + all component specs + system conventions into one JSON.
- **Static API endpoint** — `public/api/components.json`. Single ~25KB file an LLM can fetch in one request to get the entire design system surface (tokens, specs, conventions, schema reference).
- **`pnpm build:all`** — chains the full pipeline: tokens:normalize → tokens:generate → docs:llm → api:build. One command produces every output.
- **README rewrite** — repositioned around the AI consumption story. Three surfaces (llms.txt, .llm.md, components.json) listed up front. Pipeline diagram included. README is now portfolio-quality.

**Architectural decisions:**

- **`.llm.md` format** — designed to be different from human docs from day one. Format favors LLM-parseability: compact prop signatures (`name: type (default)`), structured style→slot mappings as labeled lists not tables, anti-patterns as inline triples, single-line code examples. The differentiation is intentional — human docs and AI docs have different optimal structures, and forcing both into one format compromises both.
- **Static API over MCP for now** — chose `public/api/components.json` over an MCP server as the first AI surface because (1) zero infrastructure to deploy, (2) trivial to test by pasting JSON into an LLM context, (3) MCP can later wrap this same data structure. The static file becomes the foundation for the MCP server, not a competing approach.
- **Generator over hand-written `.llm.md`** — temptation was to hand-craft each component's AI doc for maximum density. Resisted: handcrafted docs drift from spec; generated docs stay in sync forever. The generator is ~150 lines of TypeScript and produces docs an LLM finds equally useful. Worth the rigor.

**Build pipeline state:**

```
Figma → variables2json → figma-export.json
                                  ↓
                          normalize-tokens.ts
                                  ↓
                tokens/{core, semantic.light, semantic.dark}.tokens.json (DTCG)
                                  ↓
                       style-dictionary.config.ts
                                  ↓
              generated/{tokens.css, tokens.ts, tailwind.tokens.cjs}
                                  ↓
                            consumed by Tailwind + components

Specs → generate-llm-docs.ts → components/{name}/{name}.llm.md (AI-readable per-component)
Specs + tokens → build-api.ts → public/api/components.json (full surface, one fetch)
```

`pnpm build:all` runs all of this end-to-end. ~30 seconds total.

**Artifacts produced:**

- `llms.txt`
- `scripts/generate-llm-docs.ts` + `scripts/build-api.ts`
- `components/badge/badge.llm.md`
- `components/button/button.llm.md`
- `components/spinner/spinner.llm.md`
- `public/api/components.json`
- Updated `README.md` (portfolio-grade)

**Case study note:** Day 7 is the moment the project's title earns its name. Up through Day 6, "ai-native" was a _premise_ — an architecture choice with theoretical benefits. Day 7 ships the actual surfaces that make it real. The static API alone is the single most valuable artifact in the repo for the case study: ~25KB JSON that lets any LLM build correctly with this design system.

---

### Day 8 🟡 Planned

**Goal:** Validate the AI consumption story. Demo + capture.

**Plan:**

1. **Open Claude (or Cursor) in a separate window**
2. **Paste `public/api/components.json`** with a prompt like: _"Using only the components and conventions provided, build a confirmation dialog that asks the user to confirm account deletion. Output should be a self-contained React component."_
3. **Capture the output** — screenshot the prompt, response, and rendered result
4. **Run a few more tests** — different prompts, different complexity levels:
   - "Build a settings panel with a save/cancel pair and a destructive delete account section"
   - "Build a notification toast for a successful save"
   - "Build a sign-up form with primary CTA and a small secondary cancel"
5. **Document any gaps** — places where the LLM had to guess, hallucinate, or asked clarifying questions. Each gap is a place to tighten the spec.
6. **Write up the demo** — short MD doc capturing the prompts, outputs, and findings. This becomes the case study's centerpiece.

**Time estimate:** 1.5–2 hours, mostly observing and documenting.

**Stretch (if time):** Begin scaffolding the MCP server. Stub-level — server that exposes `get_component_spec(name)`, `list_components()`, `get_token(path)` tools, all backed by the static JSON. Don't deploy yet, just get it working locally.

---

## Open questions / parking lot

- **Token reference validation:** still pending. Now feasible — the static API contains all tokens, validator can walk every spec's `tokens` block against it.
- **Per-palette focus rings:** deferred.
- **Outline button style:** deferred.
- **Tokens Studio:** still on the table for the demo video.
- **Case study format:** long-form post, personal site page, or video walkthrough? Lean toward written + Day 8 demo embedded as a short video.
- **MCP server hosting:** local-only demo or Cloudflare Workers / Vercel?
- **API versioning:** components.json has `version: "0.1.0"` — should bump it explicitly when breaking changes happen.

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
- **`.llm.md`** — per-component AI-optimized documentation; generated from spec; deliberately different format from human docs
- **Static API** — `public/api/components.json`; single-fetch endpoint exposing the full design system to AI consumers

---

_Last updated: end of Day 7. Week 2 complete._
