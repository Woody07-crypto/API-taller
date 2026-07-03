import { Post } from './post.model';

class PostRepository {
  private posts: Post[] = [];

  findAll(): Post[] {
    return [...this.posts];
  }

  findById(id: string): Post | undefined {
    return this.posts.find(post => post.id === id);
  }

  findBySlug(slug: string): Post | undefined {
    return this.posts.find(post => post.slug === slug);
  }

  create(post: Post): Post {
    this.posts.push(post);
    return post;
  }

  update(id: string, data: Partial<Post>): Post | undefined {
    const index = this.posts.findIndex(post => post.id === id);
    if (index === -1) return undefined;
    
    this.posts[index] = { ...this.posts[index], ...data };
    return this.posts[index];
  }

  delete(id: string): boolean {
    const index = this.posts.findIndex(post => post.id === id);
    if (index === -1) return false;
    
    this.posts.splice(index, 1);
    return true;
  }

  clear(): void {
    this.posts = [];
  }

  seed(posts: Post[]): void {
    this.posts = [...posts];
  }

  count(): number {
    return this.posts.length;
  }
}

export const postRepository = new PostRepository();
