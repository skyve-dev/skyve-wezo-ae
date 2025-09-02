import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaChevronLeft, FaChevronRight, FaSave } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import SelectionPicker from '@/components/base/SelectionPicker'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import { fetchRatePlans } from '@/store/slices/ratePlanSlice'

const PricingCalendar: React.FC = () => {
  const dispatch = useDispatch()
  const { ratePlans } = useSelector((state: any) => state.ratePlan)
  const { currentProperty } = useSelector((state: any) => state.property || { currentProperty: { propertyId: 'demo' } })
  
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [prices, setPricesLocal] = useState<Record<string, number>>({})
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [bulkEditDates, setBulkEditDates] = useState<string[]>([])
  const [bulkPrice, setBulkPrice] = useState<number>(0)
  
  useEffect(() => {
    const propertyId = currentProperty?.propertyId || 'demo'
    dispatch(fetchRatePlans(propertyId) as any)
  }, [currentProperty, dispatch])
  
  useEffect(() => {
    if (ratePlans.length > 0 && !selectedRatePlan) {
      setSelectedRatePlan(ratePlans[0].id)
    }
  }, [ratePlans, selectedRatePlan])
  
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
    // TODO: Update to use new pricing system
    // const priceArray = Object.entries(prices).map(([date, amount]) => ({
    //   id: `price_${date}`,
    //   date,
    //   amount
    // }))
    // dispatch(setPrices({ ratePlanId: selectedRatePlan, prices: priceArray }))
    
    // In real implementation, this would be an API call:
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
            data={ratePlans}
            idAccessor={(rp: any) => rp.id}
            value={selectedRatePlan}
            onChange={(value) => setSelectedRatePlan(value as string)}
            renderItem={(rp: any, _isSelected) => (
              <Box>{rp.name}</Box>
            )}
          />
          
          <Box display="flex" alignItems="flex-end" gap="1rem">
            <NumberStepperInput
              label="Bulk Edit Price"
              value={bulkPrice}
              onChange={setBulkPrice}
              min={0}
              max={10000}
              step={50}
              format="decimal"
              helperText="Set price for selected dates"
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