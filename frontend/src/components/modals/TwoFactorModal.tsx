import React, { useState } from 'react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ 
  isOpen, 
  onClose, 
  isEnabled, 
  onToggle 
}) => {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const qrCode = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSI2MCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSIxMDAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iMTQwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjE4MCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICA8IS0tIE1vcmUgUVIgY29kZSBwYXR0ZXJuIC0tPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSJibGFjayI+QmV0Rm9yYmVzIDJGQTwvdGV4dD4KPC9zdmc+";
  const secretKey = "BETFORBES2FA123456789";

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);

    // Simular verificação do código
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (code === '123456') {
      setSuccess(true);
      onToggle(!isEnabled);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setCode('');
        onClose();
      }, 2000);
    } else {
      setError('Código inválido. Tente novamente.');
    }
    
    setLoading(false);
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onToggle(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#FFD700]">🛡️ Autenticação 2FA</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔐</div>
            <p className="text-[#27c93f] text-lg font-semibold">
              2FA {isEnabled ? 'desativado' : 'ativado'} com sucesso!
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Sua conta está {isEnabled ? 'menos' : 'mais'} segura agora
            </p>
          </div>
        ) : isEnabled ? (
          // Desativar 2FA
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Desativar 2FA</h3>
              <p className="text-gray-400 text-sm">
                Tem certeza que deseja desativar a autenticação de dois fatores? 
                Isso tornará sua conta menos segura.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={loading}
                className="flex-1 bg-[#e74c3c] text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  'Desativar'
                )}
              </button>
            </div>
          </div>
        ) : step === 1 ? (
          // Passo 1: Instruções
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-white mb-2">Configure o 2FA</h3>
              <p className="text-gray-400 text-sm">
                Baixe um app autenticador como Google Authenticator ou Authy
              </p>
            </div>

            <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">📋 Instruções:</h4>
              <ol className="text-blue-300 text-sm space-y-1">
                <li>1. Baixe o Google Authenticator</li>
                <li>2. Escaneie o QR Code na próxima tela</li>
                <li>3. Digite o código de 6 dígitos</li>
              </ol>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#FFD700] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Continuar
            </button>
          </div>
        ) : (
          // Passo 2: QR Code e Verificação
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Escaneie o QR Code</h3>
              
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img src={qrCode} alt="QR Code" className="w-32 h-32" />
              </div>

              <div className="bg-[#1e1e1e] rounded-lg p-3 mb-4">
                <p className="text-gray-400 text-xs mb-1">Chave manual:</p>
                <p className="text-white text-sm font-mono break-all">{secretKey}</p>
              </div>
            </div>

            {error && (
              <div className="bg-[#e74c3c] bg-opacity-20 border border-[#e74c3c] rounded-lg p-3">
                <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-2">Código de Verificação</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-3 py-2 text-white text-center text-lg tracking-widest focus:border-[#FFD700] focus:outline-none"
                placeholder="000000"
                maxLength={6}
              />
              <p className="text-gray-500 text-xs mt-1">Digite o código de 6 dígitos do seu app</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={code.length !== 6 || loading}
                className="flex-1 bg-[#27c93f] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  'Verificar'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorModal;

