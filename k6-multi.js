import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 200 },
    { duration: '40s', target: 600 },
    { duration: '60s', target: 1000 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

const TOKENS = JSON.parse(__ENV.TOKENS || '[]');
if (!TOKENS.length) { throw new Error('Passe -e TOKENS=[...]'); }

export default function () {
  // 70% usa um dos 3 primeiros tokens (mais “quentes”), 30% qualquer um
  const hot = Math.floor(Math.random() * Math.min(3, TOKENS.length));
  const any = Math.floor(Math.random() * TOKENS.length);
  const i = Math.random() < 0.7 ? hot : any;

  const r = http.get('https://betforbes.com/api/auth/profile', {
    headers: { Authorization: `Bearer ${TOKENS[i]}` },
  });

  check(r, { '200': (x) => x.status === 200 });
  sleep(0.2);
}
