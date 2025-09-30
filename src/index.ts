// src/index.ts
import opsRouter from './routes/ops.route';
import app from './app';
import logger from './utils/logger';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '127.0.0.1';

app.listen(port, host, () => {
  const msg = `Server on http://${host}:${port}`;
  logger?.info ? logger.info(msg) : console.log(msg);
});
