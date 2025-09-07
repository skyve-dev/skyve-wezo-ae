import React from 'react'
import { FaEye, FaEyeSlash, FaLock, FaUnlock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import { Box } from './base/Box'
import Button from './base/Button'
import { PropertyStatus } from '@/store/slices/propertySlice'
import { Property } from '@/types/property'

interface PropertyStatusWidgetProps {
  property: Property
  onStatusChange: (newStatus: PropertyStatus) => void
  isSaving?: boolean
  disabled?: boolean
}

const PropertyStatusWidget: React.FC<PropertyStatusWidgetProps> = ({
  property,
  onStatusChange,
  isSaving = false,
  disabled = false
}) => {
  const currentStatus = property.status
  
  // Check if property meets requirements for going live
  const canGoLive = () => {
    const issues: string[] = []
    
    if (!property.photos || property.photos.length < 5) {
      issues.push('At least 5 photos required')
    }
    
    if (!property.name || property.name.trim().length === 0) {
      issues.push('Property name required')
    }
    
    if (!property.maximumGuest || property.maximumGuest < 1) {
      issues.push('Guest capacity required')
    }
    
    return { canGoLive: issues.length === 0, issues }
  }
  
  const { canGoLive: isReadyForLive, issues } = canGoLive()
  
  // Status display configuration
  const getStatusConfig = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.Draft:
        return {
          icon: <FaEyeSlash />,
          label: 'Draft',
          color: '#6b7280', // gray
          bgColor: '#f3f4f6',
          description: 'Not visible to guests'
        }
      case PropertyStatus.Live:
        return {
          icon: <FaEye />,
          label: 'Live',
          color: '#059669', // green
          bgColor: '#d1fae5',
          description: 'Visible and bookable'
        }
      case PropertyStatus.Closed:
        return {
          icon: <FaLock />,
          label: 'Closed',
          color: '#dc2626', // red
          bgColor: '#fee2e2',
          description: 'Temporarily unavailable'
        }
      default:
        return {
          icon: <FaEyeSlash />,
          label: 'Unknown',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          description: 'Unknown status'
        }
    }
  }
  
  const statusConfig = getStatusConfig(currentStatus)
  
  const handleStatusChange = (newStatus: PropertyStatus) => {
    if (newStatus === PropertyStatus.Live && !isReadyForLive) {
      return // Prevent publishing if not ready
    }
    onStatusChange(newStatus)
  }
  
  return (
    <Box
      border="1px solid #e5e7eb"
      borderRadius="8px"
      padding="1.5rem"
      backgroundColor="white"
      boxShadow="0 1px 3px rgba(0,0,0,0.1)"
    >
      {/* Current Status Display */}
      <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="2.5rem"
          height="2.5rem"
          borderRadius="50%"
          backgroundColor={statusConfig.bgColor}
          color={statusConfig.color}
          fontSize="1.125rem"
        >
          {statusConfig.icon}
        </Box>
        <Box>
          <Box fontSize="1.125rem" fontWeight="600" color="#111827">
            Property Status: {statusConfig.label}
          </Box>
          <Box fontSize="0.875rem" color="#6b7280">
            {statusConfig.description}
          </Box>
        </Box>
      </Box>
      
      {/* Validation Issues (if trying to go live) */}
      {currentStatus === PropertyStatus.Draft && !isReadyForLive && (
        <Box
          padding="0.75rem"
          backgroundColor="#fef3cd"
          border="1px solid #fbbf24"
          borderRadius="6px"
          marginBottom="1rem"
        >
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <FaExclamationTriangle color="#d97706" />
            <Box fontSize="0.875rem" fontWeight="600" color="#92400e">
              Requirements for Publishing
            </Box>
          </Box>
          <Box fontSize="0.875rem" color="#92400e">
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </Box>
        </Box>
      )}
      
      {/* Action Buttons */}
      <Box display="flex" gap="0.75rem" flexWrap="wrap">
        {currentStatus === PropertyStatus.Draft && (
          <Button
            label={isReadyForLive ? "Publish Property" : "Cannot Publish Yet"}
            icon={isReadyForLive ? <FaCheckCircle /> : <FaExclamationTriangle />}
            variant="promoted"
            size="medium"
            onClick={() => handleStatusChange(PropertyStatus.Live)}
            disabled={!isReadyForLive || isSaving || disabled}
            loading={isSaving}
            style={{
              backgroundColor: isReadyForLive ? '#059669' : '#9ca3af',
              cursor: isReadyForLive ? 'pointer' : 'not-allowed'
            }}
          />
        )}
        
        {currentStatus === PropertyStatus.Live && (
          <>
            <Button
              label="Temporarily Close"
              icon={<FaLock />}
              variant="normal"
              size="medium"
              onClick={() => handleStatusChange(PropertyStatus.Closed)}
              disabled={isSaving || disabled}
              loading={isSaving}
              style={{
                backgroundColor: '#dc2626',
                color: 'white'
              }}
            />
            <Button
              label="Move to Draft"
              icon={<FaEyeSlash />}
              variant="normal"
              size="medium"
              onClick={() => handleStatusChange(PropertyStatus.Draft)}
              disabled={isSaving || disabled}
              style={{
                backgroundColor: '#6b7280',
                color: 'white'
              }}
            />
          </>
        )}
        
        {currentStatus === PropertyStatus.Closed && (
          <>
            <Button
              label={isReadyForLive ? "Reopen Property" : "Cannot Reopen Yet"}
              icon={isReadyForLive ? <FaUnlock /> : <FaExclamationTriangle />}
              variant="promoted"
              size="medium"
              onClick={() => handleStatusChange(PropertyStatus.Live)}
              disabled={!isReadyForLive || isSaving || disabled}
              loading={isSaving}
              style={{
                backgroundColor: isReadyForLive ? '#059669' : '#9ca3af',
                cursor: isReadyForLive ? 'pointer' : 'not-allowed'
              }}
            />
            <Button
              label="Move to Draft"
              icon={<FaEyeSlash />}
              variant="normal"
              size="medium"
              onClick={() => handleStatusChange(PropertyStatus.Draft)}
              disabled={isSaving || disabled}
              style={{
                backgroundColor: '#6b7280',
                color: 'white'
              }}
            />
          </>
        )}
      </Box>
      
      {/* Status Transition Help Text */}
      <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
        <Box fontWeight="500" marginBottom="0.25rem">Status Transitions:</Box>
        <Box>• <strong>Draft:</strong> Property is private and not bookable</Box>
        <Box>• <strong>Live:</strong> Property appears in search and accepts bookings</Box>
        <Box>• <strong>Closed:</strong> Property is temporarily unavailable</Box>
      </Box>
    </Box>
  )
}

export default PropertyStatusWidget