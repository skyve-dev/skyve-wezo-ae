import React from 'react'
import BaseManagerHeader from '@/components/base/BaseManagerHeader'
import { IoIosHome } from 'react-icons/io'

interface PropertyManagerHeaderProps {
  title: string
  onBack: () => void
}

const PropertyManagerHeader: React.FC<PropertyManagerHeaderProps> = ({ title, onBack }) => (
  <BaseManagerHeader 
    title={title} 
    onBack={onBack} 
    icon={<IoIosHome />}
  />
)

export default PropertyManagerHeader