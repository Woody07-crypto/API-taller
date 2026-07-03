import request from 'supertest';
import app from '../src/app';

describe('POST /posts (Store)', () => {
  describe('happy path', () => {
    it('crea un post con title y content y responde 201 con id y status draft', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'Mi primer post', content: 'Contenido del post' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.id).toBeTruthy();
      expect(res.body.title).toBe('Mi primer post');
      expect(res.body.content).toBe('Contenido del post');
      expect(res.body.status).toBe('draft');
    });

    it('genera un slug simple a partir del título', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'Hola Mundo Cruel', content: 'x' });

      expect(res.status).toBe(201);
      expect(res.body.slug).toBe('hola-mundo-cruel');
    });

    it('sin status se crea con status draft por defecto', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'Sin status', content: 'x' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('draft');
    });

    it('respeta un status válido enviado explícitamente', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'Publicado', content: 'x', status: 'publish' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('publish');
    });
  });

  describe('validación (422 con formato estándar)', () => {
    it('falta title → 422 y reporta el campo title', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ content: 'Solo contenido' });

      expect(res.status).toBe(422);
      expect(res.body.error.status).toBe(422);
      expect(res.body.error.fields).toHaveProperty('title');
    });

    it('falta content → 422 y reporta el campo content', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'Solo título' });

      expect(res.status).toBe(422);
      expect(res.body.error.fields).toHaveProperty('content');
    });

    it('faltan ambos → 422 reportando title y content', async () => {
      const res = await request(app).post('/posts').send({});

      expect(res.status).toBe(422);
      expect(res.body.error.fields).toHaveProperty('title');
      expect(res.body.error.fields).toHaveProperty('content');
    });

    it('status inválido → 422 y reporta el campo status', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'x', content: 'y', status: 'foo' });

      expect(res.status).toBe(422);
      expect(res.body.error.fields).toHaveProperty('status');
    });
  });

  describe('formato de error consistente con el resto de la API', () => {
    it('el body de un 422 tiene el mismo shape que el 404 (error.message + error.status)', async () => {
      const notFound = await request(app).get('/ruta-inexistente');
      const unprocessable = await request(app).post('/posts').send({});

      // Mismo contenedor y mismas llaves base en ambos errores.
      expect(notFound.body).toHaveProperty('error.message');
      expect(notFound.body).toHaveProperty('error.status');
      expect(unprocessable.body).toHaveProperty('error.message');
      expect(unprocessable.body).toHaveProperty('error.status');
      expect(typeof unprocessable.body.error.message).toBe('string');
    });
  });
});
