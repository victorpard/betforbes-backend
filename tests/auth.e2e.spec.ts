import request from "supertest";
import app from "../src/app";
import prisma from "../src/lib/prisma";

let userId: string | undefined;
let verifyToken: string | undefined;
const testEmail = `e2e.test.${Date.now()}@example.com`;
const testPwd = "TestPwd123!";

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: "E2E Test",
      email: testEmail,
      password: testPwd,
      passwordConfirmation: testPwd
    });

  if (res.status !== 201 || !res.body.user?.id) {
    console.error("Falha ao registrar usuário no beforeAll:", res.body);
    return;
  }

  userId = res.body.user.id;
  const tokenRec = await prisma.emailVerificationToken.findFirst({
    where: { userId }
  });
  verifyToken = tokenRec?.token || undefined;
});

describe("Auth Endpoints Básicos", () => {
  it("Registro de usuário", async () => {
    expect(userId).toBeDefined();
  });

  it("Verificação de email", async () => {
    if (!userId || !verifyToken) {
      console.warn("Setup falhou, pulando teste de verificação.");
      return;
    }

    const res = await request(app).get(`/api/auth/verify-email?token=${verifyToken}`);
    expect([200, 302]).toContain(res.status);
  });
});
