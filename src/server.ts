import http from 'http';
import app from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`[server] Listening on http://${HOST}:${PORT} (pid ${process.pid})`);
});

process.on('unhandledRejection', (err: any) => {
  console.error('[server] UnhandledRejection:', err);
});
process.on('uncaughtException', (err: any) => {
  console.error('[server] UncaughtException:', err);
});

const shutdown = (sig: string) => () => {
  console.log(`[server] ${sig} received, shutting down...`);
  server.close(() => {
    console.log('[server] HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', shutdown('SIGINT'));
process.on('SIGTERM', shutdown('SIGTERM'));

export default server;
