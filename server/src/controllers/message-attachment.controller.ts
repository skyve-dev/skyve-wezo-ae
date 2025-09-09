import { Request, Response } from 'express';
import messageAttachmentService from '../services/message-attachment.service';
import path from 'path';

export const uploadAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const { messageId } = req.params;

    const attachment = await messageAttachmentService.uploadAttachment(
      messageId,
      req.file,
      req.user.id
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment
    });
  } catch (error: any) {
    console.error('Upload attachment error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('File size exceeds') || 
        error.message.includes('File type') || 
        error.message.includes('Empty files')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const uploadMultipleAttachments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No files provided' });
      return;
    }

    const { messageId } = req.params;

    const result = await messageAttachmentService.uploadMultipleAttachments(
      messageId,
      req.files,
      req.user.id
    );

    res.status(201).json({
      message: 'Files uploaded successfully',
      ...result
    });
  } catch (error: any) {
    console.error('Upload multiple attachments error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('Maximum 5 attachments')) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error.message.includes('All file uploads failed')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to upload files' });
  }
};

export const getAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { attachmentId } = req.params;

    const attachment = await messageAttachmentService.getAttachment(
      attachmentId,
      req.user.id
    );

    res.json(attachment);
  } catch (error: any) {
    console.error('Get attachment error:', error);
    if (error.message === 'Attachment not found' || 
        error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downloadAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { attachmentId } = req.params;

    const fileInfo = await messageAttachmentService.getFileStream(
      attachmentId,
      req.user.id
    );

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
    res.sendFile(path.resolve(fileInfo.filePath));
  } catch (error: any) {
    console.error('Download attachment error:', error);
    if (error.message === 'Attachment not found' || 
        error.message.includes('not found or you do not have permission') ||
        error.message === 'File not found on disk') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to download file' });
  }
};

export const deleteAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { attachmentId } = req.params;

    await messageAttachmentService.deleteAttachment(
      attachmentId,
      req.user.id
    );

    res.json({
      message: 'Attachment deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete attachment error:', error);
    if (error.message === 'Attachment not found' || 
        error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('Only the sender or managers can delete')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessageAttachments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { messageId } = req.params;

    const attachments = await messageAttachmentService.getMessageAttachments(
      messageId,
      req.user.id
    );

    res.json({
      messageId,
      attachments
    });
  } catch (error: any) {
    console.error('Get message attachments error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateSignedUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { attachmentId } = req.params;

    // First validate access
    await messageAttachmentService.getAttachment(attachmentId, req.user.id);

    const signedUrl = await messageAttachmentService.generateSignedUrl(attachmentId);

    res.json({
      signedUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    });
  } catch (error: any) {
    console.error('Generate signed URL error:', error);
    if (error.message === 'Attachment not found' || 
        error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStorageStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only managers can view storage stats
    if (req.user.role !== 'Manager') {
      res.status(403).json({ error: 'Only managers can view storage statistics' });
      return;
    }

    const stats = await messageAttachmentService.getStorageStats();

    res.json(stats);
  } catch (error: any) {
    console.error('Get storage stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cleanupOrphanedFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only managers can trigger cleanup
    if (req.user.role !== 'Manager') {
      res.status(403).json({ error: 'Only managers can trigger file cleanup' });
      return;
    }

    const result = await messageAttachmentService.cleanupOrphanedFiles();

    res.json({
      message: 'File cleanup completed',
      deletedFiles: result.deletedFiles,
      errors: result.errors.length > 0 ? result.errors : undefined
    });
  } catch (error: any) {
    console.error('Cleanup orphaned files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};