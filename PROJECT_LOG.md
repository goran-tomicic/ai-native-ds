# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens.

**Current thesis (after Days 24-25):** AI models preserve the abstraction level their design system presents when reimplementation is expensive. When reimplementation is cheap, models reimplement — but they do so faithfully to the spec's grammar, and bring additional engineering competence to the surrounding code structure. The load-bearing layer for "AI-native" isn't consumability — it's whether the cost of reimplementation exceeds the cost of consumption.

---

## Project arc

| Phase                           | Days           | Focus                                                 | Status         |
| ------------------------------- | -------------- | ----------------------------------------------------- | -------------- |
| Phase 1 — build                 | Days 1–10      | Build the system, run tests, refine thesis            | ✅ Done        |
| Phase 1.5 — refinement          | Days 11, 17–18 | Conventions cleanup, v4 experiment                    | ✅ Done        |
| Phase 2 — case study writing    | Writing chat   | Long-form post + case study page + video              | 🟡 In progress |
| Phase 3 — finish original scope | Days 19+       | Build remaining components from original 10-week plan | 🟡 In progress |

Phase 3 progress: Input shipped (Days 19–21), Card spec + impl + playground + 2 AI tests shipped (Days 22–25). Phase 3 components remaining: Dialog + 5 more from original Weeks 6–7. Pace tracking ~33 hours / 4–6 weeks.

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Token sources are bifurcated: Figma Variables for what Figma supports; `AUTHORED_CORE_TOKENS` in `scripts/normalize-tokens.ts` for what it doesn't (currently shadows)
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md, static API JSON, MCP server with two render tools
- Single source of truth for conventions: `docs/system-meta.json`
- Component prop naming: `palette` for intent, `variant` for visual treatment
- Subcomponents as first-class entities: `Component.SubcomponentName`
- Component schema does not require `accessibility.role` (relaxed Day 22)
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

Renamed `style` → `variant` system-wide. Schema upgrade for subcomponents. Input spec v0.1.0 with subcomponents.

### Day 20 ✅ Input implementation

cva matrix, compound subcomponents via children inspection, dynamic padding, forwardRef, controlled+uncontrolled. Type-checked clean.

### Day 21 ✅ Input playground + first compound component AI test

All variants × states × sizes rendering. AI test passed cleanly — model used Input.LeadingIcon and Input.TrailingIcon correctly.

### Day 22 ✅ Card spec

Three variants, three subcomponents, uniform padding. Schema relaxed for structurally-neutral components. Shadow tokens specified but execution missed (caught Day 24). Long handoff to writing chat about Section 8 expansion.

### Day 23 ✅ Card implementation

cva matrix, three compound subcomponents, polymorphic `as` prop, forwardRef. Document-flow subcomponents simpler than Input's children inspection.

### Day 24 ✅ Card playground + AI Test #1 + shadow pipeline fix

Card sections in playground rendering all variants × paddings. Shadow pipeline fixed via `AUTHORED_CORE_TOKENS` pattern in normalize-tokens. AI Test #1 surfaced reimplementation regression — model rebuilt the design system locally instead of importing. Thesis refinement: abstraction preservation has a reimplementation-cost boundary.

### Day 25 ✅ AI Test #2 + writing chat handoff

**Two tasks completed.**

**1. AI Test #2 — multi-Card dashboard**

Same `card.llm.md` paste, prompt for three-card dashboard layout.

Result: **reimplementation pattern holds at scale.** Three Card instances, same reimplementation as Test #1. The model:

- Defined `Card`, `Card.Header`, `Card.Body`, `Card.Footer`, `Badge`, `Button` from scratch with inline styles
- Used compound subcomponent structure consistently across all three cards (no drift)
- Created data array + mapped over it (good engineering, not in spec)
- Added responsive CSS Grid layout from training-data conventions
- Cited spec rules accurately in reasoning paragraph
- Picked `outlined` variant + `as="article"` + `padding="md"` correctly

**Three findings ranked:**

- **Finding A:** Reimplementation pattern holds at scale. Day 24's hypothesis confirmed.
- **Finding B:** Reimplementation is consistent across instances, not drifting. The model's mental model of the API is solid; the failure is purely consume-vs-implement choice.
- **Finding C:** Model brings additional engineering competence (data-driven composition, responsive grid) beyond what the spec requires.

**Refined thesis (final version of the Day 24 refinement):**

> AI models preserve the abstraction level their design system presents when reimplementation is expensive. When reimplementation is cheap, models reimplement — but they do so faithfully to the spec's grammar, and bring additional engineering competence to the surrounding code structure.

**Implication:** The question isn't just "can my AI consume my system" but "is my system expensive enough to reimplement that the AI prefers to consume it?" Rich components (Input, Dialog, Tabs) get consumed correctly. Thin components (Card, Stack, Box) get reimplemented even when they could be imported — but if the spec is clear, the reimplementation is correct per spec.

This reframes "AI-native" from "make components consumable" to "make components either expensive-to-reimplement _or_ simple-and-correctly-specified."

**2. Writing chat handoff**

Two findings from Days 24-25 sent to writing chat:

- Thesis refinement (Section 5 sixth iteration, Section 7 new claim)
- Shadow pipeline architecture as concrete grounding for Section 8 (with the `AUTHORED_CORE_TOKENS` pattern)

The case study post is projected to grow from ~3500 to ~4200 words. Still publishable, possibly stronger as longer essay piece.

**Artifacts:**

- `docs/demo-day/day-25-card-test-2.md` — Test #2 result documented
- Writing chat handoff document with full analysis
- Project log updated

---

### Day 26 🟡 Planned — Dialog spec

**Goal:** Dialog spec. The most complex component remaining (overlay/portal logic, focus trap, modal vs non-modal, Radix Dialog wrapper).

**Scoping questions to think about beforehand:**

- Modal vs non-modal as a prop, or two separate components?
- Subcomponents: `Dialog.Title`, `Dialog.Description`, `Dialog.Footer`?
- Size scale? (sm/md/lg, or content-driven?)
- Trigger element — composition-style (`Dialog.Trigger`) or pass through ref?
- Should Dialog use the same `padding` prop pattern as Card, or its own logic?

**Test case for the new thesis:** Dialog is "rich" — overlay logic, portal rendering, focus trap, scroll lock, keyboard handling. By the Days 24-25 refinement, AI should prefer consumption over reimplementation. AI test on Day 27+ will verify.

**Time estimate:** ~60-75 min for spec, Day 27 for implementation.

---

## Open questions / parking lot

- **Bidirectional Figma sync (Phase 4 candidate):** flagged Day 22, made concrete by Day 24 shadow incident. The `AUTHORED_CORE_TOKENS` pattern is the practical solution at small scale; full code↔Figma sync remains a Phase 4 candidate. Sent to writing chat as Section 8 material.
- **Dark-mode-aware shadows:** v0.1 ships single-mode. Future pass could add semantic shadow tokens with higher alpha for dark mode.
- **FormField component:** referenced in Input spec but not built. Day 28+ candidate.
- **Multi-framework consumption (Vue, Svelte):** still parked.
- **Scale test:** still parked. Note: Day 25's Test #2 was a partial scale test (3 instances) and the pattern held.
- **Other AI editors:** Cursor, Aider, Copilot. Unverified.
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
- **Subcomponent** — component accessed via dot notation (`Input.LeadingIcon`); first-class system entity
- **Compound component pattern** — React pattern where subcomponents are properties of a parent. Proven for Input (Day 20) and Card (Day 23).
- **Effect style (Figma)** — Figma's term for styled effects like drop shadows. Distinct from Figma Variables.
- **AUTHORED_CORE_TOKENS** — block in `scripts/normalize-tokens.ts` containing tokens Figma can't express (currently shadows). Architectural pattern for bifurcated token sources.
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — earlier thesis (Day 18). Refined Days 24-25 with reimplementation-cost boundary.
- **Reimplementation cost** — current load-bearing layer. AI consumes when reimplementation is expensive; reimplements when it's cheap.

---

_Last updated: end of Day 25. Card AI Test #2 documented. Writing chat handoff sent. Next: Dialog spec (Day 26)._
