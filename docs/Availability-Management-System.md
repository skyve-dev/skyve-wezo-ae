# Availability Management System

## Overview
The Availability Management System provides property owners with comprehensive calendar control to block/unblock dates, prevent overbooking, and optimize revenue through intelligent date management.

## Database Schema

### Availability Model
```prisma
model Availability {
  id          String   @id @default(uuid()) 
  propertyId  String   
  property    Property @relation(fields: [propertyId], references: [propertyId])
  date        DateTime  // Specific date for this availability entry
  isAvailable Boolean  @default(true)  // True if available, false if blocked
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([propertyId, date])  // One availability entry per property per date
}
```

### Key Characteristics
- **One record per property per date** - Prevents data conflicts
- **Boolean availability flag** - Simple true/false availability
- **Audit trail** - Track when changes were made
- **Property relationship** - Links to Property model

## User Interaction Design

### 1. Calendar Interface (Primary Interaction)

#### Visual Calendar View
- **Monthly/Weekly grid** displaying all dates
- **Color coding system**:
  - 🟢 **Green** = Available for booking
  - 🔴 **Red** = Blocked/Unavailable  
  - 🟡 **Yellow** = Already booked (from reservations)
- **Click to toggle** individual dates
- **Drag to select** date ranges for bulk operations

#### Calendar Features
- Responsive design for mobile/desktop
- Month/week/day view options
- Quick navigation between months
- Today highlighting
- Weekend differentiation

### 2. Blocking Scenarios & UI Flows

#### A. Manual Date Blocking

**Common Use Cases:**
- "Block Dec 15-20 for renovation"
- "Family visiting, block entire July"
- "Block weekends only for next 3 months"

**UI Flow:**
1. **Select dates** on calendar (single click or drag)
2. **Choose blocking reason** from dropdown:
   - Maintenance/Renovation
   - Personal Use
   - Seasonal Closure
   - Other (with notes field)
3. **Optional notes** for internal tracking
4. **Confirm action** → Creates Availability records with `isAvailable = false`

#### B. Bulk Operations

**Common Patterns:**
- Block all Mondays for 6 months
- Open availability for summer season (June-Aug)
- Close property for winter (Dec-Feb)

**UI Controls:**
- **Date range picker** with preset options
- **Recurring patterns** (daily, weekly, monthly)
- **Seasonal templates** (winter closure, summer peak)
- **Import/Export** functionality for advanced users

### 3. Integration Points

#### A. Booking Prevention
- **Real-time validation**: Check availability before showing booking options
- **Search filtering**: Only display properties with available dates
- **Guest notifications**: Clear messaging about unavailable dates

#### B. Reservation Conflicts
- **Pre-booking validation**: Ensure no conflicts with blocked dates
- **Overbooking prevention**: Cross-reference reservations and availability
- **Admin override capability**: For emergency rebooking scenarios

#### C. Rate Plan Coordination
- **Smart suggestions**: Recommend pausing rate plans during blocked periods
- **Revenue impact display**: Show estimated revenue loss from blocking
- **Automatic adjustments**: Option to sync rate plans with availability

### 4. Mobile-First Experience

#### Quick Actions
- **Swipe gestures**: 
  - Swipe right on date → Block
  - Swipe left on date → Unblock
- **Voice commands**: "Block next weekend", "Open July for bookings"
- **Smart suggestions**: Proactive blocking recommendations

#### Dashboard Widgets
- **Availability overview**: "45 days available this month"
- **Upcoming blocks**: "Maintenance scheduled Dec 15-20"  
- **Revenue impact**: "Blocking these dates = AED 2,400 potential loss"

### 5. Advanced Features

#### A. Predictive Intelligence
```
Smart Suggestions:
• "No bookings for Dec 1-7, consider blocking for maintenance?"
• "High demand period ahead - ensure dates are available"
• "Seasonal pattern detected - auto-block winter months?"
```

#### B. Bulk Management
```
Property Group Features:
• "Apply same availability to all compound properties"
• "Sync maintenance schedule across portfolio"
• "Copy availability pattern from previous year"
```

#### C. Integration Alerts
```
Proactive Notifications:
• "New booking request for blocked date - approve override?"
• "Maintenance period ending tomorrow - unblock dates?"
• "Rate plan active but dates blocked - review pricing?"
```

## User Workflow Examples

### Scenario 1: Seasonal Property Closure
```
Flow:
1. Property owner opens calendar in November
2. Bulk selects Dec 1 - March 31 using date range picker
3. Selects "Seasonal Closure" template
4. System creates 120 Availability records with isAvailable=false
5. Automatic rate plan suspension notification for winter period
6. Revenue impact summary displayed
```

### Scenario 2: Emergency Maintenance
```
Flow:
1. Urgent situation: AC system failure
2. Quick action: "Block next 3 days" button
3. System checks for existing bookings in affected period
4. Offers rebooking assistance for affected guests
5. Creates availability blocks + sends guest notifications
6. Maintenance reminder scheduled
```

### Scenario 3: Revenue Optimization
```
Flow:
1. Owner reviews calendar showing low-demand period
2. System displays consecutive unbooked days
3. Smart suggestion appears: "Block for maintenance?"
4. Owner reviews revenue impact and confirms
5. Creates availability blocks automatically
6. Maintenance scheduling tool integration
```

## Technical Implementation

### Database Operations
```sql
-- Block a date
INSERT INTO Availability (propertyId, date, isAvailable) 
VALUES ('prop-123', '2024-12-15', false)
ON CONFLICT (propertyId, date) 
DO UPDATE SET isAvailable = false;

-- Check availability for booking
SELECT date FROM Availability 
WHERE propertyId = 'prop-123' 
AND date BETWEEN '2024-12-10' AND '2024-12-20'
AND isAvailable = false;

-- Bulk block date range
INSERT INTO Availability (propertyId, date, isAvailable)
SELECT 'prop-123', generate_series('2024-12-01'::date, '2024-12-31'::date, '1 day'::interval), false;
```

### API Endpoints
```typescript
// Get availability for property
GET /api/properties/{propertyId}/availability?start=2024-12-01&end=2024-12-31

// Update availability
POST /api/properties/{propertyId}/availability
{
  "dates": ["2024-12-15", "2024-12-16"],
  "isAvailable": false,
  "reason": "maintenance",
  "notes": "AC system replacement"
}

// Bulk operations
POST /api/properties/{propertyId}/availability/bulk
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-31", 
  "pattern": "weekends",
  "isAvailable": false
}
```

### Frontend Components
```typescript
// Calendar component structure
<PropertyCalendar>
  <CalendarHeader />
  <CalendarGrid>
    <CalendarDay 
      date={date}
      isAvailable={availability[date]} 
      isBooked={reservations[date]}
      onClick={handleDateClick}
    />
  </CalendarGrid>
  <CalendarControls>
    <BulkBlockButton />
    <DateRangePicker />
    <BlockingReasonSelector />
  </CalendarControls>
</PropertyCalendar>
```

## Data Architecture Benefits

This Availability model design provides:

- **Granular Control** - Per-date precision for any blocking scenario
- **Efficient Queries** - Unique constraint prevents conflicts and enables fast lookups
- **Audit Trail** - Complete history of availability changes with timestamps
- **Scalability** - Handles any property size and booking volume
- **Flexibility** - Works with any booking system integration
- **Data Integrity** - Prevents overbooking through database constraints

## Integration with Other Systems

### Rate Plans
- Coordinate availability blocks with rate plan schedules
- Automatic rate plan suspension during blocked periods
- Revenue impact calculations

### Reservations
- Real-time availability checking during booking flow
- Conflict prevention and resolution
- Guest communication for affected bookings

### Property Management
- Maintenance scheduling integration
- Multi-property bulk operations
- Reporting and analytics

## Mobile Responsive Design

### Touch Interactions
- **Tap**: Select single date
- **Long press**: Multi-select mode
- **Swipe**: Quick block/unblock actions
- **Pinch**: Zoom calendar view

### Mobile-Optimized Views
- Compact monthly view
- Swipeable date navigation
- Bottom sheet controls
- One-handed operation support

---

*This availability management system provides property owners with intuitive, powerful calendar control while maintaining data integrity and preventing booking conflicts.*