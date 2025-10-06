import http from 'k6/http';
import { check, sleep } from 'k6';

// ENV aceitos:
// BASE_URL (default: http://127.0.0.1:3000)
// PATH     (default: /api/orders/preview)
// VUS      (default: 10)           # modo constante
// DURATION (default: 10s)          # modo constante
// RAMP     (ex: 1m:100,2m:100,1m:300,2m:300,2m:600,3m:600,2m:1000,3m:1000,30s:0)
// SYMBOL   (default: BTCUSDT)
// SIDE     (default: BUY)
// QTY      (default: 0.01)
// ERROR_RATE (default: 0.01)  // 1%
// P95        (default: 150)   // ms

function parseStages(str) {
  return str.split(',').map(seg => {
    const [duration, target] = seg.split(':');
    return { duration: duration.trim(), target: Number(target) };
  });
}

const ERROR_RATE = parseFloat(__ENV.ERROR_RATE || '0.01');
const P95 = parseFloat(__ENV.P95 || '150');

let OPTIONS;
if (__ENV.RAMP) {
  OPTIONS = {
    scenarios: {
      ramp: {
        executor: 'ramping-vus',
        stages: parseStages(__ENV.RAMP),
        gracefulRampDown: '30s',
        gracefulStop: '30s',
      },
    },
    thresholds: {
      http_req_failed: [`rate<${ERROR_RATE}`],
      'http_req_duration{expected_response:true}': [`p(95)<${P95}`],
      checks: ['rate>0.99'],
    },
  };
} else {
  OPTIONS = {
    vus: Number(__ENV.VUS || 10),
    duration: __ENV.DURATION || '10s',
    thresholds: {
      http_req_failed: [`rate<${ERROR_RATE}`],
      'http_req_duration{expected_response:true}': [`p(95)<${P95}`],
      checks: ['rate>0.99'],
    },
  };
}
export const options = OPTIONS;

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:3000';
const PATH = __ENV.PATH || '/api/orders/preview';
const URL = `${BASE}${PATH}`;

const SYMBOL = __ENV.SYMBOL || 'BTCUSDT';
const SIDE = __ENV.SIDE || 'BUY';
const QTY = Number(__ENV.QTY || '0.01');

function idemKey(vu, iter) {
  return `vu${vu}-it${iter}`;
}

export default function () {
  const payload = JSON.stringify({ symbol: SYMBOL, side: SIDE, quantity: QTY });
  const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': idemKey(__VU, __ITER) };

  // 1ª chamada — deve vir 200 + created|processing|replayed
  const r1 = http.post(URL, payload, { headers });
  const st1 = String(r1.headers['Idempotency-Status'] || '').toLowerCase();
  check(r1, {
    'r1 status 200': (res) => res.status === 200,
    'r1 idem created|processing|replayed': () => ['created','processing','replayed'].includes(st1),
  });

  // 2ª chamada — deve vir 200 + replayed (re-tenta se vier processing)
  let r2 = http.post(URL, payload, { headers });
  let st2 = String(r2.headers['Idempotency-Status'] || '').toLowerCase();
  let tries = 0;
  while (st2 === 'processing' && tries < 5) {
    sleep(0.25);
    r2 = http.post(URL, payload, { headers });
    st2 = String(r2.headers['Idempotency-Status'] || '').toLowerCase();
    tries++;
  }
  check(r2, {
    'r2 status 200': (res) => res.status === 200,
    'r2 idem replayed': () => st2 === 'replayed',
  });

  // pequeno jitter para evitar sincronismo perfeito
  sleep(0.1 + Math.random() * 0.1);
}
