import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL   = __ENV.BASE_URL   || 'http://127.0.0.1:18081';
const ENDPOINT   = (__ENV.API_PATH || __ENV.PATH || '/api/orders/preview').replace(/\/+$/, '');
const SYMBOL     = __ENV.SYMBOL     || 'BTCUSDT';
const SIDE       = __ENV.SIDE       || 'BUY';
const QUANTITY   = Number(__ENV.QUANTITY || 0.01);
const XFF_PREFIX = __ENV.XFF_PREFIX || '198.51.100.';
const IDEM_PREF  = __ENV.IDEM_PREFIX || 'smoke';

export default function () {
  const key = `${IDEM_PREF}-${__VU}-${__ITER}`;
  const headers = {
    'Content-Type': 'application/json',
    'Idempotency-Key': key,
    'X-Forwarded-For': `${XFF_PREFIX}${__VU}`,
  };
  const url  = `${BASE_URL}${ENDPOINT.startsWith('/') ? '' : '/'}${ENDPOINT}`;
  const body = JSON.stringify({ symbol: SYMBOL, side: SIDE, quantity: QUANTITY });

  const r1 = http.post(url, body, { headers });
  check(r1, {
    'r1 status 200': (res) => res.status === 200,
    'r1 idem created|processing|replayed': (res) => {
      const s = (res.headers['Idempotency-Status'] || '').toLowerCase();
      return s === 'created' || s === 'processing' || s === 'replayed';
    },
  });

  const r2 = http.post(url, body, { headers });
  check(r2, {
    'r2 status 200': (res) => res.status === 200,
    'r2 idem replayed': (res) =>
      (res.headers['Idempotency-Status'] || '').toLowerCase() === 'replayed',
  });

  sleep(0.1);
}
