import { Tag } from '../models/Tag.js';

export const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find({ owner: req.user._id }).sort({ name: 1 });
    res.json({ tags });
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    if (!req.body.name?.trim()) return res.status(400).json({ message: 'Tag name is required' });
    const tag = await Tag.create({ name: req.body.name.trim(), owner: req.user._id });
    res.status(201).json({ tag });
  } catch (error) {
    next(error);
  }
};
