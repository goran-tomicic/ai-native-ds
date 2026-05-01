## Test 3 — Convention adherence

**Artifact pasted:** `public/api/components.json` (full)

**Prompt:**

> I'm using the design system below. Build a button that's disabled while a save is in progress. The button should also handle hover states. Show me the code with explanations of which design system rules apply.

### Output

A raw `<button>` element styled via custom CSS classes (`.btn-primary-solid`) instead of the `<Button>` component. CSS uses token CSS variables throughout. Loading state via `is-loading` class + `aria-busy`. Disabled treated identically to loading per spec.

```jsx
function SaveButton({ onSave }) {
  const [saving, setSaving] = useState(false);
  async function handleSave() {
    setSaving(true);
    await onSave();
    setSaving(false);
  }
  return (
    <button
      type="button"
      onClick={handleSave}
      className={`btn btn-primary-solid ${saving ? "is-loading" : ""}`}
      aria-busy={saving}
      aria-label={saving ? "Saving changes" : undefined}
    >
      {saving && <Spinner size="sm" aria-hidden />}
      {saving ? "Saving" : "Save changes"}
    </button>
  );
}
```

CSS: full variant logic written from scratch (`.btn-primary-solid:hover`, `.btn-primary-solid.is-loading`, etc.) using `var(--color-palette-primary-*)` references and `var(--color-common-border-focus)` for focus ring.

### Reasoning the model gave

Eight specific citations:

- Primary palette for canonical action; cited "single most important action in a view"
- Solid style cited for "primary and destructive actions where emphasis matters"
- `aria-busy` on button itself, not aria-live region — cited spec
- Disabled = 0.4 opacity + pointer-events none, palette-agnostic — cited explicitly
- Anti-pattern of overriding opacity called out
- `disabled` attribute vs `aria-disabled` — cited the spec's a11y nuance
- Focus ring uses `--color-common-border-focus` — cited llms.txt convention
- Spinner inherits via currentColor from parent's color — cited Spinner spec

### Grading

| Criterion                                        | Result                                                         |
| ------------------------------------------------ | -------------------------------------------------------------- |
| Used `<Button>` component                        | ❌ Wrote raw `<button>` with CSS classes                       |
| Used `loading` prop                              | ❌ Implemented loading manually via `is-loading` class         |
| Used `disabled` prop correctly                   | ⚠️ Concept right, but implemented in raw CSS not via prop      |
| Cited disabled-as-opacity convention             | ✅ Explicit                                                    |
| Did not override hover                           | ⚠️ Wrote hover from scratch, but used the right palette tokens |
| Cited specific conventions traceable to artifact | ✅ Eight citations, some verbatim                              |
| CSS variable references (not raw hex)            | ✅ Throughout                                                  |
| `focus-visible` over `focus`                     | ✅                                                             |
| Spinner usage matches spec                       | ✅ `currentColor` cited correctly                              |

### Findings — the systematic failure

**Claude's failure mode is now consistent across Tests 2 and 3, but takes different forms:**

- Test 2: reimplemented `Button` as a custom React component
- Test 3: skipped `Button` entirely, wrote raw `<button>` + custom CSS classes

In both cases, **the model treats the design system as a token + convention catalog, not as a component library to consume.** It reads "palette danger solid" as styling guidance, not as `<Button palette="danger" style="solid">`. This is the deepest failure mode of the AI consumption layer in its current form.

The token-level adherence is strong:

- Palette choice correct, cited correctly
- Token CSS variables used throughout (Test 3 more cleanly than Test 2)
- State modifiers used correctly
- Conventions cited verbatim

The component-level adherence is missing:

- No imports
- No JSX consumption pattern
- Component recreated from scratch every time

### Findings — the prop-name issue

In Test 3, the model correctly referenced **palette** + **style** in CSS class names (`.btn-primary-solid`) and reasoning. But it never wrote `<Button palette="primary" style="solid" />` because it never wrote `<Button>` at all. The prop-name confusion is masked here, not resolved.

### Findings — the wins to keep

- CSS variable usage in Test 3 is significantly better than Test 2's inlined hex
- Spec-citation density is higher than Test 2 — the rules section is being read deeply
- Accessibility nuances (aria-busy, aria-disabled vs disabled, focus-visible) all correct

### What this tells us about the AI consumption layer

The AI consumption layer is succeeding at the **rules + tokens layer** and failing at the **component import/usage layer**. The spec describes components but doesn't tell the model _how to actually use them in a component tree_. Without an import statement, a package name, or a "here's the JSX shape" anchor, the model defaults to building from primitives.

Two systematic fixes implied:

1. **Component identity needs an anchor.** Either an `import` field in the JSON, a "JSX usage" section in `.llm.md`, or a hard rule in `llms.txt`: _"Components are React components. Use them as JSX, do not reimplement."_

2. **The `.llm.md` files should lead with a JSX usage example.** Currently they describe props and rules. They should start with `<ComponentName palette="..." style="..." />` so the model has a concrete shape to anchor on.

### Severity for case study

This is even better material than Test 2. **Two consecutive tests, two different failure modes, same root cause.** That's not luck — that's a systematic gap. A case study where v1 has a clear, diagnosable, fixable problem is more valuable than one where v1 happens to work.
