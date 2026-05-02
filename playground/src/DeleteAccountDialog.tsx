import { forwardRef, useState } from 'react'
import { Button } from '../../components/button/button'

export interface DeleteAccountDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  accountEmail?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

export const DeleteAccountDialog = forwardRef<HTMLDivElement, DeleteAccountDialogProps>(
  ({ accountEmail, onConfirm, onCancel, className, ...props }, ref) => {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleConfirm = async () => {
      if (!onConfirm) return

      setIsDeleting(true)
      try {
        await onConfirm()
      } finally {
        setIsDeleting(false)
      }
    }

    return (
      <div
        ref={ref}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm"
        {...props}
      >
        <div className="bg-surface-base border border-subtle rounded-lg shadow-lg max-w-md w-full mx-4">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-subtle">
            <h2 className="text-lg font-semibold text-fg-strong">
              Delete account
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-fg-base leading-relaxed">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>

            {accountEmail && (
              <div className="bg-danger-subtle border border-danger-muted rounded-md px-4 py-3">
                <p className="text-sm text-fg-base">
                  <span className="font-medium text-fg-strong">Account:</span>{' '}
                  <span className="font-mono">{accountEmail}</span>
                </p>
              </div>
            )}

            <div className="bg-canvas-subtle border border-subtle rounded-md px-4 py-3">
              <p className="text-xs font-medium text-fg-strong mb-2">
                This will permanently:
              </p>
              <ul className="text-xs text-fg-muted space-y-1.5 list-disc list-inside">
                <li>Delete all your personal data</li>
                <li>Remove access to all projects and workspaces</li>
                <li>Cancel any active subscriptions</li>
                <li>Invalidate all sessions and API keys</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-subtle flex items-center justify-end gap-3">
            <Button
              palette="neutral"
              style="subtle"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              palette="danger"
              style="solid"
              onClick={handleConfirm}
              loading={isDeleting}
            >
              Delete account
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

DeleteAccountDialog.displayName = 'DeleteAccountDialog'
