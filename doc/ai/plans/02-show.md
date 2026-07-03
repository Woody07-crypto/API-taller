# Spec 2 · Show — GET /posts/{id}

## Contexto

Los consumidores de la API necesitan consultar un post individual por su identificador. El endpoint `GET /posts/{id}` debe devolver el recurso completo cuando existe y está activo, o un error consistente cuando no es accesible.

## Dentro del alcance

Implementar el endpoint `GET /posts/{id}` con soporte para:

- Obtener un post por su `id`.
- Responder con el formato estándar de errores definido en Foundation.
- Tratar los posts en estado `trash` como no encontrados.

## Comportamiento

| Situación | Status | Respuesta |
|-----------|--------|-----------|
| Post existe y no está en `trash` | `200` | Objeto post en JSON |
| Post no existe | `404` | `{ "error": "Post no encontrado" }` |
| Post existe pero está en `trash` | `404` | `{ "error": "Post no encontrado" }` |

## Criterios de aceptación

- `GET /posts/{id}` responde con código `200` cuando el post existe y su `status` no es `trash`.
- La respuesta incluye los campos públicos del recurso Post:
  - `id`
  - `title`
  - `content`
  - `excerpt`
  - `slug`
  - `status`
  - `author_id`
  - `published_at`
  - `created_at`
  - `updated_at`
- Si el `id` no corresponde a ningún post, la API responde `404` con:

```json
{
  "error": "Post no encontrado"
}
```

- Si el post existe pero su `status` es `trash`, la API responde `404` con el mismo formato de error.
- La feature cuenta con pruebas automatizadas para:
  - caso feliz: retorno de un post activo;
  - caso de error: ID inexistente;
  - caso de error: post en estado `trash`.

## Decisión de equipo

Un post en estado `trash` **no es visible** en este endpoint y debe manejarse como no encontrado (`404`).

## Fuera de alcance

- Listado de posts (`GET /posts`).
- Crear publicaciones (`POST /posts`).
- Actualizar publicaciones.
- Eliminar publicaciones.
- Autenticación y autorización.
- Incluir posts relacionados, categorías o comentarios.

## Restricciones

- Solo se devuelven los campos públicos definidos para el recurso Post.
- Todos los errores deben utilizar el formato estándar definido en Foundation.
- La respuesta siempre debe ser JSON.
- El endpoint debe ser compatible con las features Index, Store, Update y Delete sin modificar su contrato.
