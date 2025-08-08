import React, { useState } from 'react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: string;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ 
  isOpen, 
  onClose,
  availableBalance = "R$ 12.700,00"
}) => {
  const [activeTab, setActiveTab] = useState<'pix' | 'usdc'>('pix');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    destination?: string;
    receiverName?: string;
  }>({});

  // Taxa simulada
  const fee = activeTab === 'pix' ? 0.01 : 0.02; // 1% para PIX, 2% para USDC
  
  const calculateFee = () => {
    if (!amount) return '0,00';
    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    return (numericAmount * fee).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const calculateTotal = () => {
    if (!amount) return '0,00';
    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    const feeAmount = numericAmount * fee;
    return (numericAmount - feeAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir apenas números e vírgula/ponto
    const value = e.target.value.replace(/[^\d,.]/g, '');
    setAmount(value);
    
    // Limpar erro se existir
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    
    // Limpar erro se existir
    if (errors.destination) {
      setErrors(prev => ({ ...prev, destination: undefined }));
    }
  };

  const handleReceiverNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiverName(e.target.value);
    
    // Limpar erro se existir
    if (errors.receiverName) {
      setErrors(prev => ({ ...prev, receiverName: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      amount?: string;
      destination?: string;
      receiverName?: string;
    } = {};
    
    // Validar valor
    if (!amount) {
      newErrors.amount = 'Informe o valor do saque';
    } else {
      const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
      const numericBalance = parseFloat(availableBalance.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.'));
      
      if (numericAmount <= 0) {
        newErrors.amount = 'O valor deve ser maior que zero';
      } else if (numericAmount > numericBalance) {
        newErrors.amount = 'Saldo insuficiente para este saque';
      }
    }
    
    // Validar destino
    if (!destination) {
      newErrors.destination = activeTab === 'pix' 
        ? 'Informe a chave PIX de destino' 
        : 'Informe o endereço USDC de destino';
    } else if (activeTab === 'usdc' && !destination.startsWith('0x')) {
      newErrors.destination = 'Endereço USDC inválido. Deve começar com 0x';
    }
    
    // Validar nome do recebedor (apenas para PIX)
    if (activeTab === 'pix' && !receiverName.trim()) {
      newErrors.receiverName = 'Informe o nome do recebedor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    // Simular envio para backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSuccess(true);
    setLoading(false);
    
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      setDestination('');
      setReceiverName('');
      setErrors({});
      onClose();
    }, 3000);
  };

  const handleTabChange = (tab: 'pix' | 'usdc') => {
    setActiveTab(tab);
    setErrors({});
  };

  const isFormValid = () => {
    if (activeTab === 'pix') {
      return !!amount && !!destination && !!receiverName && Object.keys(errors).length === 0;
    } else {
      return !!amount && !!destination && Object.keys(errors).length === 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#FFD700]">💸 Sacar</h2>
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
            <p className="text-[#27c93f] text-lg font-semibold">Solicitação de saque enviada!</p>
            <p className="text-gray-400 text-sm mt-2">
              Você receberá uma confirmação em breve.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex mb-6 border-b border-gray-700">
              <button
                className={`flex-1 py-2 font-medium ${activeTab === 'pix' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-400'}`}
                onClick={() => handleTabChange('pix')}
              >
                PIX
              </button>
              <button
                className={`flex-1 py-2 font-medium ${activeTab === 'usdc' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-400'}`}
                onClick={() => handleTabChange('usdc')}
              >
                USDC
              </button>
            </div>

            {/* Saldo disponível */}
            <div className="bg-[#1e1e1e] p-3 rounded-lg mb-4 flex justify-between items-center">
              <span className="text-gray-400">Saldo disponível:</span>
              <span className="text-[#FFD700] font-semibold">{availableBalance}</span>
            </div>

            <div className="space-y-4">
              {/* Valor */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Valor do Saque <span className="text-[#e74c3c]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {activeTab === 'pix' ? 'R$' : 'USDC'}
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className={`w-full bg-[#1e1e1e] border-2 ${
                      errors.amount ? 'border-[#e74c3c]' : 'border-gray-600 focus:border-[#FFD700]'
                    } rounded-lg px-3 py-2 pl-10 text-white focus:outline-none`}
                    placeholder="0,00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-[#e74c3c] text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Destino */}
              <div>
                <label className="block text-white font-medium mb-2">
                  {activeTab === 'pix' ? 'Chave PIX de Destino' : 'Endereço USDC de Destino'} <span className="text-[#e74c3c]">*</span>
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={handleDestinationChange}
                  className={`w-full bg-[#1e1e1e] border-2 ${
                    errors.destination ? 'border-[#e74c3c]' : 'border-gray-600 focus:border-[#FFD700]'
                  } rounded-lg px-3 py-2 text-white focus:outline-none`}
                  placeholder={activeTab === 'pix' ? 'CPF, e-mail, telefone ou chave aleatória' : '0x...'}
                />
                {errors.destination && (
                  <p className="text-[#e74c3c] text-sm mt-1">{errors.destination}</p>
                )}
              </div>

              {/* Nome do Recebedor (apenas para PIX) */}
              {activeTab === 'pix' && (
                <div>
                  <label className="block text-white font-medium mb-2">
                    Nome do Recebedor <span className="text-[#e74c3c]">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={handleReceiverNameChange}
                    className={`w-full bg-[#1e1e1e] border-2 ${
                      errors.receiverName ? 'border-[#e74c3c]' : 'border-gray-600 focus:border-[#FFD700]'
                    } rounded-lg px-3 py-2 text-white focus:outline-none`}
                    placeholder="Nome completo do recebedor"
                  />
                  {errors.receiverName && (
                    <p className="text-[#e74c3c] text-sm mt-1">{errors.receiverName}</p>
                  )}
                </div>
              )}

              {/* Resumo */}
              {amount && (
                <div className="bg-[#1e1e1e] p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Valor solicitado:</span>
                    <span className="text-white">
                      {activeTab === 'pix' ? 'R$ ' : ''}{amount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Taxa ({(fee * 100).toFixed(1)}%):</span>
                    <span className="text-[#e74c3c]">
                      {activeTab === 'pix' ? 'R$ ' : ''}{calculateFee()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                    <span className="text-gray-300 font-semibold">Valor a receber:</span>
                    <span className="text-[#FFD700] font-semibold">
                      {activeTab === 'pix' ? 'R$ ' : ''}{calculateTotal()}
                    </span>
                  </div>
                </div>
              )}

              {/* Informações adicionais */}
              <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  ℹ️ {activeTab === 'pix' 
                    ? 'Saques PIX são processados em até 1 hora útil.' 
                    : 'Saques USDC são processados em até 24 horas.'}
                </p>
              </div>

              {/* Botão */}
              <button
                onClick={handleSubmit}
                disabled={loading || !isFormValid()}
                className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                  loading || !isFormValid()
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[#e74c3c] text-white hover:bg-red-600'
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  'Solicitar Saque'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;
