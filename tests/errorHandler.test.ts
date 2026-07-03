import express from 'express';
import request from 'supertest';
import { AppError, errorHandler } from '../src/middlewares/errorHandler';

/**
 * Monta una app mínima con una ruta que lanza el error recibido,
 * seguida del middleware central. Sirve para probar el handler en aislamiento.
 */
function appThatThrows(err: unknown) {
  const app = express();
  app.get('/boom', (_req, _res, next) => next(err));
  app.use(errorHandler);
  return app;
}

describe('errorHandler (middleware central)', () => {
  it('un error genérico cae en el handler y responde 500 con el shape estándar', async () => {
    const res = await request(appThatThrows(new Error('kaboom'))).get('/boom');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error.message).toBe('string');
    expect(res.body.error.status).toBe(500);
  });

  it('un AppError respeta su statusCode y mensaje', async () => {
    const res = await request(appThatThrows(new AppError(404, 'Recurso no encontrado'))).get('/boom');

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Recurso no encontrado');
    expect(res.body.error.status).toBe(404);
  });

  it('un AppError con fields expone los campos que fallaron', async () => {
    const err = new AppError(422, 'Datos inválidos', { title: 'title es obligatorio' });
    const res = await request(appThatThrows(err)).get('/boom');

    expect(res.status).toBe(422);
    expect(res.body.error.status).toBe(422);
    expect(res.body.error.fields).toEqual({ title: 'title es obligatorio' });
  });
});
