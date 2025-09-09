# 🔌 API Specification - Booking Details Page

## 📋 **Overview**

This document specifies all API endpoints required for the booking details page implementation, including request/response formats, authentication requirements, and error handling.

---

## 🔐 **Authentication**

All endpoints require JWT authentication unless specified otherwise.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

**User Context Available:**
- `req.user.id` - User ID
- `req.user.role` - User role (Tenant, HomeOwner, Manager)
- `req.user.email` - User email

---

## 📝 **Core Endpoints**

### **1. GET /api/reservations/:reservationId/details**

Enhanced reservation details with role-based information.

#### **Request:**
```typescript
// Path Parameters
reservationId: string // UUID of the reservation

// Query Parameters (optional)
include?: string[] // ['audit-log', 'fee-breakdown', 'messages', 'attachments']
```

#### **Response:**
```typescript
interface ReservationDetailsResponse {
  id: string
  status: ReservationStatus
  paymentStatus: string
  
  // Dates and basic info
  checkInDate: string // ISO date
  checkOutDate: string // ISO date
  numGuests: number
  guestRequests?: string
  notes?: string // Private notes (HomeOwner/Manager only)
  
  // Property information
  property: {
    propertyId: string
    name: string
    photos: Array<{
      id: string
      url: string
      altText: string
      isMain: boolean
    }>
    address: {
      city: string
      countryOrRegion: string
    }
    amenities: Array<{
      id: string
      name: string
      category: string
    }>
    checkInCheckout?: {
      checkInFrom: string
      checkInUntil: string
      checkOutFrom: string
      checkOutUntil: string
    }
  }
  
  // Rate plan information
  ratePlan?: {
    id: string
    name: string
    description?: string
    cancellationPolicy?: {
      type: CancellationType
      freeCancellationDays?: number
      partialRefundDays?: number
    }
  }
  
  // Guest information (HomeOwner/Manager only)
  guest?: {
    id: string
    name: string
    email: string
    firstName?: string
    lastName?: string
  }
  
  // Property owner information (Manager only)
  propertyOwner?: {
    id: string
    name: string
    email: string
  }
  
  // Financial breakdown
  feeBreakdown?: {
    basePrice: number
    nights: number
    cleaningFee?: number
    serviceFee?: number
    taxAmount?: number
    securityDeposit?: number
    platformCommission?: number // HomeOwner/Manager only
    paymentProcessingFee?: number // HomeOwner/Manager only
    totalGuestPays: number
    ownerReceives?: number // HomeOwner/Manager only
    platformRevenue?: number // Manager only
  }
  
  // Payout information (HomeOwner/Manager only)
  payout?: {
    id: string
    amount: number
    currency: string
    status: PayoutStatus
    scheduledAt?: string
    processedAt?: string
    completedAt?: string
    bankReference?: string
    failureReason?: string
  }
  
  // Messages (if included)
  messages?: Array<{
    id: string
    senderId: string
    senderType: UserRole
    content: string
    sentAt: string
    isRead: boolean
    attachments?: Array<{
      id: string
      fileName: string
      fileType: string
      fileSize: number
    }>
  }>
  
  // Audit log (if included, HomeOwner/Manager only)
  auditLog?: Array<{
    id: string
    userId: string
    userRole: UserRole
    action: string
    field?: string
    oldValue?: string
    newValue?: string
    description: string
    createdAt: string
  }>
  
  // Timestamps
  createdAt: string
  updatedAt: string
  expiresAt?: string
}
```

#### **Error Responses:**
```typescript
// 404 - Not Found
{
  error: "Reservation not found or you do not have permission to view it"
}

// 403 - Forbidden
{
  error: "Insufficient permissions to view this reservation"
}
```

---

### **2. PUT /api/reservations/:reservationId/modify**

Modify reservation details.

#### **Request:**
```typescript
interface ModifyReservationRequest {
  checkInDate?: string // ISO date
  checkOutDate?: string // ISO date
  numGuests?: number
  guestRequests?: string
  notes?: string // Private notes (HomeOwner/Manager only)
}
```

#### **Response:**
```typescript
interface ModifyReservationResponse {
  message: string
  reservation: ReservationDetailsResponse
  changes: Array<{
    field: string
    oldValue: any
    newValue: any
  }>
}
```

#### **Validation:**
- Dates must be in the future
- Guest count must be positive and within property limits
- Only HomeOwners of the property or Managers can modify
- Cannot modify completed or cancelled reservations

---

### **3. POST /api/reservations/:reservationId/status**

Change reservation status.

#### **Request:**
```typescript
interface ChangeStatusRequest {
  status: ReservationStatus
  reason?: string // Required for cancellations
  refundAmount?: number // For partial refunds
}
```

#### **Response:**
```typescript
interface ChangeStatusResponse {
  message: string
  reservation: {
    id: string
    status: ReservationStatus
    paymentStatus: string
  }
  refundProcessed?: {
    amount: number
    currency: string
    processingTime: string
  }
}
```

#### **Business Rules:**
- Tenants can only cancel their own bookings
- HomeOwners can confirm/decline pending bookings
- Managers can change any status
- Cancellation policies apply for refund calculations

---

### **4. GET/POST /api/reservations/:reservationId/messages**

Message management for reservation communication.

#### **GET - Retrieve Messages:**
```typescript
// Query Parameters
limit?: number // Default 50
offset?: number // Default 0
includeAttachments?: boolean // Default true
```

#### **Response:**
```typescript
interface MessagesResponse {
  messages: Array<{
    id: string
    senderId: string
    senderType: UserRole
    senderName: string
    recipientId: string
    recipientType: UserRole
    content: string
    sentAt: string
    isRead: boolean
    attachments: Array<{
      id: string
      fileName: string
      fileType: string
      fileSize: number
      fileUrl: string // Signed URL
    }>
  }>
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  unreadCount: number
}
```

#### **POST - Send Message:**
```typescript
interface SendMessageRequest {
  content: string
  attachments?: Array<{
    fileName: string
    fileData: string // Base64 encoded
    fileType: string
  }>
}
```

#### **Response:**
```typescript
interface SendMessageResponse {
  message: string
  messageData: {
    id: string
    content: string
    sentAt: string
    attachments?: Array<{
      id: string
      fileName: string
      fileUrl: string
    }>
  }
}
```

---

### **5. POST /api/reservations/:reservationId/messages/attachments**

Upload message attachments.

#### **Request:**
```typescript
// Content-Type: multipart/form-data
// Files: File[]
// Max file size: 10MB per file
// Max files: 5 per message
// Allowed types: image/*, application/pdf, text/*, application/msword, application/vnd.openxmlformats-officedocument.*
```

#### **Response:**
```typescript
interface UploadAttachmentsResponse {
  attachments: Array<{
    id: string
    fileName: string
    fileType: string
    fileSize: number
    fileUrl: string // Signed URL for access
  }>
}
```

#### **Error Responses:**
```typescript
// 413 - File too large
{
  error: "File size exceeds 10MB limit",
  fileName: string
}

// 415 - Unsupported file type
{
  error: "File type not allowed",
  fileName: string,
  allowedTypes: string[]
}
```

---

### **6. GET /api/messages/:messageId/attachments/:attachmentId**

Download message attachment.

#### **Response:**
- **Success:** File stream with appropriate headers
- **Headers:**
  - `Content-Type`: Original file MIME type
  - `Content-Disposition`: `attachment; filename="original_name.ext"`
  - `Content-Length`: File size

#### **Error Responses:**
```typescript
// 404 - Not Found
{
  error: "Attachment not found"
}

// 403 - Forbidden
{
  error: "You do not have permission to access this attachment"
}
```

---

### **7. PUT /api/reservations/:reservationId/notes**

Add or update private notes (HomeOwner/Manager only).

#### **Request:**
```typescript
interface UpdateNotesRequest {
  notes: string
}
```

#### **Response:**
```typescript
interface UpdateNotesResponse {
  message: string
  notes: string
  updatedAt: string
}
```

---

### **8. GET /api/reservations/:reservationId/audit-log**

Retrieve audit trail (HomeOwner/Manager only).

#### **Query Parameters:**
```typescript
limit?: number // Default 100
offset?: number // Default 0
action?: string // Filter by action type
userId?: string // Filter by user
startDate?: string // ISO date
endDate?: string // ISO date
```

#### **Response:**
```typescript
interface AuditLogResponse {
  auditLog: Array<{
    id: string
    userId: string
    userRole: UserRole
    userName: string
    action: string
    field?: string
    oldValue?: string
    newValue?: string
    description: string
    createdAt: string
  }>
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
```

---

### **9. Document Generation Endpoints**

#### **GET /api/reservations/:reservationId/invoice.pdf**

Generate guest invoice PDF.

#### **Response:**
- **Content-Type:** `application/pdf`
- **Headers:** 
  - `Content-Disposition`: `attachment; filename="invoice_${reservationId}.pdf"`

#### **GET /api/reservations/:reservationId/payout-statement.pdf**

Generate owner payout statement PDF (HomeOwner/Manager only).

#### **Response:**
- **Content-Type:** `application/pdf`
- **Headers:**
  - `Content-Disposition`: `attachment; filename="payout_${reservationId}.pdf"`

#### **GET /api/reservations/:reservationId/export**

Export reservation data.

#### **Query Parameters:**
```typescript
format?: 'json' | 'csv' | 'excel' // Default 'json'
```

#### **Response:**
```typescript
// JSON format
interface ExportResponse {
  reservation: ReservationDetailsResponse
  exportedAt: string
  exportedBy: {
    id: string
    name: string
    role: UserRole
  }
}

// CSV/Excel format returns file stream
```

---

## 🔄 **Real-time Updates**

### **WebSocket Connection: /ws/reservations/:reservationId**

#### **Connection Authentication:**
```typescript
// Query parameters
token: string // JWT token
```

#### **Event Types:**

##### **1. reservation_updated**
```typescript
{
  type: 'reservation_updated',
  data: {
    reservationId: string,
    field: string,
    oldValue: any,
    newValue: any,
    updatedBy: {
      id: string,
      name: string,
      role: UserRole
    },
    timestamp: string
  }
}
```

##### **2. new_message**
```typescript
{
  type: 'new_message',
  data: {
    messageId: string,
    senderId: string,
    senderName: string,
    senderType: UserRole,
    content: string,
    sentAt: string,
    attachments?: Array<{
      id: string,
      fileName: string
    }>
  }
}
```

##### **3. status_changed**
```typescript
{
  type: 'status_changed',
  data: {
    reservationId: string,
    oldStatus: ReservationStatus,
    newStatus: ReservationStatus,
    changedBy: {
      id: string,
      name: string,
      role: UserRole
    },
    timestamp: string
  }
}
```

##### **4. payout_updated**
```typescript
{
  type: 'payout_updated',
  data: {
    payoutId: string,
    oldStatus: PayoutStatus,
    newStatus: PayoutStatus,
    amount: number,
    scheduledAt?: string,
    completedAt?: string
  }
}
```

#### **Client Events:**

##### **1. typing_start**
```typescript
{
  type: 'typing_start',
  userId: string
}
```

##### **2. typing_stop**
```typescript
{
  type: 'typing_stop',
  userId: string
}
```

##### **3. message_read**
```typescript
{
  type: 'message_read',
  messageIds: string[]
}
```

---

## 🚦 **Error Handling**

### **Standard HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (business rule violation)
- `413` - Payload Too Large (file uploads)
- `415` - Unsupported Media Type (file uploads)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### **Error Response Format:**
```typescript
interface ErrorResponse {
  error: string // Human-readable error message
  code?: string // Machine-readable error code
  details?: any // Additional error context
  timestamp: string
  path: string
}
```

### **Validation Error Format:**
```typescript
interface ValidationErrorResponse {
  error: "Validation failed"
  code: "VALIDATION_ERROR"
  details: Array<{
    field: string
    message: string
    value?: any
  }>
  timestamp: string
  path: string
}
```

---

## 🔒 **Security Considerations**

### **1. Authentication & Authorization**
- All endpoints require valid JWT tokens
- Role-based access control implemented
- Resource ownership validation

### **2. File Upload Security**
- File type validation
- File size limits (10MB per file)
- Virus scanning (future enhancement)
- Secure file storage with signed URLs

### **3. Data Privacy**
- Guest information only visible to HomeOwners/Managers
- Financial data filtered by user role
- Audit logs track all sensitive operations

### **4. Rate Limiting**
- Message endpoints: 100 requests/hour per user
- File uploads: 20 uploads/hour per user
- WebSocket connections: 5 concurrent per user

---

## 📊 **Performance Considerations**

### **1. Database Queries**
- Indexes on common query patterns
- Pagination for large result sets
- Efficient joins with proper includes

### **2. File Handling**
- Streaming for large file downloads
- Background processing for PDF generation
- CDN integration for file delivery

### **3. Real-time Updates**
- WebSocket connection pooling
- Message queuing for reliability
- Connection cleanup on disconnect

### **4. Caching Strategy**
- Reservation details cached for 5 minutes
- Property information cached for 1 hour
- File metadata cached for 24 hours

---

## 🧪 **Testing Requirements**

### **1. Unit Tests**
- All service methods
- Validation logic
- Error handling

### **2. Integration Tests**
- API endpoint responses
- Database operations
- File upload/download

### **3. E2E Tests**
- Complete booking details workflow
- Real-time updates
- Role-based access control

### **4. Load Tests**
- Concurrent WebSocket connections
- File upload performance
- Database query performance

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Endpoints**
- [ ] GET /api/reservations/:id/details
- [ ] PUT /api/reservations/:id/modify
- [ ] POST /api/reservations/:id/status
- [ ] PUT /api/reservations/:id/notes

### **Phase 2: Messaging System**
- [ ] GET /api/reservations/:id/messages
- [ ] POST /api/reservations/:id/messages
- [ ] POST /api/reservations/:id/messages/attachments
- [ ] GET /api/messages/:messageId/attachments/:attachmentId

### **Phase 3: Advanced Features**
- [ ] GET /api/reservations/:id/audit-log
- [ ] WebSocket real-time updates
- [ ] Document generation endpoints
- [ ] Export functionality

### **Phase 4: Security & Performance**
- [ ] Rate limiting implementation
- [ ] File security validation
- [ ] Performance optimization
- [ ] Comprehensive testing

---

*This API specification serves as the definitive guide for implementing all backend endpoints required for the booking details page feature.*