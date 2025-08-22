import {useState} from 'react'
import DatePicker from './DatePicker'
import {Box} from './Box'

/**
 * DatePicker Component Examples
 * Showcasing all date selection capabilities and use cases
 */
export function DatePickerExample() {
    const [activeTab, setActiveTab] = useState('basic')
    
    // Basic Examples State
    const [basicDate, setBasicDate] = useState<string>('')
    const [requiredDate, setRequiredDate] = useState<string>('')
    const [defaultDate, setDefaultDate] = useState<string>(new Date().toISOString())
    
    // Booking Scenario State
    const [checkInDate, setCheckInDate] = useState<string>('')
    const [checkOutDate, setCheckOutDate] = useState<string>('')
    
    // Availability Management State
    const [availableFrom, setAvailableFrom] = useState<string>('')
    const [availableUntil, setAvailableUntil] = useState<string>('')
    
    // Date Constraints State
    const [constrainedDate, setConstrainedDate] = useState<string>('')
    const [businessDate, setBusinessDate] = useState<string>('')
    
    // Form Integration State
    const [eventDate, setEventDate] = useState<string>('')
    const [reminderDate, setReminderDate] = useState<string>('')
    const [followUpDate, setFollowUpDate] = useState<string>('')

    const tabs = [
        {id: 'basic', label: 'Basic Usage'},
        {id: 'booking', label: 'Booking Scenario'},
        {id: 'constraints', label: 'Date Constraints'},
        {id: 'forms', label: 'Form Integration'}
    ]

    // Generate date constraints
    const today = new Date().toISOString()
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const sixMonthsFromNow = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not selected'
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Calculate nights between dates
    const calculateNights = (checkIn: string, checkOut: string) => {
        if (!checkIn || !checkOut) return 0
        const diffTime = new Date(checkOut).getTime() - new Date(checkIn).getTime()
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    }

    return (
        <Box minHeight="100vh" backgroundColor="#f8fafc">
            {/* Header */}
            <Box
                backgroundColor="white"
                borderBottom="1px solid #e5e7eb"
                padding="2rem 0"
                marginBottom="2rem"
            >
                <Box maxWidth="1200px" margin="0 auto" padding="0 2rem">
                    <Box textAlign="center" marginBottom="2rem">
                        <Box
                            fontSize="2rem"
                            fontSizeMd="2.5rem"
                            fontSizeLg="3rem"
                            fontWeight="bold"
                            marginBottom="1rem"
                            color="#1a202c"
                        >
                            📅 DatePicker Component
                        </Box>
                        <Box
                            fontSize="1rem"
                            fontSizeMd="1.125rem"
                            color="#6b7280"
                            maxWidth="800px"
                            margin="0 auto"
                        >
                            Interactive date selection with calendar interface, perfect for booking systems and date management
                        </Box>
                    </Box>

                    {/* Tab Navigation */}
                    <Box
                        display="flex"
                        justifyContent="center"
                        flexWrap="wrap"
                        gap="0.5rem"
                        gapMd="1rem"
                    >
                        {tabs.map((tab) => (
                            <Box
                                key={tab.id}
                                as="button"
                                onClick={() => setActiveTab(tab.id)}
                                padding="0.75rem 1.5rem"
                                paddingMd="1rem 2rem"
                                backgroundColor={activeTab === tab.id ? '#3182ce' : 'transparent'}
                                color={activeTab === tab.id ? 'white' : '#6b7280'}
                                border={activeTab === tab.id ? 'none' : '1px solid #d1d5db'}
                                borderRadius="0.5rem"
                                cursor="pointer"
                                fontSize="0.875rem"
                                fontSizeMd="1rem"
                                fontWeight="500"
                                transition="all 0.2s"
                                whileHover={{
                                    backgroundColor: activeTab === tab.id ? '#2563eb' : '#f9fafb',
                                    Md: {
                                        backgroundColor: activeTab === tab.id ? '#2563eb' : '#f3f4f6',
                                        transform: 'translateY(-1px)',
                                    }
                                }}
                                whileTap={{
                                    transform: 'scale(0.95)',
                                }}
                            >
                                {tab.label}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Content Container */}
            <Box maxWidth="1200px" margin="0 auto" padding="0 2rem">

                {/* Basic Usage Examples */}
                {activeTab === 'basic' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Basic DatePicker Usage
                        </Box>
                        
                        <Box
                            display="grid"
                            gridTemplateColumns="1fr"
                            gridTemplateColumnsMd="repeat(2, 1fr)"
                            gridTemplateColumnsXl="repeat(3, 1fr)"
                            gap="2rem"
                        >
                            {/* Simple Date Picker */}
                            <Box
                                backgroundColor="white"
                                borderRadius="1rem"
                                padding="1.5rem"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            >
                                <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#1a202c">
                                    Simple Date Selection
                                </Box>
                                <DatePicker
                                    label="Select Date"
                                    value={basicDate}
                                    onChange={setBasicDate}
                                    placeholder="Choose any date"
                                />
                                <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                                    Selected: {formatDate(basicDate)}
                                </Box>
                            </Box>

                            {/* Required Date Picker */}
                            <Box
                                backgroundColor="white"
                                borderRadius="1rem"
                                padding="1.5rem"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            >
                                <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#1a202c">
                                    Required Field
                                </Box>
                                <DatePicker
                                    label="Event Date"
                                    value={requiredDate}
                                    onChange={setRequiredDate}
                                    placeholder="Required date field"
                                    required
                                />
                                <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                                    Selected: {formatDate(requiredDate)}
                                </Box>
                            </Box>

                            {/* Default Value */}
                            <Box
                                backgroundColor="white"
                                borderRadius="1rem"
                                padding="1.5rem"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            >
                                <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#1a202c">
                                    Default Value
                                </Box>
                                <DatePicker
                                    label="Meeting Date"
                                    value={defaultDate}
                                    onChange={setDefaultDate}
                                    placeholder="Pre-filled with today"
                                />
                                <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                                    Selected: {formatDate(defaultDate)}
                                </Box>
                            </Box>

                            {/* Disabled State */}
                            <Box
                                backgroundColor="white"
                                borderRadius="1rem"
                                padding="1.5rem"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            >
                                <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#1a202c">
                                    Disabled State
                                </Box>
                                <DatePicker
                                    label="Locked Date"
                                    value="2025-12-25T00:00:00.000Z"
                                    onChange={() => {}}
                                    disabled
                                    placeholder="This field is locked"
                                />
                                <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                                    This date picker is disabled and cannot be changed.
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Booking Scenario Examples */}
                {activeTab === 'booking' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Property Booking Scenario
                        </Box>

                        {/* Check-in/Check-out Dates */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Villa Booking Dates
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gap="1.5rem"
                                marginBottom="2rem"
                            >
                                <DatePicker
                                    label="Check-in Date"
                                    value={checkInDate}
                                    onChange={setCheckInDate}
                                    placeholder="Select check-in date"
                                    minDate={today}
                                    required
                                />
                                
                                <DatePicker
                                    label="Check-out Date"
                                    value={checkOutDate}
                                    onChange={setCheckOutDate}
                                    placeholder="Select check-out date"
                                    minDate={checkInDate || tomorrow}
                                    required
                                />
                            </Box>

                            {/* Booking Summary */}
                            <Box
                                backgroundColor="#f8fafc"
                                borderRadius="0.5rem"
                                padding="1.5rem"
                                border="1px solid #e2e8f0"
                            >
                                <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#1a202c">
                                    Booking Summary
                                </Box>
                                
                                <Box display="grid" gap="0.5rem">
                                    <Box display="flex" justifyContent="space-between">
                                        <Box color="#6b7280">Check-in:</Box>
                                        <Box fontWeight="500">{formatDate(checkInDate)}</Box>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Box color="#6b7280">Check-out:</Box>
                                        <Box fontWeight="500">{formatDate(checkOutDate)}</Box>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" paddingTop="0.5rem" borderTop="1px solid #e5e7eb">
                                        <Box color="#6b7280">Total Nights:</Box>
                                        <Box fontWeight="600" color="#3182ce">
                                            {calculateNights(checkInDate, checkOutDate)} nights
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Property Availability Management */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Property Availability Settings
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gap="1.5rem"
                                marginBottom="1.5rem"
                            >
                                <DatePicker
                                    label="Available From"
                                    value={availableFrom}
                                    onChange={setAvailableFrom}
                                    placeholder="Start of availability"
                                    minDate={today}
                                />
                                
                                <DatePicker
                                    label="Available Until"
                                    value={availableUntil}
                                    onChange={setAvailableUntil}
                                    placeholder="End of availability"
                                    minDate={availableFrom || today}
                                />
                            </Box>

                            <Box
                                backgroundColor="#eff6ff"
                                borderRadius="0.5rem"
                                padding="1rem"
                                border="1px solid #bfdbfe"
                            >
                                <Box fontSize="0.875rem" color="#1e40af">
                                    💡 <Box as="span" fontWeight="600">Tip:</Box> Set availability periods to control when guests can book your property. The check-out date automatically updates based on your check-in selection.
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Date Constraints Examples */}
                {activeTab === 'constraints' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Date Constraints & Validation
                        </Box>
                        
                        <Box
                            display="grid"
                            gridTemplateColumns="1fr"
                            gridTemplateColumnsMd="repeat(2, 1fr)"
                            gap="2rem"
                        >
                            {/* Future Dates Only */}
                            <Box
                                backgroundColor="white"
                                borderRadius="1rem"
                                padding="1.5rem"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            >
                                <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#1a202c">
                                    Future Dates Only
                                </Box>
                                <DatePicker
                                    label="Appointment Date"
                                    value={constrainedDate}
                                    onChange={setConstrainedDate}
                                    placeholder="No past dates allowed"
                                    minDate={today}
                                />
                                <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                                    Minimum date: Today ({new Date().toLocaleDateString()})
                                </Box>
                            </Box>

                            {/* Business Days Only */}
                            <Box
                                backgroundColor="white"
                                borderRadius="1rem"
                                padding="1.5rem"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            >
                                <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#1a202c">
                                    Limited Date Range
                                </Box>
                                <DatePicker
                                    label="Business Meeting"
                                    value={businessDate}
                                    onChange={setBusinessDate}
                                    placeholder="Next week to 6 months"
                                    minDate={nextWeek}
                                    maxDate={sixMonthsFromNow}
                                />
                                <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                                    Range: {new Date(nextWeek).toLocaleDateString()} - {new Date(sixMonthsFromNow).toLocaleDateString()}
                                </Box>
                            </Box>
                        </Box>

                        {/* Constraint Examples */}
                        <Box marginTop="2rem">
                            <Box
                                backgroundColor="white"
                                borderRadius="1rem"
                                padding="2rem"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            >
                                <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                    Common Date Constraint Scenarios
                                </Box>
                                
                                <Box
                                    display="grid"
                                    gridTemplateColumns="1fr"
                                    gridTemplateColumnsMd="repeat(2, 1fr)"
                                    gap="1.5rem"
                                >
                                    <Box>
                                        <Box fontSize="1rem" fontWeight="600" marginBottom="0.5rem" color="#374151">
                                            Booking Constraints
                                        </Box>
                                        <Box fontSize="0.875rem" color="#6b7280" lineHeight="1.5">
                                            • Check-in: Today onwards<br/>
                                            • Check-out: After check-in date<br/>
                                            • Maximum: 1 year in advance<br/>
                                            • Minimum stay: Usually 1 night
                                        </Box>
                                    </Box>
                                    
                                    <Box>
                                        <Box fontSize="1rem" fontWeight="600" marginBottom="0.5rem" color="#374151">
                                            Property Management
                                        </Box>
                                        <Box fontSize="0.875rem" color="#6b7280" lineHeight="1.5">
                                            • Availability: Future dates only<br/>
                                            • Maintenance: Any date range<br/>
                                            • Reports: Past dates allowed<br/>
                                            • Events: Business hours consideration
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Form Integration Examples */}
                {activeTab === 'forms' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Form Integration Examples
                        </Box>

                        {/* Event Planning Form */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Event Planning Form
                            </Box>
                            
                            <Box
                                as="form"
                                onSubmit={(e) => e.preventDefault()}
                                display="grid"
                                gap="1.5rem"
                            >
                                <Box
                                    display="grid"
                                    gridTemplateColumns="1fr"
                                    gridTemplateColumnsMd="repeat(3, 1fr)"
                                    gap="1.5rem"
                                >
                                    <DatePicker
                                        label="Event Date"
                                        value={eventDate}
                                        onChange={setEventDate}
                                        placeholder="Select event date"
                                        minDate={tomorrow}
                                        maxDate={oneYearFromNow}
                                        required
                                    />
                                    
                                    <DatePicker
                                        label="Reminder Date"
                                        value={reminderDate}
                                        onChange={setReminderDate}
                                        placeholder="Set reminder"
                                        minDate={today}
                                        maxDate={eventDate || oneYearFromNow}
                                    />
                                    
                                    <DatePicker
                                        label="Follow-up Date"
                                        value={followUpDate}
                                        onChange={setFollowUpDate}
                                        placeholder="Schedule follow-up"
                                        minDate={eventDate || today}
                                    />
                                </Box>
                                
                                <Box
                                    backgroundColor="#f8fafc"
                                    borderRadius="0.5rem"
                                    padding="1.5rem"
                                    border="1px solid #e2e8f0"
                                >
                                    <Box fontSize="1rem" fontWeight="600" marginBottom="1rem" color="#1a202c">
                                        Form Summary
                                    </Box>
                                    
                                    <Box display="grid" gap="0.5rem" fontSize="0.875rem">
                                        <Box display="flex" justifyContent="space-between">
                                            <Box color="#6b7280">Event Date:</Box>
                                            <Box fontWeight="500">{eventDate ? formatDate(eventDate) : 'Not set'}</Box>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Box color="#6b7280">Reminder Date:</Box>
                                            <Box fontWeight="500">{reminderDate ? formatDate(reminderDate) : 'Not set'}</Box>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Box color="#6b7280">Follow-up Date:</Box>
                                            <Box fontWeight="500">{followUpDate ? formatDate(followUpDate) : 'Not set'}</Box>
                                        </Box>
                                    </Box>
                                </Box>
                                
                                <Box
                                    as="button"
                                    type="submit"
                                    padding="1rem"
                                    backgroundColor={eventDate ? '#3182ce' : '#9ca3af'}
                                    color="white"
                                    border="none"
                                    borderRadius="0.5rem"
                                    fontSize="1rem"
                                    fontWeight="600"
                                    cursor={eventDate ? 'pointer' : 'not-allowed'}
                                    whileHover={eventDate ? { backgroundColor: '#2563eb' } : {}}
                                    whileTap={eventDate ? { transform: 'scale(0.98)' } : {}}
                                >
                                    {eventDate ? 'Save Event Details' : 'Please select event date'}
                                </Box>
                            </Box>
                        </Box>

                        {/* Validation Examples */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Validation & Error Handling
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gap="2rem"
                            >
                                <Box>
                                    <Box fontSize="1rem" fontWeight="600" marginBottom="1rem" color="#374151">
                                        Best Practices
                                    </Box>
                                    <Box fontSize="0.875rem" color="#6b7280" lineHeight="1.6">
                                        • Always validate date relationships (check-out after check-in)<br/>
                                        • Provide clear error messages for invalid selections<br/>
                                        • Use appropriate min/max constraints<br/>
                                        • Consider timezone implications<br/>
                                        • Test with various date formats
                                    </Box>
                                </Box>
                                
                                <Box>
                                    <Box fontSize="1rem" fontWeight="600" marginBottom="1rem" color="#374151">
                                        Error Scenarios
                                    </Box>
                                    <Box fontSize="0.875rem" color="#6b7280" lineHeight="1.6">
                                        • Past dates when future required<br/>
                                        • Dates outside allowed range<br/>
                                        • Invalid date format inputs<br/>
                                        • Network issues during calendar load<br/>
                                        • Conflicting date dependencies
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Box
                backgroundColor="white"
                borderTop="1px solid #e5e7eb"
                padding="2rem 0"
                marginTop="4rem"
            >
                <Box
                    maxWidth="1200px"
                    margin="0 auto"
                    padding="0 2rem"
                    textAlign="center"
                >
                    <Box
                        fontSize="1rem"
                        color="#6b7280"
                        marginBottom="1rem"
                    >
                        DatePicker Component - Calendar interface for date selection
                    </Box>
                    <Box
                        fontSize="0.875rem"
                        color="#9ca3af"
                    >
                        Features sliding drawer interface with month/year navigation and date constraints
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}