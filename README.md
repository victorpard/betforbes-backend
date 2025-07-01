# 🎯 BetForbes Backend

Backend modular e robusto para a plataforma BetForbes, desenvolvido com Node.js, TypeScript, Express e PostgreSQL.

## 🚀 Características

- **Arquitetura Modular**: Estrutura organizada por módulos funcionais
- **Autenticação Completa**: JWT com refresh tokens, verificação de email e recuperação de senha
- **Segurança Avançada**: Rate limiting, CORS, validação de dados e logs de auditoria
- **Banco PostgreSQL**: Com Prisma ORM para type-safety
- **Documentação Swagger**: API totalmente documentada
- **Emails Transacionais**: Templates HTML para verificação e recuperação
- **Logs Estruturados**: Winston para monitoramento e debugging

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

### 1. Clone e instale dependências

```bash
# Extrair o projeto
unzip betforbes_backend_modular.zip
cd betforbes_backend_modular

# Instalar dependências
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

**Configurações obrigatórias:**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/betforbes_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

### 3. Configurar banco de dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar schema ao banco
npm run db:push

# Popular com dados iniciais
npm run db:seed
```

### 4. Iniciar servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 👥 Usuários de Teste

Após executar o seed, os seguintes usuários estarão disponíveis:

| Email | Senha | Tipo | Status |
|-------|-------|------|--------|
| admin@betforbes.com | admin123456 | Admin | ✅ Verificado |
| test@betforbes.com | test123456 | Usuário | ✅ Verificado |
| unverified@betforbes.com | unverified123 | Usuário | ❌ Não verificado |

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:3001/api-docs
- **JSON Schema**: http://localhost:3001/api-docs.json
- **Health Check**: http://localhost:3001/health

## 🔗 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/verify-email?token=TOKEN` - Verificar email
- `POST /api/auth/resend-verification` - Reenviar verificação
- `POST /api/auth/forgot-password` - Solicitar recuperação de senha
- `POST /api/auth/reset-password` - Redefinir senha
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Fazer logout

### Usuários
- `GET /api/users/profile` - Obter perfil
- `PUT /api/users/profile` - Atualizar perfil
- `POST /api/users/change-password` - Alterar senha
- `GET /api/users/sessions` - Listar sessões
- `DELETE /api/users/sessions/:id` - Revogar sessão

## 🏗️ Estrutura do Projeto

```
src/
├── modules/
│   ├── auth/           # Autenticação e autorização
│   ├── users/          # Gestão de usuários
│   ├── bets/           # (Futuro) Sistema de apostas
│   ├── wallet/         # (Futuro) Carteira e PIX
│   └── admin/          # (Futuro) Painel administrativo
├── lib/
│   ├── prisma.ts       # Cliente Prisma
│   └── jwt.ts          # Serviços JWT
├── utils/
│   ├── email.ts        # Envio de emails
│   ├── logger.ts       # Sistema de logs
│   ├── helpers.ts      # Funções auxiliares
│   └── validation.ts   # Validações
├── middlewares/
│   ├── auth.ts         # Middleware de autenticação
│   ├── errorHandler.ts # Tratamento de erros
│   └── rateLimiter.ts  # Rate limiting
└── index.ts            # Servidor principal
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor com hot reload
npm run build        # Compila TypeScript
npm start           # Inicia servidor compilado

# Banco de dados
npm run db:generate  # Gera cliente Prisma
npm run db:push     # Aplica schema ao banco
npm run db:seed     # Popula banco com dados iniciais
npm run db:studio   # Interface visual do banco

# Qualidade de código
npm run lint        # Verifica código com ESLint
npm run format      # Formata código com Prettier
npm test           # Executa testes
```

## 🔒 Segurança

### Rate Limiting
- **Geral**: 100 requests/15min por IP
- **Autenticação**: 5 tentativas/15min por IP
- **Recuperação de senha**: 3 tentativas/hora por IP
- **Verificação de email**: 3 tentativas/10min por IP

### Validações
- Senhas: mínimo 8 caracteres, maiúscula, minúscula e número
- Emails: formato válido e normalização
- Tokens: geração segura com crypto
- Dados: sanitização e validação com Joi

### Logs de Auditoria
Todas as ações importantes são registradas:
- Login/logout de usuários
- Alterações de senha
- Verificações de email
- Tentativas de acesso negado

## 📧 Configuração de Email

### Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
```

### Outros Provedores
- **Mailgun**: smtp.mailgun.org
- **SendGrid**: smtp.sendgrid.net
- **Zoho**: smtp.zoho.com

## 🚀 Deploy

### Variáveis de Produção
```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="secure-random-string-256-bits"
FRONTEND_URL="https://www.betforbes.com"
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔍 Monitoramento

### Health Check
```bash
curl http://localhost:3001/health
```

### Logs
```bash
# Logs em tempo real
tail -f logs/combined.log

# Apenas erros
tail -f logs/error.log
```

## 🧪 Testes

### Teste Manual com cURL

**Registro:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@teste.com","password":"MinhaSenh@123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@betforbes.com","password":"test123456"}'
```

**Perfil (com token):**
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3001/api/auth/profile
```

## 🤝 Integração com Frontend

O backend está 100% compatível com o frontend BetForbes. Configure:

```env
# No frontend (.env)
VITE_API_URL=http://localhost:3001/api

# No backend (.env)
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs em `logs/`
2. Consulte a documentação Swagger
3. Teste endpoints com cURL
4. Verifique configurações do `.env`

## 📄 Licença

MIT License - veja arquivo LICENSE para detalhes.

---

**🎯 BetForbes Backend - Desenvolvido com ❤️ pela equipe BetForbes**

