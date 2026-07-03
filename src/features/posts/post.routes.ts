import { Router } from 'express';
import { postController } from './post.controller';

const router = Router();

// POST /posts - Spec 3: Store (crear un post)
router.post('/', (req, res, next) => postController.store(req, res, next));

// Rutas restantes del CRUD (otras slices):
// GET    /posts       - Spec 1: Index
// GET    /posts/:id   - Spec 2: Show
// PUT    /posts/:id   - Spec 4: Update
// DELETE /posts/:id   - Spec 5: Delete

export default router;
