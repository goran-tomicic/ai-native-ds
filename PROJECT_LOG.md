# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens.

**Current thesis (after Days 24-25):** AI models preserve the abstraction level their design system presents when reimplementation is expensive. When reimplementation is cheap, models reimplement — but they do so faithfully to the spec's grammar, and bring additional engineering competence to the surrounding code structure.

**Upcoming test (Day 28):** Dialog AI consumption test directly probes this thesis. Dialog is the richest component in the system; the prediction is that AI will consume it correctly.

---

## Project arc

| Phase                           | Days           | Focus                                                 | Status         |
| ------------------------------- | -------------- | ----------------------------------------------------- | -------------- |
| Phase 1 — build                 | Days 1–10      | Build the system, run tests, refine thesis            | ✅ Done        |
| Phase 1.5 — refinement          | Days 11, 17–18 | Conventions cleanup, v4 experiment                    | ✅ Done        |
| Phase 2 — case study writing    | Writing chat   | Long-form post + case study page + video              | 🟡 In progress |
| Phase 3 — finish original scope | Days 19+       | Build remaining components from original 10-week plan | 🟡 In progress |

Phase 3 progress: 6 of 11 originally-planned components shipped (Badge, Button, Spinner from Phase 1 + Input, Card, Dialog from Phase 3). 5 components remaining for original scope. Plus Dialog playground + AI test (Day 28), then 5 more components from original Weeks 6–7, then pipeline hardening.

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives where helpful
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Token sources are bifurcated: Figma Variables for what Figma supports; `AUTHORED_CORE_TOKENS` in `scripts/normalize-tokens.ts` for what it doesn't
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md, static API JSON, MCP server
- Single source of truth for conventions: `docs/system-meta.json`
- Component prop naming: `palette` for intent, `variant` for visual treatment
- Subcomponents as first-class entities: `Component.SubcomponentName`
- Component schema does not require `accessibility.role` (relaxed Day 22)
- **Overlay components use native browser primitives where viable** (Day 26: Dialog uses native `<dialog>` element instead of Radix wrap)
- **Context-based ARIA wiring for compound components with required accessibility associations** (Day 27 established this pattern)
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

Renamed `style` → `variant` system-wide. Schema upgrade for subcomponents.

### Day 20 ✅ Input implementation

cva matrix, compound subcomponents via children inspection.

### Day 21 ✅ Input playground + first compound component AI test

AI test passed cleanly. Compound API consumption confirmed.

### Day 22 ✅ Card spec + schema relaxation

Three variants, three subcomponents, uniform padding.

### Day 23 ✅ Card implementation

cva matrix, three compound subcomponents, polymorphic `as` prop.

### Day 24 ✅ Card playground + AI Test #1 + shadow pipeline fix

Shadow pipeline fixed via `AUTHORED_CORE_TOKENS`. AI Test #1 surfaced reimplementation regression.

### Day 25 ✅ AI Test #2 + writing chat handoff

Reimplementation pattern confirmed at scale. Thesis refined: abstraction preservation has a reimplementation-cost boundary.

### Day 26 ✅ Dialog spec

~350 lines of JSON. Most complex spec in the system. Native `<dialog>` foundation, 5 subcomponents, modal-only scope, size scale, controlled+uncontrolled modes.

### Day 27 ✅ Dialog implementation

**The most architecturally complex component shipped.**

**What's in `components/dialog/dialog.tsx`:**

1. **React wrapper around native `<dialog>`**
   - `useRef` for the dialog element with merged forwarded ref
   - `useEffect` to call `.showModal()` / `.close()` when `open` prop changes
   - Internal state for uncontrolled mode (`Dialog.Trigger` driven)
   - Bridges imperative DOM API with React's declarative model

2. **Five compound subcomponents:**
   - `Dialog.Trigger` — with `asChild` prop for wrapping interactive elements (Button), preserves child's onClick
   - `Dialog.Title` — renders as `h2` by default, configurable via `as` prop
   - `Dialog.Description` — descriptive paragraph
   - `Dialog.Body` — main content slot
   - `Dialog.Footer` — end-aligned actions with top border separator

3. **Context-based ARIA wiring** (new architectural pattern)
   - `DialogContext` provides `titleId`, `descriptionId`, `open`, `setOpen` to all subcomponents
   - `Dialog.Title` and `Dialog.Description` read their IDs from context and apply them to their own elements
   - Parent `<dialog>` reads same IDs and applies `aria-labelledby` and `aria-describedby`
   - Eliminates the need for children inspection to inject IDs

4. **Trigger separation via children inspection**
   - `Dialog.Trigger` renders _outside_ the `<dialog>` element
   - Other subcomponents render _inside_
   - Children inspection via `displayName` separates the two

5. **`useId()` for SSR-safe stable IDs** — React 18+ hook, eliminates manual ID management

6. **Backdrop click detection** — `event.target === dialogRef` means the click was on the backdrop (not content). Closes dialog if `closeOnBackdropClick: true`.

7. **Native event integration**
   - `cancel` event from Escape key — preventable if `closeOnEscape: false`
   - `close` event for any closure — syncs state if dialog closed by other means

8. **`initialFocusRef` via `queueMicrotask`**
   - Native `<dialog>.showModal()` auto-focuses first focusable element
   - To override with `initialFocusRef`, defer focus call by one microtask
   - Ensures it runs after browser's default focus has run

**Architectural significance:**

- **Context-based subcomponent wiring is a new pattern in the system.** Card and Input used `displayName` inspection for _positioning_; Dialog uses context for _data sharing_. Both patterns now established. Future components with required ARIA associations (Tabs, Listbox, Combobox) will likely use context.
- **Native primitive wrapping pattern proven.** ~200 lines of code wrapping `<dialog>`, vs. estimated ~300 lines for native focus trap + portal + scroll lock. Browser does the work; we provide ergonomics.
- **Bridges imperative-to-declarative cleanly.** The `useEffect` watching `open` is the only "magic" needed. Could serve as a model for future components wrapping imperative APIs.

**Why this is the right pre-Day-28 setup:**

Dialog is now genuinely _rich_. The implementation has:

- Native `<dialog>` showModal semantics
- Imperative-to-declarative bridge
- Context-based ARIA wiring
- Children inspection for Trigger separation
- Backdrop click detection
- Initial focus override
- Cancel/close event handling
- 5 subcomponents with type-safe compound pattern

Reimplementing all of this from scratch is genuinely expensive. Day 28's prediction (AI will consume rather than reimplement) has the right substrate to test against.

**Artifacts:**

- `components/dialog/dialog.tsx` v0.1.0 — ~200 lines
- Type-checked clean

---

### Day 28 🟡 Planned — Dialog playground + AI test (THE thesis test)

**Two parts.**

**Part 1: Playground integration (~30 min)**

Card-style verification:

- Default destructive confirmation dialog
- Form dialog with body content
- Controlled mode (open managed by external state)
- All three sizes (sm/md/lg)
- Backdrop click + Escape behavior
- `closeOnBackdropClick: false` + `initialFocusRef` for destructive flow
- Dark mode pass via existing toggle

**Part 2: AI consumption test (~30 min) — THE THESIS TEST**

Fresh Claude.ai conversation, only `dialog.llm.md` pasted. Prompt:

> "Build a delete account confirmation dialog. It should explain the consequences and require the user to confirm or cancel."

**Prediction (per Day 25 thesis):** AI consumes Dialog correctly via imports because focus trap, portal, scroll lock, native `<dialog>` glue, ARIA wiring, and 5-subcomponent composition are expensive to reimplement.

**Alternative outcomes worth being ready for:**

1. **AI consumes Dialog correctly** — confirms thesis. The reimplementation-cost hypothesis is robust across rich + thin components.

2. **AI bypasses for native `<dialog>` directly** — refines thesis. Even rich components get bypassed if the native primitive is simpler. Worth documenting: the model treats _platform primitives_ as a separate consumption layer beneath the design system.

3. **AI uses Radix Dialog instead** — surfaces training-data preference. Suggests Radix is so well-known that models default to it for any modal need. Worth documenting as a training-data bias.

4. **AI reimplements like with Card** — disconfirms thesis. Substantial finding. Would suggest reimplementation is the model's default behavior regardless of component complexity, and Day 21's Input pass was an outlier (perhaps because Input is harder to reimplement _and_ small enough that the model didn't try).

Any of these four results is publishable case study material. The thesis being tested directly is the strongest possible position for Day 28.

**Time estimate for Day 28:** ~60-75 min total.

---

## Open questions / parking lot

- **Bidirectional Figma sync (Phase 4 candidate):** flagged Day 22, made concrete by Day 24 shadow incident.
- **Popover (non-modal):** deferred from Day 26.
- **Dark-mode-aware shadows:** v0.1 ships single-mode.
- **FormField component:** referenced in Input spec, not built.
- **Multi-framework consumption (Vue, Svelte):** still parked.
- **Scale test:** Day 25 partial (3 instances); larger test still parked.
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
- **Subcomponent** — component accessed via dot notation; first-class system entity
- **Compound component pattern** — React pattern where subcomponents are properties of a parent. Two flavors used in the system: children-inspection (Input, Card) and context-based (Dialog).
- **Effect style (Figma)** — Figma's term for styled effects like drop shadows.
- **AUTHORED_CORE_TOKENS** — block in `scripts/normalize-tokens.ts` for tokens Figma can't express.
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — earlier thesis (Day 18). Refined Days 24-25.
- **Reimplementation cost** — current load-bearing layer. AI consumes when reimplementation is expensive; reimplements when it's cheap.
- **Native `<dialog>`** — HTML element with `showModal()` API. Used by Dialog as foundation.
- **DialogContext** — React Context shared between Dialog and its subcomponents for ARIA ID wiring.

---

_Last updated: end of Day 27. Dialog implementation shipped. The thesis test (Day 28) is set up against the richest component in the system. Six of eleven components shipped, on track for Phase 3 completion._
