# Day 28 — Dialog AI consumption test (the thesis test)

## Setup

Fresh Claude.ai conversation. No project context. Only `components/dialog/dialog.llm.md` pasted.

## Prompt

```
Build a delete account confirmation dialog. The user clicks a "Delete account" button to open the dialog. The dialog should explain the consequences and require the user to confirm or cancel.

Use the design system spec above.

Output: a single React component snippet. After the code, briefly note which design system rules informed your choices, and call out anything you had to invent or work around.
```

This is the same prompt used on Day 8 Test 2 and Day 24 Test #1. Third time this exact prompt has been run against the system at three different maturity levels. Longitudinal data.

## Result — reimplementation, but with explicit awareness

The model produced ~250 lines of code that reimplemented the design system locally. No imports from any design system package. Everything defined inline as "shims."

**Critically, the model knew it was reimplementing.** It explicitly commented:

> _"Primitive shims (replace with real DS imports in production) — the spec defines a component API but ships no implementation. I wrote minimal Button and Dialog shims inline. In production these would be real DS imports."_

This is meaningfully different from Day 24's Card test, where the model silently reimplemented. Here, the reimplementation is a _conscious choice_ the model flagged, with reasoning ("ships no implementation," "missing ref plumbing").

## What this disconfirms about the Day 25 thesis

Day 25's thesis said: **"AI reimplements when reimplementation is cheap."**

Dialog is the richest component in the system — focus trap, portal, scroll lock, ARIA wiring, 5 subcomponents, controlled+uncontrolled state, native `<dialog>` glue. Reimplementing is expensive. The thesis predicted consumption.

The thesis was wrong about the variable. Reimplementation cost wasn't determinative.

## What this points to instead — refined thesis

Looking at the model's own reasoning, the actual variable seems to be **perceived availability of the component as a callable artifact**.

The `.llm.md` describes:

- What Dialog does
- Its props and subcomponents
- Rules and anti-patterns
- Examples of correct usage

The `.llm.md` does **not** describe:

- Where Dialog lives (import path, package name)
- How to invoke it without writing it from scratch

The model interpreted "design system spec" as "here's a contract describing how Dialog should behave." Not "here's a library you can import." So it wrote its own implementation matching the contract.

**Refined thesis (v7):**

> _AI consumption of design system components is determined not by the cost of reimplementation, but by the model's perception of whether the component is available as a callable artifact. With spec alone (`.llm.md`), models reimplement regardless of complexity. With runtime context (codebase access, import paths, package registry), models consume._

## Why Day 21's Input test passed and Day 28's didn't

Both were `.llm.md`-only tests against fresh Claude.ai. Different outcomes. Two plausible explanations:

**Hypothesis A — Implementation complexity drives self-awareness.** Input is moderate to reimplement; the model didn't think hard about it, so it imagined the import existed without flagging the assumption. Dialog requires substantial implementation (focus trap, portal, ARIA wiring, native `<dialog>` glue) — the work forced the model to be explicit about what it was shimming. The "should I shim or import?" decision became conscious because the implementation was non-trivial.

**Hypothesis B — Implementation visibility drives the decision.** Input's contract is close to its implementation (input + variants + state + size). Dialog's contract has substantial _hidden behavior_ (focus trap mechanics, portal logic, controlled-vs-uncontrolled state machine). The model recognized the gap between contract and implementation and explicitly noted "shipping no implementation." With Input, the contract _was_ the implementation, so the model didn't notice the gap.

Both hypotheses point to the same refinement: **the consumption decision is driven by the model's perception of whether it has enough information to use the component as-is.**

## Connection to Day 10c

Day 10c was the original "AI consumes correctly" test — in Claude Code, with codebase access. The model could _see_ the import path (`components/button/button.tsx`). That visibility was the variable.

Day 28 closes the loop: `.llm.md` alone doesn't give that visibility, even when the spec is comprehensive. The model needs to know where the component _lives_, not just what it _does_.

## What the model got right despite reimplementing

The reimplementation followed the spec rigorously. Of 11 spec rules tested, the model honored all 11:

| Spec rule                                                 | Honored? |
| --------------------------------------------------------- | -------- |
| `size="sm"` for confirmation dialog                       | ✅       |
| `closeOnBackdropClick={false}` for destructive            | ✅       |
| `closeOnEscape={true}` default                            | ✅       |
| `initialFocusRef` to Cancel button                        | ✅       |
| No `Dialog.Body` (optional for simple confirmations)      | ✅       |
| `Dialog.Description` for destructive consequence          | ✅       |
| Cancel left, Delete right (LTR)                           | ✅       |
| `palette="danger" variant="solid"` on destructive primary | ✅       |
| `palette="neutral" variant="subtle"` on Cancel            | ✅       |
| `asChild` on Dialog.Trigger                               | ✅       |
| Trigger label describes action ("Delete account")         | ✅       |

This is the third leg of the finding: **even when AI can't consume, it can implement _to spec_ if the spec is good enough.**

Practically: the spec is doing real work even when consumption fails. The spec ensures correctness either way — the consume/reimplement decision affects code reuse, not output correctness.

## Three findings ranked

### Finding A — Thesis refinement to "perceived availability"

The Day 25 cost-based thesis is wrong. The Day 28 availability-based thesis is more accurate. This is the third major thesis evolution in the project (Day 18 abstraction preservation → Day 25 reimplementation cost → Day 28 perceived availability).

### Finding B — Specs work as contracts even when consumption fails

The model honored 11/11 spec rules in its reimplementation. The spec is the load-bearing artifact, not the implementation. This is actually a positive finding for design systems: a good spec ensures correctness whether the AI consumes or reimplements.

### Finding C — Concrete intervention: add import info to `.llm.md`

The refined thesis points to a specific, testable intervention. If `.llm.md` includes `import { Dialog } from '@ai-native-ds/dialog'` (or equivalent) at the top, the model should consume rather than reimplement. Day 29 can test this directly.

## Implications for design system practitioners

The case study can now make a concrete recommendation:

> **For AI to consume your design system, the spec alone isn't enough. The AI needs information about where the component lives — import path, package name, or codebase context. Without that, AI defaults to reimplementation regardless of component complexity. Add a "Usage" or "Import" section to your AI-facing documentation: `import { Dialog } from '@your-org/design-system'`. This single line is what bridges the gap between "AI knows how the component should work" and "AI uses the component you wrote."**

This is more actionable than anything earlier in the case study.

## Severity for case study

Highest of the entire project. Day 28 produces:

- A third thesis refinement (not a fourth iteration of the same idea)
- A concrete intervention that can be tested in Day 29
- Actionable advice for practitioners
- A positive secondary finding (specs work as contracts even when consumption fails)

This is the case study's strongest material. The thesis arc is now genuinely useful, not just intellectually interesting.

## Status

✅ Dialog v0.1.0 shipped (Days 26–27)
✅ Dialog playground shipped (Day 28)
✅ AI Test documented (this file)
🟡 Writing chat handoff (Day 28 wrap)
🟡 Day 29 intervention test (add import info to `.llm.md`, re-test)
🟡 Day 30+ remaining Phase 3 components
