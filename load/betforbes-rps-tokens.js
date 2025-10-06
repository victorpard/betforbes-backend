import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'https://betforbes.com';

const TOKENS = new SharedArray('tokens', () =>
  open(__ENV.TOKENS_CSV || 'tokens_valid.csv')
    .trim()
    .split('\n')
    .map(l => l.split(',')[1].trim())
).filter(t => t);

function authHeaders() {
  const idx = Math.floor(Math.random() * TOKENS.length);
  return { Authorization: `Bearer ${TOKENS[idx]}` };
}

export const options = {
  hosts: { 'betforbes.com': __ENV.IP || '127.0.0.1' },
  scenarios: {
    steady_profile: {
      executor: 'ramping-arrival-rate',
      timeUnit: '1s',
      preAllocatedVUs: 1500, maxVUs: 2000,
      stages: [
        { duration: '2m',  target: 600 },
        { duration: '30m', target: 600 },   // mude para 15m se quiser
        { duration: '1m',  target: 0   },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.001'],
    http_req_duration: ['p(95)<250', 'p(99)<500'],
    'checks{endpoint:profile}': ['rate>0.999'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/auth/profile`, { headers: authHeaders() });

  check(res, {
    'profile 200': r => r.status === 200,
    'payload ok':  r => {
      try {
        const j = r.json();
        return j && j.success === true && j.data && j.data.user && j.data.user.email;
      } catch (e) { return false; }   // <— fix aqui
    },
  }, { endpoint: 'profile' });

  sleep(0.1);
}
