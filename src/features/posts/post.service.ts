import { Post, PostStatus, VALID_STATUSES } from './post.model';
import { postRepository } from './post.repository';
import { AppError } from '../../middlewares/errorHandler';

/** Autor por defecto hasta que exista auth (fuera de alcance de Store). */
const DEFAULT_AUTHOR_ID = 'system';

/** Genera un slug simple a partir del título. */
export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // quita acentos (marcas diacríticas)
    .replace(/[^a-z0-9]+/g, '-')      // no-alfanumérico -> guion
    .replace(/^-+|-+$/g, '');         // recorta guiones de los extremos
}

/** Datos crudos que llegan del body de POST /posts. */
export interface CreatePostInput {
  title?: unknown;
  content?: unknown;
  excerpt?: unknown;
  status?: unknown;
  author_id?: unknown;
}

export class PostService {
  /**
   * Crea un post. Reglas (Store):
   * - title y content son obligatorios.
   * - status por defecto = 'draft'; si viene, debe ser un estado válido.
   * - slug se genera del título.
   * Lanza AppError(422, ..., fields) si la validación falla; el middleware
   * central lo formatea. Nadie arma la respuesta de error aquí.
   */
  create(input: CreatePostInput): Post {
    const fields: Record<string, string> = {};

    const title = typeof input.title === 'string' ? input.title.trim() : '';
    const content = typeof input.content === 'string' ? input.content.trim() : '';

    if (!title) {
      fields.title = 'title es obligatorio';
    }
    if (!content) {
      fields.content = 'content es obligatorio';
    }

    const status: PostStatus = (input.status as PostStatus) ?? 'draft';
    if (input.status !== undefined && !VALID_STATUSES.includes(input.status as PostStatus)) {
      fields.status = `status inválido: debe ser uno de ${VALID_STATUSES.join(', ')}`;
    }

    if (Object.keys(fields).length > 0) {
      throw new AppError(422, 'Datos inválidos', fields);
    }

    const excerpt = typeof input.excerpt === 'string' ? input.excerpt : '';
    const author_id = typeof input.author_id === 'string' ? input.author_id : DEFAULT_AUTHOR_ID;

    return postRepository.create({
      title,
      content,
      excerpt,
      slug: slugify(title),
      status,
      author_id
    });
  }

  canPublish(post: Post): boolean {
    return post.title.trim().length > 0 && post.content.trim().length > 0;
  }

  canUpdate(post: Post): boolean {
    return post.status !== 'trash';
  }

  changeStatus(post: Post, newStatus: PostStatus): Post {
    const updatedPost = { ...post, updated_at: new Date() };

    if (newStatus === 'publish' && post.status !== 'publish') {
      if (!this.canPublish(post)) {
        throw new Error('No se puede publicar: título y contenido son obligatorios');
      }
      if (post.published_at === null) {
        updatedPost.published_at = new Date();
      }
    }

    if (newStatus === 'trash' && post.status !== 'trash') {
      updatedPost.deleted_at = new Date();
    }

    if (post.status === 'trash' && newStatus !== 'trash') {
      updatedPost.deleted_at = null;
    }

    updatedPost.status = newStatus;
    return updatedPost;
  }

  isSlugUnique(slug: string, posts: Post[], excludeId?: string): boolean {
    return !posts.some(post => post.slug === slug && post.id !== excludeId);
  }

  validateStatusTransition(post: Post, newStatus: PostStatus): { valid: boolean; error?: string } {
    if (post.status === 'trash' && newStatus !== 'trash') {
      return { valid: true };
    }

    if (post.status === 'trash') {
      return { valid: false, error: 'Un post en papelera no puede actualizarse. Primero debe restaurarse.' };
    }

    if (newStatus === 'publish' && !this.canPublish(post)) {
      return { valid: false, error: 'No se puede publicar: título y contenido son obligatorios' };
    }

    return { valid: true };
  }
}

export const postService = new PostService();
