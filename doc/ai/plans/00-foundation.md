# Spec 0 · Foundation

Esta especificación establece la base técnica sobre la que se implementarán las demás funcionalidades del CRUD de Posts.

---

## Feature: Modelo Post

### Contexto

Se necesita definir el modelo `Post` para una API CRUD de un CMS. Este modelo servirá como base para todas las operaciones del sistema y deberá soportar el flujo de publicación mediante estados.

### Criterios de aceptación

- Existe un modelo `Post` con los campos:
  - `id`
  - `title`
  - `content`
  - `excerpt`
  - `slug`
  - `status`
  - `author_id`
  - `published_at`
  - `deleted_at`
  - `created_at`
  - `updated_at`
- `status` solo acepta los valores:
  - `draft`
  - `pending`
  - `publish`
  - `private`
  - `trash`
- Un post solo puede cambiar al estado `publish` cuando `title` y `content` no están vacíos.
- La primera vez que un post pasa a `publish`, se asigna `published_at`.
- Al mover un post a `trash`, se asigna `deleted_at`.
- Al restaurarlo, `deleted_at` vuelve a `null`.
- Un post en estado `trash` no puede actualizarse hasta ser restaurado.
- `slug` debe ser único.

### Fuera de alcance

- Endpoints del CRUD.
- Categorías y etiquetas.
- Comentarios.
- Subida de imágenes.
- Autenticación y autorización.

---

## Feature: Formato estándar de errores

### Contexto

Los consumidores de la API necesitan respuestas de error uniformes para poder manejar fallos de manera consistente sin implementar lógica distinta para cada endpoint.

### Formato

```json
{
  "error": "mensaje descriptivo"
}
```

El código HTTP debe enviarse en el status de la respuesta (404, 422, 500, etc.), no dentro del cuerpo.

### Criterios de aceptación

- Todos los errores responden utilizando el mismo formato JSON.
- El campo `error` contiene un mensaje legible para el cliente.
- No se exponen detalles internos de la aplicación (stack traces, consultas SQL o errores de base de datos).

### Ejemplos

**404**

```json
{
  "error": "Post no encontrado"
}
```

**422**

```json
{
  "error": "El título es obligatorio"
}
```

**500**

```json
{
  "error": "Error interno del servidor"
}
```

### Fuera de alcance

- Internacionalización de mensajes.
- Códigos de error (`code`, `errors[]`, etc.).
- Logging y trazabilidad.

---

## Feature: Setup del framework

### Contexto

Antes de implementar cualquier endpoint, el proyecto necesita una estructura base que permita desarrollar nuevas funcionalidades sin modificar la configuración principal.

### Restricciones

- Stack: Node.js + Express + TypeScript.
- Tests con Jest y Supertest.
- Middleware centralizado para manejo de errores.
- Arquitectura basada en features.

### Estructura mínima

```
src/
│
├── app.ts
├── server.ts
├── routes/
│   └── index.ts
├── middlewares/
│   ├── notFound.ts
│   └── errorHandler.ts
└── features/
    └── posts/
        ├── routes.ts
        ├── controller.ts
        └── service.ts
```

### Criterios de aceptación

- El proyecto inicia correctamente mediante `npm run dev`.
- Existe el endpoint `GET /health`.
- `GET /health` responde:

```json
{
  "status": "ok"
}
```

con código 200.

- Una ruta inexistente responde 404 utilizando el formato estándar de errores.
- Los errores lanzados por cualquier handler son capturados por el middleware central.
- Existe al menos una prueba automatizada que valida el endpoint `/health`.
- `npm test` ejecuta correctamente las pruebas iniciales.
- La estructura permite agregar las features Index, Show, Store, Update y Delete sin modificar `app.ts`.

### Fuera de alcance

- Implementación del CRUD.
- Migraciones.
- Persistencia de datos.
- Autenticación.
- Paginación.
- Upload de imágenes.
