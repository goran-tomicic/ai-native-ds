## Test 2 — Composition

**Artifact pasted:** `public/api/components.json` (full)

**Prompt:**

> I'm using the design system below. Build a delete account confirmation dialog. The dialog should explain the consequences and require the user to confirm or cancel.
>
> Use a div for the dialog wrapper since Dialog isn't in the system yet. Output a single React component. After the code, briefly note which design system rules or conventions informed your choices, and call out anything you had to invent or work around.

### Output

A complete React component (~250 lines) — Button reimplemented from scratch, custom Spinner, custom Input with focus/error states, danger-themed dialog with backdrop, confirmation phrase verification, loading state, and a "deleted" success view. See `docs/screenshots/test-2-output.jsx` for the full code.

### Reasoning the model gave

- `palette="danger" variant="solid"` for confirm — cited "danger solid for irreversible actions"
- `palette="neutral" variant="subtle"` for cancel — cited "secondary action"
- One primary per view convention applied for hierarchy
- Disabled handled via `opacity: 0.4 + pointer-events: none`
- Focus rings via `--color-common-border-focus`
- Used danger palette slots (`base`, `base-hover`, `base-active`, `soft`, `subtle`, `bold`) for surfaces
- Confirmation phrase pattern + `aria-busy`, `role="dialog" aria-modal="true"`
- Honestly flagged: Dialog wrapper invented, Input invented, success state used success palette directly, keyframes injected via `<style>` tag

### Grading

| Criterion                                | Result                                                       |
| ---------------------------------------- | ------------------------------------------------------------ |
| `palette="danger"` for confirm           | ✅                                                           |
| Style choice for confirm — high emphasis | ⚠️ Used `variant="solid"` instead of `style="solid"`         |
| Cancel before destructive (LTR)          | ✅ Right-aligned, cancel before confirm                      |
| One primary equivalent                   | ✅ No two solid buttons competing                            |
| Acknowledged Dialog absent               | ✅ Honest, with `role="dialog"` workaround                   |
| Used semantic tokens for custom styling  | ❌ Hex values inlined directly, bypassing CSS variable layer |
| Imported Button from system              | ❌ Reimplemented Button from scratch                         |
| Reasonable invention (Input, etc.)       | ✅ Noted clearly, used existing tokens                       |

### Findings — the critical signal

**Claude used `variant` instead of `style`.** This is the single most important finding of Day 8 so far.

The Button spec defines `props.style` with values `solid | subtle | ghost`. Claude consistently used `variant="solid"`, `variant="subtle"` — the conventional prop name across virtually every other React design system (shadcn, Tailwind UI, Radix, Mantine). Despite the spec sitting in context, the model fell back to training-data convention.

This is the failure mode the AI consumption layer was supposed to prevent, and it didn't. Two implications:

1. **The spec needs to be more assertive about prop names.** A note like _"NOTE: this system uses `style` (not `variant`) as the prop name"_ probably belongs in either `llms.txt` or in the Button's `description` field. Models reach for the most familiar pattern when the spec doesn't actively block them.

2. **The `.llm.md` per-component doc may be a stronger signal than the full JSON.** The JSON is dense and easy to skim. A terse `.llm.md` that says `style: solid | subtle | ghost` on its own line is harder to misread.

### Findings — secondary failures

- **Reimplemented Button from scratch** rather than importing. The model produced ~80 lines reproducing what `<Button>` already provides. The system never told the model "import Button from the package" — because there's no package yet, only specs. This is a pipeline gap: the AI consumption layer describes _what components exist_ but doesn't specify _how to use them_ (import paths, package names).

- **Hex values inlined throughout** (`#dc2626`, `#fef2f2`, etc.). The model derived these from the JSON's `$value` fields rather than referencing the CSS variable layer (`var(--color-palette-danger-base)`). This bypasses dark mode entirely — the dialog will look identical in both themes.

- **Token names re-encoded as camelCase JS** (`tokens.dangerBase`, `tokens.fgStrong`). The model invented a flat lookup object that doesn't match any output of the actual pipeline (`generated/tokens.ts` uses different naming).

### Findings — wins

- **Composition is right.** Hierarchy correct, palette choice for destructive correct, secondary action de-emphasized. The semantic-level decisions all landed.
- **Honest about gaps.** Explicitly listed everything it had to invent (Dialog, Input, success view, animations).
- **Went beyond the prompt thoughtfully.** Confirmation phrase ("delete my account"), button stays disabled until phrase matches, focus management hooks. These are real UX patterns the prompt didn't ask for but improve the dialog.

### What this tells us about the AI consumption layer

Two things, both important:

1. **The spec works at the semantic level** — palette choice, style intent, hierarchy, accessibility. These are all correct.
2. **The spec fails at the API level** — prop names, token references, "use the existing component" instinct. The model knows _what_ to build but reaches for familiar conventions on _how_ to build it.

The fix isn't more spec, it's more _assertive_ spec. Specifically:

- llms.txt should explicitly call out non-conventional prop names
- llms.txt should say "components are imported from this package, do not reimplement"
- Token references in component code should be canonical (`var(--color-x-y-z)`), not raw hex

### Severity for case study

**This is gold.** A passing test would have made the case study weaker. _Ttwo days of effort revealed exactly what the AI consumption layer needs to be improved_ is a much better story than _the AI consumption layer worked perfectly the first time._
