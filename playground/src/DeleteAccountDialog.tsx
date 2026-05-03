import { Button } from '../../components/button/button'

interface DeleteAccountDialogProps {
  onConfirm: () => void
  onCancel: () => void
  open?: boolean
}

export function DeleteAccountDialog({ onConfirm, onCancel, open = true }: DeleteAccountDialogProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        style={{
          backgroundColor: 'var(--color-common-surface-overlay)',
          border: '1px solid var(--color-common-border-muted)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2
          id="delete-dialog-title"
          style={{
            margin: '0 0 var(--space-2)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-common-fg-strong)',
          }}
        >
          Delete your account?
        </h2>

        <p
          style={{
            margin: '0 0 var(--space-4)',
            fontSize: '14px',
            color: 'var(--color-common-fg-muted)',
          }}
        >
          This action is permanent and cannot be undone. The following will be deleted immediately:
        </p>

        <ul
          style={{
            margin: '0 0 var(--space-4)',
            paddingLeft: 'var(--space-6)',
            fontSize: '14px',
            color: 'var(--color-common-fg-base)',
            lineHeight: 1.7,
          }}
        >
          <li>Your profile and personal data</li>
          <li>All projects and uploaded files</li>
          <li>Billing history and active subscriptions</li>
          <li>Access to all shared workspaces</li>
        </ul>

        <div
          style={{
            backgroundColor: 'var(--color-palette-danger-subtle)',
            border: '1px solid var(--color-palette-danger-muted)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-6)',
            fontSize: '14px',
            color: 'var(--color-palette-danger-bold)',
          }}
        >
          Your account cannot be recovered after deletion. If you have an active subscription, it will be cancelled immediately with no refund.
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
          }}
        >
          <Button palette="neutral" style="subtle" onClick={onCancel}>
            Cancel
          </Button>
          <Button palette="danger" style="solid" onClick={onConfirm}>
            Delete account
          </Button>
        </div>
      </div>
    </div>
  )
}
