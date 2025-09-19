import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

/**
 * ENV:
 *  BASE_URL   (default: http://127.0.0.1:3000)
 *  PATH       (default: /api/orders/preview)
 *  VUS        (default: 10)
 *  DURATION   (default: 10s)
 *  SYMBOL     (default: BTCUSDT)
 *  SIDE       (default: BUY)
 *  QUANTITY   (default: 0.01)   // preferido
 *  QTY        (fallback se QUANTITY não vier)
 *  XFF_PREFIX (default: 198.51.100.)  // prefixo do IP sintético por VU
 *  IDEM_PREFIX (opcional: prefixo para Idempotency-Key)
 */

export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || '10s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:3000';
const PATH = __ENV.PATH || '/api/orders/preview';
const URL = `${BASE}${PATH}`;

const SYMBOL = __ENV.SYMBOL || 'BTCUSDT';
const SIDE = __ENV.SIDE || 'BUY';
const QUANTITY = Number(__ENV.QUANTITY ?? __ENV.QTY ?? '0.01');

if (!isFinite(QUANTITY) || QUANTITY <= 0) {
  throw new Error('Invalid QUANTITY/QTY env (must be a positive number).');
}

const XFF_PREFIX = __ENV.XFF_PREFIX || '198.51.100.'; // TEST-NET-2 (RFC 5737)
const IDEM_PREFIX = __ENV.IDEM_PREFIX ? String(__ENV.IDEM_PREFIX) : 'k6';

// métricas auxiliares
const rateLimited = new Counter('rate_limited'); // conta respostas 429

function idemKey(vu, iter) {
  // chave única por VU/iter; a 2ª chamada do mesmo iter reaproveita a chave
  return `${IDEM_PREFIX}-vu${vu}-it${iter}`;
}

function headersFor(vu, iter) {
  // gera um IP “pseudo-único” por VU (1..250)
  const i = ((vu - 1) % 250) + 1;
  const xff = `${XFF_PREFIX}${i}`;
  return {
    'Content-Type': 'application/json',
    'Idempotency-Key': idemKey(vu, iter),
    'X-Forwarded-For': xff,
  };
}

function idempotencyStatus(res) {
  // k6 normaliza headers com a chave exata usada na resposta;
  // tentamos as variações mais comuns por segurança.
  return String(
    res.headers['Idempotency-Status'] ??
    res.headers['idempotency-status'] ??
    ''
  ).toLowerCase();
}

export default function () {
  const payload = JSON.stringify({
    symbol: SYMBOL,
    side: SIDE,
    quantity: QUANTITY,
  });

  const headers = headersFor(__VU, __ITER);

  // 1ª tentativa
  const r1 = http.post(URL, payload, { headers });
  const st1 = idempotencyStatus(r1);

  if (r1.status === 429) rateLimited.add(1);

  check(r1, {
    'r1 status 200': (res) => res.status === 200,
    'r1 idem created|processing|replayed': () =>
      ['created', 'processing', 'replayed'].includes(st1),
  });

  // 2ª tentativa (mesma chave) — esperado: replayed (com backoff curto se "processing")
  let r2 = http.post(URL, payload, { headers });
  let st2 = idempotencyStatus(r2);

  let tries = 0;
  while (st2 === 'processing' && tries < 5) {
    sleep(0.25 * (1 + tries * 0.2)); // backoff leve
    r2 = http.post(URL, payload, { headers });
    st2 = idempotencyStatus(r2);
    tries++;
  }

  if (r2.status === 429) rateLimited.add(1);

  check(r2, {
    'r2 status 200': (res) => res.status === 200,
    'r2 idem replayed': () => st2 === 'replayed',
  });

  // pequeno respiro entre iterações
  sleep(0.1);
}
