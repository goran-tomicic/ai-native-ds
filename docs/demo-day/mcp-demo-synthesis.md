---

# Day 10 — packaging iteration

## Setup

Built an MCP server (`mcp-server/`) exposing the design system as three tools:

- `list_components()` — inventory
- `get_component(name)` — full spec lookup
- `render_component(name, props, children)` — validated JSX rendering

Connected to Claude Desktop via stdio with absolute paths to node and the tsx loader. Wiring took longer than building — pnpm stdout pollution, macOS Gatekeeper, NODE_PATH resolution, and Settings UI staleness each caused a failed connect before the server came online clean. Worth flagging for the case study: MCP integration on macOS hits friction points that aren't documented as a unit anywhere.

## Day 10b — Claude Desktop demo

**Same prompt as Day 8 Test 2 and Day 9 Test 2 v2.** No JSON pasted — the model discovers the system entirely through MCP tools.

### Tool calls observed

- `list_components()` — confirmed Badge, Button, Spinner inventory
- `get_component("Button")` — likely; reasoning cites Button spec details
- Possibly `get_component("Badge")` — used Badge tone correctly
- **`render_component` — not used.** No JSX strings from the tool appear in the output.

### What the model produced

A complete dialog rendered as an **HTML artifact** (`.html` file) with inline `<style>` and `<script>` blocks. Two raw `<button>` elements with hand-written CSS class names encoding the Button API:

```html
<button class="ds-btn ds-btn-md ds-btn-neutral-subtle">Cancel</button>
<button class="ds-btn ds-btn-md ds-btn-danger-solid">Delete my account</button>
```

Custom dialog wrapper, custom warning icon, custom badge styling, custom input. CSS variables referenced for tokens. Citations of conventions correct and detailed in the reasoning paragraph.

### Grading vs Day 8 v1 and Day 9 v2

| Criterion                        | Day 8 v1         | Day 9 v2                         | Day 10b MCP                        |
| -------------------------------- | ---------------- | -------------------------------- | ---------------------------------- |
| Used `<Button>` as JSX           | ❌ Reimplemented | ❌ `.btn--style-palette` classes | ❌ `.ds-btn-style-palette` classes |
| Prop names correct               | ❌ `variant`     | ✅ encoded in classes            | ✅ encoded in classes              |
| CSS variables for tokens         | ❌ inline hex    | ✅ throughout                    | ✅ throughout                      |
| Cited specific conventions       | ✅               | ✅                               | ✅                                 |
| Composition right                | ✅               | ✅                               | ✅                                 |
| **Used `render_component` tool** | n/a              | n/a                              | ❌                                 |

Same root failure as Days 8 and 9. Different surface. Same outcome: the model encodes the DS API as CSS class names and writes raw HTML/JSX.

### What this revealed

The Day 9 hypothesis predicted MCP would fix component bypass. It didn't. Across three iterations with three radically different consumption surfaces — full JSON, tighter JSON + rules, callable MCP tools — the model converged on the same pattern.

The mechanism isn't artifact format or rule clarity. It's not packaging either, by itself.

The output context Claude Desktop renders — an HTML artifact iframe — has no React runtime. `render_component` returns a JSX string. JSX strings are dead text in an HTML iframe. So the model wrote HTML directly, replicating the Button API in CSS classes because that's what HTML can express.

This refined the thesis again:

> Even when components are callable via MCP, models will bypass them if the output target doesn't accept the component's runtime form. Documentation, packaging, and runtime must align.

## Day 10c — same prompt, Claude Code

To test the runtime-alignment hypothesis: same MCP server, same prompt, but in **Claude Code editing a real `.tsx` file in the repo**.

### Tool calls observed

The model used Claude Code's native `Explore`, `Read`, and `Write` tools across 29 tool invocations and ~52k tokens before producing the file. It read the actual codebase — `components/button/button.tsx`, the spec files, the playground — to understand what existed. MCP tools were used too, but the dominant pattern was reading the real repo, not querying the MCP server.

### What the model produced

A real React component imported as JSX:

```tsx
import { Button } from '../../components/button/button'

// ... dialog markup ...

<Button palette="neutral" style="subtle" onClick={onCancel} disabled={isDeleting}>
  Cancel
</Button>
<Button palette="danger" style="solid" onClick={handleConfirm} loading={isDeleting}>
  Delete account
</Button>
```

**This is the first time across four iterations the model used the actual component.** Real `<Button>` invocations. Correct prop names. Correct values. Real import path (`../../components/button/button`) the model discovered by reading the repo. Real semantic Tailwind utility classes (`bg-surface-base`, `text-fg-strong`, `bg-danger-subtle`) that consume the token layer correctly.

The reasoning paragraph cites the most thorough set of conventions of any iteration: Button spec rules, semantic token usage, CVA pattern conformance, loading state via the prop, honest list of what was invented (backdrop, modal positioning, shadow, async pattern).

### Grading vs all prior iterations

| Iteration   | Context         | Output target           | Used `<Button>` |
| ----------- | --------------- | ----------------------- | --------------- |
| Day 8 v1    | claude.ai chat  | JSX-as-string in chat   | ❌              |
| Day 9 v2    | claude.ai chat  | JSX-as-string in chat   | ❌              |
| Day 10b     | Claude Desktop  | HTML artifact iframe    | ❌              |
| **Day 10c** | **Claude Code** | **`.tsx` file in repo** | **✅**          |

The variable that changed: the runtime context.

### What this confirmed

Days 8, 9, and 10b all asked for "a React component," but the output target was a chat string or an HTML iframe — neither of which executes JSX. From the model's perspective, that's still a "describe a component" task. The chat is a documentation surface; the model wrote what looks like documentation, encoding the API as CSS classes.

Day 10c is different in one critical way: the file the model is editing **will be imported, compiled by TypeScript, and run by React.** JSX isn't a string; it's executable. The model imported `Button` from a relative path because that's what makes the file work.

A finding within the finding: **when the codebase itself is available to read, MCP tools become secondary.** The model preferred reading `components/button/button.tsx` directly over calling `get_component("Button")`. The MCP server is most useful when the codebase isn't available. When it is, the codebase is the better surface.

## The four-iteration thesis evolution

The arc through Days 7–10 reads as a continuous refinement:

- **v1 thesis:** Documentation is the AI consumption surface
- **v1 finding:** Documentation alone fails at component consumption
- **v2 thesis:** Better documentation will fix it
- **v2 finding:** Tighter rules don't change consumption behavior
- **v3 thesis:** Packaging (callable MCP tools) will fix component consumption
- **v3 finding:** Packaging alone insufficient — model still bypasses components in wrong runtime
- **v4 thesis:** AI-native is a runtime alignment problem — documentation, packaging, and runtime must align
- **v4 finding:** Confirmed in Day 10c. The model used `<Button>` as JSX as soon as the runtime accepted JSX execution.

Final thesis:

> AI-native design systems require all three layers to function: documentation describes the system, packaging makes components callable, and runtime alignment makes them executable. Failure in any one layer — even with the other two solid — produces the bypass behavior we observed across Days 8, 9, and 10b.

## Severity for case study

This is the strongest finding of the project. Four iterations, three thesis refinements, one clean confirmation. The arc has more intellectual content than most published design system case studies. The honest framing — _we hypothesized X, tested it, found something deeper, refined the thesis, kept testing_ — is a credibility multiplier.

Open question still parked: was Day 10b's HTML artifact behavior really about runtime, or did Claude Desktop's artifact rendering specifically push the model toward HTML? A v5 test could disambiguate by running the same prompt in Claude Desktop _with the artifact mode disabled_ (text-only output). Worth noting as future work but not blocking the case study.
