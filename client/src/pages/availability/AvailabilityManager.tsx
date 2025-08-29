import React, { useEffect, useState, useMemo } from 'react'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import PropertySelector from '@/components/PropertySelector'
import { useAppDispatch, useAppSelector } from '@/store'
import { 
  fetchAvailability, 
  setCurrentPropertyId,
  setCurrentMonth,
  setViewMode
} from '@/store/slices/availabilitySlice'
import { CalendarGrid } from './components/Calendar/CalendarGrid'
import { QuickActions } from './components/Controls/QuickActions'

const AvailabilityManager: React.FC = () => {
  const dispatch = useAppDispatch()
  const { currentProperty } = useAppSelector((state) => state.property)
  const { 
    calendar,
    currentPropertyId,
    currentMonth,
    viewMode,
    loading,
    error
  } = useAppSelector((state) => state.availability)

  // Mobile detection with state for re-render stability
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 480)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sync current property with availability state
  useEffect(() => {
    if (currentProperty?.propertyId && currentProperty.propertyId !== currentPropertyId) {
      dispatch(setCurrentPropertyId(currentProperty.propertyId))
    }
  }, [currentProperty, currentPropertyId, dispatch])

  // Load availability data when property changes
  useEffect(() => {

    if (currentPropertyId && currentMonth) {
      dispatch(fetchAvailability({
        propertyId: currentPropertyId,
        year: currentMonth.year,
        month: currentMonth.month,
        months: 3 // Load 3 months at a time
      }))
    } else {
    }
  }, [currentPropertyId, currentMonth, dispatch])

  // Month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth.year, currentMonth.month - 1) // month is 1-based in state
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    
    dispatch(setCurrentMonth({
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1 // Convert back to 1-based
    }))
  }

  // Current property availability data
  const currentAvailability = useMemo(() => {

    if (!currentPropertyId || !calendar[currentPropertyId]) {
      return []
    }
    
    const result = calendar[currentPropertyId]
    return result
  }, [currentPropertyId, calendar])

  return (
    <SecuredPage>
      <Box padding="1rem" paddingMd="2rem" maxWidth="1200px" margin="0 auto">
        {/* Header */}
        <Box display="flex" flexDirection="column" flexDirectionSm="row" justifyContent="space-between" gap="1rem" marginBottom="2rem">
          <Box>
            <h1 style={{fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>
              Availability Calendar
            </h1>
            <p style={{color: '#6b7280', fontSize: isMobile ? '0.875rem' : '1rem'}}>
              Manage your property availability and block dates
            </p>
          </Box>
          
          {/* View Mode Toggle */}
          <Box display="flex" gap="0.5rem">
            <Button 
              label="Calendar" 
              icon={<FaCalendarAlt />} 
              onClick={() => dispatch(setViewMode('calendar'))} 
              variant={viewMode === 'calendar' ? 'promoted' : 'normal'}
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        </Box>

        {/* Property Selection */}
        <Box marginBottom="2rem">
          <PropertySelector 
            buttonSize={isMobile ? "small" : "medium"}
            showDetails={false}
            placeholder="Choose a property to manage availability"
            label="Select Property"
          />
        </Box>

        {/* Main Content */}
        {!currentPropertyId ? (
          // No Property Selected State
          <Box 
            padding="4rem 2rem" 
            backgroundColor="#f9fafb" 
            borderRadius="8px" 
            textAlign="center"
            border="2px dashed #d1d5db"
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <FaCalendarAlt style={{fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem'}} />
            <h3 style={{margin: '0 0 0.5rem 0', color: '#374151'}}>No Property Selected</h3>
            <p style={{color: '#6b7280', margin: 0}}>
              Select a property above to manage its availability calendar
            </p>
          </Box>
        ) : error ? (
          // Error State
          <Box 
            padding="2rem" 
            backgroundColor="#fef2f2" 
            borderRadius="8px" 
            border="1px solid #fecaca"
          >
            <h3 style={{color: '#dc2626', margin: '0 0 0.5rem 0'}}>Error Loading Availability</h3>
            <p style={{color: '#991b1b', margin: 0}}>{error}</p>
          </Box>
        ) : (
          // Calendar Content
          <Box>
            {/* Calendar Navigation */}
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              marginBottom="1.5rem"
              padding="1rem"
              backgroundColor="white"
              borderRadius="8px"
              boxShadow="0 1px 3px rgba(0,0,0,0.1)"
            >
              <Button
                label=""
                icon={<FaChevronLeft />}
                onClick={() => navigateMonth('prev')}
                variant="normal"
                size="small"
                disabled={loading}
              />
              
              <Box textAlign="center">
                <h2 style={{
                  margin: 0,
                  fontSize: isMobile ? '1.125rem' : '1.25rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {new Date(currentMonth.year, currentMonth.month - 1).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </h2>
              </Box>
              
              <Button
                label=""
                icon={<FaChevronRight />}
                onClick={() => navigateMonth('next')}
                variant="normal"
                size="small"
                disabled={loading}
              />
            </Box>

            {/* Calendar Grid */}
            <Box marginBottom="2rem">
              <CalendarGrid 
                availability={currentAvailability}
                currentMonth={currentMonth}
                loading={loading}
                isMobile={isMobile}
              />
            </Box>

            {/* Quick Actions */}
            <QuickActions 
              propertyId={currentPropertyId}
              isMobile={isMobile}
            />
          </Box>
        )}
      </Box>
    </SecuredPage>
  )
}

export default AvailabilityManager