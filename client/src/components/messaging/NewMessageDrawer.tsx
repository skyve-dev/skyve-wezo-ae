import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { 
  startConversation,
  setShowNewMessageDrawer,
  clearError
} from '@/store/slices/messageSlice'
import { useAppShell } from '@/components/base/AppShell'
import { Box } from '@/components/base/Box'
import Button from '@/components/base/Button'
import Input from '@/components/base/Input'
import SlidingDrawer from '@/components/base/SlidingDrawer'
// import SelectionPicker from '@/components/base/SelectionPicker' // Not used currently"
import { 
  IoSend, 
  IoClose, 
  IoPerson,
  IoHome,
  IoHelpCircle,
  IoSearch
} from 'react-icons/io5'

interface Participant {
  id: string
  name: string
  role: 'Tenant' | 'HomeOwner' | 'Manager'
  email?: string
}

interface Property {
  id: string
  name: string
  location?: string
}

const NewMessageDrawer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { addToast } = useAppShell()
  
  const {
    showNewMessageDrawer,
    isSending,
    error
  } = useSelector((state: RootState) => state.messages)
  
  const { user } = useSelector((state: RootState) => state.auth)
  
  // Form state
  const [step, setStep] = useState<'participant' | 'property' | 'compose'>('participant')
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [conversationType, setConversationType] = useState<'general' | 'reservation' | 'support'>('general')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  
  // Search states
  const [participantSearchQuery, setParticipantSearchQuery] = useState('')
  const [propertySearchQuery, setPropertySearchQuery] = useState('')
  
  // Mock data - in real app, these would come from Redux/API
  const [participants] = useState<Participant[]>([
    { id: 'manager1', name: 'Wezo Support', role: 'Manager', email: 'support@wezo.ae' },
    { id: 'host1', name: 'Ahmed Al-Mansouri', role: 'HomeOwner', email: 'ahmed@example.com' },
    { id: 'host2', name: 'Sarah Johnson', role: 'HomeOwner', email: 'sarah@example.com' },
    { id: 'tenant1', name: 'Michael Chen', role: 'Tenant', email: 'michael@example.com' },
    { id: 'tenant2', name: 'Emma Wilson', role: 'Tenant', email: 'emma@example.com' }
  ])
  
  const [properties] = useState<Property[]>([
    { id: 'prop1', name: 'Luxury Marina Villa', location: 'Dubai Marina' },
    { id: 'prop2', name: 'Downtown Penthouse', location: 'Downtown Dubai' },
    { id: 'prop3', name: 'Beach House Jumeirah', location: 'Jumeirah Beach' },
    { id: 'prop4', name: 'City View Apartment', location: 'Business Bay' }
  ])

  const conversationTypeOptions = [
    { id: 'general', name: 'General Conversation', icon: <IoPerson />, description: 'General discussion or inquiry' },
    { id: 'reservation', name: 'About a Booking', icon: <IoHome />, description: 'Related to a specific property booking' },
    { id: 'support', name: 'Support Request', icon: <IoHelpCircle />, description: 'Get help from Wezo support team' }
  ]

  // Reset form when drawer opens
  useEffect(() => {
    if (showNewMessageDrawer) {
      setStep('participant')
      setSelectedParticipant(null)
      setSelectedProperty(null)
      setConversationType('general')
      setSubject('')
      setMessage('')
      setParticipantSearchQuery('')
      setPropertySearchQuery('')
    }
  }, [showNewMessageDrawer])

  // Handle errors
  useEffect(() => {
    if (error) {
      addToast(error, { type: 'error', autoHide: true, duration: 4000 })
      dispatch(clearError())
    }
  }, [error, addToast, dispatch])

  const handleClose = () => {
    dispatch(setShowNewMessageDrawer(false))
  }

  const filteredParticipants = participants.filter(participant =>
    String(participant.id) !== String(user?.id) && // Don't show current user
    (participant.name.toLowerCase().includes(participantSearchQuery.toLowerCase()) ||
     participant.email?.toLowerCase().includes(participantSearchQuery.toLowerCase()) ||
     participant.role.toLowerCase().includes(participantSearchQuery.toLowerCase()))
  )

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(propertySearchQuery.toLowerCase()) ||
    property.location?.toLowerCase().includes(propertySearchQuery.toLowerCase())
  )

  const handleParticipantSelect = (participant: Participant) => {
    setSelectedParticipant(participant)
    
    // Auto-advance to property selection if it's a reservation conversation
    if (conversationType === 'reservation') {
      setStep('property')
    } else {
      setStep('compose')
    }
  }

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    setStep('compose')
  }

  const handleConversationTypeChange = (type: 'general' | 'reservation' | 'support') => {
    setConversationType(type)
    
    // Reset selections when type changes
    setSelectedParticipant(null)
    setSelectedProperty(null)
    setStep('participant')
    
    // For support, auto-select Wezo Support
    if (type === 'support') {
      const supportManager = participants.find(p => p.role === 'Manager')
      if (supportManager) {
        setSelectedParticipant(supportManager)
        setStep('compose')
      }
    }
  }

  const handleSendMessage = async () => {
    if (!selectedParticipant || !message.trim()) return

    try {
      await dispatch(startConversation({
        recipientId: selectedParticipant.id,
        recipientType: selectedParticipant.role,
        subject: subject.trim() || undefined,
        content: message.trim(),
        reservationId: conversationType === 'reservation' && selectedProperty ? selectedProperty.id : undefined
      }))

      // Show success message
      addToast('Message sent successfully!', { type: 'success', autoHide: true, duration: 3000 })
      
      // Close drawer
      handleClose()
    } catch (error) {
      addToast('Failed to send message', { type: 'error', autoHide: true, duration: 4000 })
    }
  }

  const canSendMessage = selectedParticipant && message.trim() && 
    (conversationType !== 'reservation' || selectedProperty)

  const renderStepContent = () => {
    switch (step) {
      case 'participant':
        return (
          <Box padding="1.5rem" height="100%" display="flex" flexDirection="column">
            {/* Conversation Type Selection */}
            <Box marginBottom="2rem">
              <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
                What type of conversation?
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1rem">
                {conversationTypeOptions.map(option => (
                  <Box
                    key={option.id}
                    padding="1rem"
                    border="2px solid"
                    borderColor={conversationType === option.id ? "#D52122" : "#e5e7eb"}
                    borderRadius="12px"
                    backgroundColor={conversationType === option.id ? "#fef2f2" : "white"}
                    cursor="pointer"
                    onClick={() => handleConversationTypeChange(option.id as any)}
                    style={{ transition: 'all 0.2s' }}
                  >
                    <Box display="flex" alignItems="center" gap="0.75rem">
                      <Box color={conversationType === option.id ? "#D52122" : "#6b7280"}>
                        {option.icon}
                      </Box>
                      <Box>
                        <Box fontWeight="600" fontSize="0.875rem" color={conversationType === option.id ? "#D52122" : "#1f2937"}>
                          {option.name}
                        </Box>
                        <Box fontSize="0.75rem" color="#6b7280">
                          {option.description}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Participant Selection */}
            {conversationType !== 'support' && (
              <>
                <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
                  Who would you like to message?
                </Box>
                
                {/* Search */}
                <Input
                  placeholder="Search by name, email, or role..."
                  value={participantSearchQuery}
                  onChange={(e) => setParticipantSearchQuery(e.target.value)}
                  icon={IoSearch}
                  style={{ marginBottom: '1rem' }}
                />
                
                {/* Participants List */}
                <Box flex="1" overflowY="auto">
                  {filteredParticipants.length === 0 ? (
                    <Box textAlign="center" padding="2rem" color="#6b7280">
                      <IoPerson size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                      <Box fontWeight="600" marginBottom="0.5rem">
                        No participants found
                      </Box>
                      <Box fontSize="0.875rem">
                        Try different search terms
                      </Box>
                    </Box>
                  ) : (
                    <Box display="flex" flexDirection="column" gap="0.75rem">
                      {filteredParticipants.map(participant => (
                        <Box
                          key={participant.id}
                          padding="1rem"
                          border="1px solid #e5e7eb"
                          borderRadius="8px"
                          backgroundColor="white"
                          cursor="pointer"
                          onClick={() => handleParticipantSelect(participant)}
                          style={{ transition: 'all 0.2s' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#D52122'
                            e.currentTarget.style.backgroundColor = '#fef2f2'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb'
                            e.currentTarget.style.backgroundColor = 'white'
                          }}
                        >
                          <Box display="flex" alignItems="center" gap="0.75rem">
                            <Box
                              width="40px"
                              height="40px"
                              borderRadius="50%"
                              backgroundColor={participant.role === 'Manager' ? '#D52122' : participant.role === 'HomeOwner' ? '#059669' : '#3b82f6'}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                              fontSize="0.875rem"
                              fontWeight="600"
                            >
                              {participant.name.charAt(0).toUpperCase()}
                            </Box>
                            
                            <Box flex="1">
                              <Box fontWeight="600" fontSize="0.875rem">
                                {participant.name}
                              </Box>
                              <Box fontSize="0.75rem" color="#6b7280">
                                {participant.role === 'Manager' ? 'Support Team' : 
                                 participant.role === 'HomeOwner' ? 'Property Owner' : 
                                 'Guest'}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        )

      case 'property':
        return (
          <Box padding="1.5rem" height="100%" display="flex" flexDirection="column">
            <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1.5rem">
              <Button
                icon={<IoClose style={{ transform: 'rotate(45deg)' }} />}
                onClick={() => setStep('participant')}
                size="small"
                style={{ backgroundColor: 'transparent', color: '#6b7280' }}
              />
              <Box fontSize="1.125rem" fontWeight="600">
                Which property is this about?
              </Box>
            </Box>
            
            {/* Search */}
            <Input
              placeholder="Search properties..."
              value={propertySearchQuery}
              onChange={(e) => setPropertySearchQuery(e.target.value)}
              icon={IoSearch}
              style={{ marginBottom: '1rem' }}
            />
            
            {/* Properties List */}
            <Box flex="1" overflowY="auto">
              {filteredProperties.length === 0 ? (
                <Box textAlign="center" padding="2rem" color="#6b7280">
                  <IoHome size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                  <Box fontWeight="600" marginBottom="0.5rem">
                    No properties found
                  </Box>
                  <Box fontSize="0.875rem">
                    Try different search terms
                  </Box>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap="0.75rem">
                  {filteredProperties.map(property => (
                    <Box
                      key={property.id}
                      padding="1rem"
                      border="1px solid #e5e7eb"
                      borderRadius="8px"
                      backgroundColor="white"
                      cursor="pointer"
                      onClick={() => handlePropertySelect(property)}
                      style={{ transition: 'all 0.2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#D52122'
                        e.currentTarget.style.backgroundColor = '#fef2f2'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.backgroundColor = 'white'
                      }}
                    >
                      <Box display="flex" alignItems="center" gap="0.75rem">
                        <Box
                          width="40px"
                          height="40px"
                          borderRadius="8px"
                          backgroundColor="#f3f4f6"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <IoHome size={20} color="#6b7280" />
                        </Box>
                        
                        <Box flex="1">
                          <Box fontWeight="600" fontSize="0.875rem">
                            {property.name}
                          </Box>
                          <Box fontSize="0.75rem" color="#6b7280">
                            {property.location}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )

      case 'compose':
        return (
          <Box padding="1.5rem" height="100%" display="flex" flexDirection="column">
            <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1.5rem">
              <Button
                icon={<IoClose style={{ transform: 'rotate(45deg)' }} />}
                onClick={() => setStep(conversationType === 'reservation' ? 'property' : 'participant')}
                size="small"
                style={{ backgroundColor: 'transparent', color: '#6b7280' }}
              />
              <Box fontSize="1.125rem" fontWeight="600">
                Compose Message
              </Box>
            </Box>

            {/* Recipient Info */}
            <Box
              padding="1rem"
              backgroundColor="#f9fafb"
              borderRadius="8px"
              marginBottom="1.5rem"
            >
              <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem">
                Sending to:
              </Box>
              <Box display="flex" alignItems="center" gap="0.75rem">
                <Box
                  width="32px"
                  height="32px"
                  borderRadius="50%"
                  backgroundColor={selectedParticipant?.role === 'Manager' ? '#D52122' : selectedParticipant?.role === 'HomeOwner' ? '#059669' : '#3b82f6'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="0.75rem"
                  fontWeight="600"
                >
                  {selectedParticipant?.name.charAt(0).toUpperCase()}
                </Box>
                <Box>
                  <Box fontWeight="600" fontSize="0.875rem">
                    {selectedParticipant?.name}
                  </Box>
                  {conversationType === 'reservation' && selectedProperty && (
                    <Box fontSize="0.75rem" color="#6b7280" display="flex" alignItems="center" gap="0.25rem">
                      <IoHome size={12} />
                      {selectedProperty.name}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Subject */}
            {conversationType !== 'general' && (
              <Box marginBottom="1rem">
                <Box fontSize="0.875rem" fontWeight="600" marginBottom="0.5rem">
                  Subject (optional)
                </Box>
                <Input
                  placeholder="Enter subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Box>
            )}

            {/* Message */}
            <Box flex="1" display="flex" flexDirection="column">
              <Box fontSize="0.875rem" fontWeight="600" marginBottom="0.5rem">
                Message <span style={{ color: '#dc2626' }}>*</span>
              </Box>
              <textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'none',
                  minHeight: '120px'
                }}
              />
            </Box>

            {/* Send Button */}
            <Box marginTop="1.5rem">
              <Button
                label={isSending ? "Sending..." : "Send Message"}
                icon={<IoSend />}
                onClick={handleSendMessage}
                disabled={!canSendMessage || isSending}
                variant="promoted"
                style={{
                  width: '100%',
                  fontSize: '1rem',
                  padding: '0.875rem'
                }}
              />
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <SlidingDrawer
      isOpen={showNewMessageDrawer}
      onClose={handleClose}
      side="right"
      width="400px"
      backgroundColor="white"
      showCloseButton={true}
    >
      <Box
        height="100%"
        display="flex"
        flexDirection="column"
        backgroundColor="white"
      >
        {/* Header */}
        <Box
          padding="1.5rem"
          borderBottom="1px solid #e5e7eb"
          backgroundColor="#D52122"
          color="white"
        >
          <Box fontSize="1.25rem" fontWeight="600">
            New Conversation
          </Box>
          {step !== 'participant' && (
            <Box fontSize="0.875rem" opacity="0.9" marginTop="0.25rem">
              Step {step === 'property' ? '2' : '3'} of {conversationType === 'reservation' ? '3' : '2'}
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box flex="1" overflowY="auto">
          {renderStepContent()}
        </Box>
      </Box>
    </SlidingDrawer>
  )
}

export default NewMessageDrawer