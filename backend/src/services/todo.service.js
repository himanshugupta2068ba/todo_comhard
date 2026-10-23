import { Todo } from '../models/Todo.js';
import { Tag } from '../models/Tag.js';
import mongoose from 'mongoose';

const validateTags = async (user, tags) => {
  if (tags === undefined) return undefined;
  if (!Array.isArray(tags)) {
    const error = new Error('Tags must be an array');
    error.statusCode = 400;
    throw error;
  }
  const tagIds = [...new Set(tags.map(String))];
  if (tagIds.some((tagId) => !mongoose.isValidObjectId(tagId))) {
    const error = new Error('One or more tags are invalid');
    error.statusCode = 400;
    throw error;
  }
  const ownedTags = await Tag.countDocuments({ _id: { $in: tagIds }, owner: user._id });
  if (ownedTags !== tagIds.length) {
    const error = new Error('One or more tags are invalid');
    error.statusCode = 400;
    throw error;
  }
  return tagIds;
};

const ensureStatusHistory = async (todos) => {
  const updates = todos
    .filter((todo) => !todo.statusHistory?.length)
    .map((todo) => ({
      updateOne: {
        filter: { _id: todo._id },
        update: {
          $set: {
            statusHistory: [
              { status: 'pending', enteredAt: todo.createdAt },
              ...(todo.status !== 'pending' ? [{ status: todo.status, enteredAt: todo.updatedAt }] : [])
            ]
          }
        }
      }
    }));

  if (updates.length) await Todo.bulkWrite(updates);
  return todos.map((todo) => {
    if (!todo.statusHistory?.length) {
      todo.statusHistory = [
        { status: 'pending', enteredAt: todo.createdAt },
        ...(todo.status !== 'pending' ? [{ status: todo.status, enteredAt: todo.updatedAt }] : [])
      ];
    }
    return todo;
  });
};

export const listTodos = async (user) => {
  const todos = await Todo.find({ createdBy: user._id, deletedAt: null })
    .populate('tags', 'name')
    .sort({ createdAt: -1 });
  return ensureStatusHistory(todos);
};

export const createTodo = async (user, data) => {
  if (data.dueDate && new Date(data.dueDate) < new Date()) {
    const error = new Error('SLA due date and time cannot be in the past');
    error.statusCode = 400;
    throw error;
  }
  const tags = await validateTags(user, data.tags);
  return Todo.create({
    ...data,
    ...(tags ? { tags } : {}),
    createdBy: user._id,
    deletedAt: null,
    statusHistory: [{ status: data.status || 'pending', enteredAt: new Date() }]
  });
};

export const listTrash = async (user) => {
  return Todo.find({ createdBy: user._id, deletedAt: { $ne: null } }).populate('tags', 'name').sort({ deletedAt: -1 });
};

export const updateTodo = async (user, todoId, data) => {
  const todo = await Todo.findById(todoId);
  if (!todo || todo.deletedAt || todo.createdBy.toString() !== user._id.toString()) {
    const error = new Error('Todo not found');
    error.statusCode = 404;
    throw error;
  }
  if (!todo.statusHistory?.length) {
    todo.statusHistory = [{ status: todo.status, enteredAt: todo.createdAt }];
  }
  const tags = await validateTags(user, data.tags);
  if (data.status && data.status !== todo.status) {
    todo.statusHistory.push({ status: data.status, enteredAt: new Date() });
  }
  if (data.dueDate && new Date(data.dueDate) < new Date()) {
    const error = new Error('SLA due date and time cannot be in the past');
    error.statusCode = 400;
    throw error;
  }
  Object.assign(todo, { ...data, ...(tags ? { tags } : {}) });
  await todo.save();
  return todo;
};

export const deleteTodo = async (user, todoId) => {
  const todo = await Todo.findOne({
    _id: todoId,
    deletedAt: null,
    createdBy: user._id
  });
  if (!todo) {
    const error = new Error('Todo not found');
    error.statusCode = 404;
    throw error;
  }
  todo.deletedAt = new Date();
  todo.deletedBy = user._id;
  await todo.save();
};
