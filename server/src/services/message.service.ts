import prisma from '../config/database';
import { UserRole } from '@prisma/client';

export interface MessageFilters {
  reservationId?: string | null;
  userId?: string;
  conversationWith?: string;
  unreadOnly?: boolean;
  type?: 'all' | 'reservations' | 'general' | 'support';
}

export interface ConversationSummary {
  id: string;
  participants: {
    id: string;
    name: string;
    role: UserRole;
  }[];
  reservationId: string | null;
  propertyName?: string;
  propertyId?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  lastMessage: {
    id: string;
    content: string;
    sentAt: Date;
    senderId: string;
    senderType: UserRole;
  };
  unreadCount: number;
  totalMessages: number;
  type: 'reservation' | 'general' | 'support';
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageParams {
  senderId: string;
  senderType: UserRole;
  recipientId: string;
  recipientType: UserRole;
  content: string;
  reservationId?: string | null;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
}

export class MessageService {
  
  /**
   * Get all conversations for a user
   */
  async getConversations(
    userId: string, 
    userRole: UserRole,
    filters: MessageFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ conversations: ConversationSummary[]; totalCount: number }> {
    const skip = (page - 1) * limit;
    
    // Build conversation query - group messages by participants and reservation
    const whereClause: any = {
      OR: [
        { senderId: userId },
        { recipientId: userId }
      ]
    };

    // Apply filters
    if (filters.reservationId !== undefined) {
      whereClause.reservationId = filters.reservationId;
    }

    if (filters.conversationWith) {
      whereClause.OR = [
        { senderId: userId, recipientId: filters.conversationWith },
        { senderId: filters.conversationWith, recipientId: userId }
      ];
    }

    if (filters.type) {
      switch (filters.type) {
        case 'reservations':
          whereClause.reservationId = { not: null };
          break;
        case 'general':
          whereClause.reservationId = null;
          whereClause.OR = [
            { senderId: userId, recipientType: { not: 'Manager' } },
            { recipientId: userId, senderType: { not: 'Manager' } }
          ];
          break;
        case 'support':
          whereClause.OR = [
            { senderId: userId, recipientType: 'Manager' },
            { recipientId: userId, senderType: 'Manager' }
          ];
          break;
      }
    }

    // Get messages grouped by conversation
    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        reservation: {
          include: {
            property: {
              select: {
                propertyId: true,
                name: true
              }
            }
          }
        },
        partner: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      }
    });

    // Group messages into conversations
    const conversationMap = new Map<string, any>();
    
    for (const message of messages) {
      // Create conversation key based on participants and reservation
      const conversationKey = message.reservationId 
        ? `reservation_${message.reservationId}`
        : `general_${[message.senderId, message.recipientId].sort().join('_')}`;

      if (!conversationMap.has(conversationKey)) {
        // Get participant info
        const otherParticipantId = message.senderId === userId ? message.recipientId : message.senderId;
        const otherParticipant = await prisma.user.findUnique({
          where: { id: otherParticipantId },
          select: { id: true, username: true, role: true }
        });

        conversationMap.set(conversationKey, {
          id: conversationKey,
          participants: [
            { id: userId, name: 'You', role: userRole },
            { 
              id: otherParticipantId, 
              name: otherParticipant?.username || 'Unknown User',
              role: otherParticipant?.role || 'Tenant'
            }
          ],
          reservationId: message.reservationId,
          propertyName: message.reservation?.property?.name,
          propertyId: message.reservation?.property?.propertyId,
          checkInDate: message.reservation?.checkInDate,
          checkOutDate: message.reservation?.checkOutDate,
          lastMessage: {
            id: message.id,
            content: message.content,
            sentAt: message.sentAt,
            senderId: message.senderId,
            senderType: message.senderType
          },
          messages: [],
          type: message.reservationId ? 'reservation' : 
                (message.senderType === 'Manager' || message.recipientType === 'Manager') ? 'support' : 'general',
          createdAt: message.sentAt,
          updatedAt: message.sentAt
        });
      }

      const conversation = conversationMap.get(conversationKey);
      conversation.messages.push(message);
      
      // Update last message if this one is newer
      if (message.sentAt > conversation.updatedAt) {
        conversation.lastMessage = {
          id: message.id,
          content: message.content,
          sentAt: message.sentAt,
          senderId: message.senderId,
          senderType: message.senderType
        };
        conversation.updatedAt = message.sentAt;
      }
    }

    // Convert to array and calculate unread counts
    const conversations: ConversationSummary[] = [];
    for (const conversation of conversationMap.values()) {
      const unreadCount = conversation.messages.filter((msg: any) => 
        msg.recipientId === userId && !msg.isRead
      ).length;

      conversations.push({
        ...conversation,
        unreadCount,
        totalMessages: conversation.messages.length,
        messages: undefined // Remove messages from response, they'll be fetched separately
      });
    }

    // Sort by last message date
    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Apply unread filter if specified
    const filteredConversations = filters.unreadOnly 
      ? conversations.filter(conv => conv.unreadCount > 0)
      : conversations;

    // Paginate
    const paginatedConversations = filteredConversations.slice(skip, skip + limit);

    return {
      conversations: paginatedConversations,
      totalCount: filteredConversations.length
    };
  }

  /**
   * Get messages for a specific conversation
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<any[]> {
    const skip = (page - 1) * limit;
    
    // Parse conversation ID
    const [type, id] = conversationId.split('_');
    
    let whereClause: any;
    if (type === 'reservation') {
      whereClause = {
        reservationId: id,
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      };
    } else if (type === 'general') {
      const [participant1, participant2] = id.split('_');
      whereClause = {
        reservationId: null,
        OR: [
          { senderId: participant1, recipientId: participant2 },
          { senderId: participant2, recipientId: participant1 }
        ]
      };
    } else {
      throw new Error('Invalid conversation ID format');
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        attachments: true,
        reservation: {
          include: {
            property: {
              select: {
                propertyId: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        sentAt: 'asc'
      },
      skip,
      take: limit
    });

    // Mark messages as read for the current user
    await this.markMessagesAsRead(
      messages.filter(msg => msg.recipientId === userId && !msg.isRead).map(msg => msg.id)
    );

    return messages;
  }

  /**
   * Send a new message
   */
  async sendMessage(params: SendMessageParams): Promise<any> {
    const message = await prisma.message.create({
      data: {
        senderId: params.senderId,
        senderType: params.senderType,
        recipientId: params.recipientId,
        recipientType: params.recipientType,
        content: params.content,
        reservationId: params.reservationId,
        attachments: params.attachments ? {
          create: params.attachments
        } : undefined
      },
      include: {
        attachments: true,
        reservation: {
          include: {
            property: {
              select: {
                propertyId: true,
                name: true
              }
            }
          }
        }
      }
    });

    // TODO: Send real-time notification to recipient
    // TODO: Send email notification if user is offline

    return message;
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;

    await prisma.message.updateMany({
      where: {
        id: { in: messageIds }
      },
      data: {
        isRead: true
      }
    });
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false
      }
    });
  }

  /**
   * Search messages
   */
  async searchMessages(
    userId: string,
    query: string,
    filters: MessageFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<any[]> {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {
      OR: [
        { senderId: userId },
        { recipientId: userId }
      ],
      content: {
        contains: query,
        mode: 'insensitive'
      }
    };

    // Apply additional filters
    if (filters.reservationId !== undefined) {
      whereClause.reservationId = filters.reservationId;
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        attachments: true,
        reservation: {
          include: {
            property: {
              select: {
                propertyId: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      skip,
      take: limit
    });

    return messages;
  }

  /**
   * Delete a conversation (mark all messages as deleted for user)
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    // For now, we'll just mark messages as read
    // In a full implementation, you might want to add a "deletedBy" field
    const [type, id] = conversationId.split('_');
    
    let whereClause: any;
    if (type === 'reservation') {
      whereClause = {
        reservationId: id,
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      };
    } else if (type === 'general') {
      const [participant1, participant2] = id.split('_');
      whereClause = {
        reservationId: null,
        OR: [
          { senderId: participant1, recipientId: participant2 },
          { senderId: participant2, recipientId: participant1 }
        ]
      };
    }

    // For now, just mark as read (you might want to implement soft delete)
    await prisma.message.updateMany({
      where: whereClause,
      data: {
        isRead: true
      }
    });
  }
}