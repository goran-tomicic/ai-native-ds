# Radio

Single option within a mutually-exclusive group. Built on native input[type=radio]. Must be used inside a RadioGroup — RadioGroup owns the shared name, selected value, and change handler. A Radio outside a RadioGroup has no group semantics.

## Import

```jsx
import { Radio } from '@ai-native-ds/radio'
```

This component is part of the ai-native-ds package and is available as a callable React component.

## Usage

```jsx
<RadioGroup name="plan" value={plan} onChange={setPlan}>
  <FormField><FormField.Label>Free</FormField.Label><Radio value="free" /></FormField>
  <FormField><FormField.Label>Pro</FormField.Label><Radio value="pro" /></FormField>
</RadioGroup>
```

## Props

value: string
size: sm | md | lg (default: "md")
disabled: boolean (default: false)

## States

default, selected, disabled, focus

## Effects

disabled_opacity: 0.4
transition: border-color 120ms ease

## Rules

- Always use Radio inside a RadioGroup
- Give each Radio a unique value within its group
- Use Radio when exactly one choice must be selected from a set
- DON'T: Don't use Radio outside a RadioGroup — it loses group semantics and keyboard navigation
- DON'T: Don't use Radio for independent choices — that's Checkbox
- DON'T: Don't use Radio for on/off toggles — that's Switch

## Anti-patterns

<Radio value="a" /> <Radio value="b" />
  → <RadioGroup name="choice" value={v} onChange={setV}><Radio value="a" /><Radio value="b" /></RadioGroup>
  Radios outside a RadioGroup have no shared name, no enforced single-selection, and no arrow-key navigation. RadioGroup provides all three.

## Examples

Radio inside RadioGroup: <RadioGroup name="plan" value={plan} onChange={setPlan}>
  <FormField><FormField.Label>Free</FormField.Label><Radio value="free" /></FormField>
  <FormField><FormField.Label>Pro</FormField.Label><Radio value="pro" /></FormField>
</RadioGroup>  // Plan selection

## Use instead when

Checkbox — choices are independent (multiple can be selected)
Select — there are many options and space is limited
