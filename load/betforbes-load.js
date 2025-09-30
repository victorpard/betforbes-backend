import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'https://betforbes.com';
const USERS_CSV = __ENV.USERS_CSV || 'users.csv';
const LOGIN_RATE = Math.min(Math.max(parseFloat(__ENV.LOGIN_RATE || '0.005'), 0), 1); // 0.5%

const users = new SharedArray('users', () => {
  const text = open(USERS_CSV);
  return text.trim().split('\n').map(l => {
    const [email, password] = l.replace('\r','').split(',');
    return { email: email.trim(), password: (password||'').trim() };
  });
});

function getVuUser() {
  const vu = exec.vu.idInTest - 1;
  return users[vu % users.length];
}

let vuToken = '';

export const options = {
  scenarios: {
    steady_profile: {
      executor: 'ramping-arrival-rate',
      timeUnit: '1s',
      preAllocatedVUs: 1500,
      maxVUs: 2000,
      stages: [
        { duration: '1m', target: 200 },  // 200 req/s
        { duration: '1m', target: 400 },  // 400 req/s
        { duration: '1m', target: 600 },  // 600 req/s
        { duration: '5m', target: 600 },  // sustentar
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

function loginOnce(force = false) {
  if (vuToken && !force) return;
  const { email, password } = getVuUser();

  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({ email, password }), {
    headers: { 'content-type': 'application/json' },
    tags: { endpoint: 'login' },
    timeout: '10s',
  });

  const token = res.json('accessToken') || res.json('token');
  check(res, {
    'login 200': r => r.status === 200,
    'tem token': _ => !!token,
  }, { endpoint: 'login' });

  if (token) vuToken = token;
}

export default function () {
  if (!vuToken || Math.random() < LOGIN_RATE) loginOnce();

  const res = http.get(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${vuToken}` },
    tags: { endpoint: 'profile' },
    timeout: '10s',
  });

  // Só tenta parsear JSON se veio body
  let okPayload = false;
  try {
    okPayload = res.json('data.user.id') != null;
  } catch (_e) {
    okPayload = false;
  }

  const ok = check(res, {
    'profile 200': r => r.status === 200,
    'payload ok': _ => okPayload,
  }, { endpoint: 'profile' });

  if (!ok && res.status === 401) vuToken = ''; // força relogin
  // Pequena pausa para evitar bursts por VU interno
  sleep(Math.random() * 0.2);
}
