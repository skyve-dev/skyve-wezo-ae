import React from 'react'
import {FaCalendarAlt, FaChartBar, FaEdit, FaEye} from 'react-icons/fa'
import {Box} from '@/components'
import Button from '@/components/base/Button'
import {useAppShell} from '@/components/base/AppShell'
import {PriceStatistics} from '@/store/slices/priceSlice'

interface RatePlan {
  id: string
  name: string
  type: string
  adjustmentType: 'FixedPrice' | 'Percentage' | 'FixedDiscount'
  adjustmentValue: number
  isActive: boolean
  description?: string
}

interface RatePlanOverviewProps {
  ratePlans: RatePlan[]
  statistics: Record<string, PriceStatistics>
}

const RatePlanOverview: React.FC<RatePlanOverviewProps> = ({
  ratePlans,
  statistics
}) => {
  const { navigateTo } = useAppShell()
  
  const formatPrice = (amount: number) => {
    return `AED ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }
  
  const getAdjustmentDescription = (ratePlan: RatePlan) => {
    switch (ratePlan.adjustmentType) {
      case 'FixedPrice':
        return `Fixed price of ${formatPrice(ratePlan.adjustmentValue)}`
      case 'Percentage':
        return `${ratePlan.adjustmentValue}% adjustment from base rate`
      case 'FixedDiscount':
        return `${formatPrice(ratePlan.adjustmentValue)} discount from base rate`
      default:
        return 'Unknown pricing model'
    }
  }
  
  const getRatePlanColor = (index: number) => {
    return `hsl(${(index * 137.508) % 360}deg, 70%, 50%)`
  }
  
  return (
    <Box>
      <Box marginBottom="1.5rem">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
          Rate Plan Overview
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Detailed view of your active rate plans and their pricing performance
        </p>
      </Box>
      
      <Box display="flex" flexDirection="column" gap="1rem">
        {ratePlans.map((ratePlan, index) => {
          const stats = statistics[ratePlan.id]
          const color = getRatePlanColor(index)
          
          return (
            <Box
              key={ratePlan.id}
              padding="1.5rem"
              backgroundColor="white"
              border="1px solid #e5e7eb"
              borderRadius="12px"
              boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
            >
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom="1rem">
                <Box flex="1">
                  <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="0.5rem">
                    <Box
                      width="12px"
                      height="12px"
                      borderRadius="50%"
                      backgroundColor={color}
                    />
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                      {ratePlan.name}
                    </h4>
                    <Box
                      padding="0.125rem 0.5rem"
                      backgroundColor="#f0fdf4"
                      color="#166534"
                      borderRadius="12px"
                      fontSize="0.75rem"
                      fontWeight="500"
                    >
                      {ratePlan.type}
                    </Box>
                  </Box>
                  
                  <Box marginBottom="0.75rem">
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.875rem',
                      margin: 0,
                      marginBottom: '0.25rem'
                    }}>
                      {getAdjustmentDescription(ratePlan)}
                    </p>
                    {ratePlan.description && (
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>
                        {ratePlan.description}
                      </p>
                    )}
                  </Box>
                </Box>
                
                <Box display="flex" gap="0.5rem">
                  <Button
                    label=""
                    icon={<FaEye />}
                    onClick={() => navigateTo('rate-plan-edit', { id: ratePlan.id })}
                    variant="plain"
                    size="small"
                    title="View details"
                  />
                  <Button
                    label=""
                    icon={<FaEdit />}
                    onClick={() => navigateTo('rate-plan-edit', { id: ratePlan.id })}
                    variant="plain"
                    size="small"
                    title="Edit rate plan"
                  />
                </Box>
              </Box>
              
              {/* Statistics */}
              {stats ? (
                <Box>
                  <Box 
                    display="grid" 
                    gridTemplateColumns="repeat(auto-fit, minmax(140px, 1fr))" 
                    gap="1rem"
                    marginBottom="1rem"
                  >
                    <Box textAlign="center" padding="0.75rem" backgroundColor="#f9fafb" borderRadius="8px">
                      <Box fontSize="1.5rem" fontWeight="700" color="#374151" marginBottom="0.25rem">
                        {stats.totalPrices}
                      </Box>
                      <Box fontSize="0.75rem" color="#6b7280" fontWeight="500">
                        PRICES SET
                      </Box>
                    </Box>
                    
                    <Box textAlign="center" padding="0.75rem" backgroundColor="#f9fafb" borderRadius="8px">
                      <Box fontSize="1.5rem" fontWeight="700" color="#374151" marginBottom="0.25rem">
                        {formatPrice(stats.averagePrice)}
                      </Box>
                      <Box fontSize="0.75rem" color="#6b7280" fontWeight="500">
                        AVG PRICE
                      </Box>
                    </Box>
                    
                    <Box textAlign="center" padding="0.75rem" backgroundColor="#f9fafb" borderRadius="8px">
                      <Box fontSize="1.25rem" fontWeight="600" color="#374151" marginBottom="0.25rem">
                        {formatPrice(stats.minPrice)} - {formatPrice(stats.maxPrice)}
                      </Box>
                      <Box fontSize="0.75rem" color="#6b7280" fontWeight="500">
                        PRICE RANGE
                      </Box>
                    </Box>
                    
                    <Box textAlign="center" padding="0.75rem" backgroundColor="#f9fafb" borderRadius="8px">
                      <Box fontSize="1.5rem" fontWeight="700" color="#374151" marginBottom="0.25rem">
                        {formatPrice(stats.priceRange)}
                      </Box>
                      <Box fontSize="0.75rem" color="#6b7280" fontWeight="500">
                        SPREAD
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Weekend vs Weekday Analysis */}
                  {stats.weekendAveragePrice && stats.weekdayAveragePrice && (
                    <Box 
                      padding="1rem" 
                      backgroundColor="#fffbeb" 
                      border="1px solid #fde68a"
                      borderRadius="8px"
                    >
                      <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                        <FaCalendarAlt color="#d97706" size={14} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>
                          Weekend Premium Analysis
                        </span>
                      </Box>
                      
                      <Box display="flex" gap="2rem" alignItems="center">
                        <Box>
                          <Box fontSize="0.75rem" color="#92400e" marginBottom="0.25rem">
                            Weekday Average
                          </Box>
                          <Box fontSize="1rem" fontWeight="600" color="#92400e">
                            {formatPrice(stats.weekdayAveragePrice)}
                          </Box>
                        </Box>
                        
                        <Box>
                          <Box fontSize="0.75rem" color="#92400e" marginBottom="0.25rem">
                            Weekend Average
                          </Box>
                          <Box fontSize="1rem" fontWeight="600" color="#92400e">
                            {formatPrice(stats.weekendAveragePrice)}
                          </Box>
                        </Box>
                        
                        <Box>
                          <Box fontSize="0.75rem" color="#92400e" marginBottom="0.25rem">
                            Weekend Premium
                          </Box>
                          <Box fontSize="1rem" fontWeight="600" color="#92400e">
                            {((stats.weekendAveragePrice - stats.weekdayAveragePrice) / stats.weekdayAveragePrice * 100).toFixed(1)}%
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box 
                  textAlign="center" 
                  padding="2rem" 
                  backgroundColor="#f9fafb" 
                  borderRadius="8px"
                  border="1px dashed #d1d5db"
                >
                  <FaChartBar size={32} color="#d1d5db" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                    No pricing data available for this rate plan
                  </p>
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default RatePlanOverview