import { useState } from 'react'
import { Box } from './Box'
import Button from './Button'
import {
  FaSave,
  FaPlus,
  FaTrash,
  FaEdit,
  FaHeart,
  FaShare,
  FaDownload,
  FaUpload,
  FaCalendarCheck,
  FaCalendarTimes,
  FaEnvelope,
  FaPhone,
  FaExternalLinkAlt,
  FaHome,
  FaImages,
  FaPlay,
  FaPause,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCalendar,
  FaCog
} from 'react-icons/fa'

// Example data interfaces
interface Property {
  id: string
  name: string
  location: string
  pricePerNight: number
  isActive: boolean
  image: string
}

interface BookingStep {
  id: number
  label: string
  completed: boolean
}

export function ButtonExample() {
  // Tab state
  const [activeTab, setActiveTab] = useState('basic')

  // Interactive states
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(2)
  const [isSaved, setIsSaved] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    propertyName: '',
    location: '',
    price: 0
  })

  // Mock property data
  const sampleProperty: Property = {
    id: '1',
    name: 'Luxury Villa Marina',
    location: 'Dubai Marina, Dubai',
    pricePerNight: 750,
    isActive: true,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400'
  }

  const bookingSteps: BookingStep[] = [
    { id: 1, label: 'Select Dates', completed: true },
    { id: 2, label: 'Guest Details', completed: false },
    { id: 3, label: 'Payment', completed: false },
    { id: 4, label: 'Confirmation', completed: false }
  ]

  // Handler functions
  const handleSave = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Form submitted successfully!')
    }, 3000)
  }

  const handleBooking = () => {
    alert('Booking initiated for ' + sampleProperty.name)
  }

  const handleWishlist = () => {
    alert('Added to wishlist!')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: sampleProperty.name,
        text: `Check out this amazing property: ${sampleProperty.name}`,
        url: window.location.href
      })
    } else {
      alert('Property shared!')
    }
  }

  const handleNextStep = () => {
    if (currentStep < bookingSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const tabs = [
    { id: 'basic', name: 'Basic Usage' },
    { id: 'variants', name: 'Variants & Sizes' },
    { id: 'states', name: 'States & Loading' },
    { id: 'integration', name: 'Property Integration' }
  ]

  return (
    <Box padding="2rem" maxWidth="1200px" margin="0 auto">
      <Box marginBottom="2rem">
        <Box fontSize="2rem" fontWeight="700" color="#111827" marginBottom="0.5rem">
          Button Component Examples
        </Box>
        <Box fontSize="1.125rem" color="#6b7280">
          Comprehensive button component with variants, states, loading indicators, and link behavior
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
                Basic Button Usage
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Standard buttons with labels, icons, and click handlers.
              </Box>
              
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem" marginBottom="2rem">
                <Button
                  label="Save Changes"
                  variant="promoted"
                  icon={<FaSave />}
                  onClick={() => alert('Changes saved!')}
                />
                
                <Button
                  label="Cancel"
                  variant="normal"
                  onClick={() => alert('Cancelled!')}
                />
                
                <Button
                  label="Add New"
                  variant="promoted"
                  icon={<FaPlus />}
                  onClick={() => alert('Adding new item...')}
                />
                
                <Button
                  label="Delete"
                  variant="normal"
                  icon={<FaTrash />}
                  onClick={() => confirm('Are you sure you want to delete?')}
                />
              </Box>

              <Box
                padding="1rem"
                backgroundColor="#f0fdf4"
                borderRadius="0.5rem"
                border="1px solid #bbf7d0"
              >
                <Box fontSize="0.875rem" color="#166534" marginBottom="0.5rem">
                  <strong>Key Features:</strong>
                </Box>
                <Box fontSize="0.875rem" color="#166534">
                  • Default type="submit" for form integration<br/>
                  • Icons automatically sized based on button size<br/>
                  • Hover effects with elevation and color changes<br/>
                  • Consistent height matching Input component sizes
                </Box>
              </Box>
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Link Button Behavior
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Buttons that render as links when href is provided, maintaining button styling.
              </Box>
              
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1rem">
                <Button
                  label="View Property Details"
                  variant="promoted"
                  href="/properties/sample"
                  icon={<FaHome />}
                />
                
                <Button
                  label="External Website"
                  variant="normal"
                  href="https://wezo.ae"
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<FaExternalLinkAlt />}
                />
                
                <Button
                  label="Call Property Host"
                  variant="normal"
                  href="tel:+971501234567"
                  icon={<FaPhone />}
                />
                
                <Button
                  label="Send Email Inquiry"
                  variant="normal"
                  href="mailto:host@property.com?subject=Property Inquiry"
                  icon={<FaEnvelope />}
                />
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'variants' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Size Variations
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Three sizes that perfectly align with Input component heights for consistent form layouts.
              </Box>
              
              <Box display="flex" flexDirection="column" gap="2rem">
                {/* Small size */}
                <Box>
                  <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem">
                    Small (36px height)
                  </Box>
                  <Box display="flex" gap="1rem" alignItems="center" flexWrap="wrap">
                    <Button label="Small Promoted" size="small" variant="promoted" icon={<FaPlus />} />
                    <Button label="Small Normal" size="small" variant="normal" icon={<FaEdit />} />
                    <Button label="Small Full Width" size="small" variant="promoted" fullWidth />
                  </Box>
                </Box>

                {/* Medium size */}
                <Box>
                  <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem">
                    Medium (44px height) - Default
                  </Box>
                  <Box display="flex" gap="1rem" alignItems="center" flexWrap="wrap">
                    <Button label="Medium Promoted" size="medium" variant="promoted" icon={<FaSave />} />
                    <Button label="Medium Normal" size="medium" variant="normal" icon={<FaHeart />} />
                    <Button label="Medium Full Width" size="medium" variant="normal" fullWidth />
                  </Box>
                </Box>

                {/* Large size */}
                <Box>
                  <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem">
                    Large (52px height)
                  </Box>
                  <Box display="flex" gap="1rem" alignItems="center" flexWrap="wrap">
                    <Button label="Large Promoted" size="large" variant="promoted" icon={<FaCalendarCheck />} />
                    <Button label="Large Normal" size="large" variant="normal" icon={<FaShare />} />
                    <Button label="Large Full Width" size="large" variant="promoted" fullWidth />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Variant Comparison
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Two main variants: promoted (primary actions) and normal (secondary actions).
              </Box>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="2rem">
                <Box>
                  <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem" color="#3b82f6">
                    Promoted Variant
                  </Box>
                  <Box display="flex" flexDirection="column" gap="0.75rem">
                    <Button label="Primary Action" variant="promoted" />
                    <Button label="With Icon" variant="promoted" icon={<FaCalendarCheck />} />
                    <Button label="Full Width Primary" variant="promoted" fullWidth />
                  </Box>
                  <Box fontSize="0.875rem" color="#6b7280" marginTop="0.75rem">
                    Use for main actions like "Book Now", "Save", "Submit"
                  </Box>
                </Box>

                <Box>
                  <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem" color="#374151">
                    Normal Variant
                  </Box>
                  <Box display="flex" flexDirection="column" gap="0.75rem">
                    <Button label="Secondary Action" variant="normal" />
                    <Button label="With Icon" variant="normal" icon={<FaHeart />} />
                    <Button label="Full Width Secondary" variant="normal" fullWidth />
                  </Box>
                  <Box fontSize="0.875rem" color="#6b7280" marginTop="0.75rem">
                    Use for secondary actions like "Cancel", "Back", "Save to Wishlist"
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'states' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Loading States
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Buttons automatically show loading spinners and disable interaction when loading.
              </Box>
              
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1rem" marginBottom="2rem">
                <Button
                  label={isLoading ? "Saving..." : isSaved ? "Saved!" : "Save Property"}
                  variant="promoted"
                  loading={isLoading}
                  icon={isSaved ? <FaCheck /> : <FaSave />}
                  onClick={handleSave}
                />
                
                <Button
                  label="Upload Photos"
                  variant="normal"
                  loading={true}
                  icon={<FaUpload />}
                />
                
                <Button
                  label="Processing Payment"
                  variant="promoted"
                  size="large"
                  loading={true}
                />
                
                <Button
                  label="Sending Email"
                  variant="normal"
                  size="small"
                  loading={true}
                  icon={<FaEnvelope />}
                />
              </Box>

              <Box
                padding="1rem"
                backgroundColor="#fef3c7"
                borderRadius="0.5rem"
                border="1px solid #fbbf24"
              >
                <Box fontSize="0.875rem" color="#92400e">
                  <strong>Loading Behavior:</strong> When loading={true}, the button automatically disables interaction, 
                  shows a spinning indicator, and hides the label text while maintaining button dimensions.
                </Box>
              </Box>
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Disabled States
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Disabled buttons have reduced opacity and prevent all interaction.
              </Box>
              
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
                <Button
                  label="Unavailable Dates"
                  variant="promoted"
                  disabled={true}
                  icon={<FaCalendarTimes />}
                />
                
                <Button
                  label="Out of Stock"
                  variant="normal"
                  disabled={true}
                />
                
                <Button
                  label="Maintenance Mode"
                  variant="promoted"
                  disabled={true}
                  icon={<FaCog />}
                  size="large"
                />
                
                <Button
                  label="Inactive Property"
                  variant="normal"
                  disabled={true}
                  icon={<FaPause />}
                  size="small"
                />
              </Box>
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Interactive Demo
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Test different button states with live interactions.
              </Box>
              
              <Box
                padding="1.5rem"
                backgroundColor="white"
                borderRadius="0.75rem"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
              >
                <Box display="flex" gap="1rem" alignItems="center" marginBottom="1rem">
                  <Button
                    label="Toggle Loading Demo"
                    variant={isLoading ? "normal" : "promoted"}
                    onClick={handleSave}
                    disabled={isLoading}
                    icon={isLoading ? <FaCog /> : <FaPlay />}
                  />
                  
                  {isSaved && (
                    <Box fontSize="0.875rem" color="#059669" display="flex" alignItems="center" gap="0.5rem">
                      <FaCheck />
                      Action completed successfully!
                    </Box>
                  )}
                </Box>
                
                <Box fontSize="0.875rem" color="#6b7280">
                  Click the button above to see loading state transition and success feedback.
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'integration' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Property Card Actions
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Real-world button usage in property listing cards.
              </Box>
              
              <Box 
                backgroundColor="white"
                borderRadius="0.75rem"
                padding="1.5rem"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                maxWidth="400px"
              >
                {/* Property Image */}
                <Box
                  height="200px"
                  backgroundImage={`url(${sampleProperty.image})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  borderRadius="0.5rem"
                  marginBottom="1rem"
                />
                
                {/* Property Details */}
                <Box marginBottom="1.5rem">
                  <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
                    {sampleProperty.name}
                  </Box>
                  <Box color="#6b7280" marginBottom="1rem">
                    {sampleProperty.location}
                  </Box>
                  <Box fontSize="1.125rem" fontWeight="600" color="#059669">
                    AED {sampleProperty.pricePerNight}/night
                  </Box>
                </Box>
                
                {/* Action buttons */}
                <Box display="flex" flexDirection="column" gap="0.75rem">
                  <Button
                    label="Book This Property"
                    variant="promoted"
                    fullWidth
                    icon={<FaCalendarCheck />}
                    onClick={handleBooking}
                  />
                  
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap="0.75rem">
                    <Button
                      label="Save"
                      variant="normal"
                      icon={<FaHeart />}
                      onClick={handleWishlist}
                    />
                    <Button
                      label="Share"
                      variant="normal" 
                      icon={<FaShare />}
                      onClick={handleShare}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Form Integration
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Button usage in property registration forms with proper type attributes.
              </Box>
              
              <Box
                as="form"
                onSubmit={handleSubmit}
                backgroundColor="white"
                borderRadius="0.75rem"
                padding="2rem"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                maxWidth="500px"
              >
                <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem">
                  Add New Property
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1rem" marginBottom="1.5rem">
                  <Box>
                    <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block">
                      Property Name
                    </Box>
                    <Box
                      as="input"
                      type="text"
                      value={formData.propertyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData({...formData, propertyName: e.target.value})}
                      padding="0.75rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.375rem"
                      width="100%"
                      placeholder="e.g., Luxury Marina Villa"
                      required
                    />
                  </Box>
                  
                  <Box>
                    <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block">
                      Location
                    </Box>
                    <Box
                      as="input"
                      type="text"
                      value={formData.location}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData({...formData, location: e.target.value})}
                      padding="0.75rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.375rem"
                      width="100%"
                      placeholder="e.g., Dubai Marina"
                      required
                    />
                  </Box>
                  
                  <Box>
                    <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block">
                      Price per Night (AED)
                    </Box>
                    <Box
                      as="input"
                      type="number"
                      value={formData.price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData({...formData, price: Number(e.target.value)})}
                      padding="0.75rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.375rem"
                      width="100%"
                      placeholder="750"
                      min="0"
                      required
                    />
                  </Box>
                </Box>
                
                <Box display="flex" gap="1rem" justifyContent="flex-end">
                  <Button
                    label="Cancel"
                    variant="normal"
                    type="button"
                    onClick={() => alert('Form cancelled')}
                  />
                  <Button
                    label="Add Property"
                    variant="promoted"
                    type="submit"
                    loading={isSubmitting}
                    icon={<FaHome />}
                  />
                </Box>
              </Box>
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Booking Flow Navigation
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Step-by-step navigation buttons for booking processes.
              </Box>
              
              <Box
                backgroundColor="white"
                borderRadius="0.75rem"
                padding="1.5rem"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
              >
                {/* Progress indicator */}
                <Box marginBottom="2rem">
                  <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
                    Booking Progress
                  </Box>
                  <Box display="flex" gap="1rem" alignItems="center" overflowX="auto">
                    {bookingSteps.map((step, index) => (
                      <Box key={step.id} display="flex" alignItems="center" gap="0.5rem">
                        <Box
                          width="2rem"
                          height="2rem"
                          borderRadius="50%"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          backgroundColor={currentStep === step.id ? '#3b82f6' : step.completed ? '#10b981' : '#e5e7eb'}
                          color={currentStep === step.id || step.completed ? 'white' : '#6b7280'}
                          fontSize="0.875rem"
                          fontWeight="600"
                        >
                          {step.completed ? <FaCheck size="0.75rem" /> : step.id}
                        </Box>
                        <Box
                          fontSize="0.875rem"
                          fontWeight={currentStep === step.id ? '600' : '400'}
                          color={currentStep === step.id ? '#3b82f6' : step.completed ? '#10b981' : '#6b7280'}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {step.label}
                        </Box>
                        {index < bookingSteps.length - 1 && (
                          <Box width="1rem" height="1px" backgroundColor="#e5e7eb" margin="0 0.5rem" />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
                
                {/* Step content */}
                <Box
                  padding="2rem"
                  backgroundColor="#f8fafc"
                  borderRadius="0.5rem"
                  border="1px solid #e2e8f0"
                  marginBottom="1.5rem"
                  textAlign="center"
                >
                  <Box fontSize="1.125rem" fontWeight="600" marginBottom="0.5rem">
                    {bookingSteps[currentStep - 1]?.label}
                  </Box>
                  <Box color="#6b7280">
                    Step {currentStep} of {bookingSteps.length} - Content would go here
                  </Box>
                </Box>
                
                {/* Navigation buttons */}
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                >
                  <Button
                    label="Previous"
                    variant="normal"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1}
                    icon={<FaArrowLeft />}
                  />
                  
                  <Button
                    label="Cancel Booking"
                    variant="normal"
                    size="small"
                    onClick={() => alert('Booking cancelled')}
                  />
                  
                  <Button
                    label={currentStep === bookingSteps.length ? 'Complete Booking' : 'Continue'}
                    variant="promoted"
                    onClick={handleNextStep}
                    disabled={currentStep === bookingSteps.length}
                    icon={currentStep === bookingSteps.length ? <FaCheck /> : <FaArrowRight />}
                  />
                </Box>
              </Box>
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Property Management Dashboard
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Administrative buttons for property owners and managers.
              </Box>
              
              <Box
                backgroundColor="white"
                borderRadius="0.75rem"
                padding="1.5rem"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
              >
                <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="1.5rem">
                  <Box>
                    <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.25rem">
                      {sampleProperty.name}
                    </Box>
                    <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem">
                      {sampleProperty.location}
                    </Box>
                    <Box
                      fontSize="0.75rem"
                      fontWeight="500"
                      color={sampleProperty.isActive ? '#059669' : '#dc2626'}
                      backgroundColor={sampleProperty.isActive ? '#dcfce7' : '#fef2f2'}
                      padding="0.25rem 0.5rem"
                      borderRadius="0.25rem"
                      display="inline-block"
                    >
                      {sampleProperty.isActive ? 'Active' : 'Inactive'}
                    </Box>
                  </Box>
                  
                  <Box fontSize="1.125rem" fontWeight="600" color="#059669">
                    AED {sampleProperty.pricePerNight}/night
                  </Box>
                </Box>
                
                <Box display="flex" gap="1rem" alignItems="center" flexWrap="wrap">
                  <Button
                    label="Edit Property"
                    variant="promoted"
                    icon={<FaEdit />}
                    href={`/dashboard/properties/${sampleProperty.id}/edit`}
                  />
                  
                  <Button
                    label="View Calendar"
                    variant="normal"
                    icon={<FaCalendar />}
                    onClick={() => alert('Opening calendar...')}
                  />
                  
                  <Button
                    label="Manage Photos"
                    variant="normal"
                    icon={<FaImages />}
                    onClick={() => alert('Opening photo manager...')}
                  />
                  
                  <Button
                    label="Download Report"
                    variant="normal"
                    size="small"
                    icon={<FaDownload />}
                    onClick={() => alert('Generating report...')}
                  />
                  
                  <Button
                    label={sampleProperty.isActive ? 'Deactivate' : 'Activate'}
                    variant="normal"
                    size="small"
                    onClick={() => alert(`Property ${sampleProperty.isActive ? 'deactivated' : 'activated'}`)}
                    icon={sampleProperty.isActive ? <FaPause /> : <FaPlay />}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ButtonExample