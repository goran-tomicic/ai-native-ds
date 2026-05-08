# Token Architecture

The reference for how tokens are structured in this system. Every future token decision defers to this doc.

---

## Three layers

```
core (primitives, single mode)   →   semantic/common  (light + dark)   →   components
                                 →   semantic/palette (light + dark)   →   components
```

- **`core`** — primitives. Raw values, no meaning. `slate/500`, `blue/100`, `4px`.
- **`semantic/common`** — UI infrastructure. Non-variant. Used by layout and primitive UI.
- **`semantic/palette`** — variant-driving tokens. Consumed by components via variant props.

Components reference semantic tokens, not primitives. Primitives are available as escape hatches but not the first choice.

---

## The common/palette split

The defining question for placing a new token:

> Does a component _variant prop_ pick between this token and a sibling?

- **Yes** → palette
- **No** → common

**Common** is small and stable. **Palette** is where component identity lives.

---

## Modes

The system supports **light** and **dark** modes from day one.

- `core` is single-mode. Hex values are absolute and don't change between modes.
- `semantic` (both `common` and `palette`) carries two values per token — one per mode.

In code:

- CSS variables for `core` live under `:root` only
- CSS variables for `semantic` live under `:root` (light) and `[data-theme="dark"]` (dark override)
- Tailwind theme reads CSS variable references; dark mode handled via variable swap, not class rebuild
- Components stay mode-agnostic — they reference the token, the token resolves to the right value

---

## Layer 2a — `semantic/common`

Four categories. Each has its own shape, fitting its purpose.

### `fg` — foregrounds (5 slots)

| Slot      | Light       | Dark        |
| --------- | ----------- | ----------- |
| `strong`  | `slate/950` | `slate/50`  |
| `base`    | `slate/800` | `slate/200` |
| `muted`   | `slate/600` | `slate/400` |
| `subtle`  | `slate/400` | `slate/600` |
| `inverse` | `white`     | `slate/950` |

### `bg` — utility fills (4 slots, pure intensity)

Flat fills that don't imply elevation. For elevated containers, use `surface`.

| Slot     | Light       | Dark        |
| -------- | ----------- | ----------- |
| `subtle` | `slate/50`  | `slate/900` |
| `muted`  | `slate/100` | `slate/800` |
| `base`   | `slate/200` | `slate/700` |
| `strong` | `slate/300` | `slate/600` |

### `border` — dividers, outlines, separation (6 slots)

Intensity ramp + interaction state slots.

| Slot     | Light                  | Dark                   |
| -------- | ---------------------- | ---------------------- |
| `subtle` | `slate/100`            | `slate/800`            |
| `muted`  | `slate/200`            | `slate/700`            |
| `base`   | `slate/300`            | `slate/600`            |
| `strong` | `slate/400`            | `slate/500`            |
| `active` | `palette/primary/base` | `palette/primary/base` |
| `focus`  | `palette/primary/base` | `palette/primary/base` |

The `active` and `focus` slots reference palette tokens. Changing the primary palette automatically updates active/focus borders system-wide.

### `surface` — elevation containers (4 slots, mode-asymmetric)

In light mode `base`/`raised`/`overlay` are visually similar — elevation is communicated via shadow and border. In dark mode, surface itself gets lighter as elevation increases (matches macOS/iOS conventions).

| Slot      | Light       | Dark        |
| --------- | ----------- | ----------- |
| `base`    | `white`     | `slate/900` |
| `raised`  | `white`     | `slate/800` |
| `overlay` | `white`     | `slate/700` |
| `sunken`  | `slate/100` | `slate/950` |

---

## Layer 2b — `semantic/palette`

Each palette is a named color treatment consumed by components via variant prop.

**Palettes shipped:**

- `neutral` — non-semantic labels, default tones (slate-based)
- `primary` — brand / default action (blue-based)
- `success` — positive completion states (green-based)
- `warning` — caution states (amber-based)
- `danger` — critical / destructive states (red-based)

Info palette deferred — primary serves info needs for now.

**Each palette has 7 slots:**

| Slot       | Purpose                                                   |
| ---------- | --------------------------------------------------------- |
| `subtle`   | Faintest tint; page-level hover, zebra stripes            |
| `soft`     | Subdued fill; badge bg, muted panel, input fill           |
| `muted`    | Soft-plus; emphasized subtle states                       |
| `base`     | Canonical palette color; solid button bg, brand marks     |
| `strong`   | Deeper than base; hover/pressed states                    |
| `bold`     | Deepest saturated; headlines, emphasized text             |
| `contrast` | Mode-aware foreground; text/icons on the palette's `base` |

**Strict perceptual ordering 1→6.** Step 7 (`contrast`) is a separate slot, not on the intensity scale — it pairs with `base` for foreground use.

### Light/dark behavior

In light mode, palettes ramp pale-to-saturated (50 → 900). In dark mode, palettes invert: `subtle` becomes a near-black tinted with the palette color, `bold` becomes a pale saturated version. Each token has both values defined.

### Sample palette: `primary` (blue)

| Slot       | Light      | Dark       |
| ---------- | ---------- | ---------- |
| `subtle`   | `blue/50`  | `blue/950` |
| `soft`     | `blue/100` | `blue/900` |
| `muted`    | `blue/200` | `blue/800` |
| `base`     | `blue/600` | `blue/500` |
| `strong`   | `blue/700` | `blue/400` |
| `bold`     | `blue/900` | `blue/200` |
| `contrast` | `white`    | `white`    |

### State modifiers

Interaction states extend a slot with dash-suffix:

```
primary/base           → default state
primary/base-hover     → hover state
primary/base-active    → pressed/active state
primary/base-disabled  → disabled state
```

Added only when a component needs them. No pre-building.

### Naming discipline

The following names are **reserved** for the palette intensity scale:

```
subtle, soft, muted, base, strong, bold, contrast
```

No variation. No synonyms. No additions to the main scale without updating this doc.

---

## How components consume palettes

Components have two orthogonal axes:

1. **Palette** — which semantic color family (`tone="success"`, `palette="primary"`)
2. **Variant** — which visual treatment (`variant="solid"`, `variant="ghost"`)

The style determines which palette slots get used:

| Variant   | Background                        | Foreground | Border |
| --------- | --------------------------------- | ---------- | ------ |
| `solid`   | `base`                            | `contrast` | —      |
| `subtle`  | `soft`                            | `bold`     | —      |
| `outline` | `surface/base` (common)           | `bold`     | `base` |
| `ghost`   | `transparent` → `subtle` on hover | `base`     | —      |
| `link`    | `transparent`                     | `base`     | —      |

This is a convention, not enforced by code. Components can deviate with documented reason.

**Example:** Badge is always effectively `subtle` style — `tone` prop picks the palette, no style axis. Badge's spec declares `"variant": "subtle"` and `"slots": { "bg": "{palette}.soft", "fg": "{palette}.bold" }`.

### Disabled state — opacity, not tokens

Disabled appearance is implemented via opacity (0.4) plus pointer-events: none, not via dedicated tokens. Reasoning:

- Disabled is a modifier, not a variant — same palette, dimmed
- Avoids per-palette disabled token sprawl
- Works for any future palette without new tokens
- Components declare disabled_opacity in their spec's effects block

---

## Layer 1 — `core` primitives

### Color scales (all 11-step Tailwind)

- `slate`, `blue`, `red`, `green`, `amber`: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`
- `absolutes`: `white` (#ffffff), `black` (#000000)

### Spacing

Tailwind convention: `1, 2, 3, 4, 6, 8, 10` where value = N × 4px.

### Radius

T-shirt scale: `sm` (4px), `md` (6px), `lg` (8px), `full` (9999px).

---

## Naming conventions

- **Figma Variables:** lowercase, slash-separated. `color/slate/500`, `color/common/fg/base`.
- **DTCG JSON:** nested objects, dot paths when referenced as strings (`{color.slate.500}`).
- **CSS variables:** kebab-case (`--color-slate-500`, `--color-common-fg-base`).
- **Tailwind classes:** kebab-case flat. Common categories use ergonomic aliases:
  - `common/bg/*` → `bg-canvas-*` (avoids `bg-bg-*` collision)
  - `common/fg/*` → `text-fg-*`
  - `common/surface/*` → `bg-surface-*`
  - `common/border/*` → `border-*`
  - `palette/{name}/*` → `bg-{name}-*`, `text-{name}-*`
- **Component spec `tokens` fields:** dot notation (`color.palette.primary.base`).

The `canvas` rename in Tailwind is the only place token names and class names diverge. Underlying CSS variables stay `--color-common-bg-*`.

---

## Validation rules

To be enforced in CI (Week 2 task):

1. Every token referenced in a component `spec.json`'s `tokens` block must resolve to an actual DTCG token.
2. No component may reference a `core/` token directly in its implementation. Components use `common/` or `palette/`.
3. No palette slot name outside the reserved set: `subtle, soft, muted, base, strong, bold, contrast` plus state modifiers (`-hover`, `-active`, `-disabled`, `-focus`).

---

## Decision log

The choices behind this architecture, kept here so future maintainers understand the reasoning.

- **Two-layer semantic (common + palette) over three-layer (adding component tokens):** Component tokens for most components would be pure aliases of palette tokens. Added case-by-case only when a component makes a real value decision that isn't a simple reference.
- **Intensity naming over role naming:** Intensity names are orthogonal to role, so the same token serves multiple component contexts without semantic misfit.
- **State modifiers as extensions (`base-hover`) rather than separate steps:** Keeps intensity scale pure and perceptual. State is a different axis.
- **7-step palette over 12-step (Radix-style):** 12 is more thoughtful but adds ~30 extra tokens with debatable use case at this system's size.
- **Common categories get their own shapes, not a forced uniform scale:** Each category serves a different purpose (fg is purely textual; bg is surface intensity; border has interaction states; surface has mode-asymmetric elevation).
- **`bg` vs `surface` split:** `bg` is intensity-based flat fills. `surface` is mode-asymmetric elevation. Keeping them separate lets each model its concept correctly.
- **Light + dark modes from day one:** Adding modes later tends to surface assumptions baked in. Building both now forces correct thinking about asymmetric pairs immediately.
- **`border/active` and `border/focus` reference palette in common:** Hybrid — slot lives in common (so components reference `border-active` regardless of palette context), but value comes from palette so theming propagates.
- **Contrast as separate palette slot, not on intensity scale:** Contrast is a pairing concern, not an intensity position.
- **Info palette deferred:** Would have been a duplicate of primary. Skipped until a component needs it to differ.
- **Tailwind `canvas` rename for common bg:** Avoids `bg-bg-*` ergonomic problem. The token name and class name diverge intentionally.
- **Plugin-based token export (not Figma REST API):** Figma's Variables REST API is gated to Enterprise plans. `variables2json` plugin + custom normalizer achieves the same end state with two manual steps.

---

_Last updated end of Day 4._
