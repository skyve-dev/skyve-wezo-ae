import React from 'react'
import { Box } from '@/components/base/Box'
import Button from '@/components/base/Button'
import { IoIosWarning, IoIosCheckmarkCircle, IoIosCloseCircle, IoIosInformationCircle } from 'react-icons/io'

/**
 * Reusable dialog components for use with AppShell's promise-based dialog system
 * 
 * Usage:
 * ```typescript
 * const { openDialog } = useAppShell()
 * 
 * // Confirmation dialog
 * const confirmed = await openDialog<boolean>((close) => (
 *   <UnsavedChangesDialog onClose={close} />
 * ))
 * 
 * // Success dialog
 * await openDialog<void>((close) => (
 *   <SuccessDialog message="Operation completed!" onClose={close} />
 * ))
 * ```
 */

interface DialogProps<T> {
  onClose: (result: T) => void
}

/**
 * Dialog for unsaved changes confirmation
 */
export const UnsavedChangesDialog: React.FC<DialogProps<boolean>> = ({ onClose }) => (
  <Box padding="2rem" textAlign="center">
    <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
      Unsaved Changes
    </Box>
    <Box marginBottom="2rem" color="#374151">
      You have unsaved changes. Are you sure you want to leave?
    </Box>
    <Box display="flex" gap="1rem" justifyContent="center">
      <Button label="Stay" onClick={() => onClose(false)} />
      <Button label="Yes, Leave" onClick={() => onClose(true)} variant="promoted" />
    </Box>
  </Box>
)

/**
 * Dialog for save before leaving confirmation
 */
export const SaveBeforeLeaveDialog: React.FC<DialogProps<boolean>> = ({ onClose }) => (
  <Box padding="2rem" textAlign="center">
    <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
      Unsaved Changes
    </Box>
    <Box marginBottom="2rem" color="#374151">
      Do you want to save your changes before leaving?
    </Box>
    <Box display="flex" gap="1rem" justifyContent="center">
      <Button label="Leave Without Saving" onClick={() => onClose(false)} />
      <Button label="Save & Leave" onClick={() => onClose(true)} variant="promoted" />
    </Box>
  </Box>
)

/**
 * Generic confirmation dialog
 */
interface ConfirmDialogProps extends DialogProps<boolean> {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'warning' | 'destructive' | 'info'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  onClose, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  variant = 'warning'
}) => {
  const colors = {
    warning: '#f59e0b',
    destructive: '#dc2626',
    info: '#3b82f6'
  }
  
  const icons = {
    warning: <IoIosWarning />,
    destructive: <IoIosCloseCircle />,
    info: <IoIosInformationCircle />
  }
  
  return (
    <Box padding="2rem" textAlign="center">
      <Box display="flex" alignItems="center" justifyContent="center" gap="0.5rem" marginBottom="1rem">
        <Box fontSize="1.5rem" color={colors[variant]}>
          {icons[variant]}
        </Box>
        <Box fontSize="1.25rem" fontWeight="bold" color={colors[variant]}>
          {title}
        </Box>
      </Box>
      <Box marginBottom="2rem" color="#374151">
        {message}
      </Box>
      <Box display="flex" gap="1rem" justifyContent="center">
        <Button label={cancelLabel} onClick={() => onClose(false)} />
        <Button label={confirmLabel} onClick={() => onClose(true)} variant="promoted" />
      </Box>
    </Box>
  )
}

/**
 * Success dialog
 */
interface SuccessDialogProps extends DialogProps<void> {
  title?: string
  message: string
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({ 
  onClose, 
  title = 'Success!', 
  message 
}) => (
  <Box padding="2rem" textAlign="center">
    <Box display="flex" alignItems="center" justifyContent="center" gap="0.5rem" marginBottom="1rem">
      <Box fontSize="1.5rem" color="#059669">
        <IoIosCheckmarkCircle />
      </Box>
      <Box fontSize="1.25rem" fontWeight="bold" color="#059669">
        {title}
      </Box>
    </Box>
    <Box marginBottom="2rem" color="#374151">
      {message}
    </Box>
    <Box display="flex" justifyContent="center">
      <Button label="Continue" onClick={() => onClose()} variant="promoted" />
    </Box>
  </Box>
)

/**
 * Error dialog
 */
interface ErrorDialogProps extends DialogProps<void> {
  title?: string
  message: string
  details?: string
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({ 
  onClose, 
  title = 'Error', 
  message,
  details 
}) => (
  <Box padding="2rem" textAlign="center">
    <Box display="flex" alignItems="center" justifyContent="center" gap="0.5rem" marginBottom="1rem">
      <Box fontSize="1.5rem" color="#dc2626">
        <IoIosCloseCircle />
      </Box>
      <Box fontSize="1.25rem" fontWeight="bold" color="#dc2626">
        {title}
      </Box>
    </Box>
    <Box marginBottom="1rem" color="#374151">
      {message}
    </Box>
    {details && (
      <Box 
        marginBottom="2rem" 
        padding="0.75rem" 
        backgroundColor="#fee2e2" 
        borderRadius="6px"
        fontSize="0.875rem"
        color="#991b1b"
        textAlign="left"
        style={{ fontFamily: 'monospace' }}
      >
        {details}
      </Box>
    )}
    <Box display="flex" justifyContent="center">
      <Button label="OK" onClick={() => onClose()} variant="promoted" />
    </Box>
  </Box>
)

/**
 * Loading dialog (non-closeable)
 */
interface LoadingDialogProps {
  message?: string
}

export const LoadingDialog: React.FC<LoadingDialogProps> = ({ 
  message = 'Loading...'
}) => (
  <Box padding="2rem" textAlign="center">
    <Box fontSize="1.125rem" marginBottom="1rem" color="#374151">
      {message}
    </Box>
    <Box display="flex" justifyContent="center">
      <Box className="spinner" />
    </Box>
  </Box>
)

/**
 * Delete confirmation dialog
 */
interface DeleteDialogProps extends DialogProps<boolean> {
  itemName: string
  itemType?: string
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ 
  onClose, 
  itemName,
  itemType = 'item'
}) => (
  <Box padding="2rem" textAlign="center">
    <Box display="flex" alignItems="center" justifyContent="center" gap="0.5rem" marginBottom="1rem">
      <Box fontSize="1.5rem" color="#dc2626">
        <IoIosWarning />
      </Box>
      <Box fontSize="1.25rem" fontWeight="bold" color="#dc2626">
        Delete {itemType}?
      </Box>
    </Box>
    <Box marginBottom="2rem" color="#374151">
      Are you sure you want to delete <strong>{itemName}</strong>?
      <br />
      This action cannot be undone.
    </Box>
    <Box display="flex" gap="1rem" justifyContent="center">
      <Button label="Cancel" onClick={() => onClose(false)} />
      <Button 
        label="Delete" 
        onClick={() => onClose(true)} 
        variant="promoted"
        style={{ backgroundColor: '#dc2626' }}
      />
    </Box>
  </Box>
)

/**
 * Discard changes dialog
 */
export const DiscardChangesDialog: React.FC<DialogProps<boolean>> = ({ onClose }) => (
  <Box padding="2rem" textAlign="center">
    <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
      Discard Changes?
    </Box>
    <Box marginBottom="2rem" color="#374151">
      Are you sure you want to discard all unsaved changes?
      <br />
      This action cannot be undone.
    </Box>
    <Box display="flex" gap="1rem" justifyContent="center">
      <Button label="Keep Editing" onClick={() => onClose(false)} />
      <Button label="Discard Changes" onClick={() => onClose(true)} variant="promoted" />
    </Box>
  </Box>
)