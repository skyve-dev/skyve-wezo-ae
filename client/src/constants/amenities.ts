export interface AmenityOption {
  id: string
  name: string
  category: string
  icon?: string
}

// Common property amenities organized by category
export const AVAILABLE_AMENITIES: AmenityOption[] = [
  // Technology & Connectivity
  { id: 'wifi', name: 'Wi-Fi', category: 'Technology', icon: '📶' },
  { id: 'tv', name: 'TV', category: 'Technology', icon: '📺' },
  { id: 'cable', name: 'Cable TV', category: 'Technology', icon: '📡' },
  { id: 'netflix', name: 'Netflix', category: 'Technology', icon: '🎬' },
  { id: 'sound-system', name: 'Sound System', category: 'Technology', icon: '🔊' },
  { id: 'workspace', name: 'Dedicated Workspace', category: 'Technology', icon: '💻' },

  // Kitchen & Dining
  { id: 'kitchen', name: 'Kitchen', category: 'Kitchen & Dining', icon: '🍳' },
  { id: 'full-kitchen', name: 'Full Kitchen', category: 'Kitchen & Dining', icon: '👨‍🍳' },
  { id: 'kitchenette', name: 'Kitchenette', category: 'Kitchen & Dining', icon: '🥘' },
  { id: 'microwave', name: 'Microwave', category: 'Kitchen & Dining', icon: '⏰' },
  { id: 'refrigerator', name: 'Refrigerator', category: 'Kitchen & Dining', icon: '🧊' },
  { id: 'dishwasher', name: 'Dishwasher', category: 'Kitchen & Dining', icon: '🍽️' },
  { id: 'coffee-maker', name: 'Coffee Maker', category: 'Kitchen & Dining', icon: '☕' },
  { id: 'dining-table', name: 'Dining Table', category: 'Kitchen & Dining', icon: '🍽️' },

  // Recreation & Pool
  { id: 'pool', name: 'Pool', category: 'Recreation', icon: '🏊' },
  { id: 'private-pool', name: 'Private Pool', category: 'Recreation', icon: '🏊‍♀️' },
  { id: 'shared-pool', name: 'Shared Pool', category: 'Recreation', icon: '🌊' },
  { id: 'hot-tub', name: 'Hot Tub', category: 'Recreation', icon: '🛁' },
  { id: 'jacuzzi', name: 'Jacuzzi', category: 'Recreation', icon: '♨️' },
  { id: 'gym', name: 'Gym', category: 'Recreation', icon: '💪' },
  { id: 'tennis-court', name: 'Tennis Court', category: 'Recreation', icon: '🎾' },
  { id: 'basketball-court', name: 'Basketball Court', category: 'Recreation', icon: '🏀' },
  { id: 'playground', name: 'Playground', category: 'Recreation', icon: '🎪' },
  { id: 'games-room', name: 'Games Room', category: 'Recreation', icon: '🎮' },

  // Outdoor & Views
  { id: 'balcony', name: 'Balcony', category: 'Outdoor & Views', icon: '🏢' },
  { id: 'terrace', name: 'Terrace', category: 'Outdoor & Views', icon: '🌅' },
  { id: 'garden', name: 'Garden', category: 'Outdoor & Views', icon: '🌻' },
  { id: 'patio', name: 'Patio', category: 'Outdoor & Views', icon: '🏡' },
  { id: 'bbq', name: 'BBQ Grill', category: 'Outdoor & Views', icon: '🔥' },
  { id: 'outdoor-dining', name: 'Outdoor Dining Area', category: 'Outdoor & Views', icon: '🍽️' },
  { id: 'sea-view', name: 'Sea View', category: 'Outdoor & Views', icon: '🌊' },
  { id: 'mountain-view', name: 'Mountain View', category: 'Outdoor & Views', icon: '⛰️' },
  { id: 'city-view', name: 'City View', category: 'Outdoor & Views', icon: '🏙️' },
  { id: 'garden-view', name: 'Garden View', category: 'Outdoor & Views', icon: '🌳' },

  // Comfort & Climate
  { id: 'air-conditioning', name: 'Air Conditioning', category: 'Comfort & Climate', icon: '❄️' },
  { id: 'heating', name: 'Heating', category: 'Comfort & Climate', icon: '🔥' },
  { id: 'fireplace', name: 'Fireplace', category: 'Comfort & Climate', icon: '🔥' },
  { id: 'fan', name: 'Ceiling Fan', category: 'Comfort & Climate', icon: '💨' },

  // Laundry & Cleaning
  { id: 'washing-machine', name: 'Washing Machine', category: 'Laundry & Cleaning', icon: '🧺' },
  { id: 'dryer', name: 'Dryer', category: 'Laundry & Cleaning', icon: '🌪️' },
  { id: 'iron', name: 'Iron', category: 'Laundry & Cleaning', icon: '👔' },
  { id: 'vacuum', name: 'Vacuum Cleaner', category: 'Laundry & Cleaning', icon: '🧹' },
  { id: 'cleaning-service', name: 'Cleaning Service', category: 'Laundry & Cleaning', icon: '🧽' },

  // Safety & Security
  { id: 'smoke-detector', name: 'Smoke Detector', category: 'Safety & Security', icon: '🚨' },
  { id: 'carbon-monoxide', name: 'Carbon Monoxide Detector', category: 'Safety & Security', icon: '⚠️' },
  { id: 'security-system', name: 'Security System', category: 'Safety & Security', icon: '🔒' },
  { id: 'safe', name: 'Safe', category: 'Safety & Security', icon: '🔐' },
  { id: 'security-cameras', name: 'Security Cameras (exterior)', category: 'Safety & Security', icon: '📹' },
  { id: '24-hour-security', name: '24-hour Security', category: 'Safety & Security', icon: '👮' },

  // Transportation & Access
  { id: 'free-parking', name: 'Free Parking', category: 'Transportation & Access', icon: '🚗' },
  { id: 'paid-parking', name: 'Paid Parking', category: 'Transportation & Access', icon: '💰' },
  { id: 'garage', name: 'Garage', category: 'Transportation & Access', icon: '🏢' },
  { id: 'elevator', name: 'Elevator', category: 'Transportation & Access', icon: '🛗' },
  { id: 'wheelchair-accessible', name: 'Wheelchair Accessible', category: 'Transportation & Access', icon: '♿' },
  { id: 'step-free-access', name: 'Step-free Access', category: 'Transportation & Access', icon: '🚪' },

  // Family & Child-Friendly
  { id: 'crib', name: 'Crib', category: 'Family & Child-Friendly', icon: '👶' },
  { id: 'high-chair', name: 'High Chair', category: 'Family & Child-Friendly', icon: '🪑' },
  { id: 'baby-bath', name: 'Baby Bath', category: 'Family & Child-Friendly', icon: '🛁' },
  { id: 'child-safety-gates', name: 'Child Safety Gates', category: 'Family & Child-Friendly', icon: '🚧' },
  { id: 'toys', name: 'Toys', category: 'Family & Child-Friendly', icon: '🧸' },
  { id: 'books-games', name: 'Books & Games', category: 'Family & Child-Friendly', icon: '📚' },

  // Services & Amenities
  { id: 'breakfast', name: 'Breakfast', category: 'Services & Amenities', icon: '🥞' },
  { id: 'concierge', name: 'Concierge Service', category: 'Services & Amenities', icon: '🛎️' },
  { id: 'room-service', name: 'Room Service', category: 'Services & Amenities', icon: '🍽️' },
  { id: 'luggage-drop-off', name: 'Luggage Drop-off', category: 'Services & Amenities', icon: '🧳' },
  { id: 'long-term-stays', name: 'Long-term Stays Allowed', category: 'Services & Amenities', icon: '📅' },
  { id: 'self-check-in', name: 'Self Check-in', category: 'Services & Amenities', icon: '🔑' },

  // Bathroom
  { id: 'hair-dryer', name: 'Hair Dryer', category: 'Bathroom', icon: '💨' },
  { id: 'shampoo', name: 'Shampoo', category: 'Bathroom', icon: '🧴' },
  { id: 'hot-water', name: 'Hot Water', category: 'Bathroom', icon: '🚿' },
  { id: 'towels', name: 'Towels', category: 'Bathroom', icon: '🏖️' },
  { id: 'bathtub', name: 'Bathtub', category: 'Bathroom', icon: '🛁' },

  // Bedroom
  { id: 'bed-linens', name: 'Bed Linens', category: 'Bedroom', icon: '🛏️' },
  { id: 'extra-pillows', name: 'Extra Pillows & Blankets', category: 'Bedroom', icon: '🛌' },
  { id: 'blackout-curtains', name: 'Blackout Curtains', category: 'Bedroom', icon: '🌙' },
  { id: 'hangers', name: 'Hangers', category: 'Bedroom', icon: '👔' },
  { id: 'wardrobe', name: 'Wardrobe', category: 'Bedroom', icon: '👗' },

  // Pet-Friendly
  { id: 'pets-allowed', name: 'Pets Allowed', category: 'Pet-Friendly', icon: '🐕' },
  { id: 'pet-bowls', name: 'Pet Bowls', category: 'Pet-Friendly', icon: '🥣' },
  { id: 'pet-bed', name: 'Pet Bed', category: 'Pet-Friendly', icon: '🛏️' }
]

// Helper function to get amenities by category
export const getAmenitiesByCategory = (): Record<string, AmenityOption[]> => {
  const grouped: Record<string, AmenityOption[]> = {}
  
  AVAILABLE_AMENITIES.forEach(amenity => {
    if (!grouped[amenity.category]) {
      grouped[amenity.category] = []
    }
    grouped[amenity.category].push(amenity)
  })
  
  return grouped
}

// Helper function to get all category names
export const getAmenityCategories = (): string[] => {
  const categories = Array.from(new Set(AVAILABLE_AMENITIES.map(a => a.category)))
  return categories.sort()
}

// Helper function to find amenity by id
export const findAmenityById = (id: string): AmenityOption | undefined => {
  return AVAILABLE_AMENITIES.find(amenity => amenity.id === id)
}