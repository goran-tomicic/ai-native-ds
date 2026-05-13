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
| Phase 3 — finish original scope | Days 19+       | Build remaining components + experimental thesis confirmation | 🟡 In progress |

**Phase 3 progress: 7 of 11 originally-planned components fully shipped.** 4 more components to reach the original 11-component scope. Thesis confirmation completed Days 28-29.

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives where helpful
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Token sources bifurcated: Figma Variables + `AUTHORED_CORE_TOKENS` block
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md (with `## Import` section as of Day 29), static API JSON, MCP server
- Single source of truth for conventions: `docs/system-meta.json`
- Component prop naming: `palette` for intent, `variant` for visual treatment
- Subcomponents as first-class entities: `Component.SubcomponentName`
- Component schema does not require `accessibility.role`
- Overlay components use native browser primitives where viable
- Context-based ARIA wiring for compound components with required accessibility associations
- **Form controls compose with FormField, never have label props themselves** (Day 30 established this)
- **FormField auto-wires id/htmlFor and aria-describedby/aria-invalid via React Context** (Day 30 pattern)
- Public repo, commit history is part of the artifact

### Editorial (writing chat)

- Three formats: long-form post + case study page + 8–12 min video
- Personal site = canonical home
- Audience: hiring managers + DS practitioners (technical)

---

## Daily log

### Days 1–18 ✅ Build phase + thesis refinement

Foundations, tokens, components (Badge, Button, Spinner), AI consumption layer, MCP server, four-iteration thesis arc.

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

Day 25 thesis refuted. Refined to perceived-availability thesis. Concrete intervention identified.

### Day 29 ✅ Intervention test — perceived-availability thesis confirmed

The most consequential experimental result of the project. Single-variable intervention (added `## Import` section) produced predicted behavior change (consumption appeared, ~88% reduction in output size).

### Day 30 ✅ FormField — the form composition wrapper

**Architecturally significant component shipped.** FormField sets the form composition pattern that all other form controls will follow.

**What shipped:**

1. **FormField spec v0.1.0** (`components/form-field/form-field.spec.json`)
   - 3 props: `required`, `invalid`, `id` (optional override of auto-generated)
   - 3 subcomponents: `FormField.Label`, `FormField.Helper`, `FormField.Error`
   - Comprehensive ARIA requirements documented
   - Composition rules: one form control per FormField, label first, error replaces helper

2. **FormField implementation** (`components/form-field/form-field.tsx`)
   - Auto-generated ID via `useId()` — eliminates manual id/htmlFor management
   - `FormFieldContext` provides id, invalid state, required flag, and helper/error IDs
   - Subcomponents register their IDs with the parent FormField (for aria-describedby wiring)
   - Required indicator on FormField.Label (asterisk, danger color)
   - FormField.Error replaces FormField.Helper when both would render
   - FormField.Error has `role="alert"` and `aria-live="polite"` for screen reader announcement
   - Compound component pattern via `FormFieldCompound` type assertion (same as Card/Dialog)
   - Exports `useFormFieldContext` hook for form controls to consume

3. **Input refactor to consume FormField context**
   - Input now reads `useFormFieldContext()` at component start
   - When inside FormField: id, state (error if invalid), aria-describedby, aria-invalid all auto-wired from context
   - When standalone: Input still works with manual props (context is optional)
   - Clean fallback semantics — context wins when present, props win otherwise

4. **Playground integration** with 5 FormField examples:
   - Default (label + input)
   - With helper text
   - Required field
   - Invalid field with error
   - Required + invalid combined

**Visual verification passed:**

- Clicking label focuses inner input (auto-wired htmlFor works)
- Required asterisk renders correctly
- Invalid state propagates: Input gets red border via context
- Error replaces helper when both would render
- aria-describedby and aria-invalid correctly applied in DevTools inspection
- Dark mode adapts

**Architectural significance:**

This is the _third_ compound component pattern in the system, but with a new variation. Card/Input used children inspection (positional). Dialog used Context for ARIA wiring (data sharing between siblings). FormField uses Context **bidirectionally** — parent provides context, but subcomponents _write back_ (helper/error IDs registered into parent state via setters).

This establishes a complete vocabulary for compound components:

- **Children inspection** (Input, Card): "where does this subcomponent go visually?"
- **Context one-way** (Dialog): "parent shares state with subcomponents"
- **Context bidirectional** (FormField): "parent provides scaffolding, subcomponents register themselves"

Future components requiring complex composition (Tabs with active state, RadioGroup with selection) will likely use the bidirectional context pattern.

**Why this was the right next component:**

Input has referenced FormField since Day 19. Five sessions of documentation promising "FormField composes with Input for labels/errors" but no actual FormField. Day 30 closes that gap. More importantly: Checkbox, Radio, Switch, Select will all compose with FormField the same way Input does. Building FormField first means the form-control trio (Day 31) inherits the composition pattern without rebuilding it.

**One TypeScript issue caught and fixed mid-session:**

Original implementation had `export function FormField(...)` on the declaration AND `export { FormFieldWithSubs as FormField }` at the bottom — double export collision (TS2484). Fixed by removing `export` from the function declaration, matching the Card/Dialog pattern. Worth flagging because: the compound component pattern requires the function be a `const` or non-exported, with the compound type assertion handling the public export.

**Artifacts:**

- `components/form-field/form-field.spec.json` v0.1.0
- `components/form-field/form-field.tsx` implementation
- `components/input/input.tsx` refactored to consume FormFieldContext
- `components/form-field/form-field.llm.md` regenerated
- `public/api/components.json` regenerated (FormField added)
- `llms.txt` regenerated (FormField listed)
- `playground/src/App.tsx` updated with FormField section

---

### Day 31 🟡 Planned — Form controls trio: Checkbox + Radio + Switch

**Goal:** Ship three structurally-similar form controls in one session, all composing with FormField.

**Why three at once:**

Checkbox, Radio, and Switch share core characteristics:

- Native HTML input as foundation (`<input type="checkbox|radio|switch-equivalent">`)
- Single visual treatment (no variant axis like Button/Card)
- Size axis (sm/md/lg)
- States: default, checked, disabled, indeterminate (Checkbox only)
- All compose inside FormField for label/helper/error layout

Building them together means making consistent decisions once instead of three times. Estimated ~120 min for all three (40 min each on average, with shared spec patterns).

**Special cases to be ready for:**

- **Checkbox indeterminate state:** third state for "some children checked." Native input supports it via JS property (not attribute). Need explicit handling.
- **Radio group semantics:** Radio components in a group need to share a `name` for native radio behavior. May want a `RadioGroup` parent component to handle this — decision point on Day 31.
- **Switch is not a native HTML element:** must be `<input type="checkbox">` styled as a toggle. ARIA implication: should it have `role="switch"`? Probably yes.

**By end of Day 31: 10 components shipped. One more to hit the original 11-component scope.**

---

### Day 32 🟡 Planned — Last component (final piece of original scope)

Three candidates worth considering once we reach this day:

- **Toast** — closes the Day 8 Test 5 historical gap (model invented a Toast that didn't exist). Operationally complex (queue, dismissal timing, positioning, ARIA live regions). ~3-4 hours of work split across spec + impl.
- **Select** — completes the form input pair with Input. Operationally complex (keyboard nav, list rendering). ~3-4 hours.
- **Tabs** — common navigation pattern, exercises compound component system further. ~3 hours.

Decision on Day 32 will depend on energy level and which feels most needed. All three are defensible final components.

---

## Open questions / parking lot

- **Generalization of Day 29 intervention:** Card re-test queued. Other components untested with intervention.
- **MCP-mediated context:** Day 18 showed Claude Desktop behavior differs.
- **Real vs. plausible import paths:** Package `@ai-native-ds/...` is fictional.
- **Bidirectional Figma sync (Phase 4 candidate):** flagged Day 22.
- **Popover (non-modal):** deferred from Day 26.
- **Dark-mode-aware shadows:** v0.1 ships single-mode.
- **Multi-framework consumption (Vue, Svelte):** still parked.
- **Other AI editors:** Cursor, Aider, Copilot.
- **Code cleanup:** dead files from earlier iterations.

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
- **Compound component pattern** — React pattern. Three flavors in the system: children-inspection (Input, Card), one-way context (Dialog), bidirectional context (FormField).
- **Effect style (Figma)** — Figma's term for styled effects like drop shadows
- **AUTHORED_CORE_TOKENS** — block in `scripts/normalize-tokens.ts` for tokens Figma can't express
- **`.llm.md`** — per-component AI-optimized documentation
- **`## Import` section** — required section in all `.llm.md` files. Critical signal for AI consumption.
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — early thesis (Day 18)
- **Reimplementation cost** — Day 25 thesis. Refuted Day 28.
- **Perceived availability** — Day 28 thesis. Confirmed by Day 29 intervention.
- **Intervention test** — Day 29 experimental method
- **DialogContext** — React Context shared between Dialog and subcomponents
- **FormFieldContext** — React Context shared between FormField, its subcomponents, and the inner form control

---

_Last updated: end of Day 30. FormField shipped. Seven components implemented. Form composition pattern locked. Next: Form controls trio (Day 31)._
