import React from 'react'
import { IoIosCloseCircleOutline, IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline as IoIosCalendarTimes, IoIosSettings } from 'react-icons/io'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import { useAppShell } from '@/components/base/AppShell'
import { useAppDispatch, useAppSelector } from '@/store'
import { blockDates, unblockDates } from '@/store/slices/availabilitySlice'

interface QuickActionsProps {
  propertyId: string
  isMobile: boolean
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  propertyId,
  isMobile
}) => {
  const { openDialog } = useAppShell()
  const dispatch = useAppDispatch()
  const { calendar, currentMonth } = useAppSelector((state) => state.availability)
  
  // Helper function to get all weekend dates in the next 3 months
  const getWeekendDates = () => {
    const weekendDates: string[] = []
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 3)
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
        weekendDates.push(currentDate.toISOString().split('T')[0])
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return weekendDates
  }

  const handleBlockWeekends = async () => {
    const weekendDates = getWeekendDates()
    
    const confirmed = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
          Block All Weekends
        </Box>
        <Box marginBottom="2rem" color="#374151">
          This will block {weekendDates.length} weekend dates (Saturday & Sunday) for the next 3 months. Continue?
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button label="Cancel" onClick={() => close(false)} />
          <Button label="Block Weekends" onClick={() => close(true)} variant="promoted" />
        </Box>
      </Box>
    ))
    
    if (confirmed) {
      try {
        await dispatch(blockDates({ 
          propertyId, 
          dates: weekendDates, 
          reason: 'Weekend blocked by host' 
        })).unwrap()
        
        // Show success dialog
        await openDialog<void>((close) => (
          <Box padding="2rem" textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
              Success!
            </Box>
            <Box marginBottom="2rem" color="#374151">
              {weekendDates.length} weekend dates have been blocked successfully.
            </Box>
            <Box display="flex" justifyContent="center">
              <Button onClick={() => close()} variant="promoted" label="Continue" />
            </Box>
          </Box>
        ))
      } catch (error) {
        // Show error dialog
        await openDialog<void>((close) => (
          <Box padding="2rem" textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
              Error
            </Box>
            <Box marginBottom="2rem" color="#374151">
              Failed to block weekend dates. Please try again.
            </Box>
            <Box display="flex" justifyContent="center">
              <Button onClick={() => close()} variant="promoted" label="OK" />
            </Box>
          </Box>
        ))
      }
    }
  }
  
  // Helper function to generate all dates between start and end
  const generateDateRange = (startDate: string, endDate: string) => {
    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start > end) {
      throw new Error('Start date must be before end date')
    }
    
    const currentDate = new Date(start)
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
  }

  const handleBlockDateRange = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    const result = await openDialog<{startDate: string, endDate: string, reason: string} | null>((close) => {
      let startDate = today
      let endDate = today
      let reason = 'Blocked by host'
      
      return (
        <Box padding="2rem">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1.5rem" color="#374151" textAlign="center">
            Block Date Range
          </Box>
          
          <Box marginBottom="1.5rem">
            <Box marginBottom="0.5rem" fontWeight="600" color="#374151">
              Start Date:
            </Box>
            <input 
              type="date" 
              defaultValue={startDate}
              min={today}
              onChange={(e) => startDate = e.target.value}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </Box>
          
          <Box marginBottom="1.5rem">
            <Box marginBottom="0.5rem" fontWeight="600" color="#374151">
              End Date:
            </Box>
            <input 
              type="date" 
              defaultValue={endDate}
              min={today}
              onChange={(e) => endDate = e.target.value}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </Box>
          
          <Box marginBottom="2rem">
            <Box marginBottom="0.5rem" fontWeight="600" color="#374151">
              Reason (optional):
            </Box>
            <input 
              type="text" 
              defaultValue={reason}
              placeholder="Enter reason for blocking"
              onChange={(e) => reason = e.target.value}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </Box>
          
          <Box display="flex" gap="1rem" justifyContent="center">
            <Button label="Cancel" onClick={() => close(null)} />
            <Button 
              label="Block Range" 
              onClick={() => close({startDate, endDate, reason})} 
              variant="promoted"
            />
          </Box>
        </Box>
      )
    })
    
    if (result) {
      try {
        const { startDate, endDate, reason } = result
        const dates = generateDateRange(startDate, endDate)
        
        await dispatch(blockDates({ 
          propertyId, 
          dates, 
          reason: reason || 'Blocked by host'
        })).unwrap()
        
        // Show success dialog
        await openDialog<void>((close) => (
          <Box padding="2rem" textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
              Success!
            </Box>
            <Box marginBottom="2rem" color="#374151">
              {dates.length} dates from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()} have been blocked successfully.
            </Box>
            <Box display="flex" justifyContent="center">
              <Button onClick={() => close()} variant="promoted" label="Continue" />
            </Box>
          </Box>
        ))
      } catch (error) {
        // Show error dialog
        await openDialog<void>((close) => (
          <Box padding="2rem" textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
              Error
            </Box>
            <Box marginBottom="2rem" color="#374151">
              Failed to block date range. Please check your dates and try again.
            </Box>
            <Box display="flex" justifyContent="center">
              <Button onClick={() => close()} variant="promoted" label="OK" />
            </Box>
          </Box>
        ))
      }
    }
  }
  
  // Helper function to get next 7 days for maintenance
  const getMaintenanceDates = () => {
    const maintenanceDates: string[] = []
    const startDate = new Date()
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      maintenanceDates.push(currentDate.toISOString().split('T')[0])
    }
    
    return maintenanceDates
  }

  const handleMaintenanceMode = async () => {
    const maintenanceDates = getMaintenanceDates()
    
    const confirmed = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
          Maintenance Mode
        </Box>
        <Box marginBottom="2rem" color="#374151">
          Block the next 7 days for maintenance? This will prevent all new bookings from {new Date().toLocaleDateString()} to {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button label="Cancel" onClick={() => close(false)} />
          <Button label="Enable Maintenance" onClick={() => close(true)} variant="promoted" />
        </Box>
      </Box>
    ))
    
    if (confirmed) {
      try {
        await dispatch(blockDates({ 
          propertyId, 
          dates: maintenanceDates, 
          reason: 'Property under maintenance' 
        })).unwrap()
        
        // Show success dialog
        await openDialog<void>((close) => (
          <Box padding="2rem" textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
              Maintenance Mode Enabled
            </Box>
            <Box marginBottom="2rem" color="#374151">
              Next 7 days have been blocked for maintenance successfully.
            </Box>
            <Box display="flex" justifyContent="center">
              <Button onClick={() => close()} variant="promoted" label="Continue" />
            </Box>
          </Box>
        ))
      } catch (error) {
        // Show error dialog
        await openDialog<void>((close) => (
          <Box padding="2rem" textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
              Error
            </Box>
            <Box marginBottom="2rem" color="#374151">
              Failed to enable maintenance mode. Please try again.
            </Box>
            <Box display="flex" justifyContent="center">
              <Button onClick={() => close()} variant="promoted" label="OK" />
            </Box>
          </Box>
        ))
      }
    }
  }
  
  // Helper function to get all blocked dates in current month
  const getBlockedDatesInCurrentMonth = () => {
    if (!calendar[propertyId]) return []
    
    const currentMonthData = calendar[propertyId].find(
      month => month.year === currentMonth.year && month.month === currentMonth.month
    )
    
    if (!currentMonthData) return []
    
    return currentMonthData.days
      .filter(day => day.status === 'blocked')
      .map(day => day.date)
  }

  const handleUnblockAll = async () => {
    const blockedDates = getBlockedDatesInCurrentMonth()
    
    if (blockedDates.length === 0) {
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#374151">
            No Blocked Dates
          </Box>
          <Box marginBottom="2rem" color="#374151">
            There are no blocked dates in the current month to unblock.
          </Box>
          <Box display="flex" justifyContent="center">
            <Button onClick={() => close()} variant="promoted" label="OK" />
          </Box>
        </Box>
      ))
      return
    }
    
    const confirmed = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
          Unblock All Dates
        </Box>
        <Box marginBottom="2rem" color="#374151">
          This will make {blockedDates.length} blocked dates available for booking in {new Date(currentMonth.year, currentMonth.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Continue?
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button label="Cancel" onClick={() => close(false)} />
          <Button label="Unblock All" onClick={() => close(true)} variant="promoted" />
        </Box>
      </Box>
    ))
    
    if (confirmed) {
      try {
        await dispatch(unblockDates({ 
          propertyId, 
          dates: blockedDates
        })).unwrap()
        
        // Show success dialog
        await openDialog<void>((close) => (
          <Box padding="2rem" textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
              Success!
            </Box>
            <Box marginBottom="2rem" color="#374151">
              {blockedDates.length} dates have been unblocked and are now available for booking.
            </Box>
            <Box display="flex" justifyContent="center">
              <Button onClick={() => close()} variant="promoted" label="Continue" />
            </Box>
          </Box>
        ))
      } catch (error) {
        // Show error dialog
        await openDialog<void>((close) => (
          <Box padding="2rem" textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
              Error
            </Box>
            <Box marginBottom="2rem" color="#374151">
              Failed to unblock dates. Please try again.
            </Box>
            <Box display="flex" justifyContent="center">
              <Button onClick={() => close()} variant="promoted" label="OK" />
            </Box>
          </Box>
        ))
      }
    }
  }
  
  return (
    <Box>
      {/* Quick Actions Header */}
      <Box marginBottom="1rem">
        <h3 style={{
          margin: 0,
          fontSize: isMobile ? '1rem' : '1.125rem',
          fontWeight: '600',
          color: '#374151'
        }}>
          Quick Actions
        </h3>
        <p style={{
          margin: '0.25rem 0 0 0',
          fontSize: isMobile ? '0.75rem' : '0.875rem',
          color: '#6b7280'
        }}>
          Common availability management tasks
        </p>
      </Box>
      
      {/* Action Buttons */}
      <Box 
        display="grid" 
        gridTemplateColumns={isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))"} 
        gap="1rem"
        backgroundColor="white"
        padding="1.5rem"
        borderRadius="8px"
        boxShadow="0 1px 3px rgba(0,0,0,0.1)"
      >
        <Button 
          label={isMobile ? "Block Weekends" : "Block All Weekends"}
          icon={<IoIosCloseCircleOutline />}
          variant="normal"
          size={isMobile ? "small" : "medium"}
          onClick={handleBlockWeekends}
          style={{
            justifyContent: 'flex-start',
            gap: '0.75rem'
          }}
        />
        
        <Button 
          label={isMobile ? "Date Range" : "Block Date Range"}
          icon={<IoIosCalendarTimes />}
          variant="normal"
          size={isMobile ? "small" : "medium"}
          onClick={handleBlockDateRange}
          style={{
            justifyContent: 'flex-start',
            gap: '0.75rem'
          }}
        />
        
        <Button 
          label={isMobile ? "Maintenance" : "Maintenance Mode"}
          icon={<IoIosSettings />}
          variant="normal"
          size={isMobile ? "small" : "medium"}
          onClick={handleMaintenanceMode}
          style={{
            justifyContent: 'flex-start',
            gap: '0.75rem'
          }}
        />
        
        <Button 
          label={isMobile ? "Unblock All" : "Unblock All Dates"}
          icon={<IoIosCheckmarkCircleOutline />}
          variant="normal"
          size={isMobile ? "small" : "medium"}
          onClick={handleUnblockAll}
          style={{
            justifyContent: 'flex-start',
            gap: '0.75rem',
            color: '#059669'
          }}
        />
      </Box>
      
      {/* Usage Instructions */}
      <Box 
        marginTop="1.5rem"
        padding="1rem"
        backgroundColor="#f0f9ff"
        borderRadius="6px"
        border="1px solid #e0f2fe"
      >
        <Box display="flex" alignItems="flex-start" gap="0.75rem">
          <Box 
            width="6px" 
            height="6px" 
            borderRadius="50%" 
            backgroundColor="#10b981" 
            marginTop="0.5rem"
            flexShrink={0}
          />
          <Box fontSize={isMobile ? "0.75rem" : "0.875rem"} color="#374151" lineHeight="1.5">
            <strong>How to use:</strong> Click any date to toggle between available (green) and blocked (red). 
            Use quick actions above for bulk operations.
          </Box>
        </Box>
      </Box>
    </Box>
  )
}