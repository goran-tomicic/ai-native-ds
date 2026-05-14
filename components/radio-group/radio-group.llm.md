# RadioGroup

Container for a set of mutually-exclusive Radio options. Owns the shared name, the selected value, and the change handler. Provides these to child Radio components via context. Radios inside a RadioGroup automatically get correct single-selection behavior and keyboard navigation.

## Import

```jsx
import { RadioGroup } from '@ai-native-ds/radiogroup'
```

This component is part of the ai-native-ds package and is available as a callable React component.

## Usage

```jsx
<FormField>
  <FormField.Label>Subscription plan</FormField.Label>
  <RadioGroup name="plan" value={plan} onChange={setPlan}>
    <FormField><FormField.Label>Free</FormField.Label><Radio value="free" /></FormField>
    <FormField><FormField.Label>Pro</FormField.Label><Radio value="pro" /></FormField>
    <FormField><FormField.Label>Enterprise</FormField.Label><Radio value="enterprise" /></FormField>
  </RadioGroup>
</FormField>
```

## Props

name: string
value: string (optional)
defaultValue: string (optional)
onChange: (value: string) => void (optional)
size: sm | md | lg (default: "md")
disabled: boolean (default: false)
orientation: vertical | horizontal (default: "vertical")

## States

default, disabled

## Rules

- Always wrap Radio components in a RadioGroup
- Give RadioGroup a meaningful name for form submission
- Wrap the whole RadioGroup in a FormField if the group needs a label (it usually does)
- Use horizontal orientation only for 2-3 short options
- DON'T: Don't put non-Radio interactive content inside RadioGroup
- DON'T: Don't nest RadioGroups
- DON'T: Don't use a RadioGroup with a single Radio — if there's only one option, it's a Checkbox

## Anti-patterns

<RadioGroup name="only"><Radio value="yes" /></RadioGroup>
  → <FormField><FormField.Label>Accept terms</FormField.Label><Checkbox /></FormField>
  A RadioGroup with a single option is a binary choice — that's a Checkbox. RadioGroup is for selecting one of several.

## Examples

Controlled RadioGroup with FormField label: <FormField>
  <FormField.Label>Subscription plan</FormField.Label>
  <RadioGroup name="plan" value={plan} onChange={setPlan}>
    <FormField><FormField.Label>Free</FormField.Label><Radio value="free" /></FormField>
    <FormField><FormField.Label>Pro</FormField.Label><Radio value="pro" /></FormField>
    <FormField><FormField.Label>Enterprise</FormField.Label><Radio value="enterprise" /></FormField>
  </RadioGroup>
</FormField>  // Plan picker in a settings form
Horizontal orientation: <RadioGroup name="size" defaultValue="md" orientation="horizontal">
  <FormField><FormField.Label>S</FormField.Label><Radio value="sm" /></FormField>
  <FormField><FormField.Label>M</FormField.Label><Radio value="md" /></FormField>
  <FormField><FormField.Label>L</FormField.Label><Radio value="lg" /></FormField>
</RadioGroup>  // Compact size selector

## Use instead when

Select — there are many options (roughly 6+) or vertical space is constrained
Checkbox — multiple selections should be allowed
