# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens.

**Final thesis (after Day 18):** AI models preserve the abstraction level their design system presents, regardless of output target. The load-bearing layer isn't runtime alignment — it's abstraction preservation.

**Generalization confirmed Day 21:** the thesis holds for compound APIs. Models correctly use dot-notation subcomponents (`Input.LeadingIcon`) the same way they use top-level components (`<Button>`).

---

## Project arc

| Phase                           | Days           | Focus                                                 | Status         |
| ------------------------------- | -------------- | ----------------------------------------------------- | -------------- |
| Phase 1 — build                 | Days 1–10      | Build the system, run tests, refine thesis            | ✅ Done        |
| Phase 1.5 — refinement          | Days 11, 17–18 | Conventions cleanup, v4 experiment                    | ✅ Done        |
| Phase 2 — case study writing    | Writing chat   | Long-form post + case study page + video              | 🟡 In progress |
| Phase 3 — finish original scope | Days 19+       | Build remaining components from original 10-week plan | 🟡 In progress |

Phase 3 progress: Input shipped (Days 19–21), Card spec + implementation shipped (Days 22–23). Card playground + AI test next, then 5 more components + pipeline hardening. Pace tracking ~33 hours / 4–6 weeks.

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md, static API JSON, MCP server with two render tools
- Single source of truth for conventions: `docs/system-meta.json`
- Component prop naming: `palette` for intent, `variant` for visual treatment
- Subcomponents as first-class entities: `Component.SubcomponentName` (validated working in AI consumption Day 21)
- Shadow tokens as primitives in `tokens/core.tokens.json` (sm/md/lg, single-mode at v0.1)
- Component schema does not require `accessibility.role` (relaxed Day 22 to support structurally-neutral components)
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

Renamed `style` → `variant` system-wide. Schema upgrade for subcomponents. Input spec v0.1.0 with Input.LeadingIcon / Input.TrailingIcon.

### Day 20 ✅ Input implementation

Native `<input>` styled via cva (variant × state × size matrix). Compound subcomponents via children inspection (displayName-based). Dynamic padding for icon presence. forwardRef, controlled + uncontrolled. Type-checked clean.

### Day 21 ✅ Input playground + first compound component AI test

All variants × states × sizes rendering. AI test passed cleanly: model used Input.LeadingIcon and Input.TrailingIcon as dot-notation subcomponents correctly. Thesis generalizes to compound APIs.

### Day 22 ✅ Card spec + shadow tokens

Three variants (flat/outlined/raised), three subcomponents (Card.Header/Body/Footer), uniform padding scale. Shadow tokens added to `tokens/core.tokens.json`. Schema relaxed: `accessibility.role` now optional. Figma effect styles mirrored manually (surfaced bidirectional sync gap as Phase 4 candidate). Long handoff sent to writing chat for Section 8 expansion.

### Day 23 ✅ Card implementation

**What shipped:**

`components/card/card.tsx` v0.1.0:

- cva config: variant (flat / outlined / raised) × padding (sm / md / lg) matrix
- Three compound subcomponents: `Card.Header`, `Card.Body`, `Card.Footer`
- `Card.Header`: flex with space-between for heading + accessory layout (badge, status indicator)
- `Card.Body`: passthrough container — primary content area
- `Card.Footer`: flex end-aligned with top border separator, gap for action buttons
- Subcomponents render in document flow (no children inspection needed — simpler than Input's pattern)
- Polymorphic `as` prop for semantic HTML (`article`, `section`, `aside`)
- `forwardRef` passthrough, full `HTMLElement` props spread
- `shadow-md` Tailwind utility consumes Day 22's `--shadow-md` token via the `boxShadow` mapping
- TypeScript-safe compound component pattern via `CardCompound` type assertion

**Why Card was simpler than Input:**

Input required children inspection (find `Input.LeadingIcon`/`Input.TrailingIcon` and position absolutely), dynamic padding adjustment, controlled/uncontrolled state handling. Card just renders subcomponents in document flow — whatever order the consumer puts them in is the order they render. The compound component pattern is the same; the implementation is mechanically simpler.

**Pattern proven:** Two compound components in the system now (Input from Day 20, Card from Day 23). Pattern is mature enough to scale: Dialog (Day 24+), Tabs, FormField, Select will all follow the same approach.

**Type-checked clean.** No new architectural decisions surfaced — Day 22's spec did the thinking, Day 23 was translation.

**Artifacts:**

- `components/card/card.tsx` v0.1.0
- Tailwind shadow utility verified
- One commit pushed

---

### Day 24 🟡 Planned — Card playground + AI consumption test

**Goal:** Visual verification + second compound component AI test.

**Three pieces:**

1. **Playground updates** (~30 min)
   - All variants × paddings combinations
   - Composition examples: Card with just Body, Card with Header + Body, Card with Header + Body + Footer
   - Real content: project status card, settings card with form fields, summary card with action footer
   - Both modes (light + dark)

2. **AI consumption test #1** (~15 min)
   - Simple Card composition: "build a project status card with a title, description, and a 'View details' button"
   - Tests: does the model use Card.Header / Body / Footer correctly?

3. **AI consumption test #2** (~15 min, optional but interesting)
   - Multi-Card layout: "build a dashboard with three project status cards in a grid"
   - Tests: does the pattern hold when composition repeats? Does the model maintain Card structure across instances?

**Why two tests matter:** Card is the second compound component. Day 21's test confirmed compound components work in AI consumption for Input. A second confirmation strengthens the thesis. A failure on test #2 (multi-instance) would surface a new question about repetition and AI consumption — also valuable, just differently.

**Time estimate:** ~1–1.5 hr.

---

## Open questions / parking lot

- **Bidirectional Figma sync (Phase 4 candidate):** flagged Day 22, sent to writing chat as Section 8 material.
- **Dark-mode-aware shadows:** v0.1 ships single-mode. Could add semantic shadow tokens with higher alpha for dark mode.
- **FormField component:** referenced extensively in Input spec but not built.
- **Multi-framework consumption (Vue, Svelte):** still parked.
- **Scale test:** still parked.
- **Other AI editors:** Cursor, Aider, Copilot. Unverified.
- **Code cleanup:** dead files from earlier iterations.
- **Per-palette focus rings:** still deferred.
- **Outline button variant:** still deferred.

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
- **Subcomponent** — component accessed via dot notation (`Input.LeadingIcon`); first-class system entity
- **Compound component pattern** — React pattern where subcomponents are properties of a parent component, accessed via dot notation. The system has two confirmed: Input (Day 20), Card (Day 23). Type-safe via `CardCompound`/`InputCompound` type assertions.
- **Effect style (Figma)** — Figma's term for styled effects like drop shadows. Distinct from Figma Variables, which currently don't support shadows. Source of the bidirectional sync gap.
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — current thesis: AI consumption is governed by the system's canonical abstraction level

---

_Last updated: end of Day 23. Card implementation shipped. Compound component pattern proven for two components. Next: Card playground + AI tests (Day 24)._
