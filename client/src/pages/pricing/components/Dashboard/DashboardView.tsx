import React from 'react'
import { Box } from '@/components'
import { FaChartLine } from 'react-icons/fa'

// Temporarily disabled - needs refactoring for property-only pricing
const DashboardView: React.FC = () => {
  return (
    <Box 
      textAlign="center" 
      padding="3rem" 
      backgroundColor="#f9fafb" 
      borderRadius="8px"
    >
      <FaChartLine size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
        Dashboard Under Construction
      </h3>
      <p style={{ color: '#6b7280' }}>
        Pricing dashboard is being updated to reflect the new property-based pricing model
      </p>
    </Box>
  )
}

export default DashboardView