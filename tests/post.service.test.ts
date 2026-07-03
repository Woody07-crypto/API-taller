import { AppError } from '../src/middlewares/errorHandler';
import { postService } from '../src/features/posts/post.service';
import { postRepository } from '../src/features/posts/post.repository';
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
  beforeEach(() => {
    postRepository.clear();
  });

  describe('getById', () => {
    it('retorna un post activo con su estructura completa', () => {
      const now = new Date('2024-06-01T10:00:00.000Z');
      const post = createMockPost({
        id: '123',
        title: 'Mi post',
        content: 'Contenido del post',
        excerpt: 'Resumen',
        slug: 'mi-post',
        status: 'publish',
        author_id: 'author-42',
        published_at: now,
        created_at: now,
        updated_at: new Date('2024-06-02T12:00:00.000Z'),
      });
      postRepository.create(post);

      const result = postService.getById('123');

      expect(result).toEqual({
        id: '123',
        title: 'Mi post',
        content: 'Contenido del post',
        excerpt: 'Resumen',
        slug: 'mi-post',
        status: 'publish',
        author_id: 'author-42',
        published_at: now.toISOString(),
        created_at: now.toISOString(),
        updated_at: '2024-06-02T12:00:00.000Z',
      });
    });

    it('lanza 404 cuando el ID no existe', () => {
      expect(() => postService.getById('999')).toThrow(AppError);

      try {
        postService.getById('999');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
        expect((error as AppError).message).toBe('Post no encontrado');
      }
    });

    it('lanza 404 cuando el post existe pero está en trash', () => {
      postRepository.create(createMockPost({ id: '456', status: 'trash' }));

      expect(() => postService.getById('456')).toThrow(AppError);

      try {
        postService.getById('456');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
        expect((error as AppError).message).toBe('Post no encontrado');
      }
    });
  });

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
