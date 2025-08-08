# Checklist Forense - BetForbes

## 1. Autenticação e Cadastro
- [ ] Página de Login (`/login`)
  - [ ] Formulário com validações
  - [ ] Feedback de erro/sucesso
  - [ ] Redirecionamento após login
  - [ ] Link para cadastro
- [ ] Página de Cadastro (`/cadastro`)
  - [ ] Formulário com validações
  - [ ] Feedback de erro/sucesso
  - [ ] Redirecionamento após cadastro
  - [ ] Link para login
- [ ] Autenticação persistente
  - [ ] Token armazenado corretamente
  - [ ] Rotas protegidas
  - [ ] Redirecionamento para login quando não autenticado

## 2. Dashboard Premium
- [ ] Header
  - [ ] Avatar com inicial do usuário
  - [ ] Logo centralizado
  - [ ] Ícone de notificações com contador
- [ ] Saldo e P&L
  - [ ] Exibição de saldo disponível
  - [ ] Exibição de P&L com cor semântica (verde/vermelho)
  - [ ] Botão "Depositar" abre modal correto
  - [ ] Botão "Sacar" abre modal correto
- [ ] Cards de Resumo
  - [ ] Total Apostado
  - [ ] Total de Vitórias
  - [ ] Taxa de Vitória com gráfico circular
- [ ] Ações Rápidas
  - [ ] Botão "Nova Aposta" navega para `/bet`
  - [ ] Botão "Histórico" navega para `/historia`
  - [ ] Botão "Ordens" navega para `/ordens`
  - [ ] Botão "Convidar Amigos" abre modal

## 3. Depósito e Saque
- [ ] Modal de Depósito
  - [ ] Tab PIX
    - [ ] Exibição da chave PIX
    - [ ] Botão para copiar chave
    - [ ] Campo para anexar comprovante
    - [ ] Feedback de sucesso/erro
  - [ ] Tab USDC
    - [ ] Exibição do QR Code
    - [ ] Exibição do endereço da carteira
    - [ ] Botão para copiar endereço
    - [ ] Alertas e instruções
    - [ ] Feedback de sucesso/erro
- [ ] Modal de Saque
  - [ ] Tab PIX
    - [ ] Campo para valor
    - [ ] Campo para chave PIX de destino
    - [ ] Exibição de saldo disponível
    - [ ] Cálculo de taxas
    - [ ] Validações (saldo, formato)
    - [ ] Feedback de sucesso/erro
  - [ ] Tab USDC
    - [ ] Campo para valor
    - [ ] Campo para endereço de destino
    - [ ] Exibição de saldo disponível
    - [ ] Cálculo de taxas
    - [ ] Validações (saldo, formato de endereço)
    - [ ] Feedback de sucesso/erro

## 4. Apostas
- [ ] Página de Apostas (`/bet`)
  - [ ] Dropdown de seleção de ativo com busca
  - [ ] Card detalhado do ativo selecionado
    - [ ] Preço atual e variação
    - [ ] Volume negociado
    - [ ] Mini gráfico interativo
    - [ ] Livro de ordens
  - [ ] Campo de valor da aposta
    - [ ] Input numérico
    - [ ] Botões rápidos (10%, 25%, 50%, 100%)
    - [ ] Validação de saldo
  - [ ] Slider de alavancagem
    - [ ] Range de 1x a 50x
    - [ ] Botões + e - para ajuste
    - [ ] Indicador visual de risco
  - [ ] Seleção de tipo de ordem
    - [ ] Ordem a mercado
    - [ ] Ordem limitada com campo de preço alvo
  - [ ] Botões de direção
    - [ ] COMPRAR (LONG) em verde
    - [ ] VENDER (SHORT) em vermelho
  - [ ] Resumo da aposta
    - [ ] Cálculo automático de ganho/perda potencial
    - [ ] Exibição de taxas
  - [ ] Modal de confirmação
    - [ ] Resumo completo
    - [ ] Botões cancelar/confirmar
    - [ ] Feedback de sucesso/erro

## 5. Ordens
- [ ] Página de Ordens (`/ordens`)
  - [ ] Listagem de ordens em aberto
    - [ ] Ativo negociado
    - [ ] Direção (LONG/SHORT)
    - [ ] Valor alocado
    - [ ] Alavancagem
    - [ ] Preço de entrada
    - [ ] Preço atual (atualização em tempo real)
    - [ ] P&L ao vivo (valor e percentual)
    - [ ] Data/hora de abertura
  - [ ] Filtros
    - [ ] Por ativo
    - [ ] Por direção
  - [ ] Botão "Fechar Ordem" para cada ordem
    - [ ] Confirmação de fechamento
    - [ ] Feedback de sucesso/erro
  - [ ] Layout responsivo
    - [ ] Tabela no desktop
    - [ ] Cards no mobile

## 6. Histórico
- [ ] Página de Histórico (`/historia`)
  - [ ] Resumo estatístico no topo
    - [ ] Total apostado
    - [ ] Resultado
    - [ ] Taxa de vitória
  - [ ] Filtros
    - [ ] Por ativo
    - [ ] Por período
    - [ ] Por resultado
    - [ ] Por status
    - [ ] Busca
  - [ ] Listagem de apostas
    - [ ] Tabela responsiva (desktop)
    - [ ] Cards empilhados (mobile)
  - [ ] Modal de detalhes
    - [ ] Informações completas de cada aposta
    - [ ] Botão de fechar

## 7. Transações
- [ ] Página de Transações (`/transacoes`)
  - [ ] Resumo do mês
    - [ ] Entradas
    - [ ] Saídas
    - [ ] Saldo
  - [ ] Filtros
    - [ ] Todas
    - [ ] Depósitos
    - [ ] Saques
    - [ ] Apostas
    - [ ] Ganhos
    - [ ] Comissões
  - [ ] Histórico detalhado
    - [ ] Ícones e status coloridos
    - [ ] Data e hora
    - [ ] Valor
    - [ ] Tipo
  - [ ] Botões de ação
    - [ ] Fazer Depósito
    - [ ] Solicitar Saque

## 8. Configurações
- [ ] Página de Configurações (`/configuracoes`)
  - [ ] Perfil
    - [ ] Editar Perfil (modal)
    - [ ] Alterar Senha (modal)
    - [ ] Verificação KYC (modal)
  - [ ] Segurança
    - [ ] Autenticação 2FA (toggle e modal)
    - [ ] Sessões Ativas (modal)
    - [ ] Backup da Conta (modal)
  - [ ] Notificações
    - [ ] Notificações Push (toggle)
    - [ ] Alertas por Email (toggle)
    - [ ] Preferências (modal)
  - [ ] Financeiro
    - [ ] Métodos de Pagamento (modal)
    - [ ] Limites de Transação (modal)
    - [ ] Relatório Fiscal (modal)
  - [ ] Suporte
    - [ ] Central de Ajuda (modal)
    - [ ] Falar com Suporte (modal)
    - [ ] Enviar Feedback (modal)
  - [ ] Informações do App
    - [ ] Versão
    - [ ] Build
    - [ ] Última atualização
  - [ ] Botão de Logout

## 9. Afiliados
- [ ] Página de Afiliados (`/afiliados`)
  - [ ] Estatísticas principais
    - [ ] Número de afiliados ativos
    - [ ] Comissões acumuladas
  - [ ] Lista de afiliados
    - [ ] Nome/ID
    - [ ] Status
    - [ ] Volume gerado
    - [ ] Comissão
  - [ ] Performance geral
    - [ ] Volume total
    - [ ] Taxa de comissão
  - [ ] Seção "Como Funciona"
  - [ ] Botão para convidar novos afiliados

## 10. Navegação e Layout
- [ ] Bottom Navigation
  - [ ] Início (navega para `/`)
  - [ ] Transações (navega para `/transacoes`)
  - [ ] Configurações (navega para `/configuracoes`)
  - [ ] Afiliados (navega para `/afiliados`)
- [ ] Botões de voltar
  - [ ] Navegação correta para página anterior
- [ ] Responsividade
  - [ ] Layout adaptativo para desktop
  - [ ] Layout adaptativo para mobile
  - [ ] Elementos touch-friendly no mobile
- [ ] Feedback visual
  - [ ] Mensagens de sucesso (verde)
  - [ ] Mensagens de erro (vermelho)
  - [ ] Estados de carregamento
  - [ ] Animações e transições

## 11. Preparação para Backend
- [ ] Estrutura para integração com APIs
  - [ ] Hooks e serviços preparados
  - [ ] Mocks consistentes
  - [ ] Simulação de latência
  - [ ] Tratamento de erros
- [ ] Persistência de dados
  - [ ] LocalStorage utilizado corretamente
  - [ ] Estados globais gerenciados adequadamente
