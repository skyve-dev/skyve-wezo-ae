import React from 'react'
import { Box } from '@/components'

// Temporarily disabled - needs refactoring for property-only pricing
const CalendarControls: React.FC = () => {
  return (
    <Box display="flex" gap="1rem" alignItems="center" flexWrap="wrap">
      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        Calendar controls available soon
      </span>
    </Box>
  )
}

export default CalendarControls