# Spec 4 · Update — PUT/PATCH /posts/{id}

## Contexto

Los usuarios del CMS necesitan modificar publicaciones existentes sin tener que crear un nuevo post desde cero.

Esta feature permite actualizar un post por su `id` usando los endpoints `PUT /posts/{id}` y `PATCH /posts/{id}`. La API debe permitir actualizaciones parciales y completas, respetando las reglas del recurso Post, el formato estándar de errores y el flujo de vida de los estados.

## Casos de uso / Criterios de aceptación

- Si existe un post con el `id` enviado y el usuario actualiza un campo válido, la API responde `200` y devuelve el post actualizado.
- Si existe un post con el `id` enviado y el usuario actualiza varios campos válidos, la API responde `200` y devuelve el post actualizado.
- Si no se envían todos los campos, los campos no enviados conservan su valor anterior.
- En cada actualización exitosa, `updated_at` cambia automáticamente.
- Si el post no existe, la API responde `404` y devuelve un error JSON estándar.
- Si se envía un `status` inválido, la API responde `422`.
- Si se intenta publicar sin `title` o sin `content`, la API responde `422`.
- Si el post pasa a `publish` por primera vez, se asigna `published_at`.
- Si el post ya tenía `published_at`, no se sobrescribe.
- Si el post pasa a `trash`, se asigna `deleted_at`.
- Si el post ya está en `trash`, no se puede actualizar directamente con `PUT` ni `PATCH`.
- Si se envían campos protegidos, la API responde `422`.
- Los errores mantienen el formato JSON estándar definido en Foundation.

## Alcance

Incluye:

- Actualizar un post por `id`.
- Permitir actualización parcial.
- Permitir actualización completa.
- Modificar campos permitidos.
- Validar campos protegidos.
- Validar status permitidos.
- Actualizar automáticamente `updated_at`.
- Asignar `published_at` al publicar por primera vez.
- Asignar `deleted_at` al mover a `trash`.
- Bloquear update directo en posts en `trash`.
- Agregar pruebas automatizadas de la feature.

Fuerae:

- Crear posts.
- Listar posts.
- Obtener un post individual.
- Eliminar posts permanentemente.
- Restaurar posts desde `trash`.
- Autenticación.
- Permisos por autor.
- Subida de imágenes.
- Comentarios.
- Historial de versiones.

## Restricciones

Campos actualizables:

- `title`
- `content`
- `excerpt`
- `slug`
- `status`
- `author_id`

Campos protegidos:

- `id`
- `created_at`
- `updated_at`
- `published_at`
- `deleted_at`

Estados válidos:

- `draft`
- `publish`
- `pending`
- `private`
- `trash`

Reglas de negocio:

- La actualización parcial está permitida.
- No es obligatorio enviar todos los campos.
- Los campos no enviados conservan su valor.
- Toda actualización exitosa actualiza `updated_at`.
- Solo se puede publicar si `title` y `content` no están vacíos.
- Al publicar por primera vez se asigna `published_at`.
- Al mover a `trash` se asigna `deleted_at`.
- Un post en `trash` no acepta update directo.
- Los errores usan el formato `{ "error": "mensaje" }`.

# Implementation Plan

## De de diseño

La feature se implementará reutilizando la estructura existente del proyecto: rutas, controlador, servicio, repositorio, modelo y middleware de errores.

La lógica de negocio se mantendrá en el servicio. El controlador se encargará de recibir la petición, llamar al servicio y devolver la respuesta HTTP.

## Tareas

### 1. Crear pruebas para update parcial

Agregar pruebas para actualizar un solo campo y verificar que los demás campos no cambien.

### 2. Implementar endpoint PATCH

Agregar ruta `PATCH /posts/:id`, método en controlador y lógica en servicio.

### 3. Crear pruebas para update completo

Agregar pruebas para actualizar varios campos permitidos.

### 4. Implementar endpoint PUT

Agregar ruta `PUT /posts/:id` reutilizando la misma lógica de actualización.

### 5. Crear pruebas de errores

Cubrir post inexistente, status inválido, campos protegidos y publicación inválida.

### 6. Implementar validaciones

Validar campos permitidos, status válidos y reglas para publicar.

uebas para transiciones de estado

Cubrir cambio a `publish`, asignación de `published_at`, cambio a `trash` y asignación de `deleted_at`.

### 8. Implementar transiciones de estado

Agregar lógica para manejar `published_at`, `deleted_at` y bloqueo de posts en `trash`.

### 9. Verificación final

Ejecutar todos los tests y confirmar que no se rompieron las features anteriores.
