import { Request, Response } from 'express';
import reservationService from '../services/reservation.service';

export const getAllReservations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, propertyId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const reservations = await reservationService.getAllReservations(
      req.user.id,
      {
        status: status as string,
        propertyId: propertyId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      },
      Number(page),
      Number(limit)
    );

    res.json(reservations);
  } catch (error: any) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;

    const reservation = await reservationService.getReservation(
      reservationId,
      req.user.id
    );

    res.json(reservation);
  } catch (error: any) {
    console.error('Get reservation error:', error);
    if (error.message === 'Reservation not found or you do not have permission to view it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const updateData = req.body;

    const reservation = await reservationService.updateReservation(
      reservationId,
      req.user.id,
      updateData
    );

    res.json({
      message: 'Reservation updated successfully',
      reservation,
    });
  } catch (error: any) {
    console.error('Update reservation error:', error);
    if (error.message === 'Reservation not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Cannot modify a confirmed or completed reservation') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reportNoShow = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const { reason, description } = req.body;

    const result = await reservationService.reportNoShow(
      reservationId,
      req.user.id,
      reason,
      description
    );

    res.json({
      message: 'Guest no-show reported successfully',
      commissionWaived: result.commissionWaived,
      reservation: result.reservation,
    });
  } catch (error: any) {
    console.error('Report no-show error:', error);
    if (error.message === 'Reservation not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Can only report no-show for confirmed reservations') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendGuestMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const { message } = req.body;

    const sentMessage = await reservationService.sendGuestMessage(
      reservationId,
      req.user.id,
      message
    );

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: sentMessage,
    });
  } catch (error: any) {
    console.error('Send guest message error:', error);
    if (error.message === 'Reservation not found or you do not have permission to message') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReservationMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;

    const messages = await reservationService.getReservationMessages(
      reservationId,
      req.user.id
    );

    res.json({
      reservationId,
      messages,
    });
  } catch (error: any) {
    console.error('Get reservation messages error:', error);
    if (error.message === 'Reservation not found or you do not have permission to view messages') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReservationWithFullDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const { include } = req.query;
    
    const includeArray = include ? (include as string).split(',') : [];

    const reservation = await reservationService.getReservationWithFullDetails(
      reservationId,
      req.user.id,
      req.user.role,
      includeArray
    );

    res.json({ booking: reservation });
  } catch (error: any) {
    console.error('Get reservation with full details error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const modifyReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const modificationData = req.body;

    const result = await reservationService.modifyReservation(
      reservationId,
      req.user.id,
      modificationData
    );

    res.json({
      message: 'Reservation modified successfully',
      reservation: result.reservation,
      auditLog: result.auditLog
    });
  } catch (error: any) {
    console.error('Modify reservation error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('Cannot modify')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateReservationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const { status, reason } = req.body;

    const result = await reservationService.updateReservationStatus(
      reservationId,
      req.user.id,
      status,
      reason
    );

    res.json({
      message: 'Reservation status updated successfully',
      reservation: result.reservation,
      auditLog: result.auditLog
    });
  } catch (error: any) {
    console.error('Update reservation status error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('Invalid status transition')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePrivateNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const { notes } = req.body;

    await reservationService.updatePrivateNotes(
      reservationId,
      req.user.id,
      notes
    );

    res.json({
      message: 'Private notes updated successfully'
    });
  } catch (error: any) {
    console.error('Update private notes error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('Only HomeOwners and Managers')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAuditTrail = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const { action, userId, startDate, endDate, field, page = 1, limit = 50 } = req.query;

    const filters = {
      action: action as string,
      userId: userId as string,
      startDate: startDate as string,
      endDate: endDate as string,
      field: field as string
    };

    const pagination = {
      page: Number(page),
      limit: Number(limit)
    };

    const auditData = await reservationService.getAuditTrail(
      reservationId,
      req.user.id,
      filters,
      pagination.page,
      pagination.limit
    );

    res.json(auditData);
  } catch (error: any) {
    console.error('Get audit trail error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('Tenants cannot view audit')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeeBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;

    const feeBreakdown = await reservationService.calculateFeeBreakdown(
      reservationId
    );

    res.json(feeBreakdown);
  } catch (error: any) {
    console.error('Get fee breakdown error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPayout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    // Note: Payout creation simplified - amount/payoutDate/bankDetails would be used in full implementation

    const payout = await reservationService.createPayout(
      reservationId,
      req.user.id
    );

    res.status(201).json({
      message: 'Payout created successfully',
      payout
    });
  } catch (error: any) {
    console.error('Create payout error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('Only Managers can create payouts')) {
      res.status(403).json({ error: error.message });
      return;
    }
    if (error.message.includes('cannot create payout for reservation with status')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReservationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;

    const reservation = await reservationService.getReservation(
      reservationId,
      req.user.id
    );

    res.json({
      reservation,
      // Additional stats can be calculated here if needed
    });
  } catch (error: any) {
    console.error('Get reservation stats error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportReservationData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const { format = 'json' } = req.query;
    // Note: includeAudit parameter not used in current implementation

    const exportData = await reservationService.exportReservationData(
      reservationId,
      req.user.id,
      format as 'json' | 'csv'
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="reservation-${reservationId}.csv"`);
      res.send(exportData);
    } else {
      res.json(exportData);
    }
  } catch (error: any) {
    console.error('Export reservation data error:', error);
    if (error.message.includes('not found or you do not have permission')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const respondToReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reviewId } = req.params;
    const { response } = req.body;

    const review = await reservationService.respondToReview(
      reviewId,
      req.user.id,
      response
    );

    res.json({
      message: 'Review response submitted successfully',
      review,
    });
  } catch (error: any) {
    console.error('Respond to review error:', error);
    if (error.message === 'Review not found or you do not have permission to respond') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Review already has a response') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};