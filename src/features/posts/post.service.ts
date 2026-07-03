import { Post, PostStatus } from './post.model';

export class PostService {
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
