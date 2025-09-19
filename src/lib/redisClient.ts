import { createClient, RedisClientType } from 'redis';

let _client: RedisClientType | null = null;

export async function redisClient(): Promise<RedisClientType> {
  if (_client && _client.isOpen) return _client;
  _client = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
  _client.on('error', (err) => console.error('Redis error:', err));
  if (!_client.isOpen) await _client.connect();
  return _client;
}
