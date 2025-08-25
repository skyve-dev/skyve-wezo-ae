import React from 'react'
import { Box } from '@/components/base/Box'
import Button from '@/components/base/Button'
import { FaArrowLeft, FaHome } from 'react-icons/fa'

interface PropertyEditHeaderProps {
    title: string
    onBack: () => void
}

const PropertyEditHeader: React.FC<PropertyEditHeaderProps> = ({
    title,
    onBack
}) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            padding="1rem 1.5rem"
            backgroundColor="#D52122"
            height="4rem"
        >
            {/* Left: Back Button and Title */}
            <Box display="flex" alignItems="center" gap="1rem" flex="1">
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
                
                {/* Property Icon and Title */}
                <Box display="flex" alignItems="center" gap="0.75rem">
                    <Box 
                        color="white" 
                        fontSize="1.125rem"
                        display="flex"
                        alignItems="center"
                    >
                        <FaHome />
                    </Box>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'white',
                        lineHeight: '1.2'
                    }}>
                        {title}
                    </h2>
                </Box>
            </Box>
        </Box>
    )
}

export default PropertyEditHeader