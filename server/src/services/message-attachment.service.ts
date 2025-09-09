import prisma from '../config/database';
import { UserRole } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}


export class MessageAttachmentService {
  private readonly UPLOAD_DIR = 'uploads/attachments/';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  /**
   * Upload attachment for a message
   */
  async uploadAttachment(
    messageId: string,
    file: Express.Multer.File,
    userId: string
  ): Promise<any> {
    // Validate message exists and user has permission
    await this.validateMessageAccess(messageId, userId);

    // Validate file
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.UPLOAD_DIR, uniqueFilename);

    // Ensure upload directory exists
    await this.ensureUploadDirectoryExists();

    try {
      // Move file to permanent location
      await fs.copyFile(file.path, filePath);
      
      // Clean up temp file
      await fs.unlink(file.path).catch(() => {}); // Ignore errors

      // Create database record
      const attachment = await prisma.messageAttachment.create({
        data: {
          messageId,
          fileName: file.originalname,
          fileUrl: `/uploads/attachments/${uniqueFilename}`,
          fileType: file.mimetype,
          fileSize: file.size
        }
      });

      return attachment;
    } catch (error) {
      // Clean up files on error
      await fs.unlink(filePath).catch(() => {});
      await fs.unlink(file.path).catch(() => {});
      throw error;
    }
  }

  /**
   * Upload multiple attachments
   */
  async uploadMultipleAttachments(
    messageId: string,
    files: Express.Multer.File[],
    userId: string
  ): Promise<{ attachments: any[]; errors?: any[] }> {
    if (files.length > 5) {
      throw new Error('Maximum 5 attachments allowed per message');
    }

    const attachments = [];
    const errors = [];

    for (const file of files) {
      try {
        const attachment = await this.uploadAttachment(messageId, file, userId);
        attachments.push(attachment);
      } catch (error: any) {
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    if (errors.length > 0 && attachments.length === 0) {
      throw new Error(`All file uploads failed: ${JSON.stringify(errors)}`);
    }

    return {
      attachments,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Get attachment with security checks
   */
  async getAttachment(
    attachmentId: string,
    userId: string
  ): Promise<any> {
    const attachment = await prisma.messageAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        message: {
          include: {
            reservation: true
          }
        }
      }
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Validate access to the message/reservation
    await this.validateMessageAccess(attachment.messageId, userId);

    return attachment;
  }

  /**
   * Get file stream for download
   */
  async getFileStream(
    attachmentId: string,
    userId: string
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const attachment = await this.getAttachment(attachmentId, userId);
    
    const filePath = path.join(process.cwd(), attachment.fileUrl.substring(1)); // Remove leading '/'
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error('File not found on disk');
    }

    return {
      filePath,
      fileName: attachment.fileName,
      mimeType: attachment.fileType
    };
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(
    attachmentId: string,
    userId: string
  ): Promise<void> {
    const attachment = await this.getAttachment(attachmentId, userId);

    // Validate user can delete (sender of the message)
    const message = await prisma.message.findUnique({
      where: { id: attachment.messageId },
      select: { senderId: true }
    });

    if (message?.senderId !== userId) {
      // Allow managers to delete any attachment
      const userRole = await this.getUserRole(userId);
      if (userRole !== 'Manager') {
        throw new Error('Only the sender or managers can delete attachments');
      }
    }

    // Delete from database
    await prisma.messageAttachment.delete({
      where: { id: attachmentId }
    });

    // Delete file from disk
    const filePath = path.join(process.cwd(), attachment.fileUrl.substring(1));
    await fs.unlink(filePath).catch(() => {}); // Ignore file not found errors
  }

  /**
   * Get all attachments for a message
   */
  async getMessageAttachments(
    messageId: string,
    userId: string
  ): Promise<any[]> {
    // Validate access to message
    await this.validateMessageAccess(messageId, userId);

    const attachments = await prisma.messageAttachment.findMany({
      where: { messageId },
      orderBy: { uploadedAt: 'desc' }
    });

    return attachments;
  }

  /**
   * Delete all attachments for a message
   */
  async deleteMessageAttachments(messageId: string): Promise<void> {
    const attachments = await prisma.messageAttachment.findMany({
      where: { messageId },
      select: { id: true, fileUrl: true }
    });

    // Delete database records
    await prisma.messageAttachment.deleteMany({
      where: { messageId }
    });

    // Delete files from disk
    for (const attachment of attachments) {
      const filePath = path.join(process.cwd(), attachment.fileUrl.substring(1));
      await fs.unlink(filePath).catch(() => {}); // Ignore errors
    }
  }

  /**
   * Generate signed URL for file access (future enhancement for S3)
   */
  async generateSignedUrl(attachmentId: string): Promise<string> {
    const attachment = await prisma.messageAttachment.findUnique({
      where: { id: attachmentId },
      select: { fileUrl: true }
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // For local storage, return the direct URL
    // In production, this would generate a signed S3 URL
    return attachment.fileUrl;
  }

  /**
   * Validate file type and size
   */
  async validateFile(file: Express.Multer.File): Promise<ValidationResult> {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`
      };
    }

    // Check for empty files
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'Empty files are not allowed'
      };
    }

    return { isValid: true };
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
  }> {
    const attachments = await prisma.messageAttachment.findMany({
      select: {
        fileType: true,
        fileSize: true
      }
    });

    const totalFiles = attachments.length;
    const totalSize = attachments.reduce((sum, att) => sum + att.fileSize, 0);
    
    const filesByType: Record<string, number> = {};
    for (const attachment of attachments) {
      filesByType[attachment.fileType] = (filesByType[attachment.fileType] || 0) + 1;
    }

    return {
      totalFiles,
      totalSize,
      filesByType
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  private async validateMessageAccess(
    messageId: string,
    userId: string
  ): Promise<void> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        reservation: {
          include: {
            property: true,
            ratePlan: {
              include: {
                property: true
              }
            }
          }
        }
      }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    const userRole = await this.getUserRole(userId);

    // Managers can access all messages
    if (userRole === 'Manager') {
      return;
    }

    // Check if user is sender or recipient
    if (message.senderId === userId || message.recipientId === userId) {
      return;
    }

    // For reservation-related messages, check property access
    if (message.reservation) {
      const propertyOwnerId = message.reservation.property?.ownerId || 
                           message.reservation.ratePlan?.property?.ownerId;

      if (userRole === 'HomeOwner' && propertyOwnerId === userId) {
        return;
      }
    }

    throw new Error('You do not have permission to access this message');
  }

  private async getUserRole(userId: string): Promise<UserRole> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.role;
  }

  private async ensureUploadDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }

  /**
   * Clean up orphaned files (files without database records)
   */
  async cleanupOrphanedFiles(): Promise<{
    deletedFiles: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let deletedFiles = 0;

    try {
      // Get all database attachment URLs
      const dbAttachments = await prisma.messageAttachment.findMany({
        select: { fileUrl: true }
      });
      
      const dbFileUrls = new Set(
        dbAttachments.map(att => att.fileUrl.replace('/uploads/attachments/', ''))
      );

      // Get all files on disk
      try {
        const diskFiles = await fs.readdir(this.UPLOAD_DIR);

        // Delete files not in database
        for (const filename of diskFiles) {
          if (!dbFileUrls.has(filename)) {
            try {
              await fs.unlink(path.join(this.UPLOAD_DIR, filename));
              deletedFiles++;
            } catch (error: any) {
              errors.push(`Failed to delete ${filename}: ${error.message}`);
            }
          }
        }
      } catch (error: any) {
        errors.push(`Failed to read upload directory: ${error.message}`);
      }
    } catch (error: any) {
      errors.push(`Database query failed: ${error.message}`);
    }

    return { deletedFiles, errors };
  }
}

export default new MessageAttachmentService();