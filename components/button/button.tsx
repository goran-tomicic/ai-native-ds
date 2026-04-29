import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Spinner } from '../spinner/spinner'

const button = cva(
  // Base styles applied to all buttons
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-md whitespace-nowrap select-none',
    'transition-[background-color,opacity] duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--color-common-border-focus)] focus-visible:ring-offset-[var(--color-common-surface-base)]',
    'disabled:opacity-40 disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      palette: {
        neutral: '',
        primary: '',
        danger:  '',
      },
      style: {
        solid:  '',
        subtle: '',
        ghost:  '',
      },
      size: {
        sm: 'h-7 px-3 text-[13px]',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
      },
    },
    compoundVariants: [
      // SOLID style — bg=base, hover=base-hover, active=base-active, fg=contrast
      {
        style: 'solid', palette: 'neutral',
        class: 'bg-neutral-base hover:bg-neutral-base-hover active:bg-neutral-base-active text-neutral-contrast',
      },
      {
        style: 'solid', palette: 'primary',
        class: 'bg-primary-base hover:bg-primary-base-hover active:bg-primary-base-active text-primary-contrast',
      },
      {
        style: 'solid', palette: 'danger',
        class: 'bg-danger-base hover:bg-danger-base-hover active:bg-danger-base-active text-danger-contrast',
      },

      // SUBTLE style — bg=soft, hover=soft-hover, active=soft-active, fg=bold
      {
        style: 'subtle', palette: 'neutral',
        class: 'bg-neutral-soft hover:bg-neutral-soft-hover active:bg-neutral-soft-active text-neutral-bold',
      },
      {
        style: 'subtle', palette: 'primary',
        class: 'bg-primary-soft hover:bg-primary-soft-hover active:bg-primary-soft-active text-primary-bold',
      },
      {
        style: 'subtle', palette: 'danger',
        class: 'bg-danger-soft hover:bg-danger-soft-hover active:bg-danger-soft-active text-danger-bold',
      },

      // GHOST style — bg=transparent, hover=subtle, active=soft, fg=bold
      {
        style: 'ghost', palette: 'neutral',
        class: 'bg-transparent hover:bg-neutral-subtle active:bg-neutral-soft text-neutral-bold',
      },
      {
        style: 'ghost', palette: 'primary',
        class: 'bg-transparent hover:bg-primary-subtle active:bg-primary-soft text-primary-bold',
      },
      {
        style: 'ghost', palette: 'danger',
        class: 'bg-transparent hover:bg-danger-subtle active:bg-danger-soft text-danger-bold',
      },
    ],
    defaultVariants: {
      palette: 'neutral',
      style: 'solid',
      size: 'md',
    }
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'>,
    VariantProps<typeof button> {
  loading?: boolean
  iconStart?: React.ReactNode
  iconEnd?: React.ReactNode
  className?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      palette,
      style,
      size,
      loading = false,
      disabled,
      iconStart,
      iconEnd,
      children,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={button({ palette, style, size, className })}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} label="" />
            <span className="opacity-0">{children}</span>
          </>
        ) : (
          <>
            {iconStart}
            {children}
            {iconEnd}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'