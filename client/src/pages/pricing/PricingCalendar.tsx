import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store'
import { IoIosTrendingUp, IoIosRefresh } from 'react-icons/io'
import { SecuredPage } from '@/components/SecuredPage'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import PropertySelector from '@/components/PropertySelector'
import CalendarView from './components/Calendar/CalendarView'
import DashboardView from './components/Dashboard/DashboardView'
import ModeToggle from './components/Controls/ModeToggle'
import BulkEditControls from './components/Controls/BulkEditControls'
import CalendarControls from './components/Controls/CalendarControls'
import {
  setCalendarMode,
  setDateRange,
  setSelectedRatePlans,
  fetchPropertyPricing,
  clearPrices
} from '@/store/slices/priceSlice'
import { fetchRatePlans, clearRatePlans } from '@/store/slices/ratePlanSlice'
import { RootState } from '@/store'
import type { Property } from '@/types/property'

const PricingCalendar: React.FC = () => {
  const dispatch = useAppDispatch()
  
  // Redux state
  const {
    calendarMode,
    selectedRatePlanIds,
    dateRange,
    bulkEditMode,
    loading,
    error,
  } = useSelector((state: RootState) => state.price)
  
  const { ratePlans, loading: ratePlansLoading } = useSelector((state: RootState) => state.ratePlan)
  const { currentProperty } = useSelector((state: RootState) => state.property)
  
  // Local state
  const [isInitialized, setIsInitialized] = useState(false)
  

  
  // Helper function to format date without timezone issues
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Initialize date range to current month
  useEffect(() => {
    if (!dateRange.startDate) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      dispatch(setDateRange({
        startDate: formatDateLocal(startOfMonth),
        endDate: formatDateLocal(endOfMonth)
      }))
    }
  }, [dispatch, dateRange.startDate])
  
  // Handle property change
  const handlePropertyChange = (property: Property | null) => {

    
    if (property?.propertyId) {
      // Clear existing data and fetch new data for the selected property

      dispatch(clearPrices())
      dispatch(clearRatePlans()) // Clear the old rate plans from Redux
      dispatch(setSelectedRatePlans([])) // Clear selected rate plans from previous property

      // Fetch both rate plans and property base pricing
      dispatch(fetchRatePlans(property.propertyId))
      dispatch(fetchPropertyPricing(property.propertyId))

      setIsInitialized(false)
    }
  }
  
  // Load rate plans when property changes
  useEffect(() => {

    
    if (currentProperty?.propertyId && !isInitialized) {

      // Fetch both rate plans and property base pricing
      dispatch(fetchRatePlans(currentProperty.propertyId))
      dispatch(fetchPropertyPricing(currentProperty.propertyId))
      setIsInitialized(true)
    }
  }, [currentProperty, dispatch, isInitialized])
  
  // Auto-select all active rate plans when they load
  useEffect(() => {

    if (ratePlans.length > 0 && selectedRatePlanIds.length === 0) {
      const activeRatePlans = ratePlans
        .filter(rp => rp.isActive)
        .map(rp => rp.id)
        .slice(0, 5) // Limit to 5 rate plans for performance
      

      dispatch(setSelectedRatePlans(activeRatePlans))
    }
  }, [ratePlans, selectedRatePlanIds.length, dispatch])
  
  // Note: Rate plans no longer have date-specific pricing.
  // They are only modifiers applied to property base pricing.
  
  
  // Handle mode change
  const handleModeChange = (mode: 'calendar' | 'dashboard') => {
    dispatch(setCalendarMode(mode))
  }
  
  // Loading state
  if (!currentProperty) {
    return (
      <SecuredPage>
        <Box padding="2rem" textAlign="center">
          <Box marginBottom="2rem">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Pricing Calendar
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              Manage pricing across all your rate plans with intelligent calendar views
            </p>
          </Box>
          
          <PropertySelector
            onPropertyChange={handlePropertyChange}
            placeholder="Select a property to manage pricing"
            showDetails={true}
            label="Choose Property"
          />
        </Box>
      </SecuredPage>
    )
  }
  
  return (
    <SecuredPage>
      <Box padding="1rem" paddingMd="2rem" maxWidth="1400px" margin="0 auto">
        {/* Header */}
        <Box marginBottom="2rem">
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom="1rem">
            <Box>
              <h1 style={{ 
                fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem' 
              }}>
                Pricing Calendar
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Strategic pricing management for {currentProperty.name}
              </p>
            </Box>
            
            {/* Mode Toggle */}
            <ModeToggle
              currentMode={calendarMode}
              onModeChange={handleModeChange}
              disabled={loading || ratePlansLoading}
            />
          </Box>
          
          {/* Property Selector */}
          <PropertySelector
            onPropertyChange={handlePropertyChange}
            showDetails={false}
            buttonSize="small"
          />
        </Box>
        
        {/* Loading State */}
        {(ratePlansLoading || loading) && (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            padding="3rem"
            backgroundColor="#f9fafb"
            borderRadius="8px"
            marginBottom="2rem"
          >
            <IoIosRefresh className="spin" style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
            <span style={{ color: '#6b7280' }}>
              {ratePlansLoading ? 'Loading rate plans...' : 'Loading pricing data...'}
            </span>
          </Box>
        )}
        
        {/* Error State */}
        {error && (
          <Box 
            padding="1rem" 
            backgroundColor="#fef2f2" 
            border="1px solid #fecaca"
            borderRadius="8px" 
            marginBottom="2rem"
          >
            <Box color="#dc2626" fontSize="0.875rem" fontWeight="500">
              Error: {error}
            </Box>
          </Box>
        )}
        
        {/* Main Content - Always show when not loading */}
        {!ratePlansLoading && (
          <>
            {/* Rate Plan Creation Banner - Only when zero rate plans */}
            {ratePlans.length === 0 && (
              <Box 
                padding="1rem" 
                backgroundColor="#fef3c7" 
                border="1px solid #f59e0b"
                borderRadius="8px"
                marginBottom="2rem"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap="1rem"
              >
                <Box>
                  <Box fontSize="0.875rem" fontWeight="600" color="#92400e" marginBottom="0.25rem">
                    No Rate Plans Active
                  </Box>
                  <Box fontSize="0.75rem" color="#a16207">
                    Calendar showing base property pricing only. Create rate plans for advanced pricing strategies.
                  </Box>
                </Box>
                <Button
                  label="Create Rate Plan"
                  icon={<IoIosTrendingUp />}
                  variant="promoted"
                  size="small"
                  onClick={() => window.location.href = '/rate-plan-create'}
                />
              </Box>
            )}
            
            {/* Controls */}
            <Box marginBottom="2rem">
              {calendarMode === 'calendar' ? (
                <CalendarControls />
              ) : (
                <Box display="flex" gap="1rem" alignItems="center" flexWrap="wrap">
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Dashboard view with insights and analytics
                  </span>
                </Box>
              )}
            </Box>
            
            {/* Bulk Edit Controls - Show in calendar mode for both rate plans and base pricing */}
            {calendarMode === 'calendar' && bulkEditMode && (
              <Box marginBottom="2rem">
                <BulkEditControls />
              </Box>
            )}
            
            {/* Content Views */}
            <Box>
              {calendarMode === 'calendar' ? (
                <CalendarView />
              ) : (
                ratePlans.length > 0 ? (
                  <DashboardView />
                ) : (
                  <Box 
                    textAlign="center" 
                    padding="3rem" 
                    backgroundColor="#f9fafb" 
                    borderRadius="8px"
                  >
                    <IoIosTrendingUp size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Dashboard Available with Rate Plans
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                      Create rate plans to view dashboard analytics and insights
                    </p>
                  </Box>
                )
              )}
            </Box>
          </>
        )}
        
      </Box>
    </SecuredPage>
  )
}

export default PricingCalendar