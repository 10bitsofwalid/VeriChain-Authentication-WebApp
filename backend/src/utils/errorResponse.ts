import { Response } from 'express';

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};
