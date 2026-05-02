## Day 10 — MCP demo

**Setup:** Three MCP tools (`list_components`, `get_component`, `render_component`) connected to Claude Desktop via stdio. Server validated and running.

**Prompt:** Identical to Day 8 Test 2 (delete account confirmation dialog). No JSON pasted — model discovers system via MCP tools only.

### What the model produced

A complete dialog rendered as an HTML artifact (`.html` file with inline `<style>` and `<script>` blocks). Two raw `<button>` elements with hand-written CSS class names encoding the Button API as `.ds-btn-danger-solid`, `.ds-btn-neutral-subtle`. Custom dialog wrapper, custom input field, custom warning icon, custom badge styling. CSS variables referenced for tokens.

### Tool call sequence

- `list_components()` — confirmed inventory (Badge, Button, Spinner)
- `get_component("Button")` — likely; reasoning cites the Button spec's anti-patterns and disabled-opacity rule
- Possibly `get_component("Badge")` — used Badge tone correctly with "Permanent" label
- **`render_component` — not used.** The output contains zero verbatim JSX strings; all `<button>` tags are raw HTML with custom classes.

### Reasoning the model gave

Citations of conventions are correct and detailed:

- `palette="danger" style="solid"` for destructive action (cited anti-pattern violation if otherwise)
- `palette="neutral" style="subtle"` for cancel
- Primary action right-aligned (LTR rule)
- Disabled = opacity 0.4 (cited "do not override disabled opacity")
- Badge tone="danger" with "Permanent" — cited "1-2 words" badge rule
- Honest about gaps: Dialog, Icon, List, instruction component absent

The reasoning paragraph names every right rule. The execution skips the components.

### Grading

| Criterion                   | Day 8 v1         | Day 9 v2                         | Day 10 MCP                         |
| --------------------------- | ---------------- | -------------------------------- | ---------------------------------- |
| Used `<Button>` as JSX      | ❌ Reimplemented | ❌ `.btn--style-palette` classes | ❌ `.ds-btn-style-palette` classes |
| Prop names correct          | ❌ `variant`     | ✅ encoded in class names        | ✅ encoded in class names          |
| CSS variables for tokens    | ❌ inline hex    | ✅ throughout                    | ✅ throughout                      |
| Cited specific conventions  | ✅               | ✅                               | ✅                                 |
| Composition right           | ✅               | ✅                               | ✅                                 |
| Acknowledged gaps           | ✅               | ✅                               | ✅                                 |
| **Used `render_component`** | n/a              | n/a                              | ❌                                 |

### Findings — runtime alignment

The Day 9 hypothesis predicted MCP would fix component bypass. It didn't. Across three iterations with three radically different consumption surfaces — full JSON, tighter JSON + rules, callable MCP tools — the model converged on the same pattern: encode the DS API as CSS class names, write raw HTML.

The mechanism isn't artifact format or rule clarity. It's **runtime alignment**.

When the user asked for a dialog and the output surface was an HTML artifact iframe, the model picked HTML — because that's what the iframe could render. `render_component` returns a JSX string. JSX strings are dead text in an HTML artifact iframe with no React runtime. So the model wrote HTML directly, replicating the API in CSS classes.

The deeper truth this surfaces:

> Even when components are callable via MCP, models will bypass them if the output target doesn't accept the component's runtime form. The component, the tool, and the output target must share a runtime.

This is the third iteration of the thesis:

- **v1:** Documentation is the AI consumption surface (failed)
- **v2:** Better documentation will fix component consumption (failed)
- **v3:** Packaging (callable tools) will fix component consumption (failed)
- **v4:** AI-native is a runtime alignment problem — the component, the tool, and the output target must share a runtime.

### What's left to verify

The runtime-alignment thesis predicts that the same prompt in **Claude Code** (which edits actual `.tsx` files where JSX _is_ the native runtime) should produce different behavior — `render_component` calls returning JSX strings would compose naturally into the file being edited.

A Day 10c session running the same prompt in Claude Code would either confirm the thesis (model uses `render_component` in JSX context but not HTML context) or refute it (model bypasses components in any context). Either result is publishable.

### Severity for case study

Strongest finding of the project. Three iterations, each surfacing a deeper layer of the actual problem. The arc is now:

1. Built the system + AI consumption layer (Days 1-7)
2. Tested it honestly (Day 8) — found documentation alone fails
3. Iterated documentation (Day 9) — three of four issues fixed, core remained
4. Iterated packaging (Day 10) — packaging alone insufficient
5. Refined the thesis (Day 10) — runtime alignment is the real load-bearing layer

This is publishable as-is. The thesis evolution is the case study, not the success.
