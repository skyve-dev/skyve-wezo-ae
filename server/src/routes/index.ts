import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;