import { Request, Response } from 'express';
import reviewService from '../services/review.service';

// Guest Review Endpoints
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const guestId = (req as any).user.id;
    const { reservationId, rating, comment } = req.body;

    // Validate required fields
    if (!reservationId || !rating) {
      res.status(400).json({ error: 'Reservation ID and rating are required' });
      return;
    }

    // Validate rating range
    if (rating < 1 || rating > 10) {
      res.status(400).json({ error: 'Rating must be between 1 and 10' });
      return;
    }

    const review = await reviewService.createReview(guestId, reservationId, rating, comment);

    res.status(201).json({
      message: 'Review submitted successfully',
      review,
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    if (error.message.includes('cannot review') || error.message.includes('You can only review')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGuestPendingReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const guestId = (req as any).user.id;
    const pendingReviews = await reviewService.getGuestPendingReviews(guestId);
    
    res.json({
      pendingReviews,
      count: pendingReviews.length,
    });
  } catch (error: any) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGuestReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const guestId = (req as any).user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await reviewService.getGuestReviews(
      guestId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Get guest reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const canReviewReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const guestId = (req as any).user.id;
    const { reservationId } = req.params;

    const result = await reviewService.canGuestReview(guestId, reservationId);
    
    res.json({
      canReview: result.allowed,
      reason: result.reason,
      reservation: result.reservation,
    });
  } catch (error: any) {
    console.error('Check can review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// HomeOwner Review Endpoints
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { propertyId, rating, hasResponse, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filters: any = {};
    if (propertyId) filters.propertyId = propertyId as string;
    if (rating) filters.rating = parseInt(rating as string);
    if (typeof hasResponse === 'string') filters.hasResponse = hasResponse === 'true';
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;

    const result = await reviewService.getReviews(
      userId,
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPropertyReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { propertyId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await reviewService.getPropertyReviews(
      propertyId,
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Get property reviews error:', error);
    if (error.message === 'Property not found or you do not have permission to view its reviews') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { propertyId } = req.query;

    const stats = await reviewService.getReviewStats(userId, propertyId as string);

    res.json(stats);
  } catch (error: any) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const respondToReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { reviewId } = req.params;
    const { response } = req.body;

    const updatedReview = await reviewService.respondToReview(reviewId, userId, response);

    res.json({
      message: 'Response added successfully',
      review: updatedReview,
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

export const updateResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { reviewId } = req.params;
    const { response } = req.body;

    const updatedReview = await reviewService.updateResponse(reviewId, userId, response);

    res.json({
      message: 'Response updated successfully',
      review: updatedReview,
    });
  } catch (error: any) {
    console.error('Update review response error:', error);
    if (error.message === 'Review not found or you do not have permission to update response') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Review does not have a response to update') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { reviewId } = req.params;

    const updatedReview = await reviewService.deleteResponse(reviewId, userId);

    res.json({
      message: 'Response deleted successfully',
      review: updatedReview,
    });
  } catch (error: any) {
    console.error('Delete review response error:', error);
    if (error.message === 'Review not found or you do not have permission to delete response') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Review does not have a response to delete') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReviewInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { propertyId } = req.query;

    const insights = await reviewService.getReviewInsights(userId, propertyId as string);

    res.json(insights);
  } catch (error: any) {
    console.error('Get review insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};