import React from 'react'
import { Box } from '@/components'
import { ValidationErrors, WizardFormData } from '@/types/property'
import { FaInfoCircle, FaTags, FaArrowRight } from 'react-icons/fa'
import { useAppShell } from '@/components/base/AppShell'

interface PricingTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

const PricingTab: React.FC<PricingTabProps> = ({ formData, updateFormData: _updateFormData, validationErrors: _validationErrors }) => {
    const { navigateTo } = useAppShell()
    
    const handleCreateRatePlan = () => {
        if (formData.propertyId) {
            // Navigate to rate plan creation for this property
            navigateTo('rate-plan-create', { propertyId: formData.propertyId })
        }
    }
    
    const handleManageRatePlans = () => {
        if (formData.propertyId) {
            // Navigate to rate plans list for this property
            navigateTo('rate-plans', { propertyId: formData.propertyId })
        }
    }

    return (
        <Box paddingX={'1.5rem'} paddingY={'1.5rem'}>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                Pricing & Rate Plans
            </h3>
            
            <Box display="flex" flexDirection="column" gap="2rem">
                {/* Migration Notice */}
                <Box 
                    padding="1.5rem" 
                    backgroundColor="#eff6ff" 
                    borderRadius="12px" 
                    border="1px solid #bfdbfe"
                >
                    <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
                        <FaInfoCircle size={20} color="#2563eb" />
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e40af' }}>
                            New Pricing System
                        </h4>
                    </Box>
                    
                    <Box fontSize="0.875rem" color="#374151" lineHeight="1.5" marginBottom="1.5rem">
                        Pricing is now managed through <strong>Rate Plans</strong> for better flexibility and control. 
                        Rate plans allow you to create multiple pricing strategies with different cancellation policies, 
                        restrictions, and seasonal adjustments.
                    </Box>
                    
                    <Box display="flex" gap="1rem" flexWrap="wrap">
                        <Box 
                            as="button"
                            onClick={handleCreateRatePlan}
                            display="flex"
                            alignItems="center"
                            gap="0.5rem"
                            padding="0.75rem 1rem"
                            backgroundColor="#2563eb"
                            color="white"
                            borderRadius="8px"
                            border="none"
                            fontSize="0.875rem"
                            fontWeight="500"
                            cursor="pointer"
                            style={{ transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        >
                            <FaTags size={14} />
                            Create Rate Plan
                            <FaArrowRight size={12} />
                        </Box>
                        
                        <Box 
                            as="button"
                            onClick={handleManageRatePlans}
                            display="flex"
                            alignItems="center"
                            gap="0.5rem"
                            padding="0.75rem 1rem"
                            backgroundColor="white"
                            color="#2563eb"
                            borderRadius="8px"
                            border="1px solid #2563eb"
                            fontSize="0.875rem"
                            fontWeight="500"
                            cursor="pointer"
                            style={{ transition: 'all 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            View Existing Plans
                            <FaArrowRight size={12} />
                        </Box>
                    </Box>
                </Box>
                
                {/* What You Can Do with Rate Plans */}
                <Box>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                        What You Can Do with Rate Plans
                    </h4>
                    
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gridTemplateColumnsSm="1fr" gap="1rem">
                        <Box padding="1rem" backgroundColor="#f9fafb" borderRadius="8px" border="1px solid #e5e7eb">
                            <h5 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                💰 Flexible Pricing
                            </h5>
                            <Box fontSize="0.875rem" color="#6b7280">
                                Set fixed prices, percentage adjustments, or seasonal rates
                            </Box>
                        </Box>
                        
                        <Box padding="1rem" backgroundColor="#f9fafb" borderRadius="8px" border="1px solid #e5e7eb">
                            <h5 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                📋 Cancellation Policies
                            </h5>
                            <Box fontSize="0.875rem" color="#6b7280">
                                Create structured cancellation policies with multiple tiers
                            </Box>
                        </Box>
                        
                        <Box padding="1rem" backgroundColor="#f9fafb" borderRadius="8px" border="1px solid #e5e7eb">
                            <h5 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                🎯 Restrictions
                            </h5>
                            <Box fontSize="0.875rem" color="#6b7280">
                                Set minimum stays, advance booking requirements, and seasonal restrictions
                            </Box>
                        </Box>
                        
                        <Box padding="1rem" backgroundColor="#f9fafb" borderRadius="8px" border="1px solid #e5e7eb">
                            <h5 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                📅 Multiple Plans
                            </h5>
                            <Box fontSize="0.875rem" color="#6b7280">
                                Create multiple rate plans for different guest segments and seasons
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default PricingTab