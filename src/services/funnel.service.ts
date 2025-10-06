import { prisma } from '../lib/prisma';

export type FunnelKind = 'signup_created' | 'email_verified' | 'ref_linked';

type TrackInput = {
  userId?: string;
  email?: string;
  affiliateId?: string;
  origin?: 'cookie' | 'code';
  meta?: Record<string, any>;
};

/**
 * Grava um evento do funil de forma fail-safe (telemetria nunca derruba o fluxo).
 */
export async function track(kind: FunnelKind, data: TrackInput = {}) {
  try {
    await prisma.funnelEvent.create({
      data: {
        kind,
        userId: data.userId,
        email: data.email,
        affiliateId: data.affiliateId,
        origin: data.origin,
        meta: (data.meta ?? null) as any,
      },
    });
  } catch (err) {
    // loga e segue
    console.error('[funnel.track] error:', (err as Error)?.message);
  }
}
