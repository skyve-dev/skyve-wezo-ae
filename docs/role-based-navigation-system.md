# Role-Based Navigation System

## Overview
This document outlines the comprehensive requirements for implementing a role-based navigation system with public property viewing and booking functionality for the Wezo.ae platform.

## User Roles & Permissions

### 1. User Role Types
Based on Prisma schema `UserRole` enum:
- **Tenant** - Guest users who browse and book properties
- **HomeOwner** - Property owners who manage listings  
- **Manager** - Platform managers with super-user privileges

### 2. Role Capabilities

#### Tenant (Guest)
- Browse public properties
- Make bookings (with or without account)
- View their bookings (`my-bookings`)
- Communicate with hosts (`inbox`)
- Write reviews (`my-reviews`) 
- Access support
- **Cannot toggle roles** - fixed in Guest mode

#### HomeOwner (Host)
- All Tenant capabilities when in Guest mode
- Manage owned properties (`properties`)
- View dashboard with performance metrics
- Manage availability calendar
- Create and manage rate plans
- View reservations and earnings
- **Can toggle between Guest ↔ HomeOwner modes**

#### Manager (Super User)
- All HomeOwner capabilities
- View and manage ALL properties in system (not just owned)
- Access all financial data across all properties
- Delete any property from any owner
- **Can toggle between Guest ↔ HomeOwner ↔ Manager modes**

### 3. Role Promotion Logic

#### Automatic Promotion
- **Tenant → HomeOwner**: Immediately after successful property creation (even in Draft status)
- **HomeOwner → Manager**: Admin promotion only

#### Role Assignment Rules
- New user registration: Default **Tenant** role
- Guest checkout (no account): Auto-create **Tenant** account with generated password
- Property creation success: Auto-promote to **HomeOwner** role

## Navigation Architecture

### 1. Role-Based Navigation Items

#### Tenant Navigation
```
- /properties (Browse Properties)
- /my-bookings 
- /inbox (Guest communications)
- /my-reviews
- /support
+ "Start Hosting" button (prominent CTA)
```

#### HomeOwner Navigation  
```
- /dashboard
- /properties (My Properties)
- /availability
- /rate-plans
- /pricing-calendar
- /reservations
- /inbox (Host communications)
- /reviews (Received reviews)
- /finance
- /support
```

#### Manager Navigation
```
Same as HomeOwner (manages ALL properties instead of owned properties)
```

### 2. Page Content by Role

#### `/properties` URL Strategy
Same URL, different content based on authentication state:

- **Unauthenticated**: "Available Properties" (public browse)
- **Tenant**: "Browse Properties" (authenticated browse)  
- **HomeOwner**: "My Properties" (owned properties management)
- **Manager**: "All Properties" (system-wide property management)

#### Component Strategy
Use same components with different data/actions based on role:
- Same Redux `propertySlice` with role-based data fetching
- Same UI components with conditional features
- Role-specific action buttons (Edit/Delete vs View/Book)

## Role Toggle System

### 1. UI Implementation

#### Toggle Button Location
- **Location**: AppShell header, top-right area
- **Icon**: `FaUserCircle` with role-specific colors:
  - 🔵 Blue: Guest
  - 🟢 Green: Host  
  - 🔴 Red: Manager
- **Text**: Short role names ("Guest" / "Host" / "Manager")
- **Tooltip**: Shows current role on hover

#### SlidingDrawer Interface
- **Animation**: Slide from bottom
- **Trigger**: Click role toggle button
- **Close**: Close button + tap outside to close

#### SlidingDrawer Content
```
┌─────────────────────────────────┐
│ Hi, [FirstName]                 │
│ [user@email.com]               │
│ Current: Guest Mode            │
├─────────────────────────────────┤
│                                │
│ 🏠 Guest                       │
│ Browse and book properties     │
│                                │
│ 🏡 HomeOwner                   │
│ Manage your listings           │
│                                │
│ ⚙️ Manager                      │
│ Manage all properties          │
│ (Hidden if not available)      │
│                                │
├─────────────────────────────────┤
│            [Close]             │
└─────────────────────────────────┘
```

### 2. Role Switching Logic

#### Availability Rules
- **Tenant**: No toggle options (fixed in Guest mode)
- **HomeOwner**: Can toggle Guest ↔ HomeOwner  
- **Manager**: Can toggle Guest ↔ HomeOwner ↔ Manager

#### Switching Behavior
1. User selects new role in SlidingDrawer
2. Show confirmation dialog: "Switch to [Role] Mode?" + "Cancel"
3. If confirmed:
   - Show toast: "Switching to [Role] mode..."
   - Clear previous role's Redux data
   - Update role preference in localStorage  
   - Redirect to appropriate page:
     - **Guest mode** → `/properties` (browse)
     - **HomeOwner mode** → `/dashboard` 
     - **Manager mode** → `/properties` (all properties)
4. Lazy load new role's data when navigating to specific pages

#### Data Management
- **Session Storage**: Redux state for current session
- **Persistence**: localStorage key `user_role_preference`  
- **Data Strategy**: Clear all previous data on role switch, fetch fresh data
- **Auto-Selection**: On app reload, auto-select last used role but fetch fresh data

## Public Property System

### 1. Unauthenticated Access
- **URL**: `/properties` accessible without login
- **Content**: Public property browse with booking capability
- **Navigation**: No navigation shown (clean public interface)

### 2. Guest Booking Flow
- **Booking Process**: Direct booking without account creation
- **Data Collection**: Contact details (name, email, phone)
- **Account Creation**: Auto-create Tenant account with generated password
- **Email Notification**: "Your Wezo.ae Account & Booking Confirmation"
  - Include booking details AND login credentials
  - Provide "Set Your Password" link for customization

### 3. Booking Confirmation
- **Confirmation Page**: Show booking confirmation with reservation number
- **Email Confirmation**: Send detailed booking confirmation
- **No Account Suggestion**: Don't prompt account creation (already auto-created)

## API Architecture

### 1. Public Endpoints (No Authentication)
```
GET /api/public/properties           - Browse all available properties
GET /api/public/properties/:id       - Get property details  
GET /api/public/properties/:id/availability - Check availability
GET /api/public/properties/:id/rates - Get rate plans
POST /api/public/reservations        - Create booking (auto-create account)
```

### 2. Role-Based Endpoints
```
GET /api/properties/my-properties    - HomeOwner's properties
GET /api/properties/all-properties   - Manager's all properties (admin)
GET /api/bookings/my-bookings       - Tenant's bookings
```

### 3. Role Management
- **Current Role**: Store in Redux authSlice + localStorage
- **Role Detection**: Check on every app load, auto-detect based on:
  - Has properties → Default HomeOwner mode
  - Only has bookings → Default Guest mode  
  - First login → Default Guest mode
- **Priority**: HomeOwner mode if user has both properties and bookings

## User Experience Flows

### 1. New User Journey
1. **Registration** → Default Tenant role
2. **Welcome Modal**: "Welcome to Wezo.ae!" with browsing explanation
   - Buttons: "Start Browsing" / "Maybe Later"
   - Auto-dismiss after 10 seconds
3. **Browse Properties** → Can book immediately
4. **"Start Hosting" Button** → Show benefits modal

### 2. Start Hosting Flow
1. **Click "Start Hosting"** in Tenant navigation
2. **Benefits Modal** with:
   - Earning potential information
   - Platform benefits (commission structure, support)
   - Getting started steps (KYU form, property listing process)
   - Buttons: "Get Started" / "Maybe Later"
3. **"Get Started"** → Close modal, navigate to property creation (stay in Guest mode)
4. **Property Creation Success** → Auto-promote to HomeOwner + success toast
5. **Success Toast**: "You're now a Host! Welcome to hosting."

### 3. Role Switching Experience
1. **Click Role Toggle** (FaUserCircle with current role)
2. **SlidingDrawer Opens** with available role options
3. **Select New Role** → Confirmation dialog with explanation
4. **Confirm Switch** → Loading toast + redirect + fresh data load
5. **Error Handling**: Stay in current role + error toast + retry option

### 4. Guest Checkout Flow
1. **Select Property** → Browse without account
2. **Book Property** → Provide contact details
3. **Create Booking** → Auto-create Tenant account with generated password
4. **Email Sent**: Account credentials + booking confirmation + password customization link
5. **Confirmation Page**: Show booking details with reservation number

## Technical Implementation

### 1. Redux State Management
```typescript
// authSlice enhancement
authSlice: {
  user: { id, role, isAuthenticated },
  currentViewMode: 'Guest' | 'HomeOwner' | 'Manager',
  rolePreference: string // from localStorage
}

// propertySlice strategy  
propertySlice: {
  properties: Property[], // Role-filtered properties
  loading: boolean,
  error: string | null
}
```

### 2. Component Architecture
```
src/
├── pages/
│   ├── public/
│   │   ├── PropertyView.tsx         # Public property details
│   │   ├── BookingFlow.tsx         # Public booking process
│   │   └── PropertiesBrowse.tsx    # Public property browsing
│   ├── PropertiesList.tsx          # Role-aware properties page
│   └── ...
├── components/
│   ├── RoleToggle.tsx              # FaUserCircle button + SlidingDrawer
│   ├── RoleSlidingDrawer.tsx       # Role selection interface
│   └── RoleProtectedRoute.tsx      # Route protection by role
```

### 3. Route Configuration
```typescript
// Enhanced routes with role information
'properties': {
  component: PropertiesList,
  roles: ['Guest', 'HomeOwner', 'Manager'], // Multiple roles, different views
  isPublic: true, // Accessible without authentication
  titles: {
    unauthenticated: 'Available Properties',
    Guest: 'Browse Properties', 
    HomeOwner: 'My Properties',
    Manager: 'All Properties'
  }
}
```

### 4. Error Handling & Loading States
- **Role Switch Error**: Stay in current role + error toast
- **Data Loading**: "Switching to [Role] mode..." toast
- **Network Errors**: Retry mechanism with user feedback
- **Fallback Strategy**: Default to Guest mode on critical errors

## Security Considerations

### 1. Role Validation
- **Server-side validation**: Always verify role permissions on API calls
- **Client-side protection**: Hide UI elements based on role, but validate server-side  
- **Route protection**: Ensure managers can only access manager routes if role verified

### 2. Data Exposure
- **Public endpoints**: Only expose necessary property data for browsing
- **Role-based data**: Filter sensitive information based on user role
- **Manager access**: Verify manager role before exposing all properties data

### 3. Account Creation Security  
- **Auto-generated passwords**: Use secure random password generation
- **Email verification**: Send secure password reset link for account customization
- **Rate limiting**: Implement rate limiting on booking/account creation endpoints

## Success Metrics

### 1. User Experience Metrics
- **Role switching completion rate**: Users successfully switching between modes
- **Guest-to-host conversion**: Percentage of guests who become hosts
- **Booking completion rate**: Unauthenticated users completing bookings

### 2. Technical Metrics
- **Page load performance**: Fast role-specific data loading
- **Error rates**: Minimal errors during role switching
- **API response times**: Efficient role-based data fetching

## Future Enhancements

### 1. Advanced Role Management
- **Custom permissions**: Fine-grained permission system beyond basic roles
- **Team management**: Multiple managers per property
- **Role delegation**: Temporary role assignments

### 2. Enhanced User Experience
- **Role-specific onboarding**: Tailored tutorials for each role
- **Smart role suggestions**: AI-powered role recommendations
- **Cross-role notifications**: Seamless communication across role contexts

---

This document provides the complete specification for implementing the role-based navigation system. All features should be implemented following the established patterns in the existing codebase, particularly the AppShell navigation system and Redux state management approaches.