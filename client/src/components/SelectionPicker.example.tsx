import { useState } from 'react'
import SelectionPicker from './SelectionPicker'
import { Box } from './Box'

// Example data types
interface User {
  id: number
  name: string
  email: string
  role: string
}

interface Category {
  categoryId: string
  label: string
  icon: string
  disabled?: boolean
}

/**
 * Example usage of the SelectionPicker component
 */
export function SelectionPickerExamples() {
  // Single selection example state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  
  // Multiple selection example state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Example data
  const users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' }
  ]
  
  const categories: Category[] = [
    { categoryId: 'cat-1', label: 'Electronics', icon: '💻' },
    { categoryId: 'cat-2', label: 'Clothing', icon: '👕' },
    { categoryId: 'cat-3', label: 'Books', icon: '📚' },
    { categoryId: 'cat-4', label: 'Home & Garden', icon: '🏡' },
    { categoryId: 'cat-5', label: 'Sports', icon: '⚽', disabled: true }
  ]
  
  return (
    <Box padding="2rem" backgroundColor="#f8fafc" minHeight="100vh">
      <Box maxWidth="1200px" margin="0 auto">
        <Box fontSize="2rem" fontWeight="bold" marginBottom="2rem" color="#1a202c">
          SelectionPicker Component Examples
        </Box>
        
        {/* Example 1: Single Selection with Users */}
        <Box marginBottom="3rem">
          <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
            Example 1: Single Selection (Users)
          </Box>
          <Box fontSize="0.875rem" color="#718096" marginBottom="1rem">
            Select one user from the list. Current selection: {selectedUserId ? `User ID ${selectedUserId}` : 'None'}
          </Box>
          
          <SelectionPicker
            data={users}
            idAccessor={(user) => user.id}
            value={selectedUserId || ''}
            onChange={(value) => setSelectedUserId(value as number)}
            isMultiSelect={false}
            labelAccessor={(user) => user.name}
            renderItem={(user, isSelected) => (
              <Box display="flex" alignItems="center" width="100%">
                <Box
                  as="span"
                  marginRight="0.5rem"
                  width="1.25rem"
                  height="1.25rem"
                  border={`2px solid ${isSelected ? '#3182ce' : '#d1d5db'}`}
                  borderRadius="50%"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {isSelected && (
                    <Box
                      as="span"
                      width="0.5rem"
                      height="0.5rem"
                      backgroundColor="#3182ce"
                      borderRadius="50%"
                    />
                  )}
                </Box>
                <Box flex="1">
                  <Box fontWeight={isSelected ? '600' : '400'} color="#1a202c">
                    {user.name}
                  </Box>
                  <Box fontSize="0.75rem" color="#718096">
                    {user.email} • {user.role}
                  </Box>
                </Box>
              </Box>
            )}
          />
        </Box>
        
        {/* Example 2: Multiple Selection with Categories */}
        <Box marginBottom="3rem">
          <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
            Example 2: Multiple Selection (Categories)
          </Box>
          <Box fontSize="0.875rem" color="#718096" marginBottom="1rem">
            Select multiple categories. Selected: {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'None'}
          </Box>
          
          <SelectionPicker
            data={categories}
            idAccessor={(category) => category.categoryId}
            value={selectedCategories}
            onChange={(value) => setSelectedCategories(value as string[])}
            isMultiSelect={true}
            isItemDisabled={(category) => category.disabled || false}
            renderItem={(category, isSelected) => (
              <Box display="flex" alignItems="center" width="100%">
                <Box
                  as="span"
                  marginRight="0.5rem"
                  width="1.25rem"
                  height="1.25rem"
                  border={`2px solid ${isSelected ? '#3182ce' : '#d1d5db'}`}
                  borderRadius="0.25rem"
                  backgroundColor={isSelected ? '#3182ce' : 'transparent'}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="0.75rem"
                >
                  {isSelected && '✓'}
                </Box>
                <Box as="span" fontSize="1.5rem" marginRight="0.75rem">
                  {category.icon}
                </Box>
                <Box flex="1">
                  <Box 
                    fontWeight={isSelected ? '600' : '400'} 
                    color={category.disabled ? '#9ca3af' : '#1a202c'}
                  >
                    {category.label}
                    {category.disabled && ' (Unavailable)'}
                  </Box>
                </Box>
              </Box>
            )}
          />
        </Box>
        
        {/* Example 3: Simple Selection with Default Rendering */}
        <Box marginBottom="3rem">
          <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
            Example 3: Simple Selection with Default Rendering
          </Box>
          <Box fontSize="0.875rem" color="#718096" marginBottom="1rem">
            Using default item rendering with minimal configuration
          </Box>
          
          <SelectionPicker
            data={['Option A', 'Option B', 'Option C', 'Option D']}
            idAccessor={(item) => item}
            value={selectedCategories.includes('Option A') ? 'Option A' : ''}
            onChange={(value) => console.log('Selected:', value)}
            isMultiSelect={false}
            containerStyles={{
              maxWidth: '300px'
            }}
          />
        </Box>
        
        {/* Example 4: Styled Selection */}
        <Box>
          <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#2d3748">
            Example 4: Custom Styled Selection
          </Box>
          <Box fontSize="0.875rem" color="#718096" marginBottom="1rem">
            Selection with custom colors and styles
          </Box>
          
          <SelectionPicker
            data={[
              { id: 'premium', name: 'Premium Plan', price: '$99/mo' },
              { id: 'standard', name: 'Standard Plan', price: '$49/mo' },
              { id: 'basic', name: 'Basic Plan', price: '$19/mo' }
            ]}
            idAccessor={(item) => item.id}
            value={'standard'}
            onChange={(value) => console.log('Plan selected:', value)}
            isMultiSelect={false}
            itemStyles={{
              backgroundColor: '#f0f9ff',
              borderColor: '#bae6fd'
            }}
            selectedItemStyles={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              borderColor: '#0284c7'
            }}
            renderItem={(plan) => (
              <Box display="flex" justifyContent="space-between" width="100%">
                <Box>
                  <Box fontWeight="600">{plan.name}</Box>
                </Box>
                <Box fontWeight="bold" fontSize="1.125rem">
                  {plan.price}
                </Box>
              </Box>
            )}
            containerStyles={{
              maxWidth: '400px'
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default SelectionPickerExamples