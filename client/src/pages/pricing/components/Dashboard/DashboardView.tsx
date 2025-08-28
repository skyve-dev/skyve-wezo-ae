import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store'
import { FaChartLine, FaPlus, FaEdit, FaEye, FaCalendarCheck, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import RatePlanOverview from './RatePlanOverview'
import PricingInsights from './PricingInsights'
import QuickActions from './QuickActions'
import { fetchPriceStatistics } from '@/store/slices/priceSlice'
import { useAppShell } from '@/components/base/AppShell'
import { RootState } from '@/store'

const DashboardView: React.FC = () => {
  const dispatch = useAppDispatch()
  const { navigateTo } = useAppShell()
  
  const {
    selectedRatePlanIds,
    statistics,
    statisticsLoading,
    dateRange
  } = useSelector((state: RootState) => state.price)
  
  const { ratePlans } = useSelector((state: RootState) => state.ratePlan)
  const { currentProperty } = useSelector((state: RootState) => state.property)
  
  const [selectedView, setSelectedView] = useState<'overview' | 'insights' | 'actions'>('overview')
  
  // Load statistics for selected rate plans
  useEffect(() => {
    if (selectedRatePlanIds.length > 0 && dateRange.startDate && dateRange.endDate) {
      selectedRatePlanIds.forEach(ratePlanId => {
        if (!statistics[ratePlanId]) {
          dispatch(fetchPriceStatistics({
            ratePlanId,
            startDate: dateRange.startDate!,
            endDate: dateRange.endDate!
          }))
        }
      })
    }
  }, [selectedRatePlanIds, dateRange, dispatch, statistics])
  
  const selectedRatePlans = ratePlans.filter(rp => selectedRatePlanIds.includes(rp.id))
  
  // Calculate summary statistics
  const summaryStats = selectedRatePlans.reduce((acc, ratePlan) => {
    const stats = statistics[ratePlan.id]
    if (stats) {
      acc.totalPrices += stats.totalPrices
      acc.totalRevenue += stats.averagePrice * stats.totalPrices
      acc.averagePrice += stats.averagePrice
      acc.minPrice = Math.min(acc.minPrice, stats.minPrice)
      acc.maxPrice = Math.max(acc.maxPrice, stats.maxPrice)
    }
    return acc
  }, {
    totalPrices: 0,
    totalRevenue: 0,
    averagePrice: 0,
    minPrice: Infinity,
    maxPrice: 0
  })
  
  // Calculate final averages
  if (selectedRatePlans.length > 0) {
    summaryStats.averagePrice = summaryStats.averagePrice / selectedRatePlans.length
  }
  
  if (summaryStats.minPrice === Infinity) {
    summaryStats.minPrice = 0
  }
  
  return (
    <Box>
      {/* Dashboard Header */}
      <Box marginBottom="2rem">
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom="1rem">
          <Box>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0, marginBottom: '0.5rem' }}>
              Revenue Dashboard
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Strategic insights and pricing overview for {currentProperty?.name}
            </p>
          </Box>
          
          <Button
            label="Create Rate Plan"
            icon={<FaPlus />}
            variant="promoted"
            size="small"
            onClick={() => navigateTo('rate-plan-create', { propertyId: currentProperty?.propertyId })}
          />
        </Box>
        
        {/* Summary Stats Cards */}
        {selectedRatePlans.length > 0 && !statisticsLoading && (
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
            gap="1rem"
            marginBottom="1.5rem"
          >
            <Box 
              padding="1rem 1.5rem" 
              backgroundColor="#f0f9ff" 
              borderRadius="8px"
              border="1px solid #e0f2fe"
            >
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                <FaChartLine color="#0369a1" size={16} />
                <span style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: '500' }}>
                  Total Prices Set
                </span>
              </Box>
              <Box fontSize="1.75rem" fontWeight="700" color="#1e40af">
                {summaryStats.totalPrices.toLocaleString()}
              </Box>
            </Box>
            
            <Box 
              padding="1rem 1.5rem" 
              backgroundColor="#f0fdf4" 
              borderRadius="8px"
              border="1px solid #bbf7d0"
            >
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                <FaArrowUp color="#166534" size={16} />
                <span style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '500' }}>
                  Average Price
                </span>
              </Box>
              <Box fontSize="1.75rem" fontWeight="700" color="#15803d">
                ${summaryStats.averagePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Box>
            </Box>
            
            <Box 
              padding="1rem 1.5rem" 
              backgroundColor="#fefce8" 
              borderRadius="8px"
              border="1px solid #fde047"
            >
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                <FaArrowDown color="#ca8a04" size={16} />
                <span style={{ fontSize: '0.875rem', color: '#ca8a04', fontWeight: '500' }}>
                  Price Range
                </span>
              </Box>
              <Box fontSize="1.25rem" fontWeight="600" color="#a16207">
                ${summaryStats.minPrice.toLocaleString()} - ${summaryStats.maxPrice.toLocaleString()}
              </Box>
            </Box>
            
            <Box 
              padding="1rem 1.5rem" 
              backgroundColor="#fdf4ff" 
              borderRadius="8px"
              border="1px solid #e879f9"
            >
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                <FaCalendarCheck color="#a21caf" size={16} />
                <span style={{ fontSize: '0.875rem', color: '#a21caf', fontWeight: '500' }}>
                  Active Rate Plans
                </span>
              </Box>
              <Box fontSize="1.75rem" fontWeight="700" color="#be185d">
                {selectedRatePlans.length}
              </Box>
            </Box>
          </Box>
        )}
        
        {/* View Toggle */}
        <Box display="flex" gap="0.5rem" backgroundColor="#f3f4f6" padding="0.25rem" borderRadius="8px" width="fit-content">
          <Button
            label="Overview"
            icon={<FaEye />}
            onClick={() => setSelectedView('overview')}
            variant={selectedView === 'overview' ? 'promoted' : 'plain'}
            size="small"
            style={{
              backgroundColor: selectedView === 'overview' ? '#D52122' : 'transparent',
              color: selectedView === 'overview' ? 'white' : '#374151',
              border: 'none'
            }}
          />
          
          <Button
            label="Insights"
            icon={<FaChartLine />}
            onClick={() => setSelectedView('insights')}
            variant={selectedView === 'insights' ? 'promoted' : 'plain'}
            size="small"
            style={{
              backgroundColor: selectedView === 'insights' ? '#D52122' : 'transparent',
              color: selectedView === 'insights' ? 'white' : '#374151',
              border: 'none'
            }}
          />
          
          <Button
            label="Actions"
            icon={<FaEdit />}
            onClick={() => setSelectedView('actions')}
            variant={selectedView === 'actions' ? 'promoted' : 'plain'}
            size="small"
            style={{
              backgroundColor: selectedView === 'actions' ? '#D52122' : 'transparent',
              color: selectedView === 'actions' ? 'white' : '#374151',
              border: 'none'
            }}
          />
        </Box>
      </Box>
      
      {/* Loading State */}
      {statisticsLoading && (
        <Box textAlign="center" padding="3rem" backgroundColor="#f9fafb" borderRadius="8px">
          <Box marginBottom="1rem">
            <div className="spin" style={{ display: 'inline-block' }}>
              <FaChartLine size={32} color="#6b7280" />
            </div>
          </Box>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            Loading pricing insights...
          </p>
        </Box>
      )}
      
      {/* No Rate Plans Selected */}
      {selectedRatePlans.length === 0 && (
        <Box textAlign="center" padding="3rem" backgroundColor="#f9fafb" borderRadius="8px">
          <FaChartLine size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            No Rate Plans Selected
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Select rate plans from the calendar controls to view dashboard insights
          </p>
          <Button
            label="Switch to Calendar"
            icon={<FaChartLine />}
            variant="promoted"
            onClick={() => dispatch({ type: 'price/setCalendarMode', payload: 'calendar' })}
          />
        </Box>
      )}
      
      {/* Dashboard Content */}
      {selectedRatePlans.length > 0 && !statisticsLoading && (
        <Box>
          {selectedView === 'overview' && (
            <RatePlanOverview 
              ratePlans={selectedRatePlans}
              statistics={statistics}
            />
          )}
          
          {selectedView === 'insights' && (
            <PricingInsights
              ratePlans={selectedRatePlans}
              statistics={statistics}
            />
          )}
          
          {selectedView === 'actions' && (
            <QuickActions
              ratePlans={selectedRatePlans}
              currentProperty={currentProperty}
            />
          )}
        </Box>
      )}
    </Box>
  )
}

export default DashboardView