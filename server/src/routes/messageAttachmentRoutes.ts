import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import {
  uploadAttachment,
  uploadMultipleAttachments,
  getAttachment,
  downloadAttachment,
  deleteAttachment,
  getMessageAttachments,
  generateSignedUrl,
  getStorageStats,
  cleanupOrphanedFiles
} from '../controllers/message-attachment.controller';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/temp/', // Temporary directory for multer
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Upload single attachment
router.post('/messages/:messageId/attachments', authenticate, upload.single('attachment'), uploadAttachment);

// Upload multiple attachments
router.post('/messages/:messageId/attachments/multiple', authenticate, upload.array('attachments', 5), uploadMultipleAttachments);

// Get attachment metadata
router.get('/attachments/:attachmentId', authenticate, getAttachment);

// Download attachment file
router.get('/attachments/:attachmentId/download', authenticate, downloadAttachment);

// Delete attachment
router.delete('/attachments/:attachmentId', authenticate, deleteAttachment);

// Get all attachments for a message
router.get('/messages/:messageId/attachments', authenticate, getMessageAttachments);

// Generate signed URL for attachment (for future S3 integration)
router.get('/attachments/:attachmentId/signed-url', authenticate, generateSignedUrl);

// Get storage statistics (Manager only)
router.get('/admin/storage/stats', authenticate, getStorageStats);

// Cleanup orphaned files (Manager only)
router.post('/admin/storage/cleanup', authenticate, cleanupOrphanedFiles);

export default router;