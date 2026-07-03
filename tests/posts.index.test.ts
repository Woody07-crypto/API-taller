import request from 'supertest';
import app from '../src/app';
import { postRepository } from '../src/features/posts/post.repository';
import { Post } from '../src/features/posts/post.model';

function createPost(overrides: Partial<Post> = {}): Post {
  const now = new Date();
  return {
    id: `post-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Post',
    content: 'Test content',
    excerpt: 'Test excerpt',
    slug: `test-post-${Math.random().toString(36).substr(2, 9)}`,
    status: 'publish',
    author_id: 'author-1',
    published_at: now,
    deleted_at: null,
    created_at: now,
    updated_at: now,
    ...overrides
  };
}

describe('GET /posts', () => {
  beforeEach(() => {
    postRepository.clear();
  });

  describe('Listado básico', () => {
    it('responde con código 200', async () => {
      const res = await request(app).get('/posts');
      expect(res.status).toBe(200);
    });

    it('responde con Content-Type application/json', async () => {
      const res = await request(app).get('/posts');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('retorna lista vacía cuando no hay posts', async () => {
      const res = await request(app).get('/posts');
      
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('retorna los posts existentes', async () => {
      const post = createPost({ title: 'Mi primer post' });
      postRepository.create(post);

      const res = await request(app).get('/posts');
      
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Mi primer post');
    });

    it('retorna solo campos públicos (sin deleted_at)', async () => {
      const post = createPost();
      postRepository.create(post);

      const res = await request(app).get('/posts');
      
      expect(res.body.data[0]).not.toHaveProperty('deleted_at');
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).toHaveProperty('title');
      expect(res.body.data[0]).toHaveProperty('content');
      expect(res.body.data[0]).toHaveProperty('excerpt');
      expect(res.body.data[0]).toHaveProperty('slug');
      expect(res.body.data[0]).toHaveProperty('status');
      expect(res.body.data[0]).toHaveProperty('author_id');
      expect(res.body.data[0]).toHaveProperty('published_at');
      expect(res.body.data[0]).toHaveProperty('created_at');
      expect(res.body.data[0]).toHaveProperty('updated_at');
    });
  });

  describe('Paginación', () => {
    beforeEach(() => {
      for (let i = 1; i <= 25; i++) {
        postRepository.create(createPost({ 
          id: `post-${i}`,
          title: `Post ${i}`,
          created_at: new Date(2024, 0, i)
        }));
      }
    });

    it('aplica paginación por defecto (page=1, per_page=10)', async () => {
      const res = await request(app).get('/posts');
      
      expect(res.body.data).toHaveLength(10);
      expect(res.body.pagination).toEqual({
        page: 1,
        per_page: 10,
        total: 25,
        total_pages: 3
      });
    });

    it('permite especificar página', async () => {
      const res = await request(app).get('/posts?page=2');
      
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.data).toHaveLength(10);
    });

    it('permite especificar cantidad por página', async () => {
      const res = await request(app).get('/posts?per_page=5');
      
      expect(res.body.data).toHaveLength(5);
      expect(res.body.pagination.per_page).toBe(5);
      expect(res.body.pagination.total_pages).toBe(5);
    });

    it('última página puede tener menos elementos', async () => {
      const res = await request(app).get('/posts?page=3&per_page=10');
      
      expect(res.body.data).toHaveLength(5);
      expect(res.body.pagination.page).toBe(3);
    });

    it('página fuera de rango retorna lista vacía', async () => {
      const res = await request(app).get('/posts?page=100');
      
      expect(res.body.data).toHaveLength(0);
      expect(res.body.pagination.page).toBe(100);
    });
  });

  describe('Búsqueda (search)', () => {
    beforeEach(() => {
      postRepository.create(createPost({ 
        id: '1', 
        title: 'Introducción a TypeScript',
        content: 'TypeScript es un lenguaje de programación'
      }));
      postRepository.create(createPost({ 
        id: '2', 
        title: 'Guía de JavaScript',
        content: 'JavaScript moderno con ES6'
      }));
      postRepository.create(createPost({ 
        id: '3', 
        title: 'Node.js básico',
        content: 'Cómo usar TypeScript con Node'
      }));
    });

    it('filtra por coincidencia en título', async () => {
      const res = await request(app).get('/posts?search=JavaScript');
      
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Guía de JavaScript');
    });

    it('filtra por coincidencia en contenido', async () => {
      const res = await request(app).get('/posts?search=ES6');
      
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Guía de JavaScript');
    });

    it('búsqueda es case-insensitive', async () => {
      const res = await request(app).get('/posts?search=typescript');
      
      expect(res.body.data).toHaveLength(2);
    });

    it('sin coincidencias retorna lista vacía', async () => {
      const res = await request(app).get('/posts?search=Python');
      
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('Filtrado por estado (status)', () => {
    beforeEach(() => {
      postRepository.create(createPost({ id: '1', status: 'draft' }));
      postRepository.create(createPost({ id: '2', status: 'publish' }));
      postRepository.create(createPost({ id: '3', status: 'publish' }));
      postRepository.create(createPost({ id: '4', status: 'pending' }));
      postRepository.create(createPost({ id: '5', status: 'trash' }));
    });

    it('filtra por estado draft', async () => {
      const res = await request(app).get('/posts?status=draft');
      
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('draft');
    });

    it('filtra por estado publish', async () => {
      const res = await request(app).get('/posts?status=publish');
      
      expect(res.body.data).toHaveLength(2);
      res.body.data.forEach((post: { status: string }) => {
        expect(post.status).toBe('publish');
      });
    });

    it('filtra por estado pending', async () => {
      const res = await request(app).get('/posts?status=pending');
      
      expect(res.body.data).toHaveLength(1);
    });

    it('filtra por estado private', async () => {
      const res = await request(app).get('/posts?status=private');
      
      expect(res.body.data).toHaveLength(0);
    });

    it('filtra por estado trash', async () => {
      const res = await request(app).get('/posts?status=trash');
      
      expect(res.body.data).toHaveLength(1);
    });

    it('sin filtro retorna todos los estados', async () => {
      const res = await request(app).get('/posts');
      
      expect(res.body.data).toHaveLength(5);
    });
  });

  describe('Filtrado por autor (author)', () => {
    beforeEach(() => {
      postRepository.create(createPost({ id: '1', author_id: 'user-1' }));
      postRepository.create(createPost({ id: '2', author_id: 'user-1' }));
      postRepository.create(createPost({ id: '3', author_id: 'user-2' }));
      postRepository.create(createPost({ id: '4', author_id: 'user-3' }));
    });

    it('filtra por author_id', async () => {
      const res = await request(app).get('/posts?author=user-1');
      
      expect(res.body.data).toHaveLength(2);
      res.body.data.forEach((post: { author_id: string }) => {
        expect(post.author_id).toBe('user-1');
      });
    });

    it('autor sin posts retorna lista vacía', async () => {
      const res = await request(app).get('/posts?author=user-999');
      
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('Ordenamiento', () => {
    beforeEach(() => {
      postRepository.create(createPost({ 
        id: '1', 
        title: 'Zebra',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-02-01')
      }));
      postRepository.create(createPost({ 
        id: '2', 
        title: 'Apple',
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-02-15')
      }));
      postRepository.create(createPost({ 
        id: '3', 
        title: 'Mango',
        created_at: new Date('2024-01-20'),
        updated_at: new Date('2024-02-10')
      }));
    });

    it('ordena por created_at descendente por defecto', async () => {
      const res = await request(app).get('/posts');
      
      expect(res.body.data[0].title).toBe('Mango');
      expect(res.body.data[1].title).toBe('Zebra');
      expect(res.body.data[2].title).toBe('Apple');
    });

    it('ordena por created_at ascendente', async () => {
      const res = await request(app).get('/posts?orderby=created_at&order=asc');
      
      expect(res.body.data[0].title).toBe('Apple');
      expect(res.body.data[1].title).toBe('Zebra');
      expect(res.body.data[2].title).toBe('Mango');
    });

    it('ordena por title ascendente', async () => {
      const res = await request(app).get('/posts?orderby=title&order=asc');
      
      expect(res.body.data[0].title).toBe('Apple');
      expect(res.body.data[1].title).toBe('Mango');
      expect(res.body.data[2].title).toBe('Zebra');
    });

    it('ordena por title descendente', async () => {
      const res = await request(app).get('/posts?orderby=title&order=desc');
      
      expect(res.body.data[0].title).toBe('Zebra');
      expect(res.body.data[1].title).toBe('Mango');
      expect(res.body.data[2].title).toBe('Apple');
    });

    it('ordena por updated_at descendente', async () => {
      const res = await request(app).get('/posts?orderby=updated_at&order=desc');
      
      expect(res.body.data[0].title).toBe('Apple');
      expect(res.body.data[1].title).toBe('Mango');
      expect(res.body.data[2].title).toBe('Zebra');
    });
  });

  describe('Combinación de filtros', () => {
    beforeEach(() => {
      postRepository.create(createPost({ 
        id: '1', 
        title: 'TypeScript Avanzado',
        status: 'publish',
        author_id: 'user-1',
        created_at: new Date('2024-01-10')
      }));
      postRepository.create(createPost({ 
        id: '2', 
        title: 'JavaScript Básico',
        status: 'publish',
        author_id: 'user-2',
        created_at: new Date('2024-01-15')
      }));
      postRepository.create(createPost({ 
        id: '3', 
        title: 'TypeScript Básico',
        status: 'draft',
        author_id: 'user-1',
        created_at: new Date('2024-01-20')
      }));
    });

    it('combina status y author', async () => {
      const res = await request(app).get('/posts?status=publish&author=user-1');
      
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('TypeScript Avanzado');
    });

    it('combina search y status', async () => {
      const res = await request(app).get('/posts?search=TypeScript&status=publish');
      
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('TypeScript Avanzado');
    });

    it('combina filtros con ordenamiento', async () => {
      const res = await request(app).get('/posts?author=user-1&orderby=created_at&order=asc');
      
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].title).toBe('TypeScript Avanzado');
      expect(res.body.data[1].title).toBe('TypeScript Básico');
    });

    it('combina filtros con paginación', async () => {
      for (let i = 4; i <= 15; i++) {
        postRepository.create(createPost({ 
          id: `${i}`, 
          status: 'publish',
          author_id: 'user-1'
        }));
      }

      const res = await request(app).get('/posts?status=publish&author=user-1&per_page=5&page=2');
      
      expect(res.body.data).toHaveLength(5);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.total).toBe(13);
    });
  });

  describe('Validación de parámetros inválidos', () => {
    it('retorna 422 para status inválido', async () => {
      const res = await request(app).get('/posts?status=invalid');
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('status');
    });

    it('retorna 422 para orderby inválido', async () => {
      const res = await request(app).get('/posts?orderby=invalid_field');
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('orderby');
    });

    it('retorna 422 para order inválido', async () => {
      const res = await request(app).get('/posts?order=random');
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('order');
    });

    it('retorna 422 para page no numérico', async () => {
      const res = await request(app).get('/posts?page=abc');
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('page');
    });

    it('retorna 422 para page negativo', async () => {
      const res = await request(app).get('/posts?page=-1');
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
    });

    it('retorna 422 para page cero', async () => {
      const res = await request(app).get('/posts?page=0');
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
    });

    it('retorna 422 para per_page no numérico', async () => {
      const res = await request(app).get('/posts?per_page=abc');
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('per_page');
    });

    it('retorna 422 para per_page negativo', async () => {
      const res = await request(app).get('/posts?per_page=-5');
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
    });

    it('errores usan formato estándar (solo campo error)', async () => {
      const res = await request(app).get('/posts?status=invalid');
      
      expect(res.status).toBe(422);
      expect(Object.keys(res.body)).toEqual(['error']);
      expect(typeof res.body.error).toBe('string');
    });
  });
});
