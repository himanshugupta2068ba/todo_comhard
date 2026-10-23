import { Router } from 'express';
import { getTodos, patchTodo, postTodo, removeTodo } from '../controllers/todo.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { getTrash } from '../controllers/todo.controller.js';
import { taskAttachment } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth);
router.get('/', getTodos);
router.get('/trash', getTrash);
router.post('/', taskAttachment, postTodo);
router.patch('/:id', patchTodo);
router.delete('/:id', removeTodo);
export default router;
