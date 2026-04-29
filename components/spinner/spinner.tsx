import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const spinner = cva(
  'inline-block animate-spin rounded-full border-current border-solid',
  {
    variants: {
      size: {
        sm: 'h-3 w-3 border-2',
        md: 'h-4 w-4 border-2',
        lg: 'h-6 w-6 border-2',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role'>,
    VariantProps<typeof spinner> {
  label?: string
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, label = 'Loading', ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        className={spinner({ size, className })}
        style={{
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          ...props.style,
        }}
        {...props}
      />
    )
  }
)

Spinner.displayName = 'Spinner'