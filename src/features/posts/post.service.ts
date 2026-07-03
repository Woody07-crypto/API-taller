import { AppError } from '../../middlewares/errorHandler';
import { 
  Post, 
  PostStatus, 
  PostQueryParams, 
  PaginatedResponse, 
  PostPublic, 
  toPostPublic 
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
