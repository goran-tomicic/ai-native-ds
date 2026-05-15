# Toast

Transient notification that appears in response to an event, auto-dismisses after a timeout, and stacks with other toasts. Unlike every other component in this system, Toast is imperative: you don't render it, you trigger it via the useToast hook. The ToastProvider must wrap the app; useToast returns trigger functions; the visual Toast is rendered by the provider and rarely touched directly. Use for confirmations of background actions (save succeeded, item deleted, upload failed). Not for content that requires acknowledgment — use Dialog for that.

## Import

```jsx
import { Toast } from '@ai-native-ds/toast'
```

This component is part of the ai-native-ds package and is available as a callable React component.

## Architecture

Toast is three coordinated pieces, not one component.

**ToastProvider** — Wraps the app (typically at the root). Owns the toast queue state, renders the visual stack in a fixed-position container, manages timers. Configured once with position and default duration.

**useToast** — Hook consumed anywhere inside the provider. Returns an object with trigger methods (toast.success, toast.error, toast.info, toast.warning, toast.show, and toast.dismiss). This is the API consumers actually use.

**Toast (visual)** — The individual notification element. Rendered by ToastProvider from queue state. Consumers do not render this directly. Documented here for completeness and styling reference.

## Usage

```jsx
import { ToastProvider } from '@ai-native-ds/toast'

function App() {
  return (
    <ToastProvider position="bottom-right" defaultDuration={5000}>
      <YourApp />
    </ToastProvider>
  )
}
```

## Props


### ToastProvider

position: top-left | top-center | top-right | bottom-left | bottom-center | bottom-right (default: "bottom-right")
defaultDuration: number (default: 5000)
max: number (default: 3)
gap: number (default: 8)
children: ReactNode

### useToastTrigger

message: string
options: object (optional)
  duration: number (optional)
  tone: neutral | info | success | warning | danger (optional)
  action: object (optional)

### Toast

tone: neutral | info | success | warning | danger (default: "neutral")
message: string
action: object (optional)
onDismiss: () => void

## useToast API

The object returned by useToast().

`toast.show(message, options?)` — Generic toast. tone defaults to neutral unless set in options.
`toast.info(message, options?)` — Info toast (tone: info).
`toast.success(message, options?)` — Success toast (tone: success). For confirmations of completed actions.
`toast.warning(message, options?)` — Warning toast (tone: warning).
`toast.error(message, options?)` — Danger toast (tone: danger). For failures. Consider duration: 0 so the user doesn't miss it.
`toast.dismiss(id?)` — Dismiss a specific toast by id, or all toasts if no id given. Each trigger method returns the toast's id for this purpose.

## States

entering, visible, paused, exiting

## Behavior

**queue** — Toasts stack in trigger order. Newest appears nearest the triggering edge (e.g. bottom for bottom-right). When max is exceeded, the oldest is dismissed.

**timing** — Each toast auto-dismisses after its duration (or the provider default). duration:0 disables auto-dismiss.

**pauseOnHover** — Hovering any toast pauses the auto-dismiss timer for that toast. Leaving resumes it from where it paused (not a full reset). This prevents toasts vanishing mid-read.

**enterExit** — Toasts animate in (slide + fade from the triggering edge) and out (fade + slight slide). Exit animation completes before the toast is removed from the DOM and the stack reflows.

**stacking** — Toasts are gap-separated. When one dismisses, the rest reflow to close the gap with a transition.

## Effects

enter_transition: transform 200ms ease, opacity 200ms ease
exit_transition: transform 150ms ease, opacity 150ms ease
reflow_transition: transform 200ms ease

## Rules

- Wrap the app in ToastProvider once, near the root
- Use the semantic trigger methods (toast.success, toast.error) rather than toast.show with a tone option — clearer intent
- Keep messages short and glanceable — one line
- Use toast.error with duration: 0 for failures the user must acknowledge
- Use a toast action sparingly — 'Undo' on a delete is the canonical good case
- Use toasts to confirm background actions: save, delete, upload, copy
- DON'T: Don't put essential information only in a toast — they vanish and are easily missed
- DON'T: Don't use a toast when the user must make a decision — that's a Dialog
- DON'T: Don't stack many toasts — the max default of 3 is deliberate; if you're triggering more, reconsider
- DON'T: Don't put long messages in toasts — if it doesn't fit one line, it's not a toast
- DON'T: Don't use a toast action for anything destructive or irreversible — the toast may dismiss before the user clicks
- DON'T: Don't render the Toast component directly — trigger via useToast

## Anti-patterns

toast.show('Are you sure you want to delete this? Click undo to cancel.')
  → <Dialog> ... confirmation with Cancel / Delete ... </Dialog>
  A toast asking for a decision is the wrong component. Toasts are transient and auto-dismiss — the user may never see it, or it may vanish before they act. Decisions need a Dialog.

toast.success('Your report for Q3 2024 has been generated and is now available in the Reports section under the Analytics tab. It includes data from all regions.')
  → toast.success('Q3 report ready')
  Toasts are glanceable, not readable. Long messages don't fit the format and the toast will likely dismiss before a long message can be read. If there's more to say, the toast confirms and a persistent UI element holds the detail.

items.forEach(item => toast.success(`Synced ${item.name}`))
  → toast.success(`Synced ${items.length} items`)
  Triggering many toasts at once overwhelms the screen and hits the max limit, causing toasts to dismiss each other. Aggregate into one toast.

<ToastProvider><Header /></ToastProvider>
<ToastProvider><Main /></ToastProvider>
  → <ToastProvider><Header /><Main /></ToastProvider>
  Multiple ToastProviders create multiple independent queues and stacks — toasts from different parts of the app appear in different places with different state. One provider at the root.

## Examples

Provider setup: import { ToastProvider } from '@ai-native-ds/toast'

function App() {
  return (
    <ToastProvider position="bottom-right" defaultDuration={5000}>
      <YourApp />
    </ToastProvider>
  )
}  // Once, at the app root
Success confirmation: const toast = useToast()

async function handleSave() {
  await saveChanges()
  toast.success('Changes saved')
}  // Confirming a completed background action
Error that persists: const toast = useToast()

async function handleUpload() {
  try {
    await upload(file)
    toast.success('File uploaded')
  } catch {
    toast.error('Upload failed. Check your connection.', { duration: 0 })
  }
}  // Failure the user must see — duration 0 means no auto-dismiss
Toast with undo action: const toast = useToast()

function handleDelete(item) {
  deleteItem(item)
  toast.show('Item deleted', {
    action: { label: 'Undo', onClick: () => restoreItem(item) },
  })
}  // The canonical good use of a toast action

## Use instead when

Dialog — the user must make a decision or acknowledge something before continuing
Badge — the status is persistent and tied to an element, not a transient event
Alert/Callout — the message is persistent and inline in the page, not transient — note: Alert not yet built
