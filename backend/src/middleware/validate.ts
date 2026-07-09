import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => {
          // Remove the first element of path (which is 'body' or 'params' or 'query')
          const field = err.path.slice(1).join('.');
          return `${field || String(err.path[0])}: ${err.message}`;
        }).join(', ');
        
        return res.status(400).json({
          success: false,
          message: `Validation error: ${errorMessages}`,
          errors: error.issues,
        });
      }
      next(error);
    }
  };
};
