import { Badge } from '../../components/badge/badge'

export function App() {
  return (
    <div className="page">
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ margin: 0 }}>ai-native-ds</h1>
        <p style={{ color: 'var(--color-slate-600)', margin: '4px 0 0' }}>
          Badge component — Day 3
        </p>
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
          <span style={{ color: 'var(--color-slate-700)' }}>
            Order #4821
          </span>
          <Badge tone="success">Paid</Badge>
        </div>
      </section>
    </div>
  )
}