import { useEffect, useState } from 'react'
import { Badge } from '../../components/badge/badge'
import { Button } from '../../components/button/button'
import { Input } from '../../components/input/input'
import { Card } from '../../components/card/card'
import { Dialog } from '../../components/dialog/dialog'
import { FormField } from '../../components/form-field/form-field'
import { Checkbox } from '../../components/checkbox/checkbox'
import { Radio } from '../../components/radio/radio'
import { RadioGroup } from '../../components/radio-group/radio-group'
import { Switch } from '../../components/switch/switch'

function DialogControlledExample() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button palette="primary" variant="solid" onClick={() => setOpen(true)}>
        Edit profile
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Title>Edit your profile</Dialog.Title>
        <Dialog.Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--color-common-fg-muted)' }}>Name</label>
              <Input defaultValue="Goran Tomicic" />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--color-common-fg-muted)' }}>Bio</label>
              <Input defaultValue="Designer" />
            </div>
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Button palette="neutral" variant="subtle" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button palette="primary" variant="solid" onClick={() => setOpen(false)}>
            Save changes
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  )
}

function RadioGroupExample() {
  const [plan, setPlan] = useState('free')
  return (
    <FormField>
      <FormField.Label>Subscription plan</FormField.Label>
      <RadioGroup name="plan" value={plan} onChange={setPlan}>
        <FormField>
          <FormField.Label>Free</FormField.Label>
          <Radio value="free" />
        </FormField>
        <FormField>
          <FormField.Label>Pro</FormField.Label>
          <Radio value="pro" />
        </FormField>
        <FormField>
          <FormField.Label>Enterprise</FormField.Label>
          <Radio value="enterprise" />
        </FormField>
      </RadioGroup>
      <FormField.Helper>Selected: {plan}</FormField.Helper>
    </FormField>
  )
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="page">
      <header style={{ marginBottom: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--color-common-fg-base)' }}>ai-native-ds</h1>
          <p style={{ color: 'var(--color-common-fg-muted)', margin: '4px 0 0' }}>
            Components — Day 6
          </p>
        </div>
        <Button
          palette="neutral"
          variant="subtle"
          size="sm"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? '☾ Dark' : '☀ Light'}
        </Button>
      </header>

      {/* BUTTON SECTIONS */}

      <section className="section">
        <h2>Button — solid variant</h2>
        <div className="row">
          <Button palette="neutral" variant="solid">Neutral</Button>
          <Button palette="primary" variant="solid">Primary</Button>
          <Button palette="danger" variant="solid">Danger</Button>
        </div>
      </section>

      <section className="section">
        <h2>Button — subtle variant</h2>
        <div className="row">
          <Button palette="neutral" variant="subtle">Neutral</Button>
          <Button palette="primary" variant="subtle">Primary</Button>
          <Button palette="danger" variant="subtle">Danger</Button>
        </div>
      </section>

      <section className="section">
        <h2>Button — ghost variant</h2>
        <div className="row">
          <Button palette="neutral" variant="ghost">Neutral</Button>
          <Button palette="primary" variant="ghost">Primary</Button>
          <Button palette="danger" variant="ghost">Danger</Button>
        </div>
      </section>

      <section className="section">
        <h2>Sizes</h2>
        <div className="row" style={{ alignItems: 'center' }}>
          <Button palette="primary" size="sm">Small</Button>
          <Button palette="primary" size="md">Medium</Button>
          <Button palette="primary" size="lg">Large</Button>
        </div>
      </section>

      <section className="section">
        <h2>States</h2>
        <div className="row">
          <Button palette="primary">Default</Button>
          <Button palette="primary" disabled>Disabled</Button>
          <Button
            palette="primary"
            loading={loading}
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 1500)
            }}
          >
            {loading ? 'Saving' : 'Click to load'}
          </Button>
        </div>
      </section>

      <section className="section">
        <h2>Realistic compositions</h2>
        <div className="row">
          <Button palette="primary" variant="solid" type="submit">Save changes</Button>
          <Button palette="neutral" variant="subtle">Cancel</Button>
        </div>
        <div className="row" style={{ marginTop: 'var(--space-4)' }}>
          <Button palette="danger" variant="solid">Delete account</Button>
          <Button palette="neutral" variant="ghost">Keep account</Button>
        </div>
      </section>

      {/* BADGE SECTION (preserved from Day 4) */}

      <section className="section">
        <h2>Badge tones (from Day 4)</h2>
        <div className="row">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="info">Info</Badge>
          <Badge tone="success">Active</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger">Failed</Badge>
        </div>
      </section>

      <section className="section">
        <h2>Input — variants</h2>
        <div className="row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Input variant="outlined" placeholder="Outlined" />
          <Input variant="filled" placeholder="Filled" />
          <Input variant="ghost" placeholder="Ghost" />
        </div>
      </section>

      <section className="section">
        <h2>Input — states</h2>
        <div className="row" style={{ flexDirection: 'column' }}>
          <Input state="default" placeholder="Default state" />
          <Input state="error" defaultValue="invalid@" />
          <Input state="success" defaultValue="user@example.com" />
          <Input disabled placeholder="Disabled" />
        </div>
      </section>

      <section className="section">
        <h2>Input — sizes</h2>
        <div className="row" style={{ flexDirection: 'column' }}>
          <Input size="sm" placeholder="Small" />
          <Input size="md" placeholder="Medium" />
          <Input size="lg" placeholder="Large" />
        </div>
      </section>

      <section className="section">
        <h2>Input — with icons</h2>
        <div className="row" style={{ flexDirection: 'column' }}>
          <Input variant="filled" placeholder="Search...">
            <Input.LeadingIcon>🔍</Input.LeadingIcon>
          </Input>
          <Input defaultValue="hello@example.com" state="success">
            <Input.TrailingIcon>✓</Input.TrailingIcon>
          </Input>
        </div>
      </section>

      <section className="section">
        <h2>FormField — basic composition</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 400 }}>
          <FormField>
            <FormField.Label>Email</FormField.Label>
            <Input type="email" placeholder="name@company.com" />
          </FormField>

          <FormField>
            <FormField.Label>Password</FormField.Label>
            <Input type="password" />
            <FormField.Helper>Minimum 8 characters with at least one number.</FormField.Helper>
          </FormField>

          <FormField required>
            <FormField.Label>Full name</FormField.Label>
            <Input />
            <FormField.Helper>Use your legal name as it appears on government ID.</FormField.Helper>
          </FormField>

          <FormField invalid>
            <FormField.Label>Email</FormField.Label>
            <Input type="email" defaultValue="invalid-email" />
            <FormField.Error>Email must include an @ symbol.</FormField.Error>
          </FormField>

          <FormField required invalid>
            <FormField.Label>Username</FormField.Label>
            <Input />
            <FormField.Error>Username is required.</FormField.Error>
          </FormField>
        </div>
      </section>

      <section className="section">
        <h2>Card — variants</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
          <Card variant="flat">
            <Card.Header><h3>Flat card</h3></Card.Header>
            <Card.Body><p>No border, no shadow. Use for cards within cards or sections that need grouping but not visual separation.</p></Card.Body>
          </Card>
          <Card variant="outlined">
            <Card.Header><h3>Outlined card</h3></Card.Header>
            <Card.Body><p>Subtle border, no shadow. The default — works in most contexts.</p></Card.Body>
          </Card>
          <Card variant="raised">
            <Card.Header><h3>Raised card</h3></Card.Header>
            <Card.Body><p>Border + shadow. Use when the card needs to feel above the surrounding content.</p></Card.Body>
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Card — paddings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
          <Card padding="sm">
            <Card.Body><p>Small padding — compact cards in dense lists or sidebars.</p></Card.Body>
          </Card>
          <Card padding="md">
            <Card.Body><p>Medium padding — comfortable default for most contexts.</p></Card.Body>
          </Card>
          <Card padding="lg">
            <Card.Body><p>Large padding — generous spacing for hero or marketing cards.</p></Card.Body>
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Card — full composition</h2>
        <div style={{ maxWidth: 480 }}>
          <Card variant="outlined">
            <Card.Header>
              <h3>Project status</h3>
              <Badge tone="success">Active</Badge>
            </Card.Header>
            <Card.Body>
              <p>Last deploy: 2 hours ago. Three pending changes from the team are ready for review.</p>
            </Card.Body>
            <Card.Footer>
              <Button palette="neutral" variant="subtle">Skip</Button>
              <Button palette="primary" variant="solid">Review changes</Button>
            </Card.Footer>
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Card — semantic 'as' prop</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 480 }}>
          <Card as="article" variant="outlined">
            <Card.Header><h3>Renders as &lt;article&gt;</h3></Card.Header>
            <Card.Body><p>Used for self-contained content like blog posts, news items, or feed items.</p></Card.Body>
          </Card>
          <Card as="aside" variant="flat" padding="sm">
            <Card.Body><p>This Card renders as &lt;aside&gt; — useful for related-but-tangential content.</p></Card.Body>
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Dialog — destructive confirmation (uncontrolled with Trigger)</h2>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button palette="danger" variant="solid">Delete account</Button>
          </Dialog.Trigger>
          <Dialog.Title>Delete your account?</Dialog.Title>
          <Dialog.Description>
            This action is permanent and cannot be undone. Your projects, files, and collaborator access will be removed.
          </Dialog.Description>
          <Dialog.Footer>
            <Button palette="neutral" variant="subtle">Cancel</Button>
            <Button palette="danger" variant="solid">Delete account</Button>
          </Dialog.Footer>
        </Dialog>
      </section>

      <section className="section">
        <h2>Dialog — form (controlled)</h2>
        <DialogControlledExample />
      </section>

      <section className="section">
        <h2>Dialog — sizes</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Dialog size="sm">
            <Dialog.Trigger asChild>
              <Button palette="neutral" variant="subtle">Small</Button>
            </Dialog.Trigger>
            <Dialog.Title>Small dialog</Dialog.Title>
            <Dialog.Description>Max-width 400px. Good for confirmations.</Dialog.Description>
            <Dialog.Footer>
              <Button palette="primary" variant="solid">OK</Button>
            </Dialog.Footer>
          </Dialog>

          <Dialog size="md">
            <Dialog.Trigger asChild>
              <Button palette="neutral" variant="subtle">Medium</Button>
            </Dialog.Trigger>
            <Dialog.Title>Medium dialog</Dialog.Title>
            <Dialog.Description>Max-width 560px. Default for most forms.</Dialog.Description>
            <Dialog.Footer>
              <Button palette="primary" variant="solid">OK</Button>
            </Dialog.Footer>
          </Dialog>

          <Dialog size="lg">
            <Dialog.Trigger asChild>
              <Button palette="neutral" variant="subtle">Large</Button>
            </Dialog.Trigger>
            <Dialog.Title>Large dialog</Dialog.Title>
            <Dialog.Description>Max-width 720px. Use for complex content.</Dialog.Description>
            <Dialog.Footer>
              <Button palette="primary" variant="solid">OK</Button>
            </Dialog.Footer>
          </Dialog>
        </div>
      </section>

      <section className="section">
        <h2>Dialog — no backdrop close, no escape close</h2>
        <Dialog closeOnBackdropClick={false} closeOnEscape={false}>
          <Dialog.Trigger asChild>
            <Button palette="neutral" variant="subtle">Open locked dialog</Button>
          </Dialog.Trigger>
          <Dialog.Title>Must acknowledge</Dialog.Title>
          <Dialog.Description>
            This dialog can only be closed via the button below. Backdrop click and Escape are disabled. This pattern is for must-acknowledge gates (terms of service, mandatory consent).
          </Dialog.Description>
          <Dialog.Footer>
            <Button palette="primary" variant="solid">I acknowledge</Button>
          </Dialog.Footer>
        </Dialog>
      </section>

      <section className="section">
        <h2>Form controls — Checkbox</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <FormField>
            <FormField.Label>Subscribe to newsletter</FormField.Label>
            <Checkbox />
          </FormField>
          <FormField>
            <FormField.Label>Pre-checked option</FormField.Label>
            <Checkbox defaultChecked />
          </FormField>
          <FormField>
            <FormField.Label>Indeterminate</FormField.Label>
            <Checkbox indeterminate />
          </FormField>
          <FormField>
            <FormField.Label>Disabled</FormField.Label>
            <Checkbox disabled />
          </FormField>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Checkbox size="sm" defaultChecked />
            <Checkbox size="md" defaultChecked />
            <Checkbox size="lg" defaultChecked />
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Form controls — RadioGroup</h2>
        <RadioGroupExample />
      </section>

      <section className="section">
        <h2>Form controls — Switch</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <FormField>
            <FormField.Label>Email notifications</FormField.Label>
            <Switch defaultChecked />
          </FormField>
          <FormField>
            <FormField.Label>Dark mode (off)</FormField.Label>
            <Switch />
          </FormField>
          <FormField>
            <FormField.Label>Disabled switch</FormField.Label>
            <Switch disabled defaultChecked />
          </FormField>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Switch size="sm" defaultChecked />
            <Switch size="md" defaultChecked />
            <Switch size="lg" defaultChecked />
          </div>
        </div>
      </section>

    </div>
  )
}