import React, { useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaCopy, FaToggleOn, FaToggleOff, FaInfoCircle } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import { useAppShell } from '@/components/base/AppShell'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchRatePlans, createRatePlan, updateRatePlanAsync, deleteRatePlanAsync } from '@/store/slices/ratePlanSlice'

const RatePlans: React.FC = () => {
  const dispatch = useAppDispatch()
  const { ratePlans, loading, error } = useAppSelector((state) => state.ratePlan)
  const { currentProperty } = useAppSelector((state) => state.property)
  const { openDialog, navigateTo } = useAppShell()
  
  const propertyId = currentProperty?.propertyId
  
  useEffect(() => {
    if (propertyId) {
      dispatch(fetchRatePlans(propertyId))
    }
  }, [propertyId, dispatch])

  const handleCreateRatePlan = () => {
    navigateTo('rate-plan-create', {})
  }

  const handleEditRatePlan = (ratePlanId: string) => {
    navigateTo('rate-plan-edit', { id: ratePlanId })
  }

  const handleDuplicateRatePlan = async (ratePlan: any) => {
    try {
      const duplicatedPlan = {
        ...ratePlan,
        name: `${ratePlan.name} (Copy)`,
        id: undefined // Remove ID to create new one
      }
      if (!propertyId) return
      await dispatch(createRatePlan(propertyId, duplicatedPlan))
      
      // Show success dialog
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
            Rate Plan Duplicated!
          </Box>
          <Box marginBottom="2rem" color="#374151">
            "{duplicatedPlan.name}" has been created successfully.
          </Box>
          <Button 
            label="Continue"
            onClick={() => close()}
            variant="promoted"
          />
        </Box>
      ))
    } catch (error) {
      console.error('Failed to duplicate rate plan:', error)
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
            Error
          </Box>
          <Box marginBottom="2rem" color="#374151">
            Failed to duplicate rate plan. Please try again.
          </Box>
          <Button 
            label="Close"
            onClick={() => close()}
            variant="normal"
          />
        </Box>
      ))
    }
  }

  const handleDelete = async (ratePlanId: string) => {
    const confirmed = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
          Delete Rate Plan
        </Box>
        <Box marginBottom="2rem" color="#374151">
          Are you sure you want to delete this rate plan? This action cannot be undone.
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button 
            label="Cancel"
            onClick={() => close(false)}
            variant="normal"
          />
          <Button 
            label="Delete"
            onClick={() => close(true)}
            variant="promoted"
            style={{ backgroundColor: '#dc2626' }}
          />
        </Box>
      </Box>
    ))

    if (confirmed) {
      try {
        if (!propertyId) return
        await dispatch(deleteRatePlanAsync({ propertyId, ratePlanId }))
      } catch (error) {
        console.error('Failed to delete rate plan:', error)
        
        await openDialog<void>((close) => (
          <Box padding="2rem" textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
              Error
            </Box>
            <Box marginBottom="2rem" color="#374151">
              Failed to delete rate plan. Please try again.
            </Box>
            <Button 
              label="Close"
              onClick={() => close()}
              variant="normal"
            />
          </Box>
        ))
      }
    }
  }
  
  const handleToggleActive = async (ratePlan: any) => {
    try {
      if (!propertyId) return
      await dispatch(updateRatePlanAsync({ propertyId, ratePlanId: ratePlan.id, data: { isActive: !ratePlan.isActive } }))
    } catch (error) {
      console.error('Failed to toggle rate plan status:', error)
    }
  }
  
  const RatePlanCard = ({ ratePlan }: { ratePlan: any }) => (
    <Box
      padding="1rem"
      paddingSm="1.5rem"
      backgroundColor="white"
      borderRadius="8px"
      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      opacity={ratePlan.isActive ? 1 : 0.6}
    >
      <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="1rem">
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem">
            <h3 style={{ 
              fontSize: window.innerWidth < 480 ? '1rem' : '1.125rem', 
              fontWeight: '600' 
            }}>
              {ratePlan.name}
            </h3>
            {ratePlan.type === 'NonRefundable' && (
              <Box
                padding="0.25rem 0.5rem"
                backgroundColor="#fee2e2"
                color="#991b1b"
                borderRadius="4px"
                fontSize="0.75rem"
                fontWeight="600"
              >
                NON-REF
              </Box>
            )}
          </Box>
          <p style={{ 
            color: '#6b7280', 
            fontSize: window.innerWidth < 480 ? '0.75rem' : '0.875rem', 
            marginTop: '0.25rem' 
          }}>
            {ratePlan.description || 'No description'}
          </p>
        </Box>
        
        <Box display="flex" gap="0.25rem" flexWrap="wrap">
          <Button
            label=""
            icon={ratePlan.isActive ? <FaToggleOn /> : <FaToggleOff />}
            onClick={() => handleToggleActive(ratePlan)}
            variant="plain"
            size="small"
            title={ratePlan.isActive ? 'Deactivate' : 'Activate'}
          />
          <Button
            label=""
            icon={<FaCopy />}
            onClick={() => handleDuplicateRatePlan(ratePlan)}
            variant="plain"
            size="small"
            title="Duplicate"
          />
          <Button
            label=""
            icon={<FaEdit />}
            onClick={() => handleEditRatePlan(ratePlan.id)}
            variant="plain"
            size="small"
            title="Edit"
          />
          <Button
            label=""
            icon={<FaTrash />}
            onClick={() => handleDelete(ratePlan.id)}
            variant="plain"
            size="small"
            title="Delete"
            style={{ color: '#ef4444' }}
          />
        </Box>
      </Box>
      
      <Box 
        display="grid" 
        gridTemplateColumns="1fr" 
        gridTemplateColumnsSm="1fr 1fr"
        gridTemplateColumnsMd="1fr 1fr 1fr" 
        gap="0.5rem"
        gapSm="1rem"
        marginTop="1rem"
      >
        <Box>
          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>DISCOUNT</span>
          <p style={{ fontWeight: '600' }}>{ratePlan.percentage}%</p>
        </Box>
        <Box>
          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>BREAKFAST</span>
          <p style={{ fontWeight: '600' }}>{ratePlan.includesBreakfast ? 'Included' : 'Not included'}</p>
        </Box>
        <Box>
          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>CANCELLATION</span>
          <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>
            {ratePlan.type === 'NonRefundable' ? 'Non-refundable' : 'Flexible'}
          </p>
        </Box>
      </Box>
      
      {ratePlan.restrictions && ratePlan.restrictions.length > 0 && (
        <Box marginTop="1rem" paddingTop="1rem" borderTop="1px solid #e5e7eb">
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.5rem' }}>RESTRICTIONS</p>
          <Box display="flex" flexWrap="wrap" gap="0.25rem">
            {ratePlan.restrictions.map((restriction: any, idx: number) => (
              <Box
                key={idx}
                padding="0.25rem 0.5rem"
                backgroundColor="#f3f4f6"
                borderRadius="4px"
                fontSize="0.75rem"
              >
                {restriction.type}: {restriction.value}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
  
  return (
    <SecuredPage>
      <Box 
        padding="1rem" 
        paddingMd="2rem" 
        maxWidth="1200px" 
        margin="0 auto"
      >
        {/* Header */}
        <Box marginBottom="2rem">
          <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="1rem">
            <Box flex="1" marginRight="1rem">
              <h1 style={{ 
                fontSize: window.innerWidth < 480 ? '1.5rem' : '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem' 
              }}>
                Rate Plans
              </h1>
              <p style={{ 
                color: '#6b7280',
                fontSize: window.innerWidth < 480 ? '0.875rem' : '1rem'
              }}>
                Create multiple pricing strategies to appeal to different guest segments
              </p>
            </Box>
            
            <Button
              label={window.innerWidth < 480 ? "Add" : "Add Rate Plan"}
              icon={<FaPlus />}
              variant="promoted"
              onClick={handleCreateRatePlan}
              size={window.innerWidth < 480 ? "small" : "medium"}
              disabled={!propertyId}
            />
          </Box>
        </Box>
        
        {/* Info Banner */}
        {ratePlans.length === 0 && !loading && (
          <Box
            padding="1rem"
            paddingSm="1.5rem"
            backgroundColor="#dbeafe"
            borderRadius="8px"
            marginBottom="2rem"
          >
            <Box display="flex" gap="0.75rem" alignItems="start">
              <FaInfoCircle color="#3b82f6" size={window.innerWidth < 480 ? 16 : 20} style={{ flexShrink: 0 }} />
              <Box>
                <h3 style={{ 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  fontSize: window.innerWidth < 480 ? '1rem' : '1.125rem'
                }}>
                  Get Started with Rate Plans
                </h3>
                <p style={{ 
                  color: '#1e40af', 
                  fontSize: window.innerWidth < 480 ? '0.75rem' : '0.875rem',
                  lineHeight: '1.4'
                }}>
                  Rate plans allow you to offer different pricing and cancellation policies. 
                  Start with a flexible rate plan, then add non-refundable or special deals to maximize revenue.
                </p>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* No Property State */}
        {!propertyId && (
          <Box
            padding="1.5rem"
            backgroundColor="#fef3c7"
            borderRadius="8px"
            marginBottom="2rem"
          >
            <Box display="flex" gap="0.75rem" alignItems="start">
              <FaInfoCircle color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <Box>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#92400e' }}>
                  No Property Selected
                </h3>
                <p style={{ color: '#92400e', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Rate plans must be linked to a property. Please select a property first to manage rate plans.
                </p>
                <Button
                  label="Select Property"
                  onClick={() => navigateTo('properties', {})}
                  variant="promoted"
                  size="small"
                  style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Loading State */}
        {propertyId && loading && (
          <Box display="flex" justifyContent="center" padding="4rem">
            <span>Loading rate plans...</span>
          </Box>
        )}
        
        {/* Error State */}
        {error && (
          <Box
            padding="1rem"
            backgroundColor="#fee2e2"
            borderRadius="8px"
            marginBottom="2rem"
            color="#991b1b"
          >
            Error: {error}
          </Box>
        )}
        
        {/* Rate Plans Grid */}
        {propertyId && (
          <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="repeat(2, 1fr)" gap="1.5rem">
            {ratePlans
              .filter((plan: any) => plan && plan.id) // Filter out undefined/invalid plans
              .map((plan: any) => (
                <RatePlanCard key={plan.id} ratePlan={plan} />
              ))}
          </Box>
        )}
      </Box>
    </SecuredPage>
  )
}

export default RatePlans