import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store'
import { FaChartLine, FaSpinner } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import PropertySelector from '@/components/PropertySelector'
import CalendarView from './components/Calendar/CalendarView'
import DashboardView from './components/Dashboard/DashboardView'
import PriceEditDialog from './components/Controls/PriceEditDialog'
import ModeToggle from './components/Controls/ModeToggle'
import BulkEditControls from './components/Controls/BulkEditControls'
import CalendarControls from './components/Controls/CalendarControls'
import {
  setCalendarMode,
  setDateRange,
  setSelectedRatePlans,
  fetchPricesForRatePlan,
  clearPrices
} from '@/store/slices/priceSlice'
import { fetchRatePlans } from '@/store/slices/ratePlanSlice'
import { RootState } from '@/store'
import type { Property } from '@/types/property'

const PricingCalendar: React.FC = () => {
  const dispatch = useAppDispatch()
  
  // Redux state
  const {
    calendarMode,
    selectedRatePlanIds,
    dateRange,
    priceEditForm,
    bulkEditMode,
    loading,
    error
  } = useSelector((state: RootState) => state.price)
  
  const { ratePlans, loading: ratePlansLoading } = useSelector((state: RootState) => state.ratePlan)
  const { currentProperty } = useSelector((state: RootState) => state.property)
  
  // Local state
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Initialize date range to current month
  useEffect(() => {
    if (!dateRange.startDate) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      dispatch(setDateRange({
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      }))
    }
  }, [dispatch, dateRange.startDate])
  
  // Handle property change
  const handlePropertyChange = (property: Property | null) => {
    if (property?.propertyId) {
      // Clear existing data and fetch new data for the selected property
      dispatch(clearPrices())
      dispatch(fetchRatePlans(property.propertyId))
      setIsInitialized(false)
    }
  }
  
  // Load rate plans when property changes
  useEffect(() => {
    if (currentProperty?.propertyId && !isInitialized) {
      dispatch(fetchRatePlans(currentProperty.propertyId))
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
  
  // Load prices when rate plans and date range are selected
  useEffect(() => {
    if (selectedRatePlanIds.length > 0 && dateRange.startDate && dateRange.endDate) {
      selectedRatePlanIds.forEach(ratePlanId => {
        dispatch(fetchPricesForRatePlan({
          ratePlanId,
          startDate: dateRange.startDate!,
          endDate: dateRange.endDate!
        }))
      })
    }
  }, [selectedRatePlanIds, dateRange, dispatch])
  
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
            showSelectedStatus={false}
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
            showSelectedStatus={true}
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
            <FaSpinner className="spin" style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
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
        
        {/* No Rate Plans State */}
        {!ratePlansLoading && ratePlans.length === 0 && (
          <Box 
            textAlign="center" 
            padding="3rem" 
            backgroundColor="#f9fafb" 
            borderRadius="8px"
            marginBottom="2rem"
          >
            <FaChartLine size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              No Rate Plans Found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Create rate plans first to start managing pricing
            </p>
            <Button
              label="Create Rate Plan"
              icon={<FaChartLine />}
              variant="promoted"
              onClick={() => window.location.href = '/rate-plan-create'}
            />
          </Box>
        )}
        
        {/* Main Content */}
        {!ratePlansLoading && ratePlans.length > 0 && (
          <>
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
            
            {/* Bulk Edit Controls - Only show in calendar mode */}
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
                <DashboardView />
              )}
            </Box>
          </>
        )}
        
        {/* Price Edit Dialog */}
        {priceEditForm.isOpen && (
          <PriceEditDialog />
        )}
      </Box>
    </SecuredPage>
  )
}

export default PricingCalendar