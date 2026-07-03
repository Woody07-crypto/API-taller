import { Router } from 'express';
import postRoutes from '../features/posts/post.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/posts', postRoutes);

export default router;
