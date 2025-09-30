import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// ====== ENV & Defaults ======
const BASE_URL   = __ENV.BASE_URL   || 'https://betforbes.com';
const TOKENS_CSV = __ENV.TOKENS_CSV || '/opt/betforbes/backend/load/tokens_valid.csv';
const DEBUG      = (__ENV.DEBUG || '0') === '1';

// Flags (todas OFF por padrão)
const ENABLE_BALANCE  = (__ENV.ENABLE_BALANCE  || 'false') === 'true';
const ENABLE_DEPOSIT  = (__ENV.ENABLE_DEPOSIT  || 'false') === 'true';
const ENABLE_WITHDRAW = (__ENV.ENABLE_WITHDRAW || 'false') === 'true';
const ENABLE_ORDER    = (__ENV.ENABLE_ORDER    || 'false') === 'true';

// Paths (ajuste conforme sua API real)
const PATH_PROFILE  = __ENV.PATH_PROFILE  || '/api/auth/profile';
const PATH_BALANCE  = __ENV.PATH_BALANCE  || '/api/wallet/balance';
const PATH_DEPOSIT  = __ENV.PATH_DEPOSIT  || '/api/wallet/deposits';
const PATH_WITHDRAW = __ENV.PATH_WITHDRAW || '/api/wallet/withdrawals';
const PATH_ORDER    = __ENV.PATH_ORDER    || '/api/orders';

// ====== Utils ======
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ====== Tokens ======
const TOKENS = new SharedArray('tokens', () => {
  const arr = [];
  try {
    const raw = open(TOKENS_CSV);
    if (!raw) return arr;
    const lines = raw.split(/\r?\n/);
    for (const ln of lines) {
      if (!ln) continue;
      const parts = ln.split(',');
      if (parts.length < 2) continue;
      const token = (parts[1] || '').trim();
      if (token && token.toLowerCase() !== 'token') arr.push(token);
    }
  } catch (e) {
    // deixa vazio para disparar erro “sem tokens” no pickToken()
  }
  return arr;
});

function pickToken() {
  if (!TOKENS || !TOKENS.length) {
    throw new Error(`Sem tokens carregados. Verifique CSV em ${TOKENS_CSV} (2ª coluna=token).`);
  }
  return TOKENS[Math.floor(Math.random() * TOKENS.length)];
}

function reqOpts(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  return { headers, timeout: '60s' };
}

function ok(res) { return !!(res && typeof res.status === 'number'); }

function logDebug(prefix, res) {
  if (!DEBUG) return;
  const st = res && res.status;
  const bd = res && typeof res.body !== 'undefined' ? String(res.body).slice(0, 300) : '<no-body>';
  console.error(`${prefix} status=${st} body=${bd}`);
}

// ====== Ações ======
function getProfile(token) {
  const res = http.get(`${BASE_URL}${PATH_PROFILE}`, reqOpts(token));
  if (DEBUG && !ok(res)) logDebug('profile', res);
  check(res, { 'profile 200': (r) => r && r.status === 200 }, { endpoint: 'profile' });
  return res;
}

function getBalance(token) {
  const res = http.get(`${BASE_URL}${PATH_BALANCE}`, reqOpts(token));
  if (DEBUG && !ok(res)) logDebug('balance', res);
  check(res, { 'balance 200': (r) => r && r.status === 200 }, { endpoint: 'balance' });
  return res;
}

function postDeposit(token) {
  const payload = JSON.stringify({
    amount: randInt(10, 100),
    currency: 'BRL',
    idempotencyKey: `dep-${__ITER}-${__VU}-${Date.now()}`,
  });
  const res = http.post(`${BASE_URL}${PATH_DEPOSIT}`, payload, reqOpts(token));
  if (DEBUG && !ok(res)) logDebug('deposit', res);
  check(res, { 'deposit 2xx/202': (r) => r && [200, 201, 202].includes(r.status) }, { endpoint: 'deposit' });
  return res;
}

function postWithdraw(token) {
  const payload = JSON.stringify({
    amount: randInt(5, 50),
    currency: 'BRL',
    idempotencyKey: `wd-${__ITER}-${__VU}-${Date.now()}`,
  });
  const res = http.post(`${BASE_URL}${PATH_WITHDRAW}`, payload, reqOpts(token));
  if (DEBUG && !ok(res)) logDebug('withdraw', res);
  check(res, { 'withdraw 2xx/202': (r) => r && [200, 201, 202].includes(r.status) }, { endpoint: 'withdraw' });
  return res;
}

function postOrder(token) {
  const payload = JSON.stringify({
    market: 'BTC-BRL',
    side: Math.random() < 0.5 ? 'BUY' : 'SELL',
    type: 'MARKET',
    size: randInt(1, 3),
    idempotencyKey: `ord-${__ITER}-${__VU}-${Date.now()}`,
  });
  const res = http.post(`${BASE_URL}${PATH_ORDER}`, payload, reqOpts(token));
  if (DEBUG && !ok(res)) logDebug('order', res);
  check(res, { 'order 2xx/202': (r) => r && [200, 201, 202].includes(r.status) }, { endpoint: 'order' });
  return res;
}

// ====== Cenário ======
export const options = {
  thresholds: {
    'checks{endpoint:profile}': ['rate>0.99'],
    'http_req_failed{scenario:mixed}': ['rate==0'],
    'http_req_duration{scenario:mixed}': ['p(90)<200', 'p(95)<400'],
  },
  scenarios: {
    mixed: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 250 },
        { duration: '5m', target: 500 },
        { duration: '5m', target: 750 },
        { duration: '5m', target: 1000 },
        { duration: '5m', target: 1000 },
        { duration: '2m', target: 0 },
      ],
      gracefulStop: '30s',
    },
  },
};

export default function () {
  // tudo isolado em try/catch para nunca “subir” exception de JS
  try {
    const token = pickToken();

    // Perfil sempre (sanidade)
    getProfile(token);

    // Rotas “mistas” somente se ativadas
    const r = Math.random();
    if (ENABLE_DEPOSIT && r < 0.25) {
      postDeposit(token);
    } else if (ENABLE_WITHDRAW && r < 0.50) {
      postWithdraw(token);
    } else if (ENABLE_ORDER && r < 0.85) {
      postOrder(token);
    } else if (ENABLE_BALANCE) {
      getBalance(token);
    }
  } catch (e) {
    if (DEBUG) console.error('loop error', String(e && e.stack || e));
  }

  sleep(randInt(1, 3) / 10);
}
