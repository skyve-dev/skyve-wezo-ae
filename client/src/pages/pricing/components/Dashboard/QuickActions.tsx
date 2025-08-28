import React from 'react'
import { FaPlus, FaCopy, FaCalendarPlus, FaChartLine, FaEdit, FaDownload, FaUpload } from 'react-icons/fa'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import { useAppShell } from '@/components/base/AppShell'

interface RatePlan {
  id: string
  name: string
  type: string
}

interface QuickActionsProps {
  ratePlans: RatePlan[]
  currentProperty: any
}

const QuickActions: React.FC<QuickActionsProps> = ({
  ratePlans,
  currentProperty
}) => {
  const { navigateTo, openDialog } = useAppShell()
  
  const handleBulkPricingWizard = async () => {
    await openDialog<void>((close) => (
      <Box padding="2rem" textAlign="center" maxWidth="400px">
        <FaCalendarPlus size={48} color="#3b82f6" style={{ marginBottom: '1rem' }} />
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem">
          Bulk Pricing Wizard
        </Box>
        <Box marginBottom="2rem" color="#6b7280">
          This feature will help you set pricing across multiple date ranges and rate plans efficiently.
        </Box>
        <Box marginBottom="1rem" color="#f59e0b" fontSize="0.875rem">
          Coming in the next update!
        </Box>
        <Button onClick={() => close()} variant="promoted">Got it</Button>
      </Box>
    ))
  }
  
  const handleSeasonalPricing = async () => {
    await openDialog<void>((close) => (
      <Box padding="2rem" textAlign="center" maxWidth="400px">
        <FaChartLine size={48} color="#059669" style={{ marginBottom: '1rem' }} />
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem">
          Seasonal Pricing Templates
        </Box>
        <Box marginBottom="2rem" color="#6b7280">
          Apply predefined seasonal pricing patterns based on historical demand and market trends.
        </Box>
        <Box marginBottom="1rem" color="#f59e0b" fontSize="0.875rem">
          Advanced feature - coming soon!
        </Box>
        <Button onClick={() => close()} variant="promoted">Got it</Button>
      </Box>
    ))
  }
  
  const handleExportPricing = async () => {
    await openDialog<void>((close) => (
      <Box padding="2rem" textAlign="center" maxWidth="400px">
        <FaDownload size={48} color="#7c3aed" style={{ marginBottom: '1rem' }} />
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem">
          Export Pricing Data
        </Box>
        <Box marginBottom="2rem" color="#6b7280">
          Download your pricing data as CSV or Excel for analysis and backup purposes.
        </Box>
        <Box marginBottom="1rem" color="#f59e0b" fontSize="0.875rem">
          Export functionality coming soon!
        </Box>
        <Button onClick={() => close()} variant="promoted">Got it</Button>
      </Box>
    ))
  }
  
  const handleImportPricing = async () => {
    await openDialog<void>((close) => (
      <Box padding="2rem" textAlign="center" maxWidth="400px">
        <FaUpload size={48} color="#dc2626" style={{ marginBottom: '1rem' }} />
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem">
          Import Pricing Data
        </Box>
        <Box marginBottom="2rem" color="#6b7280">
          Upload pricing data from CSV or Excel files to quickly populate your rate plans.
        </Box>
        <Box marginBottom="1rem" color="#f59e0b" fontSize="0.875rem">
          Bulk import feature in development!
        </Box>
        <Button onClick={() => close()} variant="promoted">Got it</Button>
      </Box>
    ))
  }
  
  const actionCards = [
    {
      title: 'Create New Rate Plan',
      description: 'Set up a new rate plan with custom pricing rules and restrictions',
      icon: <FaPlus />,
      color: '#059669',
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      action: () => navigateTo('rate-plan-create', { propertyId: currentProperty?.propertyId }),
      available: true
    },
    {
      title: 'Copy Rate Plan',
      description: 'Duplicate an existing rate plan to create variations quickly',
      icon: <FaCopy />,
      color: '#3b82f6',
      backgroundColor: '#eff6ff',
      borderColor: '#dbeafe',
      action: () => {
        // Would open a rate plan selection dialog
        navigateTo('rate-plans', {})
      },
      available: ratePlans.length > 0
    },
    {
      title: 'Bulk Pricing Wizard',
      description: 'Set pricing across multiple dates and rate plans with guided wizard',
      icon: <FaCalendarPlus />,
      color: '#7c3aed',
      backgroundColor: '#faf5ff',
      borderColor: '#e9d5ff',
      action: handleBulkPricingWizard,
      available: true,
      comingSoon: true
    },
    {
      title: 'Seasonal Pricing',
      description: 'Apply seasonal pricing templates based on market trends',
      icon: <FaChartLine />,
      color: '#f59e0b',
      backgroundColor: '#fffbeb',
      borderColor: '#fde68a',
      action: handleSeasonalPricing,
      available: true,
      comingSoon: true
    },
    {
      title: 'Edit Rate Plans',
      description: 'Modify existing rate plans, restrictions, and cancellation policies',
      icon: <FaEdit />,
      color: '#dc2626',
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      action: () => navigateTo('rate-plans', {}),
      available: ratePlans.length > 0
    },
    {
      title: 'Export Pricing Data',
      description: 'Download pricing data as CSV or Excel for analysis and backup',
      icon: <FaDownload />,
      color: '#6366f1',
      backgroundColor: '#f0f9ff',
      borderColor: '#c7d2fe',
      action: handleExportPricing,
      available: ratePlans.length > 0,
      comingSoon: true
    },
    {
      title: 'Import Pricing Data',
      description: 'Upload bulk pricing data from CSV or Excel files',
      icon: <FaUpload />,
      color: '#ec4899',
      backgroundColor: '#fdf2f8',
      borderColor: '#fce7f3',
      action: handleImportPricing,
      available: true,
      comingSoon: true
    }
  ]
  
  return (
    <Box>
      <Box marginBottom="1.5rem">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
          Quick Actions
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Common pricing management tasks and shortcuts
        </p>
      </Box>
      
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" 
        gap="1rem"
      >
        {actionCards.map((card, index) => (
          <Box
            key={index}
            padding="1.5rem"
            backgroundColor={card.backgroundColor}
            border={`1px solid ${card.borderColor}`}
            borderRadius="12px"
            cursor={card.available ? 'pointer' : 'not-allowed'}
            opacity={card.available ? 1 : 0.6}
            onClick={card.available ? card.action : undefined}
            transition="all 0.2s"
            whileHover={card.available ? { 
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            } : {}}
            position="relative"
          >
            {card.comingSoon && (
              <Box
                position="absolute"
                top="0.75rem"
                right="0.75rem"
                padding="0.25rem 0.5rem"
                backgroundColor="#f59e0b"
                color="white"
                borderRadius="12px"
                fontSize="0.625rem"
                fontWeight="600"
                textTransform="uppercase"
              >
                Soon
              </Box>
            )}
            
            <Box display="flex" alignItems="flex-start" gap="1rem">
              <Box
                padding="0.75rem"
                backgroundColor="white"
                borderRadius="8px"
                border={`1px solid ${card.borderColor}`}
                color={card.color}
                flexShrink="0"
              >
                {React.cloneElement(card.icon, { size: 20 })}
              </Box>
              
              <Box flex="1">
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  margin: 0, 
                  marginBottom: '0.5rem',
                  color: card.color
                }}>
                  {card.title}
                </h4>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: card.color === '#f59e0b' ? '#92400e' : '#6b7280',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {card.description}
                </p>
              </Box>
            </Box>
            
            {!card.available && (
              <Box
                marginTop="1rem"
                padding="0.5rem 1rem"
                backgroundColor="#f3f4f6"
                borderRadius="6px"
                textAlign="center"
              >
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                  {ratePlans.length === 0 ? 'Create rate plans first' : 'Not available'}
                </span>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      
      {/* Tips Section */}
      <Box 
        marginTop="2rem" 
        padding="1.5rem" 
        backgroundColor="#f8fafc" 
        border="1px solid #e2e8f0"
        borderRadius="12px"
      >
        <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, marginBottom: '1rem', color: '#374151' }}>
          💡 Pro Tips for Better Pricing
        </h4>
        
        <Box display="flex" flexDirection="column" gap="0.5rem">
          <Box fontSize="0.875rem" color="#4b5563">
            • <strong>Weekend Premium:</strong> Consider 15-25% higher rates for weekends in leisure destinations
          </Box>
          <Box fontSize="0.875rem" color="#4b5563">
            • <strong>Advance Booking:</strong> Offer discounts for early bookings to improve cash flow
          </Box>
          <Box fontSize="0.875rem" color="#4b5563">
            • <strong>Seasonal Patterns:</strong> Analyze historical data to identify peak and off-peak periods
          </Box>
          <Box fontSize="0.875rem" color="#4b5563">
            • <strong>Competitive Monitoring:</strong> Regularly review competitor pricing to stay competitive
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default QuickActions