import request from "supertest";
import app from "../src/app";
import prisma from "../src/lib/prisma";

let accessToken: string;
let refreshToken: string;
const testEmail = `protected.test.${Date.now()}@example.com`;
const testPwd = "TestPwd123!";

beforeAll(async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Teste Protegido",
    email: testEmail,
    password: testPwd,
    passwordConfirmation: testPwd
  });

  if (res.status !== 201) {
    console.error("❌ Falha ao registrar usuário:", res.body);
    throw new Error("Não foi possível registrar o usuário de teste");
  }

  const userId = res.body.data.user.id;
  const tokenRec = await prisma.emailVerificationToken.findFirst({
    where: { userId }
  });

  if (!tokenRec) throw new Error("Token de verificação não encontrado");

  await request(app).get(`/api/auth/verify-email?token=${tokenRec.token}`);
});

describe("Fluxo de Endpoints Protegidos, Refresh e Logout", () => {
  it("1) /profile sem token retorna 401", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  it("2) /profile com token válido retorna dados do usuário", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: testPwd
    });

    expect(loginRes.status).toBe(200);
    accessToken = loginRes.body.data.tokens.accessToken;
    refreshToken = loginRes.body.data.tokens.refreshToken;

    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });

  it("3) Refresh Token renova o accessToken", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(res.status).toBe(200);
    accessToken = res.body.data.accessToken;
  });

  it("4) Logout invalida o refreshToken", async () => {
    const res = await request(app).post("/api/auth/logout").send({ refreshToken });
    expect(res.status).toBe(200);
  });

  it("5) Usar refreshToken inválido agora retorna 401", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(res.status).toBe(401);
  });
});
