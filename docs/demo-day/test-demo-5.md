## Test 5 — Beyond the spec

**Artifact pasted:** `public/api/components.json` (full)

**Prompt:**

> I'm using the design system below. Build a Toast notification component that appears when a save succeeds. Toast itself isn't in the system yet, but it should fit consistently with what's there — using the same tokens, palette logic, and conventions.
>
> Output: a single React component snippet. After the code, briefly note which design system rules informed your choices, what you had to invent, and where you think Toast should fit if added to the system.

### Output

A complete `Toast` component plus a `ToastRegion` anchor and a usage example. The Toast itself uses CSS variables for all design tokens, applies Badge's palette-slot formula (`{palette}.soft` bg, `{palette}.bold` fg) for the status icon, uses `surface.raised` for the container, and `border.muted` for the outline. Auto-dismiss timer with hover-to-pause. `role="status"` + `aria-live="polite"` matching Badge's accessibility pattern.

The dismiss button is a raw `<button>` element with inline styles — not the system's `<Button>` component, despite the comment above it explicitly citing "ghost neutral, same as toolbar ghost button."

### Reasoning the model gave

Substantial — the most articulated of all five tests:

- Surface layer: `surface.raised` chosen because Toast is an overlay
- Palette slots: icon uses `soft` bg + `bold` fg (Badge's subtle style formula, applied verbatim)
- Border choice: `border.muted` justified against `border.subtle` (would disappear) and `border.base` (too heavy)
- Transition timing: 120ms cited from Button's effects block; 160ms for enter/exit cited as appropriate for larger moving surface
- A11y: `role="status"` + `aria-live="polite"` matching Badge; noted error toasts would need `role="alert"`
- Disabled-opacity convention noted as N/A (Toast has no disabled state)

**Honest gaps the model surfaced:**

- Auto-dismiss timer logic — no equivalent in current components
- ToastRegion anchor — needed for stacking, no precedent
- Box shadow values — invented; flagged that a shadow scale would be a natural next addition
- Animation direction — flagged as Toast-specific, would benefit from its own token block

**Schema proposal:**

- `components.toast` with `status: "experimental"`, `category: "feedback"`
- Tones: success, warning, danger, neutral (info redundant with primary)
- `composition.commonParents`: `["ToastRegion"]`

### Grading

| Criterion                                                        | Result                                       |
| ---------------------------------------------------------------- | -------------------------------------------- |
| Used `palette/success/soft` and `palette/success/bold` correctly | ✅                                           |
| Used `surface/raised` for elevation                              | ✅ With justification                        |
| Used common space tokens for padding                             | ⚠️ Mixed — some `var()`, some raw px         |
| Used `<Button>` for close/dismiss                                | ❌ Raw `<button>` with inline styles         |
| Referenced tokens via CSS variables (not hex)                    | ✅ Throughout                                |
| Noted Toast should be a system component                         | ✅ Proposed schema entry explicitly          |
| Reasoned about which tokens to use, not just what                | ✅ Cited multiple comparative justifications |
| Acknowledged gaps in the system honestly                         | ✅ Four gaps surfaced and labeled            |

### Findings — the artifact-format hypothesis confirmed

This test, more than any other, confirms the hypothesis from Test 4.

| Test | Artifact       | Used `<Button>`?                               |
| ---- | -------------- | ---------------------------------------------- |
| 1    | full JSON      | ✅ Yes                                         |
| 2    | full JSON      | ❌ Reimplemented as React component            |
| 3    | full JSON      | ❌ Skipped, wrote raw `<button>` + CSS classes |
| 4    | `.llm.md` only | ✅ Yes                                         |
| 5    | full JSON      | ❌ Used raw `<button>` for dismiss             |

Tests 1-3 + 5 use full JSON. Three of four bypass `<Button>`. Test 4 used `.llm.md` and used `<Button>` correctly.

The most damning part of Test 5 is that the model **explicitly identified the correct pattern in a code comment** ("ghost neutral, matching the toolbar ghost button pattern from the Button spec verbatim") and then _did not use that pattern_. This isn't a knowledge failure. It's a consumption-format failure.

When fed full JSON, the model engages with the design system as a reference document — extracting tokens, citing rules, explaining choices. When fed `.llm.md`, the model engages with the design system as a component library — importing and using components as JSX primitives.

Both behaviors are technically correct given the artifact format. The artifact format determines which mode the model enters.

### Findings — the wins

Test 5's reasoning quality is the highest of all five tests. The model:

- Made justified choices (`surface.raised` over `surface.base`, `border.muted` over `subtle`/`base`)
- Cited verbatim from the spec ("matching the toolbar ghost button pattern from the Button spec verbatim")
- Made design-level recommendations (which tones Toast should ship with, why `info` is redundant)
- Proposed a schema entry that fits the existing component model
- Identified gaps that should become future work (shadow tokens, animation tokens)

This is _thinking with the system_, not just building against it. The components produced — minus the dismiss button regression — would slot cleanly into the design system as v0.1.0 of Toast.

### Findings — the case for Toast as a real component

If we wanted to add Toast to the system in Week 3 or 4, this output is roughly 70% of the work. The core logic, palette mapping, accessibility pattern, schema slot, and tone scope are all proposed correctly. We'd need to:

- Replace the raw dismiss button with `<Button palette="neutral" style="ghost" size="sm" iconStart={<Close />} aria-label="Dismiss notification" />`
- Add a shadow scale to the token system (`shadow.sm/md/lg`) — flagged here as a gap
- Add an animation/motion token category — also flagged
- Decide whether tone scope is 4 (success, warning, danger, neutral) as proposed, or full Badge parity (5 tones)
- Define `Toast.spec.json` formally and validate against schema

That's a single-day component-add, not a from-scratch design exercise. The AI consumption layer made the model 70% of the way there.

### Severity for case study

This is the test that closes the case-study arc. The five tests now produce a single coherent narrative:

1. **Simple task, full JSON, baseline:** ✅ works
2. **Composition, full JSON:** ❌ component layer fails (problem identified)
3. **Conventions, full JSON:** ❌ component layer fails again, differently (problem confirmed)
4. **Anti-pattern, `.llm.md`:** ✅ works cleanly (potential fix surfaced)
5. **Beyond the spec, full JSON:** ❌ component layer fails — _even when the model knows the right pattern_ (mechanism for fix confirmed)

The hypothesis isn't speculative anymore. It's evidenced. The case study has a thesis-and-discovery structure:

- **Thesis going in:** "Specs in JSON are the AI consumption surface."
- **Discovery:** "JSON is the lookup index. Per-component markdown is the consumption surface."
- **Fix:** "Refactor `llms.txt` to point at `.llm.md` files first; treat `components.json` as a queryable token catalog, not the primary doc."

That's a much stronger case study than "we built specs and they worked."
