import { Router } from 'express';
import healthRoutes from './health.routes.js';
import interactionRoutes from './interaction.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/interactions', interactionRoutes);

export default router;
