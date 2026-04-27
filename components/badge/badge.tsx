import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badge = cva(
  'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-soft text-neutral-bold',
        info:    'bg-primary-soft text-primary-bold',
        success: 'bg-success-soft text-success-bold',
        warning: 'bg-warning-soft text-warning-bold',
        danger:  'bg-danger-soft text-danger-bold',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        className={badge({ tone, size, className })}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'