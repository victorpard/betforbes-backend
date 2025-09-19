import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    api_rps: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.TARGET_RPS || 2000),
      timeUnit: '1s',
      duration: __ENV.DURATION || '2m',
      preAllocatedVUs: Number(__ENV.PRE_VUS || 200),
      maxVUs: Number(__ENV.MAX_VUS || 2000),
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<300'],
  },
};

const BASE_URL  = __ENV.BASE_URL  || 'http://127.0.0.1:18081';
const ENDPOINT  = (__ENV.API_PATH || '/api/orders/preview').replace(/\/+$/, '');
const SYMBOL    = __ENV.SYMBOL || 'BTCUSDT';
const SIDE      = __ENV.SIDE   || 'BUY';
const QUANTITY  = Number(__ENV.QUANTITY || 0.01);
const IDEM_PREF = __ENV.IDEM_PREFIX || 'smoke';
let seq = 0;

export default function () {
  const key = `${IDEM_PREF}-${__VU}-${Date.now()}-${seq++}`;
  const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': key };
  const url  = `${BASE_URL}${ENDPOINT.startsWith('/') ? '' : '/'}${ENDPOINT}`;
  const body = JSON.stringify({ symbol: SYMBOL, side: SIDE, quantity: QUANTITY });
  const res = http.post(url, body, { headers });
  check(res, {
    '200': r => r.status === 200,
    'idem ok': r => ['created','processing','replayed']
      .includes(String(r.headers['Idempotency-Status']||'').toLowerCase()),
  });
}
