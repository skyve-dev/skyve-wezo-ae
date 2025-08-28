import React from 'react'
import { Box } from '@/components'
import { Button } from '@/components/base/Button'
import { FaSave, FaUndo, FaSpinner } from 'react-icons/fa'

interface PropertyManagerFooterProps {
  onSave: () => void
  onDiscard?: () => void
  isSaving?: boolean
  hasErrors?: boolean
}

const PropertyManagerFooter: React.FC<PropertyManagerFooterProps> = ({ 
  onSave, 
  onDiscard, 
  isSaving = false, 
  hasErrors = false 
}) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="flex-end"
    padding="1rem 1.5rem"
    backgroundColor="#D52122"
    height="4.5rem"
  >
    <Box display="flex" alignItems="center" gap="0.75rem" flexGrow="1">
      {onDiscard && (
        <Button
          label="Discard Changes"
          icon={<FaUndo />}
          onClick={onDiscard}
          disabled={isSaving}
          flexDirection={'column'}
          variant={'text'}
          style={{color: 'white'}}
        />
      )}
      <Box flexGrow="1" />
      <Button
        label={isSaving ? "Saving..." : "Save Property"}
        icon={isSaving ? <FaSpinner className="spin" /> : <FaSave />}
        onClick={onSave}
        disabled={isSaving || hasErrors}
        style={{color:'white'}}
        flexDirection={'column'}
        variant={'text'}
      />
    </Box>
  </Box>
)

export default PropertyManagerFooter