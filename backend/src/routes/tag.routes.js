import { Router } from 'express';
import { createTag, getTags } from '../controllers/tag.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', getTags);
router.post('/', createTag);
export default router;
