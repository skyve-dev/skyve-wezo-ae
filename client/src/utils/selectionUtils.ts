/**
 * Utility functions for determining optimal selection UI patterns
 * based on dataset size and mobile responsiveness
 */

/**
 * Threshold for determining when to use inline SelectionPicker vs SlidingDrawer
 * Small datasets (≤ threshold) use inline SelectionPicker
 * Large datasets (> threshold) use SlidingDrawer with SelectionPicker inside
 */
export const SELECTION_SIZE_THRESHOLD = 7

/**
 * Determines whether to use inline selection or drawer-based selection
 * based on the number of options available
 * 
 * @param optionCount - Number of options to display
 * @param isMobile - Whether the current device is mobile (optional, auto-detected if not provided)
 * @returns 'inline' for direct SelectionPicker, 'drawer' for SlidingDrawer approach
 */
export function getSelectionPattern(optionCount: number, isMobile?: boolean): 'inline' | 'drawer' {
  // Auto-detect mobile if not provided
  if (isMobile === undefined) {
    isMobile = window.innerWidth < 768 // md breakpoint
  }
  
  // On mobile, use drawer for more than 5 items to save screen space
  if (isMobile && optionCount > 5) {
    return 'drawer'
  }
  
  // On desktop, use threshold of 7 items
  return optionCount <= SELECTION_SIZE_THRESHOLD ? 'inline' : 'drawer'
}

/**
 * UAE Emirates data for location selection
 * Small dataset (7 items) - will use inline SelectionPicker
 */
export const UAE_EMIRATES = [
  { id: 'abu-dhabi', name: 'Abu Dhabi', arabicName: 'أبو ظبي' },
  { id: 'dubai', name: 'Dubai', arabicName: 'دبي' },
  { id: 'sharjah', name: 'Sharjah', arabicName: 'الشارقة' },
  { id: 'ajman', name: 'Ajman', arabicName: 'عجمان' },
  { id: 'umm-al-quwain', name: 'Umm Al Quwain', arabicName: 'أم القيوين' },
  { id: 'ras-al-khaimah', name: 'Ras Al Khaimah', arabicName: 'رأس الخيمة' },
  { id: 'fujairah', name: 'Fujairah', arabicName: 'الفجيرة' }
]

/**
 * Property amenities data for amenities selection
 * Large dataset (32+ items) - will use SlidingDrawer
 */
export const PROPERTY_AMENITIES = [
  // Basic Amenities (8 items)
  { id: 'wifi', name: 'WiFi', category: 'Basic', essential: true },
  { id: 'air-conditioning', name: 'Air Conditioning', category: 'Basic', essential: true },
  { id: 'kitchen', name: 'Kitchen', category: 'Basic', essential: true },
  { id: 'free-parking', name: 'Free Parking', category: 'Basic', essential: false },
  { id: 'washer', name: 'Washer', category: 'Basic', essential: false },
  { id: 'dryer', name: 'Dryer', category: 'Basic', essential: false },
  { id: 'tv', name: 'TV', category: 'Basic', essential: false },
  { id: 'heating', name: 'Heating', category: 'Basic', essential: false },
  
  // Features (10 items)
  { id: 'pool', name: 'Swimming Pool', category: 'Features', essential: false },
  { id: 'hot-tub', name: 'Hot Tub', category: 'Features', essential: false },
  { id: 'gym', name: 'Gym/Fitness Center', category: 'Features', essential: false },
  { id: 'bbq-grill', name: 'BBQ Grill', category: 'Features', essential: false },
  { id: 'fire-pit', name: 'Fire Pit', category: 'Features', essential: false },
  { id: 'outdoor-furniture', name: 'Outdoor Furniture', category: 'Features', essential: false },
  { id: 'indoor-fireplace', name: 'Indoor Fireplace', category: 'Features', essential: false },
  { id: 'piano', name: 'Piano', category: 'Features', essential: false },
  { id: 'balcony', name: 'Balcony/Terrace', category: 'Features', essential: false },
  { id: 'garden', name: 'Garden/Yard', category: 'Features', essential: false },
  
  // Location & Views (8 items)
  { id: 'beachfront', name: 'Beachfront', category: 'Location', essential: false },
  { id: 'waterfront', name: 'Waterfront', category: 'Location', essential: false },
  { id: 'mountain-view', name: 'Mountain View', category: 'Location', essential: false },
  { id: 'ocean-view', name: 'Ocean View', category: 'Location', essential: false },
  { id: 'lake-view', name: 'Lake View', category: 'Location', essential: false },
  { id: 'city-view', name: 'City View', category: 'Location', essential: false },
  { id: 'garden-view', name: 'Garden View', category: 'Location', essential: false },
  { id: 'desert-view', name: 'Desert View', category: 'Location', essential: false },
  
  // Safety & Security (8 items)
  { id: 'smoke-alarm', name: 'Smoke Alarm', category: 'Safety', essential: true },
  { id: 'carbon-monoxide-alarm', name: 'Carbon Monoxide Alarm', category: 'Safety', essential: true },
  { id: 'first-aid-kit', name: 'First Aid Kit', category: 'Safety', essential: false },
  { id: 'fire-extinguisher', name: 'Fire Extinguisher', category: 'Safety', essential: true },
  { id: 'security-cameras', name: 'Security Cameras (exterior)', category: 'Safety', essential: false },
  { id: 'lockbox', name: 'Lockbox', category: 'Safety', essential: false },
  { id: 'safe', name: 'Safe', category: 'Safety', essential: false },
  { id: 'private-entrance', name: 'Private Entrance', category: 'Safety', essential: false }
]

/**
 * Common selection configurations for different field types
 */
export const SELECTION_CONFIGS = {
  // Small datasets - use inline SelectionPicker
  emirates: {
    data: UAE_EMIRATES,
    pattern: 'inline' as const,
    singleSelect: true
  },
  
  parking: {
    data: [
      { id: 'free', name: 'Yes, Free Parking', description: 'Complimentary on-site parking' },
      { id: 'paid', name: 'Yes, Paid Parking', description: 'Secure parking available for a fee' },
      { id: 'none', name: 'No Parking Available', description: 'Street parking only' }
    ],
    pattern: 'inline' as const,
    singleSelect: true
  },
  
  petPolicy: {
    data: [
      { id: 'allowed', name: 'Pets Welcome', description: 'All well-behaved pets are welcome' },
      { id: 'request', name: 'Pets Upon Request', description: 'Contact host for pet approval' },
      { id: 'none', name: 'No Pets Allowed', description: 'Property is pet-free' }
    ],
    pattern: 'inline' as const,
    singleSelect: true
  },
  
  bookingType: {
    data: [
      { id: 'instant', name: 'Instant Book', description: 'Guests can book immediately' },
      { id: 'request', name: 'Request to Book', description: 'You approve each booking' }
    ],
    pattern: 'inline' as const,
    singleSelect: true
  },
  
  // Large datasets - use SlidingDrawer
  amenities: {
    data: PROPERTY_AMENITIES,
    pattern: 'drawer' as const,
    singleSelect: false
  }
} as const

/**
 * Helper function to get responsive grid columns based on item count and screen size
 */
export function getResponsiveColumns(itemCount: number, pattern: 'inline' | 'drawer'): string {
  if (pattern === 'drawer') {
    // In drawer, use more compact layout
    return 'repeat(auto-fit, minmax(280px, 1fr))'
  }
  
  // For inline selection, adapt to item count
  if (itemCount <= 3) {
    return 'repeat(auto-fit, minmax(200px, 1fr))'
  } else if (itemCount <= 6) {
    return 'repeat(auto-fit, minmax(160px, 1fr))'
  } else {
    return 'repeat(auto-fit, minmax(140px, 1fr))'
  }
}

/**
 * Helper to determine if we should show a search box for the dataset
 */
export function shouldShowSearch(itemCount: number): boolean {
  return itemCount >= 10
}

/**
 * Helper to determine drawer height based on content
 */
export function getDrawerHeight(itemCount: number): string {
  if (itemCount <= 10) return 'auto'
  if (itemCount <= 20) return '70vh'
  return '80vh'
}