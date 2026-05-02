---

# Day 9 — v2 iteration synthesis

## Setup

Four targeted fixes were applied to the AI consumption layer:

1. `llms.txt` restructured — `.llm.md` files prioritized, `components.json` listed as token catalog
2. `.llm.md` generator updated to lead each doc with a JSX `## Usage` example
3. `llms.txt` got two new conventions:
   - **Prop naming:** explicit note that this system uses `style` not `variant`
   - **Component consumption:** explicit rule that components are React components, must be used as JSX, must not be reimplemented
4. `llms.txt` and `components.json` got an `exampleOfCorrectUsage` block — a confirmation dialog showing exactly the consumption pattern the system wants

A pipeline bug was caught and fixed during Day 9 setup: `scripts/build-api.ts` had conventions hardcoded separately from `llms.txt`, so the v1 conventions were embedded in `components.json` independently of `llms.txt`. Without fixing this, the v2 fixes wouldn't have propagated to the JSON the model would actually see. Updated, but flagged: the two surfaces (`llms.txt` and `components.json`) need a single source of truth for conventions in v3.

## Method

Re-run Day 8 Test 2 (composition / delete account dialog) with v2 artifacts. Same prompt verbatim, same Claude.ai fresh-conversation conditions. Tests 3 and 5 deferred — Test 2's outcome was strong enough signal that running more tests would have produced redundant data.

## What v2 fixed

Three measurable improvements between Day 8 Test 2 and Day 9 Test 2 v2:

- **Prop names correct.** Day 8 used `variant="solid"`. Day 9 used `style` — encoded as `.btn--danger-solid` class names. The prop-name disambiguation note was read.
- **CSS variables used throughout.** Day 8 inlined raw hex (`#dc2626`). Day 9 declared a `:root` block with `--danger-base: #dc2626` and referenced it everywhere. This single change unlocks dark mode support, which Day 8's output broke.
- **State modifier tokens consumed.** Day 9 referenced `--neutral-soft-hover`, `--danger-base-active`, etc. — tokens defined in palette but ignored in Day 8's output.

These represent genuine improvements. Convention 7 (prop names) and the architectural shift toward CSS-variable consumption are working.

## What v2 did not fix

The headline criterion: _Did the model use `<Button>` as JSX?_

**No.** The model wrote raw `<button>` elements with custom CSS classes encoding the DS API as BEM-style names (`.btn--neutral-subtle`, `.btn--danger-solid`). This is functionally `<Button palette="..." style="..." />` translated into CSS. The mental model is right. The execution layer is wrong.

Convention 8 — the most assertive rule we added, "Do NOT reimplement components, write raw HTML elements when a component exists, or recreate variant logic in custom CSS" — was directly violated. The 6-line `exampleOfCorrectUsage` block was overlooked.

## The deeper finding

V1 hypothesis: _"Models bypass components because the artifact format buries them."_

V2 fix: explicit consumption rule + worked example.

V2 result: even with the rule loud and exemplified, the model still bypassed components.

The pattern across two iterations and four data points (Day 8 Tests 2, 3, 5 + Day 9 Test 2 v2) reveals something deeper than artifact-format mediation:

> When given specs in JSON without an actual importable runtime, models will recreate components as code rather than treat them as callable abstractions.

The model has no `Button` to import. It has a _description_ of Button. So it builds a button. From the model's perspective, encoding the DS API as `.btn--danger-solid` is _the most faithful possible implementation_ — preserving the contract perfectly while accepting that the contract has no runtime to call.

This is not a documentation failure. It is a packaging failure.

## What this implies for v3

The fix isn't more documentation. It's making the components actually callable.

Three possible directions, ranked by leverage:

1. **MCP server.** Components become _tools_ the model invokes. Each component is an MCP tool with typed parameters matching its props; the tool returns rendered JSX. The model never sees specs — it sees callable components.

2. **NPM package.** Publish components as `@ai-native/ds`. The model imports them. Requires real publishing infrastructure but matches how every existing DS works.

3. **Real `.tsx` files in a fetchable directory.** The model gets a relative path and import statement, treats components as filesystem-addressable.

Option 1 was already the original Week 4 plan. The Day 9 finding makes it the obvious next step — not because MCP is trendy, but because _callable_ is the load-bearing word the documentation layer can't provide.

## Case-study significance

The arc through Days 7–9 now reads cleanly:

- **Day 7:** Built three AI consumption surfaces (`llms.txt`, `.llm.md`, `components.json`)
- **Day 8:** Tested them against five LLM tasks. Found that documentation alone consistently fails at the component-consumption layer, even when the model knows the right pattern.
- **Day 9:** Iterated the documentation layer with the specific feedback from Day 8. Two of the failure modes resolved (prop names, hex values). One did not — the model still skipped the component layer.
- **Day 9 finding:** AI-native design systems aren't fundamentally a documentation problem. They're a packaging problem. Documentation describes; only packaging makes things callable.

This is a stronger thesis than "we built specs and they worked." It's also a stronger thesis than "we fixed the docs and now they work." It's a real finding that the next iteration of the field needs to grapple with: AI consumption requires runtime hooks, not just structured prose.

## Wins to carry forward

The v2 changes are not throwaway. They're foundation:

- Prop-name conventions now propagate correctly
- CSS variable consumption is the consistent pattern (instead of hex)
- State modifier tokens are read and used
- Citations of conventions appear in code comments

When v3 (MCP server) lands, it will sit on top of a documentation layer that is already clean. Without v2, the MCP server would still face prop-name confusion in tool signatures and palette inconsistencies in returned JSX.

The right framing for the case study: _"v1 found the problem. v2 cleaned the documentation layer. v3 will solve the underlying packaging problem."_
