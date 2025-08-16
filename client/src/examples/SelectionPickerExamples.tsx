import { useState } from 'react'
import SelectionPicker from '../components/SelectionPicker'
import { Box } from '../components/Box'
import { ParkingType, PetPolicy } from '../constants/propertyEnums'
import { 
  FaUser,
  FaUserTie,
  FaUserGraduate,
  FaLaptopCode,
  FaUmbrellaBeach,
  FaBuilding,
  FaCity,
  FaHome,
  FaWater,
  FaMountain,
  FaWifi,
  FaSwimmingPool,
  FaDumbbell,
  FaSpa,
  FaParking,
  FaUtensils,
  FaTshirt,
  FaBell,
  FaLock,
  FaCar,
  FaCheck
} from 'react-icons/fa'

// Example data types
interface User {
  id: number
  name: string
  email: string
  role: string
  avatar?: React.ReactNode
  department: string
}

interface Category {
  categoryId: string
  label: string
  icon: React.ReactNode
  description: string
  disabled?: boolean
  count: number
}

interface Plan {
  id: string
  name: string
  price: string
  features: string[]
  popular?: boolean
}

/**
 * Comprehensive examples showcasing SelectionPicker component capabilities
 */
export function SelectionPickerExamples() {
  // Single selection states
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [selectedParking, setSelectedParking] = useState<ParkingType>(ParkingType.No)
  const [selectedPetPolicy, setSelectedPetPolicy] = useState<PetPolicy>(PetPolicy.No)
  
  // Multiple selection states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['wifi'])
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  
  // Example data
  const users: User[] = [
    { id: 1, name: 'Ahmed Al-Rashid', email: 'ahmed@wezo.ae', role: 'Property Owner', department: 'Premium', avatar: <FaUserTie /> },
    { id: 2, name: 'Fatima Hassan', email: 'fatima@wezo.ae', role: 'Guest', department: 'Standard', avatar: <FaUser /> },
    { id: 3, name: 'Mohammed Al-Zahra', email: 'mohammed@wezo.ae', role: 'Property Manager', department: 'Premium', avatar: <FaBuilding /> },
    { id: 4, name: 'Aisha Al-Mansouri', email: 'aisha@wezo.ae', role: 'Guest', department: 'Standard', avatar: <FaUserGraduate /> },
    { id: 5, name: 'Omar Al-Khalil', email: 'omar@wezo.ae', role: 'Admin', department: 'Management', avatar: <FaLaptopCode /> }
  ]
  
  const categories: Category[] = [
    { categoryId: 'luxury-villas', label: 'Luxury Villas', icon: <FaUmbrellaBeach />, description: 'Premium waterfront properties', count: 45 },
    { categoryId: 'apartments', label: 'Modern Apartments', icon: <FaBuilding />, description: 'City center accommodations', count: 128 },
    { categoryId: 'penthouses', label: 'Penthouses', icon: <FaCity />, description: 'Sky-high luxury living', count: 23 },
    { categoryId: 'townhouses', label: 'Family Townhouses', icon: <FaHome />, description: 'Perfect for families', count: 67 },
    { categoryId: 'beach-houses', label: 'Beach Houses', icon: <FaWater />, description: 'Direct beach access', count: 34 },
    { categoryId: 'desert-resorts', label: 'Desert Resorts', icon: <FaMountain />, description: 'Unique desert experience', count: 12, disabled: true }
  ]
  
  const plans: Plan[] = [
    { 
      id: 'basic', 
      name: 'Basic Plan', 
      price: 'AED 99/month',
      features: ['Up to 3 properties', 'Basic analytics', 'Email support']
    },
    { 
      id: 'premium', 
      name: 'Premium Plan', 
      price: 'AED 299/month',
      features: ['Up to 15 properties', 'Advanced analytics', 'Priority support', 'Marketing tools'],
      popular: true
    },
    { 
      id: 'enterprise', 
      name: 'Enterprise Plan', 
      price: 'AED 599/month',
      features: ['Unlimited properties', 'Custom analytics', '24/7 phone support', 'API access', 'White-label solution']
    }
  ]
  
  const propertyFeatures: { id: string; name: string; icon: React.ReactNode; essential: boolean }[] = [
    { id: 'wifi', name: 'High-Speed WiFi', icon: <FaWifi />, essential: true },
    { id: 'pool', name: 'Swimming Pool', icon: <FaSwimmingPool />, essential: false },
    { id: 'gym', name: 'Fitness Center', icon: <FaDumbbell />, essential: false },
    { id: 'spa', name: 'Spa & Wellness', icon: <FaSpa />, essential: false },
    { id: 'parking', name: 'Free Parking', icon: <FaParking />, essential: true },
    { id: 'kitchen', name: 'Full Kitchen', icon: <FaUtensils />, essential: true },
    { id: 'laundry', name: 'Laundry Service', icon: <FaTshirt />, essential: false },
    { id: 'concierge', name: '24/7 Concierge', icon: <FaBell />, essential: false },
    { id: 'security', name: 'Security Service', icon: <FaLock />, essential: true },
    { id: 'beach', name: 'Beach Access', icon: <FaUmbrellaBeach />, essential: false },
    { id: 'restaurant', name: 'On-site Restaurant', icon: <FaUtensils />, essential: false },
    { id: 'transport', name: 'Airport Transfer', icon: <FaCar />, essential: false }
  ]
  
  const parkingOptions = [
    { value: ParkingType.No, label: 'No Parking Available', description: 'Street parking only' },
    { value: ParkingType.YesFree, label: 'Free Parking', description: 'Complimentary on-site parking' },
    { value: ParkingType.YesPaid, label: 'Paid Parking', description: 'Secure parking available for a fee' }
  ]
  
  const petPolicyOptions = [
    { value: PetPolicy.No, label: 'No Pets Allowed', description: 'Property is pet-free' },
    { value: PetPolicy.UponRequest, label: 'Pets Upon Request', description: 'Contact host for pet approval' },
    { value: PetPolicy.Yes, label: 'Pets Welcome', description: 'All well-behaved pets are welcome' }
  ]

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc" padding="2rem">
      <Box maxWidth="1400px" margin="0 auto">
        {/* Header */}
        <Box marginBottom="3rem" textAlign="center">
          <Box fontSize="3rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            SelectionPicker Examples
          </Box>
          <Box fontSize="1.25rem" color="#718096" maxWidth="600px" margin="0 auto">
            Comprehensive showcase of the SelectionPicker component with various configurations,
            data types, and styling options for property rental applications.
          </Box>
        </Box>

        {/* Table of Contents */}
        <Box 
          backgroundColor="white" 
          borderRadius="1rem" 
          padding="2rem" 
          marginBottom="3rem"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        >
          <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
            Examples Overview
          </Box>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1rem">
            {[
              { title: 'Single Selection', description: 'User selection with custom rendering' },
              { title: 'Multiple Selection', description: 'Multi-select with categories' },
              { title: 'Property Features', description: 'Essential vs optional features' },
              { title: 'Subscription Plans', description: 'Pricing plans with highlights' },
              { title: 'Property Policies', description: 'Parking and pet policies' },
              { title: 'Team Selection', description: 'Multi-user assignment' }
            ].map((item, index) => (
              <Box
                key={index}
                padding="1rem"
                backgroundColor="#f9fafb"
                borderRadius="0.5rem"
                border="1px solid #e5e7eb"
              >
                <Box fontWeight="600" color="#374151" marginBottom="0.25rem">
                  {item.title}
                </Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  {item.description}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap="3rem">
          {/* Example 1: Single Selection - Users */}
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
            <Box marginBottom="2rem">
              <Box fontSize="1.75rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
                1. Single Selection - User Profiles
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1rem">
                Select a property owner or manager from the user database. Features custom rendering with avatars, roles, and departments.
              </Box>
              <Box fontSize="0.875rem" color="#059669" fontWeight="500">
                Selected: {selectedUserId ? users.find(u => u.id === selectedUserId)?.name : 'None'}
              </Box>
            </Box>
            
            <SelectionPicker
              data={users}
              idAccessor={(user) => user.id}
              value={selectedUserId || ''}
              onChange={(value) => setSelectedUserId(value as number)}
              isMultiSelect={false}
              renderItem={(user, isSelected) => (
                <Box display="flex" alignItems="center" gap="1rem" width="100%">
                  <Box fontSize="2rem" color="#6b7280">{user.avatar}</Box>
                  <Box flex="1">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Box fontWeight={isSelected ? '700' : '500'} color="#1a202c" fontSize="1rem">
                          {user.name}
                        </Box>
                        <Box fontSize="0.875rem" color="#6b7280">
                          {user.email}
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Box 
                          fontSize="0.75rem" 
                          fontWeight="600" 
                          color={user.role === 'Admin' ? '#dc2626' : user.role === 'Property Owner' ? '#059669' : '#3182ce'}
                          backgroundColor={user.role === 'Admin' ? '#fee2e2' : user.role === 'Property Owner' ? '#dcfce7' : '#dbeafe'}
                          padding="0.25rem 0.5rem"
                          borderRadius="0.375rem"
                          marginBottom="0.25rem"
                        >
                          {user.role}
                        </Box>
                        <Box fontSize="0.75rem" color="#9ca3af">
                          {user.department}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
              containerStyles={{
                maxHeight: '400px',
                overflow: 'auto'
              }}
            />
          </Box>

          {/* Example 2: Multiple Selection - Property Categories */}
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
            <Box marginBottom="2rem">
              <Box fontSize="1.75rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
                2. Multiple Selection - Property Categories
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1rem">
                Choose multiple property categories to showcase. Includes disabled items and count information.
              </Box>
              <Box fontSize="0.875rem" color="#059669" fontWeight="500">
                Selected: {selectedCategories.length} categories
                {selectedCategories.length > 0 && (
                  <Box as="span" color="#6b7280" fontWeight="400">
                    {' '}({selectedCategories.map(id => categories.find(c => c.categoryId === id)?.label).join(', ')})
                  </Box>
                )}
              </Box>
            </Box>
            
            <SelectionPicker
              data={categories}
              idAccessor={(category) => category.categoryId}
              value={selectedCategories}
              onChange={(value) => setSelectedCategories(value as string[])}
              isMultiSelect={true}
              isItemDisabled={(category) => category.disabled || false}
              renderItem={(category, isSelected) => (
                <Box display="flex" alignItems="center" gap="1rem" width="100%">
                  <Box fontSize="2.5rem" color="#6b7280">{category.icon}</Box>
                  <Box flex="1">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Box 
                          fontWeight={isSelected ? '700' : '500'} 
                          color={category.disabled ? '#9ca3af' : '#1a202c'}
                          fontSize="1rem"
                        >
                          {category.label}
                          {category.disabled && (
                            <Box as="span" color="#f59e0b" fontSize="0.75rem" marginLeft="0.5rem">
                              (Coming Soon)
                            </Box>
                          )}
                        </Box>
                        <Box fontSize="0.875rem" color="#6b7280">
                          {category.description}
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Box fontSize="1.25rem" fontWeight="700" color="#059669">
                          {category.count}
                        </Box>
                        <Box fontSize="0.75rem" color="#6b7280">
                          properties
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  {isSelected && (
                    <Box color="#10b981" fontSize="1.5rem"><FaCheck /></Box>
                  )}
                </Box>
              )}
              containerStyles={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '1rem'
              }}
            />
          </Box>

          {/* Example 3: Property Features with Grouping */}
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
            <Box marginBottom="2rem">
              <Box fontSize="1.75rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
                3. Property Features - Essential vs Optional
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1rem">
                Select property amenities and features. Essential features are pre-selected and highlighted differently.
              </Box>
              <Box display="flex" gap="2rem" fontSize="0.875rem">
                <Box color="#059669" fontWeight="500">
                  Selected: {selectedFeatures.length} features
                </Box>
                <Box color="#f59e0b" fontWeight="500">
                  Essential: {selectedFeatures.filter(id => propertyFeatures.find(f => f.id === id)?.essential).length}
                </Box>
              </Box>
            </Box>
            
            <SelectionPicker
              data={propertyFeatures}
              idAccessor={(feature) => feature.id}
              value={selectedFeatures}
              onChange={(value) => setSelectedFeatures(value as string[])}
              isMultiSelect={true}
              renderItem={(feature, isSelected) => (
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap="0.75rem" 
                  width="100%"
                  position="relative"
                >
                  {feature.essential && (
                    <Box
                      position="absolute"
                      top="-0.25rem"
                      right="-0.25rem"
                      fontSize="0.625rem"
                      fontWeight="700"
                      color="#f59e0b"
                      backgroundColor="#fef3c7"
                      padding="0.125rem 0.375rem"
                      borderRadius="0.75rem"
                      border="1px solid #fbbf24"
                    >
                      ESSENTIAL
                    </Box>
                  )}
                  <Box fontSize="1.75rem" color="#6b7280">{feature.icon}</Box>
                  <Box 
                    flex="1" 
                    fontWeight={isSelected ? '600' : '400'}
                    color={feature.essential ? '#f59e0b' : '#374151'}
                  >
                    {feature.name}
                  </Box>
                  {isSelected && (
                    <Box color="#10b981" fontSize="1.25rem"><FaCheck /></Box>
                  )}
                </Box>
              )}
              selectedItemStyles={{
                borderColor: '#10b981',
                backgroundColor: '#ecfdf5',
                borderWidth: '2px'
              }}
              containerStyles={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.75rem',
                maxHeight: '400px',
                overflow: 'auto'
              }}
            />
          </Box>

          {/* Example 4: Subscription Plans */}
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
            <Box marginBottom="2rem">
              <Box fontSize="1.75rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
                4. Subscription Plans - Pricing Selection
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1rem">
                Choose a subscription plan for property management. Popular plan is highlighted with special styling.
              </Box>
              <Box fontSize="0.875rem" color="#059669" fontWeight="500">
                Selected: {selectedPlan ? plans.find(p => p.id === selectedPlan)?.name : 'None'}
              </Box>
            </Box>
            
            <SelectionPicker
              data={plans}
              idAccessor={(plan) => plan.id}
              value={selectedPlan}
              onChange={(value) => setSelectedPlan(value as string)}
              isMultiSelect={false}
              renderItem={(plan) => (
                <Box position="relative" width="100%">
                  {plan.popular && (
                    <Box
                      position="absolute"
                      top="-0.5rem"
                      left="50%"
                      transform="translateX(-50%)"
                      fontSize="0.75rem"
                      fontWeight="700"
                      color="white"
                      backgroundColor="#3182ce"
                      padding="0.25rem 1rem"
                      borderRadius="1rem"
                      zIndex={1}
                    >
                      MOST POPULAR
                    </Box>
                  )}
                  <Box padding="1.5rem" textAlign="center">
                    <Box fontSize="1.5rem" fontWeight="700" color="#1a202c" marginBottom="0.5rem">
                      {plan.name}
                    </Box>
                    <Box fontSize="2rem" fontWeight="900" color="#059669" marginBottom="1rem">
                      {plan.price}
                    </Box>
                    <Box display="flex" flexDirection="column" gap="0.5rem">
                      {plan.features.map((feature, index) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          gap="0.5rem"
                          fontSize="0.875rem"
                          color="#374151"
                        >
                          <Box color="#10b981"><FaCheck /></Box>
                          <Box>{feature}</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
              selectedItemStyles={{
                borderColor: '#3182ce',
                backgroundColor: '#dbeafe',
                borderWidth: '3px',
                transform: 'scale(1.02)'
              }}
              itemStyles={{
                borderWidth: '2px',
                borderColor: '#e5e7eb'
              }}
              containerStyles={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}
            />
          </Box>

          {/* Example 5: Property Policies */}
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
            <Box marginBottom="2rem">
              <Box fontSize="1.75rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
                5. Property Policies - Parking & Pets
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1rem">
                Configure property policies using enum-based selections with detailed descriptions.
              </Box>
            </Box>
            
            <Box display="grid" gridTemplateColumns={{ Lg: 'repeat(2, 1fr)' }} gap="2rem">
              {/* Parking Policy */}
              <Box>
                <Box fontSize="1.125rem" fontWeight="600" color="#374151" marginBottom="1rem">
                  Parking Options
                </Box>
                <SelectionPicker
                  data={parkingOptions}
                  idAccessor={(option) => option.value}
                  value={selectedParking}
                  onChange={(value) => setSelectedParking(value as ParkingType)}
                  isMultiSelect={false}
                  renderItem={(option, isSelected) => (
                    <Box>
                      <Box fontWeight={isSelected ? '600' : '400'} color="#1a202c" marginBottom="0.25rem">
                        {option.label}
                      </Box>
                      <Box fontSize="0.75rem" color="#6b7280">
                        {option.description}
                      </Box>
                    </Box>
                  )}
                />
              </Box>

              {/* Pet Policy */}
              <Box>
                <Box fontSize="1.125rem" fontWeight="600" color="#374151" marginBottom="1rem">
                  Pet Policy
                </Box>
                <SelectionPicker
                  data={petPolicyOptions}
                  idAccessor={(option) => option.value}
                  value={selectedPetPolicy}
                  onChange={(value) => setSelectedPetPolicy(value as PetPolicy)}
                  isMultiSelect={false}
                  renderItem={(option, isSelected) => (
                    <Box>
                      <Box fontWeight={isSelected ? '600' : '400'} color="#1a202c" marginBottom="0.25rem">
                        {option.label}
                      </Box>
                      <Box fontSize="0.75rem" color="#6b7280">
                        {option.description}
                      </Box>
                    </Box>
                  )}
                />
              </Box>
            </Box>
          </Box>

          {/* Example 6: Team Selection */}
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
            <Box marginBottom="2rem">
              <Box fontSize="1.75rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
                6. Team Selection - Multi-User Assignment
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1rem">
                Assign multiple team members to a property management task with role-based styling.
              </Box>
              <Box fontSize="0.875rem" color="#059669" fontWeight="500">
                Assigned: {selectedUsers.length} team members
              </Box>
            </Box>
            
            <SelectionPicker
              data={users}
              idAccessor={(user) => user.id}
              value={selectedUsers}
              onChange={(value) => setSelectedUsers(value as number[])}
              isMultiSelect={true}
              renderItem={(user, isSelected) => (
                <Box display="flex" alignItems="center" gap="0.75rem" width="100%">
                  <Box fontSize="1.5rem" color="#6b7280">{user.avatar}</Box>
                  <Box flex="1">
                    <Box fontWeight={isSelected ? '600' : '400'} color="#1a202c">
                      {user.name}
                    </Box>
                    <Box fontSize="0.75rem" color="#6b7280">
                      {user.role} • {user.department}
                    </Box>
                  </Box>
                  {isSelected && (
                    <Box 
                      color="white" 
                      backgroundColor="#059669"
                      borderRadius="50%"
                      width="1.5rem"
                      height="1.5rem"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="0.75rem"
                      fontWeight="700"
                    >
                      <FaCheck />
                    </Box>
                  )}
                </Box>
              )}
              containerStyles={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '0.75rem'
              }}
            />
          </Box>

          {/* Summary Card */}
          <Box backgroundColor="white" borderRadius="1rem" padding="2rem" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
            <Box fontSize="1.75rem" fontWeight="600" color="#1a202c" marginBottom="1.5rem">
              Current Selections Summary
            </Box>
            <Box display="grid" gridTemplateColumns={{ Md: 'repeat(2, 1fr)' }} gap="1.5rem">
              <Box>
                <Box fontSize="1rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
                  Single Selections
                </Box>
                <Box display="flex" flexDirection="column" gap="0.5rem" fontSize="0.875rem" color="#6b7280">
                  <Box>
                    <Box as="span" fontWeight="500">User:</Box> {selectedUserId ? users.find(u => u.id === selectedUserId)?.name : 'None'}
                  </Box>
                  <Box>
                    <Box as="span" fontWeight="500">Plan:</Box> {selectedPlan || 'None'}
                  </Box>
                  <Box>
                    <Box as="span" fontWeight="500">Parking:</Box> {parkingOptions.find(p => p.value === selectedParking)?.label}
                  </Box>
                  <Box>
                    <Box as="span" fontWeight="500">Pet Policy:</Box> {petPolicyOptions.find(p => p.value === selectedPetPolicy)?.label}
                  </Box>
                </Box>
              </Box>
              <Box>
                <Box fontSize="1rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
                  Multiple Selections
                </Box>
                <Box display="flex" flexDirection="column" gap="0.5rem" fontSize="0.875rem" color="#6b7280">
                  <Box>
                    <Box as="span" fontWeight="500">Categories:</Box> {selectedCategories.length} selected
                  </Box>
                  <Box>
                    <Box as="span" fontWeight="500">Features:</Box> {selectedFeatures.length} selected
                  </Box>
                  <Box>
                    <Box as="span" fontWeight="500">Team Members:</Box> {selectedUsers.length} assigned
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default SelectionPickerExamples