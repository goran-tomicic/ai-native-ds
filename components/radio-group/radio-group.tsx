import {
  createContext,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from 'react'

// ─── Context ─────────────────────────────────────────────────────────────────
// Radio components consume this to get shared name, selected value, change
// handler, size, and disabled state.

interface RadioGroupContextValue {
  name: string
  value: string | undefined
  onChange: ((value: string) => void) | undefined
  size: 'sm' | 'md' | 'lg'
  disabled: boolean
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

// ─── RadioGroup component ────────────────────────────────────────────────────

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal'
  children?: ReactNode
}

export function RadioGroup({
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  size = 'md',
  disabled = false,
  orientation = 'vertical',
  className,
  children,
  ...rest
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleChange = (next: string) => {
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  const contextValue: RadioGroupContextValue = {
    name,
    value,
    onChange: handleChange,
    size,
    disabled,
  }

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        role="radiogroup"
        className={[
          'flex',
          orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-4',
          className,
        ].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

RadioGroup.displayName = 'RadioGroup'