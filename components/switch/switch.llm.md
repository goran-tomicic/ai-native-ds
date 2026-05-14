# Switch

Toggle for a setting that takes immediate effect. Built on native input[type=checkbox] with role='switch'. Visually a sliding toggle. Use for on/off settings where the change applies immediately (not for form fields that are submitted later — use Checkbox for those).

## Import

```jsx
import { Switch } from '@ai-native-ds/switch'
```

This component is part of the ai-native-ds package and is available as a callable React component.

## Usage

```jsx
<FormField>
  <FormField.Label>Email notifications</FormField.Label>
  <Switch checked={emailOn} onChange={(e) => setEmailOn(e.target.checked)} />
</FormField>
```

## Props

size: sm | md | lg (default: "md")
checked: boolean (optional)
defaultChecked: boolean (optional)
disabled: boolean (default: false)
onChange: (event: ChangeEvent<HTMLInputElement>) => void (optional)

## States

off, on, disabled, focus

## Effects

disabled_opacity: 0.4
transition: background-color 150ms ease, transform 150ms ease

## Rules

- Use Switch for settings that take effect immediately (dark mode, notifications on/off, feature flags)
- Wrap in FormField for label and layout
- Pair the Switch with a label describing the setting in its 'on' meaning ('Email notifications', not 'Toggle notifications')
- DON'T: Don't use Switch for form fields submitted later — use Checkbox
- DON'T: Don't use Switch for choices that aren't binary on/off
- DON'T: Don't use Switch when the change needs confirmation — switches imply immediate, reversible effect

## Anti-patterns

<FormField><FormField.Label>Accept terms and conditions</FormField.Label><Switch /></FormField>
  → <FormField><FormField.Label>Accept terms and conditions</FormField.Label><Checkbox /></FormField>
  Accepting terms is a form input submitted on form submission, not an immediate-effect setting. Switch implies the change takes effect the instant it's toggled. Use Checkbox for form fields.

## Examples

Settings toggle: <FormField>
  <FormField.Label>Email notifications</FormField.Label>
  <Switch checked={emailOn} onChange={(e) => setEmailOn(e.target.checked)} />
</FormField>  // Notification setting that saves immediately

## Use instead when

Checkbox — the value is part of a form submitted later, or the choice isn't an immediate-effect setting
