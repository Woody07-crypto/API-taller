# Spec 1 · Index — GET /posts

## Contexto

Los consumidores de la API necesitan consultar las publicaciones almacenadas en el CMS. El endpoint `GET /posts` debe permitir listar los posts existentes, aplicar filtros y ordenar los resultados para facilitar la búsqueda y navegación del contenido.

## Dentro del alcance

Implementar el endpoint `GET /posts` con soporte para:

- Paginación.
- Búsqueda por texto.
- Filtrado por estado.
- Filtrado por autor.
- Ordenamiento de resultados.
- Respuesta paginada en formato JSON.

## Parámetros soportados

| Parámetro | Descripción | Valor por defecto |
|-----------|-------------|--------------------|
| `page` | Número de página | `1` |
| `per_page` | Cantidad de registros por página | `10` |
| `search` | Busca coincidencias en `title` y `content` | — |
| `status` | Filtra por estado del post | Todos |
| `author` | Filtra por autor | Todos |
| `orderby` | Campo de orden (`created_at`, `title`, `updated_at`) | `created_at` |
| `order` | Dirección (`asc` o `desc`) | `desc` |

## Criterios de aceptación

- `GET /posts` responde con código 200.
- La respuesta contiene una lista de publicaciones en formato JSON.
- Si no se envían parámetros, se utiliza la paginación por defecto (`page=1`, `per_page=10`).
- El parámetro `search` filtra los posts cuyo `title` o `content` contienen el texto indicado.
- El parámetro `status` únicamente acepta los estados válidos (`draft`, `pending`, `publish`, `private`, `trash`).
- El parámetro `author` devuelve únicamente los posts pertenecientes al autor indicado.
- `orderby` permite ordenar por `created_at`, `updated_at` o `title`.
- `order` únicamente acepta `asc` o `desc`.
- Si un parámetro tiene un valor inválido, la API responde con 422 utilizando el formato estándar de errores definido en Foundation.
- La respuesta incluye información de paginación:

```json
{
  "data": [
    { ... }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 35,
    "total_pages": 4
  }
}
```

- La feature cuenta con pruebas automatizadas para:
  - listado de posts;
  - filtros;
  - ordenamiento;
  - paginación;
  - validación de parámetros inválidos.

## Fuera de alcance

- Crear publicaciones (`POST /posts`).
- Obtener un post específico (`GET /posts/{id}`).
- Actualizar publicaciones.
- Eliminar publicaciones.
- Autenticación y autorización.
- Búsqueda avanzada (por múltiples campos o relevancia).
- Caché y optimización de consultas.

## Restricciones

- Solo se devuelven los campos públicos definidos para el recurso Post.
- Todos los errores deben utilizar el formato estándar definido en Foundation.
- La respuesta siempre debe ser JSON.
- La paginación debe aplicarse antes de devolver la respuesta.
- El endpoint debe ser compatible con las siguientes features (Show, Store, Update y Delete) sin modificar su contrato.
