import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cva } from 'class-variance-authority'

// ─── Types ──────────────────────────────────────────────────────────────────

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

type Position =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastOptions {
  duration?: number  // milliseconds; 0 = no auto-dismiss
  tone?: Tone
  action?: ToastAction
}

interface ToastRecord {
  id: string
  message: string
  tone: Tone
  duration: number  // resolved duration (provider default applied)
  action?: ToastAction
  exiting: boolean  // true once dismiss starts; toast stays mounted until animation ends
}

interface ToastAPI {
  show:    (message: string, options?: ToastOptions) => string
  info:    (message: string, options?: ToastOptions) => string
  success: (message: string, options?: ToastOptions) => string
  warning: (message: string, options?: ToastOptions) => string
  error:   (message: string, options?: ToastOptions) => string
  dismiss: (id?: string) => void  // dismiss specific id, or all if omitted
}

// ─── Context ────────────────────────────────────────────────────────────────
// useToast reads this to get the API methods. The provider creates the API
// once and provides it; consumers don't see queue state directly.

const ToastContext = createContext<ToastAPI | null>(null)

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return ctx
}

// ─── Provider ───────────────────────────────────────────────────────────────

export interface ToastProviderProps {
  children: ReactNode
  position?: Position
  defaultDuration?: number  // milliseconds
  max?: number              // maximum simultaneous toasts
  gap?: number              // pixels between stacked toasts
}

export function ToastProvider({
  children,
  position = 'bottom-right',
  defaultDuration = 5000,
  max = 3,
  gap = 8,
}: ToastProviderProps) {
  // ─── Queue state ──────────────────────────────────────────────────────────
  // The visible queue. Toasts are appended on trigger, marked `exiting` on
  // dismiss, and fully removed after their exit animation completes.
  const [queue, setQueue] = useState<ToastRecord[]>([])

  // ─── Per-toast timers ────────────────────────────────────────────────────
  // Map of toast id → setTimeout handle. Refs (not state) because timer
  // handles aren't render-relevant — they're side-effect bookkeeping.
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // ─── Per-toast remaining duration ────────────────────────────────────────
  // When a toast is paused via hover, we need to know how much time was left
  // so we can resume from there (not reset). This map tracks the resume value.
  const remainingRef = useRef<Map<string, number>>(new Map())
  const startTimeRef = useRef<Map<string, number>>(new Map())

  // ─── Portal mount detection (SSR guard) ──────────────────────────────────
  // createPortal can only target document.body on the client. On first render
  // during SSR, document is undefined. After hydration, mount and render.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // ─── Internal: clear a timer ─────────────────────────────────────────────
  const clearToastTimer = useCallback((id: string) => {
    const handle = timersRef.current.get(id)
    if (handle) {
      clearTimeout(handle)
      timersRef.current.delete(id)
    }
  }, [])

  // ─── Internal: mark a toast as exiting ───────────────────────────────────
  // The toast stays in the queue with exiting=true so its exit animation
  // plays. After the transitionend event in the Toast component, the toast
  // is removed via removeToast below.
  const startExit = useCallback((id: string) => {
    clearToastTimer(id)
    remainingRef.current.delete(id)
    startTimeRef.current.delete(id)
    setQueue(q => q.map(t => t.id === id ? { ...t, exiting: true } : t))
  }, [clearToastTimer])

  // ─── Internal: remove a toast from the queue (after animation) ───────────
  const removeToast = useCallback((id: string) => {
    setQueue(q => q.filter(t => t.id !== id))
  }, [])

  // ─── Internal: start an auto-dismiss timer for a toast ───────────────────
  const startTimer = useCallback((id: string, duration: number) => {
    if (duration <= 0) return  // duration=0 means no auto-dismiss
    startTimeRef.current.set(id, Date.now())
    remainingRef.current.set(id, duration)
    const handle = setTimeout(() => startExit(id), duration)
    timersRef.current.set(id, handle)
  }, [startExit])

  // ─── Internal: pause a toast's timer (called from Toast on mouseenter) ───
  const pauseTimer = useCallback((id: string) => {
    const start = startTimeRef.current.get(id)
    const remaining = remainingRef.current.get(id)
    if (start === undefined || remaining === undefined) return
    const elapsed = Date.now() - start
    const newRemaining = Math.max(0, remaining - elapsed)
    remainingRef.current.set(id, newRemaining)
    clearToastTimer(id)
  }, [clearToastTimer])

  // ─── Internal: resume a toast's timer (called from Toast on mouseleave) ──
  const resumeTimer = useCallback((id: string) => {
    const remaining = remainingRef.current.get(id)
    if (remaining === undefined || remaining <= 0) return
    startTimer(id, remaining)
  }, [startTimer])

  // ─── Internal: enqueue a new toast ───────────────────────────────────────
  // Generates an id, resolves duration, adds to queue, starts timer, and
  // evicts oldest if over max. Returns the new id so consumers can dismiss
  // specifically.
  const enqueue = useCallback((message: string, options: ToastOptions = {}, tone: Tone): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const duration = options.duration ?? defaultDuration

    const record: ToastRecord = {
      id,
      message,
      tone: options.tone ?? tone,
      duration,
      action: options.action,
      exiting: false,
    }

    setQueue(q => {
      const next = [...q, record]
      // Evict oldest if over max — mark exiting, animation will play, then remove
      if (next.length > max) {
        const oldest = next[0]
        if (oldest && !oldest.exiting) {
          // Schedule eviction outside the setState callback to avoid setState-in-setState
          queueMicrotask(() => startExit(oldest.id))
        }
      }
      return next
    })

    startTimer(id, duration)
    return id
  }, [defaultDuration, max, startTimer, startExit])

  // ─── API exposed to consumers ─────────────────────────────────────────────
  // The `api` object is stable across renders so consumers' useEffects that
  // depend on it don't re-run unnecessarily. Each method is a thin wrapper
  // around enqueue with the tone pre-set.
  const api = useRef<ToastAPI | null>(null)
  if (api.current === null) {
    api.current = {
      show:    (message, options) => enqueue(message, options, options?.tone ?? 'neutral'),
      info:    (message, options) => enqueue(message, options, 'info'),
      success: (message, options) => enqueue(message, options, 'success'),
      warning: (message, options) => enqueue(message, options, 'warning'),
      error:   (message, options) => enqueue(message, options, 'danger'),
      dismiss: (id) => {
        if (id === undefined) {
          // Dismiss all
          queue.forEach(t => { if (!t.exiting) startExit(t.id) })
        } else {
          startExit(id)
        }
      },
    }
  }
  // Methods that close over latest queue need updating. The api object identity
  // is stable, but its method bodies need to see the current queue for "dismiss
  // all" to work. Update the dismiss method on each render (cheap).
  if (api.current) {
    api.current.dismiss = (id) => {
      if (id === undefined) {
        queue.forEach(t => { if (!t.exiting) startExit(t.id) })
      } else {
        startExit(id)
      }
    }
  }

  // ─── Cleanup all timers on provider unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      timersRef.current.forEach(handle => clearTimeout(handle))
      timersRef.current.clear()
      remainingRef.current.clear()
      startTimeRef.current.clear()
    }
  }, [])

  // ─── Render ───────────────────────────────────────────────────────────────
  const stackClass = positionToStackClass[position]
  const reverseStack = position.startsWith('bottom')  // newest closer to edge

  const stack = (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className={`fixed z-[9999] pointer-events-none flex flex-col ${stackClass}`}
      style={{ gap: `${gap}px` }}
    >
      {(reverseStack ? [...queue].reverse() : queue).map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => startExit(toast.id)}
          onRemove={() => removeToast(toast.id)}
          onPause={() => pauseTimer(toast.id)}
          onResume={() => resumeTimer(toast.id)}
        />
      ))}
    </div>
  )

  return (
    <ToastContext.Provider value={api.current!}>
      {children}
      {mounted && createPortal(stack, document.body)}
    </ToastContext.Provider>
  )
}

// ─── Position to Tailwind utility map ───────────────────────────────────────

const positionToStackClass: Record<Position, string> = {
  'top-left':      'top-4 left-4 items-start',
  'top-center':    'top-4 left-1/2 -translate-x-1/2 items-center',
  'top-right':     'top-4 right-4 items-end',
  'bottom-left':   'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right':  'bottom-4 right-4 items-end',
}

// ─── Toast visual component ─────────────────────────────────────────────────
// Rendered by the provider; consumers don't touch this directly.
// Owns: enter animation on mount, exit animation when toast.exiting flips,
// pause/resume on hover (and focus-within for keyboard parity).

interface ToastItemProps {
  toast: ToastRecord
  onDismiss: () => void
  onRemove: () => void
  onPause: () => void
  onResume: () => void
}

const toastVariants = cva(
  [
    'pointer-events-auto',
    'flex items-start gap-3',
    'min-w-[300px] max-w-[440px]',
    'p-4 rounded-md shadow-lg',
    'bg-surface-overlay text-fg-strong',
    'border-l-[3px]',
    'transition-[opacity,transform]',
    'duration-200',
  ].join(' '),
  {
    variants: {
      tone: {
        neutral: 'border-neutral-base',
        info:    'border-primary-base',
        success: 'border-success-base',
        warning: 'border-warning-base',
        danger:  'border-danger-base',
      },
    },
  }
)

function ToastItem({ toast, onDismiss, onRemove, onPause, onResume }: ToastItemProps) {
  // Enter animation: render with `entered=false` for one paint, then flip to true
  // so the transition runs. Without this, the transition has no "from" state.
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    // requestAnimationFrame ensures the browser has painted the initial state
    // before we change to the entered state, so the transition is observable.
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Exit animation: when toast.exiting flips to true, the className changes to
  // the exit state, which triggers the CSS transition. transitionend fires
  // when the animation finishes, and we then call onRemove.
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // transitionend fires for every transitioning property. Only act on the
    // opacity one (any single property works; we just want one signal).
    if (e.propertyName !== 'opacity') return
    if (toast.exiting) onRemove()
  }

  // Animation states encoded as transform/opacity classes
  const animClass = toast.exiting
    ? 'opacity-0 translate-y-2'
    : entered
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-2'

  return (
    <div
      role="status"
      className={`${toastVariants({ tone: toast.tone })} ${animClass}`}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocus={onPause}
      onBlur={onResume}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="flex-1 text-sm">{toast.message}</div>

      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action!.onClick()
            onDismiss()
          }}
          className="text-sm font-medium text-fg-strong underline underline-offset-2 hover:opacity-80"
        >
          {toast.action.label}
        </button>
      )}

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="text-fg-muted hover:text-fg-strong text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}