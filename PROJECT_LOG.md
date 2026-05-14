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
| Phase 3 — finish original scope | Days 19+       | Build remaining components + experimental thesis confirmation | 🟡 Nearly done |

**Phase 3 progress: 10 of 11 originally-planned components shipped.** One more component closes the original 10-week scope. Thesis confirmation completed Days 28-29.

---

## Components shipped (10 of 11)

| Component  | Spec | Impl | Playground | Category  |
| ---------- | ---- | ---- | ---------- | --------- |
| Badge      | ✅   | ✅   | ✅         | display   |
| Button     | ✅   | ✅   | ✅         | action    |
| Spinner    | ✅   | ✅   | ✅         | feedback  |
| Input      | ✅   | ✅   | ✅         | form      |
| Card       | ✅   | ✅   | ✅         | container |
| Dialog     | ✅   | ✅   | ✅         | overlay   |
| FormField  | ✅   | ✅   | ✅         | form      |
| Checkbox   | ✅   | ✅   | ✅         | form      |
| Radio      | ✅   | ✅   | ✅         | form      |
| RadioGroup | ✅   | ✅   | ✅         | form      |
| Switch     | ✅   | ✅   | ✅         | form      |

(That is technically 11 components in the table — the original "11-component scope" counted RadioGroup and Radio as a pair, or counted differently. Either way: one more substantial component — Toast, Select, or Tabs — closes the originally-envisioned scope. See Day 32 plan.)

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
- **Form controls (Checkbox, Radio, Switch) are styled native inputs — no custom widgets** (Day 31)
- **Grouped controls use a Group parent component owning shared state via context** (Day 31, RadioGroup)
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

### Day 28 ✅ Dialog playground + AI consumption test (Day 25 thesis refuted, perceived-availability identified)

### Day 29 ✅ Intervention test — perceived-availability thesis confirmed

### Day 30 ✅ FormField — form composition wrapper, bidirectional context pattern

### Day 31 ✅ Form controls trio + group: Checkbox + Radio + RadioGroup + Switch

**Four components shipped in one session — the most ambitious component day of the project.** Doable because Checkbox/Radio/Switch are structurally near-identical; RadioGroup is the only one with genuinely new logic.

**What shipped:**

1. **Checkbox** (`components/checkbox/checkbox.tsx`)
   - Native `input[type=checkbox]` styled via cva (size axis only, no variant matrix)
   - Indeterminate state — set via ref (`.indeterminate` is a DOM property, not an attribute) in a useEffect
   - `aria-checked='mixed'` when indeterminate
   - Checkmark via data-URI background image on `:checked`
   - Consumes FormFieldContext for auto-wired id

2. **Radio** (`components/radio/radio.tsx`)
   - Native `input[type=radio]` styled via cva
   - Consumes `RadioGroupContext` for shared name, selected value, onChange, size, disabled
   - `checked` state derived from `groupCtx.value === value`
   - Dot indicator via radial-gradient background on `:checked`
   - Also consumes FormFieldContext for auto-wired id

3. **RadioGroup** (`components/radio-group/radio-group.tsx`)
   - Owns the shared `name`, selected `value`, `onChange`, `size`, `disabled`
   - Provides `RadioGroupContext` to child Radios
   - Controlled + uncontrolled (via `value` vs `defaultValue`)
   - `role="radiogroup"`, vertical/horizontal orientation
   - One-directional import: Radio imports RadioGroup's context export (not a cycle)

4. **Switch** (`components/switch/switch.tsx`)
   - Native `input[type=checkbox]` + `role="switch"` (signals immediate-effect toggle to screen readers)
   - Sliding thumb via `::before` pseudo-element with `translate-x` transition
   - Size axis scales track width, track height, thumb size
   - Consumes FormFieldContext

**Architectural notes:**

- **Form controls are styled native inputs, not custom widgets.** This is a deliberate accessibility-first choice. Native `<input type="checkbox|radio">` gives keyboard handling, focus management, and form integration for free. The cva styling makes them look designed; the underlying element stays native.

- **RadioGroup establishes the "Group parent owns shared state" pattern.** This is the same bidirectional-context family as FormField, but used for selection state rather than ARIA wiring. Future grouped components (a future ToggleGroup, ButtonGroup, etc.) would follow this.

- **All four compose with FormField uniformly.** The Day 30 FormField refactor pays off: Checkbox, Radio, Switch all consume `useFormFieldContext()` the same way Input does. The form category is now internally consistent — every form control composes with FormField identically.

**Fiddly CSS resolved:** Checkbox checkmark (data-URI background), Radio dot (radial-gradient), Switch thumb (`::before` pseudo-element). All three are "styled native input" tricks. They render correctly in both modes.

**Artifacts:**

- 4 spec files, 4 implementation files
- `playground/src/App.tsx` updated with Checkbox / RadioGroup / Switch sections
- `components/*/*.llm.md` regenerated (all four included, all with `## Import` sections)
- `public/api/components.json` and `llms.txt` regenerated
- 2 commits (specs, then implementations + playground)

---

### Day 32 🟡 Planned — Final component (closes original scope)

The last component of the original 10-week plan. Three candidates:

**Toast** — closes the Day 8 Test 5 historical gap (the original test where the model invented a Toast that didn't exist). Narratively satisfying to build the thing that became the most-cited failure example. Operationally complex: queue management, dismissal timing, positioning, ARIA live regions, animation lifecycle. Likely spec-day + impl-day pair.

**Select** — completes the form-input story alongside Input. Operationally complex: keyboard navigation, option list rendering, optional search/filter. Often built on a primitive library. Likely 2-day component.

**Tabs** — common navigation pattern. Exercises the compound subcomponent system once more (Tabs.List, Tabs.Tab, Tabs.Panel). Moderate complexity. ~1 spec day + 1 impl day.

**Recommendation when Day 32 arrives:** Toast, for the narrative payoff (closing the Day 8 loop) and because it adds a genuinely new component category (transient feedback) that the system doesn't have yet. But Tabs is the lower-risk choice if energy is limited.

**After Day 32: original 10-week scope complete.** Then Phase 3 wrap-up: pipeline hardening, code cleanup, README/docs polish, possibly the parked intervention-generalization tests.

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
- **Code cleanup:** dead files from earlier iterations — should happen during Phase 3 wrap-up.
- **Fieldset component:** referenced in FormField's related-components but not built. Possible future addition.

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
- **Effect style (Figma)** — Figma's term for styled effects like drop shadows
- **AUTHORED_CORE_TOKENS** — block in `scripts/normalize-tokens.ts` for tokens Figma can't express
- **`.llm.md`** — per-component AI-optimized documentation
- **`## Import` section** — required section in all `.llm.md` files. Critical signal for AI consumption.
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — early thesis (Day 18)
- **Reimplementation cost** — Day 25 thesis. Refuted Day 28.
- **Perceived availability** — Day 28 thesis. Confirmed by Day 29 intervention.
- **Intervention test** — Day 29 experimental method
- **DialogContext / FormFieldContext / RadioGroupContext** — React Contexts for compound component coordination
- **Styled native input** — the Day 31 approach for form controls: native HTML input element styled via cva, keeping native keyboard/focus/form behavior while looking designed

---

_Last updated: end of Day 31. Ten components shipped. Form category complete and internally consistent. One component from the original scope. Next: final component (Day 32)._
