# Card

Container for grouped content. Composes with Card.Header, Card.Body, Card.Footer subcomponents to create structured layouts. Card is structurally neutral — the content within carries intent (use Badge, callout patterns, etc. for emphasis). The variant prop controls visual elevation; the padding prop sets uniform rhythm across all subcomponents.

## Usage

```jsx
<Card>
  <Card.Header><h3>Title</h3></Card.Header>
  <Card.Body><p>Content goes here.</p></Card.Body>
</Card>
```

## Props

variant: flat | outlined | raised (default: "outlined")
  flat — No border, no shadow. Use for cards within cards, or sections that need grouping but not visual separation.
  outlined — Subtle border, no shadow. The default — works in most contexts.
  raised — Border + shadow. Use when the card needs to feel above the surrounding content (hover-to-elevate patterns, floating action panels, summary cards on a feed).
padding: sm | md | lg (default: "md")
  sm — Compact. Good for cards in dense lists or sidebars.
  md — Default. Comfortable for most form/content contexts.
  lg — Generous. Hero cards, marketing surfaces, primary feature cards.
as: string (default: "div")

## States

default, hover

## Effects

transition: border-color 120ms ease, box-shadow 120ms ease

## Rules

- Use Card to group related content that belongs together
- Match variant to context: outlined for in-flow content, raised for floating/elevated content, flat for nested cards
- Use semantic HTML via 'as' prop when the card represents a meaningful document part (article, aside, section)
- Use subcomponents (Header/Body/Footer) for structured cards; raw children are fine for simple cards
- Match Card padding to surrounding context: sm in dense lists, md as default, lg for hero or marketing cards
- DON'T: Don't add palette tinting to Card itself — Card is structurally neutral. If you need to indicate intent, put a Badge or callout inside Card.Body.
- DON'T: Don't nest raised cards inside raised cards — the elevation hierarchy collapses visually. Use flat for inner cards.
- DON'T: Don't customize per-subcomponent padding — the uniform rhythm is intentional. Use sm/md/lg on Card itself.
- DON'T: Don't use Card as a generic styling utility — if you just need a styled box, that's a div. Card implies grouped content with semantic meaning.

## Anti-patterns

<Card variant="raised"><Card variant="raised">...</Card></Card>
  → <Card variant="raised"><Card variant="flat">...</Card></Card>
  Nested raised cards collapse the elevation hierarchy — the inner shadow disappears against the outer shadow. Inner cards should be flat or outlined to preserve the parent's elevation.

<Card style={{ backgroundColor: 'var(--color-palette-danger-subtle)' }}>...</Card>
  → <Card><Card.Body><Badge tone="danger">Error</Badge><p>Description of error</p></Card.Body></Card>
  Card is structurally neutral. To convey intent, put intent-bearing content (Badge, callouts) inside the card. Tinting the card itself is the wrong abstraction layer.

<Card><Card.Footer><Button palette="primary" variant="solid">Save</Button><Button palette="primary" variant="solid">Submit</Button></Card.Footer></Card>
  → <Card><Card.Footer><Button palette="neutral" variant="subtle">Cancel</Button><Button palette="primary" variant="solid">Save</Button></Card.Footer></Card>
  Two primary actions in the same Footer violate the system's one-primary-action-per-view rule. The user shouldn't have to decide which solid primary button to click.

<Card padding="lg"><Card.Header style={{ padding: '8px' }}>...</Card.Header></Card>
  → <Card padding="sm"><Card.Header>...</Card.Header></Card>
  Per-subcomponent padding overrides break Card's intentional uniform rhythm. If you need less padding, set Card's padding prop to 'sm'. If you need wildly different spacing across subcomponents, you may not actually want a Card.

## Examples

Simple outlined card: <Card>
  <Card.Header><h3>Title</h3></Card.Header>
  <Card.Body><p>Content goes here.</p></Card.Body>
</Card>  // Basic card on a content page
Card with footer actions: <Card>
  <Card.Header><h3>Confirm changes</h3></Card.Header>
  <Card.Body><p>Review before saving.</p></Card.Body>
  <Card.Footer>
    <Button palette="neutral" variant="subtle">Cancel</Button>
    <Button palette="primary" variant="solid">Save</Button>
  </Card.Footer>
</Card>  // Inline confirmation pattern
Raised hero card: <Card variant="raised" padding="lg" as="section">
  <Card.Header><h2>Welcome back</h2></Card.Header>
  <Card.Body><p>Here's what's new since your last visit.</p></Card.Body>
</Card>  // Marketing or onboarding hero
Compact card in a list: <Card variant="outlined" padding="sm" as="article">
  <Card.Header><h4>Item title</h4><Badge tone="info">New</Badge></Card.Header>
  <Card.Body><p>Brief description.</p></Card.Body>
</Card>  // Item in a feed or search results
Card without subcomponents: <Card>
  <p>Quick standalone content. Subcomponents are optional.</p>
</Card>  // Lightweight grouped content where structure isn't needed

## Subcomponents

### Card.Header

Top section of the card. Typically contains a heading, optionally with metadata or accessory content (badges, icons, dropdowns). Inherits Card's padding scale.

children: ReactNode

- Put a heading element here as the primary child
- Combine heading with accessory elements (Badge, status indicator, dropdown trigger) using flex layout
- Keep header content visually consistent — avoid mixing text-heavy descriptions here, those belong in Body
- DON'T: Don't put long descriptions or paragraphs here — Body is for that
- DON'T: Don't put primary actions here — Footer is the conventional place for actions
- DON'T: Don't render Card.Header as the only child of Card — that's a Card without content; consider whether you actually need a card

Example (Project summary card on a dashboard):
```jsx
<Card.Header>
  <h3>Project status</h3>
  <Badge tone="success">Active</Badge>
</Card.Header>
```

### Card.Body

Primary content area. Holds the bulk of the card's information — descriptions, lists, embedded content, form fields. Inherits Card's padding scale.

children: ReactNode

- Put the main content here — descriptions, data, form fields
- Use semantic HTML inside (paragraphs, lists, sections) rather than nested divs
- Body is the only required subcomponent if you're using subcomponents at all
- DON'T: Don't repeat heading content here that belongs in Card.Header
- DON'T: Don't put primary actions here — those go in Footer
- DON'T: Don't introduce custom padding — Card's padding prop controls this

Example (Project status card body):
```jsx
<Card.Body>
  <p>Last deploy: 2 hours ago. Three pending changes.</p>
</Card.Body>
```

### Card.Footer

Bottom section. Holds actions (buttons), metadata (timestamps, attribution), or both. Inherits Card's padding scale. Often visually separated from Body via a top border.

children: ReactNode

- Use Footer for primary card actions (buttons)
- Use Footer for low-emphasis metadata (timestamps, author bylines, status info)
- When combining actions and metadata, layout them with metadata on the left and actions on the right (LTR)
- If multiple buttons, follow the Button spec's primary-action-on-the-right rule
- DON'T: Don't put more than one primary action in Footer — competing primaries violate the system's one-primary-per-view rule
- DON'T: Don't put descriptive content here — that belongs in Body
- DON'T: Don't omit Card.Footer just to save space — if there are actions, the Footer is the right place for them

Example (Settings card with save/cancel actions):
```jsx
<Card.Footer>
  <Button palette="neutral" variant="subtle">Cancel</Button>
  <Button palette="primary" variant="solid">Save</Button>
</Card.Footer>
```
Example (Activity card on a feed):
```jsx
<Card.Footer>
  <span className="text-fg-muted text-sm">Updated 2 hours ago</span>
  <Button palette="primary" variant="subtle">View details</Button>
</Card.Footer>
```

## Use instead when

Dialog — the content needs to be modal or focus-trapping
div — you just need a styled box without grouped semantic meaning
Section — you need a major page region; Card is for smaller groupings within a region
