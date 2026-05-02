# Badge

A small visual label used to annotate or call out a status, count, or category. For interactive states or filtering, use Tag. For user-generated labels, use Chip.

## Usage

```jsx
<Badge tone="success">Active</Badge>
```

## Props

tone: neutral | info | success | warning | danger (default: "neutral")
  neutral — Default for non-semantic labels (categories, counts, generic metadata).
  info — Informational callouts, new features, guidance.
  success — Positive states: completed, verified, active, paid.
  warning — Caution states: pending, needs review, attention required.
  danger — Critical states: failed, expired, blocked, error.
size: sm | md (default: "md")
children: ReactNode

## Slot mapping

bg: {palette}.soft
fg: {palette}.bold

## Rules

- Keep labels 1–2 words
- Use tone that matches the semantic state (success for completed, not info)
- Pair color with text — never rely on color alone
- DON'T: Don't use as interactive button — use Tag instead
- DON'T: Don't use for long text or sentences
- DON'T: Don't combine multiple tones in one group without clear reason

## Anti-patterns

<Badge tone="danger" onClick={handleClick}>Delete</Badge>
  → <Button variant="destructive" onClick={handleClick}>Delete</Button>
  Badge is a passive label, not an action trigger. Clickable semantics require a Button.

## Examples

Status in a table: <Badge tone="success">Active</Badge>  // User status column
Warning label: <Badge tone="warning">Pending</Badge>  // Order awaiting review
Neutral count: <Badge size="sm">12</Badge>  // Notification count

## Use instead when

Tag — label is interactive (filter, removable)
Chip — label represents user-generated content
