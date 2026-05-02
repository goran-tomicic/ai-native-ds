# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens. This project explores what changes when the design system itself is built for that consumer: specs as source of truth, DTCG tokens, structured contracts, docs as byproduct.

**Model:** Figma (design) → Tokens + Specs (source of truth) → Code + Docs + AI endpoint (outputs)

**Refined thesis after Day 9:** AI-native design systems are not fundamentally a documentation problem. They are a packaging problem. Documentation describes components; only packaging makes them callable. The MCP server is the load-bearing layer.

---

## The 10-week arc

| Week | Focus                                        | Status         |
| ---- | -------------------------------------------- | -------------- |
| 1    | Foundations + Badge E2E + token architecture | ✅ Done        |
| 2    | Button + AI consumption layer (v1)           | ✅ Done        |
| 3    | AI demo + v2 iteration → MCP server          | 🟡 In progress |
| 4    | MCP server complete + Claude Desktop demo    | ⚪             |
| 5    | Record video + additional components if time | ⚪             |
| 6–7  | Polish, case study refinement                | ⚪             |
| 8    | Case study final + portfolio page            | ⚪             |
| 9    | Buffer / publish / share                     | ⚪             |
| 10   | Buffer                                       | ⚪             |

Note: original plan had MCP at Week 4. After Day 9, MCP becomes the central artifact, not a polish task. Bringing it forward.

---

## Locked-in decisions

- **Stack:** React + TypeScript + Tailwind v3.4 + cva + Radix primitives, pnpm, Vite
- **Source of truth:** component `.spec.json` files, validated against JSON Schema
- **Token format:** DTCG (Design Tokens Community Group)
- **Token extraction:** `variables2json` Figma plugin → custom normalizer
- **Token transform:** Style Dictionary v4, mode-aware output
- **Token architecture:** core + semantic/common + semantic/palette, light + dark
- **Disabled state:** opacity + pointer-events, not per-palette tokens
- **AI consumption surfaces:** llms.txt + per-component .llm.md + static API + (forthcoming) MCP server
- **Repo:** public on GitHub

---

## Daily log

### Day 1 ✅ Foundations

Repo, scaffolded directories, schema, README, Figma file with empty Variable collections.

### Day 2 ✅ Tokens flow Figma → repo as DTCG

`variables2json` plugin + custom normalizer.

### Day 3 ✅ Token pipeline → code

Style Dictionary, Vite + React playground, Tailwind sourced from generated tokens. Badge E2E with 5 tones.

### Day 4 ✅ Three-layer architecture + dual modes

Architecture committed to `docs/token-architecture.md`. Both modes in single CSS file. Tailwind exposes common + palette as utilities. Badge migrated to palette tokens. Dark mode toggle.

### Day 5 ✅ Button spec + state-modifier tokens

Button spec written. 12 new state-modifier tokens. Disabled-as-opacity decision committed.

### Day 6 ✅ Button + Spinner implementation

Full variant matrix in playground. Both modes verified.

### Day 7 ✅ AI consumption layer v1

`llms.txt`, per-component `.llm.md` generator, static API. README rewritten around AI consumption story.

### Day 8 ✅ AI consumption demo

Five tests against fresh Claude.ai conversation. Found that full JSON consistently fails at component-consumption layer (3/4 tests bypass `<Button>`). `.llm.md` succeeds. Hypothesis: artifact-format mediates whether models treat the system as a reference document vs. a component library.

### Day 9 ✅ v2 iteration

**Goal:** Apply four targeted fixes from Day 8's synthesis. Re-run failing tests. Document before/after.

**Fixes applied:**

1. `llms.txt` restructured — `.llm.md` files prioritized, `components.json` listed as token catalog
2. Generator updated to lead each `.llm.md` with JSX `## Usage` example
3. `llms.txt` added prop-name disambiguation (style vs variant) and component-consumption rule (use as JSX, do not reimplement)
4. `llms.txt` and `components.json` got an `exampleOfCorrectUsage` block

**Pipeline bug caught and fixed:** `scripts/build-api.ts` had conventions hardcoded separately from `llms.txt`. Without fixing, v2 conventions wouldn't have flowed to the JSON the model would see. Flagged: two surfaces need a single source of truth for conventions.

**Re-tested:** Day 8 Test 2 (composition / delete account dialog) with v2 artifacts. Tests 3 and 5 skipped — Test 2's outcome was strong enough signal.

**What v2 fixed:**

- ✅ Prop names correct (encoded as `.btn--danger-solid` class names; convention 7 read)
- ✅ CSS variables used throughout (vs Day 8's inline hex)
- ✅ State modifier tokens consumed (`-hover`, `-active`)

**What v2 did not fix:**

- ❌ Model still wrote raw `<button>` elements with custom CSS classes instead of using `<Button>` as JSX
- ❌ Convention 8 (the explicit "do not reimplement components" rule) overlooked
- ❌ The `exampleOfCorrectUsage` block overlooked

**The deeper finding:**

The pattern across two iterations and four data points reveals: when given specs in JSON without an actual importable runtime, models recreate components as code rather than treat them as callable abstractions. The model has no `Button` to import — it has a description of Button. So it builds a button. From the model's perspective, encoding the DS API as `.btn--danger-solid` CSS classes is the most faithful possible implementation — preserving the contract while accepting it has no runtime.

**This is not a documentation failure. It is a packaging failure.**

V1 hypothesis: artifact format mediates consumption. Partially true — but more documentation, however clearly worded, cannot make components callable.

Refined thesis: documentation describes components; only packaging makes them callable. The next layer up is MCP — components as tools the model invokes, not concepts the model describes.

**Case study significance:**

The Days 7–9 arc now reads as a thesis-evolution narrative:

- Day 7: Built three documentation surfaces
- Day 8: Tested. Found documentation alone consistently fails at component-consumption layer
- Day 9: Iterated documentation. Some failure modes resolved (prop names, hex values). The core failure mode (component bypass) did not
- Day 9 finding: documentation describes; packaging makes things callable. Next iteration: MCP server.

This is a stronger thesis than "we built specs and they worked." It's a real finding the next iteration of the AI-native DS field needs to grapple with.

**Artifacts:**

- v2 `llms.txt`, `.llm.md` files, `components.json`
- Day 9 synthesis appended to `docs/ai-demo-day-8.md`
- v2 build pipeline (with conventions sync bug fix)

---

### Day 10 🟡 Planned — MCP server foundation

**Goal:** Stand up an MCP server exposing the design system as callable tools. Components become invocable, not describable.

See `docs/day-10-plan.md` for execution.

**Three core tools to implement:**

- `list_components()` — returns names + descriptions
- `get_component(name)` — returns full spec
- `render_component(name, props)` — returns rendered JSX string

**Stretch:**

- `query_tokens(intent)` — semantic search across tokens
- `validate_usage(jsx_string)` — checks if a candidate JSX uses the DS correctly

**Time estimate:** 2.5–3 hrs.

---

## Open questions / parking lot

- **Conventions single source:** `llms.txt` and `build-api.ts` need to share a source. Defer to Week 4 cleanup.
- **Case study format:** long-form post, personal site page, or video walkthrough?
- **MCP server hosting:** local-only (stdio) for demo, or HTTP-deployable for live demo?
- **Per-palette focus rings:** still deferred.
- **Token reference validation:** still pending.
- **Outline button style:** still deferred.

---

## Glossary

- **DTCG** — Design Tokens Community Group format
- **Spec** — `component.spec.json` file; machine-readable contract
- **MCP** — Model Context Protocol; Anthropic's standard for exposing tools/data to LLMs as callable functions
- **cva** — class-variance-authority; library for typed Tailwind variant config
- **Style Dictionary** — Amazon's token JSON build tool
- **Palette** — named color treatment consumed by components via variant prop
- **Common** — UI infrastructure tokens used regardless of variant
- **Mode** — light or dark theme; encoded in semantic tokens
- **Style (component-level)** — visual treatment a component supports (solid, subtle, ghost)
- **State modifier** — token suffix encoding interaction state (`-hover`, `-active`)
- **`.llm.md`** — per-component AI-optimized documentation; generated from spec
- **Static API** — `public/api/components.json`; single-fetch endpoint exposing the full design system
- **Callable abstraction** — a component the model can invoke (via import, MCP tool, etc.) rather than describe in code

---

_Last updated: end of Day 9._
