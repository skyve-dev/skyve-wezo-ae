import React from 'react'
import { Box } from '@/components'
import { Button } from '@/components/base/Button'
import { FaArrowLeft, FaHome } from 'react-icons/fa'

interface PropertyManagerHeaderProps {
  title: string
  onBack: () => void
}

const PropertyManagerHeader: React.FC<PropertyManagerHeaderProps> = ({ title, onBack }) => (
  <Box
    display="flex"
    alignItems="center"
    padding="1rem 1.5rem"
    backgroundColor="#D52122"
    height="4rem"
  >
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
          color: 'white'
        }}
        title="Back"
      />
      <Box display="flex" alignItems="center" gap="0.75rem">
        <FaHome color="white" size={20} />
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

export default PropertyManagerHeader