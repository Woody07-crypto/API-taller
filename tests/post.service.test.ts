import { postService } from '../src/features/posts/post.service';
import { Post } from '../src/features/posts/post.model';

function createMockPost(overrides: Partial<Post> = {}): Post {
  return {
    id: '1',
    title: 'Test Post',
    content: 'Test content',
    excerpt: 'Test excerpt',
    slug: 'test-post',
    status: 'draft',
    author_id: 'author-1',
    published_at: null,
    deleted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  };
}

describe('PostService', () => {
  describe('canPublish', () => {
    it('retorna true cuando title y content no están vacíos', () => {
      const post = createMockPost({ title: 'Título', content: 'Contenido' });
      expect(postService.canPublish(post)).toBe(true);
    });

    it('retorna false cuando title está vacío', () => {
      const post = createMockPost({ title: '', content: 'Contenido' });
      expect(postService.canPublish(post)).toBe(false);
    });

    it('retorna false cuando content está vacío', () => {
      const post = createMockPost({ title: 'Título', content: '' });
      expect(postService.canPublish(post)).toBe(false);
    });

    it('retorna false cuando title solo tiene espacios', () => {
      const post = createMockPost({ title: '   ', content: 'Contenido' });
      expect(postService.canPublish(post)).toBe(false);
    });
  });

  describe('canUpdate', () => {
    it('retorna true cuando el post no está en trash', () => {
      const post = createMockPost({ status: 'draft' });
      expect(postService.canUpdate(post)).toBe(true);
    });

    it('retorna false cuando el post está en trash', () => {
      const post = createMockPost({ status: 'trash' });
      expect(postService.canUpdate(post)).toBe(false);
    });
  });

  describe('changeStatus', () => {
    it('asigna published_at la primera vez que cambia a publish', () => {
      const post = createMockPost({ status: 'draft', published_at: null });
      const updated = postService.changeStatus(post, 'publish');
      
      expect(updated.status).toBe('publish');
      expect(updated.published_at).toBeInstanceOf(Date);
    });

    it('no modifica published_at si ya estaba publicado antes', () => {
      const originalDate = new Date('2024-01-01');
      const post = createMockPost({ status: 'draft', published_at: originalDate });
      const updated = postService.changeStatus(post, 'publish');
      
      expect(updated.published_at).toEqual(originalDate);
    });

    it('asigna deleted_at al mover a trash', () => {
      const post = createMockPost({ status: 'draft', deleted_at: null });
      const updated = postService.changeStatus(post, 'trash');
      
      expect(updated.status).toBe('trash');
      expect(updated.deleted_at).toBeInstanceOf(Date);
    });

    it('limpia deleted_at al restaurar desde trash', () => {
      const post = createMockPost({ status: 'trash', deleted_at: new Date() });
      const updated = postService.changeStatus(post, 'draft');
      
      expect(updated.status).toBe('draft');
      expect(updated.deleted_at).toBeNull();
    });

    it('lanza error si intenta publicar sin título o contenido', () => {
      const post = createMockPost({ title: '', content: '' });
      
      expect(() => postService.changeStatus(post, 'publish'))
        .toThrow('No se puede publicar: título y contenido son obligatorios');
    });
  });

  describe('isSlugUnique', () => {
    const posts: Post[] = [
      createMockPost({ id: '1', slug: 'post-uno' }),
      createMockPost({ id: '2', slug: 'post-dos' })
    ];

    it('retorna true cuando el slug no existe', () => {
      expect(postService.isSlugUnique('nuevo-slug', posts)).toBe(true);
    });

    it('retorna false cuando el slug ya existe', () => {
      expect(postService.isSlugUnique('post-uno', posts)).toBe(false);
    });

    it('retorna true cuando el slug existe pero pertenece al post que se está editando', () => {
      expect(postService.isSlugUnique('post-uno', posts, '1')).toBe(true);
    });
  });

  describe('validateStatusTransition', () => {
    it('permite restaurar un post desde trash', () => {
      const post = createMockPost({ status: 'trash' });
      const result = postService.validateStatusTransition(post, 'draft');
      
      expect(result.valid).toBe(true);
    });

    it('no permite actualizar un post en trash a otro estado trash', () => {
      const post = createMockPost({ status: 'trash' });
      const result = postService.validateStatusTransition(post, 'trash');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('papelera');
    });

    it('no permite publicar sin título y contenido', () => {
      const post = createMockPost({ title: '', content: '' });
      const result = postService.validateStatusTransition(post, 'publish');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('título y contenido');
    });
  });
});
