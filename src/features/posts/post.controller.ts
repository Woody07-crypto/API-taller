import { Request, Response, NextFunction } from 'express';
import { postService } from './post.service';

export class PostController {
  async index(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
    // Implementación pendiente en Spec 1
  }

  async show(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
    // Implementación pendiente en Spec 2
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = postService.create(req.body ?? {});
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }

  async update(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
    // Implementación pendiente en Spec 4
  }

  async destroy(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
    // Implementación pendiente en Spec 5
  }
}

export const postController = new PostController();
