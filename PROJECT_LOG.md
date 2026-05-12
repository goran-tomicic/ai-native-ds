# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens.

**Current thesis (after Day 28):** AI consumption of design system components is determined not by the cost of reimplementation, but by the model's perception of whether the component is available as a callable artifact. With spec alone, models reimplement regardless of complexity. With runtime context (codebase access, import paths, package registry), models consume.

**Concrete intervention identified:** Add explicit import information to every `.llm.md` file. The hypothesis can be tested directly on Day 29.

---

## Project arc

| Phase                           | Days           | Focus                                                 | Status         |
| ------------------------------- | -------------- | ----------------------------------------------------- | -------------- |
| Phase 1 — build                 | Days 1–10      | Build the system, run tests, refine thesis            | ✅ Done        |
| Phase 1.5 — refinement          | Days 11, 17–18 | Conventions cleanup, v4 experiment                    | ✅ Done        |
| Phase 2 — case study writing    | Writing chat   | Long-form post + case study page + video              | 🟡 In progress |
| Phase 3 — finish original scope | Days 19+       | Build remaining components from original 10-week plan | 🟡 In progress |

Phase 3 progress: 6 of 11 originally-planned components fully shipped. Plus Day 28 produced the most consequential thesis refinement of the entire project. Phase 3 remaining: Day 29 intervention test, then 4-5 more components from original scope, then pipeline hardening.

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives where helpful
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Token sources are bifurcated: Figma Variables for what Figma supports; `AUTHORED_CORE_TOKENS` for what it doesn't
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md, static API JSON, MCP server
- Single source of truth for conventions: `docs/system-meta.json`
- Component prop naming: `palette` for intent, `variant` for visual treatment
- Subcomponents as first-class entities: `Component.SubcomponentName`
- Component schema does not require `accessibility.role`
- Overlay components use native browser primitives where viable
- Context-based ARIA wiring for compound components with required accessibility associations
- Public repo, commit history is part of the artifact

### Editorial (writing chat)

- Three formats: long-form post + case study page + 8–12 min video
- Personal site = canonical home
- Audience: hiring managers + DS practitioners (technical)

---

## Daily log

### Days 1–18 ✅ Build phase + thesis refinement

Foundations, tokens, components (Badge, Button, Spinner), AI consumption layer, MCP server, four-iteration thesis arc culminating in abstraction-preservation finding.

### Day 19 ✅ Architectural cleanup + Input spec

Renamed `style` → `variant`. Schema upgrade for subcomponents.

### Day 20 ✅ Input implementation

cva matrix, compound subcomponents via children inspection.

### Day 21 ✅ Input playground + first compound component AI test

AI test passed. Compound API consumption confirmed.

### Day 22 ✅ Card spec + schema relaxation

Three variants, three subcomponents, uniform padding.

### Day 23 ✅ Card implementation

cva matrix, three compound subcomponents, polymorphic `as` prop.

### Day 24 ✅ Card playground + AI Test #1 + shadow pipeline fix

Shadow pipeline fixed via `AUTHORED_CORE_TOKENS`. AI Test #1 surfaced reimplementation regression.

### Day 25 ✅ AI Test #2 + writing chat handoff

Reimplementation pattern confirmed at scale. Thesis refined: abstraction preservation has a reimplementation-cost boundary.

### Day 26 ✅ Dialog spec

~350 lines. Most complex spec in the system. Native `<dialog>` foundation, 5 subcomponents.

### Day 27 ✅ Dialog implementation

~200 lines. React wrapper around native `<dialog>`, context-based ARIA wiring, displayName-based Trigger separation.

### Day 28 ✅ Dialog playground + AI consumption test (the thesis test)

**The most consequential AI test of the entire project.**

**Playground integration:**

- Destructive confirmation (uncontrolled with Dialog.Trigger)
- Controlled form dialog (open/onOpenChange managed externally)
- Three sizes (sm/md/lg) demonstrating max-width scale
- Locked dialog (closeOnBackdropClick=false, closeOnEscape=false)
- All visual checks passed in both modes

**AI consumption test:**

Fresh Claude.ai, only `dialog.llm.md` pasted. Same prompt as Day 8 Test 2 and Day 24 Test #1 — destructive confirmation dialog. Third time this exact prompt has been run, this time at peak system maturity.

**Result: reimplementation, but with explicit awareness.**

The model produced ~250 lines reimplementing the entire design system locally. No imports. Everything defined as shims. But unlike Day 24's silent reimplementation, the model explicitly stated:

> _"Primitive shims (replace with real DS imports in production) — the spec defines a component API but ships no implementation. I wrote minimal Button and Dialog shims inline. In production these would be real DS imports."_

The reimplementation was a conscious choice the model articulated, not a default behavior.

**What this refutes:** Day 25's reimplementation-cost thesis. Dialog is the richest component in the system. The thesis predicted consumption. Reality was reimplementation. So cost wasn't the variable.

**Refined thesis (v7):**

> _AI consumption of design system components is determined not by the cost of reimplementation, but by the model's perception of whether the component is available as a callable artifact. With spec alone (`.llm.md`), models reimplement regardless of complexity. With runtime context (codebase access, import paths, package registry), models consume._

**What explains all the data:**

- Day 21 (Input, `.llm.md` only) → consumed (model didn't think hard about implementation)
- Day 24 (Card, `.llm.md` only) → reimplemented silently (implementation easy, no awareness needed)
- Day 28 (Dialog, `.llm.md` only) → reimplemented with explicit awareness (implementation forced the choice into consciousness)
- Day 10c (Button, Claude Code with codebase) → consumed (codebase access provided import visibility)

The variable that explains all four: **does the model have visibility into where the component lives?**

**Secondary finding — spec adherence remained perfect.** The reimplementation honored 11 out of 11 spec rules tested. The spec is the load-bearing artifact; consume vs. reimplement affects code reuse, not output correctness. This is a positive finding for design systems: a good spec ensures correctness whether AI consumes or reimplements.

**Concrete intervention identified:** Add import information to `.llm.md` files. If the model sees `import { Dialog } from '@ai-native-ds/dialog'` (or equivalent) at the top of the spec, the perceived-availability variable changes. Day 29 will test this directly.

**Practitioner advice now possible:**

> _"For AI to consume your design system, the spec alone isn't enough. The AI needs information about where the component lives — import path, package name, or codebase context. Without that, AI defaults to reimplementation regardless of component complexity. Add a 'Usage' or 'Import' section to your AI-facing documentation: `import { Dialog } from '@your-org/design-system'`. This single line is what bridges the gap between 'AI knows how the component should work' and 'AI uses the component you wrote.'"_

This is concrete, testable, actionable. Strongest practitioner advice in the project.

**Severity for case study:** Highest of the entire project. Day 28 produces a third thesis refinement, concrete actionable advice, and a clean intervention to test on Day 29. The thesis arc is now substantively complete — seven iterations, each grounded in data, ending in a specific recommendation practitioners can implement.

**Artifacts:**

- `playground/src/App.tsx` — Dialog sections added
- `docs/demo-day/day-28-dialog-test.md` — full test analysis
- Substantial handoff sent to writing chat (Section 5, 7, 8 implications)
- Two commits pushed

---

### Day 29 🟡 Planned — Intervention test (the perceived-availability hypothesis)

**The most testable hypothesis of the project.** Add explicit import information to `dialog.llm.md`, re-run the exact same prompt, observe whether consumption appears.

**Two parts:**

1. **Modify `dialog.llm.md`** (~10 min)
   - Add a "## Usage" or "## Import" section near the top
   - Include: `import { Dialog } from '@ai-native-ds/dialog'` (or similar import string)
   - Possibly add: a brief "How to use this" sentence framing the import as required

2. **Re-run the Day 28 prompt** (~30 min)
   - Fresh Claude.ai conversation
   - Same exact prompt as Day 28
   - Capture full output
   - Compare: does the model now import Dialog, or does it still reimplement?

**Possible outcomes:**

- **Model consumes** → thesis confirmed with concrete intervention. The case study now has a fix that practitioners can apply.
- **Model still reimplements** → thesis needs further refinement. Maybe `.llm.md` isn't enough even with import info; maybe the runtime context (codebase access, actual file existence) is what matters. Worth investigating: does the model recognize the import path as "real" or treat it as fictional?
- **Model imports but breaks differently** → surfaces a new failure mode. Possibly the model imports correctly but mis-uses the API in a way it didn't when reimplementing (because reimplementation forced explicit attention to the contract).

All three outcomes are publishable. The intervention test makes the case study end on confirmed advice rather than open question.

**Time estimate:** ~45 min.

---

## Open questions / parking lot

- **Bidirectional Figma sync (Phase 4 candidate):** flagged Day 22, concretized Day 24.
- **Popover (non-modal):** deferred from Day 26.
- **Dark-mode-aware shadows:** v0.1 ships single-mode.
- **FormField component:** referenced in Input spec, not built.
- **Multi-framework consumption (Vue, Svelte):** still parked.
- **Scale test:** Day 25 partial.
- **Other AI editors:** Cursor, Aider, Copilot.
- **Code cleanup:** dead files from earlier iterations.

---

## Glossary

- **DTCG** — Design Tokens Community Group format
- **Spec** — `component.spec.json` file; machine-readable contract
- **MCP** — Model Context Protocol; Anthropic's standard for exposing tools to LLMs
- **cva** — class-variance-authority
- **Style Dictionary** — Amazon's token JSON build tool
- **Palette** — named color treatment
- **Common** — UI infrastructure tokens
- **Mode** — light or dark theme
- **Variant (component-level)** — visual treatment a component supports
- **State modifier** — token suffix (`-hover`, `-active`)
- **Subcomponent** — component accessed via dot notation; first-class system entity
- **Compound component pattern** — React pattern where subcomponents are properties of a parent. Two flavors used: children-inspection (Input, Card) and context-based (Dialog).
- **Effect style (Figma)** — Figma's term for styled effects like drop shadows.
- **AUTHORED_CORE_TOKENS** — block in `scripts/normalize-tokens.ts` for tokens Figma can't express.
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — early thesis (Day 18). Refined Day 25.
- **Reimplementation cost** — Day 25 thesis. Refuted Day 28.
- **Perceived availability** — Day 28 thesis. AI consumes when it can see the component as a callable artifact; reimplements when it can't.
- **DialogContext** — React Context shared between Dialog and its subcomponents.
- **Intervention test** — Day 29 experiment: add import info to `.llm.md`, see if consumption appears.

---

_Last updated: end of Day 28. Most consequential AI test of the project completed. Thesis refined a third time. Day 29 has a clear, testable intervention queued. Case study writing chat has been fully updated._
