import React, { useState } from 'react'
import { SecuredPage } from '@/components/SecuredPage'
import { Box, DateRangePicker } from '@/components'

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface PriceInfo {
  amount: number
  currency: string
  isOverride?: boolean
  hasDiscount?: boolean
  originalAmount?: number
}

const DateRangePickerTest: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [dateRangeWithPrices, setDateRangeWithPrices] = useState<DateRange>({ startDate: null, endDate: null })

  // Sample price data for testing
  const samplePriceData: Record<string, PriceInfo> = {
    '2025-09-06': { amount: 850, currency: 'AED' },
    '2025-09-07': { amount: 920, currency: 'AED', isOverride: true },
    '2025-09-08': { amount: 750, currency: 'AED', hasDiscount: true, originalAmount: 900 },
    '2025-09-09': { amount: 680, currency: 'AED' },
    '2025-09-10': { amount: 1200, currency: 'AED', isOverride: true },
    '2025-09-11': { amount: 1350, currency: 'AED' },
    '2025-09-12': { amount: 1100, currency: 'AED' },
    '2025-09-13': { amount: 950, currency: 'AED' },
    '2025-09-14': { amount: 800, currency: 'AED' },
    '2025-09-15': { amount: 750, currency: 'AED', hasDiscount: true, originalAmount: 850 }
  }

  // Custom renderer for price display
  const renderDateWithPrice = (date: Date, context: any) => (
    <Box textAlign="center" width="100%" position="relative">
      {/* Date number */}
      <Box 
        fontSize="1rem" 
        fontWeight={context.isSelected ? "600" : "400"}
        color={context.isDisabled ? "#9ca3af" : (context.isSelected ? "white" : "#374151")}
      >
        {date.getDate()}
      </Box>
      
      {/* Price display */}
      {context.price && !context.isDisabled && (
        <Box marginTop="2px">
          {context.price.hasDiscount ? (
            <Box>
              <Box 
                fontSize="0.65rem" 
                color={context.isSelected ? "rgba(255,255,255,0.7)" : "#9ca3af"} 
                textDecoration="line-through"
              >
                {context.price.originalAmount}
              </Box>
              <Box 
                fontSize="0.75rem" 
                color={context.isSelected ? "white" : "#059669"} 
                fontWeight="600"
              >
                {context.price.currency} {context.price.amount}
              </Box>
            </Box>
          ) : (
            <Box 
              fontSize="0.75rem" 
              color={context.isSelected ? "white" : (context.price.isOverride ? "#3182ce" : "#6b7280")}
              fontWeight={context.price.isOverride ? "600" : "400"}
            >
              {context.price.currency} {context.price.amount}
            </Box>
          )}
        </Box>
      )}
      
      {/* Special indicators */}
      {context.price?.isOverride && (
        <Box 
          position="absolute" 
          top="-2px" 
          right="-2px" 
          width="6px" 
          height="6px" 
          backgroundColor={context.isSelected ? "white" : "#3182ce"} 
          borderRadius="50%" 
        />
      )}
    </Box>
  )

  return (
    <SecuredPage>
      <Box padding="2rem" maxWidth="800px" margin="0 auto">
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '2rem', color: '#374151' }}>
          DateRangePicker Test Page
        </h1>

        {/* Basic DateRangePicker */}
        <Box marginBottom="3rem">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            Basic Date Range Selection
          </h2>
          
          <DateRangePicker
            label="Booking Dates"
            value={dateRange}
            onChange={setDateRange}
            placeholder={{ start: "Check-in Date", end: "Check-out Date" }}
            clearable
            minDate={new Date()}
            minNights={1}
            maxNights={30}
            helperText="Select your check-in and check-out dates"
          />
          
          <Box marginTop="1rem" padding="1rem" backgroundColor="#f9fafb" borderRadius="8px">
            <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
              Selected Range:
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Start: {dateRange.startDate ? dateRange.startDate.toDateString() : 'Not selected'}
              <br />
              End: {dateRange.endDate ? dateRange.endDate.toDateString() : 'Not selected'}
              <br />
              Nights: {dateRange.startDate && dateRange.endDate 
                ? Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24))
                : 0
              }
            </p>
          </Box>
        </Box>

        {/* DateRangePicker with Prices */}
        <Box marginBottom="3rem">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            Date Range Selection with Prices
          </h2>
          
          <DateRangePicker
            label="Property Booking"
            value={dateRangeWithPrices}
            onChange={setDateRangeWithPrices}
            onComplete={(range) => {
              console.log('Range selection completed:', range)
            }}
            placeholder={{ start: "Arrival", end: "Departure" }}
            clearable
            showPrices
            priceData={samplePriceData}
            renderDate={renderDateWithPrice}
            minDate={new Date()}
            minNights={2}
            maxNights={14}
            helperText="Prices shown are per night. Special offers and overrides highlighted."
          />
          
          <Box marginTop="1rem" padding="1rem" backgroundColor="#f9fafb" borderRadius="8px">
            <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
              Booking Summary:
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Check-in: {dateRangeWithPrices.startDate ? dateRangeWithPrices.startDate.toLocaleDateString() : 'Not selected'}
              <br />
              Check-out: {dateRangeWithPrices.endDate ? dateRangeWithPrices.endDate.toLocaleDateString() : 'Not selected'}
              <br />
              Duration: {dateRangeWithPrices.startDate && dateRangeWithPrices.endDate 
                ? `${Math.ceil((dateRangeWithPrices.endDate.getTime() - dateRangeWithPrices.startDate.getTime()) / (1000 * 60 * 60 * 24))} nights`
                : 'No dates selected'
              }
              {dateRangeWithPrices.startDate && dateRangeWithPrices.endDate && (
                <>
                  <br />
                  Estimated Total: AED {
                    Array.from(
                      { length: Math.ceil((dateRangeWithPrices.endDate.getTime() - dateRangeWithPrices.startDate.getTime()) / (1000 * 60 * 60 * 24)) },
                      (_, i) => {
                        const currentDate = new Date(dateRangeWithPrices.startDate!)
                        currentDate.setDate(currentDate.getDate() + i)
                        const dateString = currentDate.toISOString().split('T')[0]
                        return samplePriceData[dateString]?.amount || 800
                      }
                    ).reduce((sum, price) => sum + price, 0).toLocaleString()
                  }
                </>
              )}
            </p>
          </Box>
        </Box>

        {/* Feature List */}
        <Box>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            Component Features
          </h2>
          
          <Box 
            padding="1.5rem" 
            backgroundColor="#f0fdf4" 
            border="1px solid #bbf7d0" 
            borderRadius="8px"
          >
            <h4 style={{ margin: 0, marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: '#166534' }}>
              ✅ Implemented Features:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#166534', fontSize: '0.875rem' }}>
              <li>Unified date range selection in single component</li>
              <li>Controlled component patterns (value, onChange, onComplete)</li>
              <li>Two-phase selection: start date → end date</li>
              <li>Range validation (min/max nights, disabled dates)</li>
              <li>Price display with custom renderer support</li>
              <li>Clear button functionality</li>
              <li>Mobile-optimized sliding drawer interface</li>
              <li>Visual range highlighting in calendar</li>
              <li>Weekend and today indicators</li>
              <li>Discount and override price styling</li>
              <li>Responsive design with touch-friendly UI</li>
              <li>Accessibility support (ARIA labels, keyboard nav)</li>
            </ul>
          </Box>
        </Box>
      </Box>
    </SecuredPage>
  )
}

export default DateRangePickerTest