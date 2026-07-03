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
