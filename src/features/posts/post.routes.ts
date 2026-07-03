import { Router } from 'express';
import { postController } from './post.controller';

const router = Router();

router.get('/', (req, res, next) => postController.index(req, res, next));
router.get('/:id', (req, res, next) => postController.show(req, res, next));

// Las rutas pendientes:
// POST   /posts       - Spec 3: Store
// PUT    /posts/:id   - Spec 4: Update
// DELETE /posts/:id   - Spec 5: Delete

export default router;
