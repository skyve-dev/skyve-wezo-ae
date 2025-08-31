import prisma from '../config/database';
import { Prisma } from '@prisma/client';

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

    // Create payment and property objects for backward compatibility
    const result = {
      ...reservation,
      payment: {
        totalPrice: reservation.totalPrice,
        commissionAmount: reservation.commissionAmount,
        paymentStatus: reservation.paymentStatus,
      },
      property: reservation.ratePlan?.property,
    };

    return result;
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
        ratePlan: {
          property: {
            ownerId: userId,
          },
        },
      },
    });

    if (!reservation) {
      throw new Error('Reservation not found or you do not have permission to message');
    }

    const message = await prisma.message.create({
      data: {
        reservationId,
        senderId: userId,
        senderType: 'HomeOwner',
        recipientId: reservation.guestId,
        recipientType: 'Tenant',
        content: messageContent,
      },
    });

    return message;
  }

  async getReservationMessages(reservationId: string, userId: string): Promise<any> {
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
}

export default new ReservationService();