import { Router } from 'express';
import { logInteraction } from '../controllers/interaction.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { logInteractionSchema } from '../schemas/interaction.schema.js';

const router = Router();

router.post('/', validateRequest(logInteractionSchema), logInteraction);

export default router;
