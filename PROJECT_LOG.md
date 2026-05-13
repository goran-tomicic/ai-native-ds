# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens.

**Final thesis (Day 29, experimentally confirmed):** AI consumption of design system components is determined by perceived availability of the component as a callable artifact. Documentation alone (`.llm.md` with spec) is insufficient — the model treats it as a contract to implement. Adding a single import statement to the documentation changes the signal: the model treats the component as available and uses it via import rather than rebuilding it. Confirmed by single-variable experimental intervention.

---

## Project arc

| Phase                                                 | Days           | Focus                                                  | Status         |
| ----------------------------------------------------- | -------------- | ------------------------------------------------------ | -------------- |
| Phase 1 — build                                       | Days 1–10      | Build the system, run tests, refine thesis             | ✅ Done        |
| Phase 1.5 — refinement                                | Days 11, 17–18 | Conventions cleanup, v4 experiment                     | ✅ Done        |
| Phase 2 — case study writing                          | Writing chat   | Long-form post + case study page + video               | 🟡 In progress |
| Phase 3 — finish original scope + thesis confirmation | Days 19+       | Build remaining components + experimental confirmation | 🟡 In progress |

Phase 3 progress: 6 of 11 originally-planned components fully shipped. The thesis test was concluded Day 28-29 with experimental confirmation. Phase 3 remaining: 4-5 more components for original scope, optional intervention generalization tests, pipeline hardening.

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
- **`.llm.md` files include an `## Import` section as the second section** (Day 29 confirmed this is the critical signal)
- Public repo, commit history is part of the artifact

### Editorial (writing chat)

- Three formats: long-form post + case study page + 8–12 min video
- Personal site = canonical home
- Audience: hiring managers + DS practitioners (technical)

---

## Daily log

### Days 1–18 ✅ Build phase + thesis refinement

Foundations, tokens, components (Badge, Button, Spinner), AI consumption layer, MCP server, four-iteration thesis arc culminating in abstraction-preservation finding.

### Day 19 ✅ Architectural cleanup + Input spec

### Day 20 ✅ Input implementation

### Day 21 ✅ Input playground + first compound component AI test

AI test passed; compound API consumption confirmed.

### Day 22 ✅ Card spec + schema relaxation

### Day 23 ✅ Card implementation

### Day 24 ✅ Card playground + AI Test #1 + shadow pipeline fix

AI Test #1 surfaced reimplementation regression.

### Day 25 ✅ AI Test #2 + writing chat handoff

Reimplementation pattern confirmed at scale. Thesis refined: reimplementation-cost boundary hypothesis.

### Day 26 ✅ Dialog spec

Most complex spec in system. Native `<dialog>` foundation.

### Day 27 ✅ Dialog implementation

Context-based ARIA wiring established as new pattern.

### Day 28 ✅ Dialog playground + AI test

Dialog reimplemented despite high complexity. Day 25 thesis refuted. Refined to perceived-availability thesis. Concrete intervention identified.

### Day 29 ✅ Intervention test — perceived-availability thesis confirmed

**The most consequential single experiment of the project.**

**The intervention:**

Added `## Import` section to `scripts/generate-llm-docs.ts`. Every component's `.llm.md` now includes (after title/description, before usage):

````markdown
## Import

```jsx
import { Dialog } from "@ai-native-ds/dialog";
```
````

This component is part of the ai-native-ds package and is available as a callable React component.

```

**Critical design choice:** factual framing only, no prescriptive language. If consumption appeared with just this signal, the thesis would be confirmed at the strongest possible level.

**The test:**

Fresh Claude.ai conversation. Same exact Day 28 prompt (destructive confirmation dialog). Only `dialog.llm.md` pasted (with the new Import section). No other context.

**The result:**

Clean consumption. Model output ~30 lines using `import { Dialog }` and `import { Button }`. No reimplementation. No shims. Components used as imported.

**Day 28 vs Day 29 comparison:**

| Variable | Day 28 | Day 29 |
|---|---|---|
| Prompt | Same | Same |
| Model | Fresh Claude.ai | Fresh Claude.ai |
| Context | `dialog.llm.md` only | `dialog.llm.md` only (with `## Import`) |
| Output length | ~250 lines | ~30 lines |
| Reimplementation | Yes | No |
| Component imports | None | Both Dialog and Button |
| Spec adherence | 11/11 rules | 9/9 rules |
| Output correctness | Correct per spec | Correct per spec |

Single variable changed. Behavior change is complete. ~88% reduction in output size. The intervention is one section of one file. The effect is total.

**Notable secondary finding — pattern extrapolation:**

The model output imported Button as `'@ai-native-ds/button'`, extrapolating the pattern from Dialog's import (`'@ai-native-ds/dialog'`). The model treated the import format as a system-wide convention it could infer. This suggests:

1. The intervention is more efficient than expected (one example signals the system pattern)
2. The model reasons about the design system at the system level, not just component-by-component
3. For safety, the intervention should still be applied to every component (don't rely on extrapolation)

**Final thesis (v8):**

> *AI consumption of design system components is determined by perceived availability of the component as a callable artifact. Documentation alone is insufficient — the model treats it as a contract to implement, not a library to consume. Adding a single import statement changes the signal: the model treats the component as available and uses it via import. Confirmed by experimental intervention: same prompt, same model, single variable change, dramatic behavioral shift from reimplementation to consumption.*

**The thesis arc is now complete:**

- v1 Documentation alone insufficient (Day 8)
- v2 Better documentation insufficient (Day 9)
- v3 Packaging insufficient in mismatched runtime (Day 10b)
- v4 Runtime alignment (Day 10c) — partial
- v5 Abstraction preservation (Day 18)
- v6 Reimplementation-cost boundary (Days 24-25)
- v7 Perceived availability of callable artifact (Day 28 — hypothesis)
- v8 Perceived availability signaled by import information (Day 29 — confirmed by intervention)

The arc has proper experimental structure: observation → refinement → ... → hypothesis → intervention → confirmation. The case study now has empirically-grounded advice, not just observational claims.

**Practitioner advice now possible:**

> "Add an `## Import` section to every `.llm.md` file in your AI-facing documentation. Format: single import statement showing the canonical import path. State factually that the component is available as a callable artifact. Don't add prescriptive language — the import signal alone is sufficient."

**Artifacts:**
- `scripts/generate-llm-docs.ts` — `## Import` section added to all generated `.llm.md` files
- `components/*/*.llm.md` — regenerated with Import sections
- `docs/demo-day/day-29-intervention-test.md` — full analysis with single-variable comparison
- Substantial handoff sent to writing chat (Section 5, 7, 8 updates)

**Severity for case study:** Highest of the entire project. Day 28 identified the hypothesis; Day 29 confirmed it. The thesis arc has structure: observation → hypothesis → intervention → confirmation. This is closer to proper experimental method than any prior beat. Concrete, empirically-grounded advice can ship in the case study.

---

### Day 30 🟡 Planned — direction TBD

**Two real paths to choose between:**

**Path A — Continue thesis generalization (~30-60 min)**

Test the Day 29 intervention on a previously-failed component. Card (Day 24) is the obvious candidate — re-running the Card test with the intervention would confirm the thesis works on a component where reimplementation was the original failure mode, not just where the hypothesis was formed.

Pros: strongest possible empirical foundation, additional Section 5 evidence.
Cons: not strictly necessary; Day 29's Dialog result is already a clean confirmation.

**Path B — Continue building toward original 10-week scope (~60-120 min)**

Pick next component from the original Weeks 6-7 list. Options:
- Checkbox + Radio + Switch (form controls, ~6 hr total)
- Tabs (~3 hr)
- Tooltip (~2 hr)
- Toast (would close the Day 8 Test 5 gap — interesting case study tie-in)
- Select (form completion pair with Input)

Pros: makes progress toward original scope; project log shows 6/11 components shipped, 4-5 more to go.
Cons: doesn't strengthen the thesis arc further (which is already strong).

Decision next session based on energy and priority. The thesis work is complete; the component work is incremental.

---

## Open questions / parking lot

- **Generalization of Day 29 intervention:** Card re-test queued (Path A above). Other components untested with intervention.
- **MCP-mediated context:** Day 18 showed Claude Desktop behavior differs from Claude.ai chat. Intervention should be re-tested in MCP context.
- **Real vs. plausible import paths:** Package `@ai-native-ds/dialog` doesn't exist on npm. Model trusted the signal. Worth noting in case study.
- **Bidirectional Figma sync (Phase 4 candidate):** flagged Day 22, concretized Day 24.
- **Popover (non-modal):** deferred from Day 26.
- **Dark-mode-aware shadows:** v0.1 ships single-mode.
- **FormField component:** referenced in Input spec, not built.
- **Multi-framework consumption (Vue, Svelte):** still parked.
- **Other AI editors:** Cursor, Aider, Copilot.
- **Code cleanup:** dead files from earlier iterations.

---

## Glossary

- **DTCG** — Design Tokens Community Group format
- **Spec** — `component.spec.json` file; machine-readable contract
- **MCP** — Model Context Protocol; Anthropic's standard for exposing tools to LLMs
- **cva** — class-variance-authority
- **Style Dictionary** — Amazon's token JSON build tool
- **Palette** — named color treatment
- **Common** — UI infrastructure tokens
- **Mode** — light or dark theme
- **Variant (component-level)** — visual treatment a component supports
- **State modifier** — token suffix (`-hover`, `-active`)
- **Subcomponent** — component accessed via dot notation; first-class system entity
- **Compound component pattern** — React pattern; two flavors used: children-inspection (Input, Card) and context-based (Dialog)
- **Effect style (Figma)** — Figma's term for styled effects like drop shadows
- **AUTHORED_CORE_TOKENS** — block in `scripts/normalize-tokens.ts` for tokens Figma can't express
- **`.llm.md`** — per-component AI-optimized documentation, structured for LLM consumption
- **`## Import` section** — required section in all `.llm.md` files as of Day 29. Provides the canonical import statement, signaling the component is available as a callable artifact
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — early thesis (Day 18). Refined Days 24-25.
- **Reimplementation cost** — Day 25 thesis. Refuted Day 28.
- **Perceived availability** — Day 28 thesis. Confirmed by Day 29 intervention.
- **Intervention test** — Day 29 experimental method: change a single variable in the spec, observe behavior change. Proper experimental design with pre-registered hypothesis and single-variable manipulation.
- **DialogContext** — React Context shared between Dialog and its subcomponents

---

_Last updated: end of Day 29. Thesis confirmed by experimental intervention. The case study has its empirically-grounded conclusion. Phase 3 component work continues from Day 30._
```
