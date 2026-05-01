## Test 1 — Single component, clear intent

**Artifact pasted:** `public/api/components.json` (full)

**Prompt:**

> I'm using the design system, pasted below. Build a button that submits a form to save user profile changes.
>
> Output: a single React component snippet using the system's components and props. After the code, briefly note which design system rules or conventions informed your choices.

### Output

```jsx
<Button
  palette="primary"
  style="solid"
  size="md"
  type="submit"
  loading={isSaving}
>
  Save changes
</Button>
```

**Reasoning the model gave:**

- `palette="primary"` — cited "single most important action in a view, ever"
- `style="solid"` — cited highest visual weight as appropriate for primary + submit
- `type="submit"` — cited the spec rule for forms
- `loading={isSaving}` — recognized the prop's purpose for async operations (preserves width, disables interaction)
- Label "Save changes" — used the exact example from the spec; cited "OK" / "Submit" as anti-patterns
- Did not override `disabled` — explicitly noted the system's `opacity: 0.4` handles visual affordance

### Grading

| Criterion                                    | Result |
| -------------------------------------------- | ------ |
| Correct palette (`primary`)                  | ✅     |
| Correct style (`solid`)                      | ✅     |
| Correct `type` (`submit`)                    | ✅     |
| Verb-based label                             | ✅     |
| Cited specific conventions traceable to spec | ✅     |
| No hallucinated props or hex values          | ✅     |

### Findings

Clean pass. Six independent citations, all traceable to the JSON. Two notable wins beyond what the prompt asked for:

1. **Proactive use of `loading`** — wasn't requested, but the model recognized it as the right pattern for save actions because the spec describes `loading` as preserving width during async ops.
2. **Negative reasoning** — the model explicitly noted _why it didn't override `disabled`_, citing the system's opacity convention. This is the spec being read deeply, not skimmed.

The "test ratio" — citations per decision — is high. Every prop choice was justified against a specific rule in the artifact. For an obvious case like Test 1 this is the expected outcome, but the depth of the reasoning is the more interesting signal: the model didn't pattern-match from training-data button conventions, it actually read the spec.

**Baseline established.** Tests 2–5 push harder.
