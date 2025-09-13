import React from 'react'
import BaseManagerHeader from '@/components/base/BaseManagerHeader'
import { IoIosPricetags } from 'react-icons/io'

interface RatePlanManagerHeaderProps {
    title: string
    onBack: () => void
}

const RatePlanManagerHeader: React.FC<RatePlanManagerHeaderProps> = ({
    title,
    onBack
}) => (
    <BaseManagerHeader 
        title={title} 
        onBack={onBack} 
        icon={<IoIosPricetags />}
    />
)

export default RatePlanManagerHeader