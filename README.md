# API Taller

API CRUD para CMS de Posts con Node.js, Express y TypeScript.

## Instalación

```bash
npm install
```

## Scripts

```bash
npm run dev   # Inicia en modo desarrollo con hot-reload
npm run build # Compila TypeScript a JavaScript
npm start     # Ejecuta la versión compilada
npm test      # Ejecuta las pruebas
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /posts | Listar posts con paginación, filtros y ordenamiento |

### GET /posts

**Parámetros de query:**

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| page | Número de página | 1 |
| per_page | Registros por página | 10 |
| search | Busca en title y content | — |
| status | Filtra por estado (draft, pending, publish, private, trash) | Todos |
| author | Filtra por author_id | Todos |
| orderby | Campo de orden (created_at, updated_at, title) | created_at |
| order | Dirección (asc, desc) | desc |

**Respuesta:**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 35,
    "total_pages": 4
  }
}
```

## Estructura

```
src/
├── app.ts              # Configuración Express
├── server.ts           # Punto de entrada
├── routes/             # Rutas principales
├── middlewares/        # Middlewares globales
└── features/
    └── posts/          # Feature de posts
```
