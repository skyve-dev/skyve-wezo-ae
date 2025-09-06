import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaCopy, FaToggleOn, FaToggleOff, FaInfoCircle } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import { useAppShell } from '@/components/base/AppShell'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchRatePlans, createRatePlan, updateRatePlanAsync, deleteRatePlanAsync } from '@/store/slices/ratePlanSlice'
import PropertySelector from '@/components/PropertySelector'

const RatePlans: React.FC = () => {
  const dispatch = useAppDispatch()
  const { ratePlans, loading, error } = useAppSelector((state) => state.ratePlan)
  const { currentProperty } = useAppSelector((state) => state.property)
  const { openDialog, navigateTo, addToast } = useAppShell()
  
  const propertyId = currentProperty?.propertyId
  
  // Fix window.innerWidth re-render issue with state
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 480)
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Memoize styles to prevent re-renders
  const styles = useMemo(() => ({
    title: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      fontWeight: 'bold' as const,
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: isMobile ? '0.875rem' : '1rem'
    },
    cardTitle: {
      fontSize: isMobile ? '1rem' : '1.125rem',
      fontWeight: '600'
    },
    cardDescription: {
      color: '#6b7280',
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      marginTop: '0.25rem'
    },
    bannerTitle: {
      fontWeight: '600',
      marginBottom: '0.5rem',
      fontSize: isMobile ? '1rem' : '1.125rem'
    },
    bannerText: {
      color: '#1e40af',
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      lineHeight: '1.4'
    }
  }), [isMobile])
  
  useEffect(() => {
    if (propertyId) {
      dispatch(fetchRatePlans(propertyId))
    }
  }, [propertyId, dispatch])

  const handleCreateRatePlan = useCallback(() => {
    navigateTo('rate-plan-create', {})
  }, [navigateTo])

  const handleEditRatePlan = useCallback((ratePlanId: string) => {
    navigateTo('rate-plan-edit', { id: ratePlanId })
  }, [navigateTo])

  const handleDuplicateRatePlan = useCallback(async (ratePlan: any) => {
    try {
      const duplicatedPlan = {
        ...ratePlan,
        name: `${ratePlan.name} (Copy)`,
        id: undefined // Remove ID to create new one
      }
      if (!propertyId) return
      await dispatch(createRatePlan(propertyId, duplicatedPlan))
      
      // Show success toast
      addToast(`Rate plan "${duplicatedPlan.name}" has been duplicated successfully!`, {
        type: 'success',
        autoHide: true,
        duration: 4000
      })
    } catch (error) {
      console.error('Failed to duplicate rate plan:', error)
      addToast('Failed to duplicate rate plan. Please try again.', {
        type: 'error',
        autoHide: true,
        duration: 4000
      })
    }
  }, [dispatch, propertyId, openDialog])

  const handleDelete = useCallback(async (ratePlanId: string) => {
    const confirmed = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
          Delete Rate Plan
        </Box>
        <Box marginBottom="2rem" color="#374151">
          Are you sure you want to delete this rate plan? Depending on its usage, it may be permanently deleted or deactivated.
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
        const result = await dispatch(deleteRatePlanAsync({ propertyId, ratePlanId }))
        
        if (deleteRatePlanAsync.fulfilled.match(result)) {
          const { type, message } = result.payload
          
          
          // Show success toast based on deletion type
          const toastType = type === 'soft' ? 'warning' : 'success'
          addToast(message, {
            type: toastType,
            autoHide: true,
            duration: 4000
          })
        } else {
          // Handle rejection/error from async thunk
          const errorPayload = result.payload as any
          
          if (errorPayload?.type === 'blocked') {
            // Show error toast for blocked deletion
            const blockMessage = errorPayload.details?.derivedRatePlanNames?.length > 0
              ? `${errorPayload.error} Dependent rate plans: ${errorPayload.details.derivedRatePlanNames.join(', ')}`
              : errorPayload.error
            
            addToast(blockMessage, {
              type: 'error',
              autoHide: false,  // Don't auto-hide important error messages
              duration: 8000
            })
          } else {
            // Show general error toast
            addToast(errorPayload?.error || 'Failed to delete rate plan. Please try again.', {
              type: 'error',
              autoHide: true,
              duration: 5000
            })
          }
        }
      } catch (error) {
        console.error('Failed to delete rate plan:', error)
        
        addToast('Failed to delete rate plan. Please try again.', {
          type: 'error',
          autoHide: true,
          duration: 4000
        })
      }
    }
  }, [dispatch, propertyId, openDialog])
  
  const handleToggleActive = useCallback(async (ratePlan: any) => {
    try {
      if (!propertyId) return
      await dispatch(updateRatePlanAsync({ propertyId, ratePlanId: ratePlan.id, data: { isActive: !ratePlan.isActive } }))
    } catch (error) {
      console.error('Failed to toggle rate plan status:', error)
    }
  }, [dispatch, propertyId])
  
  // Move RatePlanCard outside to prevent recreation on every render
  const RatePlanCard = useMemo(() => React.memo(({ ratePlan }: { ratePlan: any }) => (
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
            <h3 style={styles.cardTitle}>
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
          <p style={styles.cardDescription}>
            {ratePlan.description || 'No description'}
          </p>
        </Box>
        
        <Box display="flex" gap="0.25rem" flexWrap="wrap">
          <Button
            label=""
            icon={ratePlan.isActive ? <FaToggleOn /> : <FaToggleOff />}
            onClick={useCallback(() => handleToggleActive(ratePlan), [handleToggleActive, ratePlan])}
            variant="plain"
            size="small"
            title={ratePlan.isActive ? 'Deactivate' : 'Activate'}
          />
          <Button
            label=""
            icon={<FaCopy />}
            onClick={useCallback(() => handleDuplicateRatePlan(ratePlan), [handleDuplicateRatePlan, ratePlan])}
            variant="plain"
            size="small"
            title="Duplicate"
          />
          <Button
            label=""
            icon={<FaEdit />}
            onClick={useCallback(() => handleEditRatePlan(ratePlan.id), [handleEditRatePlan, ratePlan.id])}
            variant="plain"
            size="small"
            title="Edit"
          />
          <Button
            label=""
            icon={<FaTrash />}
            onClick={useCallback(() => handleDelete(ratePlan.id), [handleDelete, ratePlan.id])}
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
  )), [handleToggleActive, handleDuplicateRatePlan, handleEditRatePlan, handleDelete, styles])
  
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
          <Box display="flex" flexWrap={'wrap'} alignItems="start" marginBottom="1rem">
            <Box flex="1" marginRight="1rem" minWidth={320}>
              <h1 style={styles.title}>
                Rate Plans
              </h1>
              <p style={styles.subtitle}>
                Create multiple pricing strategies to appeal to different guest segments
              </p>
            </Box>
            
            <Box display="flex" gap="0.5rem" alignItems="center" marginTop={'1rem'}>
              <PropertySelector 
                buttonSize={isMobile ? "small" : "medium"}
                showDetails={false}
                placeholder="Choose a property to manage rate plans"
              />
              <Button
                label={isMobile ? "Add" : "Add Rate Plan"}
                icon={<FaPlus />}
                variant="promoted"
                onClick={handleCreateRatePlan}
                size={isMobile ? "small" : "medium"}
                disabled={!propertyId}
              />
            </Box>
          </Box>
        </Box>
        
        {/* Current Property Info */}
        {propertyId && currentProperty && (
          <Box
            padding="1rem"
            backgroundColor="#f0fdf4"
            borderRadius="8px"
            marginBottom="1.5rem"
            borderLeft="4px solid #059669"
          >
            <Box display="flex" alignItems="center" gap="0.5rem">
              <span style={{ color: '#065f46', fontSize: '0.875rem' }}>
                Managing rate plans for:
              </span>
              <strong style={{ color: '#065f46' }}>
                {currentProperty.name}
              </strong>
            </Box>
          </Box>
        )}
        
        {/* Info Banner */}
        {ratePlans.length === 0 && !loading && propertyId && (
          <Box
            padding="1rem"
            paddingSm="1.5rem"
            backgroundColor="#dbeafe"
            borderRadius="8px"
            marginBottom="2rem"
          >
            <Box display="flex" gap="0.75rem" alignItems="start">
              <FaInfoCircle color="#3b82f6" size={isMobile ? 16 : 20} style={{ flexShrink: 0 }} />
              <Box>
                <h3 style={styles.bannerTitle}>
                  Get Started with Rate Plans
                </h3>
                <p style={styles.bannerText}>
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
                  Rate plans must be linked to a property. Please select a property using the selector above to manage rate plans.
                </p>
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