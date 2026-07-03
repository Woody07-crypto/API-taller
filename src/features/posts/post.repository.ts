import { Post } from './post.model';

/**
 * STUB EN MEMORIA del repositorio de Posts.
 *
 * La slice "Modelo Post" (persistencia real / DB) aún no existe, así que este
 * repositorio guarda los posts en un array en memoria para no bloquear la
 * feature Store. Reemplazar por la implementación real cuando esté disponible.
 * Los datos se pierden al reiniciar el proceso.
 */
export interface NewPostData {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: Post['status'];
  author_id: string;
}

class InMemoryPostRepository {
  private posts: Post[] = [];
  private sequence = 1;

  create(data: NewPostData): Post {
    const now = new Date();
    const post: Post = {
      id: String(this.sequence++),
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      slug: data.slug,
      status: data.status,
      author_id: data.author_id,
      published_at: data.status === 'publish' ? now : null,
      deleted_at: data.status === 'trash' ? now : null,
      created_at: now,
      updated_at: now
    };
    this.posts.push(post);
    return post;
  }

  /** Utilidad para los tests: vacía el almacenamiento. */
  clear(): void {
    this.posts = [];
    this.sequence = 1;
  }
}

export const postRepository = new InMemoryPostRepository();
