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

| Week | Focus                                                    | Status         |
| ---- | -------------------------------------------------------- | -------------- |
| 1    | Foundations + Badge E2E + token architecture             | ✅ Done        |
| 2    | Button + AI consumption layer                            | ✅ Done        |
| 3    | AI demo + iterate v2 + more components                   | 🟡 In progress |
| 4    | MCP server + Claude Desktop demo + record video          | ⚪             |
| 5    | Additional components, harden pipeline, case study draft | ⚪             |
| 6–7  | Polish, case study refinement                            | ⚪             |
| 8    | Case study final + portfolio page                        | ⚪             |
| 9    | Buffer / publish / share                                 | ⚪             |
| 10   | Buffer                                                   | ⚪             |

---

## Locked-in decisions

- **Stack:** React + TypeScript + Tailwind v3.4 + cva + Radix primitives, pnpm, Vite
- **Source of truth:** component `.spec.json` files, validated against JSON Schema
- **Token format:** DTCG (Design Tokens Community Group)
- **Token extraction:** `variables2json` Figma plugin → custom normalizer
- **Token transform:** Style Dictionary v4, mode-aware output
- **Token architecture:** core + semantic/common + semantic/palette, light + dark
- **Disabled state:** opacity + pointer-events, not per-palette tokens
- **AI consumption surfaces:** llms.txt + per-component .llm.md + static API
- **Repo:** public on GitHub

---

## Daily log

### Day 1 ✅ Foundations

Repo, scaffolded directories, schema, README, Figma file with empty Variable collections.

### Day 2 ✅ Tokens flow Figma → repo as DTCG

`variables2json` plugin + custom normalizer (pivoted from REST API after Figma's Enterprise paywall).

### Day 3 ✅ Token pipeline → code

Style Dictionary, Vite + React playground, Tailwind sourced from generated tokens. Badge component E2E with 5 tones.

### Day 4 ✅ Three-layer architecture + dual modes

Architecture committed to `docs/token-architecture.md`. Style Dictionary emits both modes into single CSS file. Tailwind exposes common + palette as utilities. Badge migrated to palette tokens. Dark mode toggle.

### Day 5 ✅ Button spec + state-modifier tokens

Button spec written (~250 lines). 12 new state-modifier tokens. Disabled-as-opacity decision committed.

### Day 6 ✅ Button + Spinner implementation

Full variant matrix in playground (3 styles × 3 palettes × 3 sizes + states). Both modes verified.

### Day 7 ✅ AI consumption layer

`llms.txt`, per-component `.llm.md` generator, static API at `public/api/components.json`. README rewritten around the AI consumption story. `pnpm build:all` chains the full pipeline.

### Day 8 ✅ AI consumption demo

**Goal:** Validate the AI consumption layer against a fresh Claude conversation. Document outputs, identify gaps.

**Method:** Five sequential tests, fresh Claude.ai conversation, no project context. Two artifact formats tested: full `components.json` and per-component `.llm.md`. Each test produced verbatim output; outputs graded against per-test rubrics.

**Test outcomes:**

| Test | Artifact       | Task                | Result                                                                                                   |
| ---- | -------------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| 1    | full JSON      | submit button       | ✅ Clean pass — proper palette, style, type, label, citations                                            |
| 2    | full JSON      | confirmation dialog | ⚠️ Composition right, but Button reimplemented as React component; `variant` instead of `style`; raw hex |
| 3    | full JSON      | disabled + hover    | ⚠️ Token usage right, but skipped Button entirely — raw `<button>` + custom CSS classes                  |
| 4    | `.llm.md` only | anti-pattern test   | ✅ Clean pass — refused, cited, suggested correction, used Button as JSX, prop names correct             |
| 5    | full JSON      | invent Toast        | ⚠️ High-quality reasoning, but raw `<button>` for dismiss despite explicitly citing the right pattern    |

**Headline finding — the artifact-format hypothesis:**

When fed full `components.json`, the model used `<Button>` correctly in 1 of 4 tests.
When fed `.llm.md`, the model used `<Button>` correctly in 1 of 1 tests.

The mechanism: full JSON buries components beneath top-level `tokens`, encouraging the model to engage as a _reference document_ (extract values, cite rules, explain choices). `.llm.md` leads with JSX examples and prop tables, encouraging the model to engage as a _component library_ (import, use as JSX, parameterize via props). Both responses are technically correct given the artifact format.

**Most damning data point:** Test 5's model wrote a code comment that said "ghost neutral, matching the toolbar ghost button pattern from the Button spec verbatim" — and then wrote a raw `<button>` instead of `<Button palette="neutral" style="ghost">`. The failure is consumption-format, not knowledge.

**Strong signals on what works:**

- Token-level adherence: high across all tests
- CSS variable usage: consistent (one Test 2 exception)
- Convention citation: explicit and traceable
- Anti-pattern refusal: works when prompted to flag conflicts
- Reasoned justification: model picks tokens against alternatives ("border.muted because subtle would disappear, base would be too heavy")
- Schema thinking: Test 5 proposed a Toast schema entry that fits the existing model

**Day 8 case-study significance:**

The arc went from _"we built an AI-native DS"_ to _"we built it, validated it against five LLM tasks, found a consumption-format issue we hadn't anticipated, and have a clear path to v2."_ The failure makes the case study credible. The fix path is concrete.

**Artifacts:**

- `docs/ai-demo-day-8.md` — five tests + synthesis, ~complete case study chapter

---

### Day 9 🟡 Planned — v2 iteration

**Goal:** Implement four targeted fixes to the AI consumption layer. Re-run Tests 2, 3, 5 against v2. Document before/after.

See `docs/day-9-plan.md` for the execution plan.

**The four fixes:**

1. Restructure `llms.txt` to point at `.llm.md` files first; full JSON listed as token catalog
2. Lead each `.llm.md` with a JSX usage example
3. Add explicit consumption rule to `llms.txt`: "components are React components, use as JSX, do not reimplement"
4. Add prop-name disambiguation note: "this system uses `style` (not `variant`)"

**Re-runs:** same prompts as Day 8 Tests 2, 3, 5. Compare outcomes side-by-side.

**Time estimate:** 2–2.5 hours. Three fixes are small (1–4 are config/copy changes). The re-runs and comparison documentation are most of the time.

---

## Open questions / parking lot

- **Synthesis validation:** Day 8's synthesis was written end-of-day. Worth re-reading after a break before locking it in.
- **Case study format:** long-form post, personal site page, or video walkthrough?
- **MCP server hosting:** local-only demo or Cloudflare Workers / Vercel?
- **Per-palette focus rings:** still deferred.
- **Token reference validation:** still pending.
- **Tokens Studio:** for the demo video.
- **Outline button style:** still deferred.

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
- **`.llm.md`** — per-component AI-optimized documentation; generated from spec
- **Static API** — `public/api/components.json`; single-fetch endpoint exposing the full design system

---

_Last updated: end of Day 8._
