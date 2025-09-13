import React, {useEffect, useState} from 'react'
import {Box} from './Box'
import TimePicker from './TimePicker'
import {IoIosCalendar, IoIosSettings, IoIosHome, IoIosTime} from 'react-icons/io'

// Example data interfaces (commented out as not used)
// interface BookingSchedule {
//   checkInTime: string
//   checkOutTime: string
//   propertyId: string
// }

interface ServiceSchedule {
  cleaningTime: string
  maintenanceTime: string
  inspectionTime: string
}

interface EventBooking {
  eventStart: string
  eventEnd: string
  setupTime: string
  cleanupTime: string
}

const TimePickerExample: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('basic')

  // Basic usage states
  const [basicTime12, setBasicTime12] = useState<string>('')
  const [basicTime24, setBasicTime24] = useState<string>('')

  // Booking form states
  const [checkInTime, setCheckInTime] = useState<string>('')
  const [checkOutTime, setCheckOutTime] = useState<string>('')
  const [timeValidationError, setTimeValidationError] = useState<string>('')

  // Service scheduling states
  const [serviceSchedule, setServiceSchedule] = useState<ServiceSchedule>({
    cleaningTime: '',
    maintenanceTime: '',
    inspectionTime: ''
  })

  // Event booking states
  const [eventBooking, setEventBooking] = useState<EventBooking>({
    eventStart: '',
    eventEnd: '',
    setupTime: '',
    cleanupTime: ''
  })

  // Business hours availability
  const [availableFrom, setAvailableFrom] = useState<string>('')
  const [availableTo, setAvailableTo] = useState<string>('')
  const [emergencyContact, setEmergencyContact] = useState<string>('')

  // Interval demonstration
  const [intervalType, setIntervalType] = useState<number>(15)
  const [intervalTime, setIntervalTime] = useState<string>('')

  // Format comparison states
  const [formatTime1, setFormatTime1] = useState<string>('')
  const [formatTime2, setFormatTime2] = useState<string>('')
  const [formatTime3, setFormatTime3] = useState<string>('')

  // Time range validation
  useEffect(() => {
    if (checkInTime && checkOutTime) {
      const checkIn = new Date(checkInTime)
      const checkOut = new Date(checkOutTime)
      
      if (checkOut <= checkIn) {
        setTimeValidationError('Check-out time must be after check-in time')
      } else if ((checkOut.getTime() - checkIn.getTime()) < (60 * 60 * 1000)) {
        setTimeValidationError('Minimum stay duration is 1 hour')
      } else {
        setTimeValidationError('')
      }
    } else {
      setTimeValidationError('')
    }
  }, [checkInTime, checkOutTime])

  // Calculate event duration
  const calculateEventDuration = () => {
    if (!eventBooking.eventStart || !eventBooking.eventEnd) return ''
    
    const start = new Date(eventBooking.eventStart)
    const end = new Date(eventBooking.eventEnd)
    const diffMs = end.getTime() - start.getTime()
    
    if (diffMs <= 0) return 'Invalid duration'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours === 0) {
      return `${diffMinutes} minutes`
    } else if (diffMinutes === 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`
    } else {
      return `${diffHours}h ${diffMinutes}m`
    }
  }

  // Format time for display
  const formatTimeDisplay = (isoString: string, use12Hour: boolean = true) => {
    if (!isoString) return 'Not selected'
    
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return 'Invalid time'
    
    if (use12Hour) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  }

  // Check if time is within business hours
  const isWithinBusinessHours = (time: string) => {
    if (!time) return true
    
    const date = new Date(time)
    const hour = date.getHours()
    return hour >= 9 && hour <= 17
  }

  const tabs = [
    { id: 'basic', name: 'Basic Usage' },
    { id: 'booking', name: 'Booking Forms' },
    { id: 'intervals', name: 'Intervals & Formats' },
    { id: 'validation', name: 'Advanced Features' }
  ]

  return (
    <Box padding="2rem" maxWidth="1200px" margin="0 auto">
      <Box marginBottom="2rem">
        <Box fontSize="2rem" fontWeight="700" color="#111827" marginBottom="0.5rem">
          TimePicker Component Examples
        </Box>
        <Box fontSize="1.125rem" color="#6b7280">
          Sophisticated time selection with sliding drawer interface and customizable intervals
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box 
        display="flex" 
        borderBottom="2px solid #e5e7eb"
        marginBottom="2rem"
        overflowX="auto"
        gap="0.5rem"
      >
        {tabs.map((tab) => (
          <Box
            key={tab.id}
            as="button"
            padding="0.75rem 1rem"
            fontSize="1rem"
            fontWeight="500"
            color={activeTab === tab.id ? '#3b82f6' : '#6b7280'}
            backgroundColor="transparent"
            border="none"
            borderBottom={activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent'}
            cursor="pointer"
            style={{ whiteSpace: 'nowrap' }}
            transition="all 0.2s"
            whileHover={{ color: '#3b82f6' }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </Box>
        ))}
      </Box>

      {/* Tab Content */}
      <Box>
        {activeTab === 'basic' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                12-Hour vs 24-Hour Format
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Compare different time formats and see how they handle the same time values.
              </Box>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="2rem">
                <Box>
                  <TimePicker
                    label="12-Hour Format"
                    value={basicTime12}
                    onChange={setBasicTime12}
                    placeholder="Select time (12-hour)"
                    use12HourFormat={true}
                    interval={15}
                  />
                  <Box fontSize="0.875rem" color="#6b7280" marginTop="0.5rem">
                    Selected: {formatTimeDisplay(basicTime12, true)}
                  </Box>
                </Box>

                <Box>
                  <TimePicker
                    label="24-Hour Format"
                    value={basicTime24}
                    onChange={setBasicTime24}
                    placeholder="Select time (24-hour)"
                    use12HourFormat={false}
                    interval={15}
                  />
                  <Box fontSize="0.875rem" color="#6b7280" marginTop="0.5rem">
                    Selected: {formatTimeDisplay(basicTime24, false)}
                  </Box>
                </Box>
              </Box>

              {(basicTime12 || basicTime24) && (
                <Box marginTop="1.5rem" padding="1rem" backgroundColor="#f8fafc" borderRadius="0.5rem" border="1px solid #e2e8f0">
                  <Box fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem">
                    ISO 8601 Output Format:
                  </Box>
                  {basicTime12 && (
                    <Box fontSize="0.75rem" fontFamily="monospace" color="#374151" marginBottom="0.25rem">
                      12-Hour: {basicTime12}
                    </Box>
                  )}
                  {basicTime24 && (
                    <Box fontSize="0.75rem" fontFamily="monospace" color="#374151">
                      24-Hour: {basicTime24}
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Simple property booking example */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Basic Property Booking
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Simple check-in and check-out time selection for property rentals.
              </Box>
              
              <Box 
                padding="1.5rem" 
                backgroundColor="white" 
                borderRadius="0.75rem" 
                border="1px solid #e5e7eb"
              >
                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                  <IoIosHome color="#3b82f6" />
                  <Box fontSize="1.125rem" fontWeight="600">Villa Marina Booking</Box>
                </Box>

                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                  <TimePicker
                    label="Check-in Time"
                    value={checkInTime}
                    onChange={setCheckInTime}
                    placeholder="Standard: 3:00 PM"
                    use12HourFormat={true}
                    interval={30}
                    required
                  />
                  
                  <TimePicker
                    label="Check-out Time"
                    value={checkOutTime}
                    onChange={setCheckOutTime}
                    placeholder="Standard: 11:00 AM"
                    use12HourFormat={true}
                    interval={30}
                    required
                  />
                </Box>

                {timeValidationError && (
                  <Box 
                    marginTop="1rem" 
                    padding="0.75rem" 
                    backgroundColor="#fef2f2" 
                    color="#dc2626" 
                    borderRadius="0.375rem"
                    border="1px solid #fecaca"
                    fontSize="0.875rem"
                  >
                    {timeValidationError}
                  </Box>
                )}

                {checkInTime && checkOutTime && !timeValidationError && (
                  <Box 
                    marginTop="1rem" 
                    padding="0.75rem" 
                    backgroundColor="#f0fdf4" 
                    borderRadius="0.375rem"
                    border="1px solid #bbf7d0"
                  >
                    <Box fontSize="0.875rem" color="#166534" marginBottom="0.25rem">
                      <strong>Booking Summary:</strong>
                    </Box>
                    <Box fontSize="0.875rem" color="#166534">
                      Check-in: {formatTimeDisplay(checkInTime)} • 
                      Check-out: {formatTimeDisplay(checkOutTime)}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'booking' && (
          <Box display="grid" gap="3rem">
            {/* Service Scheduling */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Property Service Scheduling
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Schedule cleaning, maintenance, and inspection services around guest bookings.
              </Box>
              
              <Box 
                padding="1.5rem" 
                backgroundColor="white" 
                borderRadius="0.75rem" 
                border="1px solid #e5e7eb"
              >
                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1.5rem">
                  <IoIosSettings color="#059669" />
                  <Box fontSize="1.125rem" fontWeight="600">Service Coordination</Box>
                </Box>

                <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="repeat(3, 1fr)" gap="1.5rem">
                  <Box>
                    <TimePicker
                      label="Cleaning Service"
                      value={serviceSchedule.cleaningTime}
                      onChange={(time) => setServiceSchedule(prev => ({ ...prev, cleaningTime: time }))}
                      placeholder="After checkout"
                      use12HourFormat={true}
                      interval={15}
                    />
                    <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
                      Typically 1-2 hours after guest checkout
                    </Box>
                  </Box>

                  <Box>
                    <TimePicker
                      label="Maintenance Window"
                      value={serviceSchedule.maintenanceTime}
                      onChange={(time) => setServiceSchedule(prev => ({ ...prev, maintenanceTime: time }))}
                      placeholder="Morning preferred"
                      use12HourFormat={true}
                      interval={60}
                    />
                    <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
                      HVAC, plumbing, and general maintenance
                    </Box>
                  </Box>

                  <Box>
                    <TimePicker
                      label="Property Inspection"
                      value={serviceSchedule.inspectionTime}
                      onChange={(time) => setServiceSchedule(prev => ({ ...prev, inspectionTime: time }))}
                      placeholder="Quality check"
                      use12HourFormat={false}
                      interval={30}
                    />
                    <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
                      Final quality assurance before next guest
                    </Box>
                  </Box>
                </Box>

                {(serviceSchedule.cleaningTime || serviceSchedule.maintenanceTime || serviceSchedule.inspectionTime) && (
                  <Box marginTop="1.5rem" padding="1rem" backgroundColor="#f8fafc" borderRadius="0.5rem">
                    <Box fontSize="0.875rem" fontWeight="500" marginBottom="0.75rem">
                      Scheduled Services:
                    </Box>
                    {serviceSchedule.cleaningTime && (
                      <Box fontSize="0.875rem" color="#374151" marginBottom="0.25rem">
                        🧹 Cleaning: {formatTimeDisplay(serviceSchedule.cleaningTime)}
                      </Box>
                    )}
                    {serviceSchedule.maintenanceTime && (
                      <Box fontSize="0.875rem" color="#374151" marginBottom="0.25rem">
                        🔧 Maintenance: {formatTimeDisplay(serviceSchedule.maintenanceTime)}
                      </Box>
                    )}
                    {serviceSchedule.inspectionTime && (
                      <Box fontSize="0.875rem" color="#374151">
                        ✅ Inspection: {formatTimeDisplay(serviceSchedule.inspectionTime, false)}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Event Booking */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Villa Event Booking
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Complex event scheduling with setup and cleanup coordination.
              </Box>
              
              <Box 
                padding="1.5rem" 
                backgroundColor="white" 
                borderRadius="0.75rem" 
                border="1px solid #e5e7eb"
              >
                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1.5rem">
                  <IoIosCalendar color="#7c3aed" />
                  <Box fontSize="1.125rem" fontWeight="600">Private Event Schedule</Box>
                </Box>

                {/* Main Event Times */}
                <Box 
                  padding="1rem" 
                  backgroundColor="#f8fafc" 
                  borderRadius="0.5rem" 
                  marginBottom="1.5rem"
                >
                  <Box fontSize="1rem" fontWeight="500" marginBottom="1rem">
                    Event Duration
                  </Box>
                  
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                    <TimePicker
                      label="Event Start"
                      value={eventBooking.eventStart}
                      onChange={(time) => setEventBooking(prev => ({ ...prev, eventStart: time }))}
                      placeholder="When does it begin?"
                      use12HourFormat={true}
                      interval={15}
                      required
                    />
                    
                    <TimePicker
                      label="Event End"
                      value={eventBooking.eventEnd}
                      onChange={(time) => setEventBooking(prev => ({ ...prev, eventEnd: time }))}
                      placeholder="When does it finish?"
                      use12HourFormat={true}
                      interval={15}
                      required
                    />
                  </Box>

                  {eventBooking.eventStart && eventBooking.eventEnd && (
                    <Box 
                      marginTop="1rem" 
                      padding="0.75rem" 
                      backgroundColor="white" 
                      borderRadius="0.375rem"
                      border="1px solid #d1d5db"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Box fontSize="0.75rem" color="#6b7280">Event Duration</Box>
                        <Box fontSize="1rem" fontWeight="600" color="#7c3aed">
                          {calculateEventDuration()}
                        </Box>
                      </Box>
                      <Box fontSize="0.875rem" color="#374151">
                        {formatTimeDisplay(eventBooking.eventStart)} - {formatTimeDisplay(eventBooking.eventEnd)}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Setup and Cleanup */}
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                  <TimePicker
                    label="Setup Start Time"
                    value={eventBooking.setupTime}
                    onChange={(time) => setEventBooking(prev => ({ ...prev, setupTime: time }))}
                    placeholder="Preparation begins"
                    use12HourFormat={true}
                    interval={30}
                  />
                  
                  <TimePicker
                    label="Cleanup Complete By"
                    value={eventBooking.cleanupTime}
                    onChange={(time) => setEventBooking(prev => ({ ...prev, cleanupTime: time }))}
                    placeholder="Everything restored"
                    use12HourFormat={true}
                    interval={30}
                  />
                </Box>
              </Box>
            </Box>

            {/* Host Availability */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Host Availability Settings
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Define when you're available for guest communication and support.
              </Box>
              
              <Box 
                padding="1.5rem" 
                backgroundColor="white" 
                borderRadius="0.75rem" 
                border="1px solid #e5e7eb"
              >
                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1.5rem">
                  <IoIosTime color="#f59e0b" />
                  <Box fontSize="1.125rem" fontWeight="600">Communication Hours</Box>
                </Box>

                <Box display="grid" gap="1.5rem">
                  <Box>
                    <Box fontSize="1rem" fontWeight="500" marginBottom="1rem">
                      Regular Support Hours
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                      <TimePicker
                        label="Available From"
                        value={availableFrom}
                        onChange={setAvailableFrom}
                        placeholder="Start of day"
                        use12HourFormat={true}
                        interval={30}
                      />
                      <TimePicker
                        label="Available Until"
                        value={availableTo}
                        onChange={setAvailableTo}
                        placeholder="End of day"
                        use12HourFormat={true}
                        interval={30}
                      />
                    </Box>
                  </Box>

                  <TimePicker
                    label="Emergency Contact Cutoff"
                    value={emergencyContact}
                    onChange={setEmergencyContact}
                    placeholder="Latest emergency time"
                    use12HourFormat={true}
                    interval={15}
                  />
                </Box>

                {(availableFrom && availableTo) && (
                  <Box marginTop="1.5rem" padding="1rem" backgroundColor="#fef3c7" borderRadius="0.5rem" border="1px solid #fbbf24">
                    <Box fontSize="0.875rem" color="#92400e">
                      <strong>Availability Window:</strong> {formatTimeDisplay(availableFrom)} - {formatTimeDisplay(availableTo)}
                    </Box>
                    {emergencyContact && (
                      <Box fontSize="0.875rem" color="#92400e" marginTop="0.25rem">
                        <strong>Emergency contact until:</strong> {formatTimeDisplay(emergencyContact)}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'intervals' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Custom Intervals Demonstration
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Different booking scenarios require different time intervals for optimal user experience.
              </Box>
              
              <Box 
                padding="1.5rem" 
                backgroundColor="white" 
                borderRadius="0.75rem" 
                border="1px solid #e5e7eb"
              >
                <Box marginBottom="1.5rem">
                  <Box fontSize="1rem" fontWeight="500" marginBottom="0.75rem">
                    Select Interval Type
                  </Box>
                  <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap="0.5rem">
                    {[
                      { value: 5, label: '5 minutes', use: 'Precise scheduling' },
                      { value: 15, label: '15 minutes', use: 'Standard bookings' },
                      { value: 30, label: '30 minutes', use: 'Appointments' },
                      { value: 60, label: '1 hour', use: 'Hourly rentals' }
                    ].map((option) => (
                      <Box
                        key={option.value}
                        as="button"
                        padding="0.75rem"
                        backgroundColor={intervalType === option.value ? '#3b82f6' : 'transparent'}
                        color={intervalType === option.value ? 'white' : '#374151'}
                        border="1px solid"
                        borderColor={intervalType === option.value ? '#3b82f6' : '#d1d5db'}
                        borderRadius="0.375rem"
                        cursor="pointer"
                        fontSize="0.875rem"
                        fontWeight="500"
                        textAlign="center"
                        onClick={() => {
                          setIntervalType(option.value)
                          setIntervalTime('') // Reset time when changing interval
                        }}
                      >
                        <Box marginBottom="0.25rem">{option.label}</Box>
                        <Box fontSize="0.75rem" opacity="0.8">{option.use}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <TimePicker
                  label={`Time Selection (${intervalType} minute intervals)`}
                  value={intervalTime}
                  onChange={setIntervalTime}
                  placeholder={`Select time in ${intervalType}-minute increments`}
                  use12HourFormat={true}
                  interval={intervalType}
                />

                {intervalTime && (
                  <Box marginTop="1rem" padding="1rem" backgroundColor="#f0f9ff" borderRadius="0.5rem" border="1px solid #0ea5e9">
                    <Box fontSize="0.875rem" color="#0369a1" marginBottom="0.5rem">
                      <strong>Selected Time Details:</strong>
                    </Box>
                    <Box fontSize="0.875rem" color="#0369a1" fontFamily="monospace">
                      Display: {formatTimeDisplay(intervalTime)} <br/>
                      Interval: {intervalType} minutes <br/>
                      ISO: {intervalTime}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Format Comparison */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Format Comparison
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                See how the same time values are displayed in different formats and intervals.
              </Box>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap="1rem">
                <Box padding="1rem" backgroundColor="white" borderRadius="0.5rem" border="1px solid #e5e7eb">
                  <Box fontSize="1rem" fontWeight="500" marginBottom="0.75rem" textAlign="center">
                    12-Hour, 15min
                  </Box>
                  
                  <TimePicker
                    value={formatTime1}
                    onChange={setFormatTime1}
                    placeholder="Select time"
                    use12HourFormat={true}
                    interval={15}
                  />
                  
                  {formatTime1 && (
                    <Box marginTop="0.75rem" fontSize="0.75rem" color="#6b7280" textAlign="center">
                      {formatTimeDisplay(formatTime1, true)}
                    </Box>
                  )}
                </Box>

                <Box padding="1rem" backgroundColor="white" borderRadius="0.5rem" border="1px solid #e5e7eb">
                  <Box fontSize="1rem" fontWeight="500" marginBottom="0.75rem" textAlign="center">
                    24-Hour, 30min
                  </Box>
                  
                  <TimePicker
                    value={formatTime2}
                    onChange={setFormatTime2}
                    placeholder="Select time"
                    use12HourFormat={false}
                    interval={30}
                  />
                  
                  {formatTime2 && (
                    <Box marginTop="0.75rem" fontSize="0.75rem" color="#6b7280" textAlign="center">
                      {formatTimeDisplay(formatTime2, false)}
                    </Box>
                  )}
                </Box>

                <Box padding="1rem" backgroundColor="white" borderRadius="0.5rem" border="1px solid #e5e7eb">
                  <Box fontSize="1rem" fontWeight="500" marginBottom="0.75rem" textAlign="center">
                    12-Hour, 5min
                  </Box>
                  
                  <TimePicker
                    value={formatTime3}
                    onChange={setFormatTime3}
                    placeholder="Select time"
                    use12HourFormat={true}
                    interval={5}
                  />
                  
                  {formatTime3 && (
                    <Box marginTop="0.75rem" fontSize="0.75rem" color="#6b7280" textAlign="center">
                      {formatTimeDisplay(formatTime3, true)}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'validation' && (
          <Box display="grid" gap="3rem">
            {/* Business Hours Validation */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Business Hours Validation
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Demonstrate time validation and business rules enforcement.
              </Box>
              
              <Box 
                padding="1.5rem" 
                backgroundColor="white" 
                borderRadius="0.75rem" 
                border="1px solid #e5e7eb"
              >
                <Box marginBottom="1rem">
                  <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
                    Business Hours: 9:00 AM - 5:00 PM
                  </Box>
                  
                  <TimePicker
                    label="Meeting Time"
                    value={intervalTime}
                    onChange={(time) => {
                      if (isWithinBusinessHours(time)) {
                        setIntervalTime(time)
                      } else {
                        alert('Please select a time during business hours (9:00 AM - 5:00 PM)')
                      }
                    }}
                    placeholder="Select meeting time"
                    use12HourFormat={true}
                    interval={30}
                  />
                </Box>

                <Box 
                  padding="1rem" 
                  backgroundColor={intervalTime && isWithinBusinessHours(intervalTime) ? '#f0fdf4' : '#fef2f2'} 
                  borderRadius="0.5rem"
                  border="1px solid"
                  borderColor={intervalTime && isWithinBusinessHours(intervalTime) ? '#bbf7d0' : '#fecaca'}
                >
                  <Box 
                    fontSize="0.875rem" 
                    color={intervalTime && isWithinBusinessHours(intervalTime) ? '#166534' : '#dc2626'}
                  >
                    {intervalTime 
                      ? (isWithinBusinessHours(intervalTime) 
                          ? `✅ Valid business hours: ${formatTimeDisplay(intervalTime)}`
                          : `❌ Outside business hours: ${formatTimeDisplay(intervalTime)}`)
                      : 'ℹ️ Select a time to see validation'
                    }
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Time Range Dependencies */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Dependent Time Selection
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Show how time selections can depend on each other with validation.
              </Box>
              
              <Box 
                padding="1.5rem" 
                backgroundColor="white" 
                borderRadius="0.75rem" 
                border="1px solid #e5e7eb"
              >
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem" marginBottom="1rem">
                  <TimePicker
                    label="Start Time"
                    value={eventBooking.eventStart}
                    onChange={(time) => setEventBooking(prev => ({ ...prev, eventStart: time }))}
                    placeholder="When to begin"
                    use12HourFormat={true}
                    interval={15}
                  />
                  
                  <TimePicker
                    label="End Time"
                    value={eventBooking.eventEnd}
                    onChange={(time) => setEventBooking(prev => ({ ...prev, eventEnd: time }))}
                    placeholder="When to finish"
                    use12HourFormat={true}
                    interval={15}
                  />
                </Box>

                <Box marginBottom="1rem">
                  <Box fontSize="1rem" fontWeight="500" marginBottom="0.5rem">
                    Duration Analysis
                  </Box>
                  <Box 
                    padding="1rem" 
                    backgroundColor="#f8fafc" 
                    borderRadius="0.5rem" 
                    border="1px solid #e2e8f0"
                  >
                    {eventBooking.eventStart && eventBooking.eventEnd ? (
                      <Box>
                        <Box fontSize="0.875rem" color="#374151" marginBottom="0.5rem">
                          <strong>Duration:</strong> {calculateEventDuration()}
                        </Box>
                        <Box fontSize="0.875rem" color="#374151">
                          <strong>Time Range:</strong> {formatTimeDisplay(eventBooking.eventStart)} - {formatTimeDisplay(eventBooking.eventEnd)}
                        </Box>
                      </Box>
                    ) : (
                      <Box fontSize="0.875rem" color="#6b7280">
                        Select both start and end times to see duration
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Conditional Fields */}
                {eventBooking.eventStart && (
                  <Box marginTop="1rem">
                    <TimePicker
                      label="Setup Time (before event)"
                      value={eventBooking.setupTime}
                      onChange={(time) => setEventBooking(prev => ({ ...prev, setupTime: time }))}
                      placeholder="When to start setup"
                      use12HourFormat={true}
                      interval={30}
                    />
                    <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
                      Recommended: 2 hours before event start time
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Disabled State Demo */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Disabled and Required States
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Demonstration of different TimePicker states and behaviors.
              </Box>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="2rem">
                <Box>
                  <TimePicker
                    label="Disabled Time Picker"
                    value=""
                    onChange={() => {}}
                    placeholder="Cannot be changed"
                    disabled={true}
                    use12HourFormat={true}
                    interval={30}
                  />
                  <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
                    This time picker is disabled and cannot be interacted with
                  </Box>
                </Box>

                <Box>
                  <TimePicker
                    label="Required Field"
                    value=""
                    onChange={() => {}}
                    placeholder="This field is required"
                    required={true}
                    use12HourFormat={true}
                    interval={15}
                  />
                  <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
                    Required fields show a red asterisk in the label
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default TimePickerExample