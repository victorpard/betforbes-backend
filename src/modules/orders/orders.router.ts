// src/modules/orders/orders.router.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const router = Router();

/** ===== Schemas ===== */
const orderSchema = z.object({
  symbol: z.string().min(1),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['MARKET', 'LIMIT']).default('MARKET'),
  quantity: z.number().positive(),
  leverage: z.number().int().min(1).max(125).optional(),
  price: z.number().positive().optional(),
  clientOrderId: z.string().optional(),
});

/** ===== Helpers ===== */
function isDry(req: Request): boolean {
  return (req.header('X-Dry-Run') ?? '1') === '1';
}

function readIdempotencyKey(req: Request): string {
  let idem =
    req.header('Idempotency-Key') ||
    req.header('X-Idempotency-Key') ||
    '';

  // remove aspas simples nas pontas, se vier "'<uuid>'"
  idem = idem.trim().replace(/^'+|'+$/g, '');
  if (!idem) idem = randomUUID();
  return idem;
}

/** ===== Idempotency store (in-memory) =====
 *  - TTL default: 5 minutos
 *  - Em duplicata: retorna replay (200) com X-Idempotency-Status: REPLAY
 */
type Stored = { createdAt: number; payload: any };
const IDEM_TTL_MS = 5 * 60 * 1000;
const idemStore = new Map<string, Stored>();

function getCached(idem: string): Stored | undefined {
  const hit = idemStore.get(idem);
  if (!hit) return;
  if (Date.now() - hit.createdAt > IDEM_TTL_MS) {
    idemStore.delete(idem);
    return;
  }
  return hit;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of idemStore.entries()) {
    if (now - v.createdAt > IDEM_TTL_MS) idemStore.delete(k);
  }
}, 60_000).unref();

/** ===== CORS preflight opcional nestas rotas ===== */
router.options(['/preview', '/'], (_req, res) => res.sendStatus(204));

/** ===== Preview ===== */
router.post('/preview', (req: Request, res: Response) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: 'Payload inválido',
      issues: parsed.error.issues,
    });
  }

  const body = parsed.data;
  const fee = Number((body.quantity * 0.001).toFixed(8)); // mock de fee
  const response = {
    success: true,
    dryRun: true,
    message: 'Preview OK',
    data: {
      symbol: body.symbol,
      side: body.side,
      type: body.type,
      quantity: body.quantity,
      leverage: body.leverage ?? null,
      estimatedFee: fee,
      estimatedPnl: 0,
    },
  };

  return res.status(200).json(response);
});

/** ===== Create ===== */
router.post('/', async (req: Request, res: Response) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: 'Payload inválido',
      issues: parsed.error.issues,
    });
  }

  const dry = isDry(req);
  const idem = readIdempotencyKey(req);

  // Replay se já existir
  const cached = getCached(idem);
  if (cached) {
    return res
      .status(200)
      .set('Idempotency-Key', idem)
      .set('X-Idempotency-Status', 'REPLAY')
      .json(cached.payload);
  }

  const body = parsed.data;

  // Simula pequeno processamento
  await new Promise((r) => setTimeout(r, 1));

  const payload = {
    success: true,
    dryRun: dry,
    message: dry ? 'Create simulated (dry-run)' : 'Order accepted',
    data: {
      orderId: randomUUID(),
      status: dry ? 'SIMULATED' : 'CREATED',
      symbol: body.symbol,
      side: body.side,
      type: body.type,
      quantity: body.quantity,
      leverage: body.leverage ?? null,
      clientOrderId: body.clientOrderId ?? randomUUID(),
    },
  };

  // Guarda para idempotência (replay futuro)
  idemStore.set(idem, { createdAt: Date.now(), payload });

  return res
    .status(dry ? 200 : 201)
    .set('Idempotency-Key', idem)
    .set('X-Idempotency-Status', 'NEW')
    .json(payload);
});

export default router;
