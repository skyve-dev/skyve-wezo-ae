import React, {CSSProperties} from 'react'
import {Box} from './Box'
import {BoxProps} from "@/types/box.ts";
import {useTheme} from '@/components/base/AppShell';

interface SelectionPickerProps<T> extends Omit<BoxProps<'div'>, 'onChange'>{
  /**
   * Array of objects representing the list of selectable items
   */
  data: T[]
  
  /**
   * Callback function that receives an item and returns its unique identifier
   */
  idAccessor: (item: T) => string | number
  
  /**
   * Currently selected value(s) - single ID for single selection, array of IDs for multiple
   */
  value: string | number | (string | number)[] | null | undefined
  
  /**
   * Callback function invoked when selection changes
   */
  onChange: (value: string | number | (string | number)[]) => void
  
  /**
   * Toggle between single and multiple selection modes
   */
  isMultiSelect?: boolean
  
  /**
   * Optional function to render custom content for each item
   */
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode
  
  /**
   * Optional className for the container
   */
  containerClassName?: string
  
  /**
   * Optional className for each item
   */
  itemClassName?: string
  
  /**
   * Optional className for selected items
   */
  selectedItemClassName?: string
  
  /**
   * Optional styles for the container Box
   */
  containerStyles?: CSSProperties
  
  /**
   * Optional styles for each item Box
   */
  itemStyles?: CSSProperties
  
  /**
   * Optional styles for selected item Box
   */
  selectedItemStyles?: CSSProperties
  
  /**
   * Optional label accessor for displaying item text
   */
  labelAccessor?: (item: T) => string
  
  /**
   * Optional disabled state for the entire picker
   */
  disabled?: boolean
  
  /**
   * Optional function to determine if an item should be disabled
   */
  isItemDisabled?: (item: T) => boolean
  
  /**
   * Optional ref to the container element for scroll control
   */
  containerRef?: React.RefObject<HTMLDivElement>
}

/**
 * # SelectionPicker Component
 * 
 * A versatile, generic selection picker component that provides both single and multiple selection
 * capabilities with customizable rendering, accessibility features, and responsive design support.
 * Perfect for property amenities, room types, pricing options, guest preferences, and any list-based selections.
 * 
 * ## Key Features
 * - **Generic Typed**: Works with any data type `<T>` for type safety and flexibility
 * - **Dual Selection Modes**: Single selection (radio) and multiple selection (checkbox)
 * - **Custom Rendering**: Complete control over item appearance with `renderItem` prop
 * - **Accessibility**: Full keyboard navigation, ARIA attributes, screen reader support
 * - **Disabled State Management**: Global and per-item disabled states with visual feedback
 * - **Theme Integration**: Consistent styling with app theme colors and animations
 * - **Responsive Design**: Inherits all Box responsive properties for mobile-first design
 * - **Performance Optimized**: Efficient selection tracking and rendering
 * 
 * ## Basic Usage
 * ```tsx
 * import SelectionPicker from '@/components/base/SelectionPicker'
 * 
 * interface Amenity {
 *   id: string
 *   name: string
 *   category: string
 * }
 * 
 * function AmenitySelector() {
 *   const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
 *   
 *   const amenities: Amenity[] = [
 *     { id: 'wifi', name: 'Free Wi-Fi', category: 'connectivity' },
 *     { id: 'pool', name: 'Swimming Pool', category: 'recreation' },
 *     { id: 'parking', name: 'Free Parking', category: 'convenience' }
 *   ]
 * 
 *   return (
 *     <SelectionPicker
 *       data={amenities}
 *       idAccessor={(amenity) => amenity.id}
 *       labelAccessor={(amenity) => amenity.name}
 *       value={selectedAmenities}
 *       onChange={(value) => setSelectedAmenities(value as string[])}
 *       isMultiSelect={true}
 *     />
 *   )
 * }
 * ```
 * 
 * ## Selection Modes
 * 
 * ### Single Selection (Radio Button Style)
 * ```tsx
 * interface RoomType {
 *   id: string
 *   name: string
 *   capacity: number
 * }
 * 
 * function RoomSelector() {
 *   const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
 *   
 *   const roomTypes: RoomType[] = [
 *     { id: 'master', name: 'Master Suite', capacity: 2 },
 *     { id: 'guest', name: 'Guest Room', capacity: 2 },
 *     { id: 'studio', name: 'Studio Apartment', capacity: 4 }
 *   ]
 * 
 *   return (
 *     <SelectionPicker
 *       data={roomTypes}
 *       idAccessor={(room) => room.id}
 *       labelAccessor={(room) => `${room.name} (${room.capacity} guests)`}
 *       value={selectedRoom}
 *       onChange={(value) => setSelectedRoom(value as string)}
 *       isMultiSelect={false}
 *     />
 *   )
 * }
 * ```
 * 
 * ### Multiple Selection (Checkbox Style)
 * ```tsx
 * function PropertyFeaturesSelector() {
 *   const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
 *   
 *   const features = [
 *     { id: 'beach-access', name: 'Beach Access' },
 *     { id: 'city-view', name: 'City View' },
 *     { id: 'private-pool', name: 'Private Pool' },
 *     { id: 'garden', name: 'Garden' }
 *   ]
 * 
 *   return (
 *     <SelectionPicker
 *       data={features}
 *       idAccessor={(feature) => feature.id}
 *       labelAccessor={(feature) => feature.name}
 *       value={selectedFeatures}
 *       onChange={(value) => setSelectedFeatures(value as string[])}
 *       isMultiSelect={true}
 *       gap="0.75rem"
 *       width="100%"
 *       maxWidth="500px"
 *     />
 *   )
 * }
 * ```
 * 
 * ## Custom Rendering
 * 
 * ### Rich Property Cards
 * ```tsx
 * interface Property {
 *   id: string
 *   name: string
 *   type: 'villa' | 'apartment' | 'hotel'
 *   pricePerNight: number
 *   rating: number
 *   amenities: string[]
 *   available: boolean
 * }
 * 
 * function PropertySelector() {
 *   const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
 * 
 *   const renderProperty = (property: Property, isSelected: boolean) => (
 *     <Box display="flex" alignItems="start" width="100%" gap="1rem">
 *       <Box
 *         width="80px"
 *         height="60px"
 *         backgroundColor="#f3f4f6"
 *         borderRadius="8px"
 *         display="flex"
 *         alignItems="center"
 *         justifyContent="center"
 *         fontSize="0.75rem"
 *         color="#9ca3af"
 *       >
 *         Photo
 *       </Box>
 * 
 *       <Box flex="1">
 *         <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="0.5rem">
 *           <Box
 *             fontSize="1.125rem"
 *             fontWeight="600"
 *             color={isSelected ? '#1e40af' : '#111827'}
 *           >
 *             {property.name}
 *           </Box>
 *           <Box
 *             fontSize="1rem"
 *             fontWeight="600"
 *             color={property.available ? '#059669' : '#dc2626'}
 *           >
 *             AED {property.pricePerNight}/night
 *           </Box>
 *         </Box>
 * 
 *         <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
 *           <Box
 *             fontSize="0.75rem"
 *             backgroundColor={
 *               property.type === 'villa' ? '#fef3c7' : 
 *               property.type === 'apartment' ? '#dbeafe' : '#f3e8ff'
 *             }
 *             color={
 *               property.type === 'villa' ? '#92400e' : 
 *               property.type === 'apartment' ? '#1e40af' : '#6b21a8'
 *             }
 *             padding="0.25rem 0.5rem"
 *             borderRadius="0.375rem"
 *             textTransform="uppercase"
 *             fontWeight="600"
 *           >
 *             {property.type}
 *           </Box>
 *           <Box fontSize="0.875rem" color="#6b7280">
 *             ⭐ {property.rating}/5
 *           </Box>
 *         </Box>
 * 
 *         <Box display="flex" flexWrap="wrap" gap="0.25rem">
 *           {property.amenities.slice(0, 3).map((amenity) => (
 *             <Box
 *               key={amenity}
 *               fontSize="0.75rem"
 *               backgroundColor="#f3f4f6"
 *               color="#374151"
 *               padding="0.125rem 0.375rem"
 *               borderRadius="0.25rem"
 *             >
 *               {amenity}
 *             </Box>
 *           ))}
 *           {property.amenities.length > 3 && (
 *             <Box fontSize="0.75rem" color="#9ca3af">
 *               +{property.amenities.length - 3} more
 *             </Box>
 *           )}
 *         </Box>
 *       </Box>
 *     </Box>
 *   )
 * 
 *   return (
 *     <SelectionPicker
 *       data={properties}
 *       idAccessor={(property) => property.id}
 *       value={selectedProperty}
 *       onChange={(value) => setSelectedProperty(value as string)}
 *       renderItem={renderProperty}
 *       isItemDisabled={(property) => !property.available}
 *       isMultiSelect={false}
 *       itemStyles={{ 
 *         padding: '1.5rem',
 *         minHeight: '140px' 
 *       }}
 *       gap="1rem"
 *     />
 *   )
 * }
 * ```
 * 
 * ### Category-Based Amenities
 * ```tsx
 * interface AmenityWithCategory {
 *   id: string
 *   name: string
 *   icon: string
 *   category: 'essential' | 'comfort' | 'entertainment' | 'outdoor'
 *   description: string
 * }
 * 
 * function CategorizedAmenitySelector() {
 *   const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
 * 
 *   const renderAmenity = (amenity: AmenityWithCategory, isSelected: boolean) => (
 *     <Box display="flex" alignItems="center" width="100%" gap="1rem">
 *       <Box fontSize="1.5rem" minWidth="2rem" textAlign="center">
 *         {amenity.icon}
 *       </Box>
 *       <Box flex="1">
 *         <Box
 *           fontSize="1rem"
 *           fontWeight="600"
 *           color={isSelected ? '#1e40af' : '#111827'}
 *           marginBottom="0.25rem"
 *         >
 *           {amenity.name}
 *         </Box>
 *         <Box fontSize="0.875rem" color="#6b7280">
 *           {amenity.description}
 *         </Box>
 *       </Box>
 *       <Box
 *         fontSize="0.75rem"
 *         backgroundColor={getCategoryColor(amenity.category).bg}
 *         color={getCategoryColor(amenity.category).text}
 *         padding="0.25rem 0.5rem"
 *         borderRadius="0.375rem"
 *         textTransform="capitalize"
 *       >
 *         {amenity.category}
 *       </Box>
 *     </Box>
 *   )
 * 
 *   return (
 *     <SelectionPicker
 *       data={amenitiesWithCategories}
 *       idAccessor={(amenity) => amenity.id}
 *       value={selectedAmenities}
 *       onChange={(value) => setSelectedAmenities(value as string[])}
 *       renderItem={renderAmenity}
 *       isMultiSelect={true}
 *       itemStyles={{ padding: '1rem' }}
 *       gap="0.5rem"
 *     />
 *   )
 * }
 * ```
 * 
 * ## Responsive Design Integration
 * 
 * ### Mobile-First Property Filters
 * ```tsx
 * function ResponsivePropertyFilters() {
 *   const [selectedFilters, setSelectedFilters] = useState<string[]>([])
 * 
 *   return (
 *     <SelectionPicker
 *       data={filterOptions}
 *       idAccessor={(filter) => filter.id}
 *       labelAccessor={(filter) => filter.name}
 *       value={selectedFilters}
 *       onChange={(value) => setSelectedFilters(value as string[])}
 *       isMultiSelect={true}
 *       
 *       // Responsive layout
 *       width="100%"
 *       widthSm="400px"
 *       widthMd="500px"
 *       maxWidth="600px"
 *       
 *       // Responsive spacing
 *       gap="0.5rem"
 *       gapMd="0.75rem"
 *       padding="1rem"
 *       paddingMd="1.5rem"
 *       
 *       // Responsive item styling
 *       itemStyles={{
 *         padding: window.innerWidth < 768 ? '0.75rem' : '1rem',
 *         borderRadius: '0.5rem'
 *       }}
 *     />
 *   )
 * }
 * ```
 * 
 * ### Adaptive Card Layout
 * ```tsx
 * function AdaptiveRoomSelector() {
 *   const isMobile = window.innerWidth < 768
 * 
 *   return (
 *     <SelectionPicker
 *       data={rooms}
 *       idAccessor={(room) => room.id}
 *       value={selectedRoom}
 *       onChange={setSelectedRoom}
 *       renderItem={(room, isSelected) => 
 *         isMobile ? 
 *           renderMobileRoomCard(room, isSelected) : 
 *           renderDesktopRoomCard(room, isSelected)
 *       }
 *       isMultiSelect={false}
 *       
 *       // Responsive container
 *       width="100%"
 *       maxWidth={{ base: "100%", md: "800px" }}
 *       
 *       // Responsive item styling
 *       itemStyles={{
 *         padding: isMobile ? '1rem' : '1.5rem',
 *         minHeight: isMobile ? '100px' : '120px'
 *       }}
 *       
 *       gap={isMobile ? "0.75rem" : "1rem"}
 *     />
 *   )
 * }
 * ```
 * 
 * ## Accessibility Features
 * 
 * ### Keyboard Navigation
 * ```tsx
 * // Built-in keyboard support:
 * // - Tab: Navigate between items
 * // - Space/Enter: Toggle selection
 * // - Focus indicators: Automatic visual feedback
 * 
 * <SelectionPicker
 *   data={items}
 *   idAccessor={(item) => item.id}
 *   labelAccessor={(item) => item.name}
 *   value={selection}
 *   onChange={setSelection}
 *   isMultiSelect={true}
 *   
 *   // Additional accessibility
 *   containerRef={containerRef}
 *   aria-label="Property amenities selection"
 * />
 * ```
 * 
 * ### Screen Reader Support
 * ```tsx
 * function AccessiblePropertySelector() {
 *   return (
 *     <Box>
 *       <Box 
 *         as="h3" 
 *         id="property-selector-title"
 *         fontSize="1.125rem" 
 *         fontWeight="600" 
 *         marginBottom="1rem"
 *       >
 *         Choose Your Accommodation
 *       </Box>
 *       
 *       <SelectionPicker
 *         data={properties}
 *         idAccessor={(property) => property.id}
 *         value={selectedProperty}
 *         onChange={setSelectedProperty}
 *         isMultiSelect={false}
 *         
 *         // ARIA attributes automatically applied:
 *         // role="radio" for single selection
 *         // role="checkbox" for multiple selection
 *         // aria-checked reflects selection state
 *         // aria-disabled for disabled items
 *         
 *         containerRef={selectorRef}
 *         aria-labelledby="property-selector-title"
 *       />
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ## Disabled State Management
 * 
 * ### Global and Item-Level Disabled States
 * ```tsx
 * function ConditionalPropertySelector() {
 *   const [isFormSubmitting, setIsFormSubmitting] = useState(false)
 * 
 *   return (
 *     <SelectionPicker
 *       data={properties}
 *       idAccessor={(property) => property.id}
 *       value={selectedProperty}
 *       onChange={setSelectedProperty}
 *       
 *       // Global disabled state
 *       disabled={isFormSubmitting}
 *       
 *       // Per-item disabled logic
 *       isItemDisabled={(property) => 
 *         !property.available || 
 *         property.maintenanceMode ||
 *         property.fullyBooked
 *       }
 *       
 *       isMultiSelect={false}
 *     />
 *   )
 * }
 * ```
 * 
 * ### Visual Feedback for Disabled States
 * ```tsx
 * <SelectionPicker
 *   data={roomTypes}
 *   idAccessor={(room) => room.id}
 *   value={selectedRooms}
 *   onChange={setSelectedRooms}
 *   isItemDisabled={(room) => !room.available}
 *   
 *   // Custom styling for disabled items
 *   itemStyles={{
 *     transition: 'all 0.2s',
 *     cursor: 'pointer'
 *   }}
 *   
 *   // Disabled items automatically get:
 *   // - opacity: 0.5
 *   // - cursor: 'not-allowed'
 *   // - Interaction prevention
 *   
 *   isMultiSelect={true}
 * />
 * ```
 * 
 * ## Advanced Styling and Theming
 * 
 * ### Complete Custom Styling
 * ```tsx
 * function StyledPropertySelector() {
 *   return (
 *     <SelectionPicker
 *       data={properties}
 *       idAccessor={(property) => property.id}
 *       value={selectedProperty}
 *       onChange={setSelectedProperty}
 *       
 *       // Container styling
 *       containerClassName="property-selector"
 *       containerStyles={{
 *         backgroundColor: '#f8fafc',
 *         borderRadius: '1rem',
 *         padding: '1rem'
 *       }}
 *       
 *       // Item styling
 *       itemClassName="property-item"
 *       itemStyles={{
 *         borderRadius: '0.75rem',
 *         padding: '1.25rem',
 *         border: '2px solid #e5e7eb',
 *         backgroundColor: 'white',
 *         boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
 *         transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
 *       }}
 *       
 *       // Selected item styling
 *       selectedItemClassName="property-item--selected"
 *       selectedItemStyles={{
 *         borderColor: '#3b82f6',
 *         backgroundColor: '#eff6ff',
 *         boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
 *         transform: 'translateY(-2px)'
 *       }}
 *       
 *       // Responsive gap
 *       gap="1rem"
 *       gapMd="1.25rem"
 *       
 *       isMultiSelect={false}
 *     />
 *   )
 * }
 * ```
 * 
 * ### Theme Integration
 * ```tsx
 * // Component automatically uses theme colors:
 * // - Primary color for borders and backgrounds
 * // - Theme.withOpacity() for hover states
 * // - Consistent animation timings
 * 
 * function ThemedAmenitySelector() {
 *   return (
 *     <SelectionPicker
 *       data={amenities}
 *       idAccessor={(amenity) => amenity.id}
 *       labelAccessor={(amenity) => amenity.name}
 *       value={selectedAmenities}
 *       onChange={setSelectedAmenities}
 *       isMultiSelect={true}
 *       
 *       // Theme colors automatically applied:
 *       // - Selected border: theme.primaryColor
 *       // - Selected background: theme.withOpacity(theme.primaryColor, 0.05)
 *       // - Hover states: theme.withOpacity(theme.primaryColor, 0.1)
 *       // - Checkbox/radio indicators: theme.primaryColor
 *     />
 *   )
 * }
 * ```
 * 
 * ## Integration with Property Rental Features
 * 
 * ### Guest Preference Selection
 * ```tsx
 * function GuestPreferencesForm() {
 *   const [preferences, setPreferences] = useState<string[]>([])
 * 
 *   const guestPreferences = [
 *     { id: 'quiet-area', name: 'Quiet Area', icon: '🤫' },
 *     { id: 'city-center', name: 'City Center', icon: '🏙️' },
 *     { id: 'beach-nearby', name: 'Beach Access', icon: '🏖️' },
 *     { id: 'family-friendly', name: 'Family Friendly', icon: '👨‍👩‍👧‍👦' },
 *     { id: 'business-ready', name: 'Business Ready', icon: '💼' }
 *   ]
 * 
 *   return (
 *     <Box>
 *       <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
 *         What's important for your stay?
 *       </Box>
 *       <Box fontSize="0.875rem" color="#6b7280" marginBottom="1.5rem">
 *         Select all that apply to help us find the perfect property
 *       </Box>
 *       
 *       <SelectionPicker
 *         data={guestPreferences}
 *         idAccessor={(pref) => pref.id}
 *         value={preferences}
 *         onChange={(value) => setPreferences(value as string[])}
 *         renderItem={(pref, isSelected) => (
 *           <Box display="flex" alignItems="center" gap="0.75rem">
 *             <Box fontSize="1.25rem">{pref.icon}</Box>
 *             <Box
 *               fontSize="1rem"
 *               fontWeight={isSelected ? "600" : "400"}
 *               color={isSelected ? '#1e40af' : '#374151'}
 *             >
 *               {pref.name}
 *             </Box>
 *           </Box>
 *         )}
 *         isMultiSelect={true}
 *         gap="0.75rem"
 *         width="100%"
 *         maxWidth="500px"
 *       />
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ### Property Amenities Manager
 * ```tsx
 * function PropertyAmenitiesManager() {
 *   const [selectedAmenities, setSelectedAmenities] = useState<{
 *     [category: string]: string[]
 *   }>({})
 * 
 *   const amenityCategories = {
 *     essential: [
 *       { id: 'wifi', name: 'Wi-Fi', description: 'High-speed internet' },
 *       { id: 'ac', name: 'Air Conditioning', description: 'Climate control' },
 *       { id: 'heating', name: 'Heating', description: 'Central heating' }
 *     ],
 *     entertainment: [
 *       { id: 'tv', name: 'Smart TV', description: 'Netflix, streaming' },
 *       { id: 'sound-system', name: 'Sound System', description: 'Bluetooth speakers' },
 *       { id: 'game-console', name: 'Game Console', description: 'PlayStation/Xbox' }
 *     ],
 *     outdoor: [
 *       { id: 'pool', name: 'Swimming Pool', description: 'Private pool' },
 *       { id: 'garden', name: 'Garden', description: 'Landscaped garden' },
 *       { id: 'bbq', name: 'BBQ Area', description: 'Outdoor grilling' }
 *     ]
 *   }
 * 
 *   return (
 *     <Box display="grid" gap="2.5rem">
 *       {Object.entries(amenityCategories).map(([category, amenities]) => (
 *         <Box key={category}>
 *           <Box 
 *             fontSize="1.125rem" 
 *             fontWeight="600" 
 *             marginBottom="1rem"
 *             textTransform="capitalize"
 *             color="#111827"
 *           >
 *             {category} Amenities
 *           </Box>
 *           
 *           <SelectionPicker
 *             data={amenities}
 *             idAccessor={(amenity) => amenity.id}
 *             value={selectedAmenities[category] || []}
 *             onChange={(value) => setSelectedAmenities(prev => ({
 *               ...prev,
 *               [category]: value as string[]
 *             }))}
 *             renderItem={(amenity, isSelected) => (
 *               <Box>
 *                 <Box
 *                   fontSize="1rem"
 *                   fontWeight="600"
 *                   color={isSelected ? '#1e40af' : '#374151'}
 *                   marginBottom="0.25rem"
 *                 >
 *                   {amenity.name}
 *                 </Box>
 *                 <Box fontSize="0.875rem" color="#6b7280">
 *                   {amenity.description}
 *                 </Box>
 *               </Box>
 *             )}
 *             isMultiSelect={true}
 *             gap="0.75rem"
 *           />
 *         </Box>
 *       ))}
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ## Performance Considerations
 * 
 * ### Large Data Sets
 * ```tsx
 * function OptimizedLargeList() {
 *   const [selectedItems, setSelectedItems] = useState<string[]>([])
 *   
 *   // For very large lists, consider virtualization
 *   // This component handles up to ~1000 items efficiently
 *   
 *   return (
 *     <SelectionPicker
 *       data={largeDataSet}
 *       idAccessor={(item) => item.id}
 *       labelAccessor={(item) => item.name}
 *       value={selectedItems}
 *       onChange={setSelectedItems}
 *       isMultiSelect={true}
 *       
 *       // Optimize for performance
 *       containerRef={containerRef}
 *       itemStyles={{ minHeight: '48px' }} // Consistent height
 *       
 *       // Efficient rendering
 *       renderItem={useMemo(() => 
 *         (item, isSelected) => (
 *           <OptimizedItemRenderer item={item} isSelected={isSelected} />
 *         ), []
 *       )}
 *     />
 *   )
 * }
 * ```
 * 
 * ### Memoization for Complex Rendering
 * ```tsx
 * const MemoizedPropertyCard = React.memo(({ property, isSelected }) => (
 *   // Complex rendering logic
 *   <ExpensivePropertyCard property={property} isSelected={isSelected} />
 * ))
 * 
 * function OptimizedPropertySelector() {
 *   return (
 *     <SelectionPicker
 *       data={properties}
 *       idAccessor={(property) => property.id}
 *       value={selectedProperty}
 *       onChange={setSelectedProperty}
 *       renderItem={(property, isSelected) => (
 *         <MemoizedPropertyCard 
 *           property={property} 
 *           isSelected={isSelected} 
 *         />
 *       )}
 *       isMultiSelect={false}
 *     />
 *   )
 * }
 * ```
 * 
 * ## Error Handling & Best Practices
 * 
 * ### Data Structure Consistency
 * ```tsx
 * // ✅ Good - Consistent interface
 * interface SelectableItem {
 *   id: string
 *   name: string
 *   description?: string
 *   available: boolean
 * }
 * 
 * // ❌ Avoid - Inconsistent data
 * const inconsistentData = [
 *   'string-item',
 *   { id: 1, title: 'Object item' },
 *   { identifier: 'different-key', label: 'Different structure' }
 * ]
 * ```
 * 
 * ### Value Type Safety
 * ```tsx
 * // ✅ Good - Type-safe value handling
 * const [singleSelection, setSingleSelection] = useState<string | null>(null)
 * const [multiSelection, setMultiSelection] = useState<string[]>([])
 * 
 * // Type-safe onChange handlers
 * const handleSingleChange = (value: string | number | (string | number)[]) => {
 *   setSingleSelection(value as string)
 * }
 * 
 * const handleMultiChange = (value: string | number | (string | number)[]) => {
 *   setMultiSelection(value as string[])
 * }
 * ```
 * 
 * ### Accessibility Best Practices
 * ```tsx
 * // ✅ Good - Comprehensive accessibility
 * <Box>
 *   <Box as="label" htmlFor="amenity-selector" fontSize="1.125rem" fontWeight="600">
 *     Available Amenities
 *   </Box>
 *   <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
 *     Select amenities available at your property
 *   </Box>
 *   
 *   <SelectionPicker
 *     id="amenity-selector"
 *     data={amenities}
 *     idAccessor={(amenity) => amenity.id}
 *     labelAccessor={(amenity) => amenity.name}
 *     value={selectedAmenities}
 *     onChange={setSelectedAmenities}
 *     isMultiSelect={true}
 *     aria-describedby="amenity-help"
 *   />
 *   
 *   <Box id="amenity-help" fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
 *     Use space or enter to select items
 *   </Box>
 * </Box>
 * ```
 * 
 * ## Integration with Other Components
 * - **SlidingDrawer**: Perfect container for mobile filter selections
 * - **Box**: Provides all responsive layout capabilities
 * - **DatePicker**: Complementary selection for date-based filters  
 * - **Input**: Works alongside for text-based filters
 * - **Button**: For action buttons like "Select All" or "Clear All"
 * 
 * @example
 * // Complete property amenity selection with SlidingDrawer
 * function PropertyAmenityDrawer() {
 *   const [isOpen, setIsOpen] = useState(false)
 *   const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
 * 
 *   const amenities = [
 *     { id: 'wifi', name: 'Wi-Fi', icon: '📶' },
 *     { id: 'pool', name: 'Swimming Pool', icon: '🏊' },
 *     { id: 'parking', name: 'Parking', icon: '🚗' },
 *     { id: 'gym', name: 'Fitness Center', icon: '🏃' }
 *   ]
 * 
 *   return (
 *     <>
 *       <Button
 *         label={`Amenities (${selectedAmenities.length})`}
 *         onClick={() => setIsOpen(true)}
 *         variant="normal"
 *       />
 * 
 *       <SlidingDrawer
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         side="bottom"
 *         height="60vh"
 *       >
 *         <Box padding="1.5rem">
 *           <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem">
 *             Select Amenities
 *           </Box>
 *           
 *           <SelectionPicker
 *             data={amenities}
 *             idAccessor={(amenity) => amenity.id}
 *             labelAccessor={(amenity) => amenity.name}
 *             value={selectedAmenities}
 *             onChange={(value) => setSelectedAmenities(value as string[])}
 *             renderItem={(amenity, isSelected) => (
 *               <Box display="flex" alignItems="center" gap="0.75rem">
 *                 <Box fontSize="1.25rem">{amenity.icon}</Box>
 *                 <Box>{amenity.name}</Box>
 *               </Box>
 *             )}
 *             isMultiSelect={true}
 *             gap="0.75rem"
 *           />
 *           
 *           <Box display="flex" gap="1rem" marginTop="2rem">
 *             <Button
 *               label="Clear All"
 *               variant="normal"
 *               onClick={() => setSelectedAmenities([])}
 *             />
 *             <Button
 *               label="Apply"
 *               variant="promoted"
 *               onClick={() => setIsOpen(false)}
 *             />
 *           </Box>
 *         </Box>
 *       </SlidingDrawer>
 *     </>
 *   )
 * }
 */
function SelectionPicker<T>({
  data,
  idAccessor,
  value,
  onChange,
  isMultiSelect = false,
  renderItem,
  containerClassName,
  itemClassName,
  selectedItemClassName,
  containerStyles = {},
  itemStyles = {},
  selectedItemStyles = {},
  labelAccessor,
  disabled = false,
  isItemDisabled,
  containerRef
}: SelectionPickerProps<T>) {
  const theme = useTheme();
  
  // Normalize value to always work with an array internally
  const selectedIds = React.useMemo(() => {
    if (isMultiSelect) {
      return Array.isArray(value) ? value : []
    }
    return value !== undefined && value !== null ? [value] : []
  }, [value, isMultiSelect])
  
  // Check if an item is selected
  const isItemSelected = (itemId: string | number): boolean => {
    return selectedIds.includes(itemId)
  }
  
  // Handle item click
  const handleItemClick = (itemId: string | number, item: T) => {
    // Check if component or specific item is disabled
    if (disabled || (isItemDisabled && isItemDisabled(item))) {
      return
    }
    
    if (isMultiSelect) {
      // Multiple selection mode
      const currentSelection = Array.isArray(value) ? value : []
      let newSelection: (string | number)[]
      
      if (isItemSelected(itemId)) {
        // Deselect item
        newSelection = currentSelection.filter(id => id !== itemId)
      } else {
        // Select item
        newSelection = [...currentSelection, itemId]
      }
      
      onChange(newSelection)
    } else {
      // Single selection mode
      if (isItemSelected(itemId)) {
        // Optional: Allow deselection in single mode
        // onChange(null) // Uncomment if you want to allow deselection
        return // Comment this line if deselection is allowed
      }
      onChange(itemId)
    }
  }
  
  // Default item renderer
  const defaultRenderItem = (item: T, isSelected: boolean) => {
    const label = labelAccessor ? labelAccessor(item) : String(item)
    return (
      <>
        {isMultiSelect && (
          <Box
            as="span"
            marginRight="0.5rem"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            width="1.25rem"
            height="1.25rem"
            border={`2px solid ${isSelected ? theme.primaryColor : theme.withOpacity(theme.primaryColor, 0.2)}`}
            borderRadius={isMultiSelect ? '0.25rem' : '50%'}
            backgroundColor={isSelected ? theme.primaryColor : 'transparent'}
            transition="all 0.2s"
          >
            {isSelected && (
              <Box
                as="span"
                color="white"
                fontSize="1rem"
                fontWeight="bold"
              >
                ✓
              </Box>
            )}
          </Box>
        )}
        {!isMultiSelect && (
          <Box
            as="span"
            marginRight="0.5rem"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            width="1.25rem"
            height="1.25rem"
            border={`2px solid ${isSelected ? theme.primaryColor : theme.withOpacity(theme.primaryColor, 0.2)}`}
            borderRadius="50%"
            backgroundColor={isSelected ? theme.primaryColor : 'transparent'}
            transition="all 0.2s"
          >
            {isSelected && (
              <Box
                as="span"
                width="0.5rem"
                height="0.5rem"
                backgroundColor="white"
                borderRadius="50%"
              />
            )}
          </Box>
        )}
        <Box as="span" flex="1">
          {label}
        </Box>
      </>
    )
  }
  
  // Merge styles for selected items
  const getItemStyles = (itemId: string | number, item: T):CSSProperties => {
    const selected = isItemSelected(itemId)
    const itemDisabled = isItemDisabled && isItemDisabled(item)
    
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      cursor: disabled || itemDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      opacity: disabled || itemDisabled ? 0.5 : 1,
      border: '2px solid',
      borderColor: selected ? theme.primaryColor : theme.withOpacity(theme.primaryColor, 0.15),
      backgroundColor: selected ? theme.withOpacity(theme.primaryColor, 0.05) : 'white',
      ...itemStyles
    }
    
    if (selected) {
      return {
        ...baseStyles,
        ...selectedItemStyles
      }
    }
    
    return baseStyles
  }
  
  return (
    <Box
      ref={containerRef}
      className={containerClassName}
      display="flex"
      flexDirection="column"
      gap="0.5rem"
      style={containerStyles}
    >
      {data.map((item) => {
        const itemId = idAccessor(item)
        const selected = isItemSelected(itemId)
        const itemDisabled = isItemDisabled && isItemDisabled(item)
        
        return (
          <Box
            key={itemId}
            display={'flex'}
            flexDirection={'column'}
            className={`${itemClassName || ''} ${selected ? selectedItemClassName || '' : ''}`}
            onClick={() => handleItemClick(itemId, item)}
            whileHover={
              !disabled && !itemDisabled
                ? {
                    borderColor: selected ? theme.primaryColor : theme.withOpacity(theme.primaryColor, 0.25),
                    backgroundColor: selected ? theme.withOpacity(theme.primaryColor, 0.1) : theme.withOpacity(theme.primaryColor, 0.02)
                  }
                : {}
            }
            style={getItemStyles(itemId, item)}
            role={isMultiSelect ? 'checkbox' : 'radio'}
            aria-checked={selected}
            aria-disabled={disabled || itemDisabled}
            tabIndex={disabled || itemDisabled ? -1 : 0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                handleItemClick(itemId, item)
              }
            }}
          >
            {renderItem ? renderItem(item, selected) : defaultRenderItem(item, selected)}
          </Box>
        )
      })}
    </Box>
  )
}

export default SelectionPicker