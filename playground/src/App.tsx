import { useEffect, useState } from 'react'
import { Badge } from '../../components/badge/badge'

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="page">
      <header style={{ marginBottom: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0 }}>ai-native-ds</h1>
          <p style={{ color: 'var(--color-common-fg-muted)', margin: '4px 0 0' }}>
            Badge component — Day 4
          </p>
        </div>
        <button
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-common-border-base)',
            background: 'var(--color-common-surface-raised)',
            color: 'var(--color-common-fg-base)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          {theme === 'light' ? '☾ Dark' : '☀ Light'}
        </button>
      </header>

      <section className="section">
        <h2>Tones</h2>
        <div className="row">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="info">Info</Badge>
          <Badge tone="success">Active</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger">Failed</Badge>
        </div>
      </section>

      <section className="section">
        <h2>Sizes</h2>
        <div className="row">
          <Badge size="sm" tone="info">Small</Badge>
          <Badge size="md" tone="info">Medium</Badge>
        </div>
      </section>

      <section className="section">
        <h2>In context</h2>
        <div className="row">
          <span style={{ color: 'var(--color-common-fg-base)' }}>
            Order #4821
          </span>
          <Badge tone="success">Paid</Badge>
        </div>
      </section>
    </div>
  )
}