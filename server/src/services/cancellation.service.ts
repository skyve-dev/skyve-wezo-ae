import prisma from '../config/database';
import { CancellationType, ReservationStatus } from '@prisma/client';
import { ReservationAuditService } from './reservation-audit.service';

export interface CancellationPreview {
  reservationId: string;
  originalAmount: number;
  refundAmount: number;
  cancellationFee: number;
  refundPercentage: number;
  policyType: 'FullyFlexible' | 'Moderate' | 'NonRefundable';
  policyDetails: string;
  daysBeforeCheckIn: number;
  canCancel: boolean;
  cancellationReason?: string;
}

export interface CancellationRequest {
  reservationId: string;
  reason: string;
  reasonCategory: 'PLANS_CHANGED' | 'EMERGENCY' | 'FOUND_BETTER_OPTION' | 'NO_LONGER_NEEDED' | 'OTHER';
  initiatedBy: 'GUEST' | 'HOST' | 'SYSTEM';
  userId: string;
}

export class CancellationService {
  private auditService = new ReservationAuditService();

  /**
   * Calculate refund amount based on cancellation policy
   */
  private calculateRefundAmount(
    totalPrice: number,
    policyType: CancellationType,
    daysBeforeCheckIn: number,
    freeCancellationDays?: number | null,
    partialRefundDays?: number | null
  ): { refundAmount: number; cancellationFee: number; refundPercentage: number } {
    let refundPercentage = 0;

    switch (policyType) {
      case CancellationType.NonRefundable:
        // No refund for non-refundable bookings
        refundPercentage = 0;
        break;

      case CancellationType.FullyFlexible:
        // Full refund if cancelled before the free cancellation period
        // Default: 100% refund if > 1 day before check-in
        const flexibleDays = freeCancellationDays || 1;
        if (daysBeforeCheckIn >= flexibleDays) {
          refundPercentage = 100;
        } else {
          refundPercentage = 0;
        }
        break;

      case CancellationType.Moderate:
        // Tiered refund based on days before check-in
        // Default: 100% if > 7 days, 50% if > 3 days, 0% otherwise
        const fullRefundDays = freeCancellationDays || 7;
        const partialDays = partialRefundDays || 3;
        
        if (daysBeforeCheckIn >= fullRefundDays) {
          refundPercentage = 100;
        } else if (daysBeforeCheckIn >= partialDays) {
          refundPercentage = 50;
        } else {
          refundPercentage = 0;
        }
        break;
    }

    const refundAmount = (totalPrice * refundPercentage) / 100;
    const cancellationFee = totalPrice - refundAmount;

    return {
      refundAmount: Number(refundAmount.toFixed(2)),
      cancellationFee: Number(cancellationFee.toFixed(2)),
      refundPercentage
    };
  }

  /**
   * Get cancellation preview for a reservation
   */
  async getCancellationPreview(reservationId: string, userId: string): Promise<CancellationPreview> {
    // Fetch reservation with all related data
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        ratePlan: {
          include: {
            cancellationPolicy: true
          }
        },
        property: true,
        guest: true
      }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Check if user has permission to cancel
    const isGuest = reservation.guestId === userId;
    const isPropertyOwner = reservation.property.ownerId === userId;
    
    if (!isGuest && !isPropertyOwner) {
      throw new Error('You do not have permission to cancel this reservation');
    }

    // Check if reservation can be cancelled
    if (reservation.status === ReservationStatus.Cancelled) {
      throw new Error('Reservation is already cancelled');
    }

    if (reservation.status === ReservationStatus.NoShow) {
      throw new Error('Cannot cancel a no-show reservation');
    }

    // Calculate days before check-in
    const now = new Date();
    const checkInDate = new Date(reservation.checkInDate);
    const diffTime = checkInDate.getTime() - now.getTime();
    const daysBeforeCheckIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if already checked in
    if (daysBeforeCheckIn < 0) {
      throw new Error('Cannot cancel after check-in date');
    }

    // Get cancellation policy
    let policyType: CancellationType = CancellationType.FullyFlexible; // Default
    let freeCancellationDays: number | null = 1;
    let partialRefundDays: number | null = null;
    let policyDetails = 'Free cancellation up to 24 hours before check-in';

    if (reservation.ratePlan?.cancellationPolicy) {
      const policy = reservation.ratePlan.cancellationPolicy;
      policyType = policy.type;
      freeCancellationDays = policy.freeCancellationDays;
      partialRefundDays = policy.partialRefundDays;

      // Generate policy description
      switch (policyType) {
        case CancellationType.NonRefundable:
          policyDetails = 'Non-refundable booking. No cancellation allowed.';
          break;
        case CancellationType.FullyFlexible:
          policyDetails = `Free cancellation up to ${freeCancellationDays || 1} day(s) before check-in`;
          break;
        case CancellationType.Moderate:
          policyDetails = `100% refund if cancelled ${freeCancellationDays || 7}+ days before check-in, 50% refund if cancelled ${partialRefundDays || 3}+ days before`;
          break;
      }
    }

    // Calculate refund amount
    const totalPrice = Number(reservation.totalPrice);
    const { refundAmount, cancellationFee, refundPercentage } = this.calculateRefundAmount(
      totalPrice,
      policyType,
      daysBeforeCheckIn,
      freeCancellationDays,
      partialRefundDays
    );

    // For host-initiated cancellations, always full refund
    const finalRefundAmount = isPropertyOwner ? totalPrice : refundAmount;
    const finalCancellationFee = isPropertyOwner ? 0 : cancellationFee;
    const finalRefundPercentage = isPropertyOwner ? 100 : refundPercentage;

    return {
      reservationId,
      originalAmount: totalPrice,
      refundAmount: finalRefundAmount,
      cancellationFee: finalCancellationFee,
      refundPercentage: finalRefundPercentage,
      policyType: policyType as 'FullyFlexible' | 'Moderate' | 'NonRefundable',
      policyDetails,
      daysBeforeCheckIn,
      canCancel: true
    };
  }

  /**
   * Process cancellation request
   */
  async processCancellation(request: CancellationRequest): Promise<any> {
    // Get cancellation preview first
    const preview = await this.getCancellationPreview(request.reservationId, request.userId);

    if (!preview.canCancel) {
      throw new Error('This reservation cannot be cancelled');
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id: request.reservationId },
        data: {
          status: ReservationStatus.Cancelled,
          notes: `Cancelled by ${request.initiatedBy}. Reason: ${request.reason}`
        },
        include: {
          property: true,
          guest: true,
          ratePlan: true
        }
      });

      // Get user role for audit
      const user = await tx.user.findUnique({
        where: { id: request.userId }
      });
      
      // Create audit log
      await this.auditService.logChange(
        request.reservationId,
        request.userId,
        user?.role || 'Tenant',
        'CANCELLED',
        {
          field: 'status',
          oldValue: ReservationStatus.Confirmed,
          newValue: ReservationStatus.Cancelled,
          metadata: {
            reason: request.reason,
            refundAmount: preview.refundAmount,
            cancellationFee: preview.cancellationFee
          }
        }
      );

      // Update availability (release the dates)
      const checkIn = new Date(updatedReservation.checkInDate);
      const checkOut = new Date(updatedReservation.checkOutDate);
      const dates = [];
      
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      // Mark dates as available again
      await tx.availability.updateMany({
        where: {
          propertyId: updatedReservation.propertyId,
          date: {
            in: dates
          }
        },
        data: {
          isAvailable: true
        }
      });

      // Create payout record for refund (if applicable)
      if (preview.refundAmount > 0) {
        await tx.payout.create({
          data: {
            reservationId: request.reservationId,
            homeOwnerId: updatedReservation.property.ownerId,
            amount: -preview.refundAmount, // Negative amount for refund
            currency: 'AED',
            status: 'Pending',
            scheduledAt: new Date() // Process immediately
          }
        });
      }

      return {
        reservation: updatedReservation,
        cancellationDetails: {
          ...preview,
          cancellationDate: new Date(),
          reason: request.reason,
          reasonCategory: request.reasonCategory,
          initiatedBy: request.initiatedBy
        }
      };
    });

    // TODO: Send notification emails to guest and host
    // TODO: Process actual refund through payment gateway

    return result;
  }

  /**
   * Get cancellation history for a user
   */
  async getCancellationHistory(userId: string, role: 'guest' | 'host'): Promise<any[]> {
    const whereClause = role === 'guest' 
      ? { guestId: userId, status: ReservationStatus.Cancelled }
      : { property: { ownerId: userId }, status: ReservationStatus.Cancelled };

    const cancellations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        property: {
          select: {
            propertyId: true,
            name: true
          }
        },
        guest: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        ratePlan: {
          include: {
            cancellationPolicy: true
          }
        },
        auditLogs: {
          where: {
            action: 'CANCELLED'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return cancellations.map(reservation => {
      const cancellationLog = reservation.auditLogs[0];
      return {
        ...reservation,
        cancellationDate: cancellationLog?.createdAt,
        cancellationReason: cancellationLog?.description
      };
    });
  }
}