# Dialog

Modal dialog. Built on the native HTML <dialog> element with showModal() semantics: focus trap, escape-to-close, and top-layer rendering handled by the browser. Composes with Dialog.Title (required for accessibility), Dialog.Description (optional but recommended), Dialog.Body, Dialog.Footer, and Dialog.Trigger. For non-modal floating content, use Popover (separate component, future).

## Import

```jsx
import { Dialog } from '@ai-native-ds/dialog'
```

This component is part of the ai-native-ds package and is available as a callable React component.

## Usage

```jsx
<Dialog>
  <Dialog.Trigger asChild>
    <Button palette="danger" variant="solid">Delete account</Button>
  </Dialog.Trigger>
  <Dialog.Title>Delete your account?</Dialog.Title>
  <Dialog.Description>This action is permanent and cannot be undone. Your projects, files, and collaborator access will be removed.</Dialog.Description>
  <Dialog.Footer>
    <Button palette="neutral" variant="subtle">Cancel</Button>
    <Button palette="danger" variant="solid">Delete account</Button>
  </Dialog.Footer>
</Dialog>
```

## Props

size: sm | md | lg (default: "md")
  sm — 400px max-width. Use for confirmations, simple prompts, login forms.
  md — 560px max-width. Default. Comfortable for most forms, settings panels, content review.
  lg — 720px max-width. Use for complex forms, multi-step flows, side-by-side comparisons. Beyond this size, consider a dedicated page instead of a dialog.
open: boolean (optional)
onOpenChange: (open: boolean) => void (optional)
closeOnBackdropClick: boolean (default: true)
closeOnEscape: boolean (default: true)
initialFocusRef: RefObject<HTMLElement> (optional)

## States

closed, opening, open, closing

## Effects

open_transition: opacity 150ms ease, transform 150ms ease
close_transition: opacity 100ms ease
open_transform: scale(1)
closed_transform: scale(0.96)
open_opacity: 1
closed_opacity: 0

## Rules

- Always include Dialog.Title — accessibility requires it
- Use Dialog.Description for any non-trivial action, especially destructive ones
- Set closeOnBackdropClick={false} for destructive dialogs and multi-step forms where accidental dismissal loses work
- Use initialFocusRef to focus the Cancel button (not the destructive action) in destructive dialogs — makes Escape the path of least resistance
- Keep dialog content focused on a single task — if you find yourself adding tabs or stepping through multi-page content, consider a dedicated page
- Use size='sm' for simple confirmations, 'md' for forms, 'lg' for complex content
- DON'T: Don't nest dialogs — open a second dialog requires closing the first. Native <dialog> behavior enforces this
- DON'T: Don't disable Escape key closing without strong justification — Escape is a fundamental keyboard expectation
- DON'T: Don't override the focus trap — the native <dialog> handles it correctly
- DON'T: Don't put navigation links or non-action buttons in Dialog.Footer — Footer is for the dialog's primary actions
- DON'T: Don't use Dialog for non-modal content (toasts, popovers, drawers) — those have their own components or are deferred

## Anti-patterns

<Dialog>
  <Dialog.Body>Are you sure?</Dialog.Body>
</Dialog>
  → <Dialog>
  <Dialog.Title>Confirm action</Dialog.Title>
  <Dialog.Description>Are you sure?</Dialog.Description>
  <Dialog.Footer>...</Dialog.Footer>
</Dialog>
  Dialog requires Dialog.Title for accessibility. Without it, screen readers announce a dialog with no name. The descriptive text belongs in Dialog.Description, not Dialog.Body.

<Dialog>
  <Dialog.Footer>
    <Button palette="danger" variant="solid">Delete</Button>
    <Button palette="neutral" variant="subtle">Cancel</Button>
  </Dialog.Footer>
</Dialog>
  → <Dialog>
  <Dialog.Footer>
    <Button palette="neutral" variant="subtle">Cancel</Button>
    <Button palette="danger" variant="solid">Delete</Button>
  </Dialog.Footer>
</Dialog>
  LTR convention is Cancel on the left, primary action on the right. Reversing the order breaks the user's muscle memory and increases the risk of accidental clicks.

<Dialog closeOnEscape={false} closeOnBackdropClick={false}>
  <Dialog.Title>Welcome</Dialog.Title>
  ...
</Dialog>
  → <Dialog>
  <Dialog.Title>Welcome</Dialog.Title>
  ...
</Dialog>
  Disabling both Escape and backdrop click creates a dialog with no dismissal affordance other than action buttons. This is a known accessibility antipattern unless the dialog represents a mandatory gate (terms of service, password requirement). For informational dialogs, leave the defaults.

<Dialog>
  <Dialog.Trigger asChild>
    <Button>Edit</Button>
  </Dialog.Trigger>
  <Dialog.Title>Edit settings</Dialog.Title>
  <Dialog.Body>
    <Button palette="primary" variant="solid">Save</Button>
  </Dialog.Body>
</Dialog>
  → <Dialog>
  <Dialog.Trigger asChild>
    <Button>Edit</Button>
  </Dialog.Trigger>
  <Dialog.Title>Edit settings</Dialog.Title>
  <Dialog.Body>...form fields...</Dialog.Body>
  <Dialog.Footer>
    <Button palette="neutral" variant="subtle">Cancel</Button>
    <Button palette="primary" variant="solid">Save</Button>
  </Dialog.Footer>
</Dialog>
  Primary action buttons belong in Dialog.Footer, not Dialog.Body. Footer is the conventional location for actions, has correct visual treatment (top border, end-aligned), and signals to the user where to look for what to do next.

## Examples

Destructive confirmation: <Dialog>
  <Dialog.Trigger asChild>
    <Button palette="danger" variant="solid">Delete account</Button>
  </Dialog.Trigger>
  <Dialog.Title>Delete your account?</Dialog.Title>
  <Dialog.Description>This action is permanent and cannot be undone. Your projects, files, and collaborator access will be removed.</Dialog.Description>
  <Dialog.Footer>
    <Button palette="neutral" variant="subtle">Cancel</Button>
    <Button palette="danger" variant="solid">Delete account</Button>
  </Dialog.Footer>
</Dialog>  // Destructive action requiring confirmation
Form dialog: <Dialog size="md" closeOnBackdropClick={false}>
  <Dialog.Trigger asChild>
    <Button palette="primary" variant="solid">Edit profile</Button>
  </Dialog.Trigger>
  <Dialog.Title>Edit your profile</Dialog.Title>
  <Dialog.Body>
    <FormField label="Name"><Input /></FormField>
    <FormField label="Bio"><Input /></FormField>
  </Dialog.Body>
  <Dialog.Footer>
    <Button palette="neutral" variant="subtle">Cancel</Button>
    <Button palette="primary" variant="solid">Save changes</Button>
  </Dialog.Footer>
</Dialog>  // Settings or profile edit
Informational acknowledgment: <Dialog size="sm">
  <Dialog.Title>Update available</Dialog.Title>
  <Dialog.Description>A new version of the app is available. The page will reload after you confirm.</Dialog.Description>
  <Dialog.Footer>
    <Button palette="primary" variant="solid">Reload</Button>
  </Dialog.Footer>
</Dialog>  // App update notification
Controlled dialog with programmatic open: const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Title>Confirm action</Dialog.Title>
  <Dialog.Description>Are you sure?</Dialog.Description>
  <Dialog.Footer>
    <Button palette="neutral" variant="subtle" onClick={() => setOpen(false)}>Cancel</Button>
    <Button palette="primary" variant="solid" onClick={handleConfirm}>Confirm</Button>
  </Dialog.Footer>
</Dialog>  // Programmatic dialog without Dialog.Trigger

## Subcomponents

### Dialog.Trigger

Element that opens the dialog. Typically wraps a Button. The trigger element receives focus when the dialog closes (focus restoration).

children: ReactNode
asChild: boolean (default: false)

- Use asChild=true when wrapping a Button to prevent nested <button> elements
- Place Dialog.Trigger as the first child of Dialog so it's outside the dialog content
- The trigger should describe what the dialog will do ('Delete account', 'Edit settings'), not just label its existence ('Open dialog')
- DON'T: Don't put Dialog.Trigger inside Dialog.Body or Dialog.Footer — it's a sibling of those, not a child
- DON'T: Don't use asChild=true with non-interactive elements like <div> — the trigger needs to be a real button for keyboard accessibility
- DON'T: Don't render multiple Dialog.Trigger elements in one Dialog — if you need multiple triggers, use controlled mode (open/onOpenChange) with separate buttons

Example (Destructive action requiring confirmation):
```jsx
<Dialog>
  <Dialog.Trigger asChild>
    <Button palette="danger" variant="solid">Delete account</Button>
  </Dialog.Trigger>
  <Dialog.Title>Delete your account?</Dialog.Title>
  ...
</Dialog>
```

### Dialog.Title

Required heading for the dialog. Maps to aria-labelledby. Rendered as an h2 by default.

children: ReactNode
as: string (default: "h2")

- Phrase the title as a question for confirmations ('Delete your account?')
- Phrase the title as a statement for informational dialogs ('Account deleted')
- Keep titles under ~50 characters — they're focusing elements, not full sentences
- DON'T: Don't omit Dialog.Title — even decorative dialogs need an accessible name
- DON'T: Don't put long form labels in the title — those belong in Dialog.Body or in the form itself
- DON'T: Don't use 'Dialog' or 'Modal' as the title — describe what the dialog does

Example (Destructive confirmation):
```jsx
<Dialog.Title>Delete your account?</Dialog.Title>
```
Example (Onboarding dialog):
```jsx
<Dialog.Title>Welcome to your dashboard</Dialog.Title>
```

### Dialog.Description

Optional descriptive text below the title. Maps to aria-describedby. Provides context, consequences, or instructions related to the dialog's action.

children: ReactNode

- Use Dialog.Description for consequences of destructive actions ('This cannot be undone')
- Use Dialog.Description for context that helps the user decide ('Your collaborators will lose access')
- Keep descriptions concise — long explanations belong in Dialog.Body
- DON'T: Don't repeat the title in the description
- DON'T: Don't put form fields or interactive content in Description — that's Body's job
- DON'T: Don't omit Description for destructive actions — the consequence statement is what makes the confirmation meaningful

Example (Account deletion confirmation):
```jsx
<Dialog.Description>This action is permanent and cannot be undone. Your projects, files, and collaborator access will be removed.</Dialog.Description>
```

### Dialog.Body

Main content area. Use for form fields, lists, embedded content, or anything that doesn't fit the title/description/footer pattern.

children: ReactNode

- Use Body for form content in dialogs with input (Input, Select, Checkbox, etc.)
- Use Body for content that's longer than Description allows
- Body is optional — simple confirmation dialogs may only need Title + Description + Footer
- DON'T: Don't put the title or description here — they have their own subcomponents
- DON'T: Don't put primary actions here — those belong in Dialog.Footer
- DON'T: Don't make Body extremely tall — if scrolling is required, consider a dedicated page instead of a dialog

Example (Login dialog):
```jsx
<Dialog.Body>
  <FormField label="Email"><Input type="email" /></FormField>
  <FormField label="Password"><Input type="password" /></FormField>
</Dialog.Body>
```

### Dialog.Footer

Footer with action buttons. Buttons are end-aligned (LTR) with primary action on the right. Top border separator.

children: ReactNode

- Place the primary action on the right (LTR): Cancel + Confirm, Cancel + Save, Cancel + Delete
- Use one primary action per dialog — competing primaries force the user to choose between two solid buttons
- Use palette='danger' variant='solid' for destructive primary actions, palette='primary' variant='solid' for constructive
- Use palette='neutral' variant='subtle' for the Cancel action
- DON'T: Don't reverse the order (Confirm + Cancel) — LTR convention is Cancel on left, primary on right
- DON'T: Don't include three or more buttons — if there are three actions, the dialog is doing too much
- DON'T: Don't omit a way to dismiss — even a button-less dialog needs Escape and backdrop close enabled

Example (Account deletion dialog):
```jsx
<Dialog.Footer>
  <Button palette="neutral" variant="subtle">Cancel</Button>
  <Button palette="danger" variant="solid">Delete account</Button>
</Dialog.Footer>
```
Example (Settings edit dialog):
```jsx
<Dialog.Footer>
  <Button palette="neutral" variant="subtle">Cancel</Button>
  <Button palette="primary" variant="solid">Save changes</Button>
</Dialog.Footer>
```

## Use instead when

Popover — the content is non-modal (doesn't block underlying interaction) — future component
Toast — the content is a transient notification — future component
Sheet — the content slides in from an edge (drawer pattern) — future component
Page — the content is complex enough that scrolling or multi-step navigation is needed
