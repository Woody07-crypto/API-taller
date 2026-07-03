import request from 'supertest';
import app from '../src/app';

describe('GET /health', () => {
  it('responde con status ok y código 200', async () => {
    const res = await request(app).get('/health');
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('responde con Content-Type application/json', async () => {
    const res = await request(app).get('/health');
    
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('Ruta inexistente', () => {
  it('responde 404 con formato estándar de error', async () => {
    const res = await request(app).get('/ruta-que-no-existe');
    
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Recurso no encontrado');
  });

  it('responde 404 para cualquier método HTTP en ruta inexistente', async () => {
    const methods = ['post', 'put', 'delete', 'patch'] as const;
    
    for (const method of methods) {
      const res = await request(app)[method]('/ruta-inexistente');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    }
  });
});
