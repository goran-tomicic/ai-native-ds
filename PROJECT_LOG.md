# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens.

**Final thesis (after Day 18):** AI models preserve the abstraction level their design system presents, regardless of output target. The load-bearing layer isn't runtime alignment — it's abstraction preservation.

**Generalization confirmed Day 21:** the thesis holds for compound APIs. Models correctly use dot-notation subcomponents (`Input.LeadingIcon`) the same way they use top-level components (`<Button>`).

---

## Project arc

| Phase                           | Days           | Focus                                                 | Status         |
| ------------------------------- | -------------- | ----------------------------------------------------- | -------------- |
| Phase 1 — build                 | Days 1–10      | Build the system, run tests, refine thesis            | ✅ Done        |
| Phase 1.5 — refinement          | Days 11, 17–18 | Conventions cleanup, v4 experiment                    | ✅ Done        |
| Phase 2 — case study writing    | Writing chat   | Long-form post + case study page + video              | 🟡 In progress |
| Phase 3 — finish original scope | Days 19+       | Build remaining components from original 10-week plan | 🟡 In progress |

Phase 3 progress: Input shipped (Days 19–21). Card, Dialog, plus 5 more from Weeks 6–7 still ahead. Pace tracking ~33 hours / 4–6 weeks.

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md, static API JSON, MCP server with two render tools
- Single source of truth for conventions: `docs/system-meta.json`
- Component prop naming: `palette` for intent, `variant` for visual treatment
- Subcomponents as first-class entities: `Component.SubcomponentName` (validated working in AI consumption Day 21)
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

Renamed `style` → `variant` system-wide. Schema upgrade for subcomponents. Input spec v0.1.0 with Input.LeadingIcon / Input.TrailingIcon as first-class subcomponents.

### Day 20 ✅ Input implementation

Native `<input>` styled via cva (variant × state × size matrix). Compound subcomponents via children inspection (displayName-based). Dynamic padding adjustment for icon presence. forwardRef, controlled + uncontrolled support. TypeScript-safe compound component pattern. Type-checked clean.

### Day 21 ✅ Input playground + first compound component AI test

**Goal:** Verify Input visually + run first AI consumption test on compound subcomponent pattern.

**Playground integration:**

- Added Input section to `playground/src/App.tsx`
- All variant × state × size combinations rendering
- Leading icon + trailing icon examples
- All states verified: default, error (red border), success (green border), disabled (faded)
- All variants distinct: outlined, filled, ghost
- Dark mode pass-through via CSS variable inheritance
- Visual confirmation: focus ring, error border, success border, disabled appearance, icon positioning all working

**AI consumption test:**

Fresh Claude.ai conversation. Pasted only `components/input/input.llm.md` (no other context). Prompt:

> Build a search bar with a magnifying-glass leading icon and a clear button trailing icon (the clear button should clear the input value). Use only the Input component spec below.

**Result: clean pass.** Model output:

```jsx
<Input
  variant="filled"
  placeholder="Search..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
>
  <Input.LeadingIcon>
    <SearchIcon />
  </Input.LeadingIcon>
  {value && (
    <Input.TrailingIcon interactive>
      <button onClick={() => setValue("")} aria-label="Clear">
        <XIcon />
      </button>
    </Input.TrailingIcon>
  )}
</Input>
```

**What the model got right:**

- Used `Input.LeadingIcon` and `Input.TrailingIcon` as dot-notation subcomponents (the new pattern from Day 19)
- Picked `variant="filled"` for a search bar (cited spec's recommendation)
- Used `interactive` prop on trailing icon (spec required it for clickable elements)
- Added `aria-label="Clear"` (spec required for interactive trailing elements)
- Added conditional rendering on the clear button (`{value && ...}`) — not in the spec, but good UX the model added from training-data conventions
- Recognized leading icon should not be interactive (spec rule against using LeadingIcon as control)
- Cited 5 specific spec rules in reasoning paragraph

**What this validates:**

1. The structured spec format works for compound APIs. The `subcomponents` array added to the schema on Day 19 communicates the API clearly enough that models use it correctly without inventing alternative patterns (props, custom positioning, etc.)

2. The pattern generalizes — Card.Header, Dialog.Footer, Tabs.List will likely work the same way. Day 19's schema upgrade was load-bearing for the next 5+ components.

3. Abstraction preservation thesis (Day 18) extends to compound APIs. Models treat `Input.LeadingIcon` as a callable abstraction the same way they treat `<Button>` — they don't degrade compound APIs to flatter approximations even when the surface is more complex.

4. Architectural consistency held: no regression to `<Input style="filled" />` (the rename from Day 19 propagated cleanly into AI consumption).

**Case study significance:** supporting data point for the post's thesis. Not a five-iteration arc moment, but evidence the thesis scales to compound APIs, which is exactly the kind of validation Section 8 (What's next) or Section 7 (What this means) could use. Handoff sent to writing chat.

**Artifacts:**

- Updated `playground/src/App.tsx` with Input section
- AI consumption test result documented
- Handoff to writing chat with Day 21 finding

---

### Day 22 🟡 Planned — Card component spec

**Goal:** Card spec. Following the Button-style two-day cadence (spec, then implementation).

**Quick scoping likely:**

- Variants (flat / outlined / raised) for visual elevation
- Padding scale (sm / md / lg)
- Composition slots: `Card.Header`, `Card.Body`, `Card.Footer`, `Card.Actions`
- This is the second component using subcomponents — Day 19's schema upgrade pays off again

**Time estimate:** ~45-60 min for spec, Day 23 for implementation.

---

## Open questions / parking lot

- **FormField component:** referenced extensively in Input spec but not built. Day 21+ candidate.
- **Multi-framework consumption (Vue, Svelte):** still parked.
- **Scale test:** still parked.
- **Other AI editors:** Cursor, Aider, Copilot. Unverified.
- **Code cleanup:** dead files from earlier iterations.
- **Per-palette focus rings:** still deferred.
- **Outline button variant:** still deferred.
- **Bidirectionality (code↔Figma):** parked as Phase 4 if it ever happens.

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
- **Subcomponent** — component accessed via dot notation (`Input.LeadingIcon`); first-class system entity from Day 19 onward; AI consumption validated Day 21
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — current thesis: AI consumption is governed by the system's canonical abstraction level

---

_Last updated: end of Day 21. Input fully shipped. Next: Card spec (Day 22)._
