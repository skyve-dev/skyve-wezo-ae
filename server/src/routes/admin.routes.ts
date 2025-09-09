import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { bookingCleanupService } from '../services/booking-cleanup.service';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * Get cleanup service status
 */
router.get('/cleanup/status', (_req: Request, res: Response) => {
  try {
    const status = bookingCleanupService.getStatus();
    res.json({
      success: true,
      data: {
        running: status.running,
        message: status.running ? 'Cleanup service is running' : 'Cleanup service is stopped'
      }
    });
  } catch (error) {
    console.error('Error getting cleanup service status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cleanup service status'
    });
  }
});

/**
 * Start cleanup service
 */
router.post('/cleanup/start', (req: Request, res: Response) => {
  try {
    const intervalMs = parseInt(req.body.intervalMs || '60000', 10);
    bookingCleanupService.start(intervalMs);
    res.json({
      success: true,
      message: `Cleanup service started with interval: ${intervalMs / 1000}s`
    });
  } catch (error) {
    console.error('Error starting cleanup service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start cleanup service'
    });
  }
});

/**
 * Stop cleanup service
 */
router.post('/cleanup/stop', (_req: Request, res: Response) => {
  try {
    bookingCleanupService.stop();
    res.json({
      success: true,
      message: 'Cleanup service stopped'
    });
  } catch (error) {
    console.error('Error stopping cleanup service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop cleanup service'
    });
  }
});

/**
 * Run cleanup manually (one-time)
 */
router.post('/cleanup/run-now', async (_req: Request, res: Response) => {
  try {
    await bookingCleanupService.runCleanupNow();
    res.json({
      success: true,
      message: 'Manual cleanup completed successfully'
    });
  } catch (error) {
    console.error('Error running manual cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run manual cleanup'
    });
  }
});

export default router;