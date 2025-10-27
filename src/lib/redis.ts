import Redis from 'ioredis';

let client: Redis | null = null;

export function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (client) return client;
  client = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableAutoPipelining: true,
    lazyConnect: false,
  });
  client.on('error', () => {/* silencioso */});
  return client;
}
