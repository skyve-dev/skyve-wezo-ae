import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DashboardStats {
  properties: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
  };
  reservations: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
    checkingInToday: number;
    checkingOutToday: number;
  };
  financial: {
    thisMonth: {
      earnings: number;
      bookings: number;
      averageBookingValue: number;
      currency: string;
    };
    yearToDate: {
      earnings: number;
      bookings: number;
      currency: string;
    };
    pendingPayout: {
      amount: number;
      currency: string;
      nextPayoutDate: string;
    };
  };
  reviews: {
    totalReviews: number;
    averageRating: number;
    pendingResponses: number;
    recentReviews: {
      id: string;
      guestName: string;
      propertyName: string;
      rating: number;
      comment: string;
      createdAt: string;
      hasResponse: boolean;
    }[];
  };
  messages: {
    totalUnread: number;
    totalConversations: number;
    recentMessages: {
      id: string;
      senderName: string;
      subject: string;
      content: string;
      createdAt: string;
      isRead: boolean;
      senderType: 'guest' | 'support';
    }[];
  };
  occupancy: {
    currentOccupancyRate: number;
    averageOccupancyRate: number;
    occupancyTrend: 'up' | 'down' | 'stable';
    occupancyByProperty: {
      propertyId: string;
      propertyName: string;
      occupancyRate: number;
      bookedNights: number;
      totalNights: number;
    }[];
  };
  performance: {
    topPerformingProperties: {
      propertyId: string;
      propertyName: string;
      earnings: number;
      bookingCount: number;
      occupancyRate: number;
      averageRating: number;
    }[];
    monthlyTrends: {
      month: string;
      earnings: number;
      bookings: number;
      occupancyRate: number;
    }[];
    seasonalTrends: {
      season: 'spring' | 'summer' | 'autumn' | 'winter';
      averageBookings: number;
      averageEarnings: number;
      peakMonths: string[];
    }[];
  };
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'important' | 'normal';
  category: 'property' | 'reservation' | 'review' | 'message' | 'finance';
  actionRequired: string;
  relatedEntity: {
    id: string;
    type: string;
    name: string;
  };
  dueDate?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  category: 'booking' | 'payment' | 'review' | 'message' | 'property' | 'system';
  isRead: boolean;
  actionUrl?: string;
  relatedEntity?: {
    id: string;
    type: string;
    name: string;
  };
  createdAt: string;
  expiresAt?: string;
}

class DashboardService {
  async getDashboardStats(userId: string, _filters: {
    dateRange?: { start: string; end: string };
    propertyIds?: string[];
    includeInactive?: boolean;
  } = {}): Promise<DashboardStats> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      // Get basic property stats
      const [totalProperties, liveProperties, closedProperties, draftProperties] = await Promise.all([
        prisma.property.count({ where: { ownerId: userId } }),
        prisma.property.count({ where: { ownerId: userId, status: 'Live' } }),
        prisma.property.count({ where: { ownerId: userId, status: 'Closed' } }),
        prisma.property.count({ where: { ownerId: userId, status: 'Draft' } })
      ]);

      // Get basic reservation stats
      const [
        totalReservations,
        confirmedReservations,
        pendingReservations,
        completedReservations,
        cancelledReservations,
        checkingInToday,
        checkingOutToday
      ] = await Promise.all([
        prisma.reservation.count({
          where: { property: { ownerId: userId } }
        }),
        prisma.reservation.count({
          where: { property: { ownerId: userId }, status: 'Confirmed' }
        }),
        prisma.reservation.count({
          where: { property: { ownerId: userId }, status: 'Pending' }
        }),
        prisma.reservation.count({
          where: { property: { ownerId: userId }, status: 'Completed' }
        }),
        prisma.reservation.count({
          where: { property: { ownerId: userId }, status: 'Cancelled' }
        }),
        prisma.reservation.count({
          where: {
            property: { ownerId: userId },
            checkInDate: { gte: today, lt: tomorrow }
          }
        }),
        prisma.reservation.count({
          where: {
            property: { ownerId: userId },
            checkOutDate: { gte: today, lt: tomorrow }
          }
        })
      ]);

      // Get simple financial stats (mocked for now as financial models may not be complete)
      const thisMonthBookings = await prisma.reservation.count({
        where: {
          property: { ownerId: userId },
          createdAt: { gte: thisMonthStart }
        }
      });

      const yearToDateBookings = await prisma.reservation.count({
        where: {
          property: { ownerId: userId },
          createdAt: { gte: yearStart }
        }
      });

      // Mock earnings calculation
      const thisMonthEarnings = thisMonthBookings * 1500; // Mock AED 1500 per booking
      const yearToDateEarnings = yearToDateBookings * 1500;
      const averageBookingValue = thisMonthBookings > 0 ? thisMonthEarnings / thisMonthBookings : 0;

      // Get review stats
      const totalReviews = await prisma.review.count({
        where: { property: { ownerId: userId } }
      });

      const pendingResponses = await prisma.review.count({
        where: {
          property: { ownerId: userId },
          response: null
        }
      });

      const avgRatingResult = await prisma.review.aggregate({
        where: { property: { ownerId: userId } },
        _avg: { rating: true }
      });

      const recentReviews = await prisma.review.findMany({
        where: { property: { ownerId: userId } },
        include: { guest: true, property: true },
        orderBy: { reviewedAt: 'desc' },
        take: 5
      });

      // Get message stats
      const totalUnread = await prisma.message.count({
        where: { recipientId: userId, isRead: false }
      });

      const totalConversations = 0; // Mock for now as conversation model may not exist

      const recentMessages = await prisma.message.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return {
        properties: {
          total: totalProperties,
          active: liveProperties,
          inactive: closedProperties,
          pending: draftProperties
        },
        reservations: {
          total: totalReservations,
          confirmed: confirmedReservations,
          pending: pendingReservations,
          completed: completedReservations,
          cancelled: cancelledReservations,
          checkingInToday,
          checkingOutToday
        },
        financial: {
          thisMonth: {
            earnings: thisMonthEarnings,
            bookings: thisMonthBookings,
            averageBookingValue,
            currency: 'AED'
          },
          yearToDate: {
            earnings: yearToDateEarnings,
            bookings: yearToDateBookings,
            currency: 'AED'
          },
          pendingPayout: {
            amount: Math.floor(thisMonthEarnings * 0.8), // Mock 80% of earnings
            currency: 'AED',
            nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          }
        },
        reviews: {
          totalReviews,
          averageRating: Math.round((avgRatingResult._avg.rating || 0) * 100) / 100,
          pendingResponses,
          recentReviews: recentReviews.map(review => ({
            id: review.id,
            guestName: `${review.guest.firstName} ${review.guest.lastName}`,
            propertyName: review.property.name,
            rating: review.rating,
            comment: review.comment || '',
            createdAt: review.reviewedAt.toISOString(),
            hasResponse: !!review.response
          }))
        },
        messages: {
          totalUnread,
          totalConversations,
          recentMessages: recentMessages.map(message => ({
            id: message.id,
            senderName: 'Guest', // Mock name as sender relation may not be available
            subject: 'Message',
            content: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
            createdAt: message.createdAt.toISOString(),
            isRead: message.isRead,
            senderType: message.senderType === 'Tenant' ? 'guest' : 'support' as 'guest' | 'support'
          }))
        },
        occupancy: {
          currentOccupancyRate: 75, // Mock data
          averageOccupancyRate: 72, // Mock data
          occupancyTrend: 'stable' as 'up' | 'down' | 'stable',
          occupancyByProperty: [] // Mock empty for now
        },
        performance: {
          topPerformingProperties: [], // Mock empty for now
          monthlyTrends: [], // Mock empty for now
          seasonalTrends: [] // Mock empty for now
        }
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      // Return safe defaults on error
      return {
        properties: { total: 0, active: 0, inactive: 0, pending: 0 },
        reservations: { total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0, checkingInToday: 0, checkingOutToday: 0 },
        financial: {
          thisMonth: { earnings: 0, bookings: 0, averageBookingValue: 0, currency: 'AED' },
          yearToDate: { earnings: 0, bookings: 0, currency: 'AED' },
          pendingPayout: { amount: 0, currency: 'AED', nextPayoutDate: new Date().toISOString() }
        },
        reviews: { totalReviews: 0, averageRating: 0, pendingResponses: 0, recentReviews: [] },
        messages: { totalUnread: 0, totalConversations: 0, recentMessages: [] },
        occupancy: { currentOccupancyRate: 0, averageOccupancyRate: 0, occupancyTrend: 'stable' as 'up' | 'down' | 'stable', occupancyByProperty: [] },
        performance: { topPerformingProperties: [], monthlyTrends: [], seasonalTrends: [] }
      };
    }
  }

  async getQuickActions(userId: string): Promise<QuickAction[]> {
    const actions: QuickAction[] = [];

    try {
      // Check for pending reviews
      const pendingReviews = await prisma.review.count({
        where: {
          property: { ownerId: userId },
          response: null
        }
      });

      if (pendingReviews > 0) {
        actions.push({
          id: 'pending-reviews',
          title: 'Respond to Guest Reviews',
          description: `You have ${pendingReviews} guest reviews waiting for your response`,
          type: 'important',
          category: 'review',
          actionRequired: 'Respond to reviews',
          relatedEntity: { id: 'reviews', type: 'page', name: 'Reviews' },
          createdAt: new Date().toISOString()
        });
      }

      // Check for unread messages
      const unreadMessages = await prisma.message.count({
        where: { recipientId: userId, isRead: false }
      });

      if (unreadMessages > 0) {
        actions.push({
          id: 'unread-messages',
          title: 'New Messages',
          description: `You have ${unreadMessages} unread messages from guests`,
          type: 'normal',
          category: 'message',
          actionRequired: 'Read messages',
          relatedEntity: { id: 'inbox', type: 'page', name: 'Inbox' },
          createdAt: new Date().toISOString()
        });
      }

      // Check for draft properties
      const draftProperties = await prisma.property.count({
        where: { ownerId: userId, status: 'Draft' }
      });

      if (draftProperties > 0) {
        actions.push({
          id: 'draft-properties',
          title: 'Draft Properties',
          description: `You have ${draftProperties} draft properties`,
          type: 'normal',
          category: 'property',
          actionRequired: 'Activate properties',
          relatedEntity: { id: 'properties', type: 'page', name: 'Properties' },
          createdAt: new Date().toISOString()
        });
      }

      // Check for pending reservations
      const pendingReservations = await prisma.reservation.count({
        where: {
          property: { ownerId: userId },
          status: 'Pending'
        }
      });

      if (pendingReservations > 0) {
        actions.push({
          id: 'pending-reservations',
          title: 'Pending Reservations',
          description: `You have ${pendingReservations} reservations waiting for confirmation`,
          type: 'urgent',
          category: 'reservation',
          actionRequired: 'Confirm reservations',
          relatedEntity: { id: 'reservations', type: 'page', name: 'Reservations' },
          createdAt: new Date().toISOString()
        });
      }

      return actions;
    } catch (error) {
      console.error('Quick actions error:', error);
      return [];
    }
  }

  async getNotifications(userId: string, filters: {
    unreadOnly?: boolean;
    category?: string;
    limit?: number;
  } = {}): Promise<Notification[]> {
    const notifications: Notification[] = [];

    try {
      // Get recent reservations for notifications
      const recentReservations = await prisma.reservation.findMany({
        where: {
          property: { ownerId: userId },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        include: { property: true, guest: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      recentReservations.forEach(reservation => {
        notifications.push({
          id: `reservation-${reservation.id}`,
          title: 'New Reservation',
          message: `New booking for ${reservation.property.name} by ${reservation.guest.firstName} ${reservation.guest.lastName}`,
          type: 'success',
          category: 'booking',
          isRead: false,
          actionUrl: `/reservations/${reservation.id}`,
          relatedEntity: { id: reservation.id, type: 'reservation', name: `Booking #${reservation.id}` },
          createdAt: reservation.createdAt.toISOString()
        });
      });

      // Apply filters
      let filteredNotifications = notifications;
      
      if (filters.unreadOnly) {
        filteredNotifications = filteredNotifications.filter(n => !n.isRead);
      }
      
      if (filters.category) {
        filteredNotifications = filteredNotifications.filter(n => n.category === filters.category);
      }
      
      if (filters.limit) {
        filteredNotifications = filteredNotifications.slice(0, filters.limit);
      }

      return filteredNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Notifications error:', error);
      return [];
    }
  }

  async markNotificationAsRead(_userId: string, notificationId?: string, markAllRead = false): Promise<string[]> {
    // Mock implementation for now
    if (markAllRead) {
      return ['all'];
    }
    return notificationId ? [notificationId] : [];
  }

  async dismissQuickAction(_userId: string, _actionId: string): Promise<void> {
    // Mock implementation for now
  }
}

export default new DashboardService();