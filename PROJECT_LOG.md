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

Phase 3 progress: Input shipped (Days 19–21), Card spec shipped (Day 22). Card implementation + 5 more components + pipeline hardening still ahead. Pace tracking ~33 hours / 4–6 weeks.

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
- Shadow tokens as primitives in `tokens/core.tokens.json` (sm/md/lg, single-mode at v0.1)
- Component schema does not require `accessibility.role` (Card forced this relaxation — structurally neutral components have no inherent role)
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

Renamed `style` → `variant` system-wide. Schema upgrade for subcomponents. Input spec v0.1.0 with Input.LeadingIcon / Input.TrailingIcon.

### Day 20 ✅ Input implementation

Native `<input>` styled via cva (variant × state × size matrix). Compound subcomponents via children inspection (displayName-based). Dynamic padding adjustment for icon presence. forwardRef, controlled + uncontrolled. Type-checked clean.

### Day 21 ✅ Input playground + first compound component AI test

All variants × states × sizes rendering. AI test passed cleanly: model used Input.LeadingIcon and Input.TrailingIcon as dot-notation subcomponents correctly. Thesis generalizes to compound APIs.

### Day 22 ✅ Card spec + shadow tokens

**What shipped:**

1. **Shadow primitive tokens** in `tokens/core.tokens.json`:
   - `shadow.sm` — subtle floating elements
   - `shadow.md` — raised cards (Card uses this)
   - `shadow.lg` — modals, popovers (Dialog will use this)
   - DTCG-formatted, single-mode at v0.1 (dark-mode-aware shadows deferred)

2. **Schema relaxation:** `accessibility.role` is now optional. Original schema required it because every component up to Day 21 had an inherent ARIA role (button, textbox, status). Card is structurally neutral — its accessibility comes from content within, not the container. Card surfaced the schema's overgeneralization. Relaxing is the right fix; the alternative (forcing `role="region"` on every Card) would pollute the accessibility tree.

3. **Card spec v0.1.0** (`components/card/card.spec.json`):
   - 3 variants: `flat` / `outlined` / `raised`
   - 3 subcomponents: `Card.Header`, `Card.Body`, `Card.Footer`
   - Uniform padding scale (sm/md/lg) on Card itself
   - Structurally neutral — no palette/tone (intent carried by content within)
   - `as` prop for semantic HTML (article, section, aside)
   - Comprehensive rules, examples, anti-patterns

4. **Figma effect styles** added manually:
   - `shadow/sm`, `shadow/md`, `shadow/lg` as Figma effect styles
   - Mirror code-side primitive values
   - **Manual sync** — see "Bidirectional Figma sync" parking-lot item

**Architectural significance:** Card is the second component using the subcomponents pattern. Day 19's schema upgrade pays off again. Pattern proven for Input (Day 20–21), now ready to scale across Card (Day 22), Dialog (Day 24+), Tabs, FormField. The schema relaxation also matters: it removes a hidden constraint that would have blocked container components.

**Artifacts:**

- `tokens/core.tokens.json` — shadow scale added
- `schemas/component.schema.json` — accessibility.role optional
- `components/card/card.spec.json` v0.1.0
- `components/card/card.llm.md` regenerated
- `public/api/components.json` regenerated
- `llms.txt` regenerated (Card listed)
- Figma file — 3 effect styles added manually

---

### Day 23 🟡 Planned — Card implementation

**Goal:** Build Card matching its spec. Compound component pattern — same approach as Input (Day 20).

**Three pieces:**

1. **Card component** (`components/card/card.tsx`)
   - cva config: variant × padding matrix
   - Subcomponents exported as `Card.Header`, `Card.Body`, `Card.Footer` (compound component pattern, displayName-based discrimination)
   - `as` prop forwarding (polymorphic)
   - Estimated ~80–100 lines (simpler than Input — no children inspection complexity since Card just renders subcomponents in flow)

2. **Playground updates**
   - All variants × paddings combinations
   - Composition examples (Header + Body + Footer)
   - Examples with content: cards holding text, cards holding form fields, cards with action footers

3. **AI consumption test (optional)**
   - Verify Card.Header / Body / Footer work in AI consumption like Input.LeadingIcon did Day 21
   - Second compound component test — strengthens or surfaces limits of the thesis

**Time estimate:** ~1–1.5 hr.

---

## Open questions / parking lot

- **🆕 Bidirectional Figma sync (Phase 4 candidate):** Day 22 surfaced this concretely. Code-side tokens are authoritative, but Figma sync is currently one-way and manual. When shadows were added to code, they had to be manually mirrored to Figma effect styles. This works but doesn't scale. Two real solutions exist: (a) write code-to-Figma plugin that reads `tokens/core.tokens.json` and creates Figma effect styles + variables programmatically, or (b) maintain manual parity and accept drift risk. Connects to the bidirectionality question asked earlier — the harder version of the problem is "AI generates new components in both code and Figma simultaneously." Estimated effort if pursued: 1–2 days for one-way code→Figma plugin, ~1 week for full bidirectional sync. Worth flagging in case study Section 8 as a real limitation of the system as currently built.
- **Dark-mode-aware shadows:** v0.1 ships single-mode shadows. Shadows in dark mode typically need higher alpha to remain visible. Could add semantic shadow tokens in `tokens/semantic.dark.tokens.json` later. Low priority — most DSes accept this gap.
- **FormField component:** referenced extensively in Input spec but not built.
- **Multi-framework consumption (Vue, Svelte):** still parked.
- **Scale test:** still parked.
- **Other AI editors:** Cursor, Aider, Copilot. Unverified.
- **Code cleanup:** dead files from earlier iterations.
- **Per-palette focus rings:** still deferred.
- **Outline button variant:** still deferred.

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
- **Subcomponent** — component accessed via dot notation (`Input.LeadingIcon`); first-class system entity
- **Effect style (Figma)** — Figma's term for a styled effect like a drop shadow. Distinct from Figma Variables, which currently don't support shadows. This is why shadow tokens require manual mirroring.
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`
- **Abstraction preservation** — current thesis: AI consumption is governed by the system's canonical abstraction level

---

_Last updated: end of Day 22. Card spec + shadow tokens shipped, schema relaxed for structurally-neutral components, Figma effect styles mirrored manually. Next: Card implementation (Day 23)._
