import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'https://betforbes.com';
const TOKENS = new SharedArray('tokens', () =>
  open(__ENV.TOKENS_CSV || 'tokens_valid.csv').trim().split('\n').map(l => l.split(',')[1].trim())
).filter(t => t);

export const options = {
  hosts: { 'betforbes.com': __ENV.IP || '127.0.0.1' },
  scenarios: {
    steady_profile: {
      executor: 'ramping-arrival-rate',
      timeUnit: '1s',
      preAllocatedVUs: 1500, maxVUs: 2000,
      stages: [
        { duration: '1m', target: 200 },
        { duration: '1m', target: 400 },
        { duration: '1m', target: 600 },
        { duration: '5m', target: 600 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    'checks{endpoint:profile}': ['rate>0.99'],
  },
  userAgent: 'k6-betforbes-loadtest',
};

export default function () {
  const i = (exec.vu.idInTest - 1) % TOKENS.length;
  const tok = TOKENS[i];
  const res = http.get(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${tok}` },
    tags: { endpoint: 'profile' },
    timeout: '8s',
  });
  let okPayload = false;
  try { okPayload = res.json('data.user.id') != null; } catch (_) {}
  check(res, {
    'profile 200': r => r.status === 200,
    'payload ok': _ => okPayload,
  }, { endpoint: 'profile' });
  sleep(Math.random() * 0.2);
}
