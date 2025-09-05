import React from 'react'
import {Box} from '@/components'
import CalendarDay from './CalendarDay'

interface CalendarDayData {
  date: Date
  dateString: string
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
}

interface RatePlanWithColor {
  id: string
  propertyId: string
  name: string
  description?: string
  priceModifierType: 'Percentage' | 'FixedAmount'
  priceModifierValue: number
  minStay?: number
  maxStay?: number
  minAdvanceBooking?: number
  maxAdvanceBooking?: number
  minGuests?: number
  maxGuests?: number
  isActive: boolean
  isDefault: boolean
  priority: number
  createdAt: string
  updatedAt: string
  color: string
  lightColor: string
}

interface PriceData {
  ratePlan?: RatePlanWithColor  // Optional for base pricing
  price: {
    id: string
    ratePlanId?: string  // Optional for base pricing
    date: string
    amount: number
    createdAt: string
    updatedAt: string
  }
  hasCustomPrice: boolean
  isBasePricing?: boolean  // NEW: Flag for base PropertyPricing
  reason?: string  // Optional reason for overrides
  halfDayPrice?: number  // Optional half-day price for overrides
}

interface CalendarGridProps {
  calendarDays: CalendarDayData[]
  selectedRatePlans: RatePlanWithColor[]
  getPricesForDate: (dateString: string) => PriceData[]
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  selectedRatePlans,
  getPricesForDate
}) => {
  const isMobile = window.innerWidth < 768
  
  return (
    <Box>
      {/* Weekday Headers */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(7, 1fr)" 
        marginBottom="0.5rem"
        gap="1px"
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box
            key={day}
            textAlign="center"
            fontWeight="600"
            fontSize={isMobile ? '0.75rem' : '0.875rem'}
            color="#6b7280"
            padding="0.75rem 0.5rem"
            backgroundColor="#f9fafb"
          >
            {isMobile ? day.charAt(0) : day}
          </Box>
        ))}
      </Box>
      
      {/* Calendar Days Grid */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(7, 1fr)" 
        gap="1px"
        backgroundColor="#e5e7eb"
        borderRadius="8px"
        overflow="hidden"
      >
        {calendarDays.map((day, index) => (
          <CalendarDay
            key={`${day.dateString}-${index}`}
            day={day}
            prices={getPricesForDate(day.dateString)}
            selectedRatePlans={selectedRatePlans}
          />
        ))}
      </Box>
      
      {/* Legend */}
      {selectedRatePlans.length > 0 && (
        <Box marginTop="2rem">
          <Box marginBottom="1rem">
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
              Rate Plan Legend
            </h4>
          </Box>
          
          <Box 
            display="grid" 
            gridTemplateColumns={isMobile ? 'repeat(1, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))'} 
            gap="0.75rem"
          >
            {selectedRatePlans.map(ratePlan => (
              <Box
                key={ratePlan.id}
                display="flex"
                alignItems="center"
                gap="0.5rem"
                padding="0.5rem 0.75rem"
                backgroundColor={ratePlan.lightColor}
                borderRadius="6px"
                border={`1px solid ${ratePlan.color}40`}
              >
                <Box
                  width="12px"
                  height="12px"
                  borderRadius="50%"
                  backgroundColor={ratePlan.color}
                  flexShrink="0"
                />
                
                <Box flex="1" minWidth="0">
                  <Box 
                    fontSize="0.875rem" 
                    fontWeight="500" 
                    color="#374151"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {ratePlan.name}
                  </Box>
                  <Box fontSize="0.75rem" color="#6b7280">
                    {ratePlan.priceModifierType === 'FixedAmount' && `Fixed AED ${ratePlan.priceModifierValue}`}
                    {ratePlan.priceModifierType === 'Percentage' && `${ratePlan.priceModifierValue}% adjustment`}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      
      {/* Additional Legend for Icons */}
      <Box 
        marginTop="1.5rem" 
        padding="1rem" 
        backgroundColor="#f9fafb" 
        borderRadius="6px"
        border="1px solid #e5e7eb"
      >
        <Box display="flex" gap="2rem" flexWrap="wrap" alignItems="center" fontSize="0.75rem" color="#6b7280">
          <Box display="flex" alignItems="center" gap="0.5rem">
            <Box width="16px" height="16px" backgroundColor="#fef3c7" border="1px solid #f59e0b" borderRadius="2px" />
            <span>Weekend</span>
          </Box>
          
          <Box display="flex" alignItems="center" gap="0.5rem">
            <Box width="16px" height="16px" backgroundColor="#dbeafe" border="1px solid #3b82f6" borderRadius="2px" />
            <span>Today</span>
          </Box>
          
          <Box display="flex" alignItems="center" gap="0.5rem">
            <Box width="16px" height="16px" backgroundColor="#f0fdf4" border="1px solid #22c55e" borderRadius="2px" />
            <span>Custom Price</span>
          </Box>
          
          <Box display="flex" alignItems="center" gap="0.5rem">
            <Box width="16px" height="16px" backgroundColor="#f8fafc" border="1px solid #94a3b8" borderRadius="2px" />
            <span>Base Price</span>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CalendarGrid