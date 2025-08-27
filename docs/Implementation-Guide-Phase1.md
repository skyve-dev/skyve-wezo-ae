# Implementation Guide - Phase 1: Revenue Optimization

## Executive Summary
This guide provides detailed, actionable steps for implementing Phase 1 of the Wezo.ae platform roadmap. It focuses on revenue optimization features that can be implemented immediately, starting with quick wins and building toward comprehensive rate plan management.

**Important**: This guide uses the existing `openDialog` pattern from AppShellContext instead of Dialog components directly, ensuring consistency with the established architecture.

## Table of Contents
- [Quick Start Checklist](#quick-start-checklist)
- [Day 1: Quick Wins Implementation](#day-1-quick-wins-implementation)
- [Week 1: Foundation Building](#week-1-foundation-building)
- [Week 2: Core Features](#week-2-core-features)
- [Week 3-4: Advanced Features](#week-3-4-advanced-features)
- [Technical Implementation Details](#technical-implementation-details)
- [Testing Strategy](#testing-strategy)
- [Deployment Plan](#deployment-plan)

## Quick Start Checklist

### Prerequisites
- [ ] Access to codebase
- [ ] Development environment set up
- [ ] Understanding of existing components
- [ ] Backend API endpoints documented
- [ ] Test data available

### Immediate Actions (Day 1)
- [ ] Add No-Show button to Reservations
- [ ] Add Rate Plan selector to PricingTab
- [ ] Add KYC verification banner
- [ ] Create Redux slice for rate plans
- [ ] Update navigation menu

### Week 1 Deliverables
- [ ] Basic Rate Plans page
- [ ] Rate plan CRUD operations
- [ ] Integration with PropertyEdit
- [ ] Basic pricing calendar view
- [ ] Initial restrictions interface

## Day 1: Quick Wins Implementation

### 1. Add No-Show Button to Reservations (30 minutes)

**File**: `client/src/pages/Reservations.tsx`

```typescript
// Add to imports
import { FaExclamationTriangle } from 'react-icons/fa'
import { useAppShell } from '@/components/base/AppShell'

// Add utility function
const isWithin48Hours = (checkInDate: string): boolean => {
  const checkIn = new Date(checkInDate)
  const now = new Date()
  const hoursDiff = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursDiff <= 48 && hoursDiff >= -48
}

// Add AppShell hook
const { openDialog } = useAppShell()

// Add no-show handler with openDialog
const handleReportNoShow = async (reservationId: string) => {
  const confirmed = await openDialog<boolean>((close) => (
    <Box padding="2rem" textAlign="center">
      <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
        Report No-Show
      </Box>
      <Box marginBottom="2rem" color="#374151">
        Are you sure the guest did not show up? This will allow you to 
        request commission waiver within the 48-hour window.
      </Box>
      <Box display="flex" gap="1rem" justifyContent="center">
        <Button 
          label="Cancel"
          onClick={() => close(false)}
          variant="normal"
          fullWidth
        />
        <Button 
          label="Confirm No-Show"
          onClick={() => close(true)}
          variant="promoted"
          fullWidth
        />
      </Box>
    </Box>
  ))

  if (confirmed) {
    try {
      await api.post(`/api/reservations/${reservationId}/no-show`)
      // Update local state
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, status: 'NoShow', isNoShowReported: true }
            : res
        )
      )
      
      // Show success message
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
            Success!
          </Box>
          <Box marginBottom="2rem" color="#374151">
            No-show has been reported successfully. You can now request commission waiver.
          </Box>
          <Button 
            label="Continue"
            onClick={() => close()}
            variant="promoted"
          />
        </Box>
      ))
    } catch (error) {
      console.error('Failed to report no-show:', error)
      
      // Show error message
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
            Error
          </Box>
          <Box marginBottom="2rem" color="#374151">
            Failed to report no-show. Please try again later.
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

// Add to action buttons section (around line 160)
{reservation.status === 'Confirmed' && 
 isWithin48Hours(reservation.checkIn) && 
 !reservation.isNoShowReported && (
  <Button 
    label="Report No-Show" 
    icon={<FaExclamationTriangle />}
    onClick={() => handleReportNoShow(reservation.id)}
    variant="normal"
    size="small"
    style={{ 
      backgroundColor: '#fef3c7',
      color: '#92400e'
    }}
  />
)}
```

### 2. Add Rate Plan Selector to PricingTab (45 minutes)

**File**: `client/src/pages/property-edit/PricingTab.tsx`

```typescript
// Add to imports
import { SelectionPicker } from '@/components/base/SelectionPicker'
import { FaInfoCircle } from 'react-icons/fa'

// Add rate plan types
interface RatePlan {
  id: string
  name: string
  type: 'FullyFlexible' | 'NonRefundable' | 'Custom'
  discountPercentage: number
  cancellationDays: number
  description: string
}

// Add default rate plans
const defaultRatePlans: RatePlan[] = [
  {
    id: 'flexible',
    name: 'Flexible Cancellation',
    type: 'FullyFlexible',
    discountPercentage: 0,
    cancellationDays: 1,
    description: 'Free cancellation up to 24 hours before check-in'
  },
  {
    id: 'non-refundable',
    name: 'Non-Refundable Rate',
    type: 'NonRefundable',
    discountPercentage: 15,
    cancellationDays: 0,
    description: 'Save 15% with our non-refundable rate'
  },
  {
    id: 'weekly',
    name: 'Weekly Stay Discount',
    type: 'Custom',
    discountPercentage: 20,
    cancellationDays: 7,
    description: 'Stay 7+ nights and save 20%'
  }
]

// Add state
const [selectedRatePlans, setSelectedRatePlans] = useState<string[]>(['flexible'])
const [ratePlanSettings, setRatePlanSettings] = useState<Record<string, any>>({})

// Add after currency selection (around line 150)
<Box marginTop="2rem">
  <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
    <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Rate Plans</h3>
    <FaInfoCircle size={16} color="#9ca3af" />
  </Box>
  
  <SelectionPicker
    label="Active Rate Plans"
    value={selectedRatePlans}
    onChange={setSelectedRatePlans}
    options={defaultRatePlans.map(plan => ({
      value: plan.id,
      label: plan.name,
      description: plan.description
    }))}
    multiple={true}
    placeholder="Select rate plans to offer"
    helperText="Offer multiple rate plans to appeal to different guest segments"
  />

  {selectedRatePlans.includes('non-refundable') && (
    <Box marginTop="1rem" padding="1rem" backgroundColor="#fef3c7" borderRadius="8px">
      <Box display="flex" alignItems="center" gap="0.5rem">
        <FaInfoCircle color="#f59e0b" />
        <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
          Non-refundable rate automatically applies 15% discount to base prices
        </span>
      </Box>
    </Box>
  )}

  {selectedRatePlans.includes('weekly') && (
    <NumberStepperInput
      label="Minimum Nights for Weekly Discount"
      value={ratePlanSettings.weeklyMinNights || 7}
      onChange={(value) => setRatePlanSettings(prev => ({
        ...prev,
        weeklyMinNights: value
      }))}
      min={5}
      max={14}
      helperText="Minimum consecutive nights to qualify for weekly discount"
      width="200px"
      marginTop="1rem"
    />
  )}
</Box>

// Add cancellation policy section
<Box marginTop="2rem">
  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
    Cancellation Policies
  </h3>
  
  {selectedRatePlans.map(planId => {
    const plan = defaultRatePlans.find(p => p.id === planId)
    if (!plan) return null
    
    return (
      <Box key={planId} marginBottom="1.5rem" padding="1rem" border="1px solid #e5e7eb" borderRadius="8px">
        <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{plan.name}</h4>
        
        {plan.type === 'FullyFlexible' && (
          <NumberStepperInput
            label="Free Cancellation (hours before check-in)"
            value={ratePlanSettings[`${planId}_cancellationHours`] || 24}
            onChange={(value) => setRatePlanSettings(prev => ({
              ...prev,
              [`${planId}_cancellationHours`]: value
            }))}
            min={0}
            max={72}
            step={12}
            format="integer"
            currency="hours"
            currencyPosition="suffix"
            width="250px"
          />
        )}
        
        {plan.type === 'NonRefundable' && (
          <Box color="#6b7280" fontSize="0.875rem">
            No refunds allowed after booking confirmation
          </Box>
        )}
        
        {plan.type === 'Custom' && (
          <Input
            label="Custom Cancellation Policy"
            value={ratePlanSettings[`${planId}_customPolicy`] || ''}
            onChange={(e) => setRatePlanSettings(prev => ({
              ...prev,
              [`${planId}_customPolicy`]: e.target.value
            }))}
            placeholder="Describe your cancellation policy"
            as="textarea"
            rows={3}
          />
        )}
      </Box>
    )
  })}
</Box>
```

### 3. Add KYC Verification Banner (30 minutes)

**File**: `client/src/components/base/AppShell/AppShell.tsx` or `client/src/pages/Dashboard.tsx`

```typescript
// Add to imports
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from '@tanstack/react-router'

// Add KYC status check (in Dashboard.tsx)
const [kycStatus, setKycStatus] = useState<'pending' | 'submitted' | 'verified' | 'rejected'>('pending')
const navigate = useNavigate()

useEffect(() => {
  // Fetch KYC status
  const fetchKycStatus = async () => {
    try {
      const response = await api.get('/api/users/me/kyc-status')
      setKycStatus(response.data.status)
    } catch (error) {
      console.error('Failed to fetch KYC status:', error)
    }
  }
  fetchKycStatus()
}, [])

// Add banner component
const KycBanner = () => {
  if (kycStatus === 'verified') return null
  
  const bannerConfig = {
    pending: {
      color: '#fef3c7',
      iconColor: '#f59e0b',
      textColor: '#92400e',
      message: 'Complete KYC verification to receive payouts',
      buttonText: 'Verify Now'
    },
    submitted: {
      color: '#dbeafe',
      iconColor: '#3b82f6',
      textColor: '#1e40af',
      message: 'Your KYC verification is under review',
      buttonText: 'Check Status'
    },
    rejected: {
      color: '#fee2e2',
      iconColor: '#ef4444',
      textColor: '#991b1b',
      message: 'KYC verification failed. Please resubmit documents',
      buttonText: 'Resubmit'
    }
  }
  
  const config = bannerConfig[kycStatus] || bannerConfig.pending
  
  return (
    <Box 
      padding="1rem" 
      paddingX="1.5rem"
      backgroundColor={config.color}
      borderRadius="8px"
      marginBottom="1.5rem"
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap="1rem">
          <FaExclamationCircle color={config.iconColor} size={20} />
          <span style={{ color: config.textColor, fontWeight: '500' }}>
            {config.message}
          </span>
        </Box>
        <Button
          label={config.buttonText}
          size="small"
          variant="promoted"
          onClick={() => navigate('/compliance/kyc-verification')}
        />
      </Box>
    </Box>
  )
}

// Add to Dashboard render (after header, before main content)
<KycBanner />
```

## Week 1: Foundation Building

### Day 2-3: Create Rate Plans Management Page

#### Step 1: Create Folder Structure
```bash
# Terminal commands
mkdir -p client/src/pages/revenue
mkdir -p client/src/components/revenue
mkdir -p client/src/store/slices
```

#### Step 2: Create Rate Plan Slice

**File**: `client/src/store/slices/ratePlanSlice.ts`

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/utils/api'

interface RatePlan {
  id: string
  propertyId: string
  name: string
  type: 'FullyFlexible' | 'NonRefundable' | 'Custom'
  description?: string
  cancellationPolicy: string
  includesBreakfast: boolean
  percentage: number
  restrictions?: Restriction[]
  prices?: Price[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Restriction {
  id: string
  type: 'MinLengthOfStay' | 'MaxLengthOfStay' | 'NoArrivals' | 'NoDepartures' | 
        'MinAdvancedReservation' | 'MaxAdvancedReservation'
  value: number
  startDate?: string
  endDate?: string
}

interface Price {
  id: string
  date: string
  amount: number
}

interface RatePlanState {
  ratePlans: RatePlan[]
  selectedRatePlan: RatePlan | null
  loading: boolean
  error: string | null
  filters: {
    propertyId?: string
    isActive?: boolean
  }
}

const initialState: RatePlanState = {
  ratePlans: [],
  selectedRatePlan: null,
  loading: false,
  error: null,
  filters: {}
}

const ratePlanSlice = createSlice({
  name: 'ratePlan',
  initialState,
  reducers: {
    // Basic CRUD operations
    setRatePlans: (state, action: PayloadAction<RatePlan[]>) => {
      state.ratePlans = action.payload
      state.error = null
    },
    
    addRatePlan: (state, action: PayloadAction<RatePlan>) => {
      state.ratePlans.push(action.payload)
    },
    
    updateRatePlan: (state, action: PayloadAction<RatePlan>) => {
      const index = state.ratePlans.findIndex(rp => rp.id === action.payload.id)
      if (index !== -1) {
        state.ratePlans[index] = action.payload
      }
    },
    
    deleteRatePlan: (state, action: PayloadAction<string>) => {
      state.ratePlans = state.ratePlans.filter(rp => rp.id !== action.payload)
    },
    
    // Selection
    selectRatePlan: (state, action: PayloadAction<RatePlan | null>) => {
      state.selectedRatePlan = action.payload
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    
    // Filters
    setFilters: (state, action: PayloadAction<Partial<RatePlanState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    // Restrictions
    addRestriction: (state, action: PayloadAction<{ ratePlanId: string; restriction: Restriction }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan) {
        if (!ratePlan.restrictions) {
          ratePlan.restrictions = []
        }
        ratePlan.restrictions.push(action.payload.restriction)
      }
    },
    
    updateRestriction: (state, action: PayloadAction<{ ratePlanId: string; restriction: Restriction }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan && ratePlan.restrictions) {
        const index = ratePlan.restrictions.findIndex(r => r.id === action.payload.restriction.id)
        if (index !== -1) {
          ratePlan.restrictions[index] = action.payload.restriction
        }
      }
    },
    
    deleteRestriction: (state, action: PayloadAction<{ ratePlanId: string; restrictionId: string }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan && ratePlan.restrictions) {
        ratePlan.restrictions = ratePlan.restrictions.filter(r => r.id !== action.payload.restrictionId)
      }
    },
    
    // Pricing
    setPrices: (state, action: PayloadAction<{ ratePlanId: string; prices: Price[] }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan) {
        ratePlan.prices = action.payload.prices
      }
    },
    
    updatePrice: (state, action: PayloadAction<{ ratePlanId: string; date: string; amount: number }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan) {
        if (!ratePlan.prices) {
          ratePlan.prices = []
        }
        const priceIndex = ratePlan.prices.findIndex(p => p.date === action.payload.date)
        if (priceIndex !== -1) {
          ratePlan.prices[priceIndex].amount = action.payload.amount
        } else {
          ratePlan.prices.push({
            id: `price_${Date.now()}`,
            date: action.payload.date,
            amount: action.payload.amount
          })
        }
      }
    },
    
    // Clear state
    clearRatePlans: (state) => {
      return initialState
    }
  }
})

// Export actions
export const {
  setRatePlans,
  addRatePlan,
  updateRatePlan,
  deleteRatePlan,
  selectRatePlan,
  setLoading,
  setError,
  setFilters,
  addRestriction,
  updateRestriction,
  deleteRestriction,
  setPrices,
  updatePrice,
  clearRatePlans
} = ratePlanSlice.actions

// Thunks for async operations
export const fetchRatePlans = (propertyId: string) => async (dispatch: any) => {
  dispatch(setLoading(true))
  try {
    const response = await api.get(`/api/properties/${propertyId}/rate-plans`)
    dispatch(setRatePlans(response.data))
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to fetch rate plans'))
  }
}

export const createRatePlan = (propertyId: string, ratePlan: Partial<RatePlan>) => async (dispatch: any) => {
  dispatch(setLoading(true))
  try {
    const response = await api.post(`/api/properties/${propertyId}/rate-plans`, ratePlan)
    dispatch(addRatePlan(response.data))
    return response.data
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to create rate plan'))
    throw error
  }
}

export const updateRatePlanAsync = (ratePlanId: string, updates: Partial<RatePlan>) => async (dispatch: any) => {
  dispatch(setLoading(true))
  try {
    const response = await api.put(`/api/rate-plans/${ratePlanId}`, updates)
    dispatch(updateRatePlan(response.data))
    return response.data
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to update rate plan'))
    throw error
  }
}

export const deleteRatePlanAsync = (ratePlanId: string) => async (dispatch: any) => {
  dispatch(setLoading(true))
  try {
    await api.delete(`/api/rate-plans/${ratePlanId}`)
    dispatch(deleteRatePlan(ratePlanId))
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to delete rate plan'))
    throw error
  }
}

export default ratePlanSlice.reducer
```

#### Step 3: Create Rate Plans Page

**File**: `client/src/pages/revenue/RatePlans.tsx`

```typescript
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaPlus, FaEdit, FaTrash, FaCopy, FaToggleOn, FaToggleOff, FaInfoCircle } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage'
import { Box, Button, Input, SelectionPicker, Tab, NumberStepperInput } from '@/components'
import { useAppShell } from '@/components/base/AppShell'
import { fetchRatePlans, createRatePlan, updateRatePlanAsync, deleteRatePlanAsync } from '@/store/slices/ratePlanSlice'

const RatePlans: React.FC = () => {
  const dispatch = useDispatch()
  const { ratePlans, loading, error } = useSelector((state: any) => state.ratePlan)
  const { currentProperty } = useSelector((state: any) => state.property)
  const { openDialog } = useAppShell()
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'FullyFlexible',
    description: '',
    cancellationPolicy: '',
    includesBreakfast: false,
    percentage: 0
  })
  
  useEffect(() => {
    if (currentProperty?.propertyId) {
      dispatch(fetchRatePlans(currentProperty.propertyId))
    }
  }, [currentProperty])
  
  const openCreateEditDialog = (editingPlan?: any) => {
    const isEditing = !!editingPlan
    setFormData(editingPlan || {
      name: '',
      type: 'FullyFlexible',
      description: '',
      cancellationPolicy: '',
      includesBreakfast: false,
      percentage: 0
    })

    openDialog<boolean>((close) => (
      <RatePlanFormDialog
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        onSave={async () => {
          try {
            if (isEditing) {
              await dispatch(updateRatePlanAsync(editingPlan.id, formData))
            } else {
              await dispatch(createRatePlan(currentProperty.propertyId, formData))
            }
            close(true)
          } catch (error) {
            console.error('Failed to save rate plan:', error)
            close(false)
          }
        }}
        onCancel={() => close(false)}
      />
    ))
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
        await dispatch(deleteRatePlanAsync(ratePlanId))
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
      await dispatch(updateRatePlanAsync(ratePlan.id, { isActive: !ratePlan.isActive }))
    } catch (error) {
      console.error('Failed to toggle rate plan status:', error)
    }
  }
  
  // Rate Plan Form Dialog Component
  const RatePlanFormDialog = ({ formData, setFormData, isEditing, onSave, onCancel }: any) => (
    <Box padding="2rem" minWidth="600px">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
        {isEditing ? 'Edit Rate Plan' : 'Create Rate Plan'}
      </h2>
      
      <Box display="flex" flexDirection="column" gap="1.5rem">
        <Input
          label="Rate Plan Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Flexible Cancellation"
          required
        />
        
        <SelectionPicker
          label="Rate Plan Type"
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value })}
          options={[
            { value: 'FullyFlexible', label: 'Fully Flexible', description: 'Guests can cancel anytime' },
            { value: 'NonRefundable', label: 'Non-Refundable', description: 'No refunds, lower price' },
            { value: 'Custom', label: 'Custom', description: 'Define your own terms' }
          ]}
          required
        />
        
        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description for guests"
          as="textarea"
          rows={2}
        />
        
        <NumberStepperInput
          label="Discount Percentage"
          value={formData.percentage}
          onChange={(value) => setFormData({ ...formData, percentage: value })}
          min={0}
          max={50}
          step={5}
          format="integer"
          currency="%"
          currencyPosition="suffix"
          helperText="Discount applied to base rates"
        />
        
        <Box display="flex" alignItems="center" gap="1rem">
          <input
            type="checkbox"
            id="includesBreakfast"
            checked={formData.includesBreakfast}
            onChange={(e) => setFormData({ ...formData, includesBreakfast: e.target.checked })}
          />
          <label htmlFor="includesBreakfast" style={{ cursor: 'pointer' }}>
            Include breakfast with this rate plan
          </label>
        </Box>
        
        <Input
          label="Cancellation Policy"
          value={formData.cancellationPolicy}
          onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
          placeholder="Describe the cancellation terms"
          as="textarea"
          rows={3}
          required
        />
        
        <Box display="flex" gap="1rem" marginTop="1rem">
          <Button
            label="Cancel"
            variant="normal"
            onClick={onCancel}
            fullWidth
          />
          <Button
            label={isEditing ? 'Update' : 'Create'}
            variant="promoted"
            onClick={onSave}
            fullWidth
            disabled={!formData.name || !formData.cancellationPolicy}
          />
        </Box>
      </Box>
    </Box>
  )
  
  const RatePlanCard = ({ ratePlan }: { ratePlan: any }) => (
    <Box
      padding="1.5rem"
      backgroundColor="white"
      borderRadius="8px"
      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      opacity={ratePlan.isActive ? 1 : 0.6}
    >
      <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="1rem">
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{ratePlan.name}</h3>
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
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {ratePlan.description || 'No description'}
          </p>
        </Box>
        
        <Box display="flex" gap="0.5rem">
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
            onClick={() => openCreateEditDialog({ ...ratePlan, name: `${ratePlan.name} (Copy)` })}
            variant="plain"
            size="small"
            title="Duplicate"
          />
          <Button
            label=""
            icon={<FaEdit />}
            onClick={() => openCreateEditDialog(ratePlan)}
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
      
      <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap="1rem" marginTop="1rem">
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
      <Box padding="2rem" maxWidth="1200px" margin="0 auto">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="2rem">
          <Box>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Rate Plans
            </h1>
            <p style={{ color: '#6b7280' }}>
              Create multiple pricing strategies to appeal to different guest segments
            </p>
          </Box>
          
          <Button
            label="Add Rate Plan"
            icon={<FaPlus />}
            variant="promoted"
            onClick={() => openCreateEditDialog()}
          />
        </Box>
        
        {/* Info Banner */}
        {ratePlans.length === 0 && !loading && (
          <Box
            padding="1.5rem"
            backgroundColor="#dbeafe"
            borderRadius="8px"
            marginBottom="2rem"
          >
            <Box display="flex" gap="1rem">
              <FaInfoCircle color="#3b82f6" size={20} />
              <Box>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  Get Started with Rate Plans
                </h3>
                <p style={{ color: '#1e40af', fontSize: '0.875rem' }}>
                  Rate plans allow you to offer different pricing and cancellation policies. 
                  Start with a flexible rate plan, then add non-refundable or special deals to maximize revenue.
                </p>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Loading State */}
        {loading && (
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
        <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="repeat(2, 1fr)" gap="1.5rem">
          {ratePlans.map((plan: any) => (
            <RatePlanCard key={plan.id} ratePlan={plan} />
          ))}
        </Box>
      </Box>
    </SecuredPage>
  )
}

export default RatePlans
```

### Day 4-5: Create Basic Pricing Calendar

**File**: `client/src/pages/revenue/PricingCalendar.tsx`

```typescript
import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaChevronLeft, FaChevronRight, FaCalendar, FaSave } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage'
import { Box, Button, SelectionPicker, NumberStepperInput } from '@/components'
import { fetchRatePlans, setPrices, updatePrice } from '@/store/slices/ratePlanSlice'

const PricingCalendar: React.FC = () => {
  const dispatch = useDispatch()
  const { ratePlans } = useSelector((state: any) => state.ratePlan)
  const { currentProperty } = useSelector((state: any) => state.property)
  
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [prices, setPricesLocal] = useState<Record<string, number>>({})
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [bulkEditDates, setBulkEditDates] = useState<string[]>([])
  const [bulkPrice, setBulkPrice] = useState<number>(0)
  
  useEffect(() => {
    if (currentProperty?.propertyId) {
      dispatch(fetchRatePlans(currentProperty.propertyId))
    }
  }, [currentProperty])
  
  useEffect(() => {
    if (ratePlans.length > 0 && !selectedRatePlan) {
      setSelectedRatePlan(ratePlans[0].id)
    }
  }, [ratePlans])
  
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Add padding days from previous month
    const startPadding = firstDay.getDay()
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({
        date,
        isCurrentMonth: false,
        dateString: date.toISOString().split('T')[0]
      })
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        isCurrentMonth: true,
        dateString: date.toISOString().split('T')[0]
      })
    }
    
    // Add padding days from next month
    const endPadding = 6 - lastDay.getDay()
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        isCurrentMonth: false,
        dateString: date.toISOString().split('T')[0]
      })
    }
    
    return days
  }, [currentMonth])
  
  const handlePriceChange = (dateString: string, value: number) => {
    setPricesLocal(prev => ({
      ...prev,
      [dateString]: value
    }))
    setUnsavedChanges(true)
  }
  
  const handleBulkEdit = () => {
    if (bulkEditDates.length > 0 && bulkPrice > 0) {
      const updates = { ...prices }
      bulkEditDates.forEach(date => {
        updates[date] = bulkPrice
      })
      setPricesLocal(updates)
      setUnsavedChanges(true)
      setBulkEditDates([])
    }
  }
  
  const handleSave = async () => {
    const priceArray = Object.entries(prices).map(([date, amount]) => ({
      date,
      amount
    }))
    
    dispatch(setPrices({ ratePlanId: selectedRatePlan, prices: priceArray }))
    
    // API call would go here
    // await api.put(`/api/rate-plans/${selectedRatePlan}/prices`, priceArray)
    
    setUnsavedChanges(false)
  }
  
  const toggleDateSelection = (dateString: string) => {
    if (bulkEditDates.includes(dateString)) {
      setBulkEditDates(prev => prev.filter(d => d !== dateString))
    } else {
      setBulkEditDates(prev => [...prev, dateString])
    }
  }
  
  const CalendarDay = ({ day }: { day: any }) => {
    const isSelected = bulkEditDates.includes(day.dateString)
    const price = prices[day.dateString]
    const isToday = day.dateString === new Date().toISOString().split('T')[0]
    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6
    
    return (
      <Box
        padding="0.5rem"
        backgroundColor={
          !day.isCurrentMonth ? '#f9fafb' :
          isSelected ? '#dbeafe' :
          isWeekend ? '#fef3c7' :
          'white'
        }
        border="1px solid #e5e7eb"
        cursor={day.isCurrentMonth ? 'pointer' : 'default'}
        opacity={day.isCurrentMonth ? 1 : 0.5}
        onClick={() => day.isCurrentMonth && toggleDateSelection(day.dateString)}
        minHeight="80px"
        position="relative"
      >
        <Box display="flex" justifyContent="space-between" marginBottom="0.25rem">
          <span style={{ 
            fontWeight: isToday ? '600' : '400',
            color: isToday ? '#3b82f6' : '#374151'
          }}>
            {day.date.getDate()}
          </span>
          {isWeekend && day.isCurrentMonth && (
            <span style={{ fontSize: '0.625rem', color: '#92400e' }}>
              WEEKEND
            </span>
          )}
        </Box>
        
        {day.isCurrentMonth && (
          <input
            type="number"
            value={price || ''}
            onChange={(e) => {
              e.stopPropagation()
              handlePriceChange(day.dateString, parseFloat(e.target.value) || 0)
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Price"
            style={{
              width: '100%',
              padding: '0.25rem',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '0.875rem',
              marginTop: '0.25rem'
            }}
          />
        )}
      </Box>
    )
  }
  
  return (
    <SecuredPage>
      <Box padding="2rem" maxWidth="1200px" margin="0 auto">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="2rem">
          <Box>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Pricing Calendar
            </h1>
            <p style={{ color: '#6b7280' }}>
              Set specific prices for each date to maximize revenue
            </p>
          </Box>
          
          {unsavedChanges && (
            <Button
              label="Save Changes"
              icon={<FaSave />}
              variant="promoted"
              onClick={handleSave}
            />
          )}
        </Box>
        
        {/* Controls */}
        <Box display="flex" gap="2rem" marginBottom="2rem" flexWrap="wrap">
          <SelectionPicker
            label="Rate Plan"
            value={selectedRatePlan}
            onChange={setSelectedRatePlan}
            options={ratePlans.map((rp: any) => ({
              value: rp.id,
              label: rp.name
            }))}
            width="250px"
          />
          
          <Box display="flex" alignItems="flex-end" gap="1rem">
            <NumberStepperInput
              label="Bulk Edit Price"
              value={bulkPrice}
              onChange={setBulkPrice}
              min={0}
              max={10000}
              step={50}
              format="currency"
              currency="AED"
              currencyPosition="suffix"
              width="200px"
            />
            <Button
              label={`Apply to ${bulkEditDates.length} dates`}
              onClick={handleBulkEdit}
              variant="normal"
              disabled={bulkEditDates.length === 0 || bulkPrice === 0}
            />
          </Box>
        </Box>
        
        {/* Calendar Navigation */}
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
          <Button
            label=""
            icon={<FaChevronLeft />}
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            variant="normal"
          />
          
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <Button
            label=""
            icon={<FaChevronRight />}
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            variant="normal"
          />
        </Box>
        
        {/* Calendar Grid */}
        <Box>
          {/* Weekday headers */}
          <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" marginBottom="0.5rem">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Box
                key={day}
                textAlign="center"
                fontWeight="600"
                fontSize="0.875rem"
                color="#6b7280"
                padding="0.5rem"
              >
                {day}
              </Box>
            ))}
          </Box>
          
          {/* Calendar days */}
          <Box display="grid" gridTemplateColumns="repeat(7, 1fr)">
            {daysInMonth.map((day, index) => (
              <CalendarDay key={index} day={day} />
            ))}
          </Box>
        </Box>
        
        {/* Legend */}
        <Box display="flex" gap="2rem" marginTop="2rem" justifyContent="center">
          <Box display="flex" alignItems="center" gap="0.5rem">
            <Box width="20px" height="20px" backgroundColor="#fef3c7" border="1px solid #e5e7eb" />
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Weekend</span>
          </Box>
          <Box display="flex" alignItems="center" gap="0.5rem">
            <Box width="20px" height="20px" backgroundColor="#dbeafe" border="1px solid #e5e7eb" />
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Selected</span>
          </Box>
        </Box>
      </Box>
    </SecuredPage>
  )
}

export default PricingCalendar
```

### Navigation Guard Integration

For forms with unsaved changes, integrate navigation guards using the AppShell context:

```typescript
// Add to any form component
const { registerNavigationGuard } = useAppShell()

useEffect(() => {
  if (!hasUnsavedChanges) return

  const cleanup = registerNavigationGuard(async () => {
    const shouldLeave = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
          Unsaved Changes
        </Box>
        <Box marginBottom="2rem" color="#374151">
          You have unsaved changes. Are you sure you want to leave?
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button 
            label="Stay"
            onClick={() => close(false)}
            variant="normal"
          />
          <Button 
            label="Yes, Leave"
            onClick={() => close(true)}
            variant="promoted"
          />
        </Box>
      </Box>
    ))
    return shouldLeave // Return true to allow navigation, false to block
  })

  return cleanup // Cleanup function to unregister guard
}, [hasUnsavedChanges, openDialog, registerNavigationGuard])
```

## Week 2: Core Features

### Day 6-7: Booking Restrictions Interface

**File**: `client/src/pages/revenue/BookingRestrictions.tsx`

```typescript
// Implementation continues with restrictions management
// This would include:
// - Restriction rule builder
// - Date range selectors
// - Day of week restrictions
// - Min/max stay configurations
```

### Day 8-9: Integration and Testing

```typescript
// Update Routes.tsx to include new pages
export const revenueRoutes = [
  {
    path: '/rate-plans',
    component: RatePlans,
    label: 'Rate Plans'
  },
  {
    path: '/pricing-calendar',
    component: PricingCalendar,
    label: 'Pricing Calendar'
  },
  {
    path: '/restrictions',
    component: BookingRestrictions,
    label: 'Restrictions'
  }
]
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/ratePlanSlice.test.ts
describe('Rate Plan Slice', () => {
  test('should add rate plan', () => {
    // Test implementation
  })
  
  test('should update rate plan', () => {
    // Test implementation
  })
  
  test('should handle pricing updates', () => {
    // Test implementation
  })
})
```

### Integration Tests
```typescript
// __tests__/RatePlans.integration.test.tsx
describe('Rate Plans Page', () => {
  test('should create new rate plan', async () => {
    // Test implementation
  })
  
  test('should edit existing rate plan', async () => {
    // Test implementation
  })
})
```

### E2E Tests
```typescript
// e2e/revenue-management.spec.ts
describe('Revenue Management Flow', () => {
  test('Complete rate plan setup', async () => {
    // 1. Create rate plan
    // 2. Set prices in calendar
    // 3. Add restrictions
    // 4. Verify in property page
  })
})
```

## Deployment Plan

### Phase 1A Deployment (Week 2)
1. **Feature Flags**
   ```typescript
   const FEATURES = {
     RATE_PLANS: process.env.REACT_APP_ENABLE_RATE_PLANS === 'true',
     PRICING_CALENDAR: process.env.REACT_APP_ENABLE_PRICING_CALENDAR === 'true'
   }
   ```

2. **Gradual Rollout**
   - Day 1: Internal testing team
   - Day 3: 10% of users
   - Day 5: 50% of users
   - Day 7: 100% rollout

3. **Monitoring**
   - Error rates
   - API response times
   - User engagement metrics
   - Revenue impact

### Rollback Plan
```bash
# Quick rollback if issues arise
git revert --no-commit HEAD~3..HEAD
git commit -m "Rollback: Rate plans feature"
npm run deploy
```

## Success Metrics

### Week 1 Goals
- [ ] 3+ rate plans created per property
- [ ] 50% of dates have custom prices
- [ ] Zero critical bugs
- [ ] < 2s page load time

### Week 2 Goals
- [ ] 100% of active properties have rate plans
- [ ] 20% increase in booking options
- [ ] 15% improvement in revenue per property
- [ ] 90% user satisfaction score

## Support Documentation

### User Guide Topics
1. Understanding Rate Plans
2. Creating Your First Rate Plan
3. Setting Dynamic Prices
4. Managing Booking Restrictions
5. Best Practices for Revenue Optimization

### FAQ
- Q: How many rate plans can I create?
- Q: Can I copy rate plans between properties?
- Q: How do restrictions affect bookings?
- Q: When do price changes take effect?

## Next Steps After Phase 1

### Immediate Follow-ups
1. User feedback collection
2. Performance optimization
3. Bug fixes and polish
4. Documentation updates

### Phase 2 Preparation
1. KYC form development
2. Banking integration research
3. Security audit planning
4. Compliance review

---

*Implementation Guide Version: 1.0*
*Last Updated: August 2025*
*Status: Ready for Implementation*