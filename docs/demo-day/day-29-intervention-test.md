# Day 29 — Intervention test (perceived-availability thesis confirmed)

## The hypothesis being tested

From Day 28's finding:

> _AI consumption of design system components is determined not by the cost of reimplementation, but by the model's perception of whether the component is available as a callable artifact. With spec alone (`.llm.md`), models reimplement regardless of complexity. With runtime context (codebase access, import paths, package registry), models consume._

Day 28 observed the failure (reimplementation) and identified the variable (perceived availability). Day 29's intervention: change the variable and observe whether behavior changes.

## The intervention

Added an `## Import` section to `scripts/generate-llm-docs.ts`. After regeneration, every component's `.llm.md` now starts (after title and description) with:

````markdown
## Import

```jsx
import { Dialog } from "@ai-native-ds/dialog";
```
````

This component is part of the ai-native-ds package and is available as a callable React component.

````

**Critically, the intervention is factual, not prescriptive.** It states availability without instructing the model to use the component or not reimplement. If consumption appears with just this signal, the perceived-availability thesis is confirmed at the strongest possible level.

The intervention applies to all components, but for Day 29 only Dialog is being re-tested. (Other components can be verified in future sessions.)

## Experimental conditions

- **Same model:** Fresh Claude.ai conversation
- **Same prompt:** Exact Day 28 prompt (destructive confirmation dialog)
- **Same context:** Only `components/dialog/dialog.llm.md` pasted
- **Only variable changed:** The `## Import` section added to the spec

Pre-registered prediction (from Day 28's analysis): with the import information visible, the model should consume Dialog via the import rather than reimplement.

## Result — clean confirmation

The model output ~30 lines composing the existing components:

```jsx
import { useRef } from "react";
import { Dialog } from "@ai-native-ds/dialog";
import { Button } from "@ai-native-ds/button";

export function DeleteAccountDialog() {
  const cancelRef = useRef(null);

  return (
    <Dialog
      size="sm"
      closeOnBackdropClick={false}
      initialFocusRef={cancelRef}
    >
      <Dialog.Trigger asChild>
        <Button palette="danger" variant="solid">Delete account</Button>
      </Dialog.Trigger>

      <Dialog.Title>Delete your account?</Dialog.Title>

      <Dialog.Description>
        This action is permanent and cannot be undone. Your projects, files,
        and collaborator access will be permanently removed.
      </Dialog.Description>

      <Dialog.Footer>
        <Button ref={cancelRef} palette="neutral" variant="subtle">
          Cancel
        </Button>
        <Button palette="danger" variant="solid">
          Delete account
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
````

**No reimplementation. No shims. No local Dialog or Button definitions. The components are imported and used as-is.**

## Day 28 vs Day 29 — single-variable comparison

| Variable               | Day 28                    | Day 29                                  |
| ---------------------- | ------------------------- | --------------------------------------- |
| Prompt                 | Same                      | Same                                    |
| Model                  | Fresh Claude.ai           | Fresh Claude.ai                         |
| Context                | `dialog.llm.md` only      | `dialog.llm.md` only (with `## Import`) |
| **Intervention**       | **None**                  | **`## Import` section added**           |
| Output length          | ~250 lines                | ~30 lines                               |
| Local reimplementation | Yes (with shim awareness) | No                                      |
| Component imports      | None                      | Both Dialog and Button                  |
| Spec adherence         | 11/11 rules honored       | 9/9 rules honored                       |
| Output correctness     | Correct per spec          | Correct per spec                        |

The intervention is _literally one section_ in one file. The behavior change is _complete_. Same prompt, same model, same model context — one new section of factual import info produces a total shift from "rebuild the system locally" to "use the system as imported."

## What the model's reasoning reveals

Several details in the model's output strengthen the finding:

### Pattern inference for missing import info

The model wrote:

> _"`Button` import path (`@ai-native-ds/button`) — the Dialog spec doesn't specify where `Button` lives. Used a reasonable convention; swap to the actual package path as needed."_

The Dialog spec showed `import { Dialog } from '@ai-native-ds/dialog'`. The model:

1. Treated this as authoritative
2. Recognized Button needed similar import
3. Extrapolated the pattern (`@ai-native-ds/{component}`)
4. Flagged the inference explicitly

The model is treating import format as a _system convention_ it can extrapolate from. **Once it sees the system is importable, it assumes consistency.**

### Awareness of integration concerns

The model flagged:

> _"`ref` forwarding on `Button` — the spec mentions `initialFocusRef` but doesn't confirm that `Button` forwards refs."_

This is consumption thinking — the model is reasoning about whether two components will compose correctly. Not implementation thinking. The mode has shifted entirely.

### No mention of shims, workarounds, or contracts-without-implementation

Compare to Day 28's reasoning:

> Day 28: _"Primitive shims (replace with real DS imports in production)... the spec defines a component API but ships no implementation."_

> Day 29: _"What I had to invent: Button import path... ref forwarding on Button..."_

In Day 28, the model talked about _implementing_. In Day 29, the model talks about _consuming_. The vocabulary shift is total. The model isn't trying to reimplement; it's trying to compose.

## Why this is the cleanest experimental result of the project

Most experimental work in this project has been observational — run a test, see what happens, refine the thesis. Day 29 is **interventional** — form a hypothesis, design a fix, test the fix, observe the predicted outcome.

The experimental design has the structure that makes results trustworthy:

- **Pre-registered hypothesis** (Day 28 analysis predicted the outcome)
- **Single variable changed** (only the `## Import` section)
- **All other conditions held constant** (same prompt, same model, same context format)
- **Clear binary observation** (consumption appeared or it didn't)
- **Predicted outcome confirmed**

This is closer to proper experimental method than anything earlier in the project. The case study can stand behind this finding with substantially higher confidence than any prior claim.

## Final thesis (v8)

> _AI consumption of design system components is determined by perceived availability of the component as a callable artifact. Documentation alone (`.llm.md` with spec) is insufficient — the model treats it as a contract to implement, not a library to consume. Adding a single import statement to the documentation changes the signal: the model treats the component as available and uses it via import rather than rebuilding it. This intervention is confirmed by experiment: same prompt, same model, single variable change, dramatic behavioral shift from reimplementation (~250 lines) to consumption (~30 lines)._

## Implications for design system practitioners

The case study can now make an empirically-grounded recommendation:

> **"Add an `## Import` section to every `.llm.md` file in your AI-facing documentation. Format: a single import statement showing the canonical import path. State factually that the component is available as a callable artifact. Don't add prescriptive language ("don't reimplement") — the import signal alone is sufficient. I tested this: same prompt run against the same model, with and without the `## Import` section, produced 250 lines of local reimplementation in one case and 30 lines of correct consumption in the other. The intervention is one section of one file. The effect is total."**

This advice is concrete, testable, and reproducible. Any DS practitioner reading the case study can apply it to their own system and observe the result.

## What this doesn't yet test

Day 29's intervention was applied to Dialog only (in terms of running the test). The generator added the section to all components, but only Dialog was re-tested. Open questions:

1. **Does it generalize to Card?** Day 24's failure was with Card. Re-running the Card test with the intervention would confirm the thesis works on a previously-reimplemented component.

2. **Does it generalize to all `.llm.md` files in production?** The intervention is one line per file. Easy to apply system-wide.

3. **Does it survive when import path is "fake"?** The package `@ai-native-ds/dialog` doesn't exist on npm. The model trusted the signal anyway. If the model were trained to verify package existence, the intervention might fail. Worth noting but probably not testable directly.

These are good Day 30+ follow-ups but don't change the core finding.

## Severity for case study

The most consequential test result of the project, by a wide margin. Day 28's finding identified the thesis; Day 29 confirmed it by experimental intervention. The case study now has empirically-grounded advice rather than observational claims.

## Status

✅ Day 28 baseline observation
✅ Day 29 intervention designed (`## Import` section in generator)
✅ Day 29 intervention executed (generator updated, `.llm.md` files regenerated)
✅ Day 29 intervention tested (same prompt, same model, same conditions except intervention)
✅ Result confirmed thesis cleanly
🟡 Writing chat handoff covering Day 28-29 arc (next)
🟡 Day 30+: continued component work or generalization tests
