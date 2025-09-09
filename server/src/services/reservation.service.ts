import prisma from '../config/database';
import { Prisma, UserRole, ReservationStatus } from '@prisma/client';

export class ReservationService {
  async getAllReservations(
    userId: string,
    filters: {
      status?: string;
      propertyId?: string;
      startDate?: string;
      endDate?: string;
    },
    page: number,
    limit: number
  ): Promise<any> {
    const ratePlanWhere: any = {
      property: {
        ownerId: userId,
      },
    };

    if (filters.propertyId) {
      ratePlanWhere.propertyId = filters.propertyId;
    }

    const whereClause: Prisma.ReservationWhereInput = {
      ratePlan: ratePlanWhere,
    };

    if (filters.status) {
      whereClause.status = filters.status as any;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.checkInDate = {};
      if (filters.startDate) {
        whereClause.checkInDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.checkInDate.lte = new Date(filters.endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [reservations, totalCount] = await prisma.$transaction([
      prisma.reservation.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          ratePlan: {
            select: {
              id: true,
              name: true,
              property: {
                select: {
                  propertyId: true,
                  name: true,
                  address: {
                    select: {
                      city: true,
                      countryOrRegion: true,
                    },
                  },
                },
              },
            },
          },
          guest: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: {
          checkInDate: 'desc',
        },
      }),
      prisma.reservation.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      reservations,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    };
  }

  async getReservation(reservationId: string, userId: string): Promise<any> {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        ratePlan: {
          property: {
            ownerId: userId,
          },
        },
      },
      include: {
        ratePlan: {
          include: {
            property: {
              select: {
                propertyId: true,
                name: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            sentAt: 'desc',
          },
          take: 10,
        },
        review: true,
      },
    });

    if (!reservation) {
      throw new Error('Reservation not found or you do not have permission to view it');
    }

    return reservation;
  }

  async updateReservation(
    reservationId: string,
    userId: string,
    updateData: any
  ): Promise<any> {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        ratePlan: {
          property: {
            ownerId: userId,
          },
        },
      },
    });

    if (!reservation) {
      throw new Error('Reservation not found or you do not have permission to update it');
    }

    if (reservation.status === 'Confirmed' || reservation.status === 'Completed') {
      throw new Error('Cannot modify a confirmed or completed reservation');
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        checkInDate: updateData.checkInDate ? new Date(updateData.checkInDate) : undefined,
        checkOutDate: updateData.checkOutDate ? new Date(updateData.checkOutDate) : undefined,
        numGuests: updateData.guestCount,
        totalPrice: updateData.totalPrice,
        status: updateData.status,
      },
      include: {
        ratePlan: {
          select: {
            id: true,
            name: true,
            property: {
              select: {
                propertyId: true,
                name: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return updatedReservation;
  }

  async reportNoShow(
    reservationId: string,
    userId: string,
    _reason: string,
    _description?: string
  ): Promise<any> {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        ratePlan: {
          property: {
            ownerId: userId,
          },
        },
      },
      include: {},
    });

    if (!reservation) {
      throw new Error('Reservation not found or you do not have permission to update it');
    }

    if (reservation.status !== 'Confirmed') {
      throw new Error('Can only report no-show for confirmed reservations');
    }

    const [updatedReservation] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: 'NoShow',
        },
      }),
    ]);

    // Update commission amount in the reservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        commissionAmount: 0,
      },
    });

    return {
      commissionWaived: true,
      reservation: updatedReservation,
    };
  }

  async sendGuestMessage(
    reservationId: string,
    userId: string,
    messageContent: string
  ): Promise<any> {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        OR: [
          {
            // Direct property ownership
            property: {
              ownerId: userId,
            },
          },
          {
            // Rate plan property ownership
            ratePlan: {
              property: {
                ownerId: userId,
              },
            },
          },
          {
            // Guest sending message about their own reservation
            guestId: userId,
          },
        ],
      },
      include: {
        property: {
          select: {
            ownerId: true,
          },
        },
        ratePlan: {
          include: {
            property: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new Error('Reservation not found or you do not have permission to message');
    }

    // Determine sender and recipient types based on who is sending the message
    const isGuestSending = userId === reservation.guestId;
    const senderType = isGuestSending ? 'Tenant' : 'HomeOwner';
    const recipientType = isGuestSending ? 'HomeOwner' : 'Tenant';
    
    // Determine recipient ID based on who is sending
    const recipientId = isGuestSending ? 
      (reservation.property?.ownerId || reservation.ratePlan?.property?.ownerId) :
      reservation.guestId;

    if (!recipientId) {
      throw new Error('Unable to determine message recipient');
    }

    const message = await prisma.message.create({
      data: {
        reservationId,
        senderId: userId,
        senderType,
        recipientId,
        recipientType,
        content: messageContent,
      },
    });

    return message;
  }

  async getReservationMessages(reservationId: string, userId: string): Promise<any> {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        OR: [
          {
            // Direct property ownership
            property: {
              ownerId: userId,
            },
          },
          {
            // Rate plan property ownership
            ratePlan: {
              property: {
                ownerId: userId,
              },
            },
          },
          {
            // Guest access to their own reservations
            guestId: userId,
          },
        ],
      },
    });

    if (!reservation) {
      throw new Error('Reservation not found or you do not have permission to view messages');
    }

    const messages = await prisma.message.findMany({
      where: { reservationId },
      orderBy: { sentAt: 'asc' },
    });

    await prisma.message.updateMany({
      where: {
        reservationId,
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return messages;
  }

  async respondToReview(reviewId: string, userId: string, response: string): Promise<any> {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        property: {
          ownerId: userId,
        },
      },
      include: {
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
        guest: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!review) {
      throw new Error('Review not found or you do not have permission to respond');
    }

    if (review.response) {
      throw new Error('Review already has a response');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { response },
      include: {
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
        guest: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return updatedReview;
  }

  // ===== NEW METHODS FOR BOOKING DETAILS PAGE =====

  /**
   * Get enhanced reservation details with role-based information
   */
  async getReservationWithFullDetails(
    reservationId: string,
    userId: string,
    userRole: UserRole,
    include: string[] = []
  ): Promise<any> {
    // Build dynamic include based on user role and requested includes
    const includeOptions: any = {
      property: {
        include: {
          address: true,
          photos: {
            where: { isMain: true },
            take: 3
          },
          amenities: true,
          checkInCheckout: true,
          ...(userRole === 'Manager' ? {
            owner: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          } : {})
        }
      },
      ratePlan: {
        include: {
          cancellationPolicy: true,
          features: true
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
      messages: include.includes('messages') ? {
        include: {
          attachments: true
        },
        orderBy: {
          sentAt: 'desc'
        },
        take: 50
      } : false,
      auditLogs: include.includes('audit-log') && userRole !== 'Tenant' ? {
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
        },
        take: 100
      } : false,
      feeBreakdown: include.includes('fee-breakdown') ? true : false,
      payout: include.includes('payout') && userRole !== 'Tenant' ? true : false,
      review: true
    };

    // Build where clause based on user role
    const whereClause: any = { id: reservationId };
    
    if (userRole === 'Tenant') {
      whereClause.guestId = userId;
    } else if (userRole === 'HomeOwner') {
      whereClause.OR = [
        {
          property: {
            ownerId: userId
          }
        },
        {
          ratePlan: {
            property: {
              ownerId: userId
            }
          }
        }
      ];
    }
    // Managers can access all reservations

    const reservation = await prisma.reservation.findFirst({
      where: whereClause,
      include: includeOptions
    });

    if (!reservation) {
      throw new Error('Reservation not found or you do not have permission to view it');
    }

    // Remove private notes for Tenants
    if (userRole === 'Tenant') {
      const { notes, ...reservationWithoutNotes } = reservation;
      return reservationWithoutNotes;
    }

    return reservation;
  }

  /**
   * Modify reservation details with audit logging
   */
  async modifyReservation(
    reservationId: string,
    userId: string,
    modifications: {
      checkInDate?: string;
      checkOutDate?: string;
      numGuests?: number;
      guestRequests?: string;
      notes?: string;
    }
  ): Promise<any> {
    // First get the existing reservation
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!existingReservation) {
      throw new Error('Reservation not found');
    }

    // Validate user permissions
    const userRole = await this.getUserRole(userId);
    await this.validateReservationAccess(reservationId, userId, userRole);

    // Check if modification is allowed
    if (existingReservation.status === 'Completed' || existingReservation.status === 'Cancelled') {
      throw new Error('Cannot modify completed or cancelled reservations');
    }

    // Prepare update data
    const updateData: any = {};
    const changes: any = {};

    if (modifications.checkInDate) {
      updateData.checkInDate = new Date(modifications.checkInDate);
      changes.checkInDate = {
        old: existingReservation.checkInDate.toISOString(),
        new: modifications.checkInDate
      };
    }

    if (modifications.checkOutDate) {
      updateData.checkOutDate = new Date(modifications.checkOutDate);
      changes.checkOutDate = {
        old: existingReservation.checkOutDate.toISOString(),
        new: modifications.checkOutDate
      };
    }

    if (modifications.numGuests !== undefined) {
      updateData.numGuests = modifications.numGuests;
      changes.numGuests = {
        old: existingReservation.numGuests,
        new: modifications.numGuests
      };
    }

    if (modifications.guestRequests !== undefined) {
      updateData.guestRequests = modifications.guestRequests;
      changes.guestRequests = {
        old: existingReservation.guestRequests,
        new: modifications.guestRequests
      };
    }

    if (modifications.notes !== undefined && userRole !== 'Tenant') {
      updateData.notes = modifications.notes;
      changes.notes = {
        old: existingReservation.notes,
        new: modifications.notes
      };
    }

    // Update reservation and log changes
    const [updatedReservation] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id: reservationId },
        data: updateData,
        include: {
          property: true,
          guest: true,
          ratePlan: true
        }
      }),
      // Log the changes
      ...Object.keys(changes).map(field =>
        prisma.reservationAuditLog.create({
          data: {
            reservationId,
            userId,
            userRole,
            action: 'modified',
            field,
            oldValue: JSON.stringify(changes[field].old),
            newValue: JSON.stringify(changes[field].new),
            description: `${field} changed from ${changes[field].old} to ${changes[field].new}`
          }
        })
      )
    ]);

    return {
      reservation: updatedReservation,
      changes: Object.keys(changes).map(field => ({
        field,
        oldValue: changes[field].old,
        newValue: changes[field].new
      }))
    };
  }

  /**
   * Update reservation status with audit logging
   */
  async updateReservationStatus(
    reservationId: string,
    userId: string,
    newStatus: ReservationStatus,
    reason?: string
  ): Promise<any> {
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!existingReservation) {
      throw new Error('Reservation not found');
    }

    const userRole = await this.getUserRole(userId);
    await this.validateReservationAccess(reservationId, userId, userRole);

    // Validate status transition
    this.validateStatusTransition(existingReservation.status as ReservationStatus, newStatus, userRole);

    const [updatedReservation, auditLog] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id: reservationId },
        data: { status: newStatus }
      }),
      // Log the status change
      prisma.reservationAuditLog.create({
        data: {
          reservationId,
          userId,
          userRole,
          action: 'status_changed',
          field: 'status',
          oldValue: existingReservation.status,
          newValue: newStatus,
          description: `Status changed from ${existingReservation.status} to ${newStatus}${reason ? `. Reason: ${reason}` : ''}`
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      })
    ]);

    return {
      reservation: updatedReservation,
      auditLog: auditLog
    };
  }

  /**
   * Add or update private notes
   */
  async updatePrivateNotes(
    reservationId: string,
    userId: string,
    notes: string
  ): Promise<void> {
    const userRole = await this.getUserRole(userId);
    
    if (userRole === 'Tenant') {
      throw new Error('Only HomeOwners and Managers can modify private notes');
    }

    await this.validateReservationAccess(reservationId, userId, userRole);

    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { notes: true }
    });

    await prisma.$transaction([
      prisma.reservation.update({
        where: { id: reservationId },
        data: { notes }
      }),
      prisma.reservationAuditLog.create({
        data: {
          reservationId,
          userId,
          userRole,
          action: 'notes_updated',
          field: 'notes',
          oldValue: existingReservation?.notes || null,
          newValue: notes,
          description: 'Private notes updated'
        }
      })
    ]);
  }

  /**
   * Calculate fee breakdown for a reservation
   */
  async calculateFeeBreakdown(reservationId: string): Promise<any> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        property: true,
        ratePlan: true
      }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const checkInDate = new Date(reservation.checkInDate);
    const checkOutDate = new Date(reservation.checkOutDate);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate fees (simplified calculation - in real implementation, use booking-calculator.service.ts)
    const basePrice = reservation.totalPrice.toNumber() * 0.85;
    const cleaningFee = reservation.totalPrice.toNumber() * 0.10;
    const serviceFee = reservation.totalPrice.toNumber() * 0.05;
    const taxAmount = 0; // No tax in UAE
    const platformCommission = reservation.totalPrice.toNumber() * 0.15;
    const paymentProcessingFee = reservation.totalPrice.toNumber() * 0.03;

    const totalGuestPays = reservation.totalPrice.toNumber();
    const platformRevenue = platformCommission + serviceFee + paymentProcessingFee;
    const ownerReceives = totalGuestPays - platformRevenue;

    const feeBreakdown = {
      basePrice,
      nights,
      cleaningFee,
      serviceFee,
      taxAmount,
      platformCommission,
      paymentProcessingFee,
      totalGuestPays,
      ownerReceives,
      platformRevenue
    };

    // Store or update the fee breakdown
    await prisma.reservationFeeBreakdown.upsert({
      where: { reservationId },
      create: {
        reservationId,
        ...feeBreakdown
      },
      update: feeBreakdown
    });

    return feeBreakdown;
  }

  /**
   * Create or update payout for reservation
   */
  async createPayout(reservationId: string, homeOwnerId: string): Promise<any> {
    const feeBreakdown = await this.calculateFeeBreakdown(reservationId);
    
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Schedule payout for 1 day after checkout
    const scheduledAt = new Date(reservation.checkOutDate);
    scheduledAt.setDate(scheduledAt.getDate() + 1);

    const payout = await prisma.payout.upsert({
      where: { reservationId },
      create: {
        reservationId,
        homeOwnerId,
        amount: feeBreakdown.ownerReceives,
        currency: 'AED',
        status: 'Pending',
        scheduledAt
      },
      update: {
        amount: feeBreakdown.ownerReceives,
        scheduledAt
      }
    });

    return payout;
  }

  /**
   * Get audit trail for a reservation
   */
  async getAuditTrail(
    reservationId: string,
    userId: string,
    filters: {
      action?: string;
      startDate?: string;
      endDate?: string;
    } = {},
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    const userRole = await this.getUserRole(userId);
    
    if (userRole === 'Tenant') {
      throw new Error('Tenants cannot view audit trails');
    }

    await this.validateReservationAccess(reservationId, userId, userRole);

    const whereClause: any = { reservationId };

    if (filters.action) {
      whereClause.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [auditLogs, totalCount] = await prisma.$transaction([
      prisma.reservationAuditLog.findMany({
        where: whereClause,
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
        },
        skip,
        take: limit
      }),
      prisma.reservationAuditLog.count({ where: whereClause })
    ]);

    return {
      auditLogs: auditLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit
      }
    };
  }

  /**
   * Export reservation data
   */
  async exportReservationData(
    reservationId: string,
    userId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    const reservation = await this.getReservationWithFullDetails(
      reservationId,
      userId,
      await this.getUserRole(userId),
      ['fee-breakdown', 'audit-log', 'messages']
    );

    const exportData = {
      reservation,
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: userId,
        format
      }
    };

    if (format === 'csv') {
      // In a real implementation, convert to CSV format
      // For now, return the JSON data
    }

    return exportData;
  }

  // ===== HELPER METHODS =====

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

  private async validateReservationAccess(
    reservationId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    if (userRole === 'Manager') {
      return; // Managers can access all reservations
    }

    const whereClause: any = { id: reservationId };

    if (userRole === 'Tenant') {
      whereClause.guestId = userId;
    } else if (userRole === 'HomeOwner') {
      whereClause.OR = [
        {
          property: {
            ownerId: userId
          }
        },
        {
          ratePlan: {
            property: {
              ownerId: userId
            }
          }
        }
      ];
    }

    const reservation = await prisma.reservation.findFirst({
      where: whereClause,
      select: { id: true }
    });

    if (!reservation) {
      throw new Error('Reservation not found or you do not have permission to access it');
    }
  }

  private validateStatusTransition(
    currentStatus: ReservationStatus,
    newStatus: ReservationStatus,
    userRole: UserRole
  ): void {
    // Define allowed status transitions based on user role
    const allowedTransitions: Record<UserRole, Record<ReservationStatus, ReservationStatus[]>> = {
      Tenant: {
        Pending: ['Cancelled'],
        Confirmed: ['Cancelled'],
        Modified: ['Cancelled'],
        Completed: [],
        Cancelled: [],
        NoShow: []
      },
      HomeOwner: {
        Pending: ['Confirmed', 'Cancelled'],
        Confirmed: ['Modified', 'Completed', 'NoShow', 'Cancelled'],
        Modified: ['Confirmed', 'Cancelled'],
        Completed: [],
        Cancelled: [],
        NoShow: []
      },
      Manager: {
        Pending: ['Confirmed', 'Modified', 'Cancelled'],
        Confirmed: ['Modified', 'Completed', 'NoShow', 'Cancelled'],
        Modified: ['Confirmed', 'Cancelled'],
        Completed: ['Cancelled'], // Managers can reverse completed bookings
        Cancelled: ['Confirmed'], // Managers can restore cancelled bookings
        NoShow: ['Cancelled', 'Confirmed']
      }
    };

    const allowedStatuses = allowedTransitions[userRole]?.[currentStatus] || [];

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${newStatus} for ${userRole} role`);
    }
  }
}

export default new ReservationService();