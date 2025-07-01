import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definir tipos para os idiomas disponíveis
export type Language = 'pt-BR' | 'en-US';

// Definir tipo para o contexto
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Criar o contexto com valor padrão para evitar erro de undefined
const defaultContextValue: LanguageContextType = {
  language: 'pt-BR',
  setLanguage: () => {},
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

// Traduções
const translations = {
  'pt-BR': {
    // Geral
    'app.name': 'BetForbes',
    'back': 'Voltar',
    'save': 'Salvar',
    'cancel': 'Cancelar',
    'confirm': 'Confirmar',
    'close': 'Fechar',
    'success': 'Sucesso',
    'error': 'Erro',
    'loading': 'Carregando',
    'required': 'Obrigatório',
    
    // Navegação
    'nav.home': 'Início',
    'nav.bet': 'Apostar',
    'nav.orders': 'Ordens',
    'nav.transactions': 'Transações',
    'nav.settings': 'Configurações',
    
    // Autenticação
    'auth.login': 'Entrar',
    'auth.register': 'Cadastrar',
    'auth.logout': 'Sair da Conta',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    
    // Dashboard
    'dashboard.welcome': 'Bem-vindo de volta',
    'dashboard.balance': 'Saldo',
    'dashboard.deposit': 'Depositar',
    'dashboard.withdraw': 'Sacar',
    'dashboard.bet': 'Apostar',
    'dashboard.orders': 'Ordens',
    
    // Depósito
    'deposit.title': 'Depositar',
    'deposit.amount': 'Valor do Depósito',
    'deposit.continue': 'Continuar',
    'deposit.pix': 'PIX',
    'deposit.usdc': 'USDC',
    'deposit.pixKey': 'Chave PIX',
    'deposit.usdcAddress': 'Endereço USDC (Ethereum)',
    'deposit.attachment': 'Anexar Comprovante (opcional)',
    'deposit.selectFile': 'Selecionar arquivo',
    'deposit.confirm': 'Confirmar Depósito',
    'deposit.success': 'Depósito registrado com sucesso!',
    'deposit.updateBalance': 'Seu saldo será atualizado após a confirmação.',
    'deposit.pixInfo': 'Após realizar o PIX, seu saldo será atualizado automaticamente em até 5 minutos.',
    'deposit.usdcInfo': 'Após confirmação na blockchain, seu saldo será atualizado em até 15 minutos.',
    'deposit.usdcWarning': 'Atenção:',
    'deposit.usdcWarning1': 'Envie apenas USDC para este endereço',
    'deposit.usdcWarning2': 'Utilize a rede Ethereum',
    'deposit.usdcWarning3': 'Envios em outras redes podem resultar em perda de fundos',
    'deposit.amountError': 'Por favor, insira um valor maior que zero',
    'deposit.understood': 'Entendi',
    
    // Saque
    'withdraw.title': 'Sacar',
    'withdraw.amount': 'Valor do Saque',
    'withdraw.pixKey': 'Chave PIX de Destino',
    'withdraw.usdcAddress': 'Endereço USDC de Destino',
    'withdraw.receiverName': 'Nome do Recebedor',
    'withdraw.availableBalance': 'Saldo disponível',
    'withdraw.requestedAmount': 'Valor solicitado',
    'withdraw.fee': 'Taxa',
    'withdraw.receiveAmount': 'Valor a receber',
    'withdraw.confirm': 'Solicitar Saque',
    'withdraw.success': 'Solicitação de saque enviada!',
    'withdraw.successInfo': 'Você receberá uma confirmação em breve.',
    'withdraw.pixInfo': 'Saques PIX são processados em até 1 hora útil.',
    'withdraw.usdcInfo': 'Saques USDC são processados em até 24 horas.',
    'withdraw.amountError': 'Informe o valor do saque',
    'withdraw.amountZeroError': 'O valor deve ser maior que zero',
    'withdraw.insufficientBalance': 'Saldo insuficiente para este saque',
    'withdraw.destinationError.pix': 'Informe a chave PIX de destino',
    'withdraw.destinationError.usdc': 'Informe o endereço USDC de destino',
    'withdraw.usdcAddressError': 'Endereço USDC inválido. Deve começar com 0x',
    'withdraw.receiverNameError': 'Informe o nome do recebedor',
    
    // Configurações
    'settings.title': 'Configurações',
    'settings.account': 'Conta',
    'settings.security': 'Segurança',
    'settings.notifications': 'Notificações',
    'settings.financial': 'Financeiro',
    'settings.support': 'Suporte',
    'settings.language': 'Idioma',
    'settings.language.pt': 'Português',
    'settings.language.en': 'English',
    'settings.editProfile': 'Editar Perfil',
    'settings.changePassword': 'Alterar Senha',
    'settings.kyc': 'Verificação KYC',
    'settings.2fa': 'Autenticação 2FA',
    'settings.activeSessions': 'Sessões Ativas',
    'settings.backup': 'Backup da Conta',
    'settings.pushNotifications': 'Notificações Push',
    'settings.emailAlerts': 'Alertas por Email',
    'settings.preferences': 'Preferências',
    'settings.paymentMethods': 'Métodos de Pagamento',
    'settings.transactionLimits': 'Limites de Transação',
    'settings.fiscalReport': 'Relatório Fiscal',
    'settings.helpCenter': 'Central de Ajuda',
    'settings.contactSupport': 'Falar com Suporte',
    'settings.sendFeedback': 'Enviar Feedback',
    'settings.about': 'Sobre o App',
    'settings.version': 'Versão',
    'settings.build': 'Build',
    'settings.lastUpdate': 'Última Atualização',
    'settings.member': 'Membro Premium',
    'settings.error': 'Erro ao carregar configurações',
    'settings.tryAgain': 'Tentar novamente',
  },
  'en-US': {
    // General
    'app.name': 'BetForbes',
    'back': 'Back',
    'save': 'Save',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'close': 'Close',
    'success': 'Success',
    'error': 'Error',
    'loading': 'Loading',
    'required': 'Required',
    
    // Navigation
    'nav.home': 'Home',
    'nav.bet': 'Bet',
    'nav.orders': 'Orders',
    'nav.transactions': 'Transactions',
    'nav.settings': 'Settings',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.balance': 'Balance',
    'dashboard.deposit': 'Deposit',
    'dashboard.withdraw': 'Withdraw',
    'dashboard.bet': 'Bet',
    'dashboard.orders': 'Orders',
    
    // Deposit
    'deposit.title': 'Deposit',
    'deposit.amount': 'Deposit Amount',
    'deposit.continue': 'Continue',
    'deposit.pix': 'PIX',
    'deposit.usdc': 'USDC',
    'deposit.pixKey': 'PIX Key',
    'deposit.usdcAddress': 'USDC Address (Ethereum)',
    'deposit.attachment': 'Attach Receipt (optional)',
    'deposit.selectFile': 'Select file',
    'deposit.confirm': 'Confirm Deposit',
    'deposit.success': 'Deposit successfully registered!',
    'deposit.updateBalance': 'Your balance will be updated after confirmation.',
    'deposit.pixInfo': 'After making the PIX, your balance will be automatically updated within 5 minutes.',
    'deposit.usdcInfo': 'After blockchain confirmation, your balance will be updated within 15 minutes.',
    'deposit.usdcWarning': 'Warning:',
    'deposit.usdcWarning1': 'Send only USDC to this address',
    'deposit.usdcWarning2': 'Use the Ethereum network',
    'deposit.usdcWarning3': 'Sending on other networks may result in loss of funds',
    'deposit.amountError': 'Please enter an amount greater than zero',
    'deposit.understood': 'Understood',
    
    // Withdraw
    'withdraw.title': 'Withdraw',
    'withdraw.amount': 'Withdrawal Amount',
    'withdraw.pixKey': 'Destination PIX Key',
    'withdraw.usdcAddress': 'Destination USDC Address',
    'withdraw.receiverName': 'Receiver Name',
    'withdraw.availableBalance': 'Available balance',
    'withdraw.requestedAmount': 'Requested amount',
    'withdraw.fee': 'Fee',
    'withdraw.receiveAmount': 'Amount to receive',
    'withdraw.confirm': 'Request Withdrawal',
    'withdraw.success': 'Withdrawal request sent!',
    'withdraw.successInfo': 'You will receive a confirmation soon.',
    'withdraw.pixInfo': 'PIX withdrawals are processed within 1 business hour.',
    'withdraw.usdcInfo': 'USDC withdrawals are processed within 24 hours.',
    'withdraw.amountError': 'Enter the withdrawal amount',
    'withdraw.amountZeroError': 'Amount must be greater than zero',
    'withdraw.insufficientBalance': 'Insufficient balance for this withdrawal',
    'withdraw.destinationError.pix': 'Enter the destination PIX key',
    'withdraw.destinationError.usdc': 'Enter the destination USDC address',
    'withdraw.usdcAddressError': 'Invalid USDC address. Must start with 0x',
    'withdraw.receiverNameError': 'Enter the receiver name',
    
    // Settings
    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    'settings.financial': 'Financial',
    'settings.support': 'Support',
    'settings.language': 'Language',
    'settings.language.pt': 'Português',
    'settings.language.en': 'English',
    'settings.editProfile': 'Edit Profile',
    'settings.changePassword': 'Change Password',
    'settings.kyc': 'KYC Verification',
    'settings.2fa': '2FA Authentication',
    'settings.activeSessions': 'Active Sessions',
    'settings.backup': 'Account Backup',
    'settings.pushNotifications': 'Push Notifications',
    'settings.emailAlerts': 'Email Alerts',
    'settings.preferences': 'Preferences',
    'settings.paymentMethods': 'Payment Methods',
    'settings.transactionLimits': 'Transaction Limits',
    'settings.fiscalReport': 'Tax Report',
    'settings.helpCenter': 'Help Center',
    'settings.contactSupport': 'Contact Support',
    'settings.sendFeedback': 'Send Feedback',
    'settings.about': 'About the App',
    'settings.version': 'Version',
    'settings.build': 'Build',
    'settings.lastUpdate': 'Last Update',
    'settings.member': 'Premium Member',
    'settings.error': 'Error loading settings',
    'settings.tryAgain': 'Try again',
  }
};

// Persistência do idioma no localStorage
const getStoredLanguage = (): Language => {
  try {
    const storedLanguage = localStorage.getItem('betforbes_language');
    return (storedLanguage === 'pt-BR' || storedLanguage === 'en-US') 
      ? storedLanguage 
      : 'pt-BR';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return 'pt-BR';
  }
};

// Provedor do contexto
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage());

  // Função para mudar o idioma e salvar no localStorage
  const setLanguage = (lang: Language) => {
    try {
      localStorage.setItem('betforbes_language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
      setLanguageState(lang);
    }
  };

  // Função para traduzir textos com fallback seguro
  const t = (key: string): string => {
    try {
      const currentTranslations = translations[language] || translations['pt-BR'];
      return currentTranslations[key as keyof typeof currentTranslations] || key;
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook para usar o contexto com tratamento de erro
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  return context;
};
