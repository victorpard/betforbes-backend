import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '60s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

const JWT = __ENV.JWT;

export default function () {
  const res = http.get('https://betforbes.com/api/auth/profile', {
    headers: { Authorization: `Bearer ${JWT}` },
  });
  check(res, { '200': (r) => r.status === 200 });
  sleep(0.2);
}
