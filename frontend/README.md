# BetForbes Frontend - Atualizado

Frontend do BetForbes com funcionalidades de recuperação de senha e melhorias de responsividade mobile.

## 🆕 Novas Funcionalidades

### 1. Recuperação de Senha

#### Páginas Implementadas:
- **`/forgot-password`** - Página para solicitar recuperação de senha
- **`/reset-password`** - Página para redefinir senha com token

#### Fluxo de Uso:
1. Na tela de login, clique em "Esqueci minha senha"
2. Digite seu email na página de recuperação
3. Receba o link por email (backend necessário)
4. Acesse o link com token: `/reset-password?token=TOKEN_AQUI`
5. Digite nova senha e confirme
6. Seja redirecionado para o login

#### Componentes Criados:
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/ResetPasswordPage.tsx`

### 2. Melhorias Mobile

#### Responsividade Aprimorada:
- **Login e Cadastro** ocupam 100% da altura da tela
- **Padding lateral** em dispositivos móveis (`px-4`)
- **Campos maiores** (`h-12`) para melhor usabilidade touch
- **Layout centralizado** verticalmente em todas as telas
- **Compatibilidade** com iPhone SE (320px) e Android (360px)

#### Melhorias Visuais:
- Botões com altura aumentada para touch
- Espaçamento otimizado para telas pequenas
- Cards responsivos que se adaptam ao tamanho da tela

## 🛠️ Instalação e Uso

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📱 Testes Mobile

Para testar a responsividade:

1. Abra o DevTools do navegador (F12)
2. Ative o modo responsivo (Ctrl+Shift+M)
3. Teste com diferentes tamanhos:
   - iPhone SE (375x667)
   - iPhone 12 (390x844)
   - Samsung Galaxy S20 (360x800)

## 🔗 Rotas Disponíveis

### Públicas (sem autenticação):
- `/login` - Tela de login
- `/cadastro` - Tela de cadastro
- `/forgot-password` - Recuperação de senha
- `/reset-password` - Redefinir senha

### Protegidas (requer autenticação):
- `/dashboard` - Dashboard principal
- `/bet` - Página de apostas
- `/historia` - Histórico
- `/afiliados` - Programa de afiliados
- `/transacoes` - Transações
- `/configuracoes` - Configurações
- `/ordens` - Ordens
- `/admin` - Painel administrativo

## 🎨 Design System

### Cores Principais:
- **Dourado**: `#FFD700` (botões, links, marca)
- **Fundo escuro**: `#1e1e1e` (background principal)
- **Cards**: `#2a2a2a` (background dos cards)
- **Inputs**: `#3a3a3a` (background dos campos)
- **Texto**: Branco e tons de cinza

### Componentes UI:
- Utiliza shadcn/ui components
- Cards responsivos
- Inputs com estados de foco
- Botões com hover effects
- Mensagens de erro/sucesso

## 🔧 Integração Backend

### Endpoints Necessários (a implementar):
```typescript
// Recuperação de senha
POST /api/auth/forgot-password
{
  "email": "usuario@email.com"
}

// Redefinir senha
POST /api/auth/reset-password
{
  "token": "TOKEN_DO_EMAIL",
  "password": "nova_senha",
  "confirmPassword": "nova_senha"
}
```

### Configuração API:
- Configure `VITE_API_URL` no arquivo `.env`
- Para desenvolvimento: `http://localhost:3001/api`
- Para produção: `https://www.betforbes.com/api`

## 📋 TODO Backend

Para completar a funcionalidade de recuperação de senha, implemente no backend:

1. **Endpoint de solicitação**: Gerar token e enviar email
2. **Endpoint de redefinição**: Validar token e atualizar senha
3. **Validação de token**: Verificar expiração e validade
4. **Envio de email**: Template de recuperação de senha

## 🚀 Deploy

O frontend está pronto para deploy. Certifique-se de:

1. Configurar `VITE_API_URL` para produção
2. Executar `npm run build`
3. Servir os arquivos da pasta `dist/`
4. Configurar redirecionamentos SPA no servidor

## 📱 Compatibilidade

- ✅ Chrome/Edge (últimas versões)
- ✅ Firefox (últimas versões)  
- ✅ Safari (iOS 12+)
- ✅ Chrome Mobile (Android 8+)
- ✅ Responsivo (320px - 1920px+)

