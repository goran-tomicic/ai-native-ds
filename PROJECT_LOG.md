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

## Project arc

| Phase                           | Days           | Focus                                                         | Status         |
| ------------------------------- | -------------- | ------------------------------------------------------------- | -------------- |
| Phase 1 — build                 | Days 1–10      | Build the system, run tests, refine thesis                    | ✅ Done        |
| Phase 1.5 — refinement          | Days 11, 17–18 | Conventions cleanup, v4 experiment                            | ✅ Done        |
| Phase 2 — case study writing    | Writing chat   | Long-form post + case study page + video                      | 🟡 In progress |
| Phase 3 — finish original scope | Days 19+       | Build remaining components + experimental thesis confirmation | 🟡 Almost done |

**Phase 3 progress: Toast spec shipped — implementation on Day 33 closes the original scope.**

---

## Components (12 specced, 11 implemented)

| Component  | Spec      | Impl      | Playground | Category             |
| ---------- | --------- | --------- | ---------- | -------------------- |
| Badge      | ✅        | ✅        | ✅         | display              |
| Button     | ✅        | ✅        | ✅         | action               |
| Spinner    | ✅        | ✅        | ✅         | feedback             |
| Input      | ✅        | ✅        | ✅         | form                 |
| Card       | ✅        | ✅        | ✅         | container            |
| Dialog     | ✅        | ✅        | ✅         | overlay              |
| FormField  | ✅        | ✅        | ✅         | form                 |
| Checkbox   | ✅        | ✅        | ✅         | form                 |
| Radio      | ✅        | ✅        | ✅         | form                 |
| RadioGroup | ✅        | ✅        | ✅         | form                 |
| Switch     | ✅        | ✅        | ✅         | form                 |
| **Toast**  | ✅ Day 32 | 🟡 Day 33 | 🟡 Day 33  | feedback (transient) |

After Day 33, the original 10-week scope is complete — 12 components, every major UI category covered.

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
- **Imperative components are documented via grouped props + architecture/behavior sections** (Day 32 — schema and generator both flexed to support this)
- Public repo, commit history is part of the artifact

### Editorial (writing chat)

- Three formats: long-form post + case study page + 8–12 min video
- Personal site = canonical home
- Audience: hiring managers + DS practitioners (technical)

---

## Daily log

### Days 1–18 ✅ Build phase + thesis refinement

### Day 19 ✅ Architectural cleanup + Input spec

### Day 20 ✅ Input implementation

### Day 21 ✅ Input playground + first compound component AI test

### Day 22 ✅ Card spec + schema relaxation

### Day 23 ✅ Card implementation

### Day 24 ✅ Card playground + AI Test #1 + shadow pipeline fix

### Day 25 ✅ AI Test #2 + writing chat handoff

### Day 26 ✅ Dialog spec

### Day 27 ✅ Dialog implementation

### Day 28 ✅ Dialog playground + AI consumption test

### Day 29 ✅ Intervention test — perceived-availability thesis confirmed

### Day 30 ✅ FormField — form composition wrapper

### Day 31 ✅ Checkbox + Radio + RadioGroup + Switch (four components, one session)

### Day 32 ✅ Toast spec + schema/generator flex for imperative components

**Toast is the first component in the system that broke the system's own assumptions** — and that turned out to be more interesting than the spec itself.

**What shipped:**

1. **Toast spec v0.1.0** (`components/toast/toast.spec.json`)
   - Three-piece architecture documented explicitly: ToastProvider + useToast hook + visual Toast
   - Grouped props by piece (ToastProvider props, useToastTrigger args, Toast internal props)
   - Provider config: `position` (6 options), `defaultDuration` (5000ms default), `max` (3 default), `gap` (8px default)
   - useToast API: `show / info / success / warning / error / dismiss`
   - Auto-dismiss with pause-on-hover; queue with max-overflow eviction
   - Tones reuse Badge's vocabulary (neutral/info/success/warning/danger)
   - `aria-live='polite'` region for screen reader announcement
   - New `behavior` section documents queue, timing, pauseOnHover, enterExit, stacking — things that don't fit prop or state definitions but matter for implementation
   - `architecture.pieces` documents the three coordinated parts

2. **Schema extension** (`schemas/component.schema.json`)
   - Extracted `propDescriptor` and `propGroup` as `$defs` for reuse
   - `props.additionalProperties` is now `anyOf [descriptor, group]` — declarative components keep working unchanged, imperative components can group props by piece
   - Added optional `shape` field to `propDescriptor` for nested object props (e.g., Toast's `options.action: { label, onClick }`)
   - New top-level fields: `architecture`, `useToastAPI`, `behavior`
   - Extended `composition` with `providerPlacement`, `hookUsage`, `subcomponentOrdering`

3. **Generator extension** (`scripts/generate-llm-docs.ts`)
   - Detect grouped vs flat props via `isPropDescriptor` helper
   - Grouped props render as `### GroupName` subheadings with nested prop lines
   - New section renderers: `renderArchitecture`, `renderUseToastAPI`, `renderBehavior`
   - Section order for imperative components: Title → Description → Import → **Architecture** → Usage → Props (grouped) → **useToast API** → States → **Behavior** → Effects → Rules → Anti-patterns → Examples → Subcomponents → Related
   - Backward-compatible: declarative components render essentially identically (only whitespace differences)
   - Verified by regenerating all 11 existing `.llm.md` files

**Why this matters beyond Toast:**

The schema and generator were both built assuming components are declarative with flat props. Toast forced them to flex because Toast is _fundamentally_ different — provider + hook is a real architectural pattern, not a quirk. The pattern is:

> When a real component reveals an assumption baked into the system, extend the system rather than distort the component to fit.

This is the second time it's happened. Day 19 the schema flexed for subcomponents (Input.LeadingIcon). Day 32 the schema flexed for imperative architecture. Both times, the schema doing its job by surfacing where the model of "what a component is" was too narrow.

This is a small but real case-study point: a design system schema that can describe imperative components is more honest than one that can't. The case study can note this in passing — schema evolution as evidence the system reflects what real design systems actually need.

**Generated Toast `.llm.md` verified clean.** Architecture section appears before Usage so a reader (human or AI) knows the three pieces exist before parsing prop groups. Props section now shows ToastProvider / useToastTrigger / Toast as separate subheadings with their respective props. useToast API renders as a method reference. Behavior section captures the queue/timing/pause logic.

**One small thing worth noting for the case study:** the `useToastAPI` schema field is intentionally named for Toast specifically, not generalized to `hookAPI`. Premature generalization in a schema is a real cost. When a second hook-based component shows up, we generalize then — based on evidence of a pattern, not speculation about one.

**Artifacts:**

- `components/toast/toast.spec.json` v0.1.0
- `schemas/component.schema.json` extended (propDescriptor/propGroup $defs, new top-level fields)
- `scripts/generate-llm-docs.ts` extended (grouped props, three new section renderers)
- All 11 existing components' `.llm.md` files regenerated (verified backward-compatible)
- `public/api/components.json` and `llms.txt` regenerated (Toast added)

---

### Day 33 🟡 Planned — Toast implementation

**The most stateful component in the system.** Five intertwined pieces:

1. **`ToastProvider`** — React Context provider that owns the toast queue (array of `{ id, message, tone, duration, action, state }`). Renders the visible stack in a fixed-position container based on the `position` prop. Manages timers (one per toast, with pause/resume).

2. **`useToast` hook** — Reads ToastProvider context, returns an object: `{ show, info, success, warning, error, dismiss }`. Each method dispatches an action to the provider (add toast) and returns the new toast's id (so consumers can dismiss specifically).

3. **Per-toast timer** — `setTimeout` for auto-dismiss. Stored in a ref keyed by toast id. Cleared on mouse enter, restarted with remaining duration on mouse leave. The "remaining duration" math is the fiddly part.

4. **Positioning container** — Fixed position determined by `position` prop. CSS handles top/bottom and left/center/right via flexbox/positioning. Stack direction matches the edge: top-_ stacks downward, bottom-_ stacks upward (newest closer to the edge).

5. **Enter/exit animation** — Toasts mount, then animate in (`enter` state). On dismiss, transition to `exit` state, wait for animation to finish, then remove from queue (this is what `enterExit` in the spec's behavior section describes). React's exit-before-unmount is the tricky part — likely a small state machine on each toast.

**Time:** ~90 min. Most stateful component in the system. User said they will review this code carefully — good. The provider+hook+timer pattern is genuinely different from everything else built; worth understanding.

**Decision still to make on Day 33:** how to handle the exit-animation-before-unmount. Two real options:

- Mark a toast as `exiting` in queue state, wait for `transitionend` event, then remove
- Use a third-party animation primitive (Framer Motion, React Spring) — adds a dep but the API is cleaner

Probably option 1 (no new deps), but Day 33 will decide when the actual implementation is being written.

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
- **Code cleanup:** dead files from earlier iterations — Phase 3 wrap-up.
- **`useToastAPI` schema field:** named specifically. Generalize when a second hook-based component appears.
- **Fieldset component:** referenced but not built.
- **Tabs, Select:** deferred at Day 32 — system stops at 12 components for now.

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
- **Imperative component** — component triggered via a hook rather than rendered declaratively. Toast is the system's first. Documented via grouped props + architecture/behavior sections in the spec.
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
- **Schema flex** — when a real component reveals an assumption in the schema, extend the schema. Days 19 (subcomponents) and 32 (imperative architecture) are the two instances so far.

---

_Last updated: end of Day 32. Toast spec shipped. Schema and generator extended to handle imperative components. One implementation session away from closing the original scope._
