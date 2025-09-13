import React from 'react'
import { Box } from './Box'
import Button from './Button'
import { IoIosSave, IoIosUndo, IoIosRefresh } from 'react-icons/io'

interface BaseManagerFooterProps {
  onSave: () => void
  onDiscard?: () => void
  isSaving?: boolean
  hasErrors?: boolean
  saveLabel?: string
  discardLabel?: string
  backgroundColor?: string
}

/**
 * Reusable footer component for Manager pages (PropertyManager, RatePlanManager, etc.)
 * Provides consistent save/discard functionality across all manager components
 */
const BaseManagerFooter: React.FC<BaseManagerFooterProps> = ({ 
  onSave, 
  onDiscard, 
  isSaving = false, 
  hasErrors = false,
  saveLabel = 'Save Changes',
  discardLabel = 'Discard',
  backgroundColor = '#D52122' // Brand red color
}) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="flex-end"
    padding="1rem 1.5rem"
    backgroundColor={backgroundColor}
    height="4.5rem"
  >
    <Box display="flex" alignItems="center" gap="0.75rem" flexGrow="1">
      {onDiscard && (
        <Button
          label={discardLabel}
          icon={<IoIosUndo />}
          onClick={onDiscard}
          disabled={isSaving}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '0.5rem 1rem'
          }}
        />
      )}
      <Box flexGrow="1" />
      <Button
        label={isSaving ? "Saving..." : saveLabel}
        icon={isSaving ? <IoIosRefresh className="spin" /> : <IoIosSave />}
        onClick={onSave}
        disabled={isSaving || hasErrors}
        style={{
          backgroundColor: isSaving || hasErrors ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)',
          color: 'white',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '0.5rem 1.25rem'
        }}
      />
    </Box>
  </Box>
)

export default BaseManagerFooter