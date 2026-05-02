# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens. This project explores what changes when the design system itself is built for that consumer.

**Final thesis (after Day 10):** AI-native design systems require all three layers to function. Documentation describes the system. Packaging makes components callable. Runtime alignment makes them executable. Failure in any one layer produces component-bypass behavior.

---

## The 10-week arc

| Week | Focus                                        | Status  |
| ---- | -------------------------------------------- | ------- |
| 1    | Foundations + Badge E2E + token architecture | ✅ Done |
| 2    | Button + AI consumption layer (v1)           | ✅ Done |
| 3    | AI demo + v2 iteration + MCP server          | ✅ Done |
| 4    | Case study writing + portfolio integration   | 🟡 Next |
| 5–7  | Polish, video walkthrough if time            | ⚪      |
| 8–9  | Buffer / publish                             | ⚪      |
| 10   | Buffer                                       | ⚪      |

The build phase is functionally complete. Week 4+ is about the case study artifact itself.

---

## Locked-in decisions

- **Stack:** React + TypeScript + Tailwind v3.4 + cva + Radix primitives, pnpm, Vite
- **Source of truth:** `*.spec.json` files validated against JSON Schema
- **Token format:** DTCG, mode-aware via Style Dictionary
- **Token architecture:** core + semantic/common + semantic/palette, light + dark
- **Disabled state:** opacity + pointer-events, palette-agnostic
- **AI consumption surfaces:** llms.txt, per-component .llm.md, static API JSON, MCP server
- **Repo:** public on GitHub, commit history is part of the artifact

---

## Daily log

### Day 1 ✅ Foundations

Repo, schema, scaffolding, Figma file.

### Day 2 ✅ Tokens flow Figma → repo as DTCG

Plugin-based extraction, custom normalizer.

### Day 3 ✅ Token pipeline → code

Style Dictionary, Vite playground, Badge E2E with 5 tones.

### Day 4 ✅ Three-layer architecture + dual modes

`docs/token-architecture.md` written. Both modes in single CSS file. Dark mode toggle.

### Day 5 ✅ Button spec + state-modifier tokens

Button spec, 12 new state-modifier tokens, disabled-as-opacity decision.

### Day 6 ✅ Button + Spinner implementation

Full variant matrix in playground. Both modes verified.

### Day 7 ✅ AI consumption layer v1

`llms.txt`, generator script for `.llm.md`, static API at `public/api/components.json`.

### Day 8 ✅ AI consumption demo

Five tests against fresh Claude.ai. Found documentation alone fails at component consumption (3/4 full-JSON tests bypass `<Button>`). `.llm.md` + simple task succeeded.

### Day 9 ✅ v2 iteration

Four targeted fixes. Three failure modes resolved (prop names, hex usage, state modifiers). Core failure mode persisted: model still bypasses components for raw `<button>`. Refined thesis: documentation insufficient, packaging needed.

### Day 10 ✅ Packaging iteration

**Day 10a** — Built MCP server with three tools (`list_components`, `get_component`, `render_component`). Connected to Claude Desktop via stdio. Wiring took longer than building (pnpm stdout pollution, macOS Gatekeeper, NODE_PATH resolution, Settings UI staleness — each caused a failed connect before clean).

**Day 10b** — Same Day 8 Test 2 prompt in Claude Desktop with MCP active. Model called `list_components` and `get_component` but **did not use `render_component`.** Output was an HTML artifact with raw `<button>` elements and `.ds-btn-style-palette` CSS classes — same pattern as Day 9 v2.

Insight: Claude Desktop's HTML artifact iframe has no React runtime. JSX strings from `render_component` would be dead text. So the model wrote HTML directly. **Even callable tools fail in the wrong runtime.**

**Day 10c** — Same prompt in Claude Code editing a real `.tsx` file. Model used `<Button>` as JSX with correct prop names, real import path discovered by reading the repo, semantic token utility classes throughout. **First successful component consumption across four iterations.**

The variable that changed: the runtime context. JSX-as-string in chat → JSX-as-string in chat → HTML iframe → executable `.tsx` file. The first three are documentation surfaces; the last is a runtime. The model used the component as soon as the runtime accepted JSX execution.

### Thesis evolution across the four iterations:

- v1: Documentation is the AI consumption surface (failed)
- v2: Better documentation will fix it (failed)
- v3: Packaging (callable tools) will fix it (failed in wrong runtime)
- v4: Runtime alignment is the missing layer (confirmed in Day 10c)

**Final thesis:** AI-native design systems require all three layers — documentation, packaging, runtime alignment — to function. Any one missing produces component-bypass.

**Artifacts produced Day 10:**

- `mcp-server/` — TypeScript MCP server with three tools
- Day 10 synthesis appended to `docs/ai-demo-day-8.md`
- Updated thesis in this log
- Working Claude Code workflow with MCP active

**Build phase complete.** Days 1–10 produced a functioning AI-native design system, an honest test methodology, and a four-iteration thesis refinement that is the case study's intellectual core.

---

## Open questions / parking lot

- **Day 10b ambiguity:** was the HTML artifact behavior really about runtime, or about Claude Desktop's artifact mode pushing the model toward HTML? A v5 test in Claude Desktop with artifact mode disabled would disambiguate. Future work.
- **Conventions single source:** `llms.txt` and `build-api.ts` still have separate sources. Cleanup task.
- **Case study format:** long-form post, personal site page, or video walkthrough? Active decision needed before Week 4.
- **MCP server hosting:** local stdio is fine for the demo. HTTP-deployable version would be a Week 5+ stretch.
- **Per-palette focus rings:** still deferred.
- **Outline button style:** still deferred.
- **Tokens Studio integration:** for the demo video, optional.

---

## Decision pending after Day 10c

After sleeping on it, decide: build a v4 fix to the MCP server (`render_component` returns runtime-appropriate output), or skip the v4 fix and write up the case study with the four-iteration arc as the artifact?

Tomorrow's decision. Either path is defensible. Skipping v4 produces a cleaner case study; building v4 produces one more iteration but risks a less-clean story if v4 doesn't work as predicted.

---

## Glossary

- **DTCG** — Design Tokens Community Group format
- **Spec** — `component.spec.json` file; machine-readable contract
- **MCP** — Model Context Protocol; Anthropic's standard for exposing tools to LLMs as callable functions
- **cva** — class-variance-authority; typed Tailwind variant config
- **Style Dictionary** — Amazon's token JSON build tool
- **Palette** — named color treatment consumed by components via variant prop
- **Common** — UI infrastructure tokens used regardless of variant
- **Mode** — light or dark theme
- **Style (component-level)** — visual treatment a component supports (solid, subtle, ghost)
- **State modifier** — token suffix encoding interaction state (`-hover`, `-active`)
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`; single-fetch endpoint for AI consumers
- **Runtime alignment** — the principle that the component, the tool the model invokes, and the output target must share a runtime for component consumption to work

---

_Last updated: end of Day 10. Sleeping on whether to build v4 or write up the case study._
