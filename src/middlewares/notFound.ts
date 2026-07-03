import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Ninguna ruta coincidió: delega en el middleware central para que el error
 * salga con el formato estándar de la API (no el HTML por defecto de Express).
 */
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'Recurso no encontrado'));
}
