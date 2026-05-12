import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useId,
  isValidElement,
  cloneElement,
  Children,
  createContext,
  useContext,
  type ReactNode,
  type ReactElement,
  type RefObject,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// ─── Context for ID wiring + state ─────────────────────────────────────────
// Subcomponents need to know the dialog's IDs so they can register themselves
// for aria-labelledby and aria-describedby. Context is the cleanest way to
// share these without prop drilling through children.

interface DialogContextValue {
  titleId: string
  descriptionId: string
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

function useDialogContext(componentName: string) {
  const ctx = useContext(DialogContext)
  if (!ctx) {
    throw new Error(
      `${componentName} must be used inside a <Dialog>. ` +
      `Make sure ${componentName} is a child of Dialog.`
    )
  }
  return ctx
}

// ─── Subcomponent — Dialog.Trigger ──────────────────────────────────────────

interface DialogTriggerProps {
  children: ReactNode
  asChild?: boolean
}

function DialogTrigger({ children, asChild = false }: DialogTriggerProps) {
  const { setOpen } = useDialogContext('Dialog.Trigger')

  const handleClick = useCallback(
    (event: ReactMouseEvent) => {
      // If wrapping a child, preserve its onClick
      if (asChild && isValidElement(children)) {
        const childOnClick = (children.props as any).onClick
        if (childOnClick) childOnClick(event)
      }
      setOpen(true)
    },
    [asChild, children, setOpen]
  )

  if (asChild && isValidElement(children)) {
    // Clone the child and inject onClick
    return cloneElement(children as ReactElement<any>, {
      onClick: handleClick,
    })
  }

  // Default: render a button
  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  )
}

DialogTrigger.displayName = 'Dialog.Trigger'

// ─── Subcomponent — Dialog.Title ────────────────────────────────────────────

interface DialogTitleProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'id'> {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

function DialogTitle({ children, as: Tag = 'h2', className, ...rest }: DialogTitleProps) {
  const { titleId } = useDialogContext('Dialog.Title')

  return (
    <Tag
      id={titleId}
      className={['text-lg font-semibold text-fg-strong mb-2', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}

DialogTitle.displayName = 'Dialog.Title'

// ─── Subcomponent — Dialog.Description ──────────────────────────────────────

interface DialogDescriptionProps extends Omit<HTMLAttributes<HTMLParagraphElement>, 'id'> {
  children: ReactNode
}

function DialogDescription({ children, className, ...rest }: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext('Dialog.Description')

  return (
    <p
      id={descriptionId}
      className={['text-sm text-fg-muted mb-4', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </p>
  )
}

DialogDescription.displayName = 'Dialog.Description'

// ─── Subcomponent — Dialog.Body ─────────────────────────────────────────────

interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function DialogBody({ children, className, ...rest }: DialogBodyProps) {
  return (
    <div className={['text-sm text-fg-base', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

DialogBody.displayName = 'Dialog.Body'

// ─── Subcomponent — Dialog.Footer ───────────────────────────────────────────

interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function DialogFooter({ children, className, ...rest }: DialogFooterProps) {
  return (
    <div
      className={[
        'flex items-center justify-end gap-2',
        'border-t border-border-muted pt-4 mt-4',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

DialogFooter.displayName = 'Dialog.Footer'

// ─── Dialog variant config ──────────────────────────────────────────────────

const dialog = cva(
  [
    'bg-surface-overlay text-fg-strong',
    'rounded-lg border border-border-muted shadow-lg',
    'p-6',
    'w-full',
    // Native <dialog> needs these for backdrop styling and centering
    'backdrop:bg-black/50',
    // Reset native <dialog> defaults
    'open:flex open:flex-col',
    'm-auto',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'max-w-[400px]',
        md: 'max-w-[560px]',
        lg: 'max-w-[720px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// ─── Dialog component ───────────────────────────────────────────────────────

export interface DialogProps
  extends Omit<HTMLAttributes<HTMLDialogElement>, 'children' | 'open'>,
    VariantProps<typeof dialog> {
  children?: ReactNode
  /** Controlled open state. If omitted, Dialog manages state via Dialog.Trigger. */
  open?: boolean
  /** Called when the dialog requests state change (trigger, escape, backdrop). */
  onOpenChange?: (open: boolean) => void
  /** Whether clicking the backdrop closes the dialog. Default: true. */
  closeOnBackdropClick?: boolean
  /** Whether Escape closes the dialog. Default: true. */
  closeOnEscape?: boolean
  /** Element to focus when the dialog opens. */
  initialFocusRef?: RefObject<HTMLElement>
}

const DialogBase = forwardRef<HTMLDialogElement, DialogProps>(
  (
    {
      size,
      open: controlledOpen,
      onOpenChange,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      initialFocusRef,
      className,
      children,
      ...rest
    },
    forwardedRef
  ) => {
    // Internal open state for uncontrolled mode
    const [internalOpen, setInternalOpen] = useState(false)

    // Determine if controlled and which state value is authoritative
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    // Setter that updates both internal state (uncontrolled) and notifies parent (controlled)
    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next)
        onOpenChange?.(next)
      },
      [isControlled, onOpenChange]
    )

    // Stable IDs for aria-labelledby and aria-describedby
    const titleId = useId()
    const descriptionId = useId()

    // Internal ref for the dialog element. Merge with forwarded ref.
    const internalRef = useRef<HTMLDialogElement | null>(null)
    const setRef = useCallback(
      (node: HTMLDialogElement | null) => {
        internalRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef]
    )

    // Sync `open` prop to native <dialog> methods
    useEffect(() => {
      const node = internalRef.current
      if (!node) return

      if (open && !node.open) {
        node.showModal()
        // Override focus if requested
        if (initialFocusRef?.current) {
          // Defer until after the browser's default focus has run
          queueMicrotask(() => {
            initialFocusRef.current?.focus()
          })
        }
      } else if (!open && node.open) {
        node.close()
      }
    }, [open, initialFocusRef])

    // Handle Escape key (native <dialog> emits 'cancel' event for Escape)
    useEffect(() => {
      const node = internalRef.current
      if (!node) return

      const handleCancel = (event: Event) => {
        if (!closeOnEscape) {
          event.preventDefault()
          return
        }
        setOpen(false)
      }

      const handleClose = () => {
        // Native close event — sync state if user closed via form method or programmatically
        if (open) setOpen(false)
      }

      node.addEventListener('cancel', handleCancel)
      node.addEventListener('close', handleClose)
      return () => {
        node.removeEventListener('cancel', handleCancel)
        node.removeEventListener('close', handleClose)
      }
    }, [closeOnEscape, open, setOpen])

    // Handle backdrop click
    const handleClick = useCallback(
      (event: ReactMouseEvent<HTMLDialogElement>) => {
        if (!closeOnBackdropClick) return
        // If the click target IS the dialog element itself (not content inside), it's a backdrop click
        if (event.target === internalRef.current) {
          setOpen(false)
        }
      },
      [closeOnBackdropClick, setOpen]
    )

    // Separate Trigger from dialog content — Trigger renders outside the <dialog>
    let trigger: ReactNode = null
    const dialogContent: ReactNode[] = []

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) {
        dialogContent.push(child)
        return
      }
      const componentType = child.type as any
      if (componentType?.displayName === 'Dialog.Trigger') {
        trigger = child
      } else {
        dialogContent.push(child)
      }
    })

    const contextValue: DialogContextValue = {
      titleId,
      descriptionId,
      open,
      setOpen,
    }

    return (
      <DialogContext.Provider value={contextValue}>
        {trigger}
        <dialog
          ref={setRef}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={[dialog({ size }), className].filter(Boolean).join(' ')}
          onClick={handleClick}
          {...rest}
        >
          {dialogContent}
        </dialog>
      </DialogContext.Provider>
    )
  }
)

DialogBase.displayName = 'Dialog'

// ─── Compound component export ──────────────────────────────────────────────

type DialogCompound = typeof DialogBase & {
  Trigger:     typeof DialogTrigger
  Title:       typeof DialogTitle
  Description: typeof DialogDescription
  Body:        typeof DialogBody
  Footer:      typeof DialogFooter
}

const DialogWithSubcomponents = DialogBase as DialogCompound
DialogWithSubcomponents.Trigger     = DialogTrigger
DialogWithSubcomponents.Title       = DialogTitle
DialogWithSubcomponents.Description = DialogDescription
DialogWithSubcomponents.Body        = DialogBody
DialogWithSubcomponents.Footer      = DialogFooter

export { DialogWithSubcomponents as Dialog }