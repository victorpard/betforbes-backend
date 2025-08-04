
import axios from 'axios';

const INFO_URL = process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz/info';

interface SpotMeta {
  tokens: { name: string; index: number }[];
  universe: { name: string; index: number }[];
}

interface SpotStat {
  midPx: string;      // preço médio
  markPx: string;     // preço marcado
  prevDayPx: string;  // preço anterior
  dayNtlVlm: string;  // volume 24h
}

type InfoResponse = [SpotMeta, SpotStat[]];

/**
 * Lista os pares de spot suportados (ex: ["BTC/USDT","ETH/USDT",…])
 */
export async function listAssets(): Promise<string[]> {
  const resp = await axios.post<InfoResponse>(
    INFO_URL,
    { type: 'spotMeta' }, // só precisa do meta
    { headers: { 'Content-Type': 'application/json' } }
  );
  const [meta] = resp.data;
  // universe[].name já vem como "BTC/USDT", "@1", etc.
  // Filtramos só entradas canônicas (nome com "/")
  return meta.universe
    .map(u => u.name)
    .filter(name => name.includes('/'));
}

/**
 * Busca o ticker via Info Endpoint
 * @param pair ex: "BTC/USDT"
 */
export async function fetchTicker(pair: string): Promise<{
  price: string;
  volume24h: string;
  change24h: string;
}> {
  // Chama o endpoint completo spotMetaAndAssetCtxs
  const resp = await axios.post<InfoResponse>(
    INFO_URL,
    { type: 'spotMetaAndAssetCtxs' },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const [meta, stats] = resp.data;

  // Encontre a posição da universe que bate com o pair
  const uni = meta.universe.find(u => u.name === pair);
  if (!uni) {
    const e = new Error(`Par não encontrado nos metadados: ${pair}`);
    (e as any).status = 404;
    throw e;
  }

  const stat = stats[uni.index];
  if (!stat) {
    const e = new Error(`Sem estatísticas para par: ${pair}`);
    (e as any).status = 404;
    throw e;
  }

  return {
    price: stat.midPx,
    volume24h: stat.dayNtlVlm,
    change24h: (
      (parseFloat(stat.midPx) - parseFloat(stat.prevDayPx)) /
      parseFloat(stat.prevDayPx) *
      100
    ).toFixed(2),
  };
}
