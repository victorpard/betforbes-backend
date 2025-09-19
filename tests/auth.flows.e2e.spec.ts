import request from "supertest";
import app from "../src/app";
import prisma from "../src/lib/prisma";

const testEmail = `flow.test.${Date.now()}@example.com`;
const testPwd = "TestPwd123!";
let userId: string | undefined;
let verifyToken: string | undefined;

describe("Fluxos de Autenticação", () => {
  it("Registro de usuário: sucesso", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Fluxo Test",
      email: testEmail,
      password: testPwd,
      passwordConfirmation: testPwd
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    userId = res.body.data.user.id;

    const tokenRec = await prisma.emailVerificationToken.findFirst({
      where: { userId }
    });
    verifyToken = tokenRec?.token || undefined;
  });

  it("Registro de usuário: email duplicado", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Duplicado",
      email: testEmail,
      password: testPwd,
      passwordConfirmation: testPwd
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("Verificação de e-mail (pré-requisito login)", async () => {
    const res = await request(app).get(`/api/auth/verify-email?token=${verifyToken}`);
    expect([200, 302]).toContain(res.status);
  });

  it("Login bem-sucedido após verificação", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: testPwd
    });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it("Recuperação de senha - fluxo completo", async () => {
    const resForgot = await request(app).post("/api/auth/forgot-password").send({
      email: testEmail
    });
    expect(resForgot.status).toBe(200);

    if (!userId) throw new Error("❌ Usuário não registrado corretamente");

    const tokenRec = await prisma.passwordResetToken.create({
      data: {
        userId,
        token: "dummy-reset-token",
        expiresAt: new Date(Date.now() + 3600 * 1000)
      }
    });

    const resReset = await request(app).post("/api/auth/reset-password").send({
      token: tokenRec.token,
      newPassword: "NewPass123!",
      passwordConfirmation: "NewPass123!"
    });

    expect(resReset.status).toBe(200);
  });
});
