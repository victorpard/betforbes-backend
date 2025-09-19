import app from './app';
import logger from './utils/logger';

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  logger?.info ? logger.info(`Server on port ${port}`) : console.log(`Server on port ${port}`);
});
