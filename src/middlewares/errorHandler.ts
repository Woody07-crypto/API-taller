import { Request, Response, NextFunction } from 'express';

/**
 * Error de dominio de la API. Todo error controlado se lanza como AppError
 * y el middleware central lo traduce al formato estándar. Nadie arma la
 * respuesta de error a mano en los handlers.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly fields?: Record<string, string>;

  constructor(statusCode: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Shape estándar de error para toda la API:
 *   { "error": { "message": string, "status": number, "fields"?: {...} } }
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode,
        ...(err.fields ? { fields: err.fields } : {})
      }
    });
    return;
  }

  res.status(500).json({
    error: {
      message: 'Error interno del servidor',
      status: 500
    }
  });
}
