import { useAppShell } from '@/components/base/AppShell'
import {
  UnsavedChangesDialog,
  SaveBeforeLeaveDialog,
  ConfirmDialog,
  SuccessDialog,
  ErrorDialog,
  DeleteDialog,
  DiscardChangesDialog
} from '@/components/dialogs/AppShellDialogs'

/**
 * Custom hook providing easy access to common dialog patterns
 * 
 * Usage:
 * ```typescript
 * const { showSuccess, showError, confirmDelete } = useDialogs()
 * 
 * // Show success
 * await showSuccess('Operation completed!')
 * 
 * // Confirm delete
 * const confirmed = await confirmDelete('Property ABC')
 * if (confirmed) {
 *   // proceed with deletion
 * }
 * ```
 */
export const useDialogs = () => {
  const { openDialog } = useAppShell()

  /**
   * Show success dialog
   */
  const showSuccess = async (message: string, title?: string): Promise<void> => {
    return openDialog<void>((close) => (
      <SuccessDialog onClose={close} message={message} title={title} />
    ))
  }

  /**
   * Show error dialog
   */
  const showError = async (message: string, title?: string, details?: string): Promise<void> => {
    return openDialog<void>((close) => (
      <ErrorDialog onClose={close} message={message} title={title} details={details} />
    ))
  }

  /**
   * Show generic confirmation dialog
   */
  const confirm = async (
    title: string,
    message: string,
    confirmLabel?: string,
    cancelLabel?: string,
    variant?: 'warning' | 'destructive' | 'info'
  ): Promise<boolean> => {
    return openDialog<boolean>((close) => (
      <ConfirmDialog
        onClose={close}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        variant={variant}
      />
    ))
  }

  /**
   * Show delete confirmation dialog
   */
  const confirmDelete = async (itemName: string, itemType?: string): Promise<boolean> => {
    return openDialog<boolean>((close) => (
      <DeleteDialog onClose={close} itemName={itemName} itemType={itemType} />
    ))
  }

  /**
   * Show unsaved changes dialog
   */
  const confirmUnsavedChanges = async (): Promise<boolean> => {
    return openDialog<boolean>((close) => (
      <UnsavedChangesDialog onClose={close} />
    ))
  }

  /**
   * Show save before leaving dialog
   */
  const confirmSaveBeforeLeave = async (): Promise<boolean> => {
    return openDialog<boolean>((close) => (
      <SaveBeforeLeaveDialog onClose={close} />
    ))
  }

  /**
   * Show discard changes dialog
   */
  const confirmDiscardChanges = async (): Promise<boolean> => {
    return openDialog<boolean>((close) => (
      <DiscardChangesDialog onClose={close} />
    ))
  }

  return {
    showSuccess,
    showError,
    confirm,
    confirmDelete,
    confirmUnsavedChanges,
    confirmSaveBeforeLeave,
    confirmDiscardChanges
  }
}

/**
 * Export individual dialog hooks for specific use cases
 */
export const useSuccessDialog = () => {
  const { showSuccess } = useDialogs()
  return showSuccess
}

export const useErrorDialog = () => {
  const { showError } = useDialogs()
  return showError
}

export const useConfirmDialog = () => {
  const { confirm } = useDialogs()
  return confirm
}

export const useDeleteDialog = () => {
  const { confirmDelete } = useDialogs()
  return confirmDelete
}