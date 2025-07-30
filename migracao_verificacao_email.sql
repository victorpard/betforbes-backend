-- ========================================
-- MIGRAÇÃO: ADICIONAR CAMPOS DE VERIFICAÇÃO DE EMAIL
-- ========================================

-- 1. Adicionar campos necessários para verificação de email
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "verificationToken" TEXT,
ADD COLUMN IF NOT EXISTS "tokenExpiry" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

-- 2. Criar índice para otimizar busca por token
CREATE INDEX IF NOT EXISTS "users_verificationToken_idx" ON users("verificationToken");

-- 3. Para usuários existentes que já estão funcionando (como Victor), marcar como verificados
UPDATE users 
SET "isVerified" = true, 
    "emailVerifiedAt" = CURRENT_TIMESTAMP
WHERE email = 'vpardo737@gmail.com' AND "isVerified" = false;

-- 4. Verificar resultado da migração
SELECT 
    email, 
    "isVerified", 
    "verificationToken" IS NOT NULL as has_token,
    "emailVerifiedAt"
FROM users 
ORDER BY "createdAt" DESC;
