## Test 2 v2 — Composition (re-run with v2 artifacts)

**Artifact pasted:** `public/api/components.json` (v2 — includes 8 conventions and `exampleOfCorrectUsage` block)

**Prompt:** Identical to Day 8 Test 2.

### Output

A complete dialog component (~300 lines). Includes:

- Inline `<style>` block defining ~150 lines of CSS custom properties (semantic tokens) and component classes
- Custom Button styling via `.btn`, `.btn--neutral-subtle`, `.btn--danger-solid`, `.btn:disabled`
- Custom Input styling via `.confirm-input`
- Custom Dialog backdrop, animations, header, footer
- Two raw `<button>` elements (Cancel and Delete account) with the custom classes
- Confirmation phrase pattern (`type "delete" to continue`)
- Proper `role="alertdialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`

The reasoning paragraph cites all the right DS rules. The implementation does not use `<Button>`.

### Reasoning the model gave

Eight specific citations, all correct:

- Solid danger for irreversible action
- Neutral subtle for low-emphasis cancel (cited as anti-pattern violation if otherwise)
- Primary action on right (LTR rule)
- Disabled = opacity 0.4 + pointer-events none, palette-agnostic
- Focus ring uses `--color-common-border-focus`
- One primary per view
- alertdialog over dialog (correct ARIA choice the model made on its own)
- Honest about Input not existing, List not existing, backdrop-click being a guess

### Grading

| Criterion                                                 | v1 result                           | v2 result                                                   |
| --------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| Used `<Button>` as JSX                                    | ❌ Reimplemented as React component | ❌ Raw `<button>` with custom CSS                           |
| Prop names (`style` not `variant`)                        | ❌ Used `variant`                   | ✅ `style` correct (encoded as `.btn--style-palette` class) |
| CSS variable references (not hex)                         | ❌ Inline hex                       | ✅ Throughout via `:root` block                             |
| Cited disabled-as-opacity convention                      | ✅                                  | ✅                                                          |
| State modifier tokens used                                | ❌                                  | ✅ `-hover`, `-active` used correctly                       |
| Composition correct                                       | ✅                                  | ✅                                                          |
| Acknowledged invented components                          | ✅                                  | ✅                                                          |
| **Followed convention 8 (no component reimplementation)** | ❌                                  | ❌                                                          |
| **Followed example of correct usage**                     | ❌                                  | ❌                                                          |

### Findings — a deeper failure mode revealed

V2 made measurable progress on three of nine criteria — prop name correctness, CSS variable usage, and state modifier adoption. These represent genuine improvements: the prop-name disambiguation note (convention 7) is being read; the architectural shift toward CSS-variable consumption is being read.

But the headline test failed again, and in a more sophisticated way. The model now writes class names like `.btn--danger-solid` — a faithful translation of `<Button palette="danger" style="solid">` into CSS. The mental model is right. The execution layer is still wrong.

This is the most important finding of the project so far.

The v1 hypothesis: _"Models bypass components because the artifact format buries them."_

The v2 fix: explicit `COMPONENT CONSUMPTION` rule + a worked example showing JSX usage.

The v2 result: even with the rule loud and exemplified, the model still bypassed components.

This points to something deeper than artifact-format mediation:

**When given specs in JSON without an actual importable runtime, models will recreate components as code rather than treat them as callable abstractions.**

The model has no `Button` to import. It has a description of Button. So it builds a button. From the model's perspective, recreating Button via CSS classes that encode the DS API is _the most faithful possible implementation_ — it's encoding the contract perfectly while accepting that the contract has no runtime.

### What this implies for v3

The fix isn't documentation. It's packaging.

Three possible directions:

1. **Publish the components as an actual npm package.** The model imports `@ai-native/ds`, gets real components, uses them. This requires Day 11+ work.

2. **Provide a `_components/` directory of real `.tsx` files** the model is instructed to import via relative paths. Less canonical than npm but technically importable.

3. **Build the MCP server** so components become _tools_ the model invokes, not concepts the model describes. This is the original Week 4 plan and may be the actual answer.

The case study angle is now stronger, not weaker: _"We hypothesized AI consumption was a documentation problem. We tried two iterations of better documentation. Neither solved it. The actual problem is that documentation describes components but doesn't make them callable. The next layer up is packaging."_

### Wins worth keeping

The v2 changes did real work:

- Prop names propagated correctly
- CSS variables used over hex (massive improvement for dark mode support)
- State modifier tokens read and used
- Citations of conventions 7 and 8 appearing in code comments

These are not nothing. They're foundation for v3. The deeper fix (packaging/MCP) builds on a documentation layer that's now clean.
