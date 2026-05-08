import { useEffect, useState } from 'react'
import { Badge } from '../../components/badge/badge'
import { Button } from '../../components/button/button'

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [loading, setLoading] = useState(false)

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
    </div>
  )
}