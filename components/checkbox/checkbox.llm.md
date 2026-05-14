# Checkbox

Binary or tri-state checkbox built on native input[type=checkbox]. Composes with FormField for label, helper, and error layout. Supports an indeterminate state for 'some but not all' selections (e.g., a select-all checkbox when only some children are checked).

## Import

```jsx
import { Checkbox } from '@ai-native-ds/checkbox'
```

This component is part of the ai-native-ds package and is available as a callable React component.

## Usage

```jsx
<FormField>
  <FormField.Label>Subscribe to newsletter</FormField.Label>
  <Checkbox />
</FormField>
```

## Props

size: sm | md | lg (default: "md")
checked: boolean (optional)
defaultChecked: boolean (optional)
indeterminate: boolean (default: false)
disabled: boolean (default: false)
onChange: (event: ChangeEvent<HTMLInputElement>) => void (optional)
name: string (optional)
value: string (optional)

## States

default, checked, indeterminate, disabled, focus

## Effects

disabled_opacity: 0.4
transition: background-color 120ms ease, border-color 120ms ease

## Rules

- Wrap in FormField for label and layout
- Use indeterminate for parent checkboxes controlling a group
- Use Checkbox for independent binary choices — if choices are mutually exclusive, use Radio
- DON'T: Don't use Checkbox for mutually exclusive choices — that's Radio's job
- DON'T: Don't override the disabled opacity
- DON'T: Don't use indeterminate as a permanent state — it represents a transitional 'some selected' condition

## Anti-patterns

<Checkbox /> <span>Accept terms</span>
  → <FormField><FormField.Label>Accept terms</FormField.Label><Checkbox /></FormField>
  A standalone span next to a checkbox has no programmatic association. FormField wires the label correctly.

## Examples

Basic checkbox in FormField: <FormField>
  <FormField.Label>Subscribe to newsletter</FormField.Label>
  <Checkbox />
</FormField>  // Opt-in checkbox
Indeterminate parent: <Checkbox
  checked={allChecked}
  indeterminate={someChecked && !allChecked}
  onChange={toggleAll}
/>  // Select-all checkbox controlling a list

## Use instead when

Radio — choices are mutually exclusive
Switch — the choice toggles a setting on/off with immediate effect
