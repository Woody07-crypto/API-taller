import { Router } from 'express';
import { postController } from './post.controller';

const router = Router();

router.get('/', (req, res, next) => postController.index(req, res, next));

// Las rutas pendientes:
// GET    /posts/:id   - Spec 2: Show
// POST   /posts       - Spec 3: Store
// PUT    /posts/:id   - Spec 4: Update
// DELETE /posts/:id   - Spec 5: Delete

export default router;
