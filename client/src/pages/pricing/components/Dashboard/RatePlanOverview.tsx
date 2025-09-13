import React from 'react'
import { IoIosPricetags } from 'react-icons/io'
import { Box } from '@/components'

interface RatePlanOverviewProps {
  ratePlans?: any[]
  statistics?: any
}

// Temporarily disabled - needs refactoring for property-only pricing
const RatePlanOverview: React.FC<RatePlanOverviewProps> = () => {
  return (
    <Box 
      textAlign="center" 
      padding="3rem" 
      backgroundColor="#f9fafb" 
      borderRadius="8px"
    >
      <IoIosPricetags size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
        Rate Plan Overview Under Construction
      </h3>
      <p style={{ color: '#6b7280' }}>
        Rate plan overview is being updated to reflect the new property-based pricing model
      </p>
    </Box>
  )
}

export default RatePlanOverview