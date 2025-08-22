import React, {useState} from 'react'
import {Box} from './Box'

/**
 * Comprehensive Box Component Examples
 * Showcasing all responsive and motion capabilities
 */
export function BoxExample() {
    const [activeTab, setActiveTab] = useState('responsive')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        propertyType: '',
        description: '',
        amenities: [] as string[],
    })

    const tabs = [
        {id: 'responsive', label: 'Responsive Layout'},
        {id: 'motion', label: 'Motion & Interactions'},
        {id: 'forms', label: 'Form Elements'},
        {id: 'combined', label: 'Combined Examples'}
    ]

    const properties = [
        {id: 1, name: 'Luxury Villa Marina', price: 'AED 3,500', beds: 5, baths: 4, type: 'Villa'},
        {id: 2, name: 'Downtown Penthouse', price: 'AED 2,800', beds: 3, baths: 3, type: 'Penthouse'},
        {id: 3, name: 'Beachfront Apartment', price: 'AED 1,900', beds: 2, baths: 2, type: 'Apartment'},
        {id: 4, name: 'Garden Villa Estate', price: 'AED 4,200', beds: 6, baths: 5, type: 'Villa'},
    ]

    const stats = [
        {label: 'Total Properties', value: '142', change: '+12%', color: '#3182ce'},
        {label: 'Active Bookings', value: '89', change: '+8%', color: '#10b981'},
        {label: 'Revenue This Month', value: 'AED 185K', change: '+15%', color: '#f59e0b'},
        {label: 'Occupancy Rate', value: '87%', change: '+5%', color: '#8b5cf6'},
    ]

    const amenities = ['Pool', 'Gym', 'WiFi', 'Parking', 'Kitchen', 'Balcony', 'Garden', 'Security']

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}))
    }

    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }))
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
                            Box Component Showcase
                        </Box>
                        <Box
                            fontSize="1rem"
                            fontSizeMd="1.125rem"
                            color="#6b7280"
                            maxWidth="800px"
                            margin="0 auto"
                        >
                            Explore responsive layouts, interactive animations, and form capabilities
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
                
                {/* Responsive Layout Examples */}
                {activeTab === 'responsive' && (
                    <Box>
                        {/* Property Grid */}
                        <Box marginBottom="3rem">
                            <Box
                                fontSize="1.5rem"
                                fontWeight="bold"
                                marginBottom="1rem"
                                color="#1a202c"
                            >
                                Responsive Property Grid
                            </Box>
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsSm="repeat(2, 1fr)"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gridTemplateColumnsLg="repeat(3, 1fr)"
                                gridTemplateColumnsXl="repeat(4, 1fr)"
                                gap="1rem"
                                gapMd="1.5rem"
                            >
                                {properties.map((property) => (
                                    <Box
                                        key={property.id}
                                        backgroundColor="white"
                                        borderRadius="0.5rem"
                                        overflow="hidden"
                                        boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                                        transition="all 0.2s"
                                        whileHover={{
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            transform: 'translateY(-2px)',
                                        }}
                                    >
                                        <Box
                                            height="150px"
                                            heightMd="200px"
                                            backgroundColor="#e5e7eb"
                                            backgroundImage="linear-gradient(45deg, #3182ce, #1e40af)"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            color="white"
                                            fontSize="0.875rem"
                                            fontWeight="500"
                                        >
                                            Property Image
                                        </Box>
                                        <Box padding="1rem" paddingMd="1.5rem">
                                            <Box
                                                fontSize="1rem"
                                                fontSizeMd="1.125rem"
                                                fontWeight="600"
                                                marginBottom="0.5rem"
                                                color="#1a202c"
                                            >
                                                {property.name}
                                            </Box>
                                            <Box
                                                fontSize="0.875rem"
                                                color="#6b7280"
                                                marginBottom="1rem"
                                            >
                                                {property.beds} Beds • {property.baths} Baths • {property.type}
                                            </Box>
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <Box
                                                    fontSize="1.125rem"
                                                    fontWeight="bold"
                                                    color="#10b981"
                                                >
                                                    {property.price}/night
                                                </Box>
                                                <Box
                                                    as="button"
                                                    padding="0.5rem 1rem"
                                                    backgroundColor="#3182ce"
                                                    color="white"
                                                    border="none"
                                                    borderRadius="0.375rem"
                                                    fontSize="0.875rem"
                                                    cursor="pointer"
                                                    whileHover={{
                                                        backgroundColor: '#2563eb',
                                                    }}
                                                >
                                                    View
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Responsive Typography */}
                        <Box marginBottom="3rem">
                            <Box
                                fontSize="1.5rem"
                                fontWeight="bold"
                                marginBottom="1rem"
                                color="#1a202c"
                            >
                                Responsive Typography & Spacing
                            </Box>
                            <Box
                                backgroundColor="white"
                                borderRadius="1rem"
                                padding="2rem"
                                paddingMd="3rem"
                                paddingLg="4rem"
                                textAlign="center"
                            >
                                <Box
                                    fontSize="1.5rem"
                                    fontSizeSm="2rem"
                                    fontSizeMd="2.5rem"
                                    fontSizeLg="3rem"
                                    fontSizeXl="3.5rem"
                                    fontWeight="bold"
                                    marginBottom="1rem"
                                    marginBottomMd="1.5rem"
                                    marginBottomLg="2rem"
                                    color="#1a202c"
                                >
                                    Find Your Dream Property
                                </Box>
                                <Box
                                    fontSize="1rem"
                                    fontSizeMd="1.125rem"
                                    fontSizeLg="1.25rem"
                                    color="#6b7280"
                                    maxWidth="100%"
                                    maxWidthMd="600px"
                                    maxWidthLg="800px"
                                    margin="0 auto"
                                    lineHeight="1.6"
                                >
                                    Experience luxury living with our curated collection of premium properties
                                    across the UAE. From waterfront villas to city penthouses.
                                </Box>
                            </Box>
                        </Box>

                        {/* Responsive Navigation */}
                        <Box marginBottom="3rem">
                            <Box
                                fontSize="1.5rem"
                                fontWeight="bold"
                                marginBottom="1rem"
                                color="#1a202c"
                            >
                                Responsive Navigation
                            </Box>
                            <Box
                                backgroundColor="white"
                                borderRadius="0.5rem"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                                padding="1rem"
                                paddingMd="1rem 2rem"
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Box
                                    fontSize="1.25rem"
                                    fontSizeMd="1.5rem"
                                    fontWeight="bold"
                                    color="#3182ce"
                                >
                                    Wezo.ae
                                </Box>
                                
                                {/* Desktop Menu */}
                                <Box
                                    display="none"
                                    displayMd="flex"
                                    alignItems="center"
                                    gap="2rem"
                                >
                                    {['Properties', 'Bookings', 'Dashboard', 'Profile'].map((item) => (
                                        <Box
                                            key={item}
                                            cursor="pointer"
                                            fontSize="1rem"
                                            color="#374151"
                                            fontWeight="500"
                                            whileHover={{
                                                color: '#3182ce',
                                            }}
                                        >
                                            {item}
                                        </Box>
                                    ))}
                                </Box>
                                
                                {/* Mobile Menu Button */}
                                <Box
                                    as="button"
                                    display="block"
                                    displayMd="none"
                                    padding="0.5rem"
                                    backgroundColor="transparent"
                                    border="none"
                                    fontSize="1.5rem"
                                    cursor="pointer"
                                    whileHover={{
                                        backgroundColor: '#f9fafb',
                                    }}
                                >
                                    ☰
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Motion & Interactions Examples */}
                {activeTab === 'motion' && (
                    <Box>
                        {/* Interactive Buttons */}
                        <Box marginBottom="3rem">
                            <Box
                                fontSize="1.5rem"
                                fontWeight="bold"
                                marginBottom="1rem"
                                color="#1a202c"
                            >
                                Interactive Buttons
                            </Box>
                            <Box
                                display="flex"
                                flexWrap="wrap"
                                gap="1rem"
                                backgroundColor="white"
                                borderRadius="0.5rem"
                                padding="2rem"
                            >
                                {/* Primary Button */}
                                <Box
                                    as="button"
                                    padding="0.75rem 1.5rem"
                                    paddingMd="1rem 2rem"
                                    backgroundColor="#3182ce"
                                    color="white"
                                    border="none"
                                    borderRadius="0.5rem"
                                    fontSize="1rem"
                                    fontWeight="600"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    whileHover={{
                                        backgroundColor: '#2563eb',
                                        Md: {
                                            backgroundColor: '#2563eb',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)',
                                        }
                                    }}
                                    whileTap={{
                                        transform: 'scale(0.95)',
                                    }}
                                    whileFocus={{
                                        outline: 'none',
                                        boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.3)',
                                    }}
                                >
                                    Primary Action
                                </Box>

                                {/* Secondary Button */}
                                <Box
                                    as="button"
                                    padding="0.75rem 1.5rem"
                                    paddingMd="1rem 2rem"
                                    backgroundColor="transparent"
                                    color="#3182ce"
                                    border="2px solid #3182ce"
                                    borderRadius="0.5rem"
                                    fontSize="1rem"
                                    fontWeight="600"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    whileHover={{
                                        backgroundColor: '#eff6ff',
                                        Md: {
                                            backgroundColor: '#3182ce',
                                            color: 'white',
                                        }
                                    }}
                                    whileTap={{
                                        transform: 'scale(0.95)',
                                    }}
                                >
                                    Secondary Action
                                </Box>

                                {/* Success Button */}
                                <Box
                                    as="button"
                                    padding="0.75rem 1.5rem"
                                    paddingMd="1rem 2rem"
                                    backgroundColor="#10b981"
                                    color="white"
                                    border="none"
                                    borderRadius="0.5rem"
                                    fontSize="1rem"
                                    fontWeight="600"
                                    cursor="pointer"
                                    transition="all 0.3s"
                                    whileHover={{
                                        backgroundColor: '#059669',
                                        Sm: {
                                            transform: 'scale(1.05) rotate(-1deg)',
                                        },
                                        Md: {
                                            backgroundColor: '#059669',
                                            transform: 'scale(1.05) rotate(-1deg)',
                                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                                        }
                                    }}
                                    whileTap={{
                                        transform: 'scale(0.95)',
                                    }}
                                >
                                    Confirm Booking
                                </Box>
                            </Box>
                        </Box>

                        {/* Interactive Cards */}
                        <Box marginBottom="3rem">
                            <Box
                                fontSize="1.5rem"
                                fontWeight="bold"
                                marginBottom="1rem"
                                color="#1a202c"
                            >
                                Interactive Property Cards
                            </Box>
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gap="1.5rem"
                            >
                                {properties.slice(0, 2).map((property) => (
                                    <Box
                                        key={property.id}
                                        backgroundColor="white"
                                        borderRadius="1rem"
                                        overflow="hidden"
                                        boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                                        cursor="pointer"
                                        transition="all 0.3s"
                                        whileHover={{
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            Lg: {
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                transform: 'translateY(-4px)',
                                            }
                                        }}
                                        whileTap={{
                                            transform: 'scale(0.98)',
                                        }}
                                    >
                                        <Box
                                            height="200px"
                                            position="relative"
                                            overflow="hidden"
                                        >
                                            <Box
                                                width="100%"
                                                height="100%"
                                                backgroundColor="#e5e7eb"
                                                backgroundImage="linear-gradient(45deg, #3182ce, #1e40af)"
                                                transition="transform 0.3s"
                                                whileHover={{
                                                    transform: 'scale(1.05)',
                                                    Md: {
                                                        transform: 'scale(1.1)',
                                                    }
                                                }}
                                            />
                                            <Box
                                                position="absolute"
                                                top="1rem"
                                                right="1rem"
                                                padding="0.5rem 1rem"
                                                backgroundColor="rgba(0,0,0,0.8)"
                                                color="white"
                                                borderRadius="0.5rem"
                                                fontSize="0.875rem"
                                                fontWeight="600"
                                            >
                                                {property.price}/night
                                            </Box>
                                        </Box>
                                        <Box padding="1.5rem">
                                            <Box
                                                fontSize="1.25rem"
                                                fontWeight="bold"
                                                marginBottom="0.5rem"
                                                color="#1a202c"
                                            >
                                                {property.name}
                                            </Box>
                                            <Box
                                                fontSize="0.875rem"
                                                color="#6b7280"
                                                marginBottom="1rem"
                                            >
                                                {property.beds} Bedrooms • {property.baths} Bathrooms • {property.type}
                                            </Box>
                                            <Box
                                                as="button"
                                                width="100%"
                                                padding="0.75rem"
                                                backgroundColor="#10b981"
                                                color="white"
                                                border="none"
                                                borderRadius="0.5rem"
                                                fontSize="0.875rem"
                                                fontWeight="600"
                                                cursor="pointer"
                                                transition="all 0.2s"
                                                whileHover={{
                                                    backgroundColor: '#059669',
                                                    transform: 'scale(1.02)',
                                                }}
                                                whileTap={{
                                                    transform: 'scale(0.95)',
                                                }}
                                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                            >
                                                Check Availability
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Scroll Animation */}
                        <Box marginBottom="3rem">
                            <Box
                                fontSize="1.5rem"
                                fontWeight="bold"
                                marginBottom="1rem"
                                color="#1a202c"
                            >
                                Scroll-Triggered Animation
                            </Box>
                            <Box
                                backgroundColor="white"
                                borderRadius="1rem"
                                padding="3rem"
                                textAlign="center"
                                opacity={0}
                                transform="translateY(20px)"
                                transition="all 0.6s ease-out"
                                whileInView={{
                                    opacity: 1,
                                    transform: 'translateY(0)',
                                    Lg: {
                                        opacity: 1,
                                        transform: 'translateY(0)',
                                        transition: 'all 0.8s ease-out',
                                    }
                                }}
                            >
                                <Box
                                    fontSize="2rem"
                                    fontSizeMd="2.5rem"
                                    fontWeight="bold"
                                    marginBottom="1rem"
                                    color="#3182ce"
                                >
                                    🏡 Welcome to Luxury Living
                                </Box>
                                <Box
                                    fontSize="1rem"
                                    fontSizeMd="1.125rem"
                                    color="#6b7280"
                                    maxWidth="600px"
                                    margin="0 auto"
                                >
                                    This content animates into view when you scroll to it, with different timing
                                    on different screen sizes.
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Form Elements Examples */}
                {activeTab === 'forms' && (
                    <Box>
                        <Box
                            fontSize="1.5rem"
                            fontWeight="bold"
                            marginBottom="2rem"
                            color="#1a202c"
                        >
                            Interactive Form Elements
                        </Box>
                        
                        <Box
                            as="form"
                            backgroundColor="white"
                            borderRadius="1rem"
                            padding="2rem"
                            paddingMd="3rem"
                            boxShadow="0 4px 12px rgba(0,0,0,0.1)"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            {/* Form Grid */}
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsMd="repeat(2, 1fr)"
                                gap="1.5rem"
                            >
                                {/* Name Input */}
                                <Box display="flex" flexDirection="column" gap="0.5rem">
                                    <Box
                                        as="label"
                                        fontSize="0.875rem"
                                        fontWeight="500"
                                        color="#374151"
                                    >
                                        Property Name *
                                    </Box>
                                    <Box
                                        as="input"
                                        type="text"
                                        placeholder="Enter property name"
                                        value={formData.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                                        width="100%"
                                        padding="0.75rem"
                                        paddingMd="1rem"
                                        fontSize="1rem"
                                        border="2px solid #e5e7eb"
                                        borderRadius="0.5rem"
                                        backgroundColor="white"
                                        transition="all 0.2s"
                                        whileFocus={{
                                            borderColor: '#3182ce',
                                            outline: 'none',
                                            Md: {
                                                borderColor: '#3182ce',
                                                outline: 'none',
                                                boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
                                            }
                                        }}
                                        whileHover={{
                                            borderColor: '#9ca3af',
                                        }}
                                    />
                                </Box>

                                {/* Email Input */}
                                <Box display="flex" flexDirection="column" gap="0.5rem">
                                    <Box
                                        as="label"
                                        fontSize="0.875rem"
                                        fontWeight="500"
                                        color="#374151"
                                    >
                                        Contact Email *
                                    </Box>
                                    <Box
                                        as="input"
                                        type="email"
                                        placeholder="contact@example.com"
                                        value={formData.email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                                        width="100%"
                                        padding="0.75rem"
                                        paddingMd="1rem"
                                        fontSize="1rem"
                                        border="2px solid #e5e7eb"
                                        borderRadius="0.5rem"
                                        backgroundColor="white"
                                        transition="all 0.2s"
                                        whileFocus={{
                                            borderColor: '#3182ce',
                                            outline: 'none',
                                            boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
                                        }}
                                        whileHover={{
                                            borderColor: '#9ca3af',
                                        }}
                                    />
                                </Box>

                                {/* Property Type Select */}
                                <Box
                                    gridColumn="1"
                                    gridColumnMd="1 / -1"
                                    display="flex"
                                    flexDirection="column"
                                    gap="0.5rem"
                                >
                                    <Box
                                        as="label"
                                        fontSize="0.875rem"
                                        fontWeight="500"
                                        color="#374151"
                                    >
                                        Property Type *
                                    </Box>
                                    <Box
                                        as="select"
                                        value={formData.propertyType}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('propertyType', e.target.value)}
                                        width="100%"
                                        padding="0.75rem"
                                        paddingMd="1rem"
                                        fontSize="1rem"
                                        border="2px solid #e5e7eb"
                                        borderRadius="0.5rem"
                                        backgroundColor="white"
                                        cursor="pointer"
                                        whileFocus={{
                                            borderColor: '#3182ce',
                                            outline: 'none',
                                            boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
                                        }}
                                        whileHover={{
                                            borderColor: '#9ca3af',
                                        }}
                                    >
                                        <Box as="option" value="">Select property type</Box>
                                        <Box as="option" value="villa">Villa</Box>
                                        <Box as="option" value="apartment">Apartment</Box>
                                        <Box as="option" value="penthouse">Penthouse</Box>
                                        <Box as="option" value="townhouse">Townhouse</Box>
                                    </Box>
                                </Box>

                                {/* Description Textarea */}
                                <Box
                                    gridColumn="1"
                                    gridColumnMd="1 / -1"
                                    display="flex"
                                    flexDirection="column"
                                    gap="0.5rem"
                                >
                                    <Box
                                        as="label"
                                        fontSize="0.875rem"
                                        fontWeight="500"
                                        color="#374151"
                                    >
                                        Description
                                    </Box>
                                    <Box
                                        as="textarea"
                                        placeholder="Describe your property..."
                                        value={formData.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                                        width="100%"
                                        minHeight="100px"
                                        minHeightMd="120px"
                                        padding="0.75rem"
                                        paddingMd="1rem"
                                        fontSize="1rem"
                                        border="2px solid #e5e7eb"
                                        borderRadius="0.5rem"
                                        resize="vertical"
                                        lineHeight="1.5"
                                        whileFocus={{
                                            borderColor: '#3182ce',
                                            outline: 'none',
                                            boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
                                        }}
                                        whileHover={{
                                            borderColor: '#9ca3af',
                                        }}
                                    />
                                </Box>

                                {/* Amenities Checkboxes */}
                                <Box
                                    gridColumn="1"
                                    gridColumnMd="1 / -1"
                                    display="flex"
                                    flexDirection="column"
                                    gap="1rem"
                                >
                                    <Box
                                        fontSize="0.875rem"
                                        fontWeight="500"
                                        color="#374151"
                                    >
                                        Amenities
                                    </Box>
                                    <Box
                                        display="grid"
                                        gridTemplateColumns="repeat(2, 1fr)"
                                        gridTemplateColumnsSm="repeat(3, 1fr)"
                                        gridTemplateColumnsMd="repeat(4, 1fr)"
                                        gap="0.75rem"
                                    >
                                        {amenities.map((amenity) => (
                                            <Box
                                                key={amenity}
                                                as="label"
                                                display="flex"
                                                alignItems="center"
                                                padding="0.5rem"
                                                borderRadius="0.375rem"
                                                cursor="pointer"
                                                transition="all 0.2s"
                                                whileHover={{
                                                    backgroundColor: '#f9fafb',
                                                }}
                                            >
                                                <Box
                                                    as="input"
                                                    type="checkbox"
                                                    checked={formData.amenities.includes(amenity)}
                                                    onChange={() => handleAmenityToggle(amenity)}
                                                    marginRight="0.5rem"
                                                    accentColor="#3182ce"
                                                />
                                                <Box fontSize="0.875rem" fontSizeMd="1rem">
                                                    {amenity}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Submit Button */}
                                <Box
                                    gridColumn="1"
                                    gridColumnMd="1 / -1"
                                    marginTop="1rem"
                                >
                                    <Box
                                        as="button"
                                        type="submit"
                                        width="100%"
                                        padding="1rem"
                                        paddingMd="1.125rem"
                                        fontSize="1rem"
                                        fontSizeMd="1.125rem"
                                        fontWeight="600"
                                        backgroundColor="#3182ce"
                                        color="white"
                                        border="none"
                                        borderRadius="0.5rem"
                                        cursor="pointer"
                                        transition="all 0.2s"
                                        whileHover={{
                                            backgroundColor: '#2563eb',
                                            Md: {
                                                backgroundColor: '#2563eb',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)',
                                            }
                                        }}
                                        whileTap={{
                                            transform: 'scale(0.98)',
                                        }}
                                        whileFocus={{
                                            outline: 'none',
                                            boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.3)',
                                        }}
                                    >
                                        Register Property
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Combined Examples */}
                {activeTab === 'combined' && (
                    <Box>
                        {/* Dashboard Widget */}
                        <Box marginBottom="3rem">
                            <Box
                                fontSize="1.5rem"
                                fontWeight="bold"
                                marginBottom="1rem"
                                color="#1a202c"
                            >
                                Interactive Dashboard
                            </Box>
                            <Box
                                display="grid"
                                gridTemplateColumns="1fr"
                                gridTemplateColumnsSm="repeat(2, 1fr)"
                                gridTemplateColumnsMd="repeat(4, 1fr)"
                                gap="1rem"
                                gapMd="1.5rem"
                                marginBottom="2rem"
                            >
                                {stats.map((stat, index) => (
                                    <Box
                                        key={stat.label}
                                        backgroundColor="white"
                                        borderRadius="0.5rem"
                                        padding="1.5rem"
                                        boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                                        transition="all 0.2s"
                                        opacity={0}
                                        transform="translateY(20px)"
                                        whileInView={{
                                            opacity: 1,
                                            transform: 'translateY(0)',
                                        }}
                                        whileHover={{
                                            backgroundColor: '#f9fafb',
                                            transform: 'scale(1.02)',
                                            Md: {
                                                backgroundColor: '#eff6ff',
                                                transform: 'scale(1.05)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            }
                                        }}
                                        style={{
                                            transitionDelay: `${index * 100}ms`
                                        }}
                                    >
                                        <Box
                                            fontSize="0.875rem"
                                            color="#6b7280"
                                            marginBottom="0.5rem"
                                        >
                                            {stat.label}
                                        </Box>
                                        <Box
                                            fontSize="1.75rem"
                                            fontSizeMd="2rem"
                                            fontWeight="bold"
                                            color="#1a202c"
                                            marginBottom="0.25rem"
                                        >
                                            {stat.value}
                                        </Box>
                                        <Box
                                            fontSize="0.875rem"
                                            color={stat.color}
                                            fontWeight="500"
                                        >
                                            {stat.change}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Complex Property Card */}
                        <Box marginBottom="3rem">
                            <Box
                                fontSize="1.5rem"
                                fontWeight="bold"
                                marginBottom="1rem"
                                color="#1a202c"
                            >
                                Complex Interactive Property Card
                            </Box>
                            <Box
                                display="flex"
                                flexDirection="column"
                                flexDirectionMd="row"
                                backgroundColor="white"
                                borderRadius="0.5rem"
                                borderRadiusMd="1rem"
                                overflow="hidden"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                                transition="all 0.3s"
                                cursor="pointer"
                                whileHover={{
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    Md: {
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        transform: 'translateY(-4px)',
                                    }
                                }}
                                whileTap={{
                                    transform: 'scale(0.98)',
                                }}
                            >
                                <Box
                                    width="100%"
                                    widthMd="400px"
                                    height="250px"
                                    heightMd="300px"
                                    position="relative"
                                    overflow="hidden"
                                >
                                    <Box
                                        width="100%"
                                        height="100%"
                                        backgroundColor="#e5e7eb"
                                        backgroundImage="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        transition="transform 0.3s"
                                        whileHover={{
                                            transform: 'scale(1.05)',
                                            Md: {
                                                transform: 'scale(1.1)',
                                            }
                                        }}
                                    />
                                    <Box
                                        position="absolute"
                                        top="1rem"
                                        right="1rem"
                                        padding="0.5rem 1rem"
                                        paddingMd="0.75rem 1.25rem"
                                        backgroundColor="rgba(0,0,0,0.8)"
                                        color="white"
                                        borderRadius="0.5rem"
                                        fontSize="0.875rem"
                                        fontSizeMd="1rem"
                                        fontWeight="600"
                                    >
                                        AED 4,500/night
                                    </Box>
                                </Box>

                                <Box
                                    flex="1"
                                    padding="1.5rem"
                                    paddingMd="2rem"
                                    paddingLg="2.5rem"
                                >
                                    <Box
                                        fontSize="1.25rem"
                                        fontSizeMd="1.5rem"
                                        fontSizeLg="1.75rem"
                                        fontWeight="bold"
                                        marginBottom="0.75rem"
                                        color="#1a202c"
                                    >
                                        Oceanview Luxury Villa
                                    </Box>
                                    
                                    <Box
                                        fontSize="1rem"
                                        fontSizeMd="1.125rem"
                                        color="#6b7280"
                                        marginBottom="1.5rem"
                                        lineHeight="1.6"
                                    >
                                        Stunning 6-bedroom villa with panoramic ocean views, private beach access, 
                                        infinity pool, and world-class amenities.
                                    </Box>

                                    <Box
                                        display="grid"
                                        gridTemplateColumns="repeat(3, 1fr)"
                                        gridTemplateColumnsSm="repeat(4, 1fr)"
                                        gridTemplateColumnsMd="repeat(3, 1fr)"
                                        gridTemplateColumnsLg="repeat(4, 1fr)"
                                        gap="0.5rem"
                                        marginBottom="2rem"
                                    >
                                        {['6 Beds', '5 Baths', 'Pool', 'Beach', 'WiFi', 'Parking'].map(amenity => (
                                            <Box
                                                key={amenity}
                                                padding="0.25rem 0.5rem"
                                                backgroundColor="#f3f4f6"
                                                borderRadius="0.25rem"
                                                fontSize="0.75rem"
                                                fontSizeMd="0.875rem"
                                                textAlign="center"
                                                transition="all 0.2s"
                                                whileHover={{
                                                    backgroundColor: '#e5e7eb',
                                                    Md: {
                                                        backgroundColor: '#3182ce',
                                                        color: 'white',
                                                        transform: 'scale(1.05)',
                                                    }
                                                }}
                                            >
                                                {amenity}
                                            </Box>
                                        ))}
                                    </Box>

                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        flexDirectionSm="row"
                                        gap="1rem"
                                    >
                                        <Box
                                            as="button"
                                            flex="1"
                                            padding="0.75rem"
                                            paddingMd="1rem"
                                            backgroundColor="#3182ce"
                                            color="white"
                                            border="none"
                                            borderRadius="0.5rem"
                                            fontSize="0.875rem"
                                            fontSizeMd="1rem"
                                            fontWeight="600"
                                            cursor="pointer"
                                            transition="all 0.2s"
                                            whileHover={{
                                                backgroundColor: '#2563eb',
                                                Md: {
                                                    backgroundColor: '#2563eb',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)',
                                                }
                                            }}
                                            whileTap={{
                                                transform: 'scale(0.95)',
                                            }}
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                        >
                                            Book Now
                                        </Box>
                                        
                                        <Box
                                            as="button"
                                            flex="1"
                                            padding="0.75rem"
                                            paddingMd="1rem"
                                            backgroundColor="transparent"
                                            color="#3182ce"
                                            border="2px solid #3182ce"
                                            borderRadius="0.5rem"
                                            fontSize="0.875rem"
                                            fontSizeMd="1rem"
                                            fontWeight="600"
                                            cursor="pointer"
                                            transition="all 0.2s"
                                            whileHover={{
                                                backgroundColor: '#eff6ff',
                                                Md: {
                                                    backgroundColor: '#3182ce',
                                                    color: 'white',
                                                }
                                            }}
                                            whileTap={{
                                                transform: 'scale(0.95)',
                                            }}
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                        >
                                            View Details
                                        </Box>
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
                        Box Component - Showcasing responsive design and interactive animations
                    </Box>
                    <Box
                        fontSize="0.875rem"
                        color="#9ca3af"
                    >
                        Built with mobile-first responsive design principles
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}