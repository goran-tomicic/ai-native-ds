# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens.

**Current thesis (after Days 24-25):** AI models preserve the abstraction level their design system presents when reimplementation is expensive. When reimplementation is cheap, models reimplement — but they do so faithfully to the spec's grammar, and bring additional engineering competence to the surrounding code structure. The load-bearing layer for "AI-native" isn't consumability — it's whether the cost of reimplementation exceeds the cost of consumption.

**Upcoming test (Day 28):** Dialog AI consumption test will directly test this thesis on the richest component in the system. Prediction: AI will consume Dialog (focus trap, portal logic, scroll lock all expensive to reimplement). Either result is publishable.

---

## Project arc

| Phase                           | Days           | Focus                                                 | Status         |
| ------------------------------- | -------------- | ----------------------------------------------------- | -------------- |
| Phase 1 — build                 | Days 1–10      | Build the system, run tests, refine thesis            | ✅ Done        |
| Phase 1.5 — refinement          | Days 11, 17–18 | Conventions cleanup, v4 experiment                    | ✅ Done        |
| Phase 2 — case study writing    | Writing chat   | Long-form post + case study page + video              | 🟡 In progress |
| Phase 3 — finish original scope | Days 19+       | Build remaining components from original 10-week plan | 🟡 In progress |

Phase 3 progress: Input shipped (Days 19–21), Card shipped with 2 AI tests (Days 22–25), Dialog spec shipped (Day 26). Phase 3 remaining: Dialog impl + AI test, then 5 more components from original Weeks 6–7, then pipeline hardening. Pace tracking ~33 hours / 4–6 weeks.

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives where helpful
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Token sources are bifurcated: Figma Variables for what Figma supports; `AUTHORED_CORE_TOKENS` in `scripts/normalize-tokens.ts` for what it doesn't (currently shadows)
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md, static API JSON, MCP server with two render tools
- Single source of truth for conventions: `docs/system-meta.json`
- Component prop naming: `palette` for intent, `variant` for visual treatment
- Subcomponents as first-class entities: `Component.SubcomponentName`
- Component schema does not require `accessibility.role` (relaxed Day 22)
- **Overlay components use native browser primitives where viable** (Day 26: Dialog uses native `<dialog>` element instead of Radix wrap)
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

Renamed `style` → `variant` system-wide. Schema upgrade for subcomponents. Input spec v0.1.0.

### Day 20 ✅ Input implementation

cva matrix, compound subcomponents via children inspection, dynamic padding, forwardRef, controlled+uncontrolled.

### Day 21 ✅ Input playground + first compound component AI test

AI test passed cleanly. Compound API consumption confirmed.

### Day 22 ✅ Card spec + schema relaxation

Three variants, three subcomponents, uniform padding. Schema relaxed for structurally-neutral components. Shadow tokens specified (execution missed; caught Day 24). Long handoff sent to writing chat.

### Day 23 ✅ Card implementation

cva matrix, three compound subcomponents, polymorphic `as` prop. Simpler than Input.

### Day 24 ✅ Card playground + AI Test #1 + shadow pipeline fix

Shadow pipeline fixed via `AUTHORED_CORE_TOKENS` pattern. AI Test #1 surfaced reimplementation regression — model rebuilt the design system locally instead of importing.

### Day 25 ✅ AI Test #2 + writing chat handoff

Reimplementation pattern confirmed at scale (3 Cards). Thesis refined: abstraction preservation has a reimplementation-cost boundary. Comprehensive handoff sent to writing chat covering Section 5, 7, 8 implications.

### Day 26 ✅ Dialog spec

**The most complex spec in the system to date.** ~350 lines of JSON reflecting Dialog's architectural surface honestly.

**Scope decisions:**

1. **Modal-only at v0.1.** Non-modal Popover deferred as separate component (different a11y semantics, different focus behavior). Clean separation prevents one component from carrying two contradictory contracts.

2. **Native HTML `<dialog>` element as foundation.** No Radix wrap. The browser handles focus trap (via `showModal()`), top-layer rendering, and modal blocking for free. Trade-off: imperative API requires React glue (`useEffect` calls to `.showModal()` / `.close()` when `open` prop changes), backdrop click detection isn't built in. About ~150-200 lines of glue code vs. ~50 with Radix. The case for native: platform is doing the work, which is the right instinct for any component with well-defined semantics. Real cost: ~30-50 more implementation lines on Day 27.

3. **Size scale (sm/md/lg).** Three sizes mapping to max-width tokens (400/560/720px). Constrained API by design — Dialog is fundamentally bounded.

4. **Five subcomponents:**
   - `Dialog.Trigger` — declarative trigger pattern (`asChild` prop for wrapping Button)
   - `Dialog.Title` — required, maps to `aria-labelledby`
   - `Dialog.Description` — recommended, maps to `aria-describedby`
   - `Dialog.Body` — main content
   - `Dialog.Footer` — actions with end-aligned layout, top border separator

   First system component requiring a subcomponent (Title) for accessibility — not optional.

5. **Controlled mode via `open`/`onOpenChange`.** Subcomponent for declarative case, props for controlled. Same pattern as Radix.

6. **Escape hatches:** `closeOnBackdropClick`, `closeOnEscape`, `initialFocusRef`. For destructive dialogs where Cancel should get focus by default (Escape becomes the path of least resistance).

**Architectural significance:**

- **Native `<dialog>` is the most platform-aligned decision so far.** Sets a precedent: when the platform has a well-defined primitive, wrap it rather than reinventing. Worth flagging in case study as design philosophy — "use the platform when the platform does the work."
- **Dialog is the test case for the Day 25 thesis.** It's the richest component in the system (focus trap, portal, scroll lock, ARIA). If AI consumes it correctly on Day 28, the reimplementation-cost hypothesis is robust. If AI bypasses for native `<dialog>`, that's a new refinement worth publishing.
- **`Dialog.Title` is the first non-optional subcomponent.** Other subcomponents (Card.Header, Input.LeadingIcon) are conventional but skippable. Dialog.Title is required by ARIA. This is a meaningful distinction.

**Artifacts:**

- `components/dialog/dialog.spec.json` v0.1.0
- `components/dialog/dialog.llm.md` regenerated
- `public/api/components.json` regenerated (Dialog added)
- `llms.txt` regenerated (Dialog listed in shipped components)

---

### Day 27 🟡 Planned — Dialog implementation

**Goal:** Build `components/dialog/dialog.tsx`. ~150-200 lines, more complex than any prior component.

**Key implementation tasks:**

1. **React wrapper around native `<dialog>`**
   - `useRef` for the dialog element
   - `useEffect` to call `.showModal()` / `.close()` when controlled `open` prop changes
   - Internal state for uncontrolled mode (when `Dialog.Trigger` is used)

2. **Subcomponent dispatch**
   - Children inspection via `displayName` (same pattern as Input/Card)
   - Title and Description rendered inside dialog with correct ARIA wiring
   - Trigger rendered as sibling outside dialog content

3. **Backdrop click detection**
   - Native `<dialog>` doesn't auto-close on backdrop click
   - Detect clicks where target === dialog element (not inside)
   - Respect `closeOnBackdropClick` prop

4. **ARIA wiring**
   - Generate unique IDs for Title and Description
   - Set `aria-labelledby` and `aria-describedby` on dialog element from those IDs

5. **Focus management**
   - Native `<dialog>` auto-focuses first focusable element
   - `initialFocusRef` prop overrides via effect

6. **Cleanup**
   - Ensure dialog closes on unmount (avoid orphaned modal blocking)

**Time estimate:** ~75-90 min. More than any prior implementation. Worth splitting into 2 sessions if energy runs low.

---

### Day 28 🟡 Planned — Dialog playground + AI test (thesis prediction test)

After Dialog implementation, run an AI consumption test as the **direct test of the Day 25 thesis**.

**Prompt options:**

1. **Destructive confirmation dialog:** "Build a delete account confirmation dialog with title, description, and cancel/delete actions." Tests basic Dialog consumption.

2. **Form dialog with controlled state:** "Build an edit profile dialog with form fields. Open should be controlled by parent state." Tests the controlled-mode pattern.

**Prediction (per Day 25 thesis):** AI will consume Dialog correctly via `<Dialog>` import. The component is rich enough that reimplementing (focus trap, portal logic, native `<dialog>` glue, ARIA wiring) is expensive.

**Alternative outcomes:**

- AI bypasses for native `<dialog>` element directly — refines the thesis (even rich components get bypassed if the native primitive is easier)
- AI uses Radix Dialog instead — surfaces a training-data preference for Radix over native
- AI reimplements like with Card — disconfirms the reimplementation-cost thesis (would be a substantial finding)

---

## Open questions / parking lot

- **Bidirectional Figma sync (Phase 4 candidate):** flagged Day 22, made concrete by Day 24 shadow incident. `AUTHORED_CORE_TOKENS` pattern is the small-scale answer; full code↔Figma sync remains Phase 4. In writing chat handoff.
- **Popover (non-modal):** deferred from Day 26 as separate component. Day 30+ candidate.
- **Dark-mode-aware shadows:** v0.1 ships single-mode.
- **FormField component:** referenced in Input spec, not built. Day 28+ candidate.
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
- **Compound component pattern** — React pattern where subcomponents are properties of a parent. Used by Input, Card, Dialog.
- **Effect style (Figma)** — Figma's term for styled effects like drop shadows.
- **AUTHORED_CORE_TOKENS** — block in `scripts/normalize-tokens.ts` for tokens Figma can't express.
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — earlier thesis (Day 18). Refined Days 24-25 with reimplementation-cost boundary.
- **Reimplementation cost** — current load-bearing layer. AI consumes when reimplementation is expensive; reimplements when it's cheap. **Dialog Day 28 is the direct test.**
- **Native `<dialog>`** — HTML element with `showModal()` API. Used by Dialog as foundation, avoiding Radix dependency for this component.

---

_Last updated: end of Day 26. Dialog spec shipped — most complex spec in the system. Day 27 is implementation, Day 28 is the AI test that directly probes the Day 25 thesis._
