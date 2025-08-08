import React, { useState } from 'react';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [preferences, setPreferences] = useState({
    // Apostas
    betPlaced: { push: true, email: false },
    betWon: { push: true, email: true },
    betLost: { push: false, email: false },
    
    // Financeiro
    deposit: { push: true, email: true },
    withdrawal: { push: true, email: true },
    lowBalance: { push: true, email: false },
    
    // Segurança
    login: { push: false, email: true },
    passwordChange: { push: true, email: true },
    suspiciousActivity: { push: true, email: true },
    
    // Afiliados
    newAffiliate: { push: true, email: false },
    affiliateEarning: { push: false, email: true },
    
    // Marketing
    promotions: { push: false, email: false },
    newsletter: { push: false, email: true },
    updates: { push: true, email: false }
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSuccess(true);
    setLoading(false);
    
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
  };

  const updatePreference = (key: string, type: 'push' | 'email', value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof typeof prev],
        [type]: value
      }
    }));
  };

  const notificationGroups = [
    {
      title: 'Apostas',
      icon: '🎯',
      items: [
        { key: 'betPlaced', label: 'Aposta Realizada', description: 'Quando você faz uma nova aposta' },
        { key: 'betWon', label: 'Aposta Ganha', description: 'Quando você ganha uma aposta' },
        { key: 'betLost', label: 'Aposta Perdida', description: 'Quando você perde uma aposta' }
      ]
    },
    {
      title: 'Financeiro',
      icon: '💰',
      items: [
        { key: 'deposit', label: 'Depósito', description: 'Confirmação de depósitos' },
        { key: 'withdrawal', label: 'Saque', description: 'Status de saques' },
        { key: 'lowBalance', label: 'Saldo Baixo', description: 'Quando seu saldo está baixo' }
      ]
    },
    {
      title: 'Segurança',
      icon: '🔒',
      items: [
        { key: 'login', label: 'Novo Login', description: 'Login em novo dispositivo' },
        { key: 'passwordChange', label: 'Senha Alterada', description: 'Confirmação de mudança de senha' },
        { key: 'suspiciousActivity', label: 'Atividade Suspeita', description: 'Tentativas de acesso suspeitas' }
      ]
    },
    {
      title: 'Afiliados',
      icon: '👥',
      items: [
        { key: 'newAffiliate', label: 'Novo Afiliado', description: 'Quando alguém usa seu link' },
        { key: 'affiliateEarning', label: 'Comissão Recebida', description: 'Ganhos de afiliados' }
      ]
    },
    {
      title: 'Marketing',
      icon: '📢',
      items: [
        { key: 'promotions', label: 'Promoções', description: 'Ofertas especiais e bônus' },
        { key: 'newsletter', label: 'Newsletter', description: 'Boletim informativo semanal' },
        { key: 'updates', label: 'Atualizações', description: 'Novidades da plataforma' }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#FFD700]">🔔 Preferências de Notificação</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-[#27c93f] text-lg font-semibold">Preferências salvas com sucesso!</p>
            <p className="text-gray-400 text-sm mt-2">Suas configurações foram atualizadas</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header da Tabela */}
            <div className="grid grid-cols-12 gap-4 pb-2 border-b border-gray-600">
              <div className="col-span-6">
                <h3 className="text-white font-semibold">Tipo de Notificação</h3>
              </div>
              <div className="col-span-3 text-center">
                <h3 className="text-white font-semibold">📱 Push</h3>
              </div>
              <div className="col-span-3 text-center">
                <h3 className="text-white font-semibold">📧 Email</h3>
              </div>
            </div>

            {/* Grupos de Notificações */}
            {notificationGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h4 className="text-[#FFD700] font-semibold flex items-center gap-2">
                  <span>{group.icon}</span>
                  {group.title}
                </h4>
                
                {group.items.map((item) => (
                  <div key={item.key} className="grid grid-cols-12 gap-4 items-center py-2 hover:bg-[#1e1e1e] rounded-lg px-2">
                    <div className="col-span-6">
                      <h5 className="text-white font-medium">{item.label}</h5>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                    
                    <div className="col-span-3 flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[item.key as keyof typeof preferences]?.push || false}
                          onChange={(e) => updatePreference(item.key, 'push', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27c93f]"></div>
                      </label>
                    </div>
                    
                    <div className="col-span-3 flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[item.key as keyof typeof preferences]?.email || false}
                          onChange={(e) => updatePreference(item.key, 'email', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27c93f]"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Informações Adicionais */}
            <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">💡 Informações Importantes:</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Notificações push aparecem no seu dispositivo em tempo real</li>
                <li>• Emails são enviados para: usuario@email.com</li>
                <li>• Você pode alterar essas configurações a qualquer momento</li>
                <li>• Notificações de segurança são sempre enviadas por email</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-[#FFD700] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                ) : (
                  'Salvar Preferências'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferencesModal;

