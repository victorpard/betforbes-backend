import React, { useState } from 'react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedData, setSelectedData] = useState({
    profile: true,
    transactions: true,
    bets: true,
    settings: true,
    affiliates: false
  });

  const handleBackup = async () => {
    setLoading(true);
    
    // Simular processo de backup
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simular download do arquivo
    const backupData = {
      timestamp: new Date().toISOString(),
      user: {
        name: 'Usuário',
        email: 'usuario@email.com',
        memberSince: '2024-01-15'
      },
      data: selectedData,
      summary: {
        totalBets: 45,
        totalTransactions: 23,
        affiliates: 2
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `betforbes-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccess(true);
    setLoading(false);
    
    setTimeout(() => {
      setSuccess(false);
      setStep(1);
      onClose();
    }, 3000);
  };

  const dataTypes = [
    {
      key: 'profile',
      label: 'Dados do Perfil',
      description: 'Nome, email, configurações pessoais',
      icon: '👤',
      size: '2.1 KB'
    },
    {
      key: 'transactions',
      label: 'Histórico de Transações',
      description: 'Depósitos, saques e transferências',
      icon: '💳',
      size: '15.7 KB'
    },
    {
      key: 'bets',
      label: 'Histórico de Apostas',
      description: 'Todas as apostas realizadas',
      icon: '🎯',
      size: '28.3 KB'
    },
    {
      key: 'settings',
      label: 'Configurações',
      description: 'Preferências e configurações de segurança',
      icon: '⚙️',
      size: '1.8 KB'
    },
    {
      key: 'affiliates',
      label: 'Dados de Afiliados',
      description: 'Informações sobre indicações e comissões',
      icon: '👥',
      size: '5.2 KB'
    }
  ];

  const selectedCount = Object.values(selectedData).filter(Boolean).length;
  const totalSize = dataTypes
    .filter(type => selectedData[type.key as keyof typeof selectedData])
    .reduce((total, type) => total + parseFloat(type.size), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#FFD700]">💾 Backup da Conta</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-[#27c93f] text-lg font-semibold">Backup criado com sucesso!</p>
            <p className="text-gray-400 text-sm mt-2">O arquivo foi baixado para seu dispositivo</p>
            <div className="bg-[#1e1e1e] rounded-lg p-3 mt-4">
              <p className="text-gray-400 text-xs">Arquivo:</p>
              <p className="text-white text-sm font-mono">betforbes-backup-{new Date().toISOString().split('T')[0]}.json</p>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700] border-t-transparent mx-auto mb-4"></div>
            <p className="text-[#FFD700] text-lg font-semibold">Criando backup...</p>
            <p className="text-gray-400 text-sm mt-2">Coletando e compactando seus dados</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
              <div className="bg-[#FFD700] h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="text-lg font-semibold text-white">Selecione os Dados</h3>
              <p className="text-gray-400 text-sm">Escolha quais informações incluir no backup</p>
            </div>

            <div className="space-y-3">
              {dataTypes.map((type) => (
                <div 
                  key={type.key}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedData[type.key as keyof typeof selectedData]
                      ? 'border-[#FFD700] bg-[#FFD700] bg-opacity-10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedData(prev => ({ 
                    ...prev, 
                    [type.key]: !prev[type.key as keyof typeof selectedData] 
                  }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{type.icon}</span>
                      <div>
                        <h4 className="text-white font-semibold">{type.label}</h4>
                        <p className="text-gray-400 text-sm">{type.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedData[type.key as keyof typeof selectedData]
                          ? 'border-[#FFD700] bg-[#FFD700]'
                          : 'border-gray-500'
                      }`}>
                        {selectedData[type.key as keyof typeof selectedData] && (
                          <span className="text-black text-xs">✓</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{type.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="bg-[#1e1e1e] rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Itens Selecionados</p>
                  <p className="text-white text-lg font-semibold">{selectedCount} de {dataTypes.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tamanho Total</p>
                  <p className="text-[#FFD700] text-lg font-semibold">{totalSize.toFixed(1)} KB</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedCount === 0}
              className="w-full bg-[#FFD700] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar ({selectedCount} itens)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="text-lg font-semibold text-white">Confirmar Backup</h3>
              <p className="text-gray-400 text-sm">Revise as informações antes de prosseguir</p>
            </div>

            {/* Resumo Final */}
            <div className="bg-[#1e1e1e] rounded-lg p-4 space-y-3">
              <h4 className="text-white font-semibold">📦 Conteúdo do Backup:</h4>
              {dataTypes
                .filter(type => selectedData[type.key as keyof typeof selectedData])
                .map(type => (
                  <div key={type.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span className="text-gray-300 text-sm">{type.label}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{type.size}</span>
                  </div>
                ))}
              
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-[#FFD700] font-semibold">{totalSize.toFixed(1)} KB</span>
                </div>
              </div>
            </div>

            {/* Aviso de Segurança */}
            <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-3">
              <h4 className="text-blue-400 font-semibold mb-2">🔐 Informações Importantes:</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• O backup será baixado como arquivo JSON</li>
                <li>• Mantenha o arquivo em local seguro</li>
                <li>• Não compartilhe o backup com terceiros</li>
                <li>• Use para restaurar dados em caso de necessidade</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleBackup}
                className="flex-1 bg-[#27c93f] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Criar Backup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupModal;

