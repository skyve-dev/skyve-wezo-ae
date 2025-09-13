import React from 'react'
import BaseManagerFooter from '@/components/base/BaseManagerFooter'

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
  <BaseManagerFooter
    onSave={onSave}
    onDiscard={onDiscard}
    isSaving={isSaving}
    hasErrors={hasErrors}
    saveLabel="Save Property"
    discardLabel="Discard Changes"
  />
)

export default PropertyManagerFooter