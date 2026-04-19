import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badge = cva(
  // Base styles — apply to all badges
  'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-slate-100 text-slate-700',
        info:    'bg-blue-100 text-blue-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger:  'bg-red-100 text-red-700',
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