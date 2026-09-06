import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn({ err, statusCode: err.statusCode }, err.message);
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  // Unhandled / unexpected internal server errors
  logger.error({ err }, 'Unhandled Server Error');
  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack, details: err.message }),
  });
};
