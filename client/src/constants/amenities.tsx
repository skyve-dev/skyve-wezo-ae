import { ReactElement } from 'react'
import {
  IoIosWifi,
  IoIosTv,
  IoIosDesktop,
  IoIosLaptop,
  IoIosMicrophone,
  IoIosRestaurant,
  IoIosCafe,
  IoIosWine,
  IoIosWater,
  IoIosFootball,
  IoIosTennisball,
  IoIosBasketball,
  IoIosFitness,
  IoIosBoat,
  IoIosFlower,
  IoIosHome,
  IoIosFlame,
  IoIosCloudyNight,
  IoIosSnow,
  IoIosThermometer,
  IoIosShirt,
  IoIosBrush,
  IoIosLock,
  IoIosWarning,
  IoIosVideocam,
  IoIosEye,
  IoIosCar,
  IoIosSubway,
  IoIosAirplane,
  IoIosBookmark,
  IoIosStar,
  IoIosHappy,
  IoIosKey,
  IoIosPeople,
  IoIosWoman,
  IoIosBed,
  IoIosMoon,
  IoIosPaw,
  IoIosCart,
  IoIosMedkit,
  IoIosUmbrella,
  IoIosFlag,
  IoIosCompass,
  IoIosMusicalNotes,
  IoIosRocket,
  IoIosGift,
  IoIosFilm,
  IoIosLeaf,
  IoIosRose,
  IoIosTrophy,
  IoIosBaseball,
  IoIosAmericanFootball,
  IoIosBulb,
  IoIosSync,
  IoIosBatteryCharging,
  IoLogoGameControllerB
} from 'react-icons/io'

// Create an alias for walk-in closet icon
const IoIosCloset = IoIosShirt

export interface AmenityOption {
  id: string
  name: string
  category: string
  icon?: ReactElement
}

// UAE Villa & Luxury House amenities organized by category
export const AVAILABLE_AMENITIES: AmenityOption[] = [
  // Sports & Recreation Facilities
  { id: 'football-field', name: 'Football Field', category: 'Sports & Recreation', icon: <IoIosFootball /> },
  { id: 'tennis-court', name: 'Tennis Court', category: 'Sports & Recreation', icon: <IoIosTennisball /> },
  { id: 'badminton-court', name: 'Badminton Court', category: 'Sports & Recreation', icon: <IoIosBaseball /> },
  { id: 'basketball-court', name: 'Basketball Court', category: 'Sports & Recreation', icon: <IoIosBasketball /> },
  { id: 'volleyball-court', name: 'Volleyball Court', category: 'Sports & Recreation', icon: <IoIosAmericanFootball /> },
  { id: 'cricket-pitch', name: 'Cricket Pitch', category: 'Sports & Recreation', icon: <IoIosTrophy /> },
  { id: 'golf-simulator', name: 'Golf Simulator', category: 'Sports & Recreation', icon: <IoIosFlag /> },
  { id: 'table-tennis', name: 'Table Tennis', category: 'Sports & Recreation', icon: <IoIosTennisball /> },
  { id: 'billiards-table', name: 'Billiards/Snooker Table', category: 'Sports & Recreation', icon: <IoLogoGameControllerB /> },
  { id: 'gym', name: 'Private Gym', category: 'Sports & Recreation', icon: <IoIosFitness /> },
  { id: 'yoga-studio', name: 'Yoga/Meditation Studio', category: 'Sports & Recreation', icon: <IoIosFitness /> },

  // Pool & Water Features
  { id: 'private-pool', name: 'Private Swimming Pool', category: 'Pool & Water Features', icon: <IoIosWater /> },
  { id: 'infinity-pool', name: 'Infinity Pool', category: 'Pool & Water Features', icon: <IoIosWater /> },
  { id: 'kids-pool', name: 'Kids Pool', category: 'Pool & Water Features', icon: <IoIosHappy /> },
  { id: 'pool-heating', name: 'Heated Pool', category: 'Pool & Water Features', icon: <IoIosThermometer /> },
  { id: 'jacuzzi', name: 'Jacuzzi/Hot Tub', category: 'Pool & Water Features', icon: <IoIosWater /> },
  { id: 'sauna', name: 'Sauna', category: 'Pool & Water Features', icon: <IoIosFlame /> },
  { id: 'steam-room', name: 'Steam Room', category: 'Pool & Water Features', icon: <IoIosCloudyNight /> },
  { id: 'private-beach', name: 'Private Beach Access', category: 'Pool & Water Features', icon: <IoIosUmbrella /> },
  { id: 'water-sports', name: 'Water Sports Equipment', category: 'Pool & Water Features', icon: <IoIosBoat /> },

  // Arabic & Cultural Features
  { id: 'majlis', name: 'Traditional Majlis', category: 'Arabic & Cultural', icon: <IoIosHome /> },
  { id: 'prayer-room', name: 'Prayer Room', category: 'Arabic & Cultural', icon: <IoIosMoon /> },
  { id: 'qibla-direction', name: 'Qibla Direction Marked', category: 'Arabic & Cultural', icon: <IoIosCompass /> },
  { id: 'arabic-coffee-set', name: 'Arabic Coffee/Tea Set', category: 'Arabic & Cultural', icon: <IoIosCafe /> },
  { id: 'shisha-area', name: 'Shisha/Hookah Area', category: 'Arabic & Cultural', icon: <IoIosLeaf /> },
  { id: 'halal-kitchen', name: 'Halal Kitchen Setup', category: 'Arabic & Cultural', icon: <IoIosRestaurant /> },
  { id: 'separate-dining', name: 'Separate Family Dining Areas', category: 'Arabic & Cultural', icon: <IoIosPeople /> },

  // Outdoor & Garden
  { id: 'private-garden', name: 'Private Garden', category: 'Outdoor & Garden', icon: <IoIosFlower /> },
  { id: 'landscaped-garden', name: 'Landscaped Garden', category: 'Outdoor & Garden', icon: <IoIosRose /> },
  { id: 'palm-trees', name: 'Palm Trees', category: 'Outdoor & Garden', icon: <IoIosLeaf /> },
  { id: 'outdoor-majlis', name: 'Outdoor Majlis/Seating', category: 'Outdoor & Garden', icon: <IoIosHome /> },
  { id: 'bbq-station', name: 'BBQ Station', category: 'Outdoor & Garden', icon: <IoIosFlame /> },
  { id: 'outdoor-kitchen', name: 'Outdoor Kitchen', category: 'Outdoor & Garden', icon: <IoIosRestaurant /> },
  { id: 'gazebo', name: 'Gazebo/Pergola', category: 'Outdoor & Garden', icon: <IoIosUmbrella /> },
  { id: 'fountain', name: 'Water Fountain', category: 'Outdoor & Garden', icon: <IoIosWater /> },
  { id: 'kids-playground', name: 'Kids Playground', category: 'Outdoor & Garden', icon: <IoIosHappy /> },
  { id: 'trampoline', name: 'Trampoline', category: 'Outdoor & Garden', icon: <IoIosRocket /> },

  // Entertainment & Technology
  { id: 'home-cinema', name: 'Home Cinema Room', category: 'Entertainment & Technology', icon: <IoIosFilm /> },
  { id: 'games-room', name: 'Games Room', category: 'Entertainment & Technology', icon: <IoLogoGameControllerB /> },
  { id: 'karaoke-system', name: 'Karaoke System', category: 'Entertainment & Technology', icon: <IoIosMicrophone /> },
  { id: 'playstation', name: 'PlayStation/Xbox', category: 'Entertainment & Technology', icon: <IoLogoGameControllerB /> },
  { id: 'smart-tv', name: 'Smart TV (Netflix/OSN)', category: 'Entertainment & Technology', icon: <IoIosTv /> },
  { id: 'sound-system', name: 'Surround Sound System', category: 'Entertainment & Technology', icon: <IoIosMusicalNotes /> },
  { id: 'wifi', name: 'High-Speed WiFi', category: 'Entertainment & Technology', icon: <IoIosWifi /> },
  { id: 'smart-home', name: 'Smart Home System', category: 'Entertainment & Technology', icon: <IoIosBulb /> },
  { id: 'workspace', name: 'Home Office/Study', category: 'Entertainment & Technology', icon: <IoIosLaptop /> },

  // Kitchen & Dining
  { id: 'fully-equipped-kitchen', name: 'Fully Equipped Kitchen', category: 'Kitchen & Dining', icon: <IoIosRestaurant /> },
  { id: 'double-kitchen', name: 'Double Kitchen', category: 'Kitchen & Dining', icon: <IoIosRestaurant /> },
  { id: 'show-kitchen', name: 'Show Kitchen', category: 'Kitchen & Dining', icon: <IoIosRestaurant /> },
  { id: 'coffee-machine', name: 'Coffee Machine', category: 'Kitchen & Dining', icon: <IoIosCafe /> },
  { id: 'water-dispenser', name: 'Water Dispenser', category: 'Kitchen & Dining', icon: <IoIosWater /> },
  { id: 'ice-maker', name: 'Ice Maker', category: 'Kitchen & Dining', icon: <IoIosSnow /> },
  { id: 'wine-fridge', name: 'Beverage Fridge', category: 'Kitchen & Dining', icon: <IoIosWine /> },
  { id: 'dishwasher', name: 'Dishwasher', category: 'Kitchen & Dining', icon: <IoIosRestaurant /> },
  { id: 'microwave', name: 'Microwave', category: 'Kitchen & Dining', icon: <IoIosRestaurant /> },
  { id: 'dining-12plus', name: 'Large Dining Table (12+ seats)', category: 'Kitchen & Dining', icon: <IoIosPeople /> },

  // Comfort & Climate
  { id: 'central-ac', name: 'Central Air Conditioning', category: 'Comfort & Climate', icon: <IoIosSnow /> },
  { id: 'floor-heating', name: 'Floor Heating', category: 'Comfort & Climate', icon: <IoIosThermometer /> },
  { id: 'ceiling-fans', name: 'Ceiling Fans', category: 'Comfort & Climate', icon: <IoIosSync /> },
  { id: 'motorized-curtains', name: 'Motorized Curtains', category: 'Comfort & Climate', icon: <IoIosDesktop /> },
  { id: 'blackout-curtains', name: 'Blackout Curtains', category: 'Comfort & Climate', icon: <IoIosMoon /> },

  // Luxury Features
  { id: 'private-elevator', name: 'Private Elevator', category: 'Luxury Features', icon: <IoIosSubway /> },
  { id: 'maid-room', name: "Maid's Room", category: 'Luxury Features', icon: <IoIosWoman /> },
  { id: 'driver-room', name: "Driver's Room", category: 'Luxury Features', icon: <IoIosCar /> },
  { id: 'wine-cellar', name: 'Wine Cellar', category: 'Luxury Features', icon: <IoIosWine /> },
  { id: 'walk-in-closet', name: 'Walk-in Closet', category: 'Luxury Features', icon: <IoIosCloset /> },
  { id: 'en-suite-bathrooms', name: 'All En-suite Bathrooms', category: 'Luxury Features', icon: <IoIosWater /> },
  { id: 'marble-flooring', name: 'Marble Flooring', category: 'Luxury Features', icon: <IoIosGift /> },
  { id: 'chandelier', name: 'Crystal Chandeliers', category: 'Luxury Features', icon: <IoIosBulb /> },

  // Parking & Transportation
  { id: 'covered-parking', name: 'Covered Parking', category: 'Parking & Transportation', icon: <IoIosCar /> },
  { id: 'garage-multiple', name: 'Garage (4+ cars)', category: 'Parking & Transportation', icon: <IoIosCar /> },
  { id: 'electric-car-charging', name: 'Electric Car Charging', category: 'Parking & Transportation', icon: <IoIosBatteryCharging /> },
  { id: 'golf-cart', name: 'Golf Cart Available', category: 'Parking & Transportation', icon: <IoIosCar /> },
  { id: 'boat-parking', name: 'Boat Parking', category: 'Parking & Transportation', icon: <IoIosBoat /> },
  { id: 'valet-parking', name: 'Valet Parking Service', category: 'Parking & Transportation', icon: <IoIosKey /> },

  // Safety & Security
  { id: 'gated-community', name: 'Gated Community', category: 'Safety & Security', icon: <IoIosLock /> },
  { id: '24-7-security', name: '24/7 Security Guard', category: 'Safety & Security', icon: <IoIosEye /> },
  { id: 'cctv-system', name: 'CCTV Security System', category: 'Safety & Security', icon: <IoIosVideocam /> },
  { id: 'alarm-system', name: 'Alarm System', category: 'Safety & Security', icon: <IoIosWarning /> },
  { id: 'safe-box', name: 'Safe Box', category: 'Safety & Security', icon: <IoIosLock /> },
  { id: 'intercom-system', name: 'Video Intercom', category: 'Safety & Security', icon: <IoIosVideocam /> },
  { id: 'smoke-detectors', name: 'Smoke Detectors', category: 'Safety & Security', icon: <IoIosWarning /> },
  { id: 'fire-extinguisher', name: 'Fire Extinguisher', category: 'Safety & Security', icon: <IoIosFlame /> },
  { id: 'first-aid-kit', name: 'First Aid Kit', category: 'Safety & Security', icon: <IoIosMedkit /> },

  // Services & Staff
  { id: 'daily-housekeeping', name: 'Daily Housekeeping', category: 'Services & Staff', icon: <IoIosBrush /> },
  { id: 'private-chef', name: 'Private Chef Available', category: 'Services & Staff', icon: <IoIosRestaurant /> },
  { id: 'butler-service', name: 'Butler Service', category: 'Services & Staff', icon: <IoIosPeople /> },
  { id: 'concierge', name: 'Concierge Service', category: 'Services & Staff', icon: <IoIosStar /> },
  { id: 'grocery-delivery', name: 'Grocery Delivery Service', category: 'Services & Staff', icon: <IoIosCart /> },
  { id: 'laundry-service', name: 'Laundry Service', category: 'Services & Staff', icon: <IoIosShirt /> },
  { id: 'airport-transfer', name: 'Airport Transfer', category: 'Services & Staff', icon: <IoIosAirplane /> },

  // Family & Kids
  { id: 'baby-cot', name: 'Baby Cot/Crib', category: 'Family & Kids', icon: <IoIosHappy /> },
  { id: 'high-chair', name: 'High Chair', category: 'Family & Kids', icon: <IoIosHappy /> },
  { id: 'baby-bath', name: 'Baby Bath', category: 'Family & Kids', icon: <IoIosHappy /> },
  { id: 'kids-toys', name: 'Kids Toys & Games', category: 'Family & Kids', icon: <IoLogoGameControllerB /> },
  { id: 'kids-books', name: 'Kids Books', category: 'Family & Kids', icon: <IoIosBookmark /> },
  { id: 'baby-monitor', name: 'Baby Monitor', category: 'Family & Kids', icon: <IoIosVideocam /> },
  { id: 'safety-gates', name: 'Child Safety Gates', category: 'Family & Kids', icon: <IoIosLock /> },
  { id: 'kids-pool-fence', name: 'Pool Safety Fence', category: 'Family & Kids', icon: <IoIosWarning /> },

  // Basic Amenities
  { id: 'washing-machine', name: 'Washing Machine', category: 'Basic Amenities', icon: <IoIosShirt /> },
  { id: 'dryer', name: 'Dryer', category: 'Basic Amenities', icon: <IoIosShirt /> },
  { id: 'iron-board', name: 'Iron & Ironing Board', category: 'Basic Amenities', icon: <IoIosShirt /> },
  { id: 'hair-dryer', name: 'Hair Dryer', category: 'Basic Amenities', icon: <IoIosBrush /> },
  { id: 'towels-linens', name: 'Towels & Linens Provided', category: 'Basic Amenities', icon: <IoIosBed /> },
  { id: 'toiletries', name: 'Basic Toiletries', category: 'Basic Amenities', icon: <IoIosWater /> },
  { id: 'hangers', name: 'Hangers', category: 'Basic Amenities', icon: <IoIosShirt /> },

  // Pet-Friendly
  { id: 'pets-allowed', name: 'Pets Allowed', category: 'Pet-Friendly', icon: <IoIosPaw /> },
  { id: 'pet-bowls', name: 'Pet Bowls', category: 'Pet-Friendly', icon: <IoIosPaw /> },
  { id: 'pet-bed', name: 'Pet Bed', category: 'Pet-Friendly', icon: <IoIosPaw /> },
  { id: 'pet-friendly-garden', name: 'Pet-Friendly Garden', category: 'Pet-Friendly', icon: <IoIosPaw /> }
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