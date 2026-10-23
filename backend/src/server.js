import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

try {
  await connectDatabase();
  app.listen(env.port, () => console.log(`API listening on port ${env.port}`));
} catch (error) {
  console.error('Unable to start server', error);
  process.exit(1);
}
