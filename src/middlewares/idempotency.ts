import type { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import crypto from 'crypto';
import stringify from 'fast-json-stable-stringify';

// Evita o erro de overload do ioredis: se não houver REDIS_URL, usa localhost.
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis();

const IDEM_TTL_SECONDS = 60 * 60; // 1h
const LOCK_TTL_MS = 5000;         // lock curto (5s)

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

function pickHeaders(res: Response) {
  const h = res.getHeaders();
  const keep = ['content-type', 'cache-control'];
  const out: Record<string, string> = {};
  for (const k of keep) {
    const v = h[k];
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

export async function idemMiddleware(req: Request, res: Response, next: NextFunction) {
  // Aplica só em POST de /api/orders*
  if (req.method !== 'POST' || !req.path.startsWith('/api/orders')) return next();

  const idemKey = req.get('Idempotency-Key');
  if (!idemKey) return next();

  res.set('Idempotency-Key', idemKey);

  const base = `${req.method}:${req.path}:${idemKey}`;
  const reqHash = sha256(stringify(req.body ?? {}));

  const resultKey = `idem:result:${base}`;
  const lockKey = `idem:lock:${base}`;

  // 1) Já existe resultado salvo? -> replay
  const cached = await redis.get(resultKey);
  if (cached) {
    try {
      const existing = JSON.parse(cached);

      // Mesmo key mas corpo diferente -> 409 conflict
      if (existing.reqHash && existing.reqHash !== reqHash) {
        res.set('Idempotency-Status', 'conflict');
        return res
          .status(409)
          .json({ error: 'IDEMPOTENCY_CONFLICT', message: 'Mesmo Idempotency-Key com corpo diferente.' });
      }

      res.set('Idempotency-Status', 'replayed');
      if (existing.headers && typeof existing.headers === 'object') {
        for (const [k, v] of Object.entries(existing.headers)) res.set(k, String(v));
      }
      res.status(existing.status ?? 200);
      return existing.body !== undefined ? res.send(existing.body) : res.end();
    } catch {
      // Se corrompido, segue fluxo normal
    }
  }

  // 2) Tenta adquirir lock (primeiro request vence)
  const ok = await redis.call('SET', lockKey, Date.now().toString(), 'PX', String(LOCK_TTL_MS), 'NX');
  if (ok !== 'OK') {
    // Pequena janela para pegar replay imediato
    const deadline = Date.now() + 300;
    while (Date.now() < deadline) {
      const again = await redis.get(resultKey);
      if (again) {
        const existing = JSON.parse(again);
        res.set('Idempotency-Status', 'replayed');
        if (existing.headers && typeof existing.headers === 'object') {
          for (const [k, v] of Object.entries(existing.headers)) res.set(k, String(v));
        }
        res.status(existing.status ?? 200);
        return existing.body !== undefined ? res.send(existing.body) : res.end();
      }
      await new Promise(r => setTimeout(r, 50));
    }
    res.set('Idempotency-Status', 'processing');
    res.set('Retry-After', '1');
    return res
      .status(409)
      .json({ error: 'IDEMPOTENCY_PROCESSING', message: 'Requisição com a mesma Idempotency-Key ainda está sendo processada.' });
  }

  // 3) Primeiro request: intercepta a resposta, salva no Redis e SÓ ENTÃO envia
  const finalizeAndSend = async (body: any, sender: (b: any) => any) => {
    try {
      const payload = {
        status: res.statusCode,
        headers: pickHeaders(res),
        body,
        reqHash,
      };
      await redis.setex(resultKey, IDEM_TTL_SECONDS, JSON.stringify(payload));
    } catch {}
    try {
      await redis.del(lockKey);
    } catch {}
    res.set('Idempotency-Status', 'created'); // este request gerou o cache
    return sender(body);
  };

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  (res as any).json = (body: any) => finalizeAndSend(body, originalJson);
  (res as any).send = (body: any) => finalizeAndSend(body, originalSend);

  return next();
}

// Também exporta como default para compatibilidade, caso algum arquivo importe default.
export default idemMiddleware;
