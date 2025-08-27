# Platform Pages Roadmap - Wezo.ae

## Executive Summary
This document outlines the complete page requirements for Wezo.ae property rental platform based on the comprehensive Prisma schema analysis. It identifies existing pages, missing critical features, and provides a structured implementation roadmap.

## Table of Contents
- [Current State Analysis](#current-state-analysis)
- [Gap Analysis](#gap-analysis)
- [Missing Pages Requirements](#missing-pages-requirements)
- [Enhancement Requirements](#enhancement-requirements)
- [Implementation Roadmap](#implementation-roadmap)
- [Navigation Structure](#navigation-structure)
- [Technical Specifications](#technical-specifications)

## Current State Analysis

### Existing Pages (60% Coverage)
| Page | Path | Coverage | Status |
|------|------|----------|--------|
| Dashboard | `/dashboard` | Basic stats & overview | ✅ Complete |
| Properties List | `/properties` | Property management | ✅ Complete |
| Property Edit | `/property-edit/:id` | Create/edit with tabs | ⚠️ Needs enhancement |
| Availability | `/availability` | Calendar management | ⚠️ Needs enhancement |
| Reservations | `/reservations` | Booking management | ⚠️ Needs enhancement |
| Inbox | `/inbox` | Messages | ✅ Complete |
| Finance | `/finance` | Financial overview | ⚠️ Needs enhancement |
| Reviews | `/reviews` | Guest feedback | ✅ Complete |
| Support | `/support` | Support tickets | ✅ Complete |

### Coverage by Domain
- **Property Management**: 80% complete
- **Pricing & Revenue**: 30% complete (major gap)
- **Bookings & Availability**: 70% complete
- **Financial & Compliance**: 40% complete (critical gap)
- **Communication**: 90% complete
- **Security & KYC**: 0% complete (critical gap)
- **Analytics & Insights**: 10% complete

## Gap Analysis

### Critical Missing Features
1. **Multi-Rate Plan Management** - No support for multiple pricing strategies
2. **Dynamic Daily Pricing** - Cannot set specific prices per date
3. **Booking Restrictions** - No interface for min/max stay, arrival rules
4. **KYC Compliance** - No identity verification system
5. **Banking & Payouts** - No payment information management
6. **Security Reporting** - No incident reporting mechanism
7. **Promotions System** - No special offers management
8. **Property Groups** - No compound property management
9. **Analytics** - Limited performance insights
10. **Knowledge Base** - No self-service help system

## Missing Pages Requirements

### 1. Rate Plans Management
**Route**: `/rate-plans` or `/properties/:id/rate-plans`

**Purpose**: Enable properties to offer multiple pricing strategies to different guest segments

**Features Required**:
```typescript
interface RatePlansPage {
  // List View
  - Display all rate plans for selected property
  - Show active/inactive status
  - Quick enable/disable toggle
  - Performance metrics per plan
  
  // Create/Edit View
  - Rate plan name and description
  - Type selection (Flexible/Non-refundable/Custom)
  - Cancellation policy editor
  - Base discount/markup percentage
  - Included amenities (breakfast, late checkout, etc.)
  - Guest segment targeting
  
  // Actions
  - Clone existing rate plan
  - Set as default plan
  - Archive old plans
  - A/B testing setup
}
```

**UI Components Needed**:
- Rate plan card component
- Policy text editor
- Percentage slider
- Comparison table view

### 2. Dynamic Pricing Calendar
**Route**: `/pricing-calendar` or `/properties/:id/pricing`

**Purpose**: Visual interface for setting specific prices per date for each rate plan

**Features Required**:
```typescript
interface PricingCalendarPage {
  // Calendar View
  - Monthly/weekly/daily views
  - Color-coded pricing levels
  - Drag to select date ranges
  - Rate plan selector/filter
  
  // Price Management
  - Bulk price updates
  - Copy prices between rate plans
  - Seasonal templates
  - Holiday/event presets
  - Competitor price overlay
  
  // Quick Actions
  - Increase/decrease by percentage
  - Apply to weekends only
  - Apply to specific days of week
  - Import/export pricing data
}
```

**UI Components Needed**:
- Interactive calendar grid
- Price input cells
- Bulk edit modal
- Price comparison charts

### 3. Booking Restrictions
**Route**: `/restrictions` or `/properties/:id/restrictions`

**Purpose**: Configure booking rules and constraints per property or rate plan

**Features Required**:
```typescript
interface RestrictionsPage {
  // Restriction Types
  - Minimum length of stay (1-30 nights)
  - Maximum length of stay (1-365 nights)
  - No arrival days (checkboxes for each day)
  - No departure days (checkboxes for each day)
  - Advance booking window (min/max days)
  - Closed to arrival/departure periods
  
  // Application Scope
  - Apply globally to property
  - Apply to specific rate plans
  - Apply to date ranges
  - Seasonal restrictions
  
  // Templates
  - Weekend minimum stays
  - Holiday restrictions
  - Peak season rules
  - Business traveler friendly
}
```

**UI Components Needed**:
- Restriction rule builder
- Date range picker
- Day of week selector
- Visual restriction timeline

### 4. Promotions & Deals
**Route**: `/promotions`

**Purpose**: Create and manage special offers and deals

**Features Required**:
```typescript
interface PromotionsPage {
  // Promotion Types
  - Early bird discounts
  - Last-minute deals
  - Length of stay discounts
  - Seasonal promotions
  - Flash sales
  
  // Configuration
  - Discount percentage/fixed amount
  - Valid date ranges
  - Booking window requirements
  - Guest eligibility criteria
  - Promo codes
  - Maximum redemptions
  
  // Analytics
  - Redemption tracking
  - Revenue impact
  - Conversion rates
  - A/B test results
}
```

**UI Components Needed**:
- Promotion wizard
- Discount calculator
- Performance dashboard
- Promo code generator

### 5. KYC/Compliance Center
**Route**: `/compliance` or `/kyc-verification`

**Purpose**: Handle Know Your Customer requirements and regulatory compliance

**Features Required**:
```typescript
interface CompliancePage {
  // KYU Form Sections
  - Entity type selection (Individual/Business)
  - Personal information forms
  - Business registration details
  - Ultimate beneficial owners
  
  // Document Upload
  - Government ID upload
  - Proof of address upload
  - Business registration docs
  - Document expiry tracking
  
  // Status Tracking
  - Verification progress
  - Rejection reasons
  - Re-submission interface
  - Compliance score
  
  // Compliance Dashboard
  - Missing documents alerts
  - Expiring documents
  - Regulatory updates
  - Action items
}
```

**UI Components Needed**:
- Multi-step form wizard
- Document uploader with preview
- Verification status tracker
- Alert/notification system

### 6. Banking & Payouts
**Route**: `/banking` or `/payouts`

**Purpose**: Manage bank account details and track payments

**Features Required**:
```typescript
interface BankingPage {
  // Bank Account Management
  - Add/edit bank accounts
  - Account verification
  - Primary account selection
  - Multiple currency accounts
  
  // Payout Tracking
  - Pending payouts
  - Payout history
  - Transaction details
  - Payment schedules
  
  // Financial Documents
  - Invoice downloads
  - Tax documents
  - Monthly statements
  - Annual summaries
  
  // Settings
  - Payout frequency
  - Minimum payout threshold
  - Currency preferences
  - Tax information
}
```

**UI Components Needed**:
- Secure bank form
- Transaction table
- Document downloader
- Payment timeline

### 7. Security Center
**Route**: `/security`

**Purpose**: Security incident reporting and account protection

**Features Required**:
```typescript
interface SecurityCenterPage {
  // Security Dashboard
  - Recent login activity
  - Active sessions
  - Security score
  - Alerts and warnings
  
  // Incident Reporting
  - Report types (phishing, fraud, breach)
  - Incident description form
  - Evidence upload
  - Tracking number
  
  // Security Settings
  - Two-factor authentication
  - Login notifications
  - API key management
  - Trusted devices
  
  // Activity Log
  - Account changes
  - Property modifications
  - Financial transactions
  - Access attempts
}
```

**UI Components Needed**:
- Security dashboard cards
- Incident report form
- Activity timeline
- 2FA setup wizard

### 8. Analytics & Insights
**Route**: `/analytics`

**Purpose**: Comprehensive performance analytics and insights

**Features Required**:
```typescript
interface AnalyticsPage {
  // Performance Metrics
  - Occupancy rates
  - Average daily rate (ADR)
  - Revenue per available room (RevPAR)
  - Booking lead time
  
  // Revenue Analytics
  - Revenue by rate plan
  - Revenue by channel
  - Seasonal patterns
  - Forecast projections
  
  // Guest Analytics
  - Guest demographics
  - Booking patterns
  - Length of stay distribution
  - Repeat guest rate
  
  // Competitive Intelligence
  - Market pricing trends
  - Competitor occupancy estimates
  - Rate positioning
  - Market share analysis
  
  // Custom Reports
  - Report builder
  - Export functionality
  - Scheduled reports
  - Dashboard customization
}
```

**UI Components Needed**:
- Interactive charts (line, bar, pie)
- Data tables with filtering
- Date range selectors
- Export buttons
- Comparison tools

### 9. Property Groups
**Route**: `/property-groups`

**Purpose**: Manage multiple properties as a single entity (compounds, chains)

**Features Required**:
```typescript
interface PropertyGroupsPage {
  // Group Management
  - Create/edit groups
  - Add/remove properties
  - Group hierarchy
  - Shared amenities
  
  // Bulk Operations
  - Bulk pricing updates
  - Shared rate plans
  - Group restrictions
  - Collective availability
  
  // Group Analytics
  - Aggregated performance
  - Cross-property bookings
  - Group occupancy
  - Revenue distribution
}
```

**UI Components Needed**:
- Property group cards
- Drag-and-drop organizer
- Bulk action toolbar
- Group performance dashboard

### 10. Knowledge Base
**Route**: `/help` or `/knowledge-base`

**Purpose**: Self-service help and educational content

**Features Required**:
```typescript
interface KnowledgeBasePage {
  // Content Types
  - FAQs with categories
  - Step-by-step guides
  - Video tutorials
  - Best practices
  - Platform updates
  
  // Search & Discovery
  - Full-text search
  - Category browsing
  - Popular articles
  - Related content
  
  // User Interaction
  - Article ratings
  - Comments/questions
  - Bookmark articles
  - Print-friendly view
  
  // Content Management
  - Article versioning
  - Multi-language support
  - Rich media embedding
  - Download resources
}
```

**UI Components Needed**:
- Search interface
- Article viewer
- Category navigation
- Video player
- Feedback widgets

## Enhancement Requirements

### 1. Enhanced Pricing Tab (PropertyEdit)
**Current State**: Basic pricing input
**Required Enhancements**:
```typescript
- Rate plan selector dropdown
- Daily price override calendar widget
- Group size pricing matrix
- Promotion assignment interface
- Pricing preview calculator
- Competitor price comparison
```

### 2. Enhanced Availability Page
**Current State**: Basic calendar view
**Required Enhancements**:
```typescript
- Rate plan availability per date
- Bulk blocking with reasons
- Restriction visualization overlay
- Seasonal pattern templates
- Sync with external calendars
- Availability forecast
```

### 3. Enhanced Reservations Page
**Current State**: Basic booking list
**Required Enhancements**:
```typescript
- Rate plan information display
- Commission amount tracking
- No-show reporting button (48-hour window)
- Modification history timeline
- Guest communication panel
- Booking source analytics
```

### 4. Enhanced Finance Page
**Current State**: Basic financial overview
**Required Enhancements**:
```typescript
- Detailed revenue breakdown by rate plan
- Commission statements
- Payout schedule
- Tax summary
- Financial forecasting
- Export to accounting software
```

## Implementation Roadmap

### Phase 1: Revenue Optimization (Q1 2025)
**Duration**: 6-8 weeks
**Priority**: Critical

| Week | Deliverable | Team | Dependencies |
|------|-------------|------|--------------|
| 1-2 | Rate Plans Management | Frontend + Backend | Schema ready |
| 3-4 | Dynamic Pricing Calendar | Frontend + Backend | Rate plans complete |
| 5-6 | Booking Restrictions | Frontend + Backend | Rate plans complete |
| 7-8 | Enhanced Pricing Tab | Frontend | All pricing features |

**Success Metrics**:
- Properties can create 3+ rate plans
- Daily pricing overrides functional
- Restrictions properly enforced
- 20% increase in revenue optimization capability

### Phase 2: Compliance & Operations (Q1-Q2 2025)
**Duration**: 4-6 weeks
**Priority**: Critical

| Week | Deliverable | Team | Dependencies |
|------|-------------|------|--------------|
| 9-10 | KYC/Compliance Center | Frontend + Backend + Legal | Legal requirements |
| 11-12 | Banking & Payouts | Frontend + Backend + Finance | Payment gateway |
| 13-14 | Security Center | Frontend + Backend + Security | Security audit |

**Success Metrics**:
- 100% KYC compliance
- Automated payout system
- Zero security incidents
- Reduced support tickets by 30%

### Phase 3: Growth & Optimization (Q2 2025)
**Duration**: 6-8 weeks
**Priority**: High

| Week | Deliverable | Team | Dependencies |
|------|-------------|------|--------------|
| 15-16 | Promotions & Deals | Frontend + Backend | Pricing complete |
| 17-18 | Analytics & Insights | Frontend + Backend + Data | Data pipeline |
| 19-20 | Property Groups | Frontend + Backend | Core features stable |
| 21-22 | Knowledge Base | Frontend + Content | Content creation |

**Success Metrics**:
- 15% increase in bookings via promotions
- Data-driven pricing decisions
- Multi-property management enabled
- 50% reduction in support queries

### Phase 4: Enhancement Wave (Q2-Q3 2025)
**Duration**: 4 weeks
**Priority**: Medium

| Week | Deliverable | Team |
|------|-------------|------|
| 23 | Enhanced Availability | Frontend |
| 24 | Enhanced Reservations | Frontend |
| 25 | Enhanced Finance | Frontend |
| 26 | Testing & Polish | QA |

## Navigation Structure

### Primary Navigation
```
┌─────────────────────────────────────────┐
│ Wezo.ae Property Management Platform    │
├─────────────────────────────────────────┤
│ 📊 Dashboard                            │
│ 🏠 Properties ▼                        │
│   ├── My Properties                    │
│   ├── Property Groups (NEW)            │
│   └── Add New Property                 │
│ 💰 Revenue ▼ (NEW SECTION)             │
│   ├── Rate Plans                       │
│   ├── Pricing Calendar                 │
│   ├── Restrictions                     │
│   └── Promotions                       │
│ 📅 Bookings ▼                          │
│   ├── Reservations                     │
│   ├── Availability                     │
│   └── Reviews                          │
│ 💳 Financials ▼                        │
│   ├── Overview                         │
│   ├── Banking Details (NEW)            │
│   ├── Payouts (NEW)                    │
│   └── Invoices (NEW)                   │
│ 💬 Communications ▼                     │
│   ├── Inbox                            │
│   └── Notifications                    │
│ 📈 Analytics (NEW)                     │
│ ⚙️ Account ▼                           │
│   ├── Profile                          │
│   ├── KYC Verification (NEW)           │
│   ├── Security Center (NEW)            │
│   └── Settings                         │
│ ❓ Help ▼                              │
│   ├── Support Tickets                  │
│   ├── Knowledge Base (NEW)             │
│   └── Platform Guide (NEW)             │
└─────────────────────────────────────────┘
```

### Mobile Navigation Priority
1. Dashboard
2. Properties
3. Reservations
4. Inbox
5. More ▼ (Revenue, Financials, etc.)

## Technical Specifications

### Frontend Architecture
```typescript
// Folder Structure
src/
├── pages/
│   ├── revenue/
│   │   ├── RatePlans.tsx
│   │   ├── PricingCalendar.tsx
│   │   ├── Restrictions.tsx
│   │   └── Promotions.tsx
│   ├── compliance/
│   │   ├── KycVerification.tsx
│   │   └── ComplianceDashboard.tsx
│   ├── financial/
│   │   ├── BankingDetails.tsx
│   │   ├── Payouts.tsx
│   │   └── Invoices.tsx
│   ├── security/
│   │   └── SecurityCenter.tsx
│   ├── analytics/
│   │   └── Analytics.tsx
│   └── help/
│       └── KnowledgeBase.tsx
```

### State Management
```typescript
// Redux Slices Needed
store/
├── slices/
│   ├── ratePlanSlice.ts
│   ├── pricingSlice.ts
│   ├── restrictionSlice.ts
│   ├── promotionSlice.ts
│   ├── complianceSlice.ts
│   ├── bankingSlice.ts
│   ├── securitySlice.ts
│   └── analyticsSlice.ts
```

### API Endpoints Required
```typescript
// Rate Plans
GET    /api/properties/:id/rate-plans
POST   /api/properties/:id/rate-plans
PUT    /api/rate-plans/:id
DELETE /api/rate-plans/:id

// Pricing
GET    /api/rate-plans/:id/prices
PUT    /api/rate-plans/:id/prices/bulk
GET    /api/properties/:id/pricing-calendar

// Restrictions
GET    /api/properties/:id/restrictions
POST   /api/properties/:id/restrictions
PUT    /api/restrictions/:id
DELETE /api/restrictions/:id

// Promotions
GET    /api/properties/:id/promotions
POST   /api/promotions
PUT    /api/promotions/:id
DELETE /api/promotions/:id

// KYC
GET    /api/users/:id/kyc-status
POST   /api/users/:id/kyc-form
PUT    /api/users/:id/kyc-form
POST   /api/users/:id/kyc-documents

// Banking
GET    /api/users/:id/bank-accounts
POST   /api/users/:id/bank-accounts
PUT    /api/bank-accounts/:id
DELETE /api/bank-accounts/:id
GET    /api/users/:id/payouts

// Security
GET    /api/security/activity-log
POST   /api/security/report-incident
GET    /api/security/incidents
PUT    /api/security/2fa

// Analytics
GET    /api/analytics/dashboard
GET    /api/analytics/revenue
GET    /api/analytics/occupancy
GET    /api/analytics/guests
```

### Component Library Extensions
```typescript
// New Components Needed
components/
├── revenue/
│   ├── RatePlanCard.tsx
│   ├── PricingCalendarGrid.tsx
│   ├── RestrictionBuilder.tsx
│   └── PromotionWizard.tsx
├── compliance/
│   ├── KycFormWizard.tsx
│   ├── DocumentUploader.tsx
│   └── VerificationStatus.tsx
├── financial/
│   ├── BankAccountForm.tsx
│   ├── PayoutTimeline.tsx
│   └── InvoiceViewer.tsx
├── analytics/
│   ├── MetricCard.tsx
│   ├── RevenueChart.tsx
│   ├── OccupancyChart.tsx
│   └── ComparisonTable.tsx
└── security/
    ├── ActivityLog.tsx
    ├── IncidentReportForm.tsx
    └── TwoFactorSetup.tsx
```

## Quick Wins Strategy

### Immediate Implementation (Week 1-2)
1. **Add Rate Plan selector** to existing Pricing Tab
2. **Create basic Restrictions interface** within PropertyEdit
3. **Add KYC banner** prompting verification
4. **Enable no-show reporting** button in Reservations

### Short-term (Week 3-4)
1. **Launch minimal Rate Plans page** with CRUD operations
2. **Add Banking Details page** with form only
3. **Create Promotions section** in Pricing Tab
4. **Add basic Analytics dashboard** with key metrics

### Medium-term (Week 5-8)
1. **Full Pricing Calendar** implementation
2. **Complete KYC workflow** with document upload
3. **Security Center** with activity log
4. **Knowledge Base** with initial content

## Success Metrics

### Platform Completeness
- **Current**: 60% feature coverage
- **Phase 1 Target**: 75% coverage
- **Phase 2 Target**: 85% coverage
- **Phase 3 Target**: 95% coverage
- **Phase 4 Target**: 100% coverage

### Business Impact
- **Revenue Increase**: 20-30% through dynamic pricing
- **Operational Efficiency**: 40% reduction in manual tasks
- **User Satisfaction**: 25% increase in NPS score
- **Support Reduction**: 50% fewer support tickets
- **Compliance**: 100% regulatory compliance

### Technical Metrics
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 200ms
- **Error Rate**: < 0.1%
- **Test Coverage**: > 80%
- **Accessibility Score**: WCAG AA compliant

## Risk Mitigation

### Technical Risks
- **Data Migration**: Plan phased migration with rollback capability
- **Performance**: Implement caching and pagination from start
- **Security**: Regular security audits and penetration testing

### Business Risks
- **User Adoption**: Provide training and migration assistance
- **Compliance**: Legal review before Phase 2 launch
- **Competition**: Fast-track Phase 1 for market advantage

### Mitigation Strategies
1. **Incremental Rollout**: Deploy features to select users first
2. **Feature Flags**: Toggle features on/off without deployment
3. **A/B Testing**: Test new features with small user groups
4. **Rollback Plans**: Maintain ability to revert changes quickly

## Conclusion

This roadmap transforms Wezo.ae from a basic property listing platform into a comprehensive property management system. The phased approach ensures critical revenue-generating features are delivered first, followed by compliance and operational efficiency improvements.

The total implementation timeline is approximately 6 months, with the platform achieving full feature parity with the database schema design. Each phase builds upon the previous one, ensuring a stable and scalable platform evolution.

## Appendices

### A. Database Schema Reference
See: [Prisma Schema Documentation](../server/prisma/schema.prisma)

### B. Pricing Architecture
See: [Pricing.md](./Pricing.md)

### C. UI Component Library
See: [Component Documentation](../client/src/components/base/)

### D. API Documentation
See: [API Reference](../server/README.md)

---

*Last Updated: August 2025*
*Version: 1.0*
*Status: Ready for Implementation*