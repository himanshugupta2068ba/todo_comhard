import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import todoRoutes from './routes/todo.routes.js';
import tagRoutes from './routes/tag.routes.js';

const app = express();
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/tags', tagRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
