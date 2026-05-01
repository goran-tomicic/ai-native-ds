## Test 4 — Anti-pattern avoidance

**Artifact pasted:** `components/button/button.llm.md` (single file, NOT the full JSON)

**Prompt:**

> I'm using the design system below. I want a primary blue cancel button on my form. Build it.
>
> Output: a single React component snippet. If anything in the design system contradicts what I asked for, point it out before showing the code.

### Output

The model refused the anti-pattern explicitly, cited two specific spec rules, then provided the correct alternative as JSX:

```jsx
<Button palette="neutral" style="subtle" type="button">
  Cancel
</Button>
```

It also offered an inferred-intent variant — the user's likely real goal of a prominent submit button paired with a low-emphasis cancel:

```jsx
<>
  <Button palette="neutral" style="subtle" type="button">
    Cancel
  </Button>
  <Button palette="primary" style="solid" type="submit">
    Save changes
  </Button>
</>
```

### Reasoning the model gave

- "Cancel" should never be `palette="primary"` — cited as anti-pattern
- "Cancel" should never be `style="solid"` — cited "highest visual weight, meant for primary/destructive actions"
- Correct pattern: `palette="neutral" style="subtle"`
- Acknowledged the user's possible real intent (theme/blue-ness for submit, not cancel) and offered the corresponding correct pattern

### Grading

| Criterion                                   | Result                                    |
| ------------------------------------------- | ----------------------------------------- |
| Pushed back before building                 | ✅ Refusal stated first, code second      |
| Cited anti-pattern from spec                | ✅ Explicit reference                     |
| Suggested correct alternative               | ✅ `palette="neutral" style="subtle"`     |
| Used `<Button>` as JSX (not raw `<button>`) | ✅                                        |
| Prop names correct (`palette`, `style`)     | ✅ — no `variant` regression              |
| Did not just build what was asked           | ✅                                        |
| Inferred user's likely real intent          | ✅ Bonus — provided dialog footer pattern |

### Findings — the artifact-format hypothesis

**This is the cleanest output of Day 8. The variable that changed: artifact format.**

Test 1: full JSON, simple task — passed
Test 2: full JSON, composition task — failed at component layer
Test 3: full JSON, conventions task — failed at component layer
Test 4: `.llm.md` only, anti-pattern task — passed cleanly

The hypothesis: **per-component `.llm.md` files may produce better adherence than the full `components.json`.** The `.llm.md` format leads with JSX examples and prop tables in a flat structure, which seems to keep the model anchored to the component as a JSX entity. The full JSON buries components beneath top-level `tokens`, which seems to encourage the model to engage with tokens directly and ignore components.

This is a single-test signal, not proof — but it's a strong enough pattern that the v2 iteration of the AI consumption layer should probably treat `.llm.md` as the primary surface and `components.json` as the lookup index, not the other way around.

### Findings — the wins to capture

- **Refusal-first behavior is what design systems should produce.** A button that "always builds what the user asked for" is just GitHub Copilot in a different wrapper. A system that refuses anti-patterns and explains why is _the value proposition._
- **Inferred intent is a bonus but real.** The model proactively offered the likely-actual-need pattern. Real DS users often have a vague mental model and a concrete wrong request — answering both is what good DS docs do.
- **Prop-name regression didn't happen.** In `.llm.md`, props are listed as `palette: neutral | primary | danger`, `style: solid | subtle | ghost` on their own lines. Hard to misread.

### Severity for case study

This is the _positive_ counterweight to Tests 2 and 3. The full case study arc:

1. Test 1: simple task, full JSON → it works (baseline)
2. Test 2: composition, full JSON → component layer fails (problem identified)
3. Test 3: conventions, full JSON → component layer fails differently (problem confirmed)
4. Test 4: anti-pattern, `.llm.md` → works cleanly (mechanism for fix surfaced)
5. Test 5: TBD

If Test 5 corroborates the artifact-format hypothesis, the case study has a _strong_ narrative: "We hypothesized JSON would be the primary AI surface. It wasn't. Per-component markdown is. Here's why."
