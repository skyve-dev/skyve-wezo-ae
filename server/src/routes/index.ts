import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import photoRoutes from './photo.routes';
import availabilityRoutes from './availability.routes';
import ratePlanRoutes from './rateplan.routes';
import propertyPricingRoutes from './property-pricing.routes';
import reservationRoutes from './reservation.routes';
import financialRoutes from './financial.routes';
import notificationRoutes from './notification.routes';
import reviewRoutes from './review.routes';
import bookingRoutes from './bookingRoutes';
import messageAttachmentRoutes from './messageAttachmentRoutes';
import messageRoutes from './message.routes';
import dashboardRoutes from './dashboard.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/photos', photoRoutes);
router.use('/', availabilityRoutes);
router.use('/', ratePlanRoutes);
router.use('/', propertyPricingRoutes);
router.use('/', reservationRoutes);
router.use('/', financialRoutes);
router.use('/', notificationRoutes);
router.use('/', reviewRoutes);
router.use('/booking', bookingRoutes);
router.use('/api', messageAttachmentRoutes);
router.use('/messages', messageRoutes);
router.use('/api/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;