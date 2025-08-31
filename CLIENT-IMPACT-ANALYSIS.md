# Client-Side Impact Analysis 🚀

## Overview

This document analyzes the client-side impact of the new server-side features, including the advanced pricing & booking system, reservation management, and enhanced API endpoints. The analysis covers required TypeScript interfaces, Redux state management, component architecture, and implementation recommendations.

## 📊 **New API Endpoints Impact**

### Current Server Capabilities (80+ endpoints)
Based on the latest server updates, the following new endpoint categories are now available:

#### 1. **Property Pricing Management** (6 endpoints)
```typescript
PUT    /api/properties/:propertyId/pricing/weekly
GET    /api/properties/:propertyId/pricing/weekly  
POST   /api/properties/:propertyId/pricing/overrides
DELETE /api/properties/:propertyId/pricing/overrides
GET    /api/properties/:propertyId/pricing/calendar
GET    /api/properties/:propertyId/pricing/base-price
```

#### 2. **Rate Plan Management** (8 endpoints)
```typescript
POST   /api/properties/:propertyId/rate-plans
GET    /api/properties/:propertyId/rate-plans
GET    /api/properties/:propertyId/rate-plans/public
GET    /api/rate-plans/:ratePlanId
PUT    /api/rate-plans/:ratePlanId
DELETE /api/rate-plans/:ratePlanId
PATCH  /api/rate-plans/:ratePlanId/toggle-status
GET    /api/rate-plans/:ratePlanId/stats
```

#### 3. **Booking Engine** (2 endpoints)
```typescript
POST   /api/properties/:propertyId/calculate-booking
GET    /api/rate-plans/metadata/modifier-types
```

#### 4. **Reservation Management** (7 endpoints)
```typescript
GET    /api/reservations
GET    /api/reservations/:id
PUT    /api/reservations/:id
POST   /api/reservations/:id/no-show
POST   /api/reservations/:id/messages
GET    /api/reservations/:id/messages
POST   /api/reviews/:reviewId/response
```

#### 5. **Review & Communication** (Various endpoints for reviews and messaging)
#### 6. **Notification System** (Various endpoints for notifications)
#### 7. **Availability Management** (Various endpoints for availability)

---

## 🎯 **Required Client-Side TypeScript Interfaces**

### 1. **Pricing System Interfaces**

```typescript
// Property Pricing
interface WeeklyPricingData {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  halfDayMonday: number;
  halfDayTuesday: number;
  halfDayWednesday: number;
  halfDayThursday: number;
  halfDayFriday: number;
  halfDaySaturday: number;
  halfDaySunday: number;
}

interface DateOverrideData {
  date: Date;
  price: number;
  halfDayPrice?: number;
  reason?: string;
}

interface PricingCalendarDay {
  date: Date;
  fullDayPrice: number;
  halfDayPrice: number;
  isOverride: boolean;
  reason?: string;
  dayOfWeek: string;
}

// Rate Plan System
interface RatePlan {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  priceModifierType: 'Percentage' | 'FixedAmount';
  priceModifierValue: number;
  priority: number;
  isActive: boolean;
  isDefault: boolean;
  
  // Restrictions
  minStay?: number;
  maxStay?: number;
  minAdvanceBooking?: number;
  maxAdvanceBooking?: number;
  minGuests?: number;
  maxGuests?: number;
  
  // Features
  features?: {
    includedAmenityIds: string[];
    extraCostAmenityIds: string[];
  };
  
  // Cancellation
  cancellationPolicy?: {
    type: 'FullyFlexible' | 'Moderate' | 'NonRefundable';
    freeCancellationDays?: number;
    partialRefundDays?: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Booking Engine
interface BookingSearchCriteria {
  propertyId: string;
  checkInDate: Date;
  checkOutDate?: Date;
  isHalfDay?: boolean;
  guestCount: number;
  bookingDate?: Date;
}

interface BookingOption {
  ratePlan: {
    id: string;
    name: string;
    description?: string;
  };
  pricing: {
    basePrice: number;
    modifier: number;
    totalPrice: number;
    pricePerNight: number;
    savings: number;
  };
  isEligible: boolean;
  ineligibilityReasons: string[];
  duration: {
    nights: number;
    isHalfDay: boolean;
  };
  restrictions: {
    minStay?: number;
    maxStay?: number;
    minAdvanceBooking?: number;
    maxAdvanceBooking?: number;
    minGuests?: number;
    maxGuests?: number;
  };
  amenities: {
    included: Amenity[];
    extraCost: Amenity[];
  };
  cancellation: {
    type: string;
    description: string;
    freeCancellationDays?: number;
    partialRefundDays?: number;
  };
}

interface BookingCalculationResult {
  property: {
    id: string;
    name: string;
  };
  booking: {
    checkIn: Date;
    checkOut?: Date;
    isHalfDay: boolean;
    nights: number;
    guests: number;
  };
  basePricing: {
    total: number;
    breakdown: Array<{
      date: Date;
      price: number;
      isHalfDay: boolean;
    }>;
  };
  options: BookingOption[];
}
```

### 2. **Reservation System Interfaces**

```typescript
interface Reservation {
  id: string;
  ratePlanId: string;
  guestId: string;
  propertyId?: string; // Available through ratePlan.property
  
  // Booking details
  checkInDate: Date;
  checkOutDate?: Date;
  isHalfDay: boolean;
  guestCount: number;
  
  // Pricing
  basePrice: number;
  modifier: number;
  totalPrice: number;
  commissionAmount: number;
  
  // Status
  status: 'Pending' | 'Confirmed' | 'Modified' | 'Cancelled' | 'NoShow' | 'Completed';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  
  // Relations
  ratePlan?: RatePlan;
  guest?: User;
  property?: Property;
  messages?: ReservationMessage[];
  review?: Review;
  
  createdAt: Date;
  updatedAt: Date;
}

interface ReservationMessage {
  id: string;
  reservationId: string;
  senderId: string;
  senderRole: 'Guest' | 'HomeOwner' | 'Manager';
  message: string;
  sentAt: Date;
}

interface Review {
  id: string;
  guestId: string;
  propertyId: string;
  reservationId?: string;
  
  // Rating
  overallRating: number;
  cleanlinessRating: number;
  accuracyRating: number;
  checkInRating: number;
  communicationRating: number;
  locationRating: number;
  valueRating: number;
  
  // Content
  title?: string;
  content?: string;
  wouldRecommend: boolean;
  
  // Response
  response?: string;
  responseDate?: Date;
  
  // Relations
  guest?: User;
  property?: Property;
  reservation?: Reservation;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🏗️ **Required Redux State Architecture**

### 1. **New Redux Slices Needed**

#### Property Pricing Slice
```typescript
// propertyPricingSlice.ts
interface PropertyPricingState {
  // Weekly pricing
  weeklyPricing: Record<string, WeeklyPricingData>; // propertyId -> pricing
  
  // Date overrides
  dateOverrides: Record<string, DateOverrideData[]>; // propertyId -> overrides
  
  // Calendar data
  pricingCalendars: Record<string, {
    startDate: Date;
    endDate: Date;
    calendar: PricingCalendarDay[];
  }>; // propertyId -> calendar
  
  // Form state
  currentPricingForm: WeeklyPricingData | null;
  currentOverrideForm: DateOverrideData | null;
  hasUnsavedChanges: boolean;
  validationErrors: Record<string, string>;
  
  // Loading states
  loadingWeeklyPricing: boolean;
  loadingOverrides: boolean;
  loadingCalendar: boolean;
  savingPricing: boolean;
  
  error: string | null;
}

// Actions needed:
- fetchWeeklyPricing(propertyId)
- updateWeeklyPricing(propertyId, data)
- fetchDateOverrides(propertyId)
- createDateOverrides(propertyId, overrides)
- deleteDataOverrides(propertyId, dates)
- fetchPricingCalendar(propertyId, startDate, endDate)
- getBasePrice(propertyId, date, isHalfDay)
```

#### Rate Plan Slice
```typescript
// ratePlanSlice.ts
interface RatePlanState {
  // Rate plans by property
  ratePlansByProperty: Record<string, RatePlan[]>; // propertyId -> rate plans
  
  // Individual rate plans
  ratePlans: Record<string, RatePlan>; // ratePlanId -> rate plan
  
  // Public rate plans (for guest booking)
  publicRatePlans: Record<string, RatePlan[]>; // propertyId -> public plans
  
  // Form management
  currentRatePlanForm: Partial<RatePlan> | null;
  originalRatePlanForm: RatePlan | null;
  hasUnsavedChanges: boolean;
  formValidationErrors: Record<string, string>;
  
  // Stats and metadata
  ratePlanStats: Record<string, any>; // ratePlanId -> stats
  modifierTypesMetadata: any | null;
  
  // Loading states
  loadingRatePlans: boolean;
  loadingRatePlan: boolean;
  savingRatePlan: boolean;
  deletingRatePlan: boolean;
  
  error: string | null;
}

// Actions needed:
- fetchRatePlansForProperty(propertyId)
- fetchPublicRatePlansForProperty(propertyId)
- fetchRatePlanById(ratePlanId)
- createRatePlan(propertyId, data)
- updateRatePlan(ratePlanId, data)
- deleteRatePlan(ratePlanId)
- toggleRatePlanStatus(ratePlanId, isActive)
- fetchRatePlanStats(ratePlanId)
- fetchModifierTypesMetadata()
```

#### Booking Engine Slice
```typescript
// bookingSlice.ts
interface BookingState {
  // Search criteria
  currentSearchCriteria: BookingSearchCriteria | null;
  
  // Results
  bookingResults: Record<string, BookingCalculationResult>; // cache by criteria hash
  
  // Selected options
  selectedBookingOption: BookingOption | null;
  
  // Form state for booking flow
  bookingForm: {
    propertyId?: string;
    checkInDate?: Date;
    checkOutDate?: Date;
    isHalfDay: boolean;
    guestCount: number;
    selectedRatePlanId?: string;
  };
  
  // Loading states
  calculatingOptions: boolean;
  bookingInProgress: boolean;
  
  error: string | null;
}

// Actions needed:
- calculateBookingOptions(criteria)
- selectBookingOption(option)
- updateBookingForm(field, value)
- clearBookingSearch()
- createReservation(bookingData)
```

#### Reservation Management Slice  
```typescript
// reservationSlice.ts
interface ReservationState {
  // Reservations
  reservations: Reservation[];
  currentReservation: Reservation | null;
  
  // Messages
  reservationMessages: Record<string, ReservationMessage[]>; // reservationId -> messages
  
  // Reviews
  reviews: Record<string, Review>; // reviewId -> review
  
  // Filters
  filters: {
    status?: ReservationStatus;
    startDate?: Date;
    endDate?: Date;
    propertyId?: string;
  };
  
  // Form states
  messageForm: {
    reservationId?: string;
    message: string;
  };
  reviewResponseForm: {
    reviewId?: string;
    response: string;
  };
  
  // Loading states
  loadingReservations: boolean;
  loadingReservation: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  updatingReservation: boolean;
  
  error: string | null;
}

// Actions needed:
- fetchReservations(filters?)
- fetchReservationById(id)
- updateReservation(id, data)
- reportNoShow(id, reason)
- sendMessage(id, message)
- fetchMessages(id)
- respondToReview(reviewId, response)
```

---

## 🎨 **Component Architecture Impact**

### 1. **New Page Components Needed**

#### Property Pricing Management Pages
```typescript
// PropertyPricingManager.tsx - Unified create/edit pricing
interface PropertyPricingManagerProps {
  propertyId: string;
}

// RatePlanManager.tsx - Unified create/edit rate plans  
interface RatePlanManagerProps {
  ratePlanId?: string; // 'new' for create mode
  propertyId: string;
}

// BookingEngine.tsx - Guest booking flow
interface BookingEngineProps {
  propertyId: string;
  embedded?: boolean; // For embedding in property details
}

// ReservationManager.tsx - Reservation management
interface ReservationManagerProps {
  reservationId?: string;
}

// ReservationList.tsx - List all reservations with filters
interface ReservationListProps {
  propertyId?: string; // Filter by property if provided
}
```

#### Form Components
```typescript
// WeeklyPricingForm.tsx - Weekly base pricing form
// DateOverridesForm.tsx - Date-specific overrides form  
// RatePlanForm.tsx - Rate plan configuration form
// BookingCriteriaForm.tsx - Booking search form
// ReservationMessageForm.tsx - Send message form
// ReviewResponseForm.tsx - Respond to review form
```

#### Display Components
```typescript
// PricingCalendar.tsx - Calendar view of pricing
// BookingOptionCard.tsx - Individual booking option display
// RatePlanCard.tsx - Rate plan summary card
// ReservationCard.tsx - Reservation summary card
// PricingBreakdown.tsx - Price calculation breakdown
// ReservationTimeline.tsx - Reservation status timeline
```

### 2. **Enhanced Navigation Structure**

```typescript
// Routes.tsx updates needed
export const routes = createRoutes({
  // ... existing routes
  
  // Pricing Management
  'property-pricing': {
    component: ({ propertyId }: { propertyId: string }) => 
      <PropertyPricingManager propertyId={propertyId} />,
    icon: <FaDollarSign />,
    label: 'Pricing',
    showInNav: true,
  },
  
  // Rate Plan Management
  'rate-plan-create': {
    component: ({ propertyId }: { propertyId: string }) => 
      <RatePlanManager ratePlanId="new" propertyId={propertyId} />,
    icon: <FaPlus />,
    label: 'Create Rate Plan',
    showInNav: false,
  },
  'rate-plan-edit': {
    component: ({ ratePlanId, propertyId }: { ratePlanId: string; propertyId: string }) => 
      <RatePlanManager ratePlanId={ratePlanId} propertyId={propertyId} />,
    icon: <FaEdit />,
    label: 'Edit Rate Plan',
    showInNav: false,
  },
  
  // Booking Engine
  'booking': {
    component: ({ propertyId }: { propertyId: string }) => 
      <BookingEngine propertyId={propertyId} />,
    icon: <FaCalendarCheck />,
    label: 'Book Now',
    showInNav: false,
  },
  
  // Reservation Management
  'reservations': {
    component: ReservationList,
    icon: <FaBookmark />,
    label: 'Reservations',
    showInNav: true,
  },
  'reservation-details': {
    component: ({ reservationId }: { reservationId: string }) => 
      <ReservationManager reservationId={reservationId} />,
    icon: <FaEye />,
    label: 'Reservation Details',
    showInNav: false,
  },
});
```

---

## 🔄 **API Integration Patterns**

### 1. **Async Thunk Patterns**

```typescript
// Example: Rate Plan Management
export const createRatePlanAsync = createAsyncThunk(
  'ratePlans/create',
  async (params: { propertyId: string; data: Partial<RatePlan> }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/properties/${params.propertyId}/rate-plans`, params.data);
      return response.data.ratePlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create rate plan');
    }
  }
);

// Example: Booking Engine
export const calculateBookingOptionsAsync = createAsyncThunk(
  'booking/calculateOptions',
  async (criteria: BookingSearchCriteria, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/properties/${criteria.propertyId}/calculate-booking`, criteria);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to calculate booking options');
    }
  }
);
```

### 2. **Real-time Updates**

```typescript
// WebSocket integration for reservation updates
export const useReservationUpdates = (reservationId: string) => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/reservations/${reservationId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      dispatch(updateReservationRealtime(update));
    };
    
    return () => ws.close();
  }, [reservationId, dispatch]);
};
```

---

## 🚀 **Implementation Recommendations**

### 1. **Phased Implementation Approach**

#### Phase 1: Property Pricing System (Week 1-2)
- Implement WeeklyPricingForm and DateOverridesForm
- Create PropertyPricingManager with AppShell integration
- Set up propertyPricingSlice with async thunks
- Add PricingCalendar component

#### Phase 2: Rate Plan Management (Week 3-4)  
- Implement RatePlanForm with all features
- Create RatePlanManager using unified pattern
- Set up ratePlanSlice with full CRUD operations
- Add RatePlanCard and RatePlanList components

#### Phase 3: Booking Engine (Week 5-6)
- Implement BookingEngine with search flow
- Create BookingOptionCard and PricingBreakdown
- Set up bookingSlice with calculation logic
- Integrate with existing property browsing

#### Phase 4: Reservation Management (Week 7-8)
- Implement ReservationList and ReservationManager
- Create messaging and review response features
- Set up reservationSlice with full functionality
- Add real-time updates for reservations

### 2. **Code Reuse Strategies**

#### Shared Form Components
```typescript
// BaseFormField.tsx - Reusable form field wrapper
// CurrencyInput.tsx - Consistent currency formatting
// DateRangePicker.tsx - Date range selection
// GuestCountSelector.tsx - Guest count with validation
```

#### Shared Business Logic Hooks
```typescript
// usePricingCalculations.ts - Price calculation logic
// useBookingValidation.ts - Booking criteria validation
// useReservationStatus.ts - Status management logic
// useDateFormatting.ts - Consistent date formatting
```

### 3. **Performance Optimizations**

```typescript
// Memoization for expensive calculations
const BookingOptionCard = memo(({ option }: { option: BookingOption }) => {
  const formattedPrice = useMemo(() => 
    formatCurrency(option.pricing.totalPrice), [option.pricing.totalPrice]);
  
  return <Card>{/* component JSX */}</Card>;
});

// Virtual scrolling for large lists
const ReservationList = () => {
  const [windowedItems, setWindowedItems] = useState<Reservation[]>([]);
  
  useVirtualization({
    items: reservations,
    itemHeight: 120,
    containerHeight: 600,
    onVisibleItemsChange: setWindowedItems
  });
  
  return (
    <VirtualizedList>
      {windowedItems.map(reservation => 
        <ReservationCard key={reservation.id} reservation={reservation} />
      )}
    </VirtualizedList>
  );
};
```

### 4. **Testing Strategy**

```typescript
// Component Testing
describe('RatePlanManager', () => {
  it('should create rate plan with valid data', async () => {
    render(<RatePlanManager ratePlanId="new" propertyId="test-id" />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Rate Plan Name'), { 
      target: { value: 'Weekend Special' } 
    });
    
    // Submit and verify
    fireEvent.click(screen.getByText('Save Rate Plan'));
    await waitFor(() => expect(mockCreateRatePlan).toHaveBeenCalled());
  });
});

// Redux Testing  
describe('ratePlanSlice', () => {
  it('should handle createRatePlanAsync.fulfilled', () => {
    const newRatePlan = { id: '1', name: 'Test Plan', propertyId: 'prop-1' };
    const action = { type: createRatePlanAsync.fulfilled.type, payload: newRatePlan };
    
    const state = ratePlanReducer(initialState, action);
    expect(state.ratePlans['1']).toEqual(newRatePlan);
  });
});
```

---

## ⚠️ **Breaking Changes & Migration**

### 1. **API Response Format Changes**
- Reservation objects now include `property` field
- Rate plan responses include expanded `features` and `cancellationPolicy`
- Booking calculation returns structured `BookingCalculationResult`

### 2. **Required Dependencies**
```json
{
  "dependencies": {
    "react-window": "^1.8.8",
    "react-window-infinite-loader": "^1.0.9",
    "date-fns": "^2.30.0",
    "currency.js": "^2.0.4"
  }
}
```

### 3. **Environment Variables**
```env
# Add to .env files
REACT_APP_WEBSOCKET_URL=ws://localhost:3001
REACT_APP_CURRENCY_LOCALE=en-AE
REACT_APP_DEFAULT_CURRENCY=AED
```

---

## ✅ **Implementation Checklist**

### TypeScript Interfaces
- [ ] Create property pricing interfaces
- [ ] Create rate plan interfaces  
- [ ] Create booking engine interfaces
- [ ] Create reservation management interfaces
- [ ] Update existing interfaces with new fields

### Redux State Management
- [ ] Implement propertyPricingSlice
- [ ] Implement ratePlanSlice
- [ ] Implement bookingSlice
- [ ] Implement reservationSlice
- [ ] Update existing slices for compatibility

### Component Architecture
- [ ] Create PropertyPricingManager
- [ ] Create RatePlanManager  
- [ ] Create BookingEngine
- [ ] Create ReservationManager
- [ ] Create supporting components

### API Integration
- [ ] Implement async thunks for all new endpoints
- [ ] Add error handling and loading states
- [ ] Implement caching strategies
- [ ] Add real-time updates where needed

### Testing
- [ ] Unit tests for all Redux slices
- [ ] Component tests for all new components
- [ ] Integration tests for booking flows
- [ ] E2E tests for complete workflows

### Documentation
- [ ] Update component documentation
- [ ] Create API integration guides
- [ ] Document new routing patterns
- [ ] Create user flow diagrams

---

## 🎯 **Success Metrics**

### Technical Metrics
- All 80+ API endpoints properly integrated
- 100% TypeScript coverage for new interfaces
- Redux state properly managing all new data
- Components following established patterns

### User Experience Metrics
- Property owners can set up pricing in < 5 minutes
- Rate plan creation/editing is intuitive
- Booking engine provides clear options
- Reservation management is efficient

### Performance Metrics
- Booking calculation completes in < 2 seconds
- Large reservation lists scroll smoothly
- Real-time updates have < 100ms latency
- Form interactions feel responsive

---

Built with ❤️ for the Wezo.ae platform - Ready for enterprise-scale property rental management!