import { createTodo, deleteTodo, listTodos, listTrash, updateTodo } from '../services/todo.service.js';

export const getTodos = async (req, res, next) => {
  try { res.json({ todos: await listTodos(req.user) }); } catch (error) { next(error); }
};

export const getTrash = async (req, res, next) => {
  try { res.json({ todos: await listTrash(req.user) }); } catch (error) { next(error); }
};

export const postTodo = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.attachment = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      };
    }
    res.status(201).json({ todo: await createTodo(req.user, data) });
  } catch (error) { next(error); }
};

export const patchTodo = async (req, res, next) => {
  try { res.json({ todo: await updateTodo(req.user, req.params.id, req.body) }); } catch (error) { next(error); }
};

export const removeTodo = async (req, res, next) => {
  try { await deleteTodo(req.user, req.params.id); res.status(204).send(); } catch (error) { next(error); }
};
