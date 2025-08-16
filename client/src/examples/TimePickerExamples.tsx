import { useState } from 'react'
import TimePicker from '../components/TimePicker'
import { Box } from '../components/Box'
import { 
  FaClock,
  FaSun,
  FaMoon,
  FaPlane,
  FaHotel,
  FaCalendarAlt,
  FaBell,
  FaUtensils
} from 'react-icons/fa'

/**
 * Comprehensive examples showcasing TimePicker component capabilities
 */
export function TimePickerExamples() {
  const [checkInTime, setCheckInTime] = useState<string>('')
  const [checkOutTime, setCheckOutTime] = useState<string>('')
  const [meetingTime, setMeetingTime] = useState<string>('')
  const [dinnerTime, setDinnerTime] = useState<string>('')
  const [alarmTime, setAlarmTime] = useState<string>('')
  const [flightTime, setFlightTime] = useState<string>('')
  
  // Default times
  const defaultCheckIn = new Date()
  defaultCheckIn.setHours(15, 0, 0, 0) // 3:00 PM
  
  const defaultCheckOut = new Date()
  defaultCheckOut.setHours(11, 0, 0, 0) // 11:00 AM

  const formatDisplayTime = (timeString: string, format12Hour: boolean = true) => {
    if (!timeString) return 'Not selected'
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: format12Hour
    })
  }

  const getTimeOfDay = (timeString: string) => {
    if (!timeString) return ''
    const hour = new Date(timeString).getHours()
    if (hour < 6) return 'Late Night'
    if (hour < 12) return 'Morning'
    if (hour < 17) return 'Afternoon'
    if (hour < 21) return 'Evening'
    return 'Night'
  }

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box backgroundColor="white" borderBottom="1px solid #e5e7eb" padding="2rem 0">
        <Box maxWidth="1200px" margin="0 auto" padding="0 2rem">
          <Box textAlign="center">
            <Box fontSize="3rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
              TimePicker Examples
            </Box>
            <Box fontSize="1.25rem" color="#6b7280" maxWidth="800px" margin="0 auto">
              Explore the TimePicker component with 12/24-hour formats, custom intervals, and real-world use cases.
              Features intuitive time selection with mobile-optimized drawer interface.
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth="1200px" margin="0 auto" padding="2rem">
        
        {/* Format Comparison */}
        <Box marginBottom="3rem">
          <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            Time Format Options
          </Box>
          <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
            Compare 12-hour and 24-hour time formats with different intervals
          </Box>
          
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" 
            gap="2rem"
          >
            <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <Box fontSize="1.5rem" color="#f59e0b">
                  <FaSun />
                </Box>
                <Box>
                  <Box fontSize="1.125rem" fontWeight="600">12-Hour Format</Box>
                  <Box fontSize="0.875rem" color="#6b7280">With AM/PM selector</Box>
                </Box>
              </Box>
              
              <TimePicker
                value={meetingTime}
                onChange={setMeetingTime}
                placeholder="Select meeting time"
                label="Meeting Time"
                use12HourFormat={true}
                interval={15}
              />
              
              <Box marginTop="1rem" padding="1rem" backgroundColor="#fef3c7" borderRadius="0.5rem">
                <Box fontSize="0.875rem" color="#92400e">
                  <Box fontWeight="600">Selected:</Box>
                  {formatDisplayTime(meetingTime, true)}
                  {meetingTime && (
                    <Box fontSize="0.75rem" marginTop="0.25rem">
                      {getTimeOfDay(meetingTime)} time
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <Box fontSize="1.5rem" color="#6366f1">
                  <FaMoon />
                </Box>
                <Box>
                  <Box fontSize="1.125rem" fontWeight="600">24-Hour Format</Box>
                  <Box fontSize="0.875rem" color="#6b7280">Military time format</Box>
                </Box>
              </Box>
              
              <TimePicker
                value={alarmTime}
                onChange={setAlarmTime}
                placeholder="Select alarm time"
                label="Alarm Time"
                use12HourFormat={false}
                interval={5}
              />
              
              <Box marginTop="1rem" padding="1rem" backgroundColor="#ede9fe" borderRadius="0.5rem">
                <Box fontSize="0.875rem" color="#5b21b6">
                  <Box fontWeight="600">Selected:</Box>
                  {formatDisplayTime(alarmTime, false)}
                  {alarmTime && (
                    <Box fontSize="0.75rem" marginTop="0.25rem">
                      {getTimeOfDay(alarmTime)} time
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Property Management Example */}
        <Box marginBottom="3rem">
          <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            Property Check-in Times
          </Box>
          <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
            Configure check-in and check-out times for your property rental
          </Box>
          
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)">
            <Box display="flex" alignItems="center" gap="1rem" marginBottom="2rem">
              <Box fontSize="2rem" color="#3182ce">
                <FaHotel />
              </Box>
              <Box>
                <Box fontSize="1.5rem" fontWeight="700" color="#1a202c">
                  Villa Sunrise - Dubai Marina
                </Box>
                <Box fontSize="1rem" color="#6b7280">
                  Set your property's check-in and check-out times
                </Box>
              </Box>
            </Box>

            <Box 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" 
              gap="2rem"
              marginBottom="2rem"
            >
              <TimePicker
                value={checkInTime || defaultCheckIn.toISOString()}
                onChange={setCheckInTime}
                placeholder="Select check-in time"
                label="Check-in Time"
                use12HourFormat={true}
                interval={30}
              />

              <TimePicker
                value={checkOutTime || defaultCheckOut.toISOString()}
                onChange={setCheckOutTime}
                placeholder="Select check-out time"
                label="Check-out Time"
                use12HourFormat={true}
                interval={30}
              />
            </Box>

            {/* Property Summary */}
            <Box 
              backgroundColor="#f8fafc" 
              borderRadius="0.75rem" 
              padding="1.5rem"
              border="1px solid #e2e8f0"
            >
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
                <Box fontSize="1.25rem" color="#059669">
                  <FaCalendarAlt />
                </Box>
                <Box fontSize="1.125rem" fontWeight="600" color="#1a202c">
                  Property Schedule
                </Box>
              </Box>
              
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
                <Box textAlign="center" padding="1rem" backgroundColor="white" borderRadius="0.5rem">
                  <Box fontSize="0.875rem" fontWeight="500" color="#6b7280">Guests can check-in</Box>
                  <Box fontSize="1.25rem" fontWeight="700" color="#3182ce">
                    {formatDisplayTime(checkInTime || defaultCheckIn.toISOString())}
                  </Box>
                  <Box fontSize="0.75rem" color="#6b7280">onwards</Box>
                </Box>
                
                <Box textAlign="center" padding="1rem" backgroundColor="white" borderRadius="0.5rem">
                  <Box fontSize="0.875rem" fontWeight="500" color="#6b7280">Guests must check-out by</Box>
                  <Box fontSize="1.25rem" fontWeight="700" color="#dc2626">
                    {formatDisplayTime(checkOutTime || defaultCheckOut.toISOString())}
                  </Box>
                  <Box fontSize="0.75rem" color="#6b7280">latest</Box>
                </Box>
              </Box>

              <Box marginTop="1rem" padding="1rem" backgroundColor="#dcfce7" borderRadius="0.5rem">
                <Box fontSize="0.875rem" color="#166534">
                  <Box fontWeight="600">💡 Tip:</Box>
                  Standard check-in is 3:00 PM and check-out is 11:00 AM to allow cleaning time between guests.
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Custom Intervals */}
        <Box marginBottom="3rem">
          <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            Custom Time Intervals
          </Box>
          <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
            Different time intervals for various use cases
          </Box>
          
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" 
            gap="2rem"
          >
            <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <Box fontSize="1.5rem" color="#ef4444">
                  <FaUtensils />
                </Box>
                <Box>
                  <Box fontSize="1.125rem" fontWeight="600">Dinner Reservation</Box>
                  <Box fontSize="0.875rem" color="#6b7280">15-minute intervals</Box>
                </Box>
              </Box>
              
              <TimePicker
                value={dinnerTime}
                onChange={setDinnerTime}
                placeholder="Select dinner time"
                label="Reservation Time"
                use12HourFormat={true}
                interval={15}
              />
              
              <Box marginTop="1rem" padding="1rem" backgroundColor="#fef2f2" borderRadius="0.5rem">
                <Box fontSize="0.875rem" color="#991b1b">
                  <Box fontWeight="600">Restaurant Hours:</Box>
                  6:00 PM - 11:00 PM
                  {dinnerTime && (
                    <Box marginTop="0.25rem">
                      Your table: {formatDisplayTime(dinnerTime)}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
              <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <Box fontSize="1.5rem" color="#0ea5e9">
                  <FaPlane />
                </Box>
                <Box>
                  <Box fontSize="1.125rem" fontWeight="600">Flight Departure</Box>
                  <Box fontSize="0.875rem" color="#6b7280">5-minute precision</Box>
                </Box>
              </Box>
              
              <TimePicker
                value={flightTime}
                onChange={setFlightTime}
                placeholder="Select departure time"
                label="Departure Time"
                use12HourFormat={false}
                interval={5}
              />
              
              <Box marginTop="1rem" padding="1rem" backgroundColor="#f0f9ff" borderRadius="0.5rem">
                <Box fontSize="0.875rem" color="#0c4a6e">
                  <Box fontWeight="600">Flight EK203:</Box>
                  Dubai (DXB) → London (LHR)
                  {flightTime && (
                    <Box marginTop="0.25rem">
                      Departure: {formatDisplayTime(flightTime, false)}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Time Comparison */}
        <Box marginBottom="3rem">
          <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            Time Format Comparison
          </Box>
          
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
            <Box fontSize="1.125rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
              Live Format Comparison
            </Box>
            
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
              {[
                { label: 'Meeting Time', time: meetingTime, format: '12-hour' },
                { label: 'Alarm Time', time: alarmTime, format: '24-hour' },
                { label: 'Check-in', time: checkInTime || defaultCheckIn.toISOString(), format: '12-hour' },
                { label: 'Dinner Time', time: dinnerTime, format: '12-hour' }
              ].map((item, index) => (
                <Box
                  key={index}
                  padding="1rem"
                  backgroundColor="#f8fafc"
                  borderRadius="0.5rem"
                  border="1px solid #e2e8f0"
                >
                  <Box fontSize="0.75rem" fontWeight="600" color="#6b7280" marginBottom="0.5rem">
                    {item.label}
                  </Box>
                  <Box fontSize="1rem" fontWeight="700" color="#1a202c">
                    {item.time ? formatDisplayTime(item.time, item.format === '12-hour') : 'Not set'}
                  </Box>
                  <Box fontSize="0.75rem" color="#6b7280">
                    {item.format}
                  </Box>
                </Box>
              ))}
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
                icon: <FaClock />,
                title: 'Flexible Formats',
                description: '12-hour and 24-hour time format support',
                features: ['AM/PM selection', 'Military time', 'Regional preferences']
              },
              {
                icon: <FaBell />,
                title: 'Custom Intervals',
                description: 'Configurable time intervals for different use cases',
                features: ['5-minute precision', '15-minute slots', '30-minute blocks']
              },
              {
                icon: <FaPlane />,
                title: 'Mobile Optimized',
                description: 'Touch-friendly interface with large selectors',
                features: ['Bottom drawer UI', 'Smooth scrolling', 'Touch gestures']
              },
              {
                icon: <FaUtensils />,
                title: 'Real-time Preview',
                description: 'Live time preview with instant feedback',
                features: ['Visual time display', 'Format conversion', 'Validation']
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

export default TimePickerExamples