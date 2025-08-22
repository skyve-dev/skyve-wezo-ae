import {useState} from 'react'
import NumberStepperInput from './NumberStepperInput'
import {Box} from './Box'
import {
    FaBath,
    FaBed,
    FaBuilding,
    FaCalendarAlt,
    FaCar,
    FaChartLine,
    FaClock,
    FaDollarSign,
    FaHome,
    FaPercent,
    FaRuler,
    FaStar,
    FaTags,
    FaThermometerHalf,
    FaUser,
    FaWeight
} from 'react-icons/fa'

/**
 * NumberStepperInput Component Examples
 * Showcasing all numeric input capabilities with formatting and stepper controls
 */
export function NumberStepperInputExample() {
    const [activeTab, setActiveTab] = useState('formats')
    
    // Format Examples State
    const [formatExamples, setFormatExamples] = useState({
        currency: 1500,
        decimal: 4.5,
        integer: 3,
        percentage: 15.5,
    })
    
    // Size and Variant State
    const [sizeVariants, setSizeVariants] = useState({
        small: 100,
        medium: 250,
        large: 500,
        defaultVar: 150,
        outlined: 300,
        filled: 450,
    })
    
    // Property Form State
    const [propertyForm, setPropertyForm] = useState({
        baseRate: 750,
        cleaningFee: 100,
        securityDeposit: 500,
        bedrooms: 3,
        bathrooms: 2.5,
        maxGuests: 6,
        parkingSpots: 2,
        area: 250,
        discount: 10,
    })
    
    // Booking Calculator State
    const [booking, setBooking] = useState({
        nights: 3,
        guests: 2,
        seasonalRate: 850,
        discountPercent: 5,
    })
    
    // Advanced Examples State
    const [advanced, setAdvanced] = useState({
        temperature: 24,
        rating: 4.7,
        weight: 75.5,
        duration: 120,
        commission: 8.5,
        priority: 3,
        area: 150,
    })

    const tabs = [
        {id: 'formats', label: 'Formats & Types'},
        {id: 'variants', label: 'Sizes & Variants'},
        {id: 'property', label: 'Property Settings'},
        {id: 'calculator', label: 'Booking Calculator'}
    ]

    // Calculate booking totals
    const bookingSubtotal = booking.nights * booking.seasonalRate
    const bookingDiscount = (bookingSubtotal * booking.discountPercent) / 100
    const bookingTotal = bookingSubtotal - bookingDiscount

    // Calculate property totals
    const totalPropertyValue = propertyForm.baseRate + propertyForm.cleaningFee + propertyForm.securityDeposit

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
                            🔢 NumberStepperInput
                        </Box>
                        <Box
                            fontSize="1rem"
                            fontSizeMd="1.125rem"
                            color="#6b7280"
                            maxWidth="800px"
                            margin="0 auto"
                        >
                            Interactive numeric inputs with stepper controls, advanced formatting, and validation
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

                {/* Formats & Types Examples */}
                {activeTab === 'formats' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Number Formats & Types
                        </Box>

                        {/* Basic Format Types */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Core Number Formats
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gridTemplateColumnsXl="repeat(4, 1fr)"
                                gap="1.5rem"
                            >
                                <NumberStepperInput
                                    label="Currency Format"
                                    icon={FaDollarSign}
                                    value={formatExamples.currency}
                                    onChange={(val) => setFormatExamples(prev => ({...prev, currency: val}))}
                                    format="currency"
                                    currency="AED"
                                    currencyPosition="prefix"
                                    decimalPlaces={2}
                                    min={0}
                                    max={10000}
                                    step={50}
                                    helperText="AED currency with 2 decimals"
                                />
                                
                                <NumberStepperInput
                                    label="Decimal Format"
                                    icon={FaStar}
                                    value={formatExamples.decimal}
                                    onChange={(val) => setFormatExamples(prev => ({...prev, decimal: val}))}
                                    format="decimal"
                                    decimalPlaces={1}
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    helperText="Rating with 1 decimal"
                                />
                                
                                <NumberStepperInput
                                    label="Integer Format"
                                    icon={FaUser}
                                    value={formatExamples.integer}
                                    onChange={(val) => setFormatExamples(prev => ({...prev, integer: val}))}
                                    format="integer"
                                    min={1}
                                    max={20}
                                    step={1}
                                    helperText="Whole numbers only"
                                />
                                
                                <NumberStepperInput
                                    label="Percentage"
                                    icon={FaPercent}
                                    value={formatExamples.percentage}
                                    onChange={(val) => setFormatExamples(prev => ({...prev, percentage: val}))}
                                    format="decimal"
                                    decimalPlaces={1}
                                    currency="%"
                                    currencyPosition="suffix"
                                    min={0}
                                    max={100}
                                    step={0.5}
                                    helperText="Percentage with suffix"
                                />
                            </Box>
                        </Box>

                        {/* Currency Variations */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Currency Format Variations
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(3, 1fr)"
                                gap="1.5rem"
                            >
                                <NumberStepperInput
                                    label="USD Dollar (Prefix)"
                                    value={1234.56}
                                    onChange={() => {}}
                                    format="currency"
                                    currency="$"
                                    currencyPosition="prefix"
                                    decimalPlaces={2}
                                    readOnly
                                    helperText="$1,234.56"
                                />
                                
                                <NumberStepperInput
                                    label="AED Dirham (Suffix)"
                                    value={1234.56}
                                    onChange={() => {}}
                                    format="currency"
                                    currency=" AED"
                                    currencyPosition="suffix"
                                    decimalPlaces={2}
                                    readOnly
                                    helperText="1,234.56 AED"
                                />
                                
                                <NumberStepperInput
                                    label="EUR Euro (Prefix)"
                                    value={1234.56}
                                    onChange={() => {}}
                                    format="currency"
                                    currency="€"
                                    currencyPosition="prefix"
                                    decimalPlaces={2}
                                    thousandsSeparator="."
                                    decimalSeparator=","
                                    readOnly
                                    helperText="€1.234,56"
                                />
                            </Box>
                        </Box>

                        {/* Measurement Units */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Measurement Units & Special Formats
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gridTemplateColumnsLg="repeat(4, 1fr)"
                                gap="1.5rem"
                            >
                                <NumberStepperInput
                                    label="Area (Square Meters)"
                                    icon={FaRuler}
                                    value={advanced.area || 150}
                                    onChange={(val) => setAdvanced(prev => ({...prev, area: val}))}
                                    format="decimal"
                                    decimalPlaces={0}
                                    currency=" m²"
                                    currencyPosition="suffix"
                                    min={10}
                                    max={1000}
                                    step={5}
                                    helperText="Property area"
                                />
                                
                                <NumberStepperInput
                                    label="Weight (Kilograms)"
                                    icon={FaWeight}
                                    value={advanced.weight}
                                    onChange={(val) => setAdvanced(prev => ({...prev, weight: val}))}
                                    format="decimal"
                                    decimalPlaces={1}
                                    currency=" kg"
                                    currencyPosition="suffix"
                                    min={0}
                                    max={200}
                                    step={0.5}
                                    helperText="Weight measurement"
                                />
                                
                                <NumberStepperInput
                                    label="Temperature (Celsius)"
                                    icon={FaThermometerHalf}
                                    value={advanced.temperature}
                                    onChange={(val) => setAdvanced(prev => ({...prev, temperature: val}))}
                                    format="decimal"
                                    decimalPlaces={1}
                                    currency="°C"
                                    currencyPosition="suffix"
                                    min={-10}
                                    max={50}
                                    step={0.5}
                                    helperText="Temperature setting"
                                />
                                
                                <NumberStepperInput
                                    label="Duration (Minutes)"
                                    icon={FaClock}
                                    value={advanced.duration}
                                    onChange={(val) => setAdvanced(prev => ({...prev, duration: val}))}
                                    format="integer"
                                    currency=" min"
                                    currencyPosition="suffix"
                                    min={5}
                                    max={480}
                                    step={5}
                                    helperText="Time duration"
                                />
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Sizes & Variants Examples */}
                {activeTab === 'variants' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Sizes & Visual Variants
                        </Box>

                        {/* Size Variations */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Size Options
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(3, 1fr)"
                                gap="1.5rem"
                                marginBottom="1.5rem"
                            >
                                <NumberStepperInput
                                    label="Small Size"
                                    size="small"
                                    icon={FaDollarSign}
                                    value={sizeVariants.small}
                                    onChange={(val) => setSizeVariants(prev => ({...prev, small: val}))}
                                    format="currency"
                                    currency="AED"
                                    min={0}
                                    max={1000}
                                    step={10}
                                    helperText="36px height, compact"
                                />
                                
                                <NumberStepperInput
                                    label="Medium Size (Default)"
                                    size="medium"
                                    icon={FaDollarSign}
                                    value={sizeVariants.medium}
                                    onChange={(val) => setSizeVariants(prev => ({...prev, medium: val}))}
                                    format="currency"
                                    currency="AED"
                                    min={0}
                                    max={1000}
                                    step={25}
                                    helperText="44px height, standard"
                                />
                                
                                <NumberStepperInput
                                    label="Large Size"
                                    size="large"
                                    icon={FaDollarSign}
                                    value={sizeVariants.large}
                                    onChange={(val) => setSizeVariants(prev => ({...prev, large: val}))}
                                    format="currency"
                                    currency="AED"
                                    min={0}
                                    max={1000}
                                    step={50}
                                    helperText="52px height, prominent"
                                />
                            </Box>

                            <Box fontSize="0.875rem" color="#6b7280" textAlign="center">
                                Size affects input height, button size, font size, and padding
                            </Box>
                        </Box>

                        {/* Visual Variants */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Visual Style Variants
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(3, 1fr)"
                                gap="1.5rem"
                                marginBottom="1.5rem"
                            >
                                <NumberStepperInput
                                    label="Default Variant"
                                    variant="default"
                                    icon={FaHome}
                                    value={sizeVariants.defaultVar}
                                    onChange={(val) => setSizeVariants(prev => ({...prev, defaultVar: val}))}
                                    format="currency"
                                    currency="AED"
                                    min={0}
                                    max={1000}
                                    step={25}
                                    helperText="White background, subtle border"
                                />
                                
                                <NumberStepperInput
                                    label="Outlined Variant"
                                    variant="outlined"
                                    icon={FaBuilding}
                                    value={sizeVariants.outlined}
                                    onChange={(val) => setSizeVariants(prev => ({...prev, outlined: val}))}
                                    format="currency"
                                    currency="AED"
                                    min={0}
                                    max={1000}
                                    step={25}
                                    helperText="Transparent, blue border"
                                />
                                
                                <NumberStepperInput
                                    label="Filled Variant"
                                    variant="filled"
                                    icon={FaTags}
                                    value={sizeVariants.filled}
                                    onChange={(val) => setSizeVariants(prev => ({...prev, filled: val}))}
                                    format="currency"
                                    currency="AED"
                                    min={0}
                                    max={1000}
                                    step={25}
                                    helperText="Gray background, subtle"
                                />
                            </Box>

                            <Box fontSize="0.875rem" color="#6b7280" textAlign="center">
                                Variants provide different visual emphasis and integration options
                            </Box>
                        </Box>

                        {/* Special States */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Input States & Features
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gridTemplateColumnsLg="repeat(4, 1fr)"
                                gap="1.5rem"
                            >
                                <NumberStepperInput
                                    label="Required Field"
                                    icon={FaStar}
                                    value={100}
                                    onChange={() => {}}
                                    format="integer"
                                    min={1}
                                    max={10}
                                    required
                                    helperText="This field is required"
                                />
                                
                                <NumberStepperInput
                                    label="Error State"
                                    icon={FaDollarSign}
                                    value={-50}
                                    onChange={() => {}}
                                    format="currency"
                                    currency="AED"
                                    error
                                    helperText="Value cannot be negative"
                                />
                                
                                <NumberStepperInput
                                    label="Disabled State"
                                    icon={FaUser}
                                    value={5}
                                    onChange={() => {}}
                                    format="integer"
                                    disabled
                                    helperText="This field is locked"
                                />
                                
                                <NumberStepperInput
                                    label="Read-Only"
                                    icon={FaChartLine}
                                    value={4.8}
                                    onChange={() => {}}
                                    format="decimal"
                                    decimalPlaces={1}
                                    readOnly
                                    helperText="Display only, no editing"
                                />
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Property Settings Examples */}
                {activeTab === 'property' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Property Configuration Settings
                        </Box>

                        {/* Pricing Settings */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Pricing Configuration
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(3, 1fr)"
                                gap="1.5rem"
                                marginBottom="2rem"
                            >
                                <NumberStepperInput
                                    label="Base Nightly Rate"
                                    icon={FaDollarSign}
                                    value={propertyForm.baseRate}
                                    onChange={(val) => setPropertyForm(prev => ({...prev, baseRate: val}))}
                                    format="currency"
                                    currency="AED"
                                    currencyPosition="prefix"
                                    min={100}
                                    max={10000}
                                    step={50}
                                    size="large"
                                    helperText="Primary rate per night"
                                />
                                
                                <NumberStepperInput
                                    label="Cleaning Fee"
                                    icon={FaHome}
                                    value={propertyForm.cleaningFee}
                                    onChange={(val) => setPropertyForm(prev => ({...prev, cleaningFee: val}))}
                                    format="currency"
                                    currency="AED"
                                    currencyPosition="prefix"
                                    min={0}
                                    max={500}
                                    step={25}
                                    helperText="One-time cleaning charge"
                                />
                                
                                <NumberStepperInput
                                    label="Security Deposit"
                                    icon={FaDollarSign}
                                    value={propertyForm.securityDeposit}
                                    onChange={(val) => setPropertyForm(prev => ({...prev, securityDeposit: val}))}
                                    format="currency"
                                    currency="AED"
                                    currencyPosition="prefix"
                                    min={0}
                                    max={5000}
                                    step={100}
                                    helperText="Refundable security deposit"
                                />
                            </Box>

                            <Box
                                backgroundColor="#f8fafc"
                                borderRadius="0.5rem"
                                padding="1.5rem"
                                border="1px solid #e2e8f0"
                            >
                                <Box fontSize="1rem" fontWeight="600" marginBottom="0.5rem" color="#1a202c">
                                    Total Initial Cost: AED {totalPropertyValue.toLocaleString()}
                                </Box>
                                <Box fontSize="0.875rem" color="#6b7280">
                                    Base rate + Cleaning fee + Security deposit (per booking)
                                </Box>
                            </Box>
                        </Box>

                        {/* Property Specifications */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Property Specifications
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gridTemplateColumnsLg="repeat(4, 1fr)"
                                gap="1.5rem"
                            >
                                <NumberStepperInput
                                    label="Bedrooms"
                                    icon={FaBed}
                                    value={propertyForm.bedrooms}
                                    onChange={(val) => setPropertyForm(prev => ({...prev, bedrooms: val}))}
                                    format="integer"
                                    min={1}
                                    max={10}
                                    step={1}
                                    helperText="Number of bedrooms"
                                />
                                
                                <NumberStepperInput
                                    label="Bathrooms"
                                    icon={FaBath}
                                    value={propertyForm.bathrooms}
                                    onChange={(val) => setPropertyForm(prev => ({...prev, bathrooms: val}))}
                                    format="decimal"
                                    decimalPlaces={1}
                                    min={1}
                                    max={8}
                                    step={0.5}
                                    helperText="Number of bathrooms"
                                />
                                
                                <NumberStepperInput
                                    label="Max Guests"
                                    icon={FaUser}
                                    value={propertyForm.maxGuests}
                                    onChange={(val) => setPropertyForm(prev => ({...prev, maxGuests: val}))}
                                    format="integer"
                                    min={1}
                                    max={20}
                                    step={1}
                                    helperText="Maximum occupancy"
                                />
                                
                                <NumberStepperInput
                                    label="Parking Spots"
                                    icon={FaCar}
                                    value={propertyForm.parkingSpots}
                                    onChange={(val) => setPropertyForm(prev => ({...prev, parkingSpots: val}))}
                                    format="integer"
                                    min={0}
                                    max={10}
                                    step={1}
                                    helperText="Available parking"
                                />
                            </Box>
                        </Box>

                        {/* Additional Settings */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Additional Property Settings
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(3, 1fr)"
                                gap="1.5rem"
                            >
                                <NumberStepperInput
                                    label="Property Area"
                                    icon={FaRuler}
                                    value={propertyForm.area}
                                    onChange={(val) => setPropertyForm(prev => ({...prev, area: val}))}
                                    format="decimal"
                                    decimalPlaces={0}
                                    currency=" m²"
                                    currencyPosition="suffix"
                                    min={50}
                                    max={2000}
                                    step={10}
                                    helperText="Total area in square meters"
                                />
                                
                                <NumberStepperInput
                                    label="Discount Rate"
                                    icon={FaPercent}
                                    value={propertyForm.discount}
                                    onChange={(val) => setPropertyForm(prev => ({...prev, discount: val}))}
                                    format="decimal"
                                    decimalPlaces={1}
                                    currency="%"
                                    currencyPosition="suffix"
                                    min={0}
                                    max={50}
                                    step={0.5}
                                    helperText="Default discount percentage"
                                />
                                
                                <NumberStepperInput
                                    label="Commission Rate"
                                    icon={FaChartLine}
                                    value={advanced.commission}
                                    onChange={(val) => setAdvanced(prev => ({...prev, commission: val}))}
                                    format="decimal"
                                    decimalPlaces={1}
                                    currency="%"
                                    currencyPosition="suffix"
                                    min={0}
                                    max={20}
                                    step={0.25}
                                    helperText="Platform commission rate"
                                />
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Booking Calculator Examples */}
                {activeTab === 'calculator' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Interactive Booking Calculator
                        </Box>

                        {/* Booking Inputs */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Booking Parameters
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gridTemplateColumnsLg="repeat(4, 1fr)"
                                gap="1.5rem"
                                marginBottom="2rem"
                            >
                                <NumberStepperInput
                                    label="Number of Nights"
                                    icon={FaCalendarAlt}
                                    value={booking.nights}
                                    onChange={(val) => setBooking(prev => ({...prev, nights: val}))}
                                    format="integer"
                                    min={1}
                                    max={30}
                                    step={1}
                                    size="large"
                                    helperText="Stay duration"
                                />
                                
                                <NumberStepperInput
                                    label="Number of Guests"
                                    icon={FaUser}
                                    value={booking.guests}
                                    onChange={(val) => setBooking(prev => ({...prev, guests: val}))}
                                    format="integer"
                                    min={1}
                                    max={12}
                                    step={1}
                                    size="large"
                                    helperText="Total guests"
                                />
                                
                                <NumberStepperInput
                                    label="Seasonal Rate"
                                    icon={FaDollarSign}
                                    value={booking.seasonalRate}
                                    onChange={(val) => setBooking(prev => ({...prev, seasonalRate: val}))}
                                    format="currency"
                                    currency="AED"
                                    currencyPosition="prefix"
                                    min={200}
                                    max={5000}
                                    step={50}
                                    size="large"
                                    helperText="Rate per night"
                                />
                                
                                <NumberStepperInput
                                    label="Discount"
                                    icon={FaPercent}
                                    value={booking.discountPercent}
                                    onChange={(val) => setBooking(prev => ({...prev, discountPercent: val}))}
                                    format="decimal"
                                    decimalPlaces={1}
                                    currency="%"
                                    currencyPosition="suffix"
                                    min={0}
                                    max={50}
                                    step={0.5}
                                    size="large"
                                    helperText="Applied discount"
                                />
                            </Box>

                            {/* Calculation Results */}
                            <Box
                                backgroundColor="#f0f9ff"
                                borderRadius="0.75rem"
                                padding="2rem"
                                border="2px solid #bfdbfe"
                            >
                                <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1e40af">
                                    📊 Booking Calculation Results
                                </Box>
                                
                                <Box
                                    display="grid"
                                    gridTemplateColumns="1fr"
                                    gridTemplateColumnsMd="repeat(2, 1fr)"
                                    gridTemplateColumnsLg="repeat(4, 1fr)"
                                    gap="1rem"
                                    fontSize="0.875rem"
                                    fontSizeMd="1rem"
                                >
                                    <Box>
                                        <Box color="#6b7280" marginBottom="0.25rem">Subtotal:</Box>
                                        <Box fontWeight="600" color="#1a202c" fontSize="1.125rem">
                                            AED {bookingSubtotal.toLocaleString()}
                                        </Box>
                                        <Box color="#9ca3af" fontSize="0.75rem">
                                            {booking.nights} nights × AED {booking.seasonalRate.toLocaleString()}
                                        </Box>
                                    </Box>
                                    
                                    <Box>
                                        <Box color="#6b7280" marginBottom="0.25rem">Discount:</Box>
                                        <Box fontWeight="600" color="#dc2626" fontSize="1.125rem">
                                            -AED {bookingDiscount.toLocaleString()}
                                        </Box>
                                        <Box color="#9ca3af" fontSize="0.75rem">
                                            {booking.discountPercent}% off subtotal
                                        </Box>
                                    </Box>
                                    
                                    <Box>
                                        <Box color="#6b7280" marginBottom="0.25rem">Per Guest:</Box>
                                        <Box fontWeight="600" color="#7c3aed" fontSize="1.125rem">
                                            AED {Math.round(bookingTotal / booking.guests).toLocaleString()}
                                        </Box>
                                        <Box color="#9ca3af" fontSize="0.75rem">
                                            Total ÷ {booking.guests} guests
                                        </Box>
                                    </Box>
                                    
                                    <Box>
                                        <Box color="#6b7280" marginBottom="0.25rem">Total Amount:</Box>
                                        <Box fontWeight="700" color="#059669" fontSize="1.5rem">
                                            AED {bookingTotal.toLocaleString()}
                                        </Box>
                                        <Box color="#9ca3af" fontSize="0.75rem">
                                            Final booking cost
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Advanced Calculator Features */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Advanced Numeric Controls
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gridTemplateColumnsLg="repeat(3, 1fr)"
                                gap="1.5rem"
                            >
                                <NumberStepperInput
                                    label="Property Rating"
                                    icon={FaStar}
                                    value={advanced.rating}
                                    onChange={(val) => setAdvanced(prev => ({...prev, rating: val}))}
                                    format="decimal"
                                    decimalPlaces={1}
                                    currency="/5"
                                    currencyPosition="suffix"
                                    min={1}
                                    max={5}
                                    step={0.1}
                                    variant="outlined"
                                    helperText="Guest rating out of 5 stars"
                                />
                                
                                <NumberStepperInput
                                    label="Priority Level"
                                    icon={FaChartLine}
                                    value={advanced.priority}
                                    onChange={(val) => setAdvanced(prev => ({...prev, priority: val}))}
                                    format="integer"
                                    min={1}
                                    max={5}
                                    step={1}
                                    variant="filled"
                                    helperText="Booking priority (1-5)"
                                />
                                
                                <NumberStepperInput
                                    label="Service Score"
                                    icon={FaStar}
                                    value={95}
                                    onChange={() => {}}
                                    format="decimal"
                                    decimalPlaces={0}
                                    currency="/100"
                                    currencyPosition="suffix"
                                    min={0}
                                    max={100}
                                    readOnly
                                    helperText="Calculated service score"
                                />
                            </Box>
                            
                            <Box marginTop="2rem" fontSize="0.875rem" color="#6b7280" textAlign="center">
                                💡 <Box as="span" fontWeight="600">Pro Tip:</Box> Use arrow keys ↑↓ for quick value adjustments, 
                                or click and drag the stepper buttons for rapid changes.
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
                        NumberStepperInput Component - Interactive numeric inputs with advanced formatting
                    </Box>
                    <Box
                        fontSize="0.875rem"
                        color="#9ca3af"
                    >
                        Stepper controls, currency formatting, validation, and responsive design
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}