# FormField

Layout wrapper for form controls. Provides label, helper text, error message, and required indicator with correct ARIA wiring. Auto-generates ID and htmlFor association via React Context so consumers don't have to manage them manually. Compose with Input, Checkbox, Radio, Switch, Select, or any form control as its single inner control child.

## Import

```jsx
import { FormField } from '@ai-native-ds/formfield'
```

This component is part of the ai-native-ds package and is available as a callable React component.

## Usage

```jsx
<FormField>
  <FormField.Label>Email</FormField.Label>
  <Input type="email" />
</FormField>
```

## Props

required: boolean (default: false)
invalid: boolean (default: false)
id: string (optional)

## States

default, invalid, required

## Rules

- Wrap all form controls in FormField for consistent label/helper/error layout
- Use FormField.Label as the first child — accessibility requires it
- Set required=true and pair with FormField.Error when needed
- Pair invalid=true with FormField.Error so the inner control's state reflects the validation
- Let FormField auto-generate IDs — manual ID management is error-prone
- DON'T: Don't render form controls without FormField unless the form is decorative or temporary
- DON'T: Don't manually set id/htmlFor — FormField handles this via context
- DON'T: Don't nest FormField inside FormField
- DON'T: Don't include label text inside the form control (e.g., Input's placeholder is not a label) — use FormField.Label
- DON'T: Don't render multiple form controls inside one FormField — one field per FormField

## Anti-patterns

<FormField>
  <FormField.Label htmlFor="email">Email *</FormField.Label>
  <Input id="email" />
</FormField>
  → <FormField required>
  <FormField.Label>Email</FormField.Label>
  <Input />
</FormField>
  Manual ID management is error-prone (forget one, screen readers silently fail). The * indicator for required should come from FormField's required prop, not manually appended to label text. Both are concerns FormField handles automatically.

<Input placeholder="Email address" />
  → <FormField>
  <FormField.Label>Email address</FormField.Label>
  <Input />
</FormField>
  Placeholders are not labels. They disappear when typing, fail screen reader requirements, and offer no accessible name. FormField provides the label correctly.

<FormField>
  <FormField.Label>Search</FormField.Label>
  <Input />
  <FormField.Helper>Required field.</FormField.Helper>
</FormField>
  → <FormField required>
  <FormField.Label>Search</FormField.Label>
  <Input />
</FormField>
  'Required' in helper text duplicates what the required prop already signals visually. Use FormField's required prop and reserve Helper for actually-helpful information.

<FormField>
  <FormField.Label>Sign me up</FormField.Label>
  <Checkbox />
  <Input placeholder="Email" />
</FormField>
  → <>
  <FormField>
    <FormField.Label>Sign me up</FormField.Label>
    <Checkbox />
  </FormField>
  <FormField>
    <FormField.Label>Email</FormField.Label>
    <Input />
  </FormField>
</>
  FormField wraps one control. Two controls in one FormField breaks the label association (the label can only point to one ID) and confuses screen readers about what the field is.

## Examples

Basic input with label: <FormField>
  <FormField.Label>Email</FormField.Label>
  <Input type="email" />
</FormField>  // Standard form field
With helper text: <FormField>
  <FormField.Label>Password</FormField.Label>
  <Input type="password" />
  <FormField.Helper>Minimum 8 characters with at least one number.</FormField.Helper>
</FormField>  // Password field with format requirements
Required field with error: <FormField required invalid>
  <FormField.Label>Full name</FormField.Label>
  <Input value="" />
  <FormField.Error>Name is required.</FormField.Error>
</FormField>  // Form submitted with empty required field
With Checkbox: <FormField>
  <FormField.Label>Subscribe to newsletter</FormField.Label>
  <Checkbox />
  <FormField.Helper>You can unsubscribe at any time.</FormField.Helper>
</FormField>  // Boolean opt-in (Checkbox composes the same way as Input)

## Subcomponents

### FormField.Label

Label for the form field. Automatically wires htmlFor to the inner control's ID. Renders the required indicator if FormField has required=true.

children: ReactNode

- Phrase labels as nouns or short noun phrases: 'Email', 'Full name', 'Date of birth'
- Place FormField.Label as the first child of FormField
- Use sentence case unless system convention requires otherwise
- DON'T: Don't include required indicator manually — FormField's required prop handles this
- DON'T: Don't include 'optional' as part of the label text — optional should be the default; mark required fields instead
- DON'T: Don't put long descriptions in the label — those belong in FormField.Helper

Example (Standard form field label):
```jsx
<FormField.Label>Email</FormField.Label>
```

### FormField.Helper

Helper text below the control. Provides context, format hints, or examples. Non-critical information that helps the user complete the field correctly.

children: ReactNode

- Use helper text for format examples ('e.g., name@company.com'), constraints ('Minimum 8 characters'), or context ('Visible to your team only')
- Keep it short — one sentence
- Render helper text below the control, above any error message
- DON'T: Don't put error messages here — use FormField.Error
- DON'T: Don't repeat the label content
- DON'T: Don't render Helper and Error simultaneously for the same condition — Error replaces Helper when both are present

Example (Password field guidance):
```jsx
<FormField.Helper>Use a strong password with at least 12 characters.</FormField.Helper>
```

### FormField.Error

Error message below the control. Replaces helper text when present. Marked with aria-live so screen readers announce the error when it appears.

children: ReactNode

- Be specific: 'Email must include @' is better than 'Invalid email'
- Suggest a fix when possible: 'Password too short — minimum 8 characters'
- Render Error only when there's a real validation error — empty FormField.Error elements are noise
- Pair FormField.Error with FormField invalid=true so the inner control also gets the error state
- DON'T: Don't render generic errors like 'Required' — be specific about what's required and why
- DON'T: Don't render Error and Helper simultaneously — Error replaces Helper
- DON'T: Don't include the field name in the error if the label already shows it — 'Required' is redundant when the Email label already shows the field

Example (Email validation failure):
```jsx
<FormField.Error>Email must include an @ symbol.</FormField.Error>
```

## Use instead when

Fieldset — you need to group multiple related fields under one legend — not yet built
RadioGroup — wrapping a set of Radio controls that share semantics — handled internally by Radio component
