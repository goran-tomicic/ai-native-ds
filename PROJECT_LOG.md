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

| Phase                        | Days                      | Focus                                               | Status                        |
| ---------------------------- | ------------------------- | --------------------------------------------------- | ----------------------------- |
| Phase 1 — build              | Days 1–10                 | Build the system, run tests, refine thesis          | ✅ Done                       |
| Phase 1.5 — refinement       | Days 11, 17–18            | Conventions cleanup, v4 experiment                  | ✅ Done                       |
| Phase 2 — case study writing | Days 12–16 (writing chat) | Long-form post + case study page + video            | 🟡 In progress (writing chat) |
| Phase 3 — possible future    | TBD                       | Multi-framework (Vue), Input component, scale tests | ⚪ Parked                     |

---

## Locked-in decisions

### Technical

- React + TypeScript + Tailwind v3.4 + cva + Radix primitives
- DTCG token format, mode-aware via Style Dictionary
- Three-layer token architecture (core + semantic/common + semantic/palette)
- Disabled state via opacity + pointer-events, palette-agnostic
- AI consumption surfaces: llms.txt, .llm.md, static API JSON, MCP server with two render tools
- Single source of truth for conventions: `docs/system-meta.json`
- Public repo, commit history is part of the artifact

### Editorial (writing chat)

- Three formats: long-form post + case study page + 8–12 min video
- Personal site = canonical home
- Audience: hiring managers + DS practitioners (technical)

---

## Daily log

### Days 1–10 ✅ Build phase

Foundations, tokens, components, AI consumption layer, MCP server. Five tests across four iterations of the consumption layer revealed that documentation alone, then packaging alone, were insufficient.

### Day 11 ✅ Case study outline locked

Eight-section structure, ~3000 words, four code snippets, MCP wiring anecdote in Section 6. Drafting moved to writing chat.

### Day 17 ✅ Conventions cleanup

Single source of truth at `docs/system-meta.json`. Both `llms.txt` and `components.json` now generated from this file. Pipeline order: tokens → docs:llm → docs:llms → api:build. Eliminates drift risk from Day 9.

**Artifacts:** `docs/system-meta.json`, `scripts/generate-llms-txt.ts`, updates to `scripts/build-api.ts` and `package.json`.

### Day 18 ✅ v4 experiment — refined the thesis

**Goal:** Test the runtime-alignment thesis cleanly by adding a runtime-appropriate tool to the MCP server.

**Built:**

- `mcp-server/src/render-html.ts` — component-specific HTML renderers (Button, Badge, Spinner) using CSS variables
- Renamed `render_component` → `render_component_jsx`
- Added `render_component_html` as a new tool
- Both tools share prop validation logic

**Hypothesis:** In Claude Desktop's HTML artifact context, the model would call `render_component_html`. In Claude Code's `.tsx` context, it would call `render_component_jsx`.

**Result:** The model called `render_component_jsx` in **both** contexts. In Claude Desktop, three calls (two Buttons, one Badge) resulted in an HTML artifact assembled from JSX tool outputs. In Claude Code, it bypassed MCP and read the codebase directly.

**Refined thesis:**

> AI models preserve the abstraction level their design system presents, regardless of output target. The model wants to "use the system." It doesn't want to be a renderer. The load-bearing layer is abstraction preservation, not runtime alignment.

This is a _better_ finding than v4-as-confirmation would have been. The case study now has a five-iteration thesis arc resolving in a non-obvious result.

**Artifacts:**

- `mcp-server/src/render-html.ts` (component HTML renderers)
- Updated `mcp-server/src/server.ts` with renamed + new tools
- Day 18 finding appended to `docs/ai-demo-day-8.md`
- Handoff document for writing chat with outline updates

**Engineering note flagged:**
Building `render_component_html` was ~150 lines of component-specific code, vs. ~30 lines for the generic JSX renderer. Forcing HTML output forces the system to also be the renderer. After Day 18, this work appears to have been unnecessary — the model didn't choose the HTML tool. Worth keeping in the codebase as evidence of the experiment, not as a primary tool.

---

## Open questions / parking lot

- **Multi-framework consumption (Vue, Svelte):** Day 18 reveals that abstraction preservation matters more than runtime matching. Does this generalize across frameworks? A Vue test would either confirm (Vue DS works the same with Vue tools) or complicate (each framework's "canonical form" has different consumption properties). Genuine future experiment.
- **Scale test:** Three components is small. What happens at 50? Does abstraction preservation hold when the spec surface is much larger? Open question.
- **Other AI editors:** Cursor, Aider, Copilot, Continue. The runtime-as-codebase finding from Day 10c/18 should generalize, but unverified.
- **Code cleanup:** Dead files and stale references from earlier iterations. Diagnostic commands ready but deferred. Pay down before scaling.
- **Conventions in spec.json:** `system-meta.json` is the source for system-level conventions. Per-component conventions still live in spec files. Is this the right split, or should it be flat? Future architecture question.
- **Per-palette focus rings:** still deferred.
- **Outline button style:** still deferred.

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
- **Style (component-level)** — visual treatment (solid, subtle, ghost)
- **State modifier** — token suffix (`-hover`, `-active`)
- **`.llm.md`** — per-component AI-optimized documentation
- **Static API** — `public/api/components.json`
- **Runtime alignment** — earlier thesis: component + tool + output target sharing runtime. Refined by Day 18.
- **Abstraction preservation** — current thesis: AI consumption is governed by the system's canonical abstraction level, not the output target's runtime requirements

---

_Last updated: end of Day 18. Build phase complete. Case study writing in progress (separate chat)._
