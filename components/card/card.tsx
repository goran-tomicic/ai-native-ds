import { forwardRef, type ReactNode, type HTMLAttributes, type ElementType } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// ─── Subcomponent — Card.Header ──────────────────────────────────────────────

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function CardHeader({ children, className, ...rest }: CardHeaderProps) {
  return (
    <div
      className={['flex items-center justify-between', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

CardHeader.displayName = 'Card.Header'

// ─── Subcomponent — Card.Body ────────────────────────────────────────────────

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function CardBody({ children, className, ...rest }: CardBodyProps) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  )
}

CardBody.displayName = 'Card.Body'

// ─── Subcomponent — Card.Footer ──────────────────────────────────────────────

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function CardFooter({ children, className, ...rest }: CardFooterProps) {
  return (
    <div
      className={[
        'flex items-center justify-end gap-2',
        'border-t border-border-muted pt-3 mt-3',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

CardFooter.displayName = 'Card.Footer'

// ─── Card variant config ─────────────────────────────────────────────────────

const card = cva(
  [
    'bg-surface-base',
    'rounded-lg',
    'transition-[border-color,box-shadow]',
    'duration-150',
  ].join(' '),
  {
    variants: {
      variant: {
        flat:     'border-0',
        outlined: 'border border-border-muted',
        raised:   'border border-border-muted shadow-md',
      },
      padding: {
        sm: 'p-3 [&>*+*]:mt-2',
        md: 'p-5 [&>*+*]:mt-3',
        lg: 'p-7 [&>*+*]:mt-4',
      },
    },
    defaultVariants: {
      variant: 'outlined',
      padding: 'md',
    },
  }
)

// ─── Card component ──────────────────────────────────────────────────────────

export interface CardProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof card> {
  /** Render as a different HTML element — useful for semantic HTML (article, section, aside) */
  as?: ElementType
  children?: ReactNode
}

const CardBase = forwardRef<HTMLElement, CardProps>(
  (
    {
      variant,
      padding,
      as: Component = 'div',
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as any}
        className={[card({ variant, padding }), className].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </Component>
    )
  }
)

CardBase.displayName = 'Card'

// ─── Compound component export ───────────────────────────────────────────────

type CardCompound = typeof CardBase & {
  Header: typeof CardHeader
  Body:   typeof CardBody
  Footer: typeof CardFooter
}

const CardWithSubcomponents = CardBase as CardCompound
CardWithSubcomponents.Header = CardHeader
CardWithSubcomponents.Body   = CardBody
CardWithSubcomponents.Footer = CardFooter

export { CardWithSubcomponents as Card }