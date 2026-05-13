# Input

Single-line text input. Composes with FormField for label/helper/error layout, and with Input.LeadingIcon / Input.TrailingIcon for adornments. Type-agnostic at this version: text only. Future: email, password, number, tel, etc.

## Import

```jsx
import { Input } from '@ai-native-ds/input'
```

This component is part of the ai-native-ds package and is available as a callable React component.

## Usage

```jsx
<Input placeholder="Email" />
```

## Props

state: default | error | success (default: "default")
  default — Initial state. No validation has fired or all fields are valid.
  error — Field has a validation problem. Pair with a FormField error message.
  success — Field has passed validation. Use sparingly — every valid field doesn't need a green ring.
variant: outlined | filled | ghost (default: "outlined")
  outlined — Default. Border on all sides, transparent background. Works on any surface.
  filled — Tinted background, no visible border at rest. Good for compact forms or when reducing visual noise.
  ghost — Transparent background, border only at bottom. Use sparingly — search bars, inline editing, dense UIs.
size: sm | md | lg (default: "md")
disabled: boolean (default: false)
readonly: boolean (default: false)
placeholder: string (optional)
value: string (optional)
defaultValue: string (optional)
onChange: (event: ChangeEvent<HTMLInputElement>) => void (optional)
name: string (optional)
id: string (optional)

## States

default, hover, focus, disabled, readonly, error, success

## Effects

disabled_opacity: 0.4
disabled_pointer_events: none
transition: border-color 120ms ease, background-color 120ms ease, opacity 120ms ease

## Rules

- Pair with FormField for label, helper text, and error messages
- Use placeholder for examples or format hints, not as a label substitute
- Match input size to surrounding form: sm for compact tables, md for forms, lg for hero auth pages
- When using state='error', also surface the error message in the FormField's error slot
- Set name and id when used in real forms — both are needed for label association and form submission
- DON'T: Don't use placeholder as a label — known a11y failure pattern
- DON'T: Don't use state='success' for every valid field — green rings on every input is visual noise
- DON'T: Don't override the disabled opacity — the dim is the affordance
- DON'T: Don't put a Button as a direct child — use Input.TrailingIcon with interactive=true
- DON'T: Don't reach for ghost variant outside of search bars or inline editing — outlined is the default for a reason

## Anti-patterns

<Input placeholder="Email address" />
  → <FormField label="Email"><Input placeholder="name@company.com" /></FormField>
  Placeholders disappear when typing and have known accessibility problems. Use FormField for the label, placeholder for format hints.

<Input state="error" />
  → <FormField error="Invalid email format"><Input state="error" /></FormField>
  Error visual without an error message means the user knows something is wrong but not what. Always pair state='error' with explanatory text in FormField.

<Input><Button onClick={clear}>Clear</Button></Input>
  → <Input><Input.TrailingIcon interactive><button onClick={clear} aria-label="Clear"><XIcon /></button></Input.TrailingIcon></Input>
  Button as a direct child won't render with proper hit area or styling inside an input. Use Input.TrailingIcon to compose interactive trailing elements correctly.

<Input variant="ghost" />
  → <Input variant="outlined" />
  Ghost variant has minimal visual affordance and is hard to discover. Reserve for search bars and inline editing where context already signals it's an input. Outlined is the right default for forms.

## Examples

Basic text input: <Input placeholder="Email" />  // Simple form field
Search input with leading icon: <Input variant="filled" placeholder="Search...">
  <Input.LeadingIcon><SearchIcon /></Input.LeadingIcon>
</Input>  // Header search bar
Error state: <Input state="error" value={email} onChange={handleChange} />  // Form field with validation error — pair with FormField error message
Disabled input: <Input value="Read-only value" disabled />  // Account email that can't be changed
Small size in toolbar: <Input size="sm" placeholder="Filter..." />  // Table filter or compact toolbar

## Subcomponents

### Input.LeadingIcon

Icon rendered inside the input on the left (LTR). Inherits the input's text color and adjusts padding so input text doesn't overlap the icon.

children: ReactNode

- Use for visual signals like a search magnifier, calendar icon for date input, or @ for email
- Keep icons monochromatic — they inherit currentColor
- DON'T: Don't use as an interactive button — leading icon is a visual cue, not a control. Use Input.TrailingIcon for interactive elements like clear-buttons.
- DON'T: Don't put text in here. Icons only.

Example (Search bar in a header):
```jsx
<Input>
  <Input.LeadingIcon><SearchIcon /></Input.LeadingIcon>
</Input>
```

### Input.TrailingIcon

Icon rendered inside the input on the right (LTR). Can be visual (validation indicator) or interactive (clear button, password toggle).

children: ReactNode
interactive: boolean (default: false)

- Use interactive=true for clear buttons, password visibility toggles, dropdown triggers
- When interactive, the child should be a Button or button-shaped element with proper aria-label
- DON'T: Don't put a Button component inside without interactive=true — clicks won't have proper hit area
- DON'T: Don't combine validation icons with interactive icons in the same trailing slot — split into a separate adornment if needed

Example (Search input with clear functionality):
```jsx
<Input value={value}>
  <Input.TrailingIcon interactive>
    <button onClick={() => setValue('')} aria-label="Clear"><XIcon /></button>
  </Input.TrailingIcon>
</Input>
```
Example (Successfully validated email field):
```jsx
<Input state="success">
  <Input.TrailingIcon><CheckIcon /></Input.TrailingIcon>
</Input>
```

## Use instead when

Textarea — multi-line text input is needed
Select — choosing from a known list of options
Combobox — filtering a list with text input
FormField — wrapping Input with label, helper, or error message
