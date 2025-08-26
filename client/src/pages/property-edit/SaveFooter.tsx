import React from 'react'
import { Box } from '@/components/base/Box'
import Button from '@/components/base/Button'
import { 
    FaSave, 
    FaUndo, 
    FaSpinner
} from 'react-icons/fa'

interface SaveFooterProps {
    onSave: () => void
    onDiscard?: () => void
    isSaving?: boolean
    hasErrors?: boolean
}

const SaveFooter: React.FC<SaveFooterProps> = ({
    onSave,
    onDiscard,
    isSaving = false,
    hasErrors = false
}) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            padding="1rem 1.5rem"
            backgroundColor="#D52122"
            height="4.5rem"
        >
            {/* Action Buttons */}
            <Box 
                display="flex" 
                alignItems="center" 
                gap="0.75rem"
                flexGrow={'1'}
            >
                {onDiscard && (
                    <Button
                        label="Discard"
                        icon={<FaUndo />}
                        onClick={onDiscard}
                        variant="normal"
                        size="medium"
                        disabled={isSaving}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                            minWidth: '110px'
                        }}
                    />
                )}
                <Box flexGrow={'1'} />
                <Button
                    label={isSaving ? "Saving..." : "Save Changes"}
                    icon={isSaving ? <FaSpinner className="spin" /> : <FaSave />}
                    onClick={onSave}
                    variant="normal"
                    size="medium"
                    disabled={isSaving || hasErrors}
                    style={{
                        backgroundColor:'transparent',
                        minWidth: '140px',
                        color: 'white',
                        border: 'none',
                        fontWeight: '600'
                    }}
                />
            </Box>

            {/* Loading spinner animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </Box>
    )
}

export default SaveFooter