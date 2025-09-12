import { Request, Response } from 'express';
import { MessageService, SendMessageParams } from '../services/message.service';

const messageService = new MessageService();

export class MessageController {
  /**
   * Get all conversations for the authenticated user
   * GET /api/messages/conversations
   */
  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { 
        page = 1, 
        limit = 20, 
        type, 
        unreadOnly, 
        conversationWith,
        reservationId 
      } = req.query;

      const filters = {
        type: type as 'all' | 'reservations' | 'general' | 'support' | undefined,
        unreadOnly: unreadOnly === 'true',
        conversationWith: conversationWith as string,
        reservationId: reservationId as string
      };

      const result = await messageService.getConversations(
        userId,
        userRole,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch conversations'
      });
    }
  }

  /**
   * Get messages for a specific conversation
   * GET /api/messages/conversations/:conversationId
   */
  async getConversationMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const messages = await messageService.getConversationMessages(
        conversationId,
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: messages
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch messages'
      });
    }
  }

  /**
   * Send a new message
   * POST /api/messages
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { recipientId, recipientType, content, reservationId, attachments } = req.body;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!recipientId || !recipientType || !content?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Recipient ID, recipient type, and content are required'
        });
        return;
      }

      const messageParams: SendMessageParams = {
        senderId: userId,
        senderType: userRole,
        recipientId,
        recipientType,
        content: content.trim(),
        reservationId: reservationId || null,
        attachments
      };

      const message = await messageService.sendMessage(messageParams);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send message'
      });
    }
  }

  /**
   * Mark messages as read
   * PUT /api/messages/mark-read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageIds } = req.body;

      if (!Array.isArray(messageIds)) {
        res.status(400).json({
          success: false,
          message: 'Message IDs must be an array'
        });
        return;
      }

      await messageService.markMessagesAsRead(messageIds);

      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark messages as read'
      });
    }
  }

  /**
   * Get unread message count
   * GET /api/messages/unread-count
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const count = await messageService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get unread count'
      });
    }
  }

  /**
   * Search messages
   * GET /api/messages/search
   */
  async searchMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { q: query, page = 1, limit = 20, type, reservationId } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!query || typeof query !== 'string' || query.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
        return;
      }

      const filters = {
        type: type as 'all' | 'reservations' | 'general' | 'support' | undefined,
        reservationId: reservationId as string
      };

      const messages = await messageService.searchMessages(
        userId,
        query.trim(),
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: messages
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search messages'
      });
    }
  }

  /**
   * Delete a conversation
   * DELETE /api/messages/conversations/:conversationId
   */
  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      await messageService.deleteConversation(conversationId, userId);

      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete conversation'
      });
    }
  }

  /**
   * Start a new conversation (for compatibility with booking messages)
   * POST /api/messages/conversations
   */
  async startConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { recipientId, recipientType, subject, content, reservationId } = req.body;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!recipientId || !recipientType || !content?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Recipient ID, recipient type, and content are required'
        });
        return;
      }

      // Send initial message
      const messageParams: SendMessageParams = {
        senderId: userId,
        senderType: userRole,
        recipientId,
        recipientType,
        content: subject ? `${subject}\n\n${content.trim()}` : content.trim(),
        reservationId: reservationId || null
      };

      const message = await messageService.sendMessage(messageParams);

      // Generate conversation ID
      const conversationId = reservationId 
        ? `reservation_${reservationId}`
        : `general_${[userId, recipientId].sort().join('_')}`;

      res.status(201).json({
        success: true,
        message: 'Conversation started successfully',
        data: {
          conversationId,
          message
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start conversation'
      });
    }
  }
}