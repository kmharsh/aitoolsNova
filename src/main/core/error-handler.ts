import { logger } from '../services/logger';

export class AppError extends Error {
  public readonly isOperational: boolean;

  constructor(message: string, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}

export function handleError(error: Error): void {
  logger.error('Unhandled Error', error);
  // Optionally notify renderer process if needed
}

process.on('uncaughtException', (err: Error) => {
  handleError(err);
});

process.on('unhandledRejection', (reason: unknown) => {
  handleError(reason instanceof Error ? reason : new Error(String(reason)));
});
