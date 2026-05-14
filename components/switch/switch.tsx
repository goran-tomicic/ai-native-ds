import {
  forwardRef,
  type InputHTMLAttributes,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { useFormFieldContext } from '../form-field/form-field'

// The track (the styled input itself)
const switchTrack = cva(
  [
    'appearance-none',
    'shrink-0',
    'relative',
    'rounded-full',
    'bg-neutral-muted',
    'checked:bg-primary-base',
    'disabled:opacity-40 disabled:pointer-events-none',
    'transition-colors',
    'duration-150',
    'cursor-pointer',
    // The thumb — a ::before pseudo-element positioned with transition
    'before:content-[""] before:absolute before:rounded-full',
    'before:bg-white before:transition-transform before:duration-150',
    'before:top-1/2 before:-translate-y-1/2 before:left-[2px]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-7 h-4 before:w-3 before:h-3 checked:before:translate-x-[12px]',
        md: 'w-9 h-5 before:w-4 before:h-4 checked:before:translate-x-[16px]',
        lg: 'w-11 h-6 before:w-5 before:h-5 checked:before:translate-x-[20px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof switchTrack> {}

const SwitchBase = forwardRef<HTMLInputElement, SwitchProps>(
  ({ size, className, id: idProp, ...rest }, forwardedRef) => {
    const formFieldCtx = useFormFieldContext()
    const resolvedId = formFieldCtx?.id ?? idProp

    return (
      <input
        ref={forwardedRef}
        type="checkbox"
        role="switch"
        {...rest}
        id={resolvedId}
        className={[switchTrack({ size }), className].filter(Boolean).join(' ')}
      />
    )
  }
)

SwitchBase.displayName = 'Switch'

export { SwitchBase as Switch }