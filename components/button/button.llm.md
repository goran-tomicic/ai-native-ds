# Button

Triggers an action. Use for: submitting forms, confirming dialogs, opening menus, primary actions in views. Not for navigation between pages — use Link. Not for binary toggles — use ToggleButton.

## Props

palette: neutral | primary | danger (default: "neutral")
  neutral — Default for most buttons. Use for: cancel, back, secondary actions, tertiary actions. The bulk of buttons in any UI should be neutral.
  primary — The single most important action in a view. Use for: submit, save, continue, confirm. Only one primary button per view, ever.
  danger — Irreversible or destructive actions. Use for: delete, remove, cancel-subscription, reset. Pair with confirmation when consequence is severe.
style: solid | subtle | ghost (default: "solid")
  solid — Filled background using palette base color. Highest visual weight. Reserve for primary and destructive actions where emphasis matters.
  subtle — Soft tinted background. Medium visual weight. Default for neutral palette buttons. Use when the action is important but shouldn't dominate.
  ghost — Transparent background, palette-tinted text. Lowest visual weight. Use for tertiary actions, toolbar buttons, dense UIs.
size: sm | md | lg (default: "md")
loading: boolean (default: false)
disabled: boolean (default: false)
iconStart: ReactNode (optional)
iconEnd: ReactNode (optional)
type: button | submit | reset (default: "button")
children: ReactNode

## States

default, hover, active, focus, disabled, loading

## Style → palette slot mapping

solid: bg={palette}.base, bg_hover={palette}.base-hover, bg_active={palette}.base-active, fg={palette}.contrast
subtle: bg={palette}.soft, bg_hover={palette}.soft-hover, bg_active={palette}.soft-active, fg={palette}.bold
ghost: bg=transparent, bg_hover={palette}.subtle, bg_active={palette}.soft, fg={palette}.bold

## Effects

disabled_opacity: 0.4
disabled_pointer_events: none
transition: background-color 120ms ease, opacity 120ms ease

## Rules

- Use verbs that describe the action: 'Save changes', 'Delete account', 'Send invite'
- One primary button per view — the single most important action
- Pair destructive buttons with confirmation when consequences are severe
- Place primary action on the right in LTR dialog footers
- Use type='submit' inside forms; type='button' everywhere else
- DON'T: Don't use 'Click here', 'OK', or 'Submit' without context
- DON'T: Don't use multiple primary buttons in the same view
- DON'T: Don't use a button for navigation — use Link
- DON'T: Don't override the disabled opacity — the dim is the affordance
- DON'T: Don't put icons on both sides unless one is decorative (chevron) and one is meaningful

## Anti-patterns

<Button palette="primary" style="solid">Cancel</Button>
  → <Button palette="neutral" style="subtle">Cancel</Button>
  Cancel is a low-emphasis action. Solid primary reserved for the canonical action of the view.

<Button palette="danger" style="solid" onClick={() => navigate('/profile')}>View Profile</Button>
  → <Link href="/profile">View Profile</Link>
  Navigation belongs to Link. Buttons trigger actions. Destructive palette implies destructive action.

<Button disabled style={{ opacity: 1 }}>Save</Button>
  → <Button disabled>Save</Button>
  Disabled appearance is the visual cue users expect. Overriding opacity keeps the button looking active when it isn't, which is misleading.

## Examples

Primary submit: <Button palette="primary" style="solid" type="submit">Save changes</Button>  // Form footer
Destructive with confirmation: <Button palette="danger" style="solid" onClick={confirmDelete}>Delete account</Button>  // Settings page, paired with confirmation dialog
Cancel in dialog: <Button palette="neutral" style="subtle">Cancel</Button>  // Dialog footer alongside primary action
Toolbar action: <Button palette="neutral" style="ghost" size="sm" iconStart={<EditIcon />}>Edit</Button>  // Dense toolbar, multiple actions
Loading state: <Button palette="primary" style="solid" loading>Saving</Button>  // After form submit, before response
Icon-end for dropdown: <Button palette="neutral" style="subtle" iconEnd={<ChevronDownIcon />}>Options</Button>  // Trigger for menu or popover

## Use instead when

Link — navigating to another page or view
IconButton — icon-only button, no text label
ToggleButton — binary on/off state
MenuButton — trigger for a menu — has its own composition
