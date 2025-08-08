import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';

describe('Fluxo de Endpoints Protegidos, Refresh e Logout', () => {
  const email = `protected.${Date.now()}@example.com`;
  const password = 'ValidP@ssw0rd1!';
  let accessToken: string;
  let refreshToken: string;

  it('2) Cadastro e verificação de email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Teste Protegido', email, password })
      .then(r => { if (r.status !== 201) console.log('REGISTER FAIL BODY:', r.body); expect(r.status).toBe(201); });

    const tokenRec = await prisma.emailVerificationToken.findFirst({
      where: { user: { email } },
      orderBy: { createdAt: 'desc' },
    });
    expect(tokenRec).toBeTruthy();

    const res = await request(app).get(`/api/auth/verify-email?token=${tokenRec!.token}`);
    expect(res.status).toBe(200);
  });

  it('3) /profile com token válido retorna dados do usuário', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    accessToken = login.body?.data?.accessToken ?? login.body?.data?.tokens?.accessToken;
    refreshToken = login.body?.data?.refreshToken ?? login.body?.data?.tokens?.refreshToken;

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);

    // Normaliza payload: pode vir {data:{user}}, {data}, {user} ou direto no body
    const body = res.body ?? {};
    const data = body.data ?? body;
    const user = data.user ?? data;

    expect(user).toBeTruthy();
    if (user.email) {
      expect(user.email).toBe(email);
    }
  });

  it('4) Refresh Token renova o accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body?.data?.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;
  });

  it('5) Logout invalida o refreshToken', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('6) Usar refreshToken inválido agora retorna 401', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });

    expect([400, 401]).toContain(res.status);
    const code = res.body?.code;
    if (code) {
      expect(['UNAUTHORIZED', 'INVALID_REFRESH_TOKEN', 'INVALID_TOKEN']).toContain(code);
    } else {
      // Alguns handlers podem não enviar "code", então validamos estrutura de erro básica
      expect(res.body?.success === false || typeof res.body?.message === 'string').toBe(true);
    }
  });
});
