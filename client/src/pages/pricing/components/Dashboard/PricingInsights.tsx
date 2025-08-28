import React from 'react'
import { FaArrowUp, FaArrowDown, FaChartLine, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa'
import { Box } from '@/components'
import { PriceStatistics } from '@/store/slices/priceSlice'

interface RatePlan {
  id: string
  name: string
  type: string
  adjustmentType: 'FixedPrice' | 'Percentage' | 'FixedDiscount'
  adjustmentValue: number
}

interface PricingInsightsProps {
  ratePlans: RatePlan[]
  statistics: Record<string, PriceStatistics>
}

const PricingInsights: React.FC<PricingInsightsProps> = ({
  ratePlans,
  statistics
}) => {
  const formatPrice = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }
  
  // Generate insights based on statistics
  const generateInsights = () => {
    const insights: Array<{
      type: string
      ratePlanName: string
      title: string
      description: string
      impact: string
    }> = []
    const warnings: Array<{
      type: string
      ratePlanName: string
      title: string
      description: string
      impact: string
    }> = []
    const recommendations: Array<{
      type: string
      ratePlanName: string
      title: string
      description: string
      impact: string
    }> = []
    
    ratePlans.forEach(ratePlan => {
      const stats = statistics[ratePlan.id]
      if (!stats) return
      
      // Weekend premium analysis
      if (stats.weekendAveragePrice && stats.weekdayAveragePrice) {
        const premiumPercentage = ((stats.weekendAveragePrice - stats.weekdayAveragePrice) / stats.weekdayAveragePrice * 100)
        
        if (premiumPercentage < 10) {
          recommendations.push({
            type: 'opportunity',
            ratePlanName: ratePlan.name,
            title: 'Low Weekend Premium',
            description: `${ratePlan.name} has only ${premiumPercentage.toFixed(1)}% weekend premium. Consider increasing weekend rates.`,
            impact: 'revenue'
          })
        } else if (premiumPercentage > 50) {
          warnings.push({
            type: 'warning',
            ratePlanName: ratePlan.name,
            title: 'High Weekend Premium',
            description: `${ratePlan.name} has ${premiumPercentage.toFixed(1)}% weekend premium. This might deter weekend bookings.`,
            impact: 'occupancy'
          })
        } else {
          insights.push({
            type: 'positive',
            ratePlanName: ratePlan.name,
            title: 'Optimal Weekend Strategy',
            description: `${ratePlan.name} has a healthy ${premiumPercentage.toFixed(1)}% weekend premium.`,
            impact: 'balanced'
          })
        }
      }
      
      // Price spread analysis
      const spreadPercentage = (stats.priceRange / stats.averagePrice) * 100
      if (spreadPercentage > 100) {
        warnings.push({
          type: 'warning',
          ratePlanName: ratePlan.name,
          title: 'High Price Volatility',
          description: `${ratePlan.name} has high price variance (${spreadPercentage.toFixed(0)}% spread). Consider more consistent pricing.`,
          impact: 'predictability'
        })
      }
      
      // Low pricing data warning
      if (stats.totalPrices < 10) {
        warnings.push({
          type: 'attention',
          ratePlanName: ratePlan.name,
          title: 'Limited Pricing Data',
          description: `${ratePlan.name} has only ${stats.totalPrices} prices set. Consider setting more specific pricing.`,
          impact: 'revenue'
        })
      }
      
      // Monthly breakdown insights
      if (stats.monthlyBreakdown && stats.monthlyBreakdown.length > 1) {
        const sortedMonths = stats.monthlyBreakdown.sort((a, b) => b.averagePrice - a.averagePrice)
        const highestMonth = sortedMonths[0]
        const lowestMonth = sortedMonths[sortedMonths.length - 1]
        
        if (highestMonth.averagePrice > lowestMonth.averagePrice * 1.3) {
          insights.push({
            type: 'insight',
            ratePlanName: ratePlan.name,
            title: 'Seasonal Pricing Variance',
            description: `${ratePlan.name} shows strong seasonality: ${highestMonth.month} (${formatPrice(highestMonth.averagePrice)}) vs ${lowestMonth.month} (${formatPrice(lowestMonth.averagePrice)}).`,
            impact: 'seasonal'
          })
        }
      }
    })
    
    return { insights, warnings, recommendations }
  }
  
  const { insights, warnings, recommendations } = generateInsights()
  
  // Calculate competitive analysis between rate plans
  const competitiveAnalysis = () => {
    if (ratePlans.length < 2) return null
    
    const ratePlanStats = ratePlans.map(rp => ({
      ratePlan: rp,
      stats: statistics[rp.id]
    })).filter(item => item.stats)
    
    if (ratePlanStats.length < 2) return null
    
    const sortedByPrice = ratePlanStats.sort((a, b) => b.stats.averagePrice - a.stats.averagePrice)
    const highest = sortedByPrice[0]
    const lowest = sortedByPrice[sortedByPrice.length - 1]
    
    const priceDifference = highest.stats.averagePrice - lowest.stats.averagePrice
    const percentageDifference = (priceDifference / lowest.stats.averagePrice) * 100
    
    return {
      highest,
      lowest,
      difference: priceDifference,
      percentageDifference
    }
  }
  
  const competitive = competitiveAnalysis()
  
  return (
    <Box>
      <Box marginBottom="1.5rem">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
          Pricing Insights & Recommendations
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          AI-powered analysis of your pricing strategy and optimization opportunities
        </p>
      </Box>
      
      {/* Competitive Analysis */}
      {competitive && (
        <Box marginBottom="2rem">
          <Box 
            padding="1.5rem" 
            backgroundColor="#f0f9ff" 
            border="1px solid #e0f2fe"
            borderRadius="12px"
          >
            <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
              <FaChartLine color="#0369a1" size={16} />
              <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: '#0369a1' }}>
                Rate Plan Comparison
              </h4>
            </Box>
            
            <Box display="flex" gap="2rem" alignItems="center" flexWrap="wrap">
              <Box>
                <Box fontSize="0.75rem" color="#0369a1" marginBottom="0.25rem" fontWeight="500">
                  HIGHEST PRICED
                </Box>
                <Box fontSize="1.125rem" fontWeight="700" color="#1e40af" marginBottom="0.25rem">
                  {competitive.highest.ratePlan.name}
                </Box>
                <Box fontSize="1rem" color="#0369a1">
                  {formatPrice(competitive.highest.stats.averagePrice)}
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" color="#6b7280">
                <FaArrowDown size={20} />
              </Box>
              
              <Box textAlign="center">
                <Box fontSize="0.75rem" color="#0369a1" marginBottom="0.25rem" fontWeight="500">
                  PRICE GAP
                </Box>
                <Box fontSize="1.125rem" fontWeight="700" color="#1e40af" marginBottom="0.25rem">
                  {formatPrice(competitive.difference)}
                </Box>
                <Box fontSize="0.875rem" color="#0369a1">
                  {competitive.percentageDifference.toFixed(1)}% higher
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" color="#6b7280">
                <FaArrowUp size={20} />
              </Box>
              
              <Box textAlign="right">
                <Box fontSize="0.75rem" color="#0369a1" marginBottom="0.25rem" fontWeight="500">
                  LOWEST PRICED
                </Box>
                <Box fontSize="1.125rem" fontWeight="700" color="#1e40af" marginBottom="0.25rem">
                  {competitive.lowest.ratePlan.name}
                </Box>
                <Box fontSize="1rem" color="#0369a1">
                  {formatPrice(competitive.lowest.stats.averagePrice)}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Box marginBottom="2rem">
          <Box marginBottom="1rem">
            <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaLightbulb color="#f59e0b" />
              Revenue Opportunities
            </h4>
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.75rem">
            {recommendations.map((rec, index) => (
              <Box
                key={index}
                padding="1rem 1.5rem"
                backgroundColor="#fffbeb"
                border="1px solid #fde68a"
                borderRadius="8px"
                borderLeft="4px solid #f59e0b"
              >
                <Box display="flex" alignItems="flex-start" gap="1rem">
                  <Box>
                    <Box fontSize="0.875rem" fontWeight="600" color="#92400e" marginBottom="0.25rem">
                      {rec.title}
                    </Box>
                    <Box fontSize="0.875rem" color="#92400e">
                      {rec.description}
                    </Box>
                  </Box>
                  <Box
                    padding="0.25rem 0.5rem"
                    backgroundColor="#fbbf24"
                    color="white"
                    borderRadius="12px"
                    fontSize="0.625rem"
                    fontWeight="600"
                    textTransform="uppercase"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {rec.impact}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      
      {/* Insights */}
      {insights.length > 0 && (
        <Box marginBottom="2rem">
          <Box marginBottom="1rem">
            <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaArrowUp color="#059669" />
              Positive Insights
            </h4>
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.75rem">
            {insights.map((insight, index) => (
              <Box
                key={index}
                padding="1rem 1.5rem"
                backgroundColor="#f0fdf4"
                border="1px solid #bbf7d0"
                borderRadius="8px"
                borderLeft="4px solid #059669"
              >
                <Box display="flex" alignItems="flex-start" gap="1rem">
                  <Box>
                    <Box fontSize="0.875rem" fontWeight="600" color="#166534" marginBottom="0.25rem">
                      {insight.title}
                    </Box>
                    <Box fontSize="0.875rem" color="#166534">
                      {insight.description}
                    </Box>
                  </Box>
                  <Box
                    padding="0.25rem 0.5rem"
                    backgroundColor="#059669"
                    color="white"
                    borderRadius="12px"
                    fontSize="0.625rem"
                    fontWeight="600"
                    textTransform="uppercase"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {insight.impact}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <Box marginBottom="2rem">
          <Box marginBottom="1rem">
            <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaExclamationTriangle color="#dc2626" />
              Areas for Attention
            </h4>
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.75rem">
            {warnings.map((warning, index) => (
              <Box
                key={index}
                padding="1rem 1.5rem"
                backgroundColor="#fef2f2"
                border="1px solid #fecaca"
                borderRadius="8px"
                borderLeft="4px solid #dc2626"
              >
                <Box display="flex" alignItems="flex-start" gap="1rem">
                  <Box>
                    <Box fontSize="0.875rem" fontWeight="600" color="#dc2626" marginBottom="0.25rem">
                      {warning.title}
                    </Box>
                    <Box fontSize="0.875rem" color="#dc2626">
                      {warning.description}
                    </Box>
                  </Box>
                  <Box
                    padding="0.25rem 0.5rem"
                    backgroundColor="#dc2626"
                    color="white"
                    borderRadius="12px"
                    fontSize="0.625rem"
                    fontWeight="600"
                    textTransform="uppercase"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {warning.impact}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      
      {/* No insights message */}
      {insights.length === 0 && warnings.length === 0 && recommendations.length === 0 && (
        <Box 
          textAlign="center" 
          padding="3rem" 
          backgroundColor="#f9fafb" 
          borderRadius="8px"
          border="1px dashed #d1d5db"
        >
          <FaChartLine size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#6b7280' }}>
            Insufficient Data for Insights
          </h4>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            Set more pricing data across your rate plans to unlock AI-powered insights and recommendations
          </p>
        </Box>
      )}
    </Box>
  )
}

export default PricingInsights