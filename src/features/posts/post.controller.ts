import { Request, Response, NextFunction } from 'express';

export class PostController {
  async index(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
    // Implementación pendiente en Spec 1
  }

  async show(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
    // Implementación pendiente en Spec 2
  }

  async store(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
    // Implementación pendiente en Spec 3
  }

  async update(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
    // Implementación pendiente en Spec 4
  }

  async destroy(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
    // Implementación pendiente en Spec 5
  }
}

export const postController = new PostController();
