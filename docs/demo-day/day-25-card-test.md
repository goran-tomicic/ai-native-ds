# Day 25 — Card AI Test #2 (multi-Card dashboard)

## Setup

Fresh Claude.ai conversation. No project context. Only `components/card/card.llm.md` pasted.

## Prompt

```
Build a project dashboard. It should display three project cards in a grid layout. Each project card should have:
- The project name
- A status badge (active, paused, or completed — pick what makes sense)
- A short description
- A "View details" button

Use the design system spec above.

Output: a single React component snippet. After the code, briefly note which design system rules informed your choices.
```

## Result — structural pass with consumption regression at scale

**Key observation:** the reimplementation pattern from Test #1 (Day 24) holds across three Card instances. The model didn't import from the design system. Instead, it defined `Badge`, `Button`, `Card`, `Card.Header`, `Card.Body`, `Card.Footer` from scratch using inline styles and CSS variable fallbacks, then composed three Card instances by mapping over a data array.

## What the model got right

- **Compound subcomponent structure preserved across all three instances** — Card.Header, Card.Body, Card.Footer used consistently in every card. No drift to raw `<div>` in cards 2 and 3.
- **Picked appropriate variant per spec** — `outlined` for in-flow grid content (per spec recommendation: "outlined for in-flow content, raised for floating").
- **Semantic HTML via `as` prop** — `as="article"` for each card, correctly matching spec guidance.
- **`padding="md"` cited explicitly** — "default rhythm; sm would be appropriate if this were a dense sidebar list, lg for a hero surface. A grid of equals gets md."
- **Badge for intent, not card tinting** — followed spec rule against `backgroundColor` on Card for intent signals.
- **One primary action per footer** — single "View details" button per card, styled as `variant="subtle"` (navigational affordance, not destructive/committing).
- **No per-subcomponent padding overrides** — preserved uniform rhythm from Card's `padding` prop.
- **Data-driven composition** — created a `projects` array and mapped over it instead of writing three repetitive blocks. Good engineering, not in spec.
- **Responsive CSS Grid** — `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`. Surrounding architecture brought from training data conventions.

## What the model got wrong (the consumption regression)

- **No imports from design system.** Zero. Not `Card`, not `Button`, not `Badge`. Everything reimplemented inline.
- **Same reimplementation pattern as Test #1** — `Card`, `Card.Header`, `Card.Body`, `Card.Footer`, `Badge`, `Button` all defined locally with inline styles.
- **CSS variable references with hardcoded fallbacks** — `var(--color-palette-success-subtle, #dcfce7)`. Defensive code, but evidence the model isn't trusting the system's runtime — it's hedging against the variables not existing.

## Three findings ranked

### Finding A — Reimplementation pattern holds at scale (confirms Day 24)

The Test #1 hypothesis (model reimplements because Card is cheap to reproduce) is confirmed by Test #2. Three Card instances, same reimplementation. The Day 24 thesis refinement stands: **abstraction preservation is bounded by reimplementation cost.**

### Finding B — Reimplementation is consistent, not drifting

The model held the _structure_ of Card.Header / Body / Footer across three instances. It did not:

- Skip subcomponents in later cards
- Drift to raw divs
- Inconsistently apply props
- Lose the pattern when composition repeats

The model's mental model of the API is solid; the failure is purely in the "consume vs. implement" choice, not in understanding the contract. This is meaningfully different from Day 8's failures, where the model misunderstood the API. Here, the model _understands_ and chooses to reimplement.

### Finding C — Model brings additional engineering competence

Data-driven composition, list mapping, semantic HTML, responsive grid. None of these were in the spec. The model added them from training-data conventions for "how to build a dashboard."

This is a _positive_ finding for AI-native design systems. The model isn't just a spec-follower; it's an engineer using the spec as one input among many. When the spec is good and the system is set up correctly, this is exactly what you want — competent engineering applied to consume a competent system.

## What this means for the thesis

The refined thesis after Day 24 was:

> _AI models preserve the abstraction level their design system presents when reimplementation is expensive. When reimplementation is cheap (Card = div + border + padding), models reimplement._

Day 25 sharpens this:

> _AI models preserve the abstraction level their design system presents when reimplementation is expensive. When reimplementation is cheap, models reimplement — but they do so faithfully to the spec's grammar, and bring additional engineering competence to the surrounding code structure._

The implication for design system authors: **the question isn't just "can my AI consume my system" but "is my system expensive enough to reimplement that the AI prefers to consume it?"**

This suggests:

- **Rich components** (Input with focus management, Dialog with portal logic, Tabs with state coordination, controlled form state) get consumed correctly
- **Thin components** (Card, Stack, Box, Grid, Container) get reimplemented even when they could be consumed
- Both can be acceptable if you're aware of it
- For thin components, what matters is whether the model reimplements _correctly per spec_ (which it does here)

This is a design constraint that hasn't been articulated in design system writeups before. It reframes "AI-native" from "make it consumable" to "make consumption cheaper than reimplementation, _or_ make the spec grammar good enough that reimplementation produces correct output."

## Connection to Day 24 shadow pipeline

Day 24 surfaced the architectural finding about Figma vs. authored tokens. Day 25 surfaces a related finding: **AI models will use either path (consumption or reimplementation) faithfully as long as the spec is clear.** They don't need _one_ canonical surface; they need _coherent grammar_ across whatever surfaces they encounter.

This is consistent with abstraction preservation but at a different level. Models preserve the system's design grammar, not just its runtime artifacts.

## Severity

Highest of the day. Test #2 closes a real loop on the Day 24 finding and extends it usefully. The thesis is now a six-step arc with a non-obvious finding at every stage. The case study writing chat should know about this before drafting Section 5.

## Status

✅ Card v0.1.0 shipped (Days 22–24)
✅ AI Test #1 documented (Day 24)
✅ AI Test #2 documented (this file)
🟡 Writing chat handoff (Day 25 wrap)
🟡 Dialog spec (Day 26 — next session)
