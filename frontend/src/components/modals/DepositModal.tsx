import React, { useState } from 'react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [activeTab, setActiveTab] = useState<'pix' | 'usdc'>('pix');
  const [copied, setCopied] = useState<'pix' | 'usdc' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');

  const pixKey = 'chave@betforbes.com';
  const usdcAddress = '0xA1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0';
  const usdcQRCode = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSI2MCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSIxMDAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iMTQwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjE4MCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICA8IS0tIE1vcmUgUVIgY29kZSBwYXR0ZXJuIC0tPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSJibGFjayI+VVNEQyBCZXRGb3JiZXM8L3RleHQ+Cjwvc3ZnPg==";

  const handleCopy = async (type: 'pix' | 'usdc') => {
    try {
      await navigator.clipboard.writeText(type === 'pix' ? pixKey : usdcAddress);
      setCopied(type);
      setTimeout(() => setCopied(null), 3000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, '');
    setAmount(value);
    
    if (amountError) {
      validateAmount(value);
    }
  };

  const validateAmount = (value: string): boolean => {
    if (!value || parseFloat(value.replace(',', '.')) <= 0) {
      setAmountError('Por favor, insira um valor maior que zero');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleContinue = () => {
    if (validateAmount(amount)) {
      setStep('payment');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simular envio para backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSuccess(true);
    setLoading(false);
    
    setTimeout(() => {
      setSuccess(false);
      setFile(null);
      setAmount('');
      setStep('amount');
      onClose();
    }, 3000);
  };

  const handleBack = () => {
    setStep('amount');
  };

  const resetModal = () => {
    setStep('amount');
    setAmount('');
    setAmountError('');
    setFile(null);
    setActiveTab('pix');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#FFD700]">💰 Depositar</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-[#27c93f] text-lg font-semibold">Depósito registrado com sucesso!</p>
            <p className="text-gray-400 text-sm mt-2">Seu saldo será atualizado após a confirmação.</p>
          </div>
        ) : step === 'amount' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Valor do Depósito <span className="text-[#e74c3c]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">R$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className={`w-full p-3 pl-10 bg-[#1e1e1e] border-2 ${
                    amountError ? 'border-[#e74c3c]' : 'border-gray-600 focus:border-[#FFD700]'
                  } rounded-lg text-white text-lg font-bold placeholder-gray-500 focus:outline-none`}
                />
              </div>
              {amountError && (
                <p className="text-[#e74c3c] text-sm mt-1">{amountError}</p>
              )}
            </div>

            <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                ℹ️ Após informar o valor, você receberá as instruções para realizar o depósito via PIX ou USDC.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-[#FFD700] text-black py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors font-bold"
            >
              Continuar
            </button>
          </div>
        ) : (
          <>
            {/* Valor do depósito */}
            <div className="mb-6 bg-[#1e1e1e] p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Valor do depósito:</p>
              <p className="text-[#FFD700] text-xl font-bold">R$ {amount}</p>
            </div>
            
            {/* Tabs */}
            <div className="flex mb-6 border-b border-gray-700">
              <button
                className={`flex-1 py-2 font-medium ${activeTab === 'pix' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-400'}`}
                onClick={() => setActiveTab('pix')}
              >
                PIX
              </button>
              <button
                className={`flex-1 py-2 font-medium ${activeTab === 'usdc' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-400'}`}
                onClick={() => setActiveTab('usdc')}
              >
                USDC
              </button>
            </div>

            {activeTab === 'pix' ? (
              <div className="space-y-4">
                <div className="bg-[#1e1e1e] p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-2">Chave PIX:</p>
                  <div className="flex items-center justify-between bg-[#333] p-2 rounded">
                    <p className="text-white font-mono">{pixKey}</p>
                    <button
                      onClick={() => handleCopy('pix')}
                      className="text-[#FFD700] hover:text-yellow-500 ml-2"
                    >
                      {copied === 'pix' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Anexar Comprovante (opcional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="comprovante"
                      accept="image/*,.pdf"
                    />
                    <label
                      htmlFor="comprovante"
                      className="w-full flex items-center justify-center bg-[#1e1e1e] border border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-[#333] transition-colors"
                    >
                      {file ? (
                        <span className="text-[#27c93f]">✓ {file.name}</span>
                      ) : (
                        <span className="text-gray-400">📎 Selecionar arquivo</span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4 mt-4">
                  <p className="text-blue-400 text-sm">
                    ℹ️ Após realizar o PIX, seu saldo será atualizado automaticamente em até 5 minutos.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-[#27c93f] text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Confirmar Depósito'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <img src={usdcQRCode} alt="QR Code USDC" className="w-40 h-40" />
                  </div>
                </div>

                <div className="bg-[#1e1e1e] p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-2">Endereço USDC (Ethereum):</p>
                  <div className="flex items-center justify-between bg-[#333] p-2 rounded">
                    <p className="text-white font-mono text-xs break-all">{usdcAddress}</p>
                    <button
                      onClick={() => handleCopy('usdc')}
                      className="text-[#FFD700] hover:text-yellow-500 ml-2 flex-shrink-0"
                    >
                      {copied === 'usdc' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Atenção:</p>
                  <ul className="text-yellow-300 text-sm space-y-1">
                    <li>• Envie apenas USDC para este endereço</li>
                    <li>• Utilize a rede Ethereum</li>
                    <li>• Envios em outras redes podem resultar em perda de fundos</li>
                  </ul>
                </div>

                <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">
                    ℹ️ Após confirmação na blockchain, seu saldo será atualizado em até 15 minutos.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-[#FFD700] text-black py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors font-bold"
                  >
                    Entendi
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepositModal;
