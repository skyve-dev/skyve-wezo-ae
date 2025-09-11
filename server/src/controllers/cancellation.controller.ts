import { Request, Response } from 'express';
import { CancellationService } from '../services/cancellation.service';

const cancellationService = new CancellationService();

export class CancellationController {
  /**
   * Get cancellation preview for a reservation
   * GET /api/reservations/:id/cancellation-preview
   */
  async getCancellationPreview(req: Request, res: Response): Promise<void> {
    try {
      const { id: reservationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const preview = await cancellationService.getCancellationPreview(reservationId, userId);
      
      res.json({
        success: true,
        data: preview
      });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Failed to get cancellation preview'
      });
    }
  }

  /**
   * Cancel a reservation
   * POST /api/reservations/:id/cancel
   */
  async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id: reservationId } = req.params;
      const { reason, reasonCategory } = req.body;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!reason || !reasonCategory) {
        res.status(400).json({
          success: false,
          message: 'Cancellation reason and category are required'
        });
        return;
      }

      // Determine who initiated the cancellation
      const initiatedBy = userRole === 'HomeOwner' ? 'HOST' : 'GUEST';

      const result = await cancellationService.processCancellation({
        reservationId,
        reason,
        reasonCategory,
        initiatedBy,
        userId
      });

      res.json({
        success: true,
        message: 'Reservation cancelled successfully',
        data: result
      });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Failed to cancel reservation'
      });
    }
  }

  /**
   * Get cancellation history
   * GET /api/cancellations/history
   */
  async getCancellationHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const role = userRole === 'HomeOwner' ? 'host' : 'guest';
      const history = await cancellationService.getCancellationHistory(userId, role);

      res.json({
        success: true,
        data: history
      });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Failed to get cancellation history'
      });
    }
  }
}