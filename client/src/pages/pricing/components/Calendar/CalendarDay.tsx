import React from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store'
import { FaEdit, FaPlus } from 'react-icons/fa'
import { Box } from '@/components'
import { 
  openPriceEditForm, 
  toggleDateSelection,
  setSelectedDate
} from '@/store/slices/priceSlice'
import { RootState } from '@/store'

interface CalendarDayData {
  date: Date
  dateString: string
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
}

interface RatePlanWithColor {
  id: string
  name: string
  type: string
  adjustmentType: 'FixedPrice' | 'Percentage' | 'FixedDiscount'
  adjustmentValue: number
  color: string
  lightColor: string
}

interface PriceData {
  ratePlan: RatePlanWithColor
  price: {
    id: string
    ratePlanId: string
    date: string
    amount: number
    createdAt: string
    updatedAt: string
  }
  hasCustomPrice: boolean
}

interface CalendarDayProps {
  day: CalendarDayData
  prices: PriceData[]
  selectedRatePlans: RatePlanWithColor[]
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  prices,
  selectedRatePlans
}) => {
  const dispatch = useAppDispatch()
  const { 
    bulkEditMode, 
    selectedDates, 
    selectedRatePlanIds 
  } = useSelector((state: RootState) => state.price)
  
  const isMobile = window.innerWidth < 768
  const isSelected = selectedDates.includes(day.dateString)
  
  // Handle day click
  const handleDayClick = () => {
    if (!day.isCurrentMonth) return
    
    if (bulkEditMode) {
      dispatch(toggleDateSelection(day.dateString))
    } else {
      dispatch(setSelectedDate(day.dateString))
      
      // If only one rate plan is selected, open edit form directly
      if (selectedRatePlanIds.length === 1) {
        const ratePlanId = selectedRatePlanIds[0]
        const existingPrice = prices.find(p => p.ratePlan.id === ratePlanId)
        
        dispatch(openPriceEditForm({
          date: day.dateString,
          ratePlanId,
          amount: existingPrice?.price.amount || 0
        }))
      } else {
        // Show date details or price selection modal
        // For now, open edit form for first rate plan
        if (selectedRatePlanIds.length > 0) {
          const ratePlanId = selectedRatePlanIds[0]
          const existingPrice = prices.find(p => p.ratePlan.id === ratePlanId)
          
          dispatch(openPriceEditForm({
            date: day.dateString,
            ratePlanId,
            amount: existingPrice?.price.amount || 0
          }))
        }
      }
    }
  }
  
  // Handle price click
  const handlePriceClick = (e: React.MouseEvent, priceData: PriceData) => {
    e.stopPropagation()
    
    if (!bulkEditMode) {
      dispatch(openPriceEditForm({
        date: day.dateString,
        ratePlanId: priceData.ratePlan.id,
        amount: priceData.price.amount
      }))
    }
  }
  
  // Get background color based on state
  const getBackgroundColor = () => {
    if (!day.isCurrentMonth) return '#f9fafb'
    if (isSelected && bulkEditMode) return '#dbeafe'
    if (day.isToday) return '#eff6ff'
    if (day.isWeekend) return '#fffbeb'
    return 'white'
  }
  
  // Get border color
  const getBorderColor = () => {
    if (day.isToday) return '#3b82f6'
    if (isSelected && bulkEditMode) return '#1d4ed8'
    return 'transparent'
  }
  
  // Format currency
  const formatPrice = (amount: number) => {
    if (isMobile && amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`
    }
    return `$${amount.toLocaleString()}`
  }
  
  return (
    <Box
      minHeight={isMobile ? '80px' : '120px'}
      backgroundColor={getBackgroundColor()}
      border={`2px solid ${getBorderColor()}`}
      cursor={day.isCurrentMonth ? 'pointer' : 'default'}
      opacity={day.isCurrentMonth ? 1 : 0.5}
      onClick={handleDayClick}
      padding="0.5rem"
      position="relative"
      transition="all 0.2s"
      whileHover={day.isCurrentMonth ? { backgroundColor: '#f8fafc' } : {}}
    >
      {/* Day Number */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        marginBottom="0.25rem"
      >
        <span 
          style={{ 
            fontWeight: day.isToday ? '600' : '500',
            fontSize: isMobile ? '0.875rem' : '1rem',
            color: day.isToday ? '#1d4ed8' : (day.isCurrentMonth ? '#374151' : '#9ca3af')
          }}
        >
          {day.date.getDate()}
        </span>
        
        {/* Bulk Edit Selection Indicator */}
        {bulkEditMode && day.isCurrentMonth && (
          <Box
            width="16px"
            height="16px"
            borderRadius="50%"
            backgroundColor={isSelected ? '#1d4ed8' : 'transparent'}
            border={`2px solid ${isSelected ? '#1d4ed8' : '#d1d5db'}`}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {isSelected && (
              <Box width="8px" height="8px" backgroundColor="white" borderRadius="50%" />
            )}
          </Box>
        )}
        
        {/* Weekend Label */}
        {day.isWeekend && day.isCurrentMonth && !isMobile && (
          <span style={{ fontSize: '0.625rem', color: '#92400e', fontWeight: '500' }}>
            WE
          </span>
        )}
      </Box>
      
      {/* Price Items */}
      {day.isCurrentMonth && (
        <Box display="flex" flexDirection="column" gap="0.25rem" flex="1">
          {prices.length === 0 && selectedRatePlans.length > 0 && (
            <Box 
              textAlign="center" 
              padding="0.5rem"
              backgroundColor="#f3f4f6"
              borderRadius="4px"
              border="1px dashed #9ca3af"
              cursor="pointer"
              fontSize="0.75rem"
              color="#6b7280"
              onClick={(e) => {
                e.stopPropagation()
                if (selectedRatePlanIds.length > 0) {
                  dispatch(openPriceEditForm({
                    date: day.dateString,
                    ratePlanId: selectedRatePlanIds[0],
                    amount: 0
                  }))
                }
              }}
            >
              <FaPlus size={10} style={{ marginBottom: '0.25rem' }} />
              <div>Set Price</div>
            </Box>
          )}
          
          {prices.slice(0, isMobile ? 2 : 4).map((priceData, index) => (
            <Box
              key={`${priceData.ratePlan.id}-${index}`}
              padding="0.25rem 0.5rem"
              backgroundColor={priceData.hasCustomPrice ? '#f0fdf4' : '#f8fafc'}
              border={`1px solid ${priceData.hasCustomPrice ? '#bbf7d0' : '#e2e8f0'}`}
              borderRadius="4px"
              fontSize={isMobile ? '0.625rem' : '0.75rem'}
              cursor="pointer"
              onClick={(e) => handlePriceClick(e, priceData)}
              transition="all 0.2s"
              whileHover={{ backgroundColor: priceData.hasCustomPrice ? '#ecfdf5' : '#f1f5f9' }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap="0.25rem">
                  <Box
                    width="6px"
                    height="6px"
                    borderRadius="50%"
                    backgroundColor={priceData.ratePlan.color}
                  />
                  <span 
                    style={{ 
                      color: priceData.hasCustomPrice ? '#166534' : '#475569',
                      fontWeight: priceData.hasCustomPrice ? '500' : '400',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: isMobile ? '40px' : '60px'
                    }}
                  >
                    {isMobile ? priceData.ratePlan.name.substring(0, 4) : priceData.ratePlan.name}
                  </span>
                </Box>
                
                <Box 
                  fontWeight="500" 
                  color={priceData.hasCustomPrice ? '#166534' : '#475569'}
                >
                  {formatPrice(priceData.price.amount)}
                </Box>
              </Box>
            </Box>
          ))}
          
          {/* Show count if more prices exist */}
          {prices.length > (isMobile ? 2 : 4) && (
            <Box
              textAlign="center"
              fontSize="0.625rem"
              color="#6b7280"
              padding="0.25rem"
              backgroundColor="#f9fafb"
              borderRadius="4px"
            >
              +{prices.length - (isMobile ? 2 : 4)} more
            </Box>
          )}
        </Box>
      )}
      
      {/* Edit Indicator */}
      {!bulkEditMode && day.isCurrentMonth && prices.length > 0 && (
        <Box
          position="absolute"
          top="0.25rem"
          right="0.25rem"
          opacity={0}
          transition="opacity 0.2s"
          style={{
            opacity: 'inherit'
          }}
          pointerEvents="none"
        >
          <FaEdit size={8} color="#6b7280" />
        </Box>
      )}
    </Box>
  )
}

export default CalendarDay