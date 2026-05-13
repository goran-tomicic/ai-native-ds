import {
  createContext,
  useContext,
  useId,
  type ReactNode,
  type HTMLAttributes,
} from 'react'

// ─── Context for ID + state propagation ─────────────────────────────────────
// Form controls inside FormField read this context to get their auto-wired ID
// and inherit invalid state. Label reads it to get htmlFor.

interface FormFieldContextValue {
  /** Auto-generated or consumer-provided ID for the inner control */
  id: string
  /** Whether the field is in error state — propagates to inner control */
  invalid: boolean
  /** Whether the field is required — used by Label for visual indicator */
  required: boolean
  /** ID of the helper text element, for aria-describedby on inner control */
  helperId: string | null
  /** ID of the error message element, for aria-describedby and aria-invalid */
  errorId: string | null
  /** Setters for helper/error IDs — subcomponents register themselves */
  setHelperId: (id: string | null) => void
  setErrorId: (id: string | null) => void
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)

/**
 * Hook for form controls to consume FormField context.
 * Returns null if not inside a FormField — controls can detect this and fall back to props.
 */
export function useFormFieldContext() {
  return useContext(FormFieldContext)
}

// ─── Subcomponent — FormField.Label ─────────────────────────────────────────

interface FormFieldLabelProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'htmlFor'> {
  children: ReactNode
}

function FormFieldLabel({ children, className, ...rest }: FormFieldLabelProps) {
  const ctx = useContext(FormFieldContext)
  if (!ctx) {
    throw new Error('FormField.Label must be used inside <FormField>')
  }

  return (
    <label
      htmlFor={ctx.id}
      className={[
        'block text-sm font-medium text-fg-strong mb-1',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
      {ctx.required && (
        <span
          className="ml-1 text-danger-base"
          aria-hidden="true"
        >
          *
        </span>
      )}
    </label>
  )
}

FormFieldLabel.displayName = 'FormField.Label'

// ─── Subcomponent — FormField.Helper ────────────────────────────────────────

interface FormFieldHelperProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
}

function FormFieldHelper({ children, className, id: idProp, ...rest }: FormFieldHelperProps) {
  const ctx = useContext(FormFieldContext)
  if (!ctx) {
    throw new Error('FormField.Helper must be used inside <FormField>')
  }

  const generatedId = useId()
  const id = idProp ?? `${generatedId}-helper`

  // Register this helper's ID with the parent FormField so the control can reference it
  // (Side effect — useEffect would be cleaner but we want synchronous registration)
  if (ctx.helperId !== id) {
    ctx.setHelperId(id)
  }

  // Don't render if there's an error — Error replaces Helper
  if (ctx.errorId) return null

  return (
    <p
      id={id}
      className={[
        'mt-1 text-[13px] text-fg-muted',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </p>
  )
}

FormFieldHelper.displayName = 'FormField.Helper'

// ─── Subcomponent — FormField.Error ─────────────────────────────────────────

interface FormFieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
}

function FormFieldError({ children, className, id: idProp, ...rest }: FormFieldErrorProps) {
  const ctx = useContext(FormFieldContext)
  if (!ctx) {
    throw new Error('FormField.Error must be used inside <FormField>')
  }

  const generatedId = useId()
  const id = idProp ?? `${generatedId}-error`

  // Register this error's ID with the parent FormField
  if (ctx.errorId !== id) {
    ctx.setErrorId(id)
  }

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={[
        'mt-1 text-[13px] text-danger-bold font-medium',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </p>
  )
}

FormFieldError.displayName = 'FormField.Error'

// ─── FormField component ────────────────────────────────────────────────────

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** Marks the field as required (visual indicator on label) */
  required?: boolean
  /** Marks the field as having a validation error (propagates to inner control) */
  invalid?: boolean
  /** Override the auto-generated ID for the inner control */
  id?: string
}

import { useState } from 'react'

function FormField({
  children,
  required = false,
  invalid = false,
  id: idProp,
  className,
  ...rest
}: FormFieldProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  // Helper and Error IDs are registered by subcomponents during render
  const [helperId, setHelperId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  const contextValue: FormFieldContextValue = {
    id,
    invalid,
    required,
    helperId,
    errorId,
    setHelperId,
    setErrorId,
  }

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div className={['flex flex-col', className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </div>
    </FormFieldContext.Provider>
  )
}

FormField.displayName = 'FormField'

// ─── Attach subcomponents ───────────────────────────────────────────────────

;(FormField as any).Label = FormFieldLabel
;(FormField as any).Helper = FormFieldHelper
;(FormField as any).Error = FormFieldError

export type { FormFieldContextValue }

type FormFieldCompound = typeof FormField & {
  Label: typeof FormFieldLabel
  Helper: typeof FormFieldHelper
  Error: typeof FormFieldError
}

const FormFieldWithSubs = FormField as FormFieldCompound
FormFieldWithSubs.Label = FormFieldLabel
FormFieldWithSubs.Helper = FormFieldHelper
FormFieldWithSubs.Error = FormFieldError

export { FormFieldWithSubs as FormField }