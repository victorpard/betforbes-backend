import type { Request, Response, NextFunction } from 'express';
import { getRedis } from '../lib/redis';

type MicrocacheOptions<TReq extends Request = Request> = {
  ttlMs: number;
  key: (req: TReq) => string;
};

type Entry = {
  payload: string;
  statusCode: number;
  headers: Record<string, string>;
  expiresAt: number; // só usado no fallback em memória
};

const memory = new Map<string, Entry>();

export function microcache<TReq extends Request = Request>(opts: MicrocacheOptions<TReq>) {
  const ttlMs = Math.max(0, opts.ttlMs | 0);
  const redis = getRedis();

  return async (req: TReq, res: Response, next: NextFunction) => {
    const key = opts.key(req);
    const now = Date.now();

    // 1) Tenta Redis
    if (redis) {
      try {
        const raw = await redis.get(key);
        if (raw) {
          const e = JSON.parse(raw) as Entry;
          res.set('X-Microcache', 'HIT');
          Object.entries(e.headers || {}).forEach(([k, v]) => v && res.set(k, v));
          res.status(e.statusCode);
          return res.send(e.payload);
        }
      } catch {
        /* ignora e cai no fallback */
      }
    } else {
      // 2) Fallback memória
      const e = memory.get(key);
      if (e && e.expiresAt > now) {
        res.set('X-Microcache', 'HIT');
        Object.entries(e.headers || {}).forEach(([k, v]) => v && res.set(k, v));
        res.status(e.statusCode);
        return res.send(e.payload);
      }
      if (memory.size > 1000) {
        const k = memory.keys().next().value as string | undefined;
        if (k) memory.delete(k);
      }
    }

    // MISS → intercepta send/json para persistir
    res.set('X-Microcache', 'MISS');

    const capture = (body: any) => {
      let payload: string;
      if (Buffer.isBuffer(body)) payload = body.toString('utf8');
      else if (typeof body === 'string') payload = body;
      else payload = JSON.stringify(body ?? '');

      const entry: Entry = {
        payload,
        statusCode: res.statusCode,
        headers: {
          'Content-Type': res.get('Content-Type') || 'application/json; charset=utf-8',
        },
        expiresAt: now + ttlMs,
      };

      if (redis) {
        const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
        redis.setex(key, ttlSec, JSON.stringify(entry)).catch(() => {});
      } else {
        memory.set(key, entry);
      }
    };

    const origSend = res.send.bind(res);
    res.send = (body?: any): Response => {
      try { capture(body); } catch {}
      return origSend(body);
    };

    const origJson = res.json.bind(res);
    res.json = (body?: any): Response => {
      try { capture(body); } catch {}
      return origJson(body);
    };

    return next();
  };
}
