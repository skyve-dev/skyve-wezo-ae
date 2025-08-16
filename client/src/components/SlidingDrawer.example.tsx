import { useState } from 'react'
import SlidingDrawer from './SlidingDrawer'
import SelectionPicker from './SelectionPicker'
import { Box } from './Box'

/**
 * Example usage of the SlidingDrawer component showcasing various configurations
 */
export function SlidingDrawerExamples() {
  // State for different drawer examples
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [topDrawerOpen, setTopDrawerOpen] = useState(false)
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  
  // Selection state for mobile drawer example
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    notifications: false
  })
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'help', label: 'Help & Support', icon: '❓' },
    { id: 'logout', label: 'Logout', icon: '🚪' }
  ]
  
  const categories = [
    { id: 'electronics', name: 'Electronics', count: 145 },
    { id: 'clothing', name: 'Clothing & Fashion', count: 89 },
    { id: 'home', name: 'Home & Garden', count: 234 },
    { id: 'sports', name: 'Sports & Outdoors', count: 167 },
    { id: 'books', name: 'Books & Media', count: 423 },
    { id: 'toys', name: 'Toys & Games', count: 78 }
  ]
  
  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc" padding="2rem">
      <Box maxWidth="1200px" margin="0 auto">
        <Box fontSize="2rem" fontWeight="bold" marginBottom="2rem" color="#1a202c">
          SlidingDrawer Component Examples
        </Box>
        
        {/* Example Controls Grid */}
        <Box 
          display="grid" 
          gridTemplateColumns={{ Sm: '1fr', Md: 'repeat(2, 1fr)', Lg: 'repeat(3, 1fr)' }}
          gap="1rem"
          marginBottom="2rem"
        >
          {/* Left Drawer Example */}
          <Box
            backgroundColor="white"
            borderRadius="0.5rem"
            padding="1.5rem"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
              Left Navigation Drawer
            </Box>
            <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
              Classic navigation menu sliding from left
            </Box>
            <Box
              as="button"
              onClick={() => setLeftDrawerOpen(true)}
              padding="0.75rem 1.5rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#2563eb' }}
            >
              Open Left Drawer
            </Box>
          </Box>
          
          {/* Right Drawer Example */}
          <Box
            backgroundColor="white"
            borderRadius="0.5rem"
            padding="1.5rem"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
              Right Details Panel
            </Box>
            <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
              Details panel sliding from right
            </Box>
            <Box
              as="button"
              onClick={() => setRightDrawerOpen(true)}
              padding="0.75rem 1.5rem"
              backgroundColor="#10b981"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#059669' }}
            >
              Open Right Drawer
            </Box>
          </Box>
          
          {/* Top Drawer Example */}
          <Box
            backgroundColor="white"
            borderRadius="0.5rem"
            padding="1.5rem"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
              Top Notification Bar
            </Box>
            <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
              Notification panel from top
            </Box>
            <Box
              as="button"
              onClick={() => setTopDrawerOpen(true)}
              padding="0.75rem 1.5rem"
              backgroundColor="#f59e0b"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#d97706' }}
            >
              Open Top Drawer
            </Box>
          </Box>
          
          {/* Bottom Drawer Example */}
          <Box
            backgroundColor="white"
            borderRadius="0.5rem"
            padding="1.5rem"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
              Bottom Sheet
            </Box>
            <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
              Mobile-style bottom sheet
            </Box>
            <Box
              as="button"
              onClick={() => setBottomDrawerOpen(true)}
              padding="0.75rem 1.5rem"
              backgroundColor="#8b5cf6"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#7c3aed' }}
            >
              Open Bottom Sheet
            </Box>
          </Box>
          
          {/* Mobile Selection Example */}
          <Box
            backgroundColor="white"
            borderRadius="0.5rem"
            padding="1.5rem"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
              Mobile Selection
            </Box>
            <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
              Selection picker in drawer
            </Box>
            <Box
              as="button"
              onClick={() => setMobileDrawerOpen(true)}
              padding="0.75rem 1.5rem"
              backgroundColor="#ec4899"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#db2777' }}
            >
              Select Categories
            </Box>
          </Box>
          
          {/* Form Drawer Example */}
          <Box
            backgroundColor="white"
            borderRadius="0.5rem"
            padding="1.5rem"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
              Form Drawer
            </Box>
            <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
              Complex form in drawer
            </Box>
            <Box
              as="button"
              onClick={() => setFormDrawerOpen(true)}
              padding="0.75rem 1.5rem"
              backgroundColor="#06b6d4"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#0891b2' }}
            >
              Open Form
            </Box>
          </Box>
        </Box>
        
        {/* Current Selection Display */}
        {selectedItems.length > 0 && (
          <Box
            backgroundColor="white"
            borderRadius="0.5rem"
            padding="1rem"
            marginTop="1rem"
          >
            <Box fontSize="0.875rem" fontWeight="600" marginBottom="0.5rem">
              Selected Categories:
            </Box>
            <Box display="flex" flexWrap="wrap" gap="0.5rem">
              {selectedItems.map(id => {
                const category = categories.find(c => c.id === id)
                return category ? (
                  <Box
                    key={id}
                    padding="0.25rem 0.75rem"
                    backgroundColor="#dbeafe"
                    color="#1e40af"
                    borderRadius="1rem"
                    fontSize="0.875rem"
                  >
                    {category.name}
                  </Box>
                ) : null
              })}
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Left Navigation Drawer */}
      <SlidingDrawer
        isOpen={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        side="left"
        width="280px"
        showCloseButton
      >
        <Box padding="1.5rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="2rem" color="#1a202c">
            Navigation Menu
          </Box>
          <Box display="flex" flexDirection="column" gap="0.25rem">
            {menuItems.map((item) => (
              <Box
                key={item.id}
                as="button"
                display="flex"
                alignItems="center"
                gap="1rem"
                padding="0.75rem 1rem"
                backgroundColor="transparent"
                border="none"
                borderRadius="0.375rem"
                cursor="pointer"
                width="100%"
                textAlign="left"
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={() => {
                  console.log(`Clicked ${item.label}`)
                  setLeftDrawerOpen(false)
                }}
              >
                <Box fontSize="1.25rem">{item.icon}</Box>
                <Box fontSize="1rem" color="#374151">
                  {item.label}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </SlidingDrawer>
      
      {/* Right Details Panel */}
      <SlidingDrawer
        isOpen={rightDrawerOpen}
        onClose={() => setRightDrawerOpen(false)}
        side="right"
        width="400px"
        showCloseButton
      >
        <Box padding="2rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1rem">
            Property Details
          </Box>
          <Box display="flex" flexDirection="column" gap="1.5rem">
            <Box>
              <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                Property Name
              </Box>
              <Box fontSize="1rem" fontWeight="500">
                Luxury Villa with Ocean View
              </Box>
            </Box>
            <Box>
              <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                Location
              </Box>
              <Box fontSize="1rem" fontWeight="500">
                Dubai Marina, UAE
              </Box>
            </Box>
            <Box>
              <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                Price
              </Box>
              <Box fontSize="1.5rem" fontWeight="bold" color="#10b981">
                AED 1,500/night
              </Box>
            </Box>
            <Box>
              <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.5rem">
                Description
              </Box>
              <Box fontSize="0.875rem" color="#374151" lineHeight="1.5">
                Experience luxury living in this stunning oceanfront villa featuring 
                panoramic views, private beach access, and world-class amenities. 
                Perfect for families or groups seeking an unforgettable vacation experience.
              </Box>
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
      
      {/* Top Notification Drawer */}
      <SlidingDrawer
        isOpen={topDrawerOpen}
        onClose={() => setTopDrawerOpen(false)}
        side="top"
        height="auto"
        showCloseButton
        backgroundColor="#fef3c7"
      >
        <Box padding="2rem">
          <Box display="flex" alignItems="center" gap="1rem">
            <Box fontSize="2rem">⚠️</Box>
            <Box flex="1">
              <Box fontSize="1.125rem" fontWeight="600" color="#92400e" marginBottom="0.25rem">
                Important Notice
              </Box>
              <Box fontSize="0.875rem" color="#78350f">
                System maintenance scheduled for tonight at 11:00 PM UTC. 
                Services may be temporarily unavailable.
              </Box>
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
      
      {/* Bottom Sheet */}
      <SlidingDrawer
        isOpen={bottomDrawerOpen}
        onClose={() => setBottomDrawerOpen(false)}
        side="bottom"
        height="auto"
        showCloseButton
      >
        <Box padding="2rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1.5rem">
            Share Property
          </Box>
          <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="1rem">
            {[
              { icon: '📧', label: 'Email' },
              { icon: '💬', label: 'WhatsApp' },
              { icon: '📘', label: 'Facebook' },
              { icon: '🐦', label: 'Twitter' },
              { icon: '📷', label: 'Instagram' },
              { icon: '🔗', label: 'Copy Link' },
              { icon: '💾', label: 'Save' },
              { icon: '🖨️', label: 'Print' }
            ].map((item) => (
              <Box
                key={item.label}
                as="button"
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap="0.5rem"
                padding="1rem"
                backgroundColor="#f3f4f6"
                border="none"
                borderRadius="0.5rem"
                cursor="pointer"
                whileHover={{ backgroundColor: '#e5e7eb' }}
                onClick={() => {
                  console.log(`Share via ${item.label}`)
                  setBottomDrawerOpen(false)
                }}
              >
                <Box fontSize="2rem">{item.icon}</Box>
                <Box fontSize="0.75rem" color="#374151">
                  {item.label}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </SlidingDrawer>
      
      {/* Mobile Selection Drawer */}
      <SlidingDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        side="bottom"
        height="80vh"
        showCloseButton
      >
        <Box padding="1.5rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="0.5rem">
            Select Categories
          </Box>
          <Box fontSize="0.875rem" color="#6b7280" marginBottom="1.5rem">
            Choose categories to filter results
          </Box>
          
          <SelectionPicker
            data={categories}
            idAccessor={(cat) => cat.id}
            value={selectedItems}
            onChange={(value) => setSelectedItems(value as string[])}
            isMultiSelect={true}
            renderItem={(category, isSelected) => (
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Box fontWeight={isSelected ? '600' : '400'}>
                    {category.name}
                  </Box>
                  <Box fontSize="0.75rem" color="#6b7280">
                    {category.count} items
                  </Box>
                </Box>
                {isSelected && (
                  <Box color="#10b981" fontSize="1.25rem">✓</Box>
                )}
              </Box>
            )}
          />
          
          <Box
            display="flex"
            gap="1rem"
            marginTop="2rem"
            paddingTop="1rem"
            borderTop="1px solid #e5e7eb"
          >
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => setSelectedItems([])}
            >
              Clear All
            </Box>
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => setMobileDrawerOpen(false)}
            >
              Apply ({selectedItems.length})
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
      
      {/* Form Drawer */}
      <SlidingDrawer
        isOpen={formDrawerOpen}
        onClose={() => setFormDrawerOpen(false)}
        side="right"
        width="500px"
        showCloseButton
      >
        <Box padding="2rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="2rem">
            Add New Property
          </Box>
          
          <Box as="form" display="flex" flexDirection="column" gap="1.5rem">
            <Box>
              <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block">
                Property Name *
              </Box>
              <Box
                as="input"
                type="text"
                value={formData.name}
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.375rem"
                fontSize="1rem"
              />
            </Box>
            
            <Box>
              <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block">
                Email *
              </Box>
              <Box
                as="input"
                type="email"
                value={formData.email}
                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.375rem"
                fontSize="1rem"
              />
            </Box>
            
            <Box>
              <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block">
                Category
              </Box>
              <Box
                as="select"
                value={formData.category}
                onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.375rem"
                fontSize="1rem"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap="0.5rem">
              <Box
                as="input"
                type="checkbox"
                id="notifications"
                checked={formData.notifications}
                onChange={(e: any) => setFormData({ ...formData, notifications: e.target.checked })}
              />
              <Box as="label" htmlFor="notifications" fontSize="0.875rem">
                Send me email notifications
              </Box>
            </Box>
            
            <Box
              display="flex"
              gap="1rem"
              marginTop="1rem"
              paddingTop="1rem"
              borderTop="1px solid #e5e7eb"
            >
              <Box
                as="button"
                type="button"
                flex="1"
                padding="0.75rem"
                backgroundColor="#f3f4f6"
                color="#374151"
                border="none"
                borderRadius="0.375rem"
                cursor="pointer"
                onClick={() => setFormDrawerOpen(false)}
              >
                Cancel
              </Box>
              <Box
                as="button"
                type="submit"
                flex="1"
                padding="0.75rem"
                backgroundColor="#10b981"
                color="white"
                border="none"
                borderRadius="0.375rem"
                cursor="pointer"
                onClick={(e: any) => {
                  e.preventDefault()
                  console.log('Form submitted:', formData)
                  setFormDrawerOpen(false)
                }}
              >
                Submit
              </Box>
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
    </Box>
  )
}

export default SlidingDrawerExamples