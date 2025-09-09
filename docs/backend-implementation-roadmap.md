# 🛠️ Backend Implementation Roadmap - Booking Details Page

## 📋 **Overview**

This document outlines all backend changes required to implement the booking details page functionality based on the updated Prisma schema.

---

## 🔄 **Required Services Modifications & New Services**

### **1. ✅ Existing Services to Enhance**

#### **📝 reservation.service.ts - MAJOR ENHANCEMENTS NEEDED**

**Current Status:** ✅ Exists - Basic CRUD operations  
**Required Changes:** 🔧 Major enhancements

```typescript
// NEW METHODS TO ADD:
export class ReservationService {
  // Enhanced reservation details with all relations
  async getReservationWithFullDetails(
    reservationId: string, 
    userId: string, 
    userRole: UserRole,
    include?: string[]
  ): Promise<DetailedReservation>

  // Reservation modification capabilities  
  async modifyReservation(
    reservationId: string,
    userId: string, 
    modifications: ReservationModificationData
  ): Promise<Reservation>

  // Status management with audit logging
  async updateReservationStatus(
    reservationId: string,
    userId: string,
    newStatus: ReservationStatus,
    reason?: string
  ): Promise<Reservation>

  // Private notes management
  async addPrivateNote(
    reservationId: string,
    userId: string,
    note: string
  ): Promise<void>

  async updatePrivateNote(
    reservationId: string,
    userId: string,
    note: string
  ): Promise<void>

  // Fee breakdown calculations
  async calculateFeeBreakdown(reservationId: string): Promise<ReservationFeeBreakdown>
  async createFeeBreakdown(reservationId: string, data: FeeBreakdownData): Promise<ReservationFeeBreakdown>
  async updateFeeBreakdown(reservationId: string, data: Partial<FeeBreakdownData>): Promise<ReservationFeeBreakdown>

  // Payout management
  async calculatePayout(reservationId: string): Promise<PayoutCalculation>
  async createPayout(reservationId: string, homeOwnerId: string): Promise<Payout>
  async updatePayoutStatus(payoutId: string, status: PayoutStatus): Promise<Payout>

  // Export functionality
  async exportReservationData(
    reservationId: string,
    userId: string,
    format: 'json' | 'csv'
  ): Promise<ExportData>
}
```

---

### **2. 🆕 New Services to Create**

#### **📎 message-attachment.service.ts - NEW SERVICE**

**Purpose:** Handle file attachments for reservation messages

```typescript
export class MessageAttachmentService {
  // File upload handling
  async uploadAttachment(
    messageId: string,
    file: Express.Multer.File,
    userId: string
  ): Promise<MessageAttachment>

  // File retrieval with security checks
  async getAttachment(
    attachmentId: string,
    userId: string
  ): Promise<MessageAttachment>

  // Secure file URL generation
  async generateSignedUrl(attachmentId: string): Promise<string>

  // File deletion
  async deleteAttachment(
    attachmentId: string,
    userId: string
  ): Promise<void>

  // File validation
  async validateFile(file: Express.Multer.File): Promise<ValidationResult>
  
  // Bulk attachment operations
  async getMessageAttachments(messageId: string): Promise<MessageAttachment[]>
  async deleteMessageAttachments(messageId: string): Promise<void>
}
```

#### **📋 reservation-audit.service.ts - NEW SERVICE**

**Purpose:** Manage audit trail for all reservation changes

```typescript
export class ReservationAuditService {
  // Log reservation changes
  async logChange(
    reservationId: string,
    userId: string,
    userRole: UserRole,
    action: string,
    changes: ChangeData
  ): Promise<ReservationAuditLog>

  // Retrieve audit trail
  async getAuditTrail(
    reservationId: string,
    userId: string,
    filters?: AuditFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedAuditLog>

  // System-level audit logs (for managers)
  async getSystemAuditLog(
    userId: string,
    filters?: SystemAuditFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedAuditLog>

  // Audit log export
  async exportAuditLog(
    reservationId: string,
    userId: string,
    format: 'json' | 'csv'
  ): Promise<ExportData>

  // Helper methods
  async formatChangeDescription(action: string, changes: ChangeData): Promise<string>
  async validateAuditAccess(reservationId: string, userId: string): Promise<boolean>
}
```

#### **📄 document-generation.service.ts - NEW SERVICE**

**Purpose:** Generate PDFs and export documents

```typescript
export class DocumentGenerationService {
  // PDF generation
  async generateGuestInvoice(reservationId: string): Promise<Buffer>
  async generatePayoutStatement(reservationId: string): Promise<Buffer>
  async generateReservationSummary(reservationId: string): Promise<Buffer>

  // Template rendering
  private async renderTemplate(
    templateName: string,
    data: TemplateData
  ): Promise<string>

  // Export functionality
  async exportReservationToCSV(reservationId: string): Promise<Buffer>
  async exportReservationToExcel(reservationId: string): Promise<Buffer>

  // Document storage and retrieval
  async storeGeneratedDocument(
    reservationId: string,
    documentType: string,
    buffer: Buffer
  ): Promise<string>

  async getStoredDocument(documentId: string): Promise<Buffer>
}
```

#### **💰 payout.service.ts - NEW SERVICE**

**Purpose:** Manage property owner payouts

```typescript
export class PayoutService {
  // Payout creation and calculation
  async createPayout(
    reservationId: string,
    homeOwnerId: string,
    amount: number
  ): Promise<Payout>

  async calculatePayoutAmount(reservationId: string): Promise<PayoutCalculation>

  // Payout status management
  async updatePayoutStatus(
    payoutId: string,
    status: PayoutStatus,
    metadata?: PayoutMetadata
  ): Promise<Payout>

  // Payout scheduling
  async schedulePayouts(date: Date): Promise<ScheduleResult>
  async processScheduledPayouts(): Promise<ProcessResult>

  // Payout queries
  async getHomeOwnerPayouts(
    homeOwnerId: string,
    filters?: PayoutFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedPayouts>

  async getPayoutsByStatus(
    status: PayoutStatus,
    pagination?: PaginationOptions
  ): Promise<PaginatedPayouts>

  // Banking integration (future)
  async initiateBankTransfer(payoutId: string): Promise<TransferResult>
  async handlePayoutWebhook(webhookData: WebhookData): Promise<void>
}
```

#### **🔄 realtime.service.ts - NEW SERVICE**

**Purpose:** Handle real-time updates via WebSocket

```typescript
export class RealtimeService {
  // WebSocket connection management
  async subscribeToReservation(
    userId: string,
    reservationId: string,
    socket: Socket
  ): Promise<void>

  async unsubscribeFromReservation(
    userId: string,
    reservationId: string,
    socket: Socket
  ): Promise<void>

  // Event broadcasting
  async broadcastReservationUpdate(
    reservationId: string,
    event: RealtimeEvent
  ): Promise<void>

  async broadcastNewMessage(
    reservationId: string,
    message: Message,
    attachments?: MessageAttachment[]
  ): Promise<void>

  async broadcastStatusChange(
    reservationId: string,
    oldStatus: ReservationStatus,
    newStatus: ReservationStatus,
    changedBy: User
  ): Promise<void>

  // Typing indicators
  async handleTypingStart(userId: string, reservationId: string): Promise<void>
  async handleTypingStop(userId: string, reservationId: string): Promise<void>

  // Connection cleanup
  async cleanupDisconnectedSockets(): Promise<void>
  async getUserConnections(userId: string): Promise<Connection[]>
}
```

---

## 🎮 **Required Controller Modifications & New Controllers**

### **1. 🔧 Existing Controllers to Enhance**

#### **📝 reservation.controller.ts - MAJOR ENHANCEMENTS**

**Current Status:** ✅ Exists - Basic operations  
**Required Changes:** 🔧 Major enhancements

```typescript
// NEW ENDPOINTS TO ADD:

// Enhanced reservation details
export const getReservationDetails = async (req: Request, res: Response): Promise<void>

// Reservation modification
export const modifyReservation = async (req: Request, res: Response): Promise<void>

// Status changes
export const changeReservationStatus = async (req: Request, res: Response): Promise<void>

// Notes management
export const updateReservationNotes = async (req: Request, res: Response): Promise<void>

// Audit trail
export const getReservationAuditLog = async (req: Request, res: Response): Promise<void>

// Fee breakdown
export const getReservationFeeBreakdown = async (req: Request, res: Response): Promise<void>
export const updateReservationFeeBreakdown = async (req: Request, res: Response): Promise<void>

// Document generation
export const generateReservationInvoice = async (req: Request, res: Response): Promise<void>
export const generatePayoutStatement = async (req: Request, res: Response): Promise<void>
export const exportReservationData = async (req: Request, res: Response): Promise<void>
```

---

### **2. 🆕 New Controllers to Create**

#### **📎 message-attachment.controller.ts - NEW CONTROLLER**

**Purpose:** Handle message attachment endpoints

```typescript
// File upload endpoint
export const uploadMessageAttachment = async (req: Request, res: Response): Promise<void>

// File download endpoint  
export const downloadMessageAttachment = async (req: Request, res: Response): Promise<void>

// File deletion endpoint
export const deleteMessageAttachment = async (req: Request, res: Response): Promise<void>

// Get message attachments
export const getMessageAttachments = async (req: Request, res: Response): Promise<void>
```

#### **💰 payout.controller.ts - NEW CONTROLLER**

**Purpose:** Handle payout management endpoints

```typescript
// Get homeowner payouts
export const getHomeOwnerPayouts = async (req: Request, res: Response): Promise<void>

// Get payout details
export const getPayoutDetails = async (req: Request, res: Response): Promise<void>

// Update payout status (Manager only)
export const updatePayoutStatus = async (req: Request, res: Response): Promise<void>

// Process payouts (System/Manager only)
export const processPayouts = async (req: Request, res: Response): Promise<void>

// Payout webhooks (Banking integration)
export const handlePayoutWebhook = async (req: Request, res: Response): Promise<void>
```

---

## 🛣️ **New API Routes Required**

### **📝 Enhanced Reservation Routes**

```typescript
// server/src/routes/reservationRoutes.ts - ADD THESE ROUTES:

// Enhanced details with role-based information
router.get('/:reservationId/details', authenticate, getReservationDetails)

// Modification capabilities
router.put('/:reservationId/modify', authenticate, validateReservationModification, modifyReservation)

// Status management
router.post('/:reservationId/status', authenticate, validateStatusChange, changeReservationStatus)

// Notes management (HomeOwner/Manager only)
router.put('/:reservationId/notes', authenticate, authorizePropertyAccess, updateReservationNotes)

// Audit trail (HomeOwner/Manager only)
router.get('/:reservationId/audit-log', authenticate, authorizePropertyAccess, getReservationAuditLog)

// Fee breakdown
router.get('/:reservationId/fee-breakdown', authenticate, getReservationFeeBreakdown)
router.put('/:reservationId/fee-breakdown', authenticate, authorizeManagerAccess, updateReservationFeeBreakdown)

// Document generation
router.get('/:reservationId/invoice.pdf', authenticate, generateReservationInvoice)
router.get('/:reservationId/payout-statement.pdf', authenticate, authorizePropertyAccess, generatePayoutStatement)
router.get('/:reservationId/export', authenticate, exportReservationData)
```

### **📎 New Message Attachment Routes**

```typescript
// server/src/routes/messageAttachmentRoutes.ts - NEW ROUTE FILE:

import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import * as messageAttachmentController from '../controllers/message-attachment.controller';

const router = Router();
const upload = multer({ dest: 'uploads/attachments/' });

// File upload
router.post(
  '/reservations/:reservationId/messages/attachments',
  authenticate,
  upload.array('attachments', 5), // Max 5 files
  messageAttachmentController.uploadMessageAttachment
);

// File download
router.get(
  '/messages/:messageId/attachments/:attachmentId',
  authenticate,
  messageAttachmentController.downloadMessageAttachment
);

// File deletion
router.delete(
  '/attachments/:attachmentId',
  authenticate,
  messageAttachmentController.deleteMessageAttachment
);

// Get message attachments
router.get(
  '/messages/:messageId/attachments',
  authenticate,
  messageAttachmentController.getMessageAttachments
);

export default router;
```

### **💰 New Payout Routes**

```typescript
// server/src/routes/payoutRoutes.ts - NEW ROUTE FILE:

import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import * as payoutController from '../controllers/payout.controller';

const router = Router();

// Get homeowner payouts
router.get(
  '/homeowner/:homeOwnerId/payouts',
  authenticate,
  authorizeRoles(['HomeOwner', 'Manager']),
  payoutController.getHomeOwnerPayouts
);

// Get payout details
router.get(
  '/payouts/:payoutId',
  authenticate,
  payoutController.getPayoutDetails
);

// Update payout status (Manager only)
router.put(
  '/payouts/:payoutId/status',
  authenticate,
  authorizeRoles(['Manager']),
  payoutController.updatePayoutStatus
);

// Process payouts (System/Manager only)
router.post(
  '/payouts/process',
  authenticate,
  authorizeRoles(['Manager']),
  payoutController.processPayouts
);

// Banking webhooks
router.post(
  '/payouts/webhook',
  payoutController.handlePayoutWebhook
);

export default router;
```

---

## 🔧 **Required Middleware Enhancements**

### **🔐 Enhanced Authentication Middleware**

```typescript
// server/src/middleware/auth.ts - ADD THESE FUNCTIONS:

// Role-based authorization
export const authorizeRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Property access authorization
export const authorizePropertyAccess = async (req: Request, res: Response, next: NextFunction) => {
  const { reservationId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  
  // Implementation logic to check if user can access this property's reservation
  // Managers can access all, HomeOwners can access their properties only
  
  next();
};

// Manager-only access
export const authorizeManagerAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Manager access required' });
  }
  next();
};
```

### **📝 Validation Middleware**

```typescript
// server/src/middleware/reservationValidation.ts - NEW FILE:

export const validateReservationModification = (req: Request, res: Response, next: NextFunction) => {
  // Validate modification request body
  const { checkInDate, checkOutDate, numGuests, guestRequests } = req.body;
  
  // Validation logic
  next();
};

export const validateStatusChange = (req: Request, res: Response, next: NextFunction) => {
  // Validate status change request
  const { status, reason } = req.body;
  
  // Validation logic
  next();
};

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  // Validate uploaded files
  const files = req.files as Express.Multer.File[];
  
  // File validation logic (size, type, count)
  next();
};
```

---

## 📊 **Database Service Enhancements**

### **🗄️ Enhanced Prisma Queries**

```typescript
// server/src/services/database.queries.ts - NEW FILE:

export class DatabaseQueries {
  // Enhanced reservation query with all relations
  static getReservationWithAllRelations(reservationId: string) {
    return prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        property: {
          include: {
            address: true,
            photos: true,
            amenities: true,
            checkInCheckout: true,
            owner: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        ratePlan: {
          include: {
            cancellationPolicy: true,
            features: true,
            property: true
          }
        },
        guest: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        messages: {
          include: {
            attachments: true
          },
          orderBy: {
            sentAt: 'desc'
          }
        },
        auditLogs: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        feeBreakdown: true,
        payout: true,
        review: true
      }
    });
  }
  
  // Optimized queries for different user roles
  static getReservationForTenant(reservationId: string, userId: string) { /* ... */ }
  static getReservationForHomeOwner(reservationId: string, userId: string) { /* ... */ }
  static getReservationForManager(reservationId: string) { /* ... */ }
}
```

---

## 🔄 **Real-time WebSocket Integration**

### **📡 WebSocket Server Setup**

```typescript
// server/src/websocket/reservation.websocket.ts - NEW FILE:

import { Server } from 'socket.io';
import { RealtimeService } from '../services/realtime.service';

export const setupReservationWebSocket = (io: Server) => {
  const realtimeService = new RealtimeService();
  
  io.on('connection', (socket) => {
    // Subscribe to reservation updates
    socket.on('subscribe-reservation', async (data) => {
      await realtimeService.subscribeToReservation(
        data.userId,
        data.reservationId,
        socket
      );
    });
    
    // Handle typing indicators
    socket.on('typing-start', async (data) => {
      await realtimeService.handleTypingStart(data.userId, data.reservationId);
    });
    
    socket.on('typing-stop', async (data) => {
      await realtimeService.handleTypingStop(data.userId, data.reservationId);
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      // Cleanup subscriptions
    });
  });
};
```

---

## ⚙️ **External Dependencies Required**

### **📦 New Package Dependencies**

```json
{
  "multer": "^1.4.5",           // File upload handling
  "multer-s3": "^3.0.1",       // S3 file storage (optional)
  "puppeteer": "^21.0.0",      // PDF generation
  "handlebars": "^4.7.8",      // Template rendering
  "socket.io": "^4.7.0",       // Real-time communication
  "csv-writer": "^1.6.0",      // CSV export
  "exceljs": "^4.3.0",         // Excel export
  "node-cron": "^3.0.2",       // Scheduled tasks
  "aws-sdk": "^2.1400.0"       // S3 integration (optional)
}
```

### **🛠️ Development Dependencies**

```json
{
  "@types/multer": "^1.4.7",
  "@types/node-cron": "^3.0.7",
  "jest": "^29.0.0",
  "supertest": "^6.3.0"
}
```

---

## 📋 **Implementation Priority Order**

### **Phase 1: Core Enhancements (Week 1)**
1. ✅ **reservation.service.ts** - Enhanced methods
2. ✅ **reservation.controller.ts** - New endpoints  
3. ✅ **reservationRoutes.ts** - Enhanced routes
4. ✅ **Enhanced auth middleware**

### **Phase 2: File & Audit Systems (Week 2)**
5. 🆕 **message-attachment.service.ts** - Complete service
6. 🆕 **message-attachment.controller.ts** - File endpoints
7. 🆕 **reservation-audit.service.ts** - Audit system
8. 🆕 **messageAttachmentRoutes.ts** - File routes

### **Phase 3: Documents & Payouts (Week 3)**
9. 🆕 **document-generation.service.ts** - PDF/Export service
10. 🆕 **payout.service.ts** - Payout management
11. 🆕 **payout.controller.ts** - Payout endpoints
12. 🆕 **payoutRoutes.ts** - Payout routes

### **Phase 4: Real-time & Polish (Week 4)**
13. 🆕 **realtime.service.ts** - WebSocket service
14. 🆕 **reservation.websocket.ts** - WebSocket setup
15. 🔧 **Enhanced validation middleware**
16. 🔧 **Performance optimizations**

---

## 🧪 **Testing Requirements**

### **Unit Tests Required**
- All new service methods
- All new controller endpoints
- Validation middleware
- File upload/download logic
- PDF generation functions

### **Integration Tests Required**
- API endpoint responses
- Database operations with new models
- File storage operations
- WebSocket connections
- Role-based access control

### **Load Tests Required**
- Concurrent file uploads
- Real-time message broadcasting
- PDF generation under load
- Database query performance

---

*This roadmap provides the complete blueprint for implementing all backend functionality required for the booking details page. Each phase builds upon the previous one, ensuring a systematic and maintainable implementation approach.*