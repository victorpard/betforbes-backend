// src/routes/ops.metrics.route.ts
import { Router, Request, Response } from 'express';
import { opsAuth } from '../middleware/opsAuth';
import { prisma } from '../lib/prisma';

const router = Router();

/** Converte "30d" | "24h" | "90m" para [start, end) em Date */
function parseRange(range: string) {
  const m = String(range || '30d').match(/^(\d+)([dhm])$/i);
  const now = new Date();
  const end = now;
  const start = new Date(now);
  if (!m) {
    start.setDate(start.getDate() - 30);
    return { start, end };
  }
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === 'd') start.setDate(start.getDate() - n);
  else if (unit === 'h') start.setHours(start.getHours() - n);
  else if (unit === 'm') start.setMinutes(start.getMinutes() - n);
  else start.setDate(start.getDate() - 30);
  return { start, end };
}

/** Number seguro p/ BigInt/Decimal/null */
function toNum(v: unknown): number {
  if (v == null) return 0;
  try {
    // Prisma pode trazer Decimal (com .toNumber), BigInt, string numérica, etc.
    // @ts-ignore
    if (typeof v?.toNumber === 'function') return Number(v.toNumber());
    if (typeof v === 'bigint') return Number(v);
    return Number(v as any);
  } catch {
    return 0;
  }
}

/** ISO-like local no fuso (YYYY-MM-DDTHH:mm:ss) */
function localIso(ts: Date, tz: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
    .format(ts)
    .replace(' ', 'T');
}

/** --------- /metrics/summary ---------
 * Retorna:
 *  - counts, conversion
 *  - finance (available, users_total, referrals_total, orders, volume_usdt, house_profit_* , withdraw_*, affiliate_commission_due_usdt)
 *  - ts (UTC ISO) e ts_local (no fuso solicitado)
 */
router.get('/metrics/summary', opsAuth, async (req: Request, res: Response) => {
  const range = String(req.query.range || '30d');
  const tz = String(req.query.tz || 'America/Sao_Paulo');
  const originFilter =
    req.query.origin ? String(req.query.origin).toLowerCase() : null;

  const { start, end } = parseRange(range);

  try {
    // ---- Funnel: contagens por kind
    const rows =
      (await prisma.$queryRawUnsafe<any[]>(
        `
      SELECT kind, COUNT(*)::int AS qty
      FROM "FunnelEvent"
      WHERE "createdAt" >= $1
        AND "createdAt" <  $2
        AND ($3::text IS NULL OR origin = $3::text)
        AND kind IN ('signup_created','email_verified','ref_linked')
      GROUP BY kind
      `,
        start,
        end,
        originFilter
      )) || [];

    const counts = {
      signup_created: 0,
      email_verified: 0,
      ref_linked: 0,
    } as Record<'signup_created' | 'email_verified' | 'ref_linked', number>;

    for (const r of rows) {
      if (r.kind in counts) counts[r.kind as keyof typeof counts] = Number(r.qty) || 0;
    }

    const conv = (a: number, b: number) => (a > 0 ? b / a : 0);
    const conversion = {
      signup_to_verified: conv(counts.signup_created, counts.email_verified),
      verified_to_linked: conv(counts.email_verified, counts.ref_linked),
      signup_to_linked: conv(counts.signup_created, counts.ref_linked),
    };

    // ---- Finance (best effort): se falhar, apenas "available: false"
    let finance: any = { available: false };
    try {
      // parâmetros "house" (ajuste se desejar em env)
      const ORDER_FEE_RATE = 0.02; // 2% do amount (exemplo)
      const POS_PNL_RATE = 0.05;   // 5% de PnL positivo (exemplo)
      const AFFILIATE_RATE = 0.05; // 5% de comissão sobre house_profit_total

      const [fin] =
        (await prisma.$queryRaw<any[]>`
        with orders as (
          select
            count(*) as orders,
            coalesce(sum(o.amount),0)::numeric as volume_usdt,
            coalesce(sum(${ORDER_FEE_RATE}*o.amount + ${POS_PNL_RATE}*greatest(o.realized_pnl_usdt,0)),0)::numeric as house_profit_orders_usdt
          from public.orders o
          where o."createdAt" >= ${start} and o."createdAt" <= ${end}
        ),
        withdraws as (
          select
            coalesce(sum(w.amount_usdt),0)::numeric    as withdraw_amount_total_usdt,
            coalesce(sum(w.fee_house_usdt),0)::numeric as withdraw_fee_house_usdt
          from public.withdrawals w
          where w."createdAt" >= ${start} and w."createdAt" <= ${end}
        )
        select
          (select count(*) from public.users) as users_total,
          (select count(*) from public.users where "referredById" is not null) as referrals_total,
          o.orders,
          o.volume_usdt,
          o.house_profit_orders_usdt,
          w.withdraw_amount_total_usdt,
          w.withdraw_fee_house_usdt,
          (o.house_profit_orders_usdt + w.withdraw_fee_house_usdt) as house_profit_total_usdt,
          (${AFFILIATE_RATE} * greatest(o.house_profit_orders_usdt + w.withdraw_fee_house_usdt, 0)) as affiliate_commission_due_usdt
        from orders o, withdraws w
      `) || [];

      if (fin) {
        finance = {
          available: true,
          users_total: toNum(fin.users_total),
          referrals_total: toNum(fin.referrals_total),
          orders: toNum(fin.orders),
          volume_usdt: toNum(fin.volume_usdt),
          house_profit_orders_usdt: toNum(fin.house_profit_orders_usdt),
          withdraw_amount_total_usdt: toNum(fin.withdraw_amount_total_usdt),
          withdraw_fee_house_usdt: toNum(fin.withdraw_fee_house_usdt),
          house_profit_total_usdt: toNum(fin.house_profit_total_usdt),
          affiliate_commission_due_usdt: toNum(fin.affiliate_commission_due_usdt),
        };
      }
    } catch {
      finance = { available: false };
    }

    const ts = new Date();
    return res.status(200).json({
      status: 'ok',
      range,
      origin: originFilter,
      counts,
      conversion,
      finance,
      ts: ts.toISOString(),
      ts_local: localIso(ts, tz),
    });
  } catch (e: any) {
    // Nunca 500 duro por causa de BigInt/finance; degrade com payload mínimo
    const ts = new Date();
    return res.status(200).json({
      status: 'ok',
      range,
      origin: originFilter,
      counts: { signup_created: 0, email_verified: 0, ref_linked: 0 },
      conversion: {
        signup_to_verified: 0,
        verified_to_linked: 0,
        signup_to_linked: 0,
      },
      finance: { available: false },
      ts: ts.toISOString(),
      ts_local: localIso(ts, tz),
      note: 'Degraded summary due to internal error',
    });
  }
});

/** --------- /metrics/alerts ---------
 * Query params (ex.): range=24h&min_signup_verify=0.25&min_verified_linked=0.7&min_volume=2
 * Retorna contagens, conversões, thresholds e lista de alerts []
 */
router.get('/metrics/alerts', opsAuth, async (req: Request, res: Response) => {
  const range = String(req.query.range || '24h');
  const originFilter =
    req.query.origin ? String(req.query.origin).toLowerCase() : null;
  const { start, end } = parseRange(range);

  // limites
  const min_signup_verify = Number(req.query.min_signup_verify ?? 0.25);
  const min_verified_linked = Number(req.query.min_verified_linked ?? 0.7);
  const min_volume = Number(req.query.min_volume ?? 2);

  // contagens
  const rows =
    (await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT kind, COUNT(*)::int AS qty
      FROM "FunnelEvent"
      WHERE "createdAt" >= $1
        AND "createdAt" <  $2
        AND ($3::text IS NULL OR origin = $3::text)
        AND kind IN ('signup_created','email_verified','ref_linked')
      GROUP BY kind
      `,
      start,
      end,
      originFilter
    )) || [];

  const counts = {
    signup_created: 0,
    email_verified: 0,
    ref_linked: 0,
  } as Record<'signup_created' | 'email_verified' | 'ref_linked', number>;
  for (const r of rows) {
    if (r.kind in counts) counts[r.kind as keyof typeof counts] = Number(r.qty) || 0;
  }

  const conv = (a: number, b: number) => (a > 0 ? b / a : 0);
  const conversion = {
    signup_to_verified: conv(counts.signup_created, counts.email_verified),
    verified_to_linked: conv(counts.email_verified, counts.ref_linked),
    signup_to_linked: conv(counts.signup_created, counts.ref_linked),
  };

  // alerts
  const alerts: string[] = [];
  if (counts.signup_created < min_volume) {
    alerts.push(`Low volume: signup_created=${counts.signup_created} (< ${min_volume})`);
  }
  if (conversion.signup_to_verified < min_signup_verify) {
    alerts.push(
      `Low conversion signup→verified: ${conversion.signup_to_verified.toFixed(2)} (< ${min_signup_verify})`
    );
  }
  if (conversion.verified_to_linked < min_verified_linked) {
    alerts.push(
      `Low conversion verified→linked: ${conversion.verified_to_linked.toFixed(2)} (< ${min_verified_linked})`
    );
  }

  return res.status(200).json({
    status: 'ok',
    range,
    origin: originFilter,
    counts,
    conversion,
    thresholds: {
      min_signup_verify,
      min_verified_linked,
      min_volume,
    },
    alerts,
    ts: new Date().toISOString(),
  });
});

export default router;
