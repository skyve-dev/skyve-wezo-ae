import React from 'react'
import { Box } from './Box'
import Button from './Button'
import { IoIosArrowBack } from 'react-icons/io'

interface BaseManagerHeaderProps {
  title: string
  onBack: () => void
  icon?: React.ReactNode
  backgroundColor?: string
}

/**
 * Reusable header component for Manager pages (PropertyManager, RatePlanManager, etc.)
 * Provides consistent styling and behavior across all manager components
 */
const BaseManagerHeader: React.FC<BaseManagerHeaderProps> = ({ 
  title, 
  onBack,
  icon,
  backgroundColor = '#D52122' // Brand red color
}) => (
  <Box
    display="flex"
    alignItems="center"
    padding="1rem 1.5rem"
    backgroundColor={backgroundColor}
    height="4rem"
  >
    <Box display="flex" alignItems="center" gap="1rem" flex="1">
      <Button
        label=""
        icon={<IoIosArrowBack />}
        onClick={onBack}
        variant="normal"
        size="small"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'white',
          padding: '0.5rem',
          minWidth: 'auto'
        }}
        title="Back"
      />
      <Box display="flex" alignItems="center" gap="0.75rem">
        {icon && (
          <Box color="white" fontSize="1.25rem">
            {icon}
          </Box>
        )}
        <h2 style={{
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: '600',
          color: 'white'
        }}>
          {title}
        </h2>
      </Box>
    </Box>
  </Box>
)

export default BaseManagerHeader