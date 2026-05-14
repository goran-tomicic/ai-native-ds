import {
  forwardRef,
  useContext,
  type InputHTMLAttributes,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { useFormFieldContext } from '../form-field/form-field'
import { RadioGroupContext } from '../radio-group/radio-group'

const radio = cva(
  [
    'appearance-none',
    'shrink-0',
    'border',
    'rounded-full',
    'bg-surface-base border-border-base',
    'checked:border-primary-base',
    'disabled:opacity-40 disabled:pointer-events-none',
    'transition-[border-color]',
    'duration-150',
    'cursor-pointer',
    // Dot via radial background on checked
    'checked:bg-[radial-gradient(circle,var(--color-palette-primary-base)_0%,var(--color-palette-primary-base)_40%,transparent_45%)]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-[14px] h-[14px]',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'onChange'> {
  value: string
  size?: 'sm' | 'md' | 'lg'
}

const RadioBase = forwardRef<HTMLInputElement, RadioProps>(
  ({ value, size, disabled, className, id: idProp, ...rest }, forwardedRef) => {
    const formFieldCtx = useFormFieldContext()
    const groupCtx = useContext(RadioGroupContext)

    const resolvedId = formFieldCtx?.id ?? idProp

    // Group context wins for shared properties
    const resolvedSize = size ?? groupCtx?.size ?? 'md'
    const resolvedName = groupCtx?.name
    const resolvedChecked = groupCtx ? groupCtx.value === value : undefined
    const resolvedDisabled = disabled || groupCtx?.disabled

    const handleChange = () => {
      groupCtx?.onChange?.(value)
    }

    return (
      <input
        ref={forwardedRef}
        type="radio"
        value={value}
        name={resolvedName}
        checked={resolvedChecked}
        disabled={resolvedDisabled}
        onChange={handleChange}
        {...rest}
        id={resolvedId}
        className={[radio({ size: resolvedSize }), className].filter(Boolean).join(' ')}
      />
    )
  }
)

RadioBase.displayName = 'Radio'

export { RadioBase as Radio }