import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Box } from '../../components/base/Box'
import { Input } from '../../components/base/Input'
import { 
    FaUser, 
    FaEnvelope, 
    FaLock, 
    FaPhone, 
    FaSearch,
    FaHome,
    FaCreditCard,
    FaCalendar,
    FaGlobe,
    FaMapMarkerAlt,
    FaBuilding,
    FaCode
} from 'react-icons/fa'

export const Route = createFileRoute('/examples/input')({
    component: InputExample,
})

function InputExample() {
    const [values, setValues] = useState({
        basic: '',
        email: '',
        password: '',
        phone: '',
        search: '',
        withError: '',
        disabled: 'I am disabled',
        readonly: 'Read only text',
        address: '',
        city: '',
        zipCode: '',
    })

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }

    return (
        <Box padding="2rem" maxWidth="1200px" margin="0 auto">
            <Box marginBottom="2rem">
                <Box fontSize="2rem" fontWeight="bold" color="#1a202c" marginBottom="0.5rem">
                    Input Component Examples
                </Box>
                <Box color="#718096">
                    A reusable input component with various sizes, variants, and features
                </Box>
            </Box>

            {/* Basic Examples */}
            <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
                    Basic Examples
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="1.5rem">
                    <Input
                        label="Basic Input"
                        placeholder="Enter text..."
                        value={values.basic}
                        onChange={handleChange('basic')}
                        helperText="This is a basic input field"
                    />
                    
                    <Input
                        label="Required Field"
                        placeholder="This field is required"
                        required
                        helperText="Fields marked with * are required"
                    />
                    
                    <Input
                        label="With Icon"
                        icon={FaUser}
                        placeholder="Enter your name"
                        helperText="Input with an icon"
                    />
                </Box>
            </Box>

            {/* Size Variants */}
            <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
                    Size Variants
                </Box>
                <Box display="flex" flexDirection="column" gap="1.5rem">
                    <Input
                        size="small"
                        label="Small Input"
                        icon={FaEnvelope}
                        placeholder="Small size input"
                        helperText="Size: small (36px height)"
                    />
                    
                    <Input
                        size="medium"
                        label="Medium Input"
                        icon={FaPhone}
                        placeholder="Medium size input (default)"
                        helperText="Size: medium (44px height)"
                    />
                    
                    <Input
                        size="large"
                        label="Large Input"
                        icon={FaHome}
                        placeholder="Large size input"
                        helperText="Size: large (52px height)"
                    />
                </Box>
            </Box>

            {/* Style Variants */}
            <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
                    Style Variants
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="1.5rem">
                    <Input
                        variant="default"
                        label="Default Variant"
                        icon={FaSearch}
                        placeholder="Default style"
                        helperText="Standard input style"
                    />
                    
                    <Input
                        variant="outlined"
                        label="Outlined Variant"
                        icon={FaCreditCard}
                        placeholder="Outlined style"
                        helperText="Outlined input style"
                    />
                    
                    <Input
                        variant="filled"
                        label="Filled Variant"
                        icon={FaCalendar}
                        placeholder="Filled style"
                        helperText="Filled input style"
                    />
                </Box>
            </Box>

            {/* Input Types */}
            <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
                    Input Types
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="1.5rem">
                    <Input
                        type="email"
                        label="Email"
                        icon={FaEnvelope}
                        placeholder="user@example.com"
                        value={values.email}
                        onChange={handleChange('email')}
                        required
                        helperText="Enter a valid email address"
                    />
                    
                    <Input
                        type="password"
                        label="Password"
                        icon={FaLock}
                        placeholder="Enter password"
                        value={values.password}
                        onChange={handleChange('password')}
                        required
                        helperText="Must be at least 8 characters"
                    />
                    
                    <Input
                        type="tel"
                        label="Phone Number"
                        icon={FaPhone}
                        placeholder="+1 (555) 123-4567"
                        value={values.phone}
                        onChange={handleChange('phone')}
                        helperText="Include country code"
                    />
                    
                    <Input
                        type="search"
                        label="Search"
                        icon={FaSearch}
                        placeholder="Search..."
                        value={values.search}
                        onChange={handleChange('search')}
                        helperText="Press Enter to search"
                    />
                    
                    <Input
                        type="date"
                        label="Date"
                        icon={FaCalendar}
                        helperText="Select a date"
                    />
                    
                    <Input
                        type="number"
                        label="Number"
                        placeholder="Enter a number"
                        min="0"
                        max="100"
                        step="1"
                        helperText="Between 0 and 100"
                    />
                    
                    <Input
                        type="url"
                        label="Website"
                        icon={FaGlobe}
                        placeholder="https://example.com"
                        helperText="Enter a valid URL"
                    />
                    
                    <Input
                        type="color"
                        label="Color Picker"
                        helperText="Choose a color"
                    />
                </Box>
            </Box>

            {/* States */}
            <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
                    States
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="1.5rem">
                    <Input
                        label="Error State"
                        icon={FaUser}
                        placeholder="This has an error"
                        value={values.withError}
                        onChange={handleChange('withError')}
                        error
                        helperText="This field has an error"
                    />
                    
                    <Input
                        label="Disabled State"
                        icon={FaLock}
                        value={values.disabled}
                        disabled
                        helperText="This input is disabled"
                    />
                    
                    <Input
                        label="Read Only"
                        icon={FaEnvelope}
                        value={values.readonly}
                        readOnly
                        helperText="This input is read-only"
                    />
                </Box>
            </Box>

            {/* Width Variations */}
            <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
                    Width Variations
                </Box>
                <Box display="flex" flexDirection="column" gap="1rem">
                    <Input
                        fullWidth
                        label="Full Width Input"
                        icon={FaSearch}
                        placeholder="This input takes full width of its container"
                        helperText="Using fullWidth prop"
                    />
                    
                    <Input
                        width="200px"
                        label="Fixed Width (200px)"
                        placeholder="200px wide"
                    />
                    
                    <Input
                        width="50%"
                        label="Percentage Width (50%)"
                        placeholder="50% of container"
                    />
                    
                    <Input
                        minWidth="250px"
                        maxWidth="400px"
                        label="Min/Max Width"
                        placeholder="250px min, 400px max"
                        helperText="Responsive width with constraints"
                    />
                </Box>
            </Box>

            {/* Without Labels */}
            <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
                    Without Labels
                </Box>
                <Box display="flex" gap="1rem" flexWrap="wrap">
                    <Input
                        placeholder="No label, default variant"
                        width="250px"
                    />
                    
                    <Input
                        variant="outlined"
                        placeholder="No label, outlined"
                        width="250px"
                    />
                    
                    <Input
                        variant="filled"
                        placeholder="No label, filled"
                        width="250px"
                    />
                </Box>
            </Box>

            {/* Form Example */}
            <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
                    Form Example
                </Box>
                <Box 
                    as="form" 
                    backgroundColor="white" 
                    padding="2rem" 
                    borderRadius="0.5rem"
                    boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                    maxWidth="600px"
                    onSubmit={(e: React.FormEvent) => {
                        e.preventDefault()
                        console.log('Form submitted:', values)
                    }}
                >
                    <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem">
                        Property Registration Form
                    </Box>
                    
                    <Box display="flex" flexDirection="column" gap="1.5rem">
                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                            <Input
                                label="First Name"
                                icon={FaUser}
                                placeholder="John"
                                required
                            />
                            
                            <Input
                                label="Last Name"
                                placeholder="Doe"
                                required
                            />
                        </Box>
                        
                        <Input
                            type="email"
                            label="Email Address"
                            icon={FaEnvelope}
                            placeholder="john@example.com"
                            required
                            fullWidth
                        />
                        
                        <Input
                            type="password"
                            label="Password"
                            icon={FaLock}
                            placeholder="Enter password"
                            required
                            fullWidth
                            helperText="At least 8 characters with numbers and symbols"
                        />
                        
                        <Input
                            label="Property Address"
                            icon={FaMapMarkerAlt}
                            placeholder="123 Main Street"
                            value={values.address}
                            onChange={handleChange('address')}
                            required
                            fullWidth
                        />
                        
                        <Box display="grid" gridTemplateColumns="2fr 1fr" gap="1rem">
                            <Input
                                label="City"
                                icon={FaBuilding}
                                placeholder="Dubai"
                                value={values.city}
                                onChange={handleChange('city')}
                                required
                            />
                            
                            <Input
                                label="ZIP Code"
                                icon={FaCode}
                                placeholder="12345"
                                value={values.zipCode}
                                onChange={handleChange('zipCode')}
                                pattern="[0-9]{5}"
                            />
                        </Box>
                        
                        <Input
                            type="tel"
                            label="Phone Number"
                            icon={FaPhone}
                            placeholder="+971 50 123 4567"
                            fullWidth
                        />
                        
                        <Box
                            as="button"
                            type="submit"
                            padding="0.75rem 2rem"
                            backgroundColor="#3182ce"
                            color="white"
                            border="none"
                            borderRadius="0.375rem"
                            fontSize="1rem"
                            fontWeight="500"
                            cursor="pointer"
                            whileHover={{ backgroundColor: '#2c5aa0' }}
                            marginTop="1rem"
                        >
                            Submit Form
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Mixed Variants Example */}
            <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
                    Mixed Variants
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1rem">
                    <Input
                        size="small"
                        variant="outlined"
                        label="Small Outlined"
                        icon={FaUser}
                        placeholder="Small + Outlined"
                    />
                    
                    <Input
                        size="medium"
                        variant="filled"
                        label="Medium Filled"
                        icon={FaEnvelope}
                        placeholder="Medium + Filled"
                    />
                    
                    <Input
                        size="large"
                        variant="default"
                        label="Large Default"
                        icon={FaPhone}
                        placeholder="Large + Default"
                    />
                    
                    <Input
                        size="small"
                        variant="filled"
                        label="Small Filled with Error"
                        icon={FaLock}
                        placeholder="Error state"
                        error
                        helperText="Invalid input"
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default InputExample