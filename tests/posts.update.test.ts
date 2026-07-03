import request from 'supertest';
import app from '../src/app';
import { postRepository } from '../src/features/posts/post.repository';
import { Post } from '../src/features/posts/post.model';

function createPost(overrides: Partial<Post> = {}): Post {
  const now = new Date('2024-01-01T00:00:00.000Z');

  return {
    id: 'post-1',
    title: 'Test Post',
    content: 'Test content',
    excerpt: 'Test excerpt',
    slug: 'test-post',
    status: 'draft',
    author_id: 'author-1',
    published_at: null,
    deleted_at: null,
    created_at: now,
    updated_at: now,
    ...overrides
  };
}

describe('PUT/PATCH /posts/:id', () => {
  beforeEach(() => {
    postRepository.clear();
  });

  it('permite actualización parcial con PATCH', async () => {
    postRepository.create(createPost());

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ title: 'Título actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Título actualizado');
    expect(res.body.content).toBe('Test content');
  });

  it('permite actualización completa con PUT', async () => {
    postRepository.create(createPost());

    const res = await request(app)
      .put('/posts/post-1')
      .send({
        title: 'Nuevo título',
        content: 'Nuevo contenido',
        excerpt: 'Nuevo resumen',
        slug: 'nuevo-slug',
        status: 'pending',
        author_id: 'author-2'
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Nuevo título');
    expect(res.body.content).toBe('Nuevo contenido');
    expect(res.body.excerpt).toBe('Nuevo resumen');
    expect(res.body.slug).toBe('nuevo-slug');
    expect(res.body.status).toBe('pending');
    expect(res.body.author_id).toBe('author-2');
  });

  it('conserva los campos no enviados', async () => {
    postRepository.create(createPost({
      title: 'Título original',
      content: 'Contenido original',
      excerpt: 'Resumen original'
    }));

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ title: 'Título nuevo' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Título nuevo');
    expect(res.body.content).toBe('Contenido original');
    expect(res.body.excerpt).toBe('Resumen original');
  });

  it('actualiza automáticamente updated_at', async () => {
    const originalDate = new Date('2024-01-01T00:00:00.000Z');
    postRepository.create(createPost({ updated_at: originalDate }));

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ title: 'Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.updated_at).not.toBe(originalDate.toISOString());
  });

  it('retorna 404 si el post no existe', async () => {
    const res = await request(app)
      .patch('/posts/post-inexistente')
      .send({ title: 'No existe' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('retorna 422 si el status es inválido', async () => {
    postRepository.create(createPost());

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ status: 'invalid' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('status');
  });

  it('retorna 422 si se intenta publicar sn title', async () => {
    postRepository.create(createPost({
      title: '',
      content: 'Contenido válido',
      status: 'draft'
    }));

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ status: 'publish' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('retorna 422 si se intenta publicar sin content', async () => {
    postRepository.create(createPost({
      title: 'Título válido',
      content: '',
      status: 'draft'
    }));

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ status: 'publish' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('permite publicar y asigna published_at por primera vez', async () => {
    postRepository.create(createPost({
      title: 'Título válido',
      content: 'Contenido válido',
      status: 'draft',
      published_at: null
    }));

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ status: 'publish' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('publish');
    expect(res.body.published_at).not.toBeNull();
  });

  it('no sobrescribe published_at si ya existía', async () => {
    const publishedAt = new Date('2024-02-01T00:00:00.000Z');

    postRepository.create(createPost({
      status: 'publish',
      published_at: publishedAt
    }));

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ title: 'Nuevo título' });

    expect(res.status).toBe(200);
    expect(res.body.published_at).toBe(publishedAt.toISOString());
  });

  it('permite mover a trash y asigna deleted_at', async () => {
    postRepository.create(createPost({
      status: 'draft',
      deleted_at: null
    }));

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ status: 'trash' });

    const post = postRepository.findById('post-1');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('trash');
    expect(post?.deleted_at).not.toBeNull();
  });

  it('bloquea actualización directa si el post está en trash', async () => {
    postRepository.create(createPost({
      status: 'trash',
      title: 'Título original',
      deleted_at: new Date('2024-03-01T00:00:00.000Z')
    }));

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ title: 'Título cambiado' });

    const post = postRepository.findById('post-1');

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
    expect(post?.title).toBe('Título original');
  });

  it('retorna 422 si se envían campos protegidos', async () => {
    postRepository.create(createPost());

    const res = await request(app)
      .patch('/posts/post-1')
      .send({ id: 'post-cambiado' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('id');
  });
});
