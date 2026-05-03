---

# Day 18 — v4 fix and the result that refined the thesis again

## Setup

After Day 10's runtime-alignment thesis, the obvious next test was: **build the runtime-aware tool and see if it changes Claude Desktop's behavior.**

Added a second rendering tool to the MCP server:

- `render_component_jsx` (renamed from `render_component`) — returns canonical JSX strings for code contexts
- `render_component_html` (new) — returns rendered HTML with inline styles using CSS variables, for HTML-artifact contexts

Both tools have the same prop validation. Model picks based on context. Hypothesis: in Claude Desktop's HTML artifact context, the model would call `render_component_html`. In Claude Code's `.tsx` file context, the model would call `render_component_jsx`. Same prompt as Day 10b and Day 10c.

## What actually happened

### Claude Desktop with both tools available

The model called `render_component_jsx` three times — two for the Cancel and Delete buttons, one for the "Permanent" Badge. **It did not call `render_component_html` at any point.** The tool was visible in the tool picker, the description was clear about its purpose, and the model still chose JSX.

The output was an HTML artifact (because Claude Desktop renders artifacts as HTML), but the underlying composition was assembled from JSX tool calls. The model went through the canonical JSX consumption path and let the rendering layer handle display.

### Claude Code with both tools available

Same pattern as Day 10c. Model used Claude Code's native Read tool to read the actual component files in the repo (`components/button/button.tsx`), then imported `Button` directly. **MCP tools were used minimally.** The codebase trumped MCP when both were available.

## Updated grading table

| Iteration          | Context        | Tools available               | Used `<Button>` correctly? | How?                                         |
| ------------------ | -------------- | ----------------------------- | -------------------------- | -------------------------------------------- |
| Day 8 v1           | claude.ai chat | JSON paste only               | ❌                         | Reimplemented Button as React or CSS classes |
| Day 9 v2           | claude.ai chat | JSON + .llm.md, tighter rules | ❌                         | `.btn--style-palette` BEM-style classes      |
| Day 10b            | Claude Desktop | `render_component` (JSX-only) | ❌                         | Raw HTML with `.ds-btn-*` classes            |
| Day 10c            | Claude Code    | `render_component` (JSX-only) | ✅                         | Direct import by reading codebase            |
| **Day 18 Desktop** | Claude Desktop | jsx + html tools              | ✅                         | `render_component_jsx` x3 (Buttons + Badge)  |
| **Day 18 Code**    | Claude Code    | jsx + html tools              | ✅                         | Direct import by reading codebase            |

## Why this refutes the obvious version of the runtime-alignment thesis

The Day 10b finding was: _"models bypass components in HTML contexts because JSX strings are dead text in an HTML iframe."_ The implied fix was a runtime-appropriate output tool.

That fix didn't behave as predicted. When the HTML output tool was offered in an HTML context, the model still chose JSX. Two readings:

1. **The model doesn't perceive the runtime context the way the thesis assumed.** Output target is invisible from the model's perspective; it picks the tool that matches the _system's_ canonical form, not the _output's_ required form.
2. **The model perceives the runtime but values "use the system properly" over "match the runtime."** It composed in JSX because that's the canonical consumption pattern, then trusted the rendering pipeline to display it.

Either reading refutes the simple v3 thesis (runtime mismatch causes bypass).

## The refined thesis after Day 18

The thesis evolution now reads:

- **v1:** Documentation is the AI consumption surface (failed)
- **v2:** Better documentation will fix component bypass (failed)
- **v3:** Packaging via callable tools will fix bypass (failed in HTML context with JSX-only tool — the original Day 10b finding)
- **v4 (Day 10c):** Runtime alignment (component + tool + output target sharing runtime) is the missing layer (confirmed cleanly when JSX runtime was available)
- **v5 (Day 18):** **The runtime that matters isn't the output target's runtime — it's the abstraction level the system presents.**

Day 10b's bypass wasn't about the HTML iframe being unable to run JSX. It was about _only one tool being available in a context where the model couldn't map the canonical form to the output_. When given a choice between matching its system (JSX) or matching its output (HTML), the model chose system every time.

## The deeper insight

> AI models prefer to consume design systems at the abstraction level the system provides, not the level the output target requires. The model wants to "use the system." It doesn't want to be a renderer. When forced into rendering (Day 10b — JSX-only tool, HTML output target), the model becomes a reluctant renderer and reproduces the API in CSS classes. When given a choice, it always picks the system's canonical form.

This shifts the load-bearing layer one level deeper than runtime alignment. It's not about matching runtimes. It's about preserving abstraction.

## What this means for the case study

The thesis evolution is one beat longer and substantially more useful:

- "AI-native design systems require all three layers — documentation, packaging, runtime alignment" was a good thesis
- "AI-native design systems require an unbroken chain of abstraction from system to consumer to renderer" is a better one

Practical implications for design system practitioners:

- Don't try to match your DS to every runtime your output might need. Pick one canonical form (typically JSX for React-based DS, or templates for Vue, etc.) and design tools that emit that form.
- Let the rendering pipeline (Claude Desktop's artifact engine, Cursor's diff engine, Claude Code's file write) handle adaptation.
- The boundary of "AI-native" isn't where the output runs. It's where the system's abstraction ends.

## Architectural cost flagged

Building `render_component_html` was significant work — ~150 lines of component-specific renderer logic. JSX rendering is generic (`<Component {...props} />` works for anything the model has imported). HTML rendering forces the server to _implement each component_ as a serialized visual.

Worth noting: **the JSX abstraction lets the design system stay one layer above its renderers. Forcing HTML output forces the system to also be the renderer.** That's a real engineering cost. After Day 18, it's also revealed to be unnecessary effort — the model didn't want HTML output.

## Severity for case study

Highest of the project. Day 18 closes the thesis arc with a substantially refined claim. The case study is no longer "we built something and tested it." It's:

1. We built an AI-native design system
2. We tested whether AI could consume it correctly across five distinct surfaces
3. We discovered the bypass behavior and iterated three times to find the load-bearing layer
4. The obvious "runtime alignment" fix didn't actually work the way we predicted
5. The actual finding is more subtle: models preserve the system's abstraction level, regardless of output target

That's a five-iteration arc resolving in a non-obvious finding. Hireable.
