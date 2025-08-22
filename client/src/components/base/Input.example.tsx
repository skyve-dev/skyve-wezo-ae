import React, {useState} from 'react'
import Input from './Input'
import {Box} from './Box'
import {
    FaBath,
    FaBed,
    FaBuilding,
    FaDollarSign,
    FaEdit,
    FaEnvelope,
    FaGlobe,
    FaHome,
    FaIdCard,
    FaKey,
    FaLock,
    FaMapMarkerAlt,
    FaPhone,
    FaSearch,
    FaStar,
    FaTag,
    FaUser
} from 'react-icons/fa'

/**
 * Input Component Examples
 * Showcasing all input capabilities, sizes, variants, and use cases
 */
export function InputExample() {
    const [activeTab, setActiveTab] = useState('sizes')
    
    // Basic Examples State
    const [basicInputs, setBasicInputs] = useState({
        simple: '',
        withLabel: '',
        withIcon: '',
        required: '',
        disabled: 'This field is disabled',
    })
    
    // Size and Variant State
    const [sizeVariants, setSizeVariants] = useState({
        small: '',
        medium: '',
        large: '',
        defaultVar: '',
        outlined: '',
        filled: '',
    })
    
    // Validation State
    const [validationInputs, setValidationInputs] = useState({
        email: '',
        phone: '',
        url: '',
        password: '',
        confirmPassword: '',
    })
    
    // Property Form State
    const [propertyForm, setPropertyForm] = useState({
        propertyName: '',
        address: '',
        city: '',
        description: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
    })
    
    // Search Form State
    const [searchForm, setSearchForm] = useState({
        location: '',
        maxPrice: '',
        minRating: '',
        propertyType: '',
        amenities: '',
    })

    const tabs = [
        {id: 'sizes', label: 'Sizes & Variants'},
        {id: 'validation', label: 'Validation'},
        {id: 'responsive', label: 'Responsive'},
        {id: 'forms', label: 'Form Examples'}
    ]

    // Validation functions
    const validateEmail = (email: string): string => {
        if (!email) return ''
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'Please enter a valid email address'
        }
        return ''
    }

    const validatePhone = (phone: string): string => {
        if (!phone) return ''
        if (!/^\+?[\d\s-()]{10,}$/.test(phone)) {
            return 'Please enter a valid phone number'
        }
        return ''
    }

    const validateURL = (url: string): string => {
        if (!url) return ''
        try {
            new URL(url)
            return ''
        } catch {
            return 'Please enter a valid URL'
        }
    }

    const validatePassword = (password: string): string => {
        if (!password) return ''
        if (password.length < 8) {
            return 'Password must be at least 8 characters'
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return 'Password must contain uppercase, lowercase, and number'
        }
        return ''
    }

    // Handle input changes
    const handleBasicChange = (field: keyof typeof basicInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setBasicInputs(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleSizeVariantChange = (field: keyof typeof sizeVariants) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setSizeVariants(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleValidationChange = (field: keyof typeof validationInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setValidationInputs(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handlePropertyFormChange = (field: keyof typeof propertyForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setPropertyForm(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleSearchChange = (field: keyof typeof searchForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchForm(prev => ({ ...prev, [field]: e.target.value }))
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
                            ✏️ Input Component
                        </Box>
                        <Box
                            fontSize="1rem"
                            fontSizeMd="1.125rem"
                            color="#6b7280"
                            maxWidth="800px"
                            margin="0 auto"
                        >
                            Responsive text inputs with multiple variants, validation states, and icon support
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

                {/* Sizes & Variants Examples */}
                {activeTab === 'sizes' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Input Sizes & Variants
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
                                Size Variations
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(3, 1fr)"
                                gap="1.5rem"
                                marginBottom="1.5rem"
                            >
                                <Input
                                    label="Small Size"
                                    size="small"
                                    icon={FaUser}
                                    placeholder="Small input field"
                                    value={sizeVariants.small}
                                    onChange={handleSizeVariantChange('small')}
                                />
                                
                                <Input
                                    label="Medium Size (Default)"
                                    size="medium"
                                    icon={FaEnvelope}
                                    placeholder="Medium input field"
                                    value={sizeVariants.medium}
                                    onChange={handleSizeVariantChange('medium')}
                                />
                                
                                <Input
                                    label="Large Size"
                                    size="large"
                                    icon={FaBuilding}
                                    placeholder="Large input field"
                                    value={sizeVariants.large}
                                    onChange={handleSizeVariantChange('large')}
                                />
                            </Box>

                            <Box fontSize="0.875rem" color="#6b7280" textAlign="center">
                                Size affects height, padding, font size, and icon scaling
                            </Box>
                        </Box>

                        {/* Variant Styles */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Visual Variants
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(3, 1fr)"
                                gap="1.5rem"
                                marginBottom="1.5rem"
                            >
                                <Input
                                    label="Default Variant"
                                    variant="default"
                                    icon={FaHome}
                                    placeholder="White background"
                                    value={sizeVariants.defaultVar}
                                    onChange={handleSizeVariantChange('defaultVar')}
                                />
                                
                                <Input
                                    label="Outlined Variant"
                                    variant="outlined"
                                    icon={FaEdit}
                                    placeholder="Blue outline"
                                    value={sizeVariants.outlined}
                                    onChange={handleSizeVariantChange('outlined')}
                                />
                                
                                <Input
                                    label="Filled Variant"
                                    variant="filled"
                                    icon={FaTag}
                                    placeholder="Gray background"
                                    value={sizeVariants.filled}
                                    onChange={handleSizeVariantChange('filled')}
                                />
                            </Box>

                            <Box fontSize="0.875rem" color="#6b7280" textAlign="center">
                                Choose variants based on your design system and contrast needs
                            </Box>
                        </Box>

                        {/* Basic Features */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Basic Features
                            </Box>
                            
                            <Box display="grid" gap="1.5rem">
                                <Input
                                    placeholder="Simple input without label"
                                    value={basicInputs.simple}
                                    onChange={handleBasicChange('simple')}
                                />
                                
                                <Input
                                    label="Input with Label"
                                    placeholder="This input has a label"
                                    value={basicInputs.withLabel}
                                    onChange={handleBasicChange('withLabel')}
                                />
                                
                                <Input
                                    label="Input with Icon"
                                    icon={FaSearch}
                                    placeholder="Search properties..."
                                    value={basicInputs.withIcon}
                                    onChange={handleBasicChange('withIcon')}
                                />
                                
                                <Input
                                    label="Required Field"
                                    placeholder="This field is required"
                                    required
                                    value={basicInputs.required}
                                    onChange={handleBasicChange('required')}
                                />
                                
                                <Input
                                    label="Disabled State"
                                    placeholder="Cannot edit this field"
                                    disabled
                                    value={basicInputs.disabled}
                                    onChange={handleBasicChange('disabled')}
                                />
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Validation Examples */}
                {activeTab === 'validation' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Input Validation & Error States
                        </Box>

                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Live Validation Examples
                            </Box>
                            
                            <Box display="grid" gap="1.5rem">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    icon={FaEnvelope}
                                    placeholder="user@example.com"
                                    value={validationInputs.email}
                                    onChange={handleValidationChange('email')}
                                    error={!!validateEmail(validationInputs.email)}
                                    helperText={validateEmail(validationInputs.email) || 'We\'ll never share your email'}
                                    required
                                />
                                
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    icon={FaPhone}
                                    placeholder="+971 50 123 4567"
                                    value={validationInputs.phone}
                                    onChange={handleValidationChange('phone')}
                                    error={!!validatePhone(validationInputs.phone)}
                                    helperText={validatePhone(validationInputs.phone) || 'Include country code for international numbers'}
                                />
                                
                                <Input
                                    label="Website URL"
                                    type="url"
                                    icon={FaGlobe}
                                    placeholder="https://example.com"
                                    value={validationInputs.url}
                                    onChange={handleValidationChange('url')}
                                    error={!!validateURL(validationInputs.url)}
                                    helperText={validateURL(validationInputs.url) || 'Property or company website'}
                                />
                                
                                <Input
                                    label="Password"
                                    type="password"
                                    icon={FaLock}
                                    placeholder="Create a secure password"
                                    value={validationInputs.password}
                                    onChange={handleValidationChange('password')}
                                    error={!!validatePassword(validationInputs.password)}
                                    helperText={validatePassword(validationInputs.password) || 'At least 8 characters with uppercase, lowercase, and number'}
                                    required
                                />
                                
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    icon={FaKey}
                                    placeholder="Confirm your password"
                                    value={validationInputs.confirmPassword}
                                    onChange={handleValidationChange('confirmPassword')}
                                    error={validationInputs.confirmPassword !== '' && validationInputs.password !== validationInputs.confirmPassword}
                                    helperText={
                                        validationInputs.confirmPassword !== '' && validationInputs.password !== validationInputs.confirmPassword
                                            ? 'Passwords do not match'
                                            : 'Re-enter your password to confirm'
                                    }
                                    required
                                />
                            </Box>
                        </Box>

                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Validation Summary
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gap="2rem"
                            >
                                <Box>
                                    <Box fontSize="1rem" fontWeight="600" marginBottom="1rem" color="#059669">
                                        ✅ Valid Inputs
                                    </Box>
                                    <Box fontSize="0.875rem" color="#6b7280" lineHeight="1.6">
                                        {!validateEmail(validationInputs.email) && validationInputs.email && '• Email format is valid\n'}
                                        {!validatePhone(validationInputs.phone) && validationInputs.phone && '• Phone number is valid\n'}
                                        {!validateURL(validationInputs.url) && validationInputs.url && '• URL format is valid\n'}
                                        {!validatePassword(validationInputs.password) && validationInputs.password && '• Password meets requirements\n'}
                                        {validationInputs.password === validationInputs.confirmPassword && validationInputs.confirmPassword && '• Passwords match\n'}
                                        {Object.values(validationInputs).every(val => !val) && 'Fill in the fields above to see validation results'}
                                    </Box>
                                </Box>
                                
                                <Box>
                                    <Box fontSize="1rem" fontWeight="600" marginBottom="1rem" color="#dc2626">
                                        ❌ Validation Errors
                                    </Box>
                                    <Box fontSize="0.875rem" color="#6b7280" lineHeight="1.6">
                                        {validateEmail(validationInputs.email) && `• ${validateEmail(validationInputs.email)}\n`}
                                        {validatePhone(validationInputs.phone) && `• ${validatePhone(validationInputs.phone)}\n`}
                                        {validateURL(validationInputs.url) && `• ${validateURL(validationInputs.url)}\n`}
                                        {validatePassword(validationInputs.password) && `• ${validatePassword(validationInputs.password)}\n`}
                                        {validationInputs.confirmPassword !== '' && validationInputs.password !== validationInputs.confirmPassword && '• Passwords do not match\n'}
                                        {!Object.values(validationInputs).some(val => val) && 'No errors to display'}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Responsive Examples */}
                {activeTab === 'responsive' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Responsive Width Control
                        </Box>

                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Responsive Width Examples
                            </Box>
                            
                            <Box display="grid" gap="1.5rem">
                                <Input
                                    label="Full Width (Mobile) → 50% (Tablet+)"
                                    placeholder="Responsive width demonstration"
                                    fullWidth
                                    widthMd="50%"
                                    helperText="Full width on mobile, 50% width on tablet and above"
                                />
                                
                                <Input
                                    label="Progressive Width Changes"
                                    placeholder="Different width at each breakpoint"
                                    width="100%"
                                    widthSm="300px"
                                    widthMd="400px"
                                    widthLg="500px"
                                    widthXl="600px"
                                    helperText="100% → 300px → 400px → 500px → 600px"
                                />
                                
                                <Input
                                    label="Constrained Width"
                                    placeholder="Minimum and maximum width constraints"
                                    minWidth="200px"
                                    maxWidth="400px"
                                    helperText="Minimum 200px, maximum 400px width"
                                />
                                
                                <Input
                                    label="Responsive Layout Grid"
                                    placeholder="Part of responsive form layout"
                                    width="100%"
                                    widthMd="calc(50% - 0.5rem)"
                                    widthLg="calc(33.333% - 1rem)"
                                    helperText="1 column → 2 columns → 3 columns"
                                />
                            </Box>
                        </Box>

                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Responsive Form Layout Demo
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gridTemplateColumnsLg="repeat(3, 1fr)"
                                gap="1rem"
                                gapMd="1.5rem"
                            >
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    icon={FaUser}
                                />
                                
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    icon={FaIdCard}
                                />
                                
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="john@example.com"
                                    icon={FaEnvelope}
                                />
                                
                                <Input
                                    label="Phone"
                                    type="tel"
                                    placeholder="+971 50 123 4567"
                                    icon={FaPhone}
                                />
                                
                                <Input
                                    label="City"
                                    placeholder="Dubai"
                                    icon={FaMapMarkerAlt}
                                />
                                
                                <Input
                                    label="Postal Code"
                                    placeholder="12345"
                                    icon={FaMapMarkerAlt}
                                />
                            </Box>
                            
                            <Box marginTop="1.5rem" fontSize="0.875rem" color="#6b7280" textAlign="center">
                                This form layout adapts: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Form Examples */}
                {activeTab === 'forms' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Real-World Form Examples
                        </Box>

                        {/* Property Registration Form */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            marginBottom="2rem"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Property Registration Form
                            </Box>
                            
                            <Box as="form" onSubmit={(e) => e.preventDefault()}>
                                <Box display="grid" gap="1.5rem" marginBottom="2rem">
                                    <Input
                                        label="Property Name"
                                        icon={FaHome}
                                        placeholder="e.g., Luxury Villa Marina"
                                        value={propertyForm.propertyName}
                                        onChange={handlePropertyFormChange('propertyName')}
                                        required
                                        size="large"
                                        helperText="This will be displayed to potential guests"
                                    />
                                    
                                    <Box
                                        display="grid"
                                        gridTemplateColumns="1fr"
                                        gridTemplateColumnsMd="2fr 1fr"
                                        gap="1rem"
                                        gapMd="1.5rem"
                                    >
                                        <Input
                                            label="Property Address"
                                            icon={FaMapMarkerAlt}
                                            placeholder="Full street address"
                                            value={propertyForm.address}
                                            onChange={handlePropertyFormChange('address')}
                                            required
                                        />
                                        
                                        <Input
                                            label="City"
                                            icon={FaBuilding}
                                            placeholder="Dubai"
                                            value={propertyForm.city}
                                            onChange={handlePropertyFormChange('city')}
                                            required
                                        />
                                    </Box>
                                    
                                    <Input
                                        label="Property Description"
                                        icon={FaEdit}
                                        placeholder="Brief description of your property"
                                        value={propertyForm.description}
                                        onChange={handlePropertyFormChange('description')}
                                        helperText="Highlight the best features and amenities"
                                    />
                                    
                                    <Box
                                        display="grid"
                                        gridTemplateColumns="1fr"
                                        gridTemplateColumnsMd="repeat(3, 1fr)"
                                        gap="1rem"
                                        gapMd="1.5rem"
                                    >
                                        <Input
                                            label="Nightly Rate (AED)"
                                            type="number"
                                            icon={FaDollarSign}
                                            placeholder="500"
                                            value={propertyForm.price}
                                            onChange={handlePropertyFormChange('price')}
                                            helperText="Base price per night"
                                        />
                                        
                                        <Input
                                            label="Bedrooms"
                                            type="number"
                                            icon={FaBed}
                                            placeholder="3"
                                            value={propertyForm.bedrooms}
                                            onChange={handlePropertyFormChange('bedrooms')}
                                            helperText="Number of bedrooms"
                                        />
                                        
                                        <Input
                                            label="Bathrooms"
                                            type="number"
                                            icon={FaBath}
                                            placeholder="2"
                                            value={propertyForm.bathrooms}
                                            onChange={handlePropertyFormChange('bathrooms')}
                                            helperText="Number of bathrooms"
                                        />
                                    </Box>
                                </Box>

                                <Box
                                    backgroundColor="#f8fafc"
                                    borderRadius="0.5rem"
                                    padding="1.5rem"
                                    marginBottom="2rem"
                                    border="1px solid #e2e8f0"
                                >
                                    <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#1a202c">
                                        Contact Information
                                    </Box>
                                    
                                    <Box
                                        display="grid"
                                        gridTemplateColumns="1fr"
                                        gridTemplateColumnsMd="repeat(3, 1fr)"
                                        gap="1rem"
                                        gapMd="1.5rem"
                                    >
                                        <Input
                                            label="Contact Name"
                                            icon={FaUser}
                                            placeholder="Property Manager"
                                            value={propertyForm.contactName}
                                            onChange={handlePropertyFormChange('contactName')}
                                            required
                                        />
                                        
                                        <Input
                                            label="Contact Email"
                                            type="email"
                                            icon={FaEnvelope}
                                            placeholder="contact@example.com"
                                            value={propertyForm.contactEmail}
                                            onChange={handlePropertyFormChange('contactEmail')}
                                            required
                                        />
                                        
                                        <Input
                                            label="Contact Phone"
                                            type="tel"
                                            icon={FaPhone}
                                            placeholder="+971 50 123 4567"
                                            value={propertyForm.contactPhone}
                                            onChange={handlePropertyFormChange('contactPhone')}
                                        />
                                    </Box>
                                </Box>
                                
                                <Box
                                    as="button"
                                    type="submit"
                                    width="100%"
                                    padding="1rem"
                                    backgroundColor="#10b981"
                                    color="white"
                                    border="none"
                                    borderRadius="0.5rem"
                                    fontSize="1rem"
                                    fontWeight="600"
                                    cursor="pointer"
                                    whileHover={{ backgroundColor: '#059669' }}
                                    whileTap={{ transform: 'scale(0.98)' }}
                                >
                                    Register Property
                                </Box>
                            </Box>
                        </Box>

                        {/* Search Form */}
                        <Box
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                        >
                            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" color="#1a202c">
                                Property Search Form
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="2fr 1fr"
                                gridTemplateColumnsLg="3fr 1fr 1fr"
                                gap="1rem"
                                gapMd="1.5rem"
                                marginBottom="1.5rem"
                            >
                                <Input
                                    label="Location or Property Name"
                                    icon={FaSearch}
                                    placeholder="Dubai Marina, villa name, or neighborhood"
                                    value={searchForm.location}
                                    onChange={handleSearchChange('location')}
                                    size="large"
                                />
                                
                                <Input
                                    label="Max Price (AED)"
                                    type="number"
                                    icon={FaDollarSign}
                                    placeholder="1000"
                                    value={searchForm.maxPrice}
                                    onChange={handleSearchChange('maxPrice')}
                                    helperText="Per night"
                                />
                                
                                <Input
                                    label="Min Rating"
                                    type="number"
                                    icon={FaStar}
                                    placeholder="4.5"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={searchForm.minRating}
                                    onChange={handleSearchChange('minRating')}
                                    helperText="1-5 stars"
                                />
                            </Box>
                            
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gap="1rem"
                                gapMd="1.5rem"
                                marginBottom="1.5rem"
                            >
                                <Input
                                    label="Property Type"
                                    icon={FaBuilding}
                                    placeholder="Villa, Apartment, Penthouse..."
                                    value={searchForm.propertyType}
                                    onChange={handleSearchChange('propertyType')}
                                />
                                
                                <Input
                                    label="Amenities"
                                    icon={FaTag}
                                    placeholder="Pool, Gym, WiFi, Parking..."
                                    value={searchForm.amenities}
                                    onChange={handleSearchChange('amenities')}
                                    helperText="Separate multiple amenities with commas"
                                />
                            </Box>
                            
                            <Box
                                as="button"
                                type="button"
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
                                whileTap={{ transform: 'scale(0.98)' }}
                            >
                                🔍 Search Properties
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
                        Input Component - Responsive text inputs with validation and icon support
                    </Box>
                    <Box
                        fontSize="0.875rem"
                        color="#9ca3af"
                    >
                        Multiple sizes, variants, and responsive width control for all form scenarios
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}