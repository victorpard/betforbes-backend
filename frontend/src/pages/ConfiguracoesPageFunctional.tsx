import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Importar todos os modais
import EditProfileModal from '../components/modals/EditProfileModal';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import KYCModal from '../components/modals/KYCModal';
import TwoFactorModal from '../components/modals/TwoFactorModal';
import ActiveSessionsModal from '../components/modals/ActiveSessionsModal';
import BackupModal from '../components/modals/BackupModal';
import NotificationPreferencesModal from '../components/modals/NotificationPreferencesModal';
import GenericModal from '../components/modals/GenericModal';

const ConfiguracoesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados dos modais
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Estados das configurações
  const [profile, setProfile] = useState({
    name: 'Usuário',
    email: 'usuario@email.com',
    avatar: ''
  });
  
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    twoFactor: false
  });

  // Função para abrir modais
  const openModal = (modalName: string) => {
    setActiveModal(modalName);
  };

  // Função para fechar modais
  const closeModal = () => {
    setActiveModal(null);
  };

  // Função para salvar perfil
  const handleSaveProfile = (newProfile: typeof profile) => {
    setProfile(newProfile);
  };

  // Função para toggle de configurações
  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  // Função para toggle 2FA
  const handleToggle2FA = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, twoFactor: enabled }));
  };

  // Função para logout
  const handleLogout = () => {
    // Simular logout
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const settingsGroups = [
    {
      title: 'Conta',
      icon: '👤',
      items: [
        { 
          id: 'profile', 
          label: 'Editar Perfil', 
          icon: '✏️', 
          action: () => openModal('editProfile') 
        },
        { 
          id: 'password', 
          label: 'Alterar Senha', 
          icon: '🔒', 
          action: () => openModal('changePassword') 
        },
        { 
          id: 'kyc', 
          label: 'Verificação KYC', 
          icon: '✅', 
          action: () => openModal('kyc') 
        }
      ]
    },
    {
      title: 'Segurança',
      icon: '🔐',
      items: [
        { 
          id: '2fa', 
          label: 'Autenticação 2FA', 
          icon: '🛡️', 
          toggle: true,
          value: settings.twoFactor,
          onChange: () => openModal('twoFactor')
        },
        { 
          id: 'sessions', 
          label: 'Sessões Ativas', 
          icon: '📱', 
          action: () => openModal('activeSessions') 
        },
        { 
          id: 'backup', 
          label: 'Backup da Conta', 
          icon: '💾', 
          action: () => openModal('backup') 
        }
      ]
    },
    {
      title: 'Notificações',
      icon: '🔔',
      items: [
        { 
          id: 'push', 
          label: 'Notificações Push', 
          icon: '📲', 
          toggle: true,
          value: settings.notifications,
          onChange: () => handleToggle('notifications')
        },
        { 
          id: 'email', 
          label: 'Alertas por Email', 
          icon: '📧', 
          toggle: true,
          value: settings.emailAlerts,
          onChange: () => handleToggle('emailAlerts')
        },
        { 
          id: 'preferences', 
          label: 'Preferências', 
          icon: '⚙️', 
          action: () => openModal('notificationPreferences') 
        }
      ]
    },
    {
      title: 'Financeiro',
      icon: '💳',
      items: [
        { 
          id: 'payment', 
          label: 'Métodos de Pagamento', 
          icon: '💰', 
          action: () => openModal('paymentMethods') 
        },
        { 
          id: 'limits', 
          label: 'Limites de Transação', 
          icon: '📊', 
          action: () => openModal('transactionLimits') 
        },
        { 
          id: 'fiscal', 
          label: 'Relatório Fiscal', 
          icon: '📋', 
          action: () => openModal('fiscalReport') 
        }
      ]
    },
    {
      title: 'Suporte',
      icon: '🆘',
      items: [
        { 
          id: 'help', 
          label: 'Central de Ajuda', 
          icon: '❓', 
          action: () => openModal('helpCenter') 
        },
        { 
          id: 'support', 
          label: 'Falar com Suporte', 
          icon: '💬', 
          action: () => openModal('contactSupport') 
        },
        { 
          id: 'feedback', 
          label: 'Enviar Feedback', 
          icon: '📝', 
          action: () => openModal('sendFeedback') 
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      {/* Header */}
      <div className="bg-[#2a2a2a] p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-[#FFD700] text-xl hover:text-yellow-500 transition-colors"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-[#FFD700]">Configurações</h1>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Perfil do Usuário */}
        <div className="bg-[#2a2a2a] rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center text-black text-2xl font-bold">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              <p className="text-gray-400">{profile.email}</p>
              <p className="text-[#FFD700] text-sm font-semibold">Membro Premium</p>
            </div>
            <button
              onClick={() => openModal('editProfile')}
              className="text-[#FFD700] hover:text-yellow-500 transition-colors"
            >
              ✏️
            </button>
          </div>
        </div>

        {/* Grupos de Configurações */}
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3 className="text-[#FFD700] font-semibold flex items-center gap-2">
              <span>{group.icon}</span>
              {group.title}
            </h3>
            
            <div className="space-y-2">
              {group.items.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#2a2a2a] rounded-lg p-4 flex items-center justify-between hover:bg-[#333] transition-colors cursor-pointer"
                  onClick={item.action}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-white font-medium">{item.label}</span>
                  </div>
                  
                  {item.toggle ? (
                    <label 
                      className="relative inline-flex items-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onChange?.();
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.value || false}
                        onChange={() => {}}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27c93f]"></div>
                    </label>
                  ) : (
                    <span className="text-gray-400">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Informações do App */}
        <div className="bg-[#2a2a2a] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Sobre o App</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Versão:</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Build:</span>
              <span className="text-white">2024.06.10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Última Atualização:</span>
              <span className="text-white">10/06/2024</span>
            </div>
          </div>
        </div>

        {/* Botão Sair */}
        <button
          onClick={handleLogout}
          className="w-full bg-[#e74c3c] text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          🚪 Sair da Conta
        </button>
      </div>

      {/* Modais */}
      <EditProfileModal
        isOpen={activeModal === 'editProfile'}
        onClose={closeModal}
        currentProfile={profile}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        isOpen={activeModal === 'changePassword'}
        onClose={closeModal}
      />

      <KYCModal
        isOpen={activeModal === 'kyc'}
        onClose={closeModal}
      />

      <TwoFactorModal
        isOpen={activeModal === 'twoFactor'}
        onClose={closeModal}
        isEnabled={settings.twoFactor}
        onToggle={handleToggle2FA}
      />

      <ActiveSessionsModal
        isOpen={activeModal === 'activeSessions'}
        onClose={closeModal}
      />

      <BackupModal
        isOpen={activeModal === 'backup'}
        onClose={closeModal}
      />

      <NotificationPreferencesModal
        isOpen={activeModal === 'notificationPreferences'}
        onClose={closeModal}
      />

      {/* Modais Genéricos para Funcionalidades em Desenvolvimento */}
      <GenericModal
        isOpen={activeModal === 'paymentMethods'}
        onClose={closeModal}
        title="Métodos de Pagamento"
        icon="💰"
        content={{
          type: 'development',
          message: 'Funcionalidade em desenvolvimento',
          details: [
            'Adicionar cartões de crédito/débito',
            'Configurar PIX e transferências',
            'Gerenciar carteiras digitais',
            'Histórico de métodos utilizados'
          ]
        }}
      />

      <GenericModal
        isOpen={activeModal === 'transactionLimits'}
        onClose={closeModal}
        title="Limites de Transação"
        icon="📊"
        content={{
          type: 'development',
          message: 'Funcionalidade em desenvolvimento',
          details: [
            'Definir limites diários de depósito',
            'Configurar limites de saque',
            'Limites por tipo de transação',
            'Histórico de alterações'
          ]
        }}
      />

      <GenericModal
        isOpen={activeModal === 'fiscalReport'}
        onClose={closeModal}
        title="Relatório Fiscal"
        icon="📋"
        content={{
          type: 'development',
          message: 'Funcionalidade em desenvolvimento',
          details: [
            'Relatório anual para IR',
            'Comprovantes de ganhos/perdas',
            'Exportação em PDF',
            'Histórico de declarações'
          ]
        }}
      />

      <GenericModal
        isOpen={activeModal === 'helpCenter'}
        onClose={closeModal}
        title="Central de Ajuda"
        icon="❓"
        content={{
          type: 'info',
          message: 'Acesse nossa base de conhecimento',
          details: [
            'FAQ - Perguntas frequentes',
            'Tutoriais em vídeo',
            'Guias passo a passo',
            'Contato direto com suporte'
          ]
        }}
      />

      <GenericModal
        isOpen={activeModal === 'contactSupport'}
        onClose={closeModal}
        title="Falar com Suporte"
        icon="💬"
        content={{
          type: 'info',
          message: 'Entre em contato conosco',
          details: [
            'Chat ao vivo: 24/7',
            'Email: suporte@betforbes.com',
            'WhatsApp: (11) 99999-9999',
            'Tempo médio de resposta: 2 horas'
          ]
        }}
      />

      <GenericModal
        isOpen={activeModal === 'sendFeedback'}
        onClose={closeModal}
        title="Enviar Feedback"
        icon="📝"
        content={{
          type: 'development',
          message: 'Funcionalidade em desenvolvimento',
          details: [
            'Avaliar experiência do usuário',
            'Sugerir melhorias',
            'Reportar bugs',
            'Acompanhar status do feedback'
          ]
        }}
      />
    </div>
  );
};

export default ConfiguracoesPage;

