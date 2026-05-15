# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens.

**Final thesis (Day 29, experimentally confirmed):** AI consumption of design system components is determined by perceived availability of the component as a callable artifact. Adding a single import statement to the spec changes the model's behavior from local reimplementation to consumption via import. Confirmed by single-variable experimental intervention.

---

## ✅ ORIGINAL SCOPE CLOSED — Day 33

12 components shipped end-to-end. Every major UI category covered. Schema and generator flexed to handle imperative architecture. Thesis arc complete with experimental confirmation.

---

## Project arc

| Phase                           | Days           | Focus                                                         | Status         |
| ------------------------------- | -------------- | ------------------------------------------------------------- | -------------- |
| Phase 1 — build                 | Days 1–10      | Build the system, run tests, refine thesis                    | ✅ Done        |
| Phase 1.5 — refinement          | Days 11, 17–18 | Conventions cleanup, v4 experiment                            | ✅ Done        |
| Phase 2 — case study writing    | Writing chat   | Long-form post + case study page + video                      | 🟡 In progress |
| Phase 3 — finish original scope | Days 19–33     | Build remaining components + experimental thesis confirmation | ✅ Done        |
| Phase 3.5 — wrap-up             | TBD            | Code cleanup, README, docs polish                             | 🟡 Pending     |

---

## Components shipped (12 total)

| Component  | Spec | Impl      | Playground | Category              |
| ---------- | ---- | --------- | ---------- | --------------------- |
| Badge      | ✅   | ✅        | ✅         | display               |
| Button     | ✅   | ✅        | ✅         | action                |
| Spinner    | ✅   | ✅        | ✅         | feedback (persistent) |
| Input      | ✅   | ✅        | ✅         | form                  |
| Card       | ✅   | ✅        | ✅         | container             |
| Dialog     | ✅   | ✅        | ✅         | overlay               |
| FormField  | ✅   | ✅        | ✅         | form                  |
| Checkbox   | ✅   | ✅        | ✅         | form                  |
| Radio      | ✅   | ✅        | ✅         | form                  |
| RadioGroup | ✅   | ✅        | ✅         | form                  |
| Switch     | ✅   | ✅        | ✅         | form                  |
| **Toast**  | ✅   | ✅ Day 33 | ✅ Day 33  | feedback (transient)  |

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives where helpful
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Token sources bifurcated: Figma Variables + `AUTHORED_CORE_TOKENS` block
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md (with `## Import` section), static API JSON, MCP server
- Single source of truth for conventions: `docs/system-meta.json`
- Component prop naming: `palette` for intent, `variant` for visual treatment
- Subcomponents as first-class entities: `Component.SubcomponentName`
- Component schema does not require `accessibility.role`
- Overlay components use native browser primitives where viable
- Context-based ARIA wiring for compound components with required accessibility associations
- Form controls compose with FormField, never have label props themselves
- FormField auto-wires id/htmlFor and aria-describedby/aria-invalid via React Context
- Form controls (Checkbox, Radio, Switch) are styled native inputs — no custom widgets
- Grouped controls use a Group parent component owning shared state via context
- Imperative components are documented via grouped props + architecture/behavior sections
- **Imperative components use createPortal to escape parent stacking contexts** (Day 33, Toast)
- **Animation lifecycle uses transitionend events for exit-before-unmount** (Day 33, Toast)
- Public repo, commit history is part of the artifact

### Editorial (writing chat)

- Three formats: long-form post + case study page + 8–12 min video
- Personal site = canonical home
- Audience: hiring managers + DS practitioners (technical)

---

## Daily log (condensed)

### Days 1–18 ✅ Build phase + early thesis refinement

### Day 19 ✅ Architectural cleanup + Input spec

### Day 20 ✅ Input implementation

### Day 21 ✅ Input playground + first compound component AI test

### Day 22 ✅ Card spec + schema relaxation

### Day 23 ✅ Card implementation

### Day 24 ✅ Card playground + AI Test #1 + shadow pipeline fix

### Day 25 ✅ AI Test #2 + writing chat handoff

### Day 26 ✅ Dialog spec

### Day 27 ✅ Dialog implementation

### Day 28 ✅ Dialog AI test — Day 25 thesis refuted, perceived-availability identified

### Day 29 ✅ Intervention test — perceived-availability thesis confirmed

### Day 30 ✅ FormField — bidirectional context pattern

### Day 31 ✅ Checkbox + Radio + RadioGroup + Switch (form controls trio + group)

### Day 32 ✅ Toast spec + schema/generator flex for imperative components

### Day 33 ✅ Toast implementation — original scope closed

**The structural bookend.** Day 8 Test 5 was the test where the model hallucinated a Toast component that didn't exist. Day 33 ships Toast as the final component of the original scope. The thing the model invented on Day 8 is the thing the system ships last.

**What shipped:**

1. **ToastProvider** (`components/toast/toast.tsx`)
   - React Context provider, owns the toast queue state
   - Renders the visible stack in a fixed-position container via createPortal to document.body
   - SSR-safe via mount detection (`useEffect` + `mounted` state)
   - Configurable position (6 options), defaultDuration, max (with oldest-eviction), gap

2. **useToast hook**
   - Returns stable API object: `show / info / success / warning / error / dismiss`
   - API ref pattern: stable identity across renders, but `dismiss` method updates each render to see current queue
   - Each trigger method returns the new toast's id for specific dismissal

3. **Per-toast timer management**
   - One `setTimeout` per toast, stored in a `Map` ref keyed by id
   - Pause-on-hover with remaining-duration math: pause stores elapsed time, resume continues from where it stopped (not full reset)
   - `duration: 0` disables auto-dismiss for errors the user must see
   - Focus-within parity: keyboard users get the same pause behavior as mouse users
   - Timers cleaned up on toast removal AND on provider unmount

4. **Visual ToastItem (internal)**
   - cva for tone-based border-left color (5 tones reusing Badge vocabulary)
   - Enter animation: render with `entered=false`, RAF schedules `entered=true`, CSS transition runs
   - Exit animation: `toast.exiting` flips, exit-state classes apply, `onTransitionEnd` fires `onRemove`
   - Two render passes for one dismissal — required for transitionend-based animation
   - Action button + close button, both with proper ARIA

5. **Accessibility**
   - `aria-live="polite"` on the stack container
   - `role="status"` on each toast
   - `aria-label="Dismiss notification"` on close button
   - Focus pause parity with hover pause

**Architectural significance:**

Toast is the only **imperative** component in the system. Every other component is declarative — render `<X>`, it appears. Toast is triggered via a hook (`toast.success(...)`), and a provider manages everything else. Provider + hook + visual element, three coordinated pieces.

This is a new pattern for the system. The user reviewed the implementation carefully (per their Day 32 commitment) — the provider+hook+timer pattern is genuinely different from anything else built, and the review was the right call. Five state concerns coordinate: queue state, per-toast timers (refs), per-toast remaining duration (refs), per-toast exit state (in queue), portal mount detection. The complexity is in the _coordination_, not any single piece.

**Verified via 13-point visual check including:**

- Auto-dismiss with full duration
- Pause-on-hover with correct remaining-time math
- Exit animation playing before removal (not instant)
- Max queue eviction (oldest exits with animation when fourth arrives)
- Action button handler with auto-dismiss after click
- Tone borders matching palette
- Focus-pause parity with hover-pause
- Portal escape from Dialog stacking context (the canonical test — toast renders _over_ the dialog backdrop)
- Dark mode adaptation

**Closes the Day 8 loop.** The case study has earned its structural bookend.

**Artifacts:**

- `components/toast/toast.tsx` (~280 lines, the most stateful component in the system)
- `playground/src/App.tsx` updated with ToastProvider wrap and ToastPlayground section
- AI consumption surfaces regenerated

---

## What's next (Phase 3.5 — wrap-up)

The remaining work is lighter and qualitatively different from the build phase. Three real items:

### Code cleanup

- Dead files from early iterations (referenced in old PROJECT_LOG entries)
- Stale comments referencing the old `style` prop (Day 19 rename)
- Leftover raw `figma-export.*` files no longer used by the pipeline
- Diagnostic commands were provided in early sessions for finding these

### README and docs polish

- Top-level README needs a rewrite reflecting the system's actual scope and thesis
- Screenshots from the playground for visual context
- Architecture diagram for the AI consumption layer (token pipeline → spec → .llm.md → MCP)
- Possibly a quick "how to read this repo" guide pointing visitors at PROJECT_LOG.md, the case study, and the demo-day folder

### Optional: intervention generalization tests

- Re-run the Card test with the Day 29 intervention applied (does it work on a previously-reimplemented component?)
- Re-test other components with the intervention
- Test in MCP-mediated context (Claude Desktop / Claude Code)

The intervention tests are not strictly necessary — Day 29's Dialog confirmation is enough to support the thesis. They'd add evidence, not change the conclusion. Worth doing if energy is good, fine to skip.

**Phase 3.5 is one or two focused sessions, max.** Lighter cognitive load than building, real portfolio impact. Then the project is genuinely complete.

---

## Open questions / parking lot

- **Generalization of Day 29 intervention:** Card re-test queued.
- **MCP-mediated context:** Day 18 showed Claude Desktop behavior differs.
- **Real vs. plausible import paths:** Package `@ai-native-ds/...` is fictional.
- **Bidirectional Figma sync (Phase 4 candidate):** flagged Day 22.
- **Popover (non-modal):** deferred from Day 26.
- **Dark-mode-aware shadows:** v0.1 ships single-mode.
- **Multi-framework consumption (Vue, Svelte):** still parked.
- **Other AI editors:** Cursor, Aider, Copilot.
- **`useToastAPI` schema field:** named specifically; generalize when a second hook-based component appears.
- **Fieldset component:** referenced but not built.
- **Tabs, Select:** deferred at Day 32 — system stops at 12 components.

---

## Glossary

- **DTCG** — Design Tokens Community Group format
- **Spec** — `component.spec.json` file; machine-readable contract
- **MCP** — Model Context Protocol
- **cva** — class-variance-authority
- **Style Dictionary** — Amazon's token JSON build tool
- **Palette** — named color treatment
- **Common** — UI infrastructure tokens
- **Mode** — light or dark theme
- **Variant (component-level)** — visual treatment a component supports
- **State modifier** — token suffix
- **Subcomponent** — component accessed via dot notation
- **Compound component pattern** — React pattern. Flavors in the system: children-inspection (Input, Card), one-way context (Dialog), bidirectional context (FormField, RadioGroup).
- **Imperative component** — component triggered via a hook rather than rendered declaratively. Toast is the system's only one. Documented via grouped props + architecture/behavior sections.
- **Effect style (Figma)** — Figma's term for styled effects like drop shadows
- **AUTHORED_CORE_TOKENS** — block in `scripts/normalize-tokens.ts` for tokens Figma can't express
- **`.llm.md`** — per-component AI-optimized documentation
- **`## Import` section** — required section in all `.llm.md` files. Critical signal for AI consumption.
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — early thesis (Day 18)
- **Reimplementation cost** — Day 25 thesis. Refuted Day 28.
- **Perceived availability** — Day 28 thesis. Confirmed by Day 29 intervention.
- **Intervention test** — Day 29 experimental method
- **DialogContext / FormFieldContext / RadioGroupContext / ToastContext** — React Contexts for compound or provider-pattern components
- **Styled native input** — Day 31's approach for form controls
- **Schema flex** — when a real component reveals an assumption in the schema, extend the schema. Days 19 (subcomponents) and 32 (imperative architecture) are the two instances.
- **Day 8 loop** — Day 8 Test 5 was when the model hallucinated a Toast component. Day 33 shipped Toast as the final component, closing the loop structurally.

---

_Last updated: end of Day 33. Original 10-week scope closed. 12 components shipped end-to-end. The Day 8 loop closes; the thesis arc confirmed; the system stands as a complete v0.1 experimental design system with empirical advice for practitioners._
