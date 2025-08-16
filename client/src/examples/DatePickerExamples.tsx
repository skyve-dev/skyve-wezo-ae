import { useState } from 'react'
import DatePicker from '../components/DatePicker'
import { Box } from '../components/Box'
import { 
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarTimes,
  FaBirthdayCake,
  FaPlane,
  FaHotel
} from 'react-icons/fa'

/**
 * Comprehensive examples showcasing DatePicker component capabilities
 */
export function DatePickerExamples() {
  const [checkInDate, setCheckInDate] = useState<string>('')
  const [checkOutDate, setCheckOutDate] = useState<string>('')
  const [birthDate, setBirthDate] = useState<string>('')
  const [eventDate, setEventDate] = useState<string>('')
  const [minMaxDate, setMinMaxDate] = useState<string>('')
  const [defaultDate, setDefaultDate] = useState<string>(new Date('2025-12-25').toISOString())

  // Calculate min/max dates
  const today = new Date()
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
  const maxDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000) // One year from now
  const maxBirthDate = new Date(today.getTime() - 18 * 365 * 24 * 60 * 60 * 1000) // 18 years ago

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Not selected'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysDifference = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box backgroundColor="white" borderBottom="1px solid #e5e7eb" padding="2rem 0">
        <Box maxWidth="1200px" margin="0 auto" padding="0 2rem">
          <Box textAlign="center">
            <Box fontSize="3rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
              DatePicker Examples
            </Box>
            <Box fontSize="1.25rem" color="#6b7280" maxWidth="800px" margin="0 auto">
              Explore the DatePicker component with various configurations, validations, and real-world use cases.
              Features calendar navigation, date constraints, and mobile-optimized interface.
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth="1200px" margin="0 auto" padding="2rem">
        
        {/* Basic Usage */}
        <Box marginBottom="3rem">
          <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            Basic Date Selection
          </Box>
          <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
            Simple date picker with default configuration
          </Box>
          
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" 
            gap="2rem"
          >
            <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <Box fontSize="1.5rem" color="#3182ce">
                  <FaCalendarAlt />
                </Box>
                <Box>
                  <Box fontSize="1.125rem" fontWeight="600">Event Date</Box>
                  <Box fontSize="0.875rem" color="#6b7280">Choose any date</Box>
                </Box>
              </Box>
              
              <DatePicker
                value={eventDate}
                onChange={setEventDate}
                placeholder="Select event date"
                label="Event Date"
              />
              
              <Box marginTop="1rem" padding="1rem" backgroundColor="#f8fafc" borderRadius="0.5rem">
                <Box fontSize="0.875rem" color="#374151">
                  <Box fontWeight="600">Selected:</Box>
                  {formatDisplayDate(eventDate)}
                </Box>
              </Box>
            </Box>

            <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <Box fontSize="1.5rem" color="#f59e0b">
                  <FaBirthdayCake />
                </Box>
                <Box>
                  <Box fontSize="1.125rem" fontWeight="600">Default Value</Box>
                  <Box fontSize="0.875rem" color="#6b7280">With pre-selected date</Box>
                </Box>
              </Box>
              
              <DatePicker
                value={defaultDate}
                onChange={setDefaultDate}
                placeholder="Select date"
                label="Date with Default"
              />
              
              <Box marginTop="1rem" padding="1rem" backgroundColor="#f8fafc" borderRadius="0.5rem">
                <Box fontSize="0.875rem" color="#374151">
                  <Box fontWeight="600">Selected:</Box>
                  {formatDisplayDate(defaultDate)}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Date Validation */}
        <Box marginBottom="3rem">
          <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            Date Validation & Constraints
          </Box>
          <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
            Date pickers with minimum and maximum date constraints
          </Box>
          
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" 
            gap="2rem"
          >
            <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <Box fontSize="1.5rem" color="#dc2626">
                  <FaCalendarTimes />
                </Box>
                <Box>
                  <Box fontSize="1.125rem" fontWeight="600">Birth Date</Box>
                  <Box fontSize="0.875rem" color="#6b7280">Must be 18+ years old</Box>
                </Box>
              </Box>
              
              <DatePicker
                value={birthDate}
                onChange={setBirthDate}
                placeholder="Select birth date"
                label="Birth Date"
                required
                maxDate={maxBirthDate.toISOString()}
              />
              
              <Box marginTop="1rem" padding="1rem" backgroundColor="#fef3c7" borderRadius="0.5rem">
                <Box fontSize="0.75rem" color="#92400e">
                  <Box fontWeight="600">Constraint:</Box>
                  Must be born before {maxBirthDate.toLocaleDateString()}
                </Box>
              </Box>
              
              <Box marginTop="0.5rem" padding="1rem" backgroundColor="#f8fafc" borderRadius="0.5rem">
                <Box fontSize="0.875rem" color="#374151">
                  <Box fontWeight="600">Selected:</Box>
                  {formatDisplayDate(birthDate)}
                </Box>
              </Box>
            </Box>

            <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <Box fontSize="1.5rem" color="#059669">
                  <FaCalendarCheck />
                </Box>
                <Box>
                  <Box fontSize="1.125rem" fontWeight="600">Future Booking</Box>
                  <Box fontSize="0.875rem" color="#6b7280">Within next year only</Box>
                </Box>
              </Box>
              
              <DatePicker
                value={minMaxDate}
                onChange={setMinMaxDate}
                placeholder="Select booking date"
                label="Booking Date"
                required
                minDate={minDate.toISOString()}
                maxDate={maxDate.toISOString()}
              />
              
              <Box marginTop="1rem" padding="1rem" backgroundColor="#dcfce7" borderRadius="0.5rem">
                <Box fontSize="0.75rem" color="#166534">
                  <Box fontWeight="600">Constraints:</Box>
                  Between {minDate.toLocaleDateString()} and {maxDate.toLocaleDateString()}
                </Box>
              </Box>
              
              <Box marginTop="0.5rem" padding="1rem" backgroundColor="#f8fafc" borderRadius="0.5rem">
                <Box fontSize="0.875rem" color="#374151">
                  <Box fontWeight="600">Selected:</Box>
                  {formatDisplayDate(minMaxDate)}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Real-World Example */}
        <Box marginBottom="3rem">
          <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            Hotel Booking Example
          </Box>
          <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
            Realistic property booking scenario with check-in and check-out dates
          </Box>
          
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)">
            <Box display="flex" alignItems="center" gap="1rem" marginBottom="2rem">
              <Box fontSize="2rem" color="#3182ce">
                <FaHotel />
              </Box>
              <Box>
                <Box fontSize="1.5rem" fontWeight="700" color="#1a202c">
                  Dubai Marina Villa Booking
                </Box>
                <Box fontSize="1rem" color="#6b7280">
                  Select your stay dates for this luxury waterfront property
                </Box>
              </Box>
            </Box>

            <Box 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" 
              gap="2rem"
              marginBottom="2rem"
            >
              <DatePicker
                value={checkInDate}
                onChange={(value) => {
                  setCheckInDate(value)
                  // Clear check-out if it's before new check-in
                  if (checkOutDate && new Date(value) >= new Date(checkOutDate)) {
                    setCheckOutDate('')
                  }
                }}
                placeholder="Select check-in date"
                label="Check-in Date"
                required
                minDate={minDate.toISOString()}
                maxDate={maxDate.toISOString()}
              />

              <DatePicker
                value={checkOutDate}
                onChange={setCheckOutDate}
                placeholder="Select check-out date"
                label="Check-out Date"
                required
                minDate={checkInDate || minDate.toISOString()}
                maxDate={maxDate.toISOString()}
                disabled={!checkInDate}
              />
            </Box>

            {/* Booking Summary */}
            <Box 
              backgroundColor="#f8fafc" 
              borderRadius="0.75rem" 
              padding="1.5rem"
              border="1px solid #e2e8f0"
            >
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
                <Box fontSize="1.25rem" color="#059669">
                  <FaPlane />
                </Box>
                <Box fontSize="1.125rem" fontWeight="600" color="#1a202c">
                  Booking Summary
                </Box>
              </Box>
              
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#6b7280">Check-in</Box>
                  <Box fontSize="1rem" fontWeight="600" color="#1a202c">
                    {checkInDate ? formatDisplayDate(checkInDate) : 'Not selected'}
                  </Box>
                </Box>
                
                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#6b7280">Check-out</Box>
                  <Box fontSize="1rem" fontWeight="600" color="#1a202c">
                    {checkOutDate ? formatDisplayDate(checkOutDate) : 'Not selected'}
                  </Box>
                </Box>
                
                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#6b7280">Duration</Box>
                  <Box fontSize="1rem" fontWeight="600" color="#1a202c">
                    {checkInDate && checkOutDate 
                      ? `${getDaysDifference(checkInDate, checkOutDate)} nights`
                      : 'Select dates'
                    }
                  </Box>
                </Box>
                
                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#6b7280">Total Price</Box>
                  <Box fontSize="1rem" fontWeight="600" color="#059669">
                    {checkInDate && checkOutDate 
                      ? `AED ${(getDaysDifference(checkInDate, checkOutDate) * 850).toLocaleString()}`
                      : 'AED 850/night'
                    }
                  </Box>
                </Box>
              </Box>

              {checkInDate && checkOutDate && (
                <Box marginTop="1.5rem">
                  <Box
                    as="button"
                    width="100%"
                    padding="1rem"
                    backgroundColor="#3182ce"
                    color="white"
                    border="none"
                    borderRadius="0.5rem"
                    fontSize="1rem"
                    fontWeight="600"
                    cursor="pointer"
                    whileHover={{ backgroundColor: '#2563eb' }}
                  >
                    Book Now - AED {(getDaysDifference(checkInDate, checkOutDate) * 850).toLocaleString()}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Technical Features */}
        <Box marginBottom="3rem">
          <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            Technical Features
          </Box>
          
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" 
            gap="1.5rem"
          >
            {[
              {
                icon: <FaCalendarAlt />,
                title: 'Calendar Navigation',
                description: 'Month/year navigation with intuitive controls',
                features: ['Previous/Next month', 'Year picker dropdown', 'Today highlighting']
              },
              {
                icon: <FaCalendarCheck />,
                title: 'Date Validation',
                description: 'Min/max date constraints with visual feedback',
                features: ['Future date only', 'Age verification', 'Booking windows']
              },
              {
                icon: <FaCalendarTimes />,
                title: 'Mobile Optimized',
                description: 'Bottom drawer interface for touch devices',
                features: ['Large touch targets', 'Smooth animations', 'Thumb-friendly UI']
              },
              {
                icon: <FaBirthdayCake />,
                title: 'Accessibility',
                description: 'Full keyboard navigation and screen reader support',
                features: ['ARIA labels', 'Focus management', 'Keyboard shortcuts']
              }
            ].map((feature, index) => (
              <Box
                key={index}
                backgroundColor="white"
                borderRadius="1rem"
                padding="1.5rem"
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
              >
                <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
                  <Box fontSize="1.5rem" color="#3182ce">
                    {feature.icon}
                  </Box>
                  <Box fontSize="1.125rem" fontWeight="600" color="#1a202c">
                    {feature.title}
                  </Box>
                </Box>
                
                <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
                  {feature.description}
                </Box>
                
                <Box display="flex" flexDirection="column" gap="0.5rem">
                  {feature.features.map((item, i) => (
                    <Box key={i} display="flex" alignItems="center" gap="0.5rem" fontSize="0.75rem">
                      <Box color="#059669">✓</Box>
                      <Box color="#374151">{item}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DatePickerExamples