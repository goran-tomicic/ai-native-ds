/**
 * Renders a design system component as HTML with inline styles.
 *
 * Used by render_component_html for HTML-artifact contexts where JSX strings
 * are dead text. Maps spec.tokens.style_slots to CSS custom properties so the
 * output respects the system's theming.
 *
 * Note: this is NOT a fully featured component renderer. It produces HTML that
 * looks correct in a default theme. Hover/active states are not rendered (they
 * require runtime CSS). State modifiers are referenced by token name in the
 * style attribute, but the consumer must provide the variable definitions.
 */

type Spec = {
  name: string
  props: Record<string, any>
  tokens?: {
    palette_mapping?: Record<string, string>
    style_slots?: Record<string, Record<string, string>>
    slots?: Record<string, string>
    effects?: Record<string, string>
    shared?: Record<string, string>
  }
}

/**
 * Map a token reference like "{palette}.base" to a CSS variable.
 * `{palette}` becomes the actual palette name from the props.
 */
function tokenToCssVar(tokenRef: string, palette: string): string {
  // {palette}.base       → var(--color-palette-{palette}-base)
  // {palette}.base-hover → var(--color-palette-{palette}-base-hover)
  // transparent          → transparent
  if (tokenRef === 'transparent') return 'transparent'
  if (!tokenRef.startsWith('{palette}')) {
    // Already-fully-qualified token like color.common.fg.subtle
    const flat = tokenRef.replace(/\./g, '-')
    return `var(--${flat})`
  }
  const slot = tokenRef.replace('{palette}.', '')
  return `var(--color-palette-${palette}-${slot})`
}

/**
 * Render Button as HTML.
 * Other components can be added here as they ship.
 */
export function renderButtonHtml(
  spec: Spec,
  props: Record<string, any>,
  children?: string
): string {
  const palette = props.palette ?? spec.props.palette?.default ?? 'neutral'
  const style   = props.style   ?? spec.props.style?.default   ?? 'solid'
  const size    = props.size    ?? spec.props.size?.default    ?? 'md'
  const disabled = props.disabled ?? false
  const loading  = props.loading  ?? false

  const slots = spec.tokens?.style_slots?.[style]
  if (!slots) {
    return `<!-- render_component_html error: unknown style "${style}" -->`
  }

  const bg = tokenToCssVar(slots.bg, palette)
  const fg = tokenToCssVar(slots.fg, palette)

  // Padding by size — read from spec
  const paddingMap: Record<string, string> = {
    sm: 'var(--space-1) var(--space-3)',
    md: 'var(--space-2) var(--space-4)',
    lg: 'var(--space-3) var(--space-6)',
  }
  const padding = paddingMap[size] ?? paddingMap.md

  const fontSizeMap: Record<string, string> = {
    sm: '13px',
    md: '14px',
    lg: '16px',
  }

  const inlineStyle = [
    `background-color: ${bg}`,
    `color: ${fg}`,
    `padding: ${padding}`,
    `font-size: ${fontSizeMap[size]}`,
    `border: 0`,
    `border-radius: var(--radius-md)`,
    `font-weight: 500`,
    `cursor: ${disabled || loading ? 'not-allowed' : 'pointer'}`,
    `transition: background-color 120ms ease, opacity 120ms ease`,
    disabled || loading ? 'opacity: 0.4; pointer-events: none' : null,
  ].filter(Boolean).join('; ')

  const ariaBusy = loading ? ' aria-busy="true"' : ''
  const disabledAttr = (disabled || loading) ? ' disabled' : ''

  const inner = loading ? '⟳ Loading' : (children ?? '')

  return `<button type="button" style="${inlineStyle}"${ariaBusy}${disabledAttr}>${escapeHtml(inner)}</button>`
}

/**
 * Render Badge as HTML.
 */
export function renderBadgeHtml(
  spec: Spec,
  props: Record<string, any>,
  children?: string
): string {
  const tone = props.tone ?? spec.props.tone?.default ?? 'neutral'
  const size = props.size ?? spec.props.size?.default ?? 'md'

  // Badge maps tone → palette via palette_mapping
  const toneMap: Record<string, string> = {
    neutral: 'neutral',
    info:    'primary',
    success: 'success',
    warning: 'warning',
    danger:  'danger',
  }
  const palette = toneMap[tone] ?? 'neutral'

  const bg = `var(--color-palette-${palette}-soft)`
  const fg = `var(--color-palette-${palette}-bold)`

  const padding = size === 'sm'
    ? 'var(--space-1) var(--space-2)'
    : 'var(--space-1) var(--space-3)'

  const inlineStyle = [
    `display: inline-flex`,
    `align-items: center`,
    `background-color: ${bg}`,
    `color: ${fg}`,
    `padding: ${padding}`,
    `font-size: 12px`,
    `font-weight: 500`,
    `border-radius: 999px`,
  ].join('; ')

  return `<span role="status" style="${inlineStyle}">${escapeHtml(children ?? '')}</span>`
}

/**
 * Render Spinner as HTML.
 */
export function renderSpinnerHtml(
  spec: Spec,
  props: Record<string, any>
): string {
  const size = props.size ?? 'md'
  const sizeMap: Record<string, string> = { sm: '12px', md: '16px', lg: '24px' }
  const px = sizeMap[size] ?? sizeMap.md
  const label = props.label ?? 'Loading'

  // CSS-only spinner (matches the React component's approach)
  return `<span role="status" aria-label="${escapeHtml(label)}" style="display: inline-block; width: ${px}; height: ${px}; border: 2px solid currentColor; border-top-color: transparent; border-right-color: transparent; border-radius: 50%; animation: spin 750ms linear infinite;"></span>`
}

/**
 * Dispatch by component name.
 */
export function renderComponentHtml(
  spec: Spec,
  props: Record<string, any>,
  children?: string
): string {
  const name = spec.name.toLowerCase()
  switch (name) {
    case 'button':  return renderButtonHtml(spec, props, children)
    case 'badge':   return renderBadgeHtml(spec, props, children)
    case 'spinner': return renderSpinnerHtml(spec, props)
    default:
      return `<!-- render_component_html: no HTML renderer for component "${spec.name}" -->`
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}