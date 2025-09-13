import React from 'react'
import BaseManagerFooter from '@/components/base/BaseManagerFooter'

interface RatePlanManagerFooterProps {
    onSave: () => void
    onDiscard?: () => void
    isSaving?: boolean
    hasErrors?: boolean
}

const RatePlanManagerFooter: React.FC<RatePlanManagerFooterProps> = ({
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
        saveLabel="Save Changes"
        discardLabel="Discard Changes"
    />
)

export default RatePlanManagerFooter