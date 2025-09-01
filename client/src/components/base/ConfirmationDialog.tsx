import React from 'react'
import { Box } from './Box'
import Button from './Button'
import { IoIosWarning, IoIosHelpCircle, IoIosInformationCircle, IoIosCheckmarkCircle } from 'react-icons/io'

interface ConfirmationDialogProps {
    /**
     * Dialog title
     */
    title: string
    
    /**
     * Dialog message/content
     */
    message: string | React.ReactNode
    
    /**
     * Confirm button label
     */
    confirmLabel?: string
    
    /**
     * Cancel button label
     */
    cancelLabel?: string
    
    /**
     * Callback when user confirms
     */
    onConfirm: () => void
    
    /**
     * Callback when user cancels
     */
    onCancel: () => void
    
    /**
     * Dialog variant affecting icon and colors
     */
    variant?: 'destructive' | 'warning' | 'info' | 'success' | 'question'
    
    /**
     * Show/hide cancel button
     */
    showCancel?: boolean
    
    /**
     * Additional content below the message
     */
    children?: React.ReactNode
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    variant = 'question',
    showCancel = true,
    children
}) => {
    // Get variant-specific styling
    const getVariantConfig = () => {
        switch (variant) {
            case 'destructive':
                return {
                    icon: <IoIosWarning />,
                    iconColor: '#dc2626',
                    confirmVariant: 'promoted' as const,
                    confirmLabel: confirmLabel || 'Delete',
                    borderColor: '#fee2e2'
                }
            case 'warning':
                return {
                    icon: <IoIosWarning />,
                    iconColor: '#d97706',
                    confirmVariant: 'promoted' as const,
                    confirmLabel: confirmLabel || 'Continue',
                    borderColor: '#fef3c7'
                }
            case 'info':
                return {
                    icon: <IoIosInformationCircle />,
                    iconColor: '#2563eb',
                    confirmVariant: 'promoted' as const,
                    confirmLabel: confirmLabel || 'OK',
                    borderColor: '#dbeafe'
                }
            case 'success':
                return {
                    icon: <IoIosCheckmarkCircle />,
                    iconColor: '#059669',
                    confirmVariant: 'promoted' as const,
                    confirmLabel: confirmLabel || 'Continue',
                    borderColor: '#d1fae5'
                }
            default: // question
                return {
                    icon: <IoIosHelpCircle />,
                    iconColor: '#6b7280',
                    confirmVariant: 'promoted' as const,
                    confirmLabel: confirmLabel || 'Yes',
                    borderColor: '#f3f4f6'
                }
        }
    }

    const config = getVariantConfig()

    return (
        <Box
            padding="0"
            borderRadius="12px"
            backgroundColor="white"
            border={`2px solid ${config.borderColor}`}
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.15)"
            minWidth="320px"
        >
            {/* Header */}
            <Box
                padding="1.5rem 1.5rem 1rem 1.5rem"
                borderBottom="1px solid #f1f5f9"
            >
                <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="0.5rem">
                    <Box color={config.iconColor} fontSize="1.25rem">
                        {config.icon}
                    </Box>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        lineHeight: '1.2'
                    }}>
                        {title}
                    </h3>
                </Box>
            </Box>

            {/* Content */}
            <Box padding="1rem 1.5rem">
                <Box 
                    color="#4b5563" 
                    fontSize="0.9375rem" 
                    lineHeight="1.5"
                    marginBottom={children ? "1rem" : "0"}
                >
                    {message}
                </Box>
                {children}
            </Box>

            {/* Actions */}
            <Box
                padding="1rem 1.5rem 1.5rem 1.5rem"
                display="flex"
                justifyContent="flex-end"
                gap="0.75rem"
                borderTop="1px solid #f1f5f9"
            >
                {showCancel && (
                    <Button
                        label={cancelLabel || 'Cancel'}
                        onClick={onCancel}
                        variant="normal"
                        size="medium"
                        style={{
                            minWidth: '80px',
                            backgroundColor: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #e2e8f0'
                        }}
                    />
                )}
                <Button
                    label={config.confirmLabel}
                    onClick={onConfirm}
                    variant={config.confirmVariant}
                    size="medium"
                    style={{
                        minWidth: '80px'
                    }}
                />
            </Box>
        </Box>
    )
}

// Convenience components for common use cases
export const DestructiveConfirmationDialog: React.FC<Omit<ConfirmationDialogProps, 'variant'>> = (props) => (
    <ConfirmationDialog {...props} variant="destructive" />
)

export const WarningConfirmationDialog: React.FC<Omit<ConfirmationDialogProps, 'variant'>> = (props) => (
    <ConfirmationDialog {...props} variant="warning" />
)

export const InfoConfirmationDialog: React.FC<Omit<ConfirmationDialogProps, 'variant'>> = (props) => (
    <ConfirmationDialog {...props} variant="info" />
)

export default ConfirmationDialog