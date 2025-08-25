import React from 'react'
import { Box } from '../Box'
import Button from '../Button'
import { FaArrowLeft, FaTimes } from 'react-icons/fa'

interface WizardHeaderProps {
    title: string
    subtitle?: string
    onBack: () => void
    onCancel: () => void
}

const WizardHeader: React.FC<WizardHeaderProps> = ({
    title,
    subtitle,
    onBack,
    onCancel
}) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding="1rem 1.5rem"
            backgroundColor="#D52122"
            height="4rem"
        >
            {/* Left: Back Button */}
            <Box display="flex" alignItems="center" gap="1rem">
                <Button
                    label=""
                    icon={<FaArrowLeft />}
                    onClick={onBack}
                    variant="normal"
                    size="small"
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '0.5rem',
                        minWidth: 'unset',
                        color: 'white'
                    }}
                    title="Back to Properties"
                />
                
                {/* Title Section */}
                <Box>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'white',
                        lineHeight: '1.2'
                    }}>
                        {title}
                    </h2>
                    {subtitle && (
                        <p style={{
                            margin: '0.125rem 0 0 0',
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                            {subtitle}
                        </p>
                    )}
                </Box>
            </Box>

            {/* Right: Cancel Button */}
            <Button
                label=""
                icon={<FaTimes />}
                onClick={onCancel}
                variant="normal"
                size="small"
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    minWidth: 'unset',
                    color: 'white'
                }}
                title="Cancel and Exit"
            />
        </Box>
    )
}

export default WizardHeader