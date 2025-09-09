# 📋 Booking Details Page - Comprehensive Implementation Plan

## 🎯 **Project Overview**

This document outlines the complete implementation plan for a role-based booking/reservation details page that provides different views and functionality based on user roles (Tenant, HomeOwner, Manager).

---

## 📋 **Functional Requirements**

### **💰 Financial Information**
- **Detailed pricing breakdown** with all fees (cleaning, service, taxes, etc.)
- **Payment details** visible to HomeOwners and Managers
- **Currency**: AED only
- **Payout information** showing when HomeOwner receives payment
- **Commission splits**: IGNORED for initial implementation

### **📱 Communication & Messaging**
- **Inline chat system** built into the details page
- **Simple chronological message interface** (not threaded)
- **File attachments** supported (photos/documents)
- **Complete message history** for the booking
- **Read/unread status indicators**
- **Real-time updates** without page refresh

### **⚙️ Actions & Functionality**
- **Full modification capabilities**: dates, guest count, requests, everything
- **Status management**: Pending → Confirmed → Completed → Cancelled
- **Cancellation system** using existing `RatePlan.cancellationPolicy` from schema
- **Private notes system** (staff/owner only, not visible to guests)
- **Audit trail** tracking all changes with timestamps and user info

### **📄 Documents & Export**
- **PDF generation** for:
  - Guest invoices
  - Owner payout statements
- **Wezo.ae branding** on all documents
- **Data export capabilities** for accounting

### **🎨 Visual Design**
- **Mobile-first responsive** design
- **Visual timeline** with colored icons showing booking progress
- **Color-coded status badges**
- **Property photo gallery** (key photos only)
- **Breadcrumb navigation**

### **👥 Role-Based Views**
- **Tenants**: Property info, booking details, pricing, status, communication
- **HomeOwners**: + Guest details, financial breakdown, management actions  
- **Managers**: + Administrative overrides, full audit access

---

## 🗄️ **Database Schema Analysis**

### **✅ Existing Models (Sufficient)**

#### **Reservation Model**
```prisma
model Reservation {
  id               String            @id @default(uuid())
  ratePlanId       String?          // Optional rate plan
  ratePlan         RatePlan?        @relation(fields: [ratePlanId], references: [id])
  propertyId       String           // Direct property reference
  property         Property         @relation(fields: [propertyId], references: [propertyId])
  guestId          String
  guest            User             @relation(fields: [guestId], references: [id])
  
  // Booking Details
  checkInDate      DateTime
  checkOutDate     DateTime
  numGuests        Int
  totalPrice       Decimal          @db.Decimal(10, 2)
  commissionAmount Decimal?         @db.Decimal(10, 2)
  
  // Status Information
  status           ReservationStatus @default(Confirmed)
  paymentStatus    String?
  guestRequests    String?
  isNoShowReported Boolean          @default(false)
  notes            String?          // Private notes ✅
  
  // Relations
  messages         Message[]        // Messaging system ✅
  review           Review?
  
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}
```

#### **Message Model**
```prisma
model Message {
  id            String       @id @default(uuid())
  reservationId String?      // Links to reservation ✅
  reservation   Reservation? @relation(fields: [reservationId], references: [id])
  
  senderId      String
  senderType    UserRole
  recipientId   String
  recipientType UserRole
  
  content       String       // Message content ✅
  sentAt        DateTime     @default(now())
  isRead        Boolean      @default(false) // Read/unread status ✅
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}
```

#### **CancellationPolicy Model**
```prisma
model CancellationPolicy {
  id                   String            @id @default(uuid())
  ratePlanId           String            @unique
  ratePlan             RatePlan          @relation(fields: [ratePlanId], references: [id])
  
  type                 CancellationType  @default(FullyFlexible)
  freeCancellationDays Int?             // Days for 100% refund
  partialRefundDays    Int?             // Days for 50% refund
  
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt
}
```

### **✅ Database Schema Updates Completed**

All required database components have been **successfully added** to the Prisma schema:

#### **✅ 1. MessageAttachment Model**
- Added to support file attachments in reservation messages
- Includes file metadata (name, type, size, URL)
- Proper CASCADE deletion when messages are removed
- Indexed for efficient queries

#### **✅ 2. ReservationAuditLog Model**  
- Complete audit trail system for all reservation changes
- Tracks user, role, action, field changes, and timestamps
- Links to both User and Reservation models
- Multiple indexes for efficient querying

#### **✅ 3. ReservationFeeBreakdown Model**
- Detailed pricing breakdown with all fees
- Base pricing, cleaning fees, service fees, taxes
- Platform commission and payment processing fees
- Clear guest payment vs owner payout calculations

#### **✅ 4. Payout Model + PayoutStatus Enum**
- Complete payout lifecycle tracking
- Links reservations to homeowner payments
- Status tracking (Pending → Processing → Completed)
- Banking reference and failure reason support

#### **✅ 5. Enhanced Existing Models**
- **Message** model: Added `attachments` relation
- **Reservation** model: Added `auditLogs`, `feeBreakdown`, `payout` relations  
- **User** model: Added `auditLogs`, `payouts` relations

#### **✅ Schema Validation**
- ✅ Prisma schema validation passed
- ✅ All relations properly defined
- ✅ Indexes added for performance
- ✅ Data types and constraints validated

**Ready for migration**: Run `npx prisma db push` or `npx prisma migrate dev` to apply changes.

---

## 🔌 **API Endpoints Analysis**

### **✅ Existing Endpoints**

1. **GET /api/booking/my-bookings** - ✅ Already supports role-based filtering
2. **GET /api/reservations/:reservationId** - ✅ Basic reservation details
3. **GET /api/reservations/:reservationId/messages** - ✅ Message history
4. **POST /api/reservations/:reservationId/messages** - ✅ Send message

### **⚠️ Required New Endpoints**

#### **1. Detailed Reservation Endpoint**
```typescript
GET /api/reservations/:reservationId/details
// Enhanced version with full breakdown, audit logs, attachments
```

#### **2. Message Attachments**
```typescript
POST /api/reservations/:reservationId/messages/attachments
// Upload message attachments

GET /api/messages/:messageId/attachments/:attachmentId
// Download attachment
```

#### **3. Reservation Modifications**
```typescript
PUT /api/reservations/:reservationId/modify
// Modify dates, guest count, etc.

POST /api/reservations/:reservationId/status
// Change reservation status
```

#### **4. Notes Management**
```typescript
PUT /api/reservations/:reservationId/notes
// Add/update private notes

GET /api/reservations/:reservationId/audit-log
// Get audit trail
```

#### **5. Document Generation**
```typescript
GET /api/reservations/:reservationId/invoice.pdf
// Generate guest invoice

GET /api/reservations/:reservationId/payout-statement.pdf
// Generate owner payout statement

GET /api/reservations/:reservationId/export
// Export booking data
```

#### **6. Real-time Updates**
```typescript
WebSocket /ws/reservations/:reservationId
// Real-time updates for status changes and messages
```

---

## 🛠️ **Required Services Implementation**

### **1. Enhanced ReservationService**

#### **New Methods Required:**
```typescript
class ReservationService {
  // Enhanced detail fetching
  async getReservationWithFullDetails(reservationId: string, userId: string, userRole: UserRole)
  
  // Modification capabilities
  async modifyReservation(reservationId: string, userId: string, modifications: any)
  async updateReservationStatus(reservationId: string, userId: string, newStatus: ReservationStatus)
  async addPrivateNote(reservationId: string, userId: string, note: string)
  
  // Audit trail
  async logReservationChange(reservationId: string, userId: string, action: string, details: any)
  async getAuditTrail(reservationId: string, userId: string)
  
  // Financial calculations
  async calculateFeeBreakdown(reservationId: string)
  async calculatePayout(reservationId: string)
}
```

### **2. New MessageAttachmentService**

```typescript
class MessageAttachmentService {
  async uploadAttachment(messageId: string, file: File): Promise<MessageAttachment>
  async getAttachment(attachmentId: string, userId: string): Promise<MessageAttachment>
  async deleteAttachment(attachmentId: string, userId: string): Promise<void>
  async validateFileType(file: File): Promise<boolean>
  async generateSecureUrl(attachmentId: string): Promise<string>
}
```

### **3. New DocumentGenerationService**

```typescript
class DocumentGenerationService {
  async generateGuestInvoice(reservationId: string): Promise<Buffer>
  async generatePayoutStatement(reservationId: string): Promise<Buffer>
  async generateReservationExport(reservationId: string, format: 'pdf' | 'excel'): Promise<Buffer>
  private async renderWezoTemplate(templateName: string, data: any): Promise<Buffer>
}
```

### **4. New RealtimeService**

```typescript
class RealtimeService {
  async broadcastReservationUpdate(reservationId: string, update: any): Promise<void>
  async broadcastNewMessage(reservationId: string, message: Message): Promise<void>
  async subscribeToReservation(userId: string, reservationId: string): Promise<void>
  async unsubscribeFromReservation(userId: string, reservationId: string): Promise<void>
}
```

---

## 🎨 **Frontend Components Structure**

### **1. Page Structure**
```typescript
// Main component
BookingDetailsPage.tsx

// Sub-components
├── BookingHeader.tsx          // Property info, status, photos
├── BookingFinancialSummary.tsx // Pricing breakdown
├── BookingTimeline.tsx        // Visual status timeline
├── BookingGuestInfo.tsx       // Guest details (HomeOwner/Manager only)
├── BookingActions.tsx         // Role-based action buttons
├── BookingMessaging.tsx       // Inline chat system
├── BookingNotes.tsx          // Private notes (HomeOwner/Manager only)
├── BookingAuditLog.tsx       // Change history
└── BookingDocuments.tsx      // PDF downloads and exports
```

### **2. New Redux Slices**
```typescript
// bookingDetailsSlice.ts - Enhanced booking details state
interface BookingDetailsState {
  currentBooking: DetailedReservation | null
  feeBreakdown: FeeBreakdown | null
  auditLog: AuditLogEntry[]
  messages: Message[]
  attachments: MessageAttachment[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  
  // Real-time
  isConnected: boolean
  lastUpdate: string | null
}

// messageSlice.ts - Real-time messaging
interface MessageState {
  messagesByReservation: Record<string, Message[]>
  unreadCounts: Record<string, number>
  isTyping: Record<string, boolean>
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
}
```

---

## 📦 **External Dependencies**

### **New Dependencies Required:**

#### **Backend:**
```json
{
  "socket.io": "^4.7.0",           // Real-time communication
  "multer": "^1.4.5",              // File upload handling
  "puppeteer": "^21.0.0",          // PDF generation
  "handlebars": "^4.7.8",          // Template rendering
  "aws-sdk": "^2.1400.0",          // S3 file storage (optional)
  "node-cron": "^3.0.2"            // Payout scheduling
}
```

#### **Frontend:**
```json
{
  "socket.io-client": "^4.7.0",    // Real-time client
  "react-dropzone": "^14.2.3",     // File upload UI
  "date-fns": "^2.30.0",          // Date manipulation
  "react-timeline-component": "^1.0.0", // Visual timeline
  "jspdf": "^2.5.1"                // Client-side PDF (optional)
}
```

---

## 🚧 **Implementation Phases**

### **Phase 1: Foundation (Week 1)**
- [ ] Database schema updates
- [ ] Basic API endpoints
- [ ] Enhanced ReservationService
- [ ] Basic booking details page UI

### **Phase 2: Messaging System (Week 2)**
- [ ] Message attachments model
- [ ] File upload endpoints
- [ ] MessageAttachmentService
- [ ] Inline chat UI component
- [ ] Real-time messaging with Socket.IO

### **Phase 3: Advanced Features (Week 3)**
- [ ] Audit trail system
- [ ] Modification capabilities
- [ ] Private notes system
- [ ] Fee breakdown calculations
- [ ] Visual timeline component

### **Phase 4: Documents & Export (Week 4)**
- [ ] PDF generation service
- [ ] Document templates
- [ ] Export functionality
- [ ] Payout tracking system

### **Phase 5: Polish & Testing (Week 5)**
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation updates

---

## ⚠️ **Technical Risks & Considerations**

### **1. Database Performance**
- **Risk**: Complex joins for detailed reservation data
- **Mitigation**: Add database indexes, implement caching

### **2. File Storage**
- **Risk**: Large attachment files
- **Mitigation**: Implement file size limits, use S3 or similar

### **3. Real-time Scalability**
- **Risk**: Socket.IO connections at scale
- **Mitigation**: Use Redis adapter, implement connection limits

### **4. PDF Generation Performance**
- **Risk**: Slow PDF rendering
- **Mitigation**: Queue system for document generation

### **5. Mobile Performance**
- **Risk**: Heavy page with many components
- **Mitigation**: Lazy loading, component splitting

---

## 🎯 **Success Metrics**

### **1. Functional Requirements**
- [ ] All user roles see appropriate information
- [ ] Real-time messaging works reliably
- [ ] Document generation produces correct PDFs
- [ ] Audit trail tracks all changes

### **2. Performance Requirements**
- [ ] Page loads in < 2 seconds
- [ ] Real-time updates in < 500ms
- [ ] PDF generation in < 5 seconds
- [ ] Mobile responsive on all devices

### **3. User Experience**
- [ ] Intuitive navigation between sections
- [ ] Clear visual hierarchy
- [ ] Consistent with existing app design
- [ ] Accessible for screen readers

---

## 📝 **Next Steps**

1. **Review and Approve** this implementation plan
2. **Prioritize features** based on business needs
3. **Create detailed technical specifications** for each phase
4. **Set up development environment** with new dependencies
5. **Begin Phase 1 implementation**

---

*This document serves as the comprehensive blueprint for implementing the booking details page feature. All technical decisions and requirements are documented here for reference during development.*