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