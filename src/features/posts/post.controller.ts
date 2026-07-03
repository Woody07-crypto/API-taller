import { Request, Response, NextFunction } from 'express';
import { postService } from './post.service';
import { 
  PostQueryParams, 
  VALID_STATUSES, 
  VALID_ORDERBY_FIELDS, 
  VALID_ORDER_DIRECTIONS,
  PostStatus,
  OrderByField,
  OrderDirection
} from './post.model';
import { AppError } from '../../middlewares/errorHandler';

export class PostController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = this.parseAndValidateQueryParams(req.query);
      const result = postService.findAll(params);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  private parseAndValidateQueryParams(query: Record<string, unknown>): PostQueryParams {
    const page = this.parsePositiveInt(query.page, 1, 'page');
    const per_page = this.parsePositiveInt(query.per_page, 10, 'per_page');

    const status = query.status as string | undefined;
    if (status && !VALID_STATUSES.includes(status as PostStatus)) {
      throw new AppError(422, `El parámetro status debe ser uno de: ${VALID_STATUSES.join(', ')}`);
    }

    const orderby = (query.orderby as string) || 'created_at';
    if (!VALID_ORDERBY_FIELDS.includes(orderby as OrderByField)) {
      throw new AppError(422, `El parámetro orderby debe ser uno de: ${VALID_ORDERBY_FIELDS.join(', ')}`);
    }

    const order = (query.order as string) || 'desc';
    if (!VALID_ORDER_DIRECTIONS.includes(order as OrderDirection)) {
      throw new AppError(422, `El parámetro order debe ser uno de: ${VALID_ORDER_DIRECTIONS.join(', ')}`);
    }

    return {
      page,
      per_page,
      search: query.search as string | undefined,
      status: status as PostStatus | undefined,
      author: query.author as string | undefined,
      orderby: orderby as OrderByField,
      order: order as OrderDirection
    };
  }

  private parsePositiveInt(value: unknown, defaultValue: number, paramName: string): number {
    if (value === undefined || value === '') {
      return defaultValue;
    }

    const parsed = parseInt(value as string, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new AppError(422, `El parámetro ${paramName} debe ser un número entero positivo`);
    }

    return parsed;
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
