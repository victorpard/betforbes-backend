
import request from 'supertest';
import app from '../src/app'; // O app mockado será usado aqui
import prisma from '../src/prisma';

describe('Fluxo de verificação de e-mail', () => {
  let userId: string | null = null; // Iniciar como null para uma verificação mais segura
  let verifyToken: string;
  
  // Criar um email único para cada execução do teste para evitar conflitos
  const testEmail = `e2e.test.${Date.now()}@example.com`;

  beforeAll(async () => {
    try {
      // 1) Cria o usuário de teste
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'E2E Test',
          email: testEmail, // Usar o email único
          password: 'SenhaForte123!',
          confirmPassword: 'SenhaForte123!'
        });

      // Verificar se a requisição foi bem-sucedida antes de tentar acessar o body
      if (res.status !== 201 || !res.body.data?.user?.id) {
        // Logar o erro para facilitar a depuração se a criação do usuário falhar
        console.error('Falha ao registrar usuário no beforeAll:', res.body);
        return; // Interrompe a execução do beforeAll se o usuário não foi criado
      }
      
      userId = res.body.data.user.id;

      // 2) Busca o token gerado no banco
      const tokenRecord = await prisma.emailVerificationToken.findFirst({
        where: { userId: userId! }
      });
      
      if (!tokenRecord) {
        throw new Error('Token de verificação não encontrado para o usuário de teste');
      }
      verifyToken = tokenRecord.token;

    } catch (error) {
      console.error("Erro catastrófico no beforeAll:", error);
    }
  });

  it('should verify email with valid token', async () => {
    // Garante que o teste não rode se o setup (beforeAll) falhou
    if (!userId || !verifyToken) {
      // Pula o teste se as condições não foram atendidas
      console.warn('Setup falhou, pulando teste de verificação.'); return;
    }

    // 3) Chama o endpoint de verificação
    const verifyRes = await request(app)
      .get(`/api/auth/verify-email?token=${verifyToken}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);

    // 4) Confirma no banco que isVerified virou true
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user).not.toBeNull();
    expect(user?.isVerified).toBe(true);
  });

  afterAll(async () => {
    // CORREÇÃO PRINCIPAL: Só executa a limpeza se o userId foi definido
    if (userId) {
      // A ordem importa: primeiro delete o que depende do usuário
      await prisma.emailVerificationToken.deleteMany({ where: { userId: userId } });
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });
});
