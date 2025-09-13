import React from 'react'
import { Box } from '../Box'
import Button from '../Button'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'

interface BaseCalendarHeaderProps {
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next') => void
  showNavigation?: boolean
}

const BaseCalendarHeader: React.FC<BaseCalendarHeaderProps> = ({
  currentDate,
  onNavigate,
  showNavigation = true
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const currentMonth = monthNames[currentDate.getMonth()]
  const currentYear = currentDate.getFullYear()
  
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      padding="1rem"
      borderBottom="1px solid #e5e7eb"
      marginBottom="1rem"
    >
      {showNavigation ? (
        <Button
          label=""
          icon={<IoIosArrowBack />}
          onClick={() => onNavigate('prev')}
          variant="normal"
          size="small"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #e5e7eb',
            padding: '0.5rem',
            minWidth: 'auto'
          }}
          title="Previous month"
        />
      ) : (
        <Box />
      )}
      
      <Box textAlign="center">
        <h2 style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          {currentMonth} {currentYear}
        </h2>
      </Box>
      
      {showNavigation ? (
        <Button
          label=""
          icon={<IoIosArrowForward />}
          onClick={() => onNavigate('next')}
          variant="normal"
          size="small"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #e5e7eb',
            padding: '0.5rem',
            minWidth: 'auto'
          }}
          title="Next month"
        />
      ) : (
        <Box />
      )}
    </Box>
  )
}

export default BaseCalendarHeader