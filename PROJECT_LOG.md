# ai-native-ds — Project Log

> A 10-week experiment building an AI-native design system as a portfolio case study.
>
> **Repo:** https://github.com/goran-tomicic/ai-native-ds
> **Figma:** https://www.figma.com/design/ecFnDpy2pO2WQRBSn9WHco/AI-Native-DS

---

## The premise

Most design systems are documented for humans. But increasingly, the consumer is a program — an LLM generating UI, an agent composing components, a code assistant picking tokens.

**Final thesis (after Day 18):** AI models preserve the abstraction level their design system presents, regardless of output target. The load-bearing layer isn't runtime alignment — it's abstraction preservation. Models prefer to consume the system at its canonical form and let renderers adapt.

---

## Project arc

| Phase                           | Days           | Focus                                                 | Status                        |
| ------------------------------- | -------------- | ----------------------------------------------------- | ----------------------------- |
| Phase 1 — build                 | Days 1–10      | Build the system, run tests, refine thesis            | ✅ Done                       |
| Phase 1.5 — refinement          | Days 11, 17–18 | Conventions cleanup, v4 experiment                    | ✅ Done                       |
| Phase 2 — case study writing    | Writing chat   | Long-form post + case study page + video              | 🟡 In progress (writing chat) |
| Phase 3 — finish original scope | Days 19–~38    | Build remaining components from original 10-week plan | 🟡 Started Day 19             |

Goal of Phase 3: deliver the original 10-week plan honestly. Input → Card → Dialog (named in original Week 3), then 5 more from original Weeks 6–7, then pipeline hardening. ~33 hours of work spread across 4–6 weeks of weekly focused sessions. End state: 11 components, hardened pipeline, polished repo.

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md, static API JSON, MCP server with two render tools
- Single source of truth for conventions: `docs/system-meta.json`
- **Component prop naming:** `palette` for intent, `variant` for visual treatment (renamed from `style` on Day 19)
- Subcomponents as first-class entities: `Component.SubcomponentName` (started with Input.LeadingIcon)
- Public repo, commit history is part of the artifact

### Editorial (writing chat)

- Three formats: long-form post + case study page + 8–12 min video
- Personal site = canonical home
- Audience: hiring managers + DS practitioners (technical)

---

## Daily log

### Days 1–10 ✅ Build phase

Foundations, tokens, components, AI consumption layer, MCP server.

### Day 11 ✅ Case study outline locked

Eight-section structure, ~3000 words, four code snippets. Drafting moved to writing chat.

### Day 17 ✅ Conventions cleanup

Single source of truth at `docs/system-meta.json`. Both `llms.txt` and `components.json` now generated from this file.

### Day 18 ✅ v4 experiment — refined the thesis

Built `render_component_html` alongside `render_component_jsx`. Ran the same prompt in Claude Desktop and Claude Code with both tools available. Model chose JSX in both contexts. Refuted the simple runtime-alignment thesis; refined to abstraction preservation.

### Day 19 ✅ Architectural cleanup + Input spec

Three things shipped in one session:

**1. Prop rename `style` → `variant`** (Day 19a)

After realizing the prop name `style` conflicts with React's native `style` prop on every HTML element, renamed across the system:

- `button.spec.json`, `button.tsx`: prop renamed; cva config and compoundVariants updated
- `badge.spec.json`: deleted the metadata `"style": "subtle"` field (architectural fact, not data)
- `playground/src/App.tsx`, `playground/src/DeleteAccountDialog.tsx`: all `<Button>` usages updated
- `system-meta.json`, `generate-llms-txt.ts`, `token-architecture.md`: terminology updated
- AI consumption surfaces regenerated
- Convention 7 (PROP NAMING disambiguation) removed from `system-meta.json` — no longer relevant
- Conventions array goes 8 → 7

`docs/demo-day/*.md` files preserved as historical record. The case study chat is being notified separately so it can recontextualize the Day 8 finding.

**Engineering rationale:** aligns with industry convention (shadcn, Radix, MUI, Chakra, Mantine). Removes the React `style` prop clash. Removes one of the AI consumption layer's stated failure modes by adopting the convention models default to.

**Case study impact:** the Day 8 finding "model used `variant` instead of `style`" now reframes as "we initially picked an unusual name; AI consumption testing surfaced the cost; we renamed in v3." Same underlying lesson about training-data inertia, cleaner outcome.

**2. Schema upgrade for subcomponents** (Day 19b setup)

`schemas/component.schema.json` extended with optional `subcomponents` field. Each subcomponent has its own name, description, props, rules, and examples — same shape as the parent component's contract, scoped one level deeper. Backward-compatible: existing specs without subcomponents validate as before.

Architectural significance: this establishes the _Component.SubcomponentName_ pattern as a first-class system convention. Card, Dialog, Tabs, FormField will all use it.

**3. Input spec v0.1.0** (Day 19b)

`components/input/input.spec.json` shipped:

- Text-only at v0.1 (other input types deferred)
- Two prop axes: `state` (default/error/success) for validation, `variant` (outlined/filled/ghost) for visual treatment
- Three sizes (sm/md/lg)
- Subcomponents: `Input.LeadingIcon`, `Input.TrailingIcon`
- No label/helper/error props — composes externally with FormField (Day 21+)
- Full a11y, composition rules, anti-patterns, examples

`scripts/generate-llm-docs.ts` updated to emit structured `## Subcomponents` section in `.llm.md` output. AI consumption surfaces regenerated.

**Day 19 artifacts:**

- Renamed `style` → `variant` system-wide
- `schemas/component.schema.json` v2 with subcomponents support
- `components/input/input.spec.json` v0.1.0
- `scripts/generate-llm-docs.ts` updated for subcomponents
- 3 commits pushed (rename, convention 7 removal, Input + schema)

---

### Day 20 🟡 Planned — Input implementation

**Goal:** Build the Input component matching its spec. Subcomponents (Input.LeadingIcon, Input.TrailingIcon) ship in the same day.

**Three pieces:**

1. **Input component** (`components/input/input.tsx`)
   - cva config: state × variant × size matrix
   - Subcomponents exported as `Input.LeadingIcon`, `Input.TrailingIcon` (compound component pattern)
   - State coverage: focus, hover, disabled, readonly, error, success
   - Composes with FormField via children/parent contract
   - Estimated ~120-150 lines

2. **Playground updates**
   - All variant × state combinations rendered
   - Examples with leading/trailing icons
   - Both modes (light + dark)
   - Real interaction: focus state, error state demo

3. **AI consumption test (optional, ~15 min)**
   - Ask a fresh Claude.ai conversation to use Input correctly
   - Particularly: does it use `Input.LeadingIcon` correctly, or invent something?
   - First test of subcomponent consumption — case study material if interesting

**Time estimate:** 1.5–2 hr.

---

## Open questions / parking lot

- **FormField component:** referenced extensively in Input spec but not built. Day 21 candidate.
- **Multi-framework consumption (Vue, Svelte):** still parked. Future experiment.
- **Scale test:** still parked.
- **Other AI editors:** Cursor, Aider, Copilot. Unverified.
- **Code cleanup:** dead files from earlier iterations. Diagnostic commands ready.
- **Per-palette focus rings:** still deferred.
- **Outline button variant:** still deferred (note: this is "outline" the _visual variant_, not the prop name — the prop name is now `variant`, not `style`).
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
- **Variant (component-level)** — visual treatment a component supports (renamed from `style` on Day 19)
- **State modifier** — token suffix (`-hover`, `-active`)
- **Subcomponent** — component accessed via dot notation (`Input.LeadingIcon`); first-class system entity from Day 19 onward
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`
- **Runtime alignment** — earlier thesis; refined by Day 18
- **Abstraction preservation** — current thesis: AI consumption is governed by the system's canonical abstraction level

---

_Last updated: end of Day 19. Phase 3 underway. Next session: Input implementation (Day 20)._
