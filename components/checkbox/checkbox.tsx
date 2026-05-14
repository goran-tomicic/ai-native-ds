import {
  forwardRef,
  useRef,
  useEffect,
  type InputHTMLAttributes,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { useFormFieldContext } from '../form-field/form-field'

const checkbox = cva(
  [
    'appearance-none',
    'shrink-0',
    'border',
    'rounded-sm',
    'bg-surface-base border-border-base',
    'checked:bg-primary-base checked:border-primary-base',
    'indeterminate:bg-primary-base indeterminate:border-primary-base',
    'disabled:opacity-40 disabled:pointer-events-none',
    'transition-[background-color,border-color]',
    'duration-150',
    'cursor-pointer',
    // Checkmark via background image — set on checked
    `checked:bg-[length:75%] checked:bg-center checked:bg-no-repeat checked:bg-[image:url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20fill='white'%3E%3Cpath%20d='M13.5%204.5L6%2012%202.5%208.5'%20stroke='white'%20stroke-width='2'%20fill='none'/%3E%3C/svg%3E")]`,
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

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkbox> {
  indeterminate?: boolean
}

const CheckboxBase = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ size, indeterminate = false, className, id: idProp, ...rest }, forwardedRef) => {
    const formFieldCtx = useFormFieldContext()
    const resolvedId = formFieldCtx?.id ?? idProp

    // indeterminate is a DOM property, not an attribute — must be set via ref
    const internalRef = useRef<HTMLInputElement | null>(null)
    const setRef = (node: HTMLInputElement | null) => {
      internalRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    return (
      <input
        ref={setRef}
        type="checkbox"
        aria-checked={indeterminate ? 'mixed' : undefined}
        {...rest}
        id={resolvedId}
        className={[checkbox({ size }), className].filter(Boolean).join(' ')}
      />
    )
  }
)

CheckboxBase.displayName = 'Checkbox'

export { CheckboxBase as Checkbox }