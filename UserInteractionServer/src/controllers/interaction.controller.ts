import { Request, Response } from 'express';
import { LogInteractionInput } from '../schemas/interaction.schema.js';
import { logger } from '../utils/logger.js';

export const logInteraction = async (
  req: Request<unknown, unknown, LogInteractionInput>,
  res: Response
): Promise<void> => {
  const { userId, targetId, actionType, metadata } = req.body;

  logger.info({ userId, targetId, actionType }, 'Interaction logged');

  res.status(201).json({
    status: 'success',
    data: {
      id: `act_${Date.now()}`,
      userId,
      targetId,
      actionType,
      metadata: metadata ?? {},
      createdAt: new Date().toISOString(),
    },
  });
};
