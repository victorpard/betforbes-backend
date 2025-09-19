import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

export const affiliateMetricsRouter = Router();

/** Regras de cálculo:
 * - Ordem (criação): 2% do amount (notional)
 * - Ordem (fechamento): 5% do PnL quando positivo (realized_pnl_usdt > 0)
 * - Saque: fee_house_usdt já armazenada (2%)
 * - Comissão do pai do afiliado: 5% do LUCRO DA CASA (>0)
 */
const FEE_CREATE = 0.02;
const FEE_PROFIT = 0.05;
const AFF_PARENT_CUT = 0.05;

type Range = "30d" | "90d" | "365d" | "all";

function windowFor(range: Range, now = new Date()) {
  const end = now;
  const start = new Date(end);
  if (range === "all") {
    start.setTime(0);
    return { start, end };
  }
  if (range === "30d") start.setDate(start.getDate() - 30);
  else if (range === "90d") start.setDate(start.getDate() - 90);
  else start.setDate(start.getDate() - 365);
  return { start, end };
}

function n(x: any): number {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}

// Prisma singleton seguro (para OPS e também uso normal)
function getPrisma(req: any): PrismaClient {
  if (req?.prisma) return req.prisma as PrismaClient;
  const g = global as any;
  if (!g.__ops_prisma) g.__ops_prisma = new PrismaClient();
  return g.__ops_prisma as PrismaClient;
}

export async function metricsSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const prisma = getPrisma(req);

    const range = (String(req.query.range || "30d") as Range);
    const tz = String(req.query.tz || "UTC");
    const affiliateId = (req.query.affiliateId ? String(req.query.affiliateId) : "all");

    const { start, end } = windowFor(range);
    // usamos ISO, o Postgres converte corretamente
    const startISO = start.toISOString();
    const endISO = end.toISOString();

    const isGlobal = affiliateId === "all";

    let rows: any[];

    if (isGlobal) {
      // GLOBAL: sem filtro por afiliado
      rows = await prisma.$queryRaw<any[]>`
        with orders as (
          select
            count(*) as orders,
            coalesce(sum(o.amount),0)::numeric as volume_usdt,
            coalesce(sum(${FEE_CREATE}*o.amount + ${FEE_PROFIT}*greatest(o.realized_pnl_usdt,0)),0)::numeric as house_profit_orders_usdt
          from public.orders o
          where o."createdAt" >= ${startISO} and o."createdAt" <= ${endISO}
        ),
        withdraws as (
          select
            coalesce(sum(w.amount_usdt),0)::numeric    as withdraw_amount_total_usdt,
            coalesce(sum(w.fee_house_usdt),0)::numeric as withdraw_fee_house_usdt
          from public.withdrawals w
          where w."createdAt" >= ${startISO} and w."createdAt" <= ${endISO}
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
          (${AFF_PARENT_CUT} * greatest(o.house_profit_orders_usdt + w.withdraw_fee_house_usdt, 0)) as affiliate_commission_due_usdt
        from orders o, withdraws w
      `;
    } else {
      // FILTRO POR AFILIADO: considera users.referredById = affiliateId
      rows = await prisma.$queryRaw<any[]>`
        with orders as (
          select
            count(*) as orders,
            coalesce(sum(o.amount),0)::numeric as volume_usdt,
            coalesce(sum(${FEE_CREATE}*o.amount + ${FEE_PROFIT}*greatest(o.realized_pnl_usdt,0)),0)::numeric as house_profit_orders_usdt
          from public.orders o
          join public.users u_o on u_o.id = o."userId" and u_o."referredById" = ${affiliateId}
          where o."createdAt" >= ${startISO} and o."createdAt" <= ${endISO}
        ),
        withdraws as (
          select
            coalesce(sum(w.amount_usdt),0)::numeric    as withdraw_amount_total_usdt,
            coalesce(sum(w.fee_house_usdt),0)::numeric as withdraw_fee_house_usdt
          from public.withdrawals w
          join public.users u_w on u_w.id = w."userId" and u_w."referredById" = ${affiliateId}
          where w."createdAt" >= ${startISO} and w."createdAt" <= ${endISO}
        )
        select
          (select count(*) from public.users where "referredById" = ${affiliateId}) as users_total,
          (select count(*) from public.users where "referredById" = ${affiliateId}) as referrals_total,
          o.orders,
          o.volume_usdt,
          o.house_profit_orders_usdt,
          w.withdraw_amount_total_usdt,
          w.withdraw_fee_house_usdt,
          (o.house_profit_orders_usdt + w.withdraw_fee_house_usdt) as house_profit_total_usdt,
          (${AFF_PARENT_CUT} * greatest(o.house_profit_orders_usdt + w.withdraw_fee_house_usdt, 0)) as affiliate_commission_due_usdt
        from orders o, withdraws w
      `;
    }

    const r = rows?.[0] || {};
    const summary = {
      referrals: n(r.referrals_total) || 0,                 // global: total com referredById; por aff: mesmo valor
      orders: n(r.orders),
      volume_usdt: n(r.volume_usdt),
      house_profit_usdt: n(r.house_profit_total_usdt),      // alias amigável
      house_profit_orders_usdt: n(r.house_profit_orders_usdt),
      withdraw_amount_total_usdt: n(r.withdraw_amount_total_usdt),
      withdraw_fee_house_usdt: n(r.withdraw_fee_house_usdt),
      house_profit_total_usdt: n(r.house_profit_total_usdt),
      affiliate_commission_due_usdt: n(r.affiliate_commission_due_usdt),
      commissions_paid_usdt: 0
    };

    res.json({
      version: "v2",
      range,
      timezone: tz,
      scope: isGlobal ? "global" : "affiliate",
      summary
    });
  } catch (err) {
    // mantém compatibilidade com logs/monitoramento atuais
    return res.status(500).json({ error: "AFFILIATE_METRICS_SUMMARY_FAILED" });
  }
}

// Mantém a rota original (para /api/affiliate/metrics/summary)
affiliateMetricsRouter.get("/metrics/summary", metricsSummaryHandler);

// Default export opcional (não obrigatório)
export default affiliateMetricsRouter;
