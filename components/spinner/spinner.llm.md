# Spinner

Indicates ongoing background activity. Inherits color from parent via currentColor — meant to be embedded in components like Button (loading state) or used standalone for fetch indicators. For full-page or section loading, use Skeleton instead.

## Props

size: sm | md | lg (default: "md")
label: string (default: "Loading")

## Rules

- Use inside components that have their own busy semantics (Button) — let parent communicate state
- Match size to context (sm in buttons, md inline, lg standalone)
- Provide a meaningful aria-label when used standalone
- DON'T: Don't use for content that takes <300ms — flickers and hurts perceived performance
- DON'T: Don't use for full-page loading — Skeleton communicates layout better
- DON'T: Don't override color directly — set color on parent, Spinner inherits

## Anti-patterns

<Spinner color="#3b82f6" />
  → <div style={{ color: 'var(--color-palette-primary-base)' }}><Spinner /></div>
  Spinner inherits via currentColor. Set color on the parent for consistency with the design system.

## Examples

Inside Button: <Button loading>Saving</Button>  // Button manages spinner via loading prop
Standalone inline: <Spinner label="Loading users" />  // Inline indicator next to a section title

## Use instead when

Skeleton — loading content with known layout (lists, cards)
Progress — you can communicate determinate progress
