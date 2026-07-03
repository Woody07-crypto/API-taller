import { AppError } from '../../middlewares/errorHandler';
import { 
  Post, 
  PostStatus, 
  PostQueryParams, 
  PaginatedResponse, 
  PostPublic, 
  toPostPublic,
  VALID_STATUSES
} from './post.model';
import { postRepository } from './post.repository';

export class PostService {
  findAll(params: PostQueryParams): PaginatedResponse<PostPublic> {
    let posts = postRepository.findAll();

    if (params.status) {
      posts = posts.filter(post => post.status === params.status);
    }

    if (params.author) {
      posts = posts.filter(post => post.author_id === params.author);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }

    posts = this.sortPosts(posts, params.orderby, params.order);

    const total = posts.length;
    const total_pages = Math.ceil(total / params.per_page);
    const start = (params.page - 1) * params.per_page;
    const paginatedPosts = posts.slice(start, start + params.per_page);

    return {
      data: paginatedPosts.map(toPostPublic),
      pagination: {
        page: params.page,
        per_page: params.per_page,
        total,
        total_pages
      }
    };
  }

  update(id: string, payload: Record<string, unknown>): PostPublic {
    const currentPost = postRepository.findById(id);

    if (!currentPost) {
      throw new AppError(404, 'Post no encontrado');
    }

    if (!this.canUpdate(currentPost)) {
      throw new AppError(422, 'Un post en papelera no puede actualizarse. Primero debe restaurarse.');
    }

    const updateData = this.validateUpdatePayload(payload);
    const candidatePost: Post = {
      ...currentPost,
      ...updateData
    };

    if (candidatePost.status === 'publish' && !this.canPublish(candidatePost)) {
      throw new AppError(422, 'No se puede publicar: title y content son obligatorios');
    }

    const now = new Date();

    const postToSave: Post = {
      ...candidatePost,
      updated_at: now
    };

    if (
      updateData.status === 'publish' &&
      currentPost.status !== 'publish' &&
      currentPost.published_at === null
    ) {
      postToSave.published_at = now;
    }

    if (updateData.status === 'trash' && currentPost.status !== 'trash') {
      postToSave.deleted_at = now;
    }

    const updatedPost = postRepository.update(id, postToSave);

    if (!updatedPost) {
      throw new AppError(404, 'Post no encontrado');
    }

    return toPostPublic(updatedPost);
  }

  private validateUpdatePayload(payload: Record<string, unknown>): Partial<Post> {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new AppError(422, 'El cuerpo de la petición debe ser un objeto JSON');
    }

    const allowedFields = ['title', 'content', 'excerpt', 'slug', 'status', 'author_id'];
    const protectedFields = ['id', 'created_at', 'updated_at', 'published_at', 'deleted_at'];
    const receivedFields = Object.keys(payload);

    if (receivedFields.length === 0) {
      throw new AppError(422, 'Debe enviar al menos un campo para actualizar');
    }

    const protectedField = receivedFields.find(field => protectedFields.includes(field));
    if (protectedField) {
      throw new AppError(422, `El campo ${protectedField} no puede modificarse directamente`);
    }

    const invalidField = receivedFields.find(field => !allowedFields.includes(field));
    if (invalidField) {
      throw new AppError(422, `El campo ${invalidField} no es válido para actualizar`);
    }

    const updateData: Partial<Post> = {};

    if (payload.title !== undefined) {
      updateData.title = this.validateStringField(payload.title, 'title');
    }

    if (payload.content !== undefined) {
      updateData.content = this.validateStringField(payload.content, 'content');
    }

    if (payload.excerpt !== undefined) {
      updateData.excerpt = this.validateStringField(payload.excerpt, 'excerpt');
    }

    if (payload.slug !== undefined) {
      updateData.slug = this.validateStringField(payload.slug, 'slug');
    }

    if (payload.author_id !== undefined) {
      updateData.author_id = this.validateStringField(payload.author_id, 'author_id');
    }

    if (payload.status !== undefined) {
      if (typeof payload.status !== 'string') {
        throw new AppError(422, 'El campo status debe ser texto');
      }

      if (!VALID_STATUSES.includes(payload.status as PostStatus)) {
        throw new AppError(422, `El campo status debe ser uno de: ${VALID_STATUSES.join(', ')}`);
      }

      updateData.status = payload.status as PostStatus;
    }

    return updateData;
  }

  private validateStringField(value: unknown, fieldName: string): string {
    if (typeof value !== 'string') {
      throw new AppError(422, `El campo ${fieldName} debe ser texto`);
    }

    return value;
  }

  private sortPosts(posts: Post[], orderby: string, order: string): Post[] {
    return [...posts].sort((a, b) => {
      let comparison = 0;

      if (orderby === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (orderby === 'updated_at') {
        comparison = a.updated_at.getTime() - b.updated_at.getTime();
      } else {
        comparison = a.created_at.getTime() - b.created_at.getTime();
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  getById(id: string): PostPublic {
    const post = postRepository.findById(id);

    if (!post || post.status === 'trash') {
      throw new AppError(404, 'Post no encontrado');
    }

    return toPostPublic(post);
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
    return !posts.some(post => post.slug ===slug && post.id !== excludeId);
  }

  validateStatusTransition(post: Post, newStatus: PostStatus): { valid: boolean; error?: string } {
    if (post.status === 'trash' && newStatus !== 'trash') {
      return { valid: true };
    }

    if (post.status === 'trash') {
      return { valid: false, error: 'Un post en papelera no puede actualizarse. Primero debe restaurarse.' };
    }

    const candidatePost = { ...post, status: newStatus };

    if (newStatus === 'publish' && !this.canPublish(candidatePost)) {
      return { valid: false, error: 'No se puede publicar: título y contenido son obligatorios' };
    }

    return { valid: true };
  }
}

export const postService = new PostService();
