import app from './app';
import logger from './utils/logger';

const port = Number(process.env.PORT) || 3001;

app.listen(port, process.env.HOST || "127.0.0.1", () => {
  logger?.info ? logger.info(`Server on port ${port}`) : console.log(`Server on port ${port}`);
});
