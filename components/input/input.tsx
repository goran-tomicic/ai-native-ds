import { forwardRef, isValidElement, Children, type ReactNode, type InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// ─── Subcomponent — Input.LeadingIcon ────────────────────────────────────────

interface InputLeadingIconProps {
  children: ReactNode
}

function InputLeadingIcon({ children }: InputLeadingIconProps) {
  return (
    <span
      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-fg-muted"
      style={{ width: 16, height: 16 }}
    >
      {children}
    </span>
  )
}

InputLeadingIcon.displayName = 'Input.LeadingIcon'

// ─── Subcomponent — Input.TrailingIcon ───────────────────────────────────────

interface InputTrailingIconProps {
  children: ReactNode
  interactive?: boolean
}

function InputTrailingIcon({ children, interactive = false }: InputTrailingIconProps) {
  return (
    <span
      className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-fg-muted ${
        interactive ? 'cursor-pointer' : 'pointer-events-none'
      }`}
      style={{ width: 16, height: 16 }}
    >
      {children}
    </span>
  )
}

InputTrailingIcon.displayName = 'Input.TrailingIcon'

// ─── Input variant config ─────────────────────────────────────────────────────

const input = cva(
  [
    'w-full font-medium',
    'bg-transparent',
    'placeholder:text-fg-subtle',
    'disabled:opacity-40 disabled:pointer-events-none',
    'transition-[border-color,background-color,opacity]',
    'duration-150',
    'outline-none',
  ].join(' '),
  {
    variants: {
      variant: {
        outlined: 'border bg-surface-base',
        filled:   'border bg-canvas-subtle focus:bg-surface-base',
        ghost:    'border-x-0 border-t-0 border-b rounded-none',
      },
      state: {
        default: 'border-border-base focus:border-border-focus',
        error:   'border-danger-base focus:border-danger-base',
        success: 'border-success-base focus:border-success-base',
      },
      size: {
        sm: 'h-7 text-[13px] rounded-md',
        md: 'h-9 text-sm rounded-md',
        lg: 'h-11 text-base rounded-md',
      },
    },
    defaultVariants: {
      variant: 'outlined',
      state: 'default',
      size: 'md',
    },
  }
)

// ─── Padding helper ───────────────────────────────────────────────────────────
// Input padding adjusts when icons are present to prevent text overlap.

function getPaddingClasses(
  size: 'sm' | 'md' | 'lg' = 'md',
  hasLeadingIcon: boolean,
  hasTrailingIcon: boolean
): string {
  const basePadding = {
    sm: { default: 'px-2',   leading: 'pl-7 pr-2',  trailing: 'pl-2 pr-7',  both: 'px-7' },
    md: { default: 'px-3',   leading: 'pl-9 pr-3',  trailing: 'pl-3 pr-9',  both: 'px-9' },
    lg: { default: 'px-4',   leading: 'pl-10 pr-4', trailing: 'pl-4 pr-10', both: 'px-10' },
  }

  if (hasLeadingIcon && hasTrailingIcon) return basePadding[size].both
  if (hasLeadingIcon)                    return basePadding[size].leading
  if (hasTrailingIcon)                   return basePadding[size].trailing
  return basePadding[size].default
}

// ─── Children inspection ──────────────────────────────────────────────────────
// Find Input.LeadingIcon / Input.TrailingIcon among children.

function extractIcons(children: ReactNode): {
  leading: ReactNode | null
  trailing: ReactNode | null
} {
  let leading: ReactNode | null = null
  let trailing: ReactNode | null = null

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    // displayName on the function is what we keyed off when defining subcomponents
    const componentType = child.type as any
    if (componentType?.displayName === 'Input.LeadingIcon') {
      leading = child
    } else if (componentType?.displayName === 'Input.TrailingIcon') {
      trailing = child
    }
  })

  return { leading, trailing }
}

// ─── Input component ─────────────────────────────────────────────────────────

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'children'>,
    VariantProps<typeof input> {
  /** ReactNode to support Input.LeadingIcon / Input.TrailingIcon children */
  children?: ReactNode
}

const InputBase = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant,
      state,
      size,
      className,
      children,
      disabled,
      readOnly,
      ...rest
    },
    ref
  ) => {
    const { leading, trailing } = extractIcons(children)
    const padding = getPaddingClasses(size ?? 'md', leading !== null, trailing !== null)

    return (
      <div className="relative inline-flex w-full">
        {leading}
        <input
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          className={[
            input({ variant, state, size }),
            padding,
            className,
          ].filter(Boolean).join(' ')}
          {...rest}
        />
        {trailing}
      </div>
    )
  }
)

InputBase.displayName = 'Input'

// ─── Compound component export ────────────────────────────────────────────────
// Attach subcomponents to Input so consumers can use Input.LeadingIcon / Input.TrailingIcon.

type InputCompound = typeof InputBase & {
  LeadingIcon: typeof InputLeadingIcon
  TrailingIcon: typeof InputTrailingIcon
}

const InputWithSubcomponents = InputBase as InputCompound
InputWithSubcomponents.LeadingIcon = InputLeadingIcon
InputWithSubcomponents.TrailingIcon = InputTrailingIcon

export { InputWithSubcomponents as Input }