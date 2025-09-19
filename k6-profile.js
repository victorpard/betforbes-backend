import http from 'k6/http';
import { check, sleep } from 'k6';
export let options = {
  stages: [{duration:'20s',target:200},{duration:'40s',target:600},{duration:'60s',target:1000}],
  thresholds:{ http_req_failed:['rate<0.01'], http_req_duration:['p(95)<250'] }
};
const JWT = __ENV.JWT;
export default function () {
  const r = http.get('https://betforbes.com/api/auth/profile',{ headers:{Authorization:`Bearer ${JWT}`}});
  check(r,{ '200': (res)=>res.status===200 });
  sleep(0.2);
}
