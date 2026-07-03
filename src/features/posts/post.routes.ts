import { Router } from 'express';
import { postController } from './post.controller';

const router = Router();

router.get('/', (req, res, next) => postController.index(req, res, next));
router.put('/:id', (req, res, next) => postController.update(req, res, next));
router.patch('/:id', (req, res, next) => postController.update(req, res, next));

// Las rutas pendientes:
// GET    /posts/:id   - Spec 2: Show
// POST   /posts       - Spec 3: Store
// DELETE /posts/:id   - Spec 5: Delete

export default router;
